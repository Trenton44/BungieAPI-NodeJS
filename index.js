const path = require("path");
const root = __dirname;
const webpageRoot = root+"/Client_Files";
const serverRoot = root+"/Server_Files";
const assetRoot = root+"/Asset_Files";
const manifestRoot = root+"/Manifest_Files";
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

const https = require("https");
const fs = require('fs');
const express = require("express");
const session = require("express-session");
const genuuid = require("uuid");
var sslRedirect = require("heroku-ssl-redirect").default;
const app = new express();
const axios = require('axios');
const dotenv = require("dotenv");
const crypto = require("crypto");
const helmet = require("helmet");
const _ = require("loadsh");
//const mongo = require('mongodb');
//const MongoClient = require('mongodb').MongoClient;
//const https = require('http');
//const MongoDBStore = require("connect-mongodb-session")(session);
var sessionConfig = {
    name: "sAk3m3",
    secret: "secreto!alabastro@",
    genid: function(req){ return genuuid.v4(); },
    resave: true,
    //store: store,
    saveUninitialized: true,
    cookie: { httpOnly: true, secure: true, maxAge: 24*60*60*100,}, //maxAge set to 24 hours.
};
const bungieRoot = "https://www.bungie.net/Platform";
const bungieCommon = "https://www.bungie.net";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";

const D2API = require(serverRoot+"/D2API.js");
const D2Components = require(serverRoot+"/D2Components.js");
const ServerResponse = require(serverRoot+"/Server Responses.js");
const D2Responses = require(serverRoot+"/D2APIResponseObjects.js");


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
      cookie: { httpOnly: true, secure: false, maxAge: 24*60*60*100,}, //maxAge set to 24 hours.
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
  response.redirect(url);
});

app.get("/bnetresponse", async function(request, response, next){
  if(request.query.state !== request.session.data.state){
    console.log("query state "+request.query.state +"and saved state "+request.session.data.state+" do not match. this session will be destroyed.");
    request.session.destroy();
    next(Error());
    return;
  }
  console.log("states match, requesting token.");
  request.session.data.authCode = request.query.code;
  let result = await D2API.requestToken(request, response).catch(function(error){ return });
  if(result instanceof Error){ next(result); return; }
  response.redirect("/");
});

app.use(accessAuthorizedEndpoints);

app.get("/home/data", async function(request, response, next){
  var startTime = new Date().getTime();

  var components = ["200", "201", "205", "300", "302", "304"];
  let result = await D2API.profileComponentRequest(request, components).catch(function(error){ return error; });
  if(result instanceof Error){ next(result); return; }
  result.data.characterInventories = combineallcharacterEquipmentandInventory(result.data.characterEquipment, result.data.characterInventories);
  delete result.data.characterEquipment;
  result.data.characterInventories = combineItemswithInstanceData(result.data.characterInventories,result.data.itemComponents);

  request.session.data.gamedata.characterInventories = Object.assign({},result.data.characterInventories);
  delete result.data.itemComponents;
  for(i in result.data.characterInventories){ result.data.characterInventories[i] = ServerResponse.sortByBucketCategory(result.data.characterInventories[i]); }
  for(z in result.data.characterInventories){
    for(a in result.data.characterInventories[z])
    { result.data.characterInventories[z][a] = ServerResponse.bucketHashSort(result.data.characterInventories[z][a]); }
  }
  for(i in result.data.characters){
    result.data.characters[i].itemInventory = result.data.characterInventories[i];
    delete result.data.characters[i].itemInventory.Equippable.Finishers;
    delete result.data.characters[i].itemInventory.Equippable.SeasonalArtifact;
  }

  response.status(result.status).json(result.data.characters);

  var endTime = new Date().getTime();
  console.log("access took exactly "+(endTime-startTime)/1000+" seconds.");
  console.log("Payload size.");
  console.log(Buffer.byteLength(JSON.stringify(result.data)));
});

