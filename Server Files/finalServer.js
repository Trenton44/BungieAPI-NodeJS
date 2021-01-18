@@ -1,200 +0,0 @@
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
const mustacheExpress = require("mustache-express");
const d2api = require("./D2APIfunctions");
const root = path.join(__dirname,"..\\");
const D2Manifest = require(root+"/D2Manifest2.js").D2Manifest;
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
app.engine('html', mustacheExpress());
app.set('view engine','html');
app.set('views',webpageRoot);
app.use(
  session(
    {
      name: "UserCookie",
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
app.get("/client/:id",function(request,response){
  response.status(200).sendFile(webpageRoot+"/"+request.params.id);
});
app.get("/authError",function(request,response){
  response.redirect("/login");
});
app.get("/login",function(request,response){
  var url = buildAuthorizatonCodeRequest(request);
  console.log("User has begun a login attempt to bungie.net");
  response.redirect(url);
});
//when bungie API responds, this function gathers all initial player data required, then continues to root.
app.get("/bapi", function(request,response){
  console.log("Response has been received from bungie, attempting to authorize using given parameters.");
  if(verifyState(request)){
    request.session.data.authCode = request.query.code;
    d2api.tokenRequest(request).then(function(result){
        console.log("TOKEN REQUEST SUCCESSFUL");
        request.session.data.tokenData = result.data;
        request.session.data.authCode = null;
        request.session.data.state = null;
        response.redirect("/");
    }).catch(function(error){
      console.error("TOKEN REQUEST NOT successful");
      request.session.data = undefined;
      response.redirect("/authError");
    });
  }
  else {
    response.redirect("/authError");
  }
});


app.use(checkAuthorization);
//Entry point for authorized personnel. Make all requests for API data here prior to serving webpage.
app.get("/",function(request,response){
  obtainInitialPlayerData(request).then(function(result){
    response.sendFile(webpageRoot+"/finalhtml.html");
  });
});
app.get("/test",function(request, response){
  response.status(200).json(request.session.data.d2data);
})
app.get("/characterids",function(request, response){
  response.status(200).json(request.session.data.d2data.IDs);
});
app.get("/manifest",function(request,response){
  response.status(200).json(D2Manifest);
})
app.get("/character/:id",function(request, response){
  var value = request.session.data.d2data[request.params.id];
  response.status(200).json(value);
});
app.get("/character/:id/equipment",function(request,response){
  var value = request.session.data.d2data[request.params.id];
  var cEquip = value.characterEquipment;
  var i = 0;
  for(i in cEquip){
    cEquip[i].itemHashData = D2Manifest.DestinyInventoryItemDefinition[cEquip[i].itemHash];
    cEquip[i].bucketHashData = D2Manifest.DestinyInventoryBucketDefinition[cEquip[i].bucketHash];
  }
  response.status(200).json(cEquip);
});
app.get("/inventory",function(request,response){
  response.status(200).json(request.session.data);
});
httpsServer.listen(process.env.PORT);
function verifyState(request){
  if(request.query.state !== request.session.data.state){
    console.error("State parameters DO NOT MATCH! ABORTING MISSION");
    request.session.data = undefined;
    return false;
  }
  else {
    console.log("STATE PARAMETERS MATCH, therefore this login is valid and untampered. (we hope)");
    return true;
  }
}
async function obtainInitialPlayerData(request){
  var token = request.session.data.tokenData.access_token;
  console.log("Accessing bnet user data");
  return d2api.getBungieCurrentUserData(token).then(function(result){
    var userdata = d2api.parseBungieCurrentUserDataResponse(result.data.Response);
    //console.log(userdata);
    request.session.data.userdata = userdata;
    var memType = userdata[userdata.primaryMembershipId].membershipType;
    var d2ID = userdata.primaryMembershipId;
    var components = ["103","200","201","202","205","300","302"];
    console.log("Accessing d2 user data");
    return d2api.getDestinyProfileAuth(memType,d2ID,components,token).then(function(result){
      var d2data = d2api.parseDestinyProfileAuthResponse(result.data.Response);
      request.session.data.d2data = d2data;
      return true;
      console.log("all data successfully retrieved.");
    }).catch(function(error){
      console.log(error);
      return false;
    });
  }).catch(function(error){
    console.error(error);
    return false;
  });

}
function checkAuthorization(request,response,next){
  console.log("check authorization");
  if(isAuthorized(request)){
    console.log("authorized");
    next();
  }
  else {
    console.log("Not authorized");
    response.redirect("/authError");
  }
}
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