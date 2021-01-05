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

var bplatformComponents = {
  profiles: 100,
  vendorreceipts: 101,
  profileinventories: 102,
  profilecurrency: 103,
  profileprogression: 104,
  platformsilver: 105
};
var bcharacterComponents = {
  characters: 200,
  characterinventory: 201,
  characterprogression: 202,
  characterrenderdata: 203,
  characteractivity: 204,
  characterequipment: 205
};
var bitemComponents = {
  iteminstances: 300,
  itemobjectives: 301,
  itemperks: 302,
  itemrenderdata: 303,
  itemstats: 304,
  itemsockets: 305,
};
var bvendorcomponents = {
  vendors: 400,
  vendorcategory: 401,
  vendorsales: 402,
  kiosks: 500,
  currencylookup: 600
};
var buserstatComponents = {
  records: 900,
  metrics: 1100
};
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
        console.log();
        console.log();
        console.log("NEW SESSION GANG, LET'S SEE WHO'S BEHIND THIS MASK");
        console.log("generating uuid for "+req.hostname);
        return genuuid.v4();
      },
      resave: false,
      saveUninitialized: false,
      cookie: { httpOnly: true, secure: true, expires: 120000},
  })
);
app.use(function(request,response,next){
  console.log("-----------------------------------------------------------------------");
  console.log("Access to non-asset endpoint requested, checking for pre-existing credentials.");
  console.log("Checking for session data");
  if(request.session.data == undefined){
    console.error("Data undefined, user authentication needed.");
    request.session.data = {};
    console.log("User had no prestored data, will need to login to access api information.");
    console.log("End of path.");
    console.log("<------------------------------------>");
  }
  else {
    console.log("User has prestored data module, he has been here, however, this does not mean he has credentials stored.");
  }
  next();
})
app.use(express.static(webpageRoot));
app.get("/", function(request, response){
  response.sendFile(webpageRoot+"/home.html");
});
//Authorizaton Routes/Returns
app.get("/authroizebapi", function(request, response){
  console.log("user login requested.");
  let state = crypto.randomBytes(16).toString("base64");
  request.session.data.state = state;
  var url = new URL("https://www.bungie.net/en/OAuth/Authorize");
  url.searchParams.append("client_id",process.env.Bungie_ClientID);
  url.searchParams.append("response_type","code");
  url.searchParams.append("state",state);
  response.redirect(url);
});
app.get("/bapi", async function(request,response){
  if(request.query.state !== request.session.data.state){
    console.error("State parameters DO NOT MATCH! ABORTING MISSION");
    request.session.data.state = null;
  }
  else {
    console.log("STATE PARAMETERS DID MATCH, INITIATING USER DATA REQUESTS.");
    await getUserAccessData(request.query).then(async function(result){
      console.log("user token retrieval successful.");
      request.session.data.state = null;
      request.session.data = result;
      request.session.data.memberType = 3;
      response.redirect("/inventory");
    }).catch(function(error){
      console.error(error);
      response.redirect("/");
    });

  }
});
app.get("/userData",function(request,response, next){

  console.log("user page has requested data to fill content.");
  if(Object.keys(request.session.data).length == 0){
    console.error("Data nonexistent, user authentication needed.");
    response.status(404).json({error:"User has not yet logged in, please login to allow access to d2 information."});
    console.log("End of path for data request.");
    console.log("<------------------------------------>");
  }
  else{
    console.log("user data seems to exist, attempting to access info");
    next();
  }
}, async function(request,response,next){
  console.log("Attempting to obtain linked profiles of user.");
  await getLinkedProfiles(request.session.data).then(function(result){
    request.session.data.profile = [];
    for(i in result.Response.profiles){
      request.session.data.profile[i] = result.Response.profiles[i];
      if(result.Response.profiles[i].isCrossSavePrimary)
        request.session.data.primary = i;
    }
    request.session.data.bnet = result.Response.bnetMembership;
    console.log("Successfully obtained linked profiles.");
    console.log(request.session.data);
    next();
  }).catch(function(error){
    console.error(error);
    response.status(404).json({error:"There was an error while trying to access the destiny profile data, please try again."});
    console.log("End of path for data request.");
    console.log("<------------------------------------>");
  });

}, async function(request, response){
  console.log("Attempting to obtain User's primary D2 profile.");
  var primary = request.session.data.primary;
  var necessaryData = {
    memtype: request.session.data.profile[primary].membershipType,
    id: request.session.data.profile[primary].membershipid,
  }
  await getD2Profile(necessaryData).then(function(result){
    console.log("Successfully accessed user's primary D2 profile, standby for json payload.");
    console.log(result);
    response.status(200).json({
      name: request.session.data.displayName,
      type: request.session.data.d2membershipType,
      id: request.session.data.d2membershipID
    });

  }).catch(function(error){
    console.error(error);
    response.status(404).json({error:"Unable to load primary profile, deepest apologies."});
    console.log("End of path for data request.");
    console.log("<------------------------------------>");
  });
  console.log("End of path for data request.");
  console.log("<------------------------------------>");
});
//Routes Requiring Authentication check to verify data can be accessed.

app.get("/inventory",function(request,response){
  response.sendFile(webpageRoot+"/inventory.html");
});
httpsServer.listen(process.env.PORT);


async function getUserAccessData(info){
  var body = new URLSearchParams();
  body.append("client_secret",process.env.Bungie_ClientSecret);
  body.append("client_id", process.env.Bungie_ClientID);
  body.append("grant_type", "authorization_code");
  body.append("code",info.code);
  let request = await axios({
    method:"POST",
    url: bungieTokURL,
    headers:{"Content-Type": "application/x-www-form-urlencoded"},
    data: body
  });
  if(request.status >= 200 && request.status < 300){
    console.log("TOKEN REQUEST SUCCESSFUL");
    return request.data;
  }
  else {
    console.error("request NOT successful");
  }
}
async function getLinkedProfiles(req){
  let request = await axios({
    method:"GET",
    url: bungieRoot+"/Destiny2/"+req.memberType+"/Profile/"+req.membership_id+"/LinkedProfiles/",
    headers:{"X-API-Key":process.env.Bungie_API_KEY},
  });
  if(request.status >= 200 && request.status < 300){
    console.log("Steam profile retrieved.");
    return request.data;
  }
  else {
    throw new Error("error retrieving steam profile.");
  }
}
async function getD2Profile(data){
  var params = new URLSearchParams();
  params.set("components","100");
  let request = await axios({
    method: "GET",
    url: bungieRoot+"/Destiny2/"+data.memtype+"/Profile/"+data.id+"/?"+params.toString(),
    headers:{"X-API-Key":process.env.Bungie_API_KEY},
  });

  if(request.status >= 200 && request.status < 300){
    console.log("D2 profile retrieved.");
    return request.data.Response;
  }
  else {
    throw new Error("error retrieving D2 profile.");
  }
};
async function getD2Character(data){
  var params = new URLSearchParams();
  params.set("components","200,201,202,205");
  let request = await axios({
    method: "GET",
    url: bungieRoot+"/Destiny2/"+data.d2membershipType+"/Profile/"+data.d2membershipID+"/Character"+data.characterid+"/?"+params.toString(),
    headers:{"X-API-Key":process.env.Bungie_API_KEY},
  });
  if(request.status >= 200 && request.status < 300){
    console.log("D2 profile retrieved.");
    return request.data.Response;
  }
  else {
    throw new Error("error retrieving D2 profile.");
  }
};
