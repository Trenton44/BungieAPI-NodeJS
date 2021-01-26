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
const d2components = require("./D2Components.js");
const webpageRoot = path.join(__dirname,"..\\","Client Files");
const serverRoot = path.join(__dirname,"..\\","Server Files");
const assetRoot = path.join(__dirname,"..\\","assets");
const manifestRoot = path.join(__dirname,"..\\","manifestData");
//const D2Manifest = require(manifestRoot+"/D2Manifest2.js").D2Manifest;
const D2Manifest = require(manifestRoot+"/d2manifest.json");
const ServerResponse = require(serverRoot+"/Server Responses.js");
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
        d2api.saveTokenData(request, result.data);
        request.session.data.authCode = null;
        request.session.data.state = null;
        response.redirect("/");
    }).catch(function(error){
      console.error("TOKEN REQUEST NOT successful");
      console.error(error);
      request.session.data = undefined;
      response.redirect("/login");
    });
  }
  else {
    response.redirect("/login");
  }
});


app.use(checkAuthorization);
//Entry point for authorized personnel. Make all requests for API data here prior to serving webpage.
app.get("/",function(request,response){
  obtainInitialPlayerData(request).then(function(result){
    console.log("past access");
    response.sendFile(webpageRoot+"/finalhtml.html");
  }).catch(function(error){
    console.error(error);
  });
});
app.get("/characterids",function(request, response){
  response.status(200).json(request.session.data.d2data.profile.characterIds);
});
app.get("/character/:id/general",function(request, response){
  var data = request.session.data.d2data;
  var cID = request.params.id;
  var returnData = ServerResponse.CharacterResponse(data.characters[cID]);
  response.status(200).json(returnData);
});
app.get("/character/:id/equipment",function(request,response){
  var data = request.session.data.d2data;
  var cID = request.params.id;
  var returnData = ServerResponse.EquipmentItemsResponse(data.characterEquipment[cID]);
  //var returnData = data.characterEquipment[cID];
  response.status(200).json(returnData);
});
app.get("/character/:id/inventory",function(request,response){
  var data = request.session.data.d2data;
  var cID = request.params.id;
  var returnData = ServerResponse.InventoryItemsResponse(data.characterInventories[cID])
  response.status(200).json(returnData);
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
  await d2api.getBungieCurrentUserData(token).then(function(result){
    var userdata = d2api.parseBungieCurrentUserDataResponse(result.data.Response);
    request.session.data.userdata = userdata;
    var memType = userdata[userdata.primaryMembershipId].membershipType;
    var d2ID = userdata.primaryMembershipId;
    var components = ["100","200","201","202","205"];
    console.log("Accessing d2 user data");
    return d2api.getDestinyProfileAuth(memType,d2ID,components,token).then(function(result){
      console.log("accessed");
      var d2data = d2api.parseComponentResponses(result.data.Response,components);
      request.session.data.d2data = d2data;
      console.log("all data successfully retrieved.");
      return true;
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
    console.log("Not authorized, redirecting to login.");
    response.redirect("/login");
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
    if(new Date().getTime() > request.session.data.tokenData.tokenExpiration){
      console.log("access token has expired, requesting with refresh token.");
      if(new Date().getTime() > request.session.data.tokenData.refreshExpiration){
        console.log("refresh token is also expired, redirecting to login page.");
        return false;
      }
      else {
        console.log("requesting refresh token.");
        d2api.tokenRefresh(request.session.data.tokenData.refresh_token).then(function(result){
          d2api.saveTokenData(request, result.data);
          console.log("token refresh successful, new access token saved.");
          return true;
        }).catch(function(error){
          console.log(error);
          return false;
        });
      }
    }
    return true;
  }
  else {
    console.log("User does not possess credentials, access is denied.");
    return false;
  }
}

async function OLDobtainInitialPlayerData(request){
  var token = request.session.data.tokenData.access_token;
  console.log("Accessing bnet user data");
  await d2api.getBungieCurrentUserData(token).then(function(result){
    var userdata = d2api.parseBungieCurrentUserDataResponse(result.data.Response);
    //console.log(userdata);
    request.session.data.userdata = userdata;
    var memType = userdata[userdata.primaryMembershipId].membershipType;
    var d2ID = userdata.primaryMembershipId;
    var components = ["103","200","201","202","205","300","302"];
    console.log("Accessing d2 user data");
    return d2api.getDestinyProfileAuth(memType,d2ID,components,token).then(function(result){
      console.log("accessed");
      var d2data = d2api.parseDestinyProfileAuthResponse(result.data.Response);
      request.session.data.d2data = d2data;
      console.log("all data successfully retrieved.");
      return true;
    }).catch(function(error){
      console.log(error);
      return false;
    });
  }).catch(function(error){
    console.error(error);
    return false;
  });

}
