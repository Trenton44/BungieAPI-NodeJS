console.log("Starting index.js preload.");
const path = require("path");
const root = __dirname;
const webpageRoot = root+"/Client Files";
const serverRoot = root+"/Server Files";
const assetRoot = root+"/assets";
const manifestRoot = root+"/Manifest";

const mongo = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const https = require('http');
//const https = require("https");
const fs = require('fs');
const express = require("express");
const session = require("express-session");
const genuuid = require("uuid");
const app = new express();
const axios = require('axios');
const dotenv = require("dotenv");
const crypto = require("crypto");
const helmet = require("helmet");
const MongoDBStore = require("connect-mongodb-session")(session);

const bungieRoot = "https://www.bungie.net/Platform";
const bungieCommon = "https://www.bungie.net";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";
console.log("Finished index.js preload.");
const d2api = require(serverRoot+"/D2APIfunctions");
const d2components = require(serverRoot+"/D2Components.js");
const ServerResponse = require(serverRoot+"/Server Responses.js");

dotenv.config( { path: path.join(root,"process.env") } );
var httpsServer;

if(process.env.NODE_ENV == "development"){
   console.log("I'll allow it.");
   process.env['NODE_TLS_REJECT_UNAUTHORIZED']=0;
   var privatekey = fs.readFileSync(path.join(root,"key.pem"));
   var certificate = fs.readFileSync(path.join(root,"cert.pem"));
   var credentials = {key: privatekey, cert: certificate};
  httpsServer = https.createServer(credentials,app);
 }
 else {
  httpsServer = https.createServer(app);
 }

 var store = new MongoDBStore({
   uri: process.env.Mongo_DB_URI,
   databaseName: "users",
   collection: "Sessions",
 });
 store.on("error", function(error){
   console.error(error);
 });

app.use(
  session({
      name: "sAk3m3",
      secret: "secreto!alabastro@",
      genid: function(req){ return genuuid.v4(); },
      resave: true,
      store: store,
      saveUninitialized: true,
      cookie: { httpOnly: true, secure: true, maxAge: 24*60*60*100,}, //maxAge set to 24 hours.
  })
);

app.get("/client/:id",function(request,response){
  response.status(200).sendFile(webpageRoot+"/"+request.params.id);
});

app.use(prepSessionData);

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
//Entry point for authorized personnel. Make all requests for API data here prior to serving webpage.
app.use(authorizationCheck);
app.get("/",async function(request,response){
  let userdata = await getBasicBnetInfo(request);
  if(userdata !== null){
    request.session.data.userdata = userdata
    response.sendFile(webpageRoot+"/finalhtml.html");
  }
  else {
    response.status(500).json({error: "fuck."});
  }
});
//Returns a list of the character ID's of the current d2 profile.
app.get("/characterids",async function(request, response){
  var components = ["100"];
  var data = await profileComponentRequest(request, components);
  response.status(200).json(data.profile.characterIds);
});
//Sends request to GetProfile endpoint, cleans up result,
//returns general information about the requested character
app.get("/character/:id/general",async function(request, response){
  var components = ["200"];
  var cID = request.params.id;
  var data = await characterComponentRequest(request, components,cID);
  var returnData = ServerResponse.CharacterResponse(data.character);
  response.status(200).json(returnData);
});
//Sends request to GetProfile endpoint, cleans up result, and
//returns list of equipment character currently has equipped.
app.get("/character/:id/equipment",async function(request,response){
  var components = ["201", "205"];
  var cID = request.params.id;
  var data = await characterComponentRequest(request, components,cID);
  var returnData = {
    equipment: ServerResponse.EquipmentItemsResponse(data.equipment),
    inventory: ServerResponse.InventoryItemsResponse(data.inventory).equippable,
  };
  response.status(200).json(returnData);
});
//sents request to GetProfile endpoint, cleans up result, and
//returns entire character inventory
app.get("/character/:id/inventory",async function(request,response){
  var components = ["201"];
  var cID = request.params.id;
  var data = await characterComponentRequest(request, components,cID);
  var returnData = ServerResponse.InventoryItemsResponse(data.inventory);
  response.status(200).json(returnData);
});

