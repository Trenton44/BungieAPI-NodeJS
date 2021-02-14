const path = require("path");
const root = __dirname;
const webpageRoot = root+"/Client Files";
const serverRoot = root+"/Server Files";
const assetRoot = root+"/assets";
const manifestRoot = root+"/Manifest";
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
//const mongo = require('mongodb');
//const MongoClient = require('mongodb').MongoClient;
//const https = require('http');
const https = require("https");
const fs = require('fs');
const express = require("express");
const session = require("express-session");
const genuuid = require("uuid");
//var sslRedirect = require("heroku-ssl-redirect").default;
const app = new express();
const axios = require('axios');
const dotenv = require("dotenv");
const crypto = require("crypto");
const helmet = require("helmet");
//const MongoDBStore = require("connect-mongodb-session")(session);

const bungieRoot = "https://www.bungie.net/Platform";
const bungieCommon = "https://www.bungie.net";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";

const D2API = require(serverRoot+"/D2API.js");
const D2Components = require(serverRoot+"/D2Components.js");
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
  app.use(sslRedirect());
 }
 /*var store = new MongoDBStore({
   uri: process.env.Mongo_DB_URI,
   databaseName: "users",
   collection: "Sessions",
 });
 store.on("error", function(error){
   console.error(error);
 });*/
app.use(express.json());
app.use(
  session({
      name: "sAk3m3",
      secret: "secreto!alabastro@",
      genid: function(req){ return genuuid.v4(); },
      resave: true,
      //store: store,
      saveUninitialized: true,
      cookie: { httpOnly: true, secure: true, maxAge: 24*60*60*100,}, //maxAge set to 24 hours.
  })
);
app.get("/client/:id",function(request,response){
  response.status(200).sendFile(webpageRoot+"/"+request.params.id);
});
app.get("/assets/:id",function(request,response){
  response.status(200).sendFile(assetRoot+"/"+request.params.id);
});
app.use(constructSessionInstance);
app.get("/bnetlogin", async function(request, response){
  console.log("in bnet login.");
  let state = crypto.randomBytes(16).toString("base64");
  request.session.data.state = state;
  var url = new URL(bungieAuthURL);
  url.searchParams.append("client_id",process.env.Bungie_ClientID);
  url.searchParams.append("response_type","code");
  url.searchParams.append("state",state);
  console.log("Sending to url.");
  response.redirect(url);
});

app.get("/bnetresponse", async function(request, response){
  console.log(request.session.data.state);
  console.log(request.query.state);
  if(request.query.state !== request.session.data.state){
    request.session.destroy();
    response.status(400).json({error: "Unauthorized access."});
  }
  else {
    console.log("states match, requesting token.");
    request.session.data.authCode = request.query.code;
    console.log(request.query.code);
    await D2API.requestToken(request, response).catch(function(error){response.status(400).json({error: "There was an error."}); });
    response.redirect("/");
  }
});

app.use(accessAuthorizedEndpoints);

//Returns a list of the character ID's of the current d2 profile.
app.get("/characterids",async function(request, response){
  var components = ["100"];
  var data = await D2API.profileComponentRequest(request,response, components).catch(function(error){ return error; });
  console.log("in characterids");
  if(data instanceof Error){ console.error(data);response.status(400).json({error: error});}
  response.status(200).json(data.profile.characterIds);
});

app.get("/character/:id/general",async function(request, response){
  var components = ["200"];
  var cID = request.params.id;
  var data = await D2API.characterComponentRequest(request, response, components, cID).catch(function(error){ return error; });
  console.log("in character/:id/general");
  if(data instanceof Error){ console.error(data);response.status(400).json({error: error});}
  data = ServerResponse.CharacterResponse(data.character);
  response.status(200).json(data);
});

//Sends request to GetProfile endpoint, cleans up result, and
//returns list of equipment character currently has equipped.
app.get("/character/:id/equipment",async function(request,response){
  var components = ["201", "205", "300", "304"];
  var cID = request.params.id;
  var data = await D2API.characterComponentRequest(request, response, components, cID).catch(function(error){ return error; });
  if(data instanceof Error){ console.error(data); response.status(400).json({error: error});}
  data.equipment = ServerResponse.sortByBucketDefinition(data.equipment);
  data.inventory = ServerResponse.sortByBucketCategory(data.inventory);
  data.inventory = ServerResponse.sortByBucketDefinition(data.inventory.Equippable);
  delete data.equipment.Emotes;
  delete data.equipment.Finishers;
  delete data.equipment.ClanBanners;
  delete data.inventory.Emotes;
  delete data.inventory.Finishers;
  delete data.inventory.ClanBanners;
  response.status(200).json({equipment: data.equipment, inventory: data.inventory});
});

