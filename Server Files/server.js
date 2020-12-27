const https = require("https");
const fs = require('fs');
const express = require("express");
const app = new express();
const axios = require('axios');
const path = require("path");
const dotenv = require("dotenv");

const root = path.join(__dirname,"..\\");
const webpageRoot = path.join(__dirname,"..\\","Webpage Files");
const serverRoot = path.join(__dirname,"..\\","Server Files");
const bungieRoot = "https://www.bungie.net/Platform";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = "https://www.bungie.net/platform/app/oauth/token/";
dotenv.config( { path: path.join(root,"process.env") } );
const port = process.env.PORT;
process.env['NODE_TLS_REJECT_UNAUTHORIZED']=0;


var userInfo = {
  authCode: null,
  state: null,
  accessData: null
};
var webpages = {
  main: webpageRoot+"\\"+"main.html",
  webJS: webpageRoot+"\\"+"comms.js",
  home: webpageRoot+"\\"+"home.html",
  inventory:webpageRoot+"\\"+"inventory.html",
  characters:webpageRoot+"\\"+"characters.html"

};
var privatekey = fs.readFileSync(path.join(root,"key.pem"));
var certificate = fs.readFileSync(path.join(root,"cert.pem"));
var credentials = {key: privatekey, cert: certificate};
app.use(express.static(webpageRoot));
var httpsServer = https.createServer(credentials,app);

app.get("/", function(request, response){
  //console.log(response);
  var params = new URLSearchParams(request.query);
  var paramsS = params.toString();
  console.log(paramsS);
  if(paramsS === "")
    console.log("nothing");
  else {
    getUserAccessData();
    console.log(userInfo.accessData);
  }
  response.sendFile(webpages.main);

});
app.get("/loggedin", function(request, response){
  console.log('response received from bungie API endpoint');
  var params = new URLSearchParams(request.query);
  console.log(params);
  userInfo.authCode = params.get("code");
  userInfo.state = params.get("state");
  //console.log("loading new webpage with user content.");
  //console.log(userInfo);
  response.sendFile(webpages.home);
})
app.get("/login", function(request, response){
  console.log("user login requested.");
  var url = new URL("https://www.bungie.net/en/OAuth/Authorize");
  url.searchParams.append("client_id",process.env.Bungie_ClientID);
  url.searchParams.append("response_type","code");
  url.searchParams.append("state","1234556");
  response.redirect(url);
});
app.get("/home",function(request,response){
  response.sendFile(webpages.home);
});
app.get("/inventory",function(request,response){
  response.sendFile(webpages.inventory);
});
app.get("/characters",function(request,response){
  response.sendFile(webpages.characters);
});
app.get("/test",function(request,response){
  getUserAccessData();

});
httpsServer.listen(port);


async function getUserAccessData(){
  var body = new URLSearchParams();
  body.append("client_id",process.env.Bungie_ClientID);
  body.append("grant_type", "authorization_code");
  body.append("code",userInfo.authCode);
  let request = await axios({
    method:"POST",
    url: bungieTokURL,
    headers:{"Content-Type": "application/x-www-form-urlencoded"},
    data: body
  }).then(function(response){
    userInfo.accessData = response.data;
  }).catch(function(error){
    console.error(error);
  });
}
