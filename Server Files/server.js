const https = require("https");
const fs = require('fs');
const express = require("express");
const app = new express();

const path = require("path");
const root = path.join(__dirname,"..\\");
const webpageRoot = path.join(__dirname,"..\\","Webpage Files");
const serverRoot = path.join(__dirname,"..\\","Server Files");
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const dotenv = require("dotenv");
dotenv.config( { path: path.join(root,"process.env") } );
const port = process.env.PORT;
var userInfo = {
  authCode: null,
  state: null,
};
var webpages = {
  main: webpageRoot+"\\"+"main.html",
  webJS: webpageRoot+"\\"+"comms.js",
  postLogin: webpageRoot+"\\"+"login.html"
};
var privatekey = fs.readFileSync(path.join(root,"Server Files\\key.pem"));
var certificate = fs.readFileSync(path.join(root,"Server Files\\cert.pem"));
var credentials = {key: privatekey, cert: certificate};
app.use(express.static(webpageRoot));
var httpsServer = https.createServer(credentials,app);

app.get("/", function(request, response){
  response.sendFile(webpages.main);
});
app.get("/loggedin", function(request, response){
  console.log('response received from bungie API endpoint');
  var params = new URLSearchParams(request.url.slice(1));
  userInfo.authCode = params.get("code");
  userInfo.state = params.get("state");
  console.log("loading new webpage with user content.");
  response.sendFile(webpages.postLogin);
})
app.get("/login", function(request, response){
  console.log("user login requested.");
  var url = new URL("https://www.bungie.net/en/OAuth/Authorize");
  url.searchParams.append("client_id",process.env.Bungie_ClientID);
  url.searchParams.append("response_type","code");
  url.searchParams.append("state","1234556");
  response.redirect(url);
});
httpsServer.listen(port);
