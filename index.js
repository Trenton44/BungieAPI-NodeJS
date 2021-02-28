const path = require("path");
const root = __dirname;
const webpageRoot = root+"/Client_Files";
const serverRoot = root+"/Server_Files";
const assetRoot = root+"/Asset_Files";
const manifestRoot = root+"/Manifest_Files";
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

const app = new express();
const axios = require('axios');
const dotenv = require("dotenv");

const bungieRoot = "https://www.bungie.net/Platform";
const bungieCommon = "https://www.bungie.net";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";

dotenv.config( { path: path.join(root,"process.env") } );

app.get("/",async function(request, response){
  console.log("Hello World!");
  response.status(200).send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