app.get("/character/:id/inventory",async function(request,response){
  var components = ["201"];
  var cID = request.params.id;
  var data = await D2API.characterComponentRequest(request, response, components,cID).catch(function(error){ return error; });
  console.log("in character/:id/inventory");
  if(data instanceof Error){ console.error(data);response.status(400).json({error: error});}
  data = ServerResponse.sortByLocation(data.inventory);
  response.status(200).json(data);
});

app.get("/profile/inventory/:id", async function(request,response){
  var components = ["102", "103"];
  var cID = request.params.id;
  var data = await D2API.profileComponentRequest(request, response, components).catch(function(error){ return error; });
  console.log("in profile/inventory/:id");
  if(data instanceof Error){ console.error(data);response.status(400).json({error: error});}
  var returnData = {
    currency: data.profileCurrencies,
    inventory: ServerResponse.sortByLocation(data.profileInventory),
  };
  response.status(200).json(returnData);
});

app.get("/profile/vault",async function(request, response){
  var components = ["102", "300", "304"];
  var data = await D2API.profileComponentRequest(request, response, components).catch(function(error){ return error; });
  console.log("in profile/vault");
  if(data instanceof Error){ console.error(data);response.status(400).json({error: error});}
  data = ServerResponse.sortByLocation(data.profileInventory).Vault;
  data = ServerResponse.sortByBucketTypeHash(data);
  response.status(200).json(data);
});

app.post("/character/lockItem",async function(request, response){
  let result = await D2API.lockCharacterItem(request, response).catch(function(error){ return error; });
  console.log("in character/lockItem");
  if(result instanceof Error){ console.error(result);response.status(400).json({error: error});}
  response.status(200).json({result: true});
});

app.post("/character/transferItem",async function(request, response){
  var result;
  if(request.body.characterTransferring === undefined){
    if(request.body.characterReceiving !== undefined)
    { result = await D2API.transferFromVault(request, response).catch(function(error){ return error; }); }
  }
  if(request.body.characterTransferring !== undefined){
    if(request.body.characterReceiving === undefined)
    { result = await D2API.transferToVault(request, response).catch(function(error){ return error; }); }
    if(request.body.characterReceiving !== undefined)
    { result = await D2API.transferToCharacter(request, response).catch(function(error){ return error; }); }
  }
  console.log("end of character/transferItem.");
  if(result instanceof Error){ response.status(400).json({error: error});}
  response.status(200).json({result: true});
});
//Sends a POST request to bungie API EquipItem endpoint, returns result of request.
app.post("/character/equipItem",async function(request, response){
  let result = await D2API.equipItem(request, response).catch(function(error){ return error; });
  console.log("in character/lockItem");
  if(result instanceof Error){ console.error(result);response.status(400).json({error: error});}
  response.status(200).json(result);
});

app.use(D2API.getBnetInfo);
app.get("/",async function(request,response){
  response.sendFile(webpageRoot+"/home.html");
});
app.get("/vault",async function(request,response){
  response.sendFile(webpageRoot+"/vault.html");
});
httpsServer.listen(process.env.PORT);

//END OF EXPRESS FUNCTIONS.
function accessAuthorizedEndpoints(request, response, next){
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
          if(request.url == "/" || request.url == "/vault"){
            response.redirect("/login");
          }
          else {
            console.log(request);
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
    response.redirect("/bnetlogin");
  }
  /*console.log("Session "+request.session.id+" has requested access to "+request._parsedUrl.path+" from "+request.originalURL);
  var currentTime = new Date().getTime();
  console.log(Object.keys(request.session.data.tokenData).length);
  if(Object.keys(request.session.data.tokenData).length == 0){
    console.error("No data exists for user. ");
    response.redirect("/bnetlogin");
    console.log("redirected.");
  }
  //var tokenData = D2API.decryptData(request.session.data.tokenData);
  if(tokenData.refreshExpiration < currentTime){
    console.log("The refresh token has expired, gonna need to login.");
    response.redirect("/bnetlogin");
  }
  if(tokenData.tokenExpiration < currentTime){
    console.log("Token has expired, user requires a new one.");
    let data = D2API.tokenRefresh(request, response);
    console.log("Token refresh completed.");
  }
  console.log("User seems good to go.");
  next();*/
};
function constructSessionInstance(request, response, next){
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
};