//Sends a POST request to bungie API EquipItem endpoint, returns result of request.
app.get("/character/:Cid/equipItem/:Iid",async function(request, response){
  var userdata = request.session.data.userdata;
  var memType = userdata[userdata.primaryMembershipId].membershipType;
  var path = bungieRoot+"/Destiny2/Actions/Items/EquipItem/";
  var body = {
    characterId: request.params.Cid,
    itemId: request.params.Iid,
    membershipType: memType,
  }
  var body = JSON.stringify(body);
  d2api.postRequest(path,body,request.session.data.tokenData.access_token).then(function(result){
    response.status(200).json(result.data.Response);
  }).catch(function(error){
    console.log(error);
    response.status(400).json(error);
  });
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
//Makes bungie api requests, then parses and returns data.
function characterComponentRequest(request, components,cID){
  var userdata =request.session.data.userdata;
  var token = request.session.data.tokenData.access_token;
  var memType = userdata[userdata.primaryMembershipId].membershipType;
  var d2ID = userdata.primaryMembershipId;
  return d2api.getCharacterAuth(memType,d2ID,cID,components,token).then(function(result){
    console.log("accessed");
    try{
      var d2data = d2api.parseCharacterComponents(result.data.Response);
      console.log("Requested data retrieved from bungie.");
      return d2data;
    }catch(e){
      console.log("error caught: ");
      console.error(e);
    }
  }).catch(function(error){
    console.log(error);
    return false;
  });
};
function profileComponentRequest(request, components){
  var userdata =request.session.data.userdata;
  var token = request.session.data.tokenData.access_token;
  var memType = userdata[userdata.primaryMembershipId].membershipType;
  var d2ID = userdata.primaryMembershipId;
  return d2api.getDestinyProfileAuth(memType,d2ID,components,token).then(function(result){
    console.log("accessed");
    try{
      var d2data = d2api.parseProfileComponents(result.data.Response);
      console.log("Requested data retrieved from bungie.");
      return d2data;
    }catch(e){
      console.log("error caught: ");
      console.error(e);
    }
  }).catch(function(error){
    console.log(error);
    return false;
  });
};
function getBasicBnetInfo(request){
  var token = request.session.data.tokenData.access_token;
  console.log("Accessing bnet user data");
  return d2api.getBungieCurrentUserData(token).then(function(result){
    console.log("obtained data");
    return d2api.parseBungieCurrentUserDataResponse(result.data.Response);
  }).catch(function(error){
    console.error(error);
    return null;
  });
};
function authorizationCheck(request,response,next){
  console.log("__________________________________");
  console.log("BEGINNING OF AUTHRIZATION CHECK: ");
  console.log("Requested endpoint access: "+request.url);
  console.log("Session ID: "+request.session.id);
  if(Object.keys(request.session.data.tokenData).length !== 0){
    console.log("token data for user exists, no action necessary.");
    console.log("Current time: "+ new Date().getTime());
    console.log("Expiration of token: "+request.session.data.tokenData.tokenExpiration);
    if(new Date().getTime() > request.session.data.tokenData.tokenExpiration){
      console.log("ACCESS TOKEN HAS EXPIRED, CLIENT REQUIRES A NEW ONE.");
        d2api.tokenRefresh(request.session.data.tokenData.refresh_token).then(function(result){
          console.log("token refresh was successful.");
          d2api.saveTokenData(request,result.data);
          next();
        }).catch(function(error){
          console.log("There was an error refreshing the token.");
          if(request.url == "/"){
            response.redirect("/login");
          }
          else {
            response.status(400).json({error:"requires login."});
          }
        });
    }
    else {
      console.log("access token still valid, so that's neat.");
      next();
    }
  }
  else {
    console.log("user is not yet logged in, redirecting to login.");
    if(request.url == "/"){
      response.redirect("/login");
    }
    else {
      response.status(400).json({error:"requires login."});
    }
  }
}
async function prepSessionData(request,response,next){
  var reset = false;
  switch(request.session.data){
    case undefined:
      console.log("Session data does not exist, creating formatted data blueprint.");
      reset = true;
      console.log("session data now has blueprint, proceeding to content.");
      break;
    case null:
      console.log("User has visited, but an error necessitated eliminating their stored data.");
      reset = true;
      break;
    default:
      console.log("There doesn't seem to be anything wrong here....");
  }
  if(reset){
    request.session.data = {
      authCode: null,
      state: null,
      tokenData: {},
      primaryMembershipId: null,
      userdata: null,
    };
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

//Loads the current d2 manifest from bungie api and saves to root.
//Note: the manifest file as a whole is large enough to crash notepad,
//so this splits each piece of the manifest into it's own json file so it can be
//read, but also saves it as a whole json so it is easy to import into code later.
async function loadManifest(){
  var path = bungieRoot+"/Destiny2/Manifest/";
  console.log("Obtaining Destiny Manifest from Bungie.");
  var data = await getRequest(path);
  console.log("proceeding to next request.");
  var path = bungieCommon+data.data.Response.jsonWorldContentPaths.en;
  var result = await getRequest(path);
  console.log("both completed.");
  console.log("Now writing entire manifest to d2manifest.json");
  var data = JSON.stringify(result.data, null, 2);
  fs.writeFileSync(manifestRoot+"/d2manifest.json", data, function(error){
    console.error(error);
  });
  console.log("Done.");
  /*await getRequest(path).then(function(result){
    var d2contentManifest = bungieCommon+result.data.Response.jsonWorldContentPaths.en;
    return getRequest(d2contentManifest).then(function(result){
      /*var manifestItems = Object.keys(result.data);
      or(i in result.data){
        console.log("Iteration: "+i);
        let data = JSON.stringify(result.data[i], null, 2);
        console.log("Now writing item "+i+" to  file "+i+".json");
        fs.writeFileSync(manifestRoot+"/"+i+".json", data, function(error){
          console.error(error);
        });
      }

      return true;
    });
  });*/
};
function getRequest(path){
  return axios({
    method:"GET",
    url: path,
    headers: {"X-API-Key":process.env.Bungie_API_KEY},
  });
};