app.get("/home/update", async function(request, response, next){
  var startTime = new Date().getTime();
  var storedData = request.session.data.gamedata.characterInventories;
  var components = ["200", "201", "205", "300", "302", "304"];
  let result = await D2API.profileComponentRequest(request, components).catch(function(error){ return error; });
  if(result instanceof Error){ next(result); return; }
  result.data.characterInventories = combineallcharacterEquipmentandInventory(result.data.characterEquipment, result.data.characterInventories);
  delete result.data.characterEquipment;
  result.data.characterInventories = combineItemswithInstanceData(result.data.characterInventories,result.data.itemComponents);
  delete result.data.itemComponents;
  var changedData = {};
  for(n in result.data.characterInventories){
    var temp = differentiateData(storedData[n], result.data.characterInventories[n]);
    changedData[n] = temp[1].concat(temp[0]);
  }
  request.session.data.gamedata.characterInventories = Object.assign({}, result.data.characterInventories);
  for(i in changedData){ changedData[i] = ServerResponse.sortByBucketCategory(changedData[i]); }
  for(z in changedData){
    for(a in changedData[z])
    { changedData[z][a] = ServerResponse.sortByBucketTypeHash(changedData[z][a]); }
    delete changedData[z].Equippable.Finishers;
    delete changedData[z].Equippable.SeasonalArtifact;
  }


  response.status(result.status).json(changedData);

  var endTime = new Date().getTime();
  console.log("vault update took exactly "+(endTime-startTime)/1000+" seconds.");
  console.log("Payload size.");
  console.log(Buffer.byteLength(JSON.stringify(temp)));
});

app.get("/vault/data", async function(request, response, next){
  var startTime = new Date().getTime();
  var components = ["102", "200", "300", "302", "304"];
  let result = await D2API.profileComponentRequest(request, components).catch(function(error){ return error; });
  if(result instanceof Error){ next(result); return; }
  result.data.profileInventory = combineItemswithInstanceData({ profileInventory: result.data.profileInventory },result.data.itemComponents).profileInventory;

  request.session.data.gamedata.vault = Object.assign({},result.data);
  delete result.data.itemComponents;

  result.data.profileInventory = ServerResponse.sortByBucketCategory(result.data.profileInventory);
  for(b in result.data.profileInventory){ result.data.profileInventory[b] = ServerResponse.sortByBucketTypeHash(result.data.profileInventory[b]); }
  response.status(result.status).json(result.data);
  var endTime = new Date().getTime();
  console.log("vault access took exactly "+(endTime-startTime)/1000+" seconds.");
  console.log("Payload size.");
  console.log(Buffer.byteLength(JSON.stringify(result.data)));
});

app.get("/vault/update", async function(request, response, next){
  var startTime = new Date().getTime();
  var storedData = request.session.data.gamedata.vault.profileInventory;
  var components = ["102", "200", "300", "302", "304"];
  let result = await D2API.profileComponentRequest(request, components).catch(function(error){ return error; });
  if(result instanceof Error){ next(result); return; }
  result.data.profileInventory = combineItemswithInstanceData({ profileInventory: result.data.profileInventory },result.data.itemComponents).profileInventory;
  var temp = differentiateData(storedData, result.data.profileInventory);
  changedData = temp[1].concat(temp[0]);
  request.session.data.gamedata.vault.profileInventory = Object.assign({},result.data.profileInventory);

  changedData = ServerResponse.sortByBucketCategory(changedData);
  for(b in changedData){ changedData[b] = ServerResponse.sortByBucketTypeHash(changedData[b]); }

  response.status(result.status).json(changedData);
  var endTime = new Date().getTime();
  console.log("vault update took exactly "+(endTime-startTime)/1000+" seconds.");
  console.log("Payload size.");
  console.log(Buffer.byteLength(JSON.stringify(changedData)));

});
app.post("/character/lockItem",async function(request, response, next){
  let result = await D2API.lockCharacterItem(request).catch(function(error){ return error; });
  console.log("in character/lockItem");
  if(result instanceof Error){ next(result); return; }
   response.status(200).json({ result: result });
});

app.post("/character/transferItem",async function(request, response, next){
  var result;
  console.log(request.body);
  if(request.body.characterTransferring !== undefined){
    console.log("The item is being transferred to the vault");
    result = await D2API.transferToVault(request).catch(function(error){ return error; });
    if(result instanceof Error){ result.message = "Your vault is full"; next(result); return; }
  }
  if(request.body.characterReceiving !== undefined){
    console.log("The item is being transferred to a character.");
    result = await D2API.transferFromVault(request).catch(function(error){ return error; });
    if(result instanceof Error){ next(result); return; }
  }
  console.log("result: "+result);
  if(result === undefined){ throw undefined; }
  response.status(200).json({result: result});
});
//Sends a POST request to bungie API EquipItem endpoint, returns result of request.
app.post("/character/equipItem",async function(request, response, next){
  let result = await D2API.equipItem(request).catch(function(error){ return error; });
  if(result instanceof Error){ next(result); return; }
  response.status(200).json({ result:result });
});

