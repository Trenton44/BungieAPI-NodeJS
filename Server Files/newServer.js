const https = require("https");
const fs = require('fs');
const express = require("express");
const session = require("express-session");
const genuuid = require("uuid");
const app = new express();
const axios = require('axios');
const path = require("path");
const dotenv = require("dotenv");
const crypto = require("crypto");
const mustache = require("mustache-express");
const d2api = require("./D2APIfunctions");
const tools = require("./serverfunctions");
const DestinyEntities = require("./APIManifest.js").Entities;
const root = path.join(__dirname,"..\\");
const webpageRoot = path.join(__dirname,"..\\","Client Files");
const serverRoot = path.join(__dirname,"..\\","Server Files");
const assetRoot = path.join(__dirname,"..\\","assets");
const bungieRoot = "https://www.bungie.net/Platform";
var bungieCommon = "https://www.bungie.net";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";
dotenv.config( { path: path.join(root,"process.env") } );
process.env['NODE_TLS_REJECT_UNAUTHORIZED']=0;

var privatekey = fs.readFileSync(path.join(root,"key.pem"));
var certificate = fs.readFileSync(path.join(root,"cert.pem"));
var credentials = {key: privatekey, cert: certificate};
var httpsServer = https.createServer(credentials,app);
app.engine("html", mustache());
app.set("view engine","html");
app.set("views",webpageRoot);

app.get("/assets/:id",function(request,response){
  console.log("--------------------------");
  console.log("The site has requested an asset to load.");
  console.log("sending asset "+request.params.id);
  response.status(200).sendFile(path.join(assetRoot,"/",request.params.id));
  console.log("asset was sent");
  console.log("--------------------------");
});
app.get("/client/:id",function(request,response){
  console.log("--------------------------");
  console.log("The site has requested an asset pertaining to the html page (probably css files)");
  console.log("sending asset "+request.params.id);
  response.status(200).sendFile(path.join(webpageRoot,"/",request.params.id));
  console.log("asset was sent");
  console.log("--------------------------");
});
app.use(
  session(
    {
      name: "newWaifu",
      secret: "Secret!",
      genid: function(req){
        console.log("New Session created, generating uuid for "+req.hostname);
        return genuuid.v4();
      },
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, secure: true, expires: 120000},
  })
);
app.use(prepSessionData);

app.get("/home", function(request, response){
  response.status(200).sendFile(webpageRoot+"/home.html");
});
app.get("/login",function(request,response){
  var url = buildAuthorizatonCodeRequest(request);
  console.log("User has begun a login attempt to bungie.net");
  response.redirect(url);
});
app.get("/bapi", function(request,response){
  console.log("Response has been received from bungie, attempting to authorize using given parameters.");
  if(request.query.state !== request.session.data.state){
    console.error("State parameters DO NOT MATCH! ABORTING MISSION");
    request.session.data = undefined;
    response.redirect("/");
  }
  else {
    console.log("STATE PARAMETERS MATCH, therefore this login is valid and untampered. (we hope)");
    request.session.data.authCode = request.query.code;
    d2api.tokenRequest(request).then(function(result){
        console.log("TOKEN REQUEST SUCCESSFUL");
        request.session.data.tokenData = result.data;
        request.session.data.authCode = null;
        request.session.data.state = null;
        d2api.getBungieCurrentUserData(request.session.data.tokenData.access_token).then(function(result){
          var primem = result.data.Response.primaryMembershipId;
          var d2mems = result.data.Response.destinyMemberships;
          request.session.data.primaryMembership = {};
          request.session.data.secondaryMemberships = {};
          d2mems.forEach(function(item, index){
            if(item.membershipId == primem){ request.session.data.primaryMembership = item; }
            else { request.session.data.secondaryMemberships[item.membershipId] = item; }
          });
          console.log("Obtained membership data for user.");
          response.redirect("/users/"+request.session.data.primaryMembership.membershipId);
        }).catch(function(error){
          console.error(error);
        });
    }).catch(function(error){
      console.log(error);
      console.error("TOKEN REQUEST NOT successful");
      request.session.data = undefined;
      response.redirect("/");
    });
  }
});
//authorization verification. Everything past this point will require a token from bungie's API to be saved.
app.use(function(request,response,next){
  console.log("check authorization");
  if(isAuthorized(request)){
    next();
  }
  else {
    console.log("Not authorized");
    response.redirect("/home");
  }
});

app.get("/users/:id",function(request,response){
  var htmlData = {
    userID:request.session.data.primaryMembership.membershipId,
    platformIcon:bungieCommon+request.session.data.primaryMembership.iconPath,
    username: request.session.data.primaryMembership.displayName
  };
  var memType = request.session.data.primaryMembership.membershipType;
  var d2ID = request.session.data.primaryMembership.membershipId;
  components = ["100"];
  d2api.getDestinyProfile(memType,d2ID,components).then(function(result){
    console.log(result.data.Response.profile.data.userInfo);
    console.log(result.data.Response.profile.data.characterIds);
    response.render("DnDSheet",htmlData);
  }).catch(function(error){
    console.error(error);
    response.render("DnDSheet",htmlData);
  });

});
httpsServer.listen(process.env.PORT);
function prepSessionData(request,response,next){
  if(request.session.data != undefined){
    console.log("Prior data for user has been formatted already ");
  }
  else {
    console.log("Session data does not exist, creating formatted data blueprint.");
    data = {
      authCode: null,
      state: null,
      tokenData: {
        access_token: null,
      },
      primaryMembership: null,
    };
    request.session.data = data;
    console.log("session data now has blueprint, proceeding to content.");
  }
  next();
}
function buildAuthorizatonCodeRequest(request){
  let state = crypto.randomBytes(16).toString("base64");
  request.session.data.state = state;
  var url = new URL(bungieAuthURL);
  url.searchParams.append("client_id",process.env.Bungie_ClientID);
  url.searchParams.append("response_type","code");
  url.searchParams.append("state",state);
  return url;
}
function isAuthorized(request){
  if(request.session.data.tokenData.access_token != null){
    console.log("User has access token, and therefore should be authorized. allowing access to requested endpoint.");
    return true;
  }
  else {
    console.log("User does not possess credentials, access is denied.");
    return false;
  }
}
