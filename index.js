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
app.get("/",async function(request, response){
  console.log("Hello World!");
  response.status(200).sendFile(webpageRoot+"/home.html");
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
    response.status(500).send("Internal Server Error.");
  }
}