app.use(D2API.getBnetInfo);
app.use(handleServerErrors);
app.get("/",async function(request, response){
  response.sendFile(webpageRoot+"/home.html");
});
app.get("/vault",async function(request, response){
  response.sendFile(webpageRoot+"/vault.html");
});
httpsServer.listen(process.env.PORT);


//END OF EXPRESS FUNCTIONS.
async function accessAuthorizedEndpoints(request, response, next){
  console.log("Session "+request.session.id+" has requested access to "+request._parsedUrl.path);
  var currentTime = new Date().getTime();
  if(Object.keys(request.session.data.tokenData).length == 0){
    console.error("No data exists for user. ");
    response.redirect("/bnetlogin");
    return;
  }
  var tokenData = D2API.decryptData(request.session.data.tokenData);
  if(tokenData.refreshExpiration < currentTime){
    console.log("The refresh token has expired, gonna need to login.");
    response.redirect("/bnetlogin");
    return;
  }
  if(tokenData.tokenExpiration < currentTime){
    console.log("Token has expired, user requires a new one.");
    let data = await D2API.tokenRefresh(request, response).catch(function(error){ next(error); });
    console.log("Token refresh completed.");
  }
  console.log("User seems good to go.");
  next();
};
function constructSessionInstance(request, response, next){
  var reset = false;
  switch(request.session.data){
    case undefined:
      console.log("Session data does not exist, creating formatted data blueprint.");
      reset = true;
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
      bnetInfo: null,
      gamedata: {},
    };
  }
  next();
};
function handleServerErrors(error, request, response, next){
  console.log(error);
  if(error instanceof D2Responses.APIError){
    console.log("Hey, i built this error object! ");
    console.error(error.toString());
    error.statusText = error.toString();
    response.status(error.status);
  }
  else if(error instanceof D2Responses.TokenError){
    console.log("Something went awry trying to obtain an access token.");
    response.status(400).json({ error: "Something went awry trying to obtain an access token. Feel free to try again though." });
  }
  else {
    console.error(error);
    console.log("Hey, I didn't build this error, so we just gonna give a default response.");
    response.status(500).json({ error: "Internal Server Error." });
  }
}


//ALl temporary until i'm confident i can move them into the main program.
function combineallcharacterEquipmentandInventory(equipment, inventory){
  for(i in equipment){
    for(z in equipment[i]){
      inventory[i].push(equipment[i][z]);
    }
  }
  return inventory;
};
function combineItemswithInstanceData(inventory, instancedata){
  for(i in inventory){
    for(z in inventory[i]){
      if(inventory[i][z].itemInstanceId !== undefined){
        inventory[i][z].instanceData = instancedata[inventory[i][z].itemInstanceId];
      }
    }
  }
  return inventory;
}
function differentiateData(stored, data){
  var changedData = [];
  var uninstanced = [];
  var newstored = {};
  var newdata = {};
  for(i in stored){
    if(stored[i].itemInstanceId !== undefined){
      newstored[stored[i].itemInstanceId] = stored[i];
    }
  }
  for(i in data){
    if(data[i].itemInstanceId !== undefined){
      newdata[data[i].itemInstanceId] = data[i];
    }
    else {
      uninstanced.push(data[i]);
    }
  }
  for(i in newstored){
    if(newdata[i] === undefined){
      var temp = Object.assign({},newstored[i]);
      temp.changed = false;
      changedData.push(temp);
    }
    else {
      if(JSON.stringify(newdata[i]) !== JSON.stringify(newstored[i])){
        var temp = Object.assign({},newdata[i]);
        temp.changed = null;
        changedData.push(temp);
      }
    }
  }
  for(i in newdata){
    if(newstored[i] === undefined){
      var temp = Object.assign({},newdata[i]);
      temp.changed = true;
      changedData.push(temp);
    }

  }
  return [uninstanced, changedData];
}
