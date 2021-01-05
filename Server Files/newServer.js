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
const tool = require("./functions");
const DestinyEntities = require("./APIManifest.js").Entities;
const root = path.join(__dirname,"..\\");
const webpageRoot = path.join(__dirname,"..\\","Client Files");
const serverRoot = path.join(__dirname,"..\\","Server Files");
const assetRoot = path.join(__dirname,"..\\","assets");
const bungieRoot = "https://www.bungie.net/Platform";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";
dotenv.config( { path: path.join(root,"process.env") } );
process.env['NODE_TLS_REJECT_UNAUTHORIZED']=0;

var privatekey = fs.readFileSync(path.join(root,"key.pem"));
var certificate = fs.readFileSync(path.join(root,"cert.pem"));
var credentials = {key: privatekey, cert: certificate};
var httpsServer = https.createServer(credentials,app);


app.get("/test",function(request,response){

})
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
app.use(function(request,response,next){
  if(request.session.data !== undefined){
    console.log("no setup required.");
  }
  else {
    console.log("Monika fucked it up, some setup is required.");
    request.session.data = {};
    request.session.authStatus = 0;
  }
  next();
});
app.get("/", function(request, response){
  response.sendFile(webpageRoot+"/home.html");
});
app.get("/login",function(request,response){
  console.log(request.ip);
  console.log("User has begun a login attempt to bungie.net");
  let state = crypto.randomBytes(16).toString("base64");
  request.session.authStatus = 1;
  request.session.data.state = state;
  var url = new URL("https://www.bungie.net/en/OAuth/Authorize");
  url.searchParams.append("client_id",process.env.Bungie_ClientID);
  url.searchParams.append("response_type","code");
  url.searchParams.append("state",state);
  response.redirect(url);
});
app.use(function(request,response,next){
  console.log("Verifying user authentication.");
  console.log("Searching for cookie stored.");
  switch(request.session.authStatus){
    case 0:
      console.log("User has zero credentials, honestly kinda suss.");
      response.redirect("/");
      break;
    case 1:
      console.log("User is in progress logging in, allow access to /login and /bapi endpoints.");
      next();
      break;
    case 2:
      console.log("User is trying to obtain a token, and has an existing authcode.");
      next();
      break;
    case 3:
      console.log("User has an access token and is able to access sensitive information.");
      next();
      break;
    default:
      console.log("Yo Monika is doin some wild shit in this code.");
  }
})

app.get("/bapi", async function(request,response){
  if(request.query.state !== request.session.data.state){
    console.error("State parameters DO NOT MATCH! ABORTING MISSION");
    request.session.data.state = null;
    request.session.authStatus = 0;
    request.session.data = {};
    response.redirect("/");
  }
  else {
    console.log("STATE PARAMETERS MATCH, therefore this login is valid and untampered. (we hope)");
    request.session.data.codeparams = request.query;
    request.session.authStatus = 2;
  }
    response.redirect("/authenticate");
});
app.get("/authenticate", async function(request,response, next){
  var body = new URLSearchParams();
  body.append("client_secret",process.env.Bungie_ClientSecret);
  body.append("client_id", process.env.Bungie_ClientID);
  body.append("grant_type", "authorization_code");
  body.append("code",request.session.data.codeparams.code);
  let requestee = await axios({
    method:"POST",
    url: bungieTokURL,
    headers:{"Content-Type": "application/x-www-form-urlencoded"},
    data: body
  });
  if(requestee.status >= 200 && requestee.status < 300){
    console.log("TOKEN REQUEST SUCCESSFUL");
    request.session.data.token = requestee.data;
    response.redirect("/inventory");
  }
  else {
    console.error("request NOT successful");
    request.session.data = {};
    request.session.authStatus = 0;
    response.redirect("/");
  }

});
app.get("/inventory", async function(request, response,next){
  //Get user's linked profiles so that we can access the primary D2 account.
  var id = request.session.data.token.membership_id;
  var type = 3;
  let requestee = await axios({
    method:"GET",
    url: bungieRoot+"/Destiny2/"+type+"/Profile/"+id+"/LinkedProfiles/",
    headers:{"X-API-Key":process.env.Bungie_API_KEY},
  });
  if(requestee.status >= 200 && requestee.status < 300){
    console.log("Profiles associated with user "+id+" obtained.");
    request.session.data.primary = null;
    request.session.data.UAC = requestee.data.Response;
    for(i in requestee.data.Response.profiles){
      if(requestee.data.Response.profiles[i].isCrossSavePrimary)
        request.session.data.primary = i;
    }
    response.redirect("/user/"+request.session.data.UAC.profiles[request.session.data.primary].membershipId)
  }
  else {
    response.status(400).json({error: "sorry, i suck at coding an fucked something up. I'll fix it soon, I promise."});
  }
});
app.get("/user/:membershipId",function(request,response,next){
  response.sendFile(webpageRoot+"/inventory.html");
});
app.get("/character/:membershipId",function(request,response, next){

  console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
});
httpsServer.listen(process.env.PORT);
