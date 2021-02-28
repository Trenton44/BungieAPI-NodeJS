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
