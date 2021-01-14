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
app.get("/authError",function(request,response){
  response.sendFile(webpageRoot+"/noAuthorization.html");
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
    response.redirect("/authError");
  }
  else {
    console.log("STATE PARAMETERS MATCH, therefore this login is valid and untampered. (we hope)");
    request.session.data.authCode = request.query.code;
    d2api.tokenRequest(request).then(function(result){
        console.log("TOKEN REQUEST SUCCESSFUL");
        request.session.data.tokenData = result.data;
        request.session.data.authCode = null;
        request.session.data.state = null;
        response.redirect("/");
    }).catch(function(error){
      console.log(error);
      console.error("TOKEN REQUEST NOT successful");
      request.session.data = undefined;
      response.redirect("/authError");
    });
  }
});
app.use(function(request,response,next){
  console.log("check authorization");
  if(isAuthorized(request)){
    next();
  }
  else {
    console.log("Not authorized");
    response.redirect("/authError");
  }
});
app.get("/",function(request,response){
  var token = request.session.data.tokenData.access_token;
  d2api.getBungieCurrentUserData(token).then(function(result){
    request.session.data.memberships = {};
    request.session.data.primaryMembershipId = result.data.Response.primaryMembershipId;
    result = result.data.Response.destinyMemberships;
    result.forEach(function(item, index){
      request.session.data.memberships[item.membershipId] = item;
    });
    response.redirect("/"+request.session.data.primaryMembershipId+"/summary");
  });
});
//endpoints that send webpages out
app.get("/:id/summary",function(request,response){
  console.log(request.params.id);
  var profile = request.session.data.memberships[request.params.id];
  if(profile !== undefined){
    console.log("shit workin");
    response.render("DnDSheet");
  }
  else {
    response.redirect("/authError");
    console.error("shit aint workin");
  }
});

//endpoints that send data for webpages out.
app.get("/:id/data",function(request,response){
  console.log(request.params.id);
  var profile = request.session.data.memberships[request.params.id];
  if(profile !== undefined){
    components = ["100","102","104","105"];
    console.log("shit workin");
    d2api.getDestinyProfile(profile.membershipType,profile.membershipId,components).then(function(result){
      response.status(200).json(result.data.Response);
    }).catch(function(error){
      console.log(error);
    });
  }
  else {
    response.redirect("/authError");
    console.error("shit aint workin");
  }
});
app.get("/:id/character/data",function(request,response){
  console.log(request.params.id);
  var profile = request.session.data.memberships[request.params.id];
  if(profile !== undefined){
    components = ["200","201","202","205","300"];
    console.log("shit workin");
    d2api.getDestinyProfile(profile.membershipType,profile.membershipId,components).then(function(result){
      response.status(200).json(result.data.Response);
    }).catch(function(error){
      console.log(error);
    });
  }
  else {
    response.redirect("/authError");
    console.error("shit aint workin");
  }
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
      primaryMembershipId: null,
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
