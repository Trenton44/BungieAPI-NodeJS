const path = require("path");
const root = __dirname;
const webpageRoot = root+"/Client_Files";
const serverRoot = root+"/Server_Files";
const assetRoot = root+"/Asset_Files";
const manifestRoot = root+"/Manifest_Files";
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

const express = require("express");
const session = require("express-session");
const genuuid = require("uuid");
const app = new express();
const axios = require('axios');
const dotenv = require("dotenv");
const crypto = require("crypto");
const helmet = require("helmet");
//const mongo = require('mongodb');
//const MongoClient = require('mongodb').MongoClient;
//const MongoDBStore = require("connect-mongodb-session")(session);

const bungieRoot = "https://www.bungie.net/Platform";
const bungieCommon = "https://www.bungie.net";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";

const D2API = require(serverRoot+"/D2API.js");
const D2Components = require(serverRoot+"/D2Components.js");
const ServerResponse = require(serverRoot+"/Server_Responses.js");
const D2Responses = require(serverRoot+"/D2APIResponseObjects.js");

app.set('trust proxy', true);
app.use(express.json());
app.use("/assets", express.static('Asset_Files'));
app.use("/client", express.static('Client_Files'));
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
dotenv.config( { path: path.join(root,"process.env") } );
app.use(constructSessionInstance);
app.get("/bnetlogin", async function(request, response){
  console.log("in bnet login.");
  let state = crypto.randomBytes(16).toString("base64");
  request.session.data.state = state;
  var url = new URL(bungieAuthURL);
  url.searchParams.append("client_id",process.env.BUNGIE_CLIENT_ID);
  url.searchParams.append("response_type","code");
  url.searchParams.append("state",state);
  console.log("Sending to url.");
  response.redirect(url);
});

app.get("/bnetresponse", async function(request, response, next){
  console.log("in bnet response.");
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
  result.data.characterInventories = D2API.appendEquipmentToInventory(result.data.characterEquipment, result.data.characterInventories);
  delete result.data.characterEquipment;
  result.data.characterInventories = D2API.appendInstanceData(result.data.characterInventories,result.data.itemComponents);

  request.session.data.gamedata.characterInventories = Object.assign({},result.data.characterInventories);
  delete result.data.itemComponents;
  for(i in result.data.characterInventories){ result.data.characterInventories[i] = D2API.sortByBucketCategory(result.data.characterInventories[i]); }
  for(z in result.data.characterInventories){
    for(a in result.data.characterInventories[z])
    { result.data.characterInventories[z][a] = D2API.bucketHashSort(result.data.characterInventories[z][a]); }
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
  result.data.characterInventories = D2API.appendEquipmentToInventory(result.data.characterEquipment, result.data.characterInventories);
  delete result.data.characterEquipment;
  result.data.characterInventories = D2API.appendInstanceData(result.data.characterInventories,result.data.itemComponents);
  delete result.data.itemComponents;
  var changedData = {};
  for(n in result.data.characterInventories){
    var temp = D2API.filterAlteredData(storedData[n], result.data.characterInventories[n]);
    changedData[n] = temp[1].concat(temp[0]);
  }
  request.session.data.gamedata.characterInventories = Object.assign({}, result.data.characterInventories);
  for(i in changedData){ changedData[i] = D2API.sortByBucketCategory(changedData[i]); }
  for(z in changedData){
    for(a in changedData[z])
    { changedData[z][a] = D2API.bucketHashSort(changedData[z][a]); }
  }
  for(i in result.data.characters){
    result.data.characters[i].itemInventory = changedData[i];
    delete result.data.characters[i].itemInventory.Equippable.Finishers;
    delete result.data.characters[i].itemInventory.Equippable.SeasonalArtifact;
  }

  response.status(result.status).json(result.data.characters);

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
  result.data.profileInventory = D2API.appendInstanceData({ profileInventory: result.data.profileInventory },result.data.itemComponents).profileInventory;

  request.session.data.gamedata.vault = Object.assign({},result.data);
  delete result.data.itemComponents;

  result.data.profileInventory = D2API.sortByBucketCategory(result.data.profileInventory);
  for(b in result.data.profileInventory){ result.data.profileInventory[b] = D2API.sortByBucketTypeHash(result.data.profileInventory[b]); }
  delete result.data.profileInventory.Ignored;
  delete result.data.profileInventory.Invisible;
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
  result.data.profileInventory = D2API.appendInstanceData({ profileInventory: result.data.profileInventory },result.data.itemComponents).profileInventory;
  var temp = D2API.filterAlteredData(storedData, result.data.profileInventory);
  changedData = temp[1].concat(temp[0]);
  request.session.data.gamedata.vault.profileInventory = Object.assign({},result.data.profileInventory);

  changedData = D2API.sortByBucketCategory(changedData);
  for(b in changedData){ changedData[b] = D2API.sortByBucketTypeHash(changedData[b]); }
  delete changedData.Ignored;
  delete changedData.Invisible;
  var data = {
    characters: result.data.characters,
    profileInventory: changedData,
  };
  response.status(result.status).json(data);
  var endTime = new Date().getTime();
  console.log("vault update took exactly "+(endTime-startTime)/1000+" seconds.");
  console.log("Payload size.");
  console.log(Buffer.byteLength(JSON.stringify(changedData)));
});
/*app.get("/historical/general/account",async function(request, response, next){

});*/
app.get("/historical/stats/specific/:character/:mode",async function(request, response, next){
  let result = await D2API.specificHistoricalStats(request).catch(function(error){ return error; });
  if(result instanceof Error){ next(result); return; }
  response.status(result.status).json(result.data);
});
app.get("/historical/activity/specific/:character/:mode/:page",async function(request, response, next){
  let result = await D2API.getActivityHistory(request).catch(function(error){ return error; });
  if(result instanceof Error){ next(result); return; }
  response.status(result.status).json(result.data);
});
app.post("/postmaster",async function(request, response, next){
  let result = await D2API.pullFromPostmaster(request).catch(function(error){ return error; });
  if(result instanceof Error){ next(result); return; }
  response.status(result.status).send("Success");
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
  console.log("Hello World!");
  response.status(200).sendFile(webpageRoot+"/home.html");
});
app.get("/vault",async function(request, response){
  response.sendFile(webpageRoot+"/vault.html");
});
app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}`);
  console.log('Press Ctrl+C to quit.');
});
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
  console.log("Constructing instance.");
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
    console.log(error.status);
    response.status(400).send(Error(error.statusText));
  }
  else if(error instanceof D2Responses.TokenError){
    console.log("Something went awry trying to obtain an access token.");
    response.status(400).send("Something went awry trying to obtain an access token. Feel free to try again though.");
  }
  else {
    console.error(error);
    console.log("Hey, I didn't build this error, so we just gonna give a default response.");
    response.status(404).send("Not Found.");
  }
}
