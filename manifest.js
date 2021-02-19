const path = require("path");
const root = __dirname;
const axios = require('axios');
const fs = require('fs');

const dotenv = require("dotenv");
dotenv.config( { path: path.join(root,"process.env") } );

const bungieRoot = "https://www.bungie.net/Platform";
const bungieCommon = "https://www.bungie.net";
const manifestRoot = root+"/Manifest_Files";

const D2ManifestVersion = require(root+"/ManifestVersion.json");
//Loads the current d2 manifest from bungie api and saves to root.
function loadManifest(){
  console.log("Obtaining Manifest");
  var path = bungieRoot+"/Destiny2/Manifest/";
  return getRequest(path).then(function(result){
    result = result.data.Response;
    console.log("Pulling new manifest version, this may take a bit...");
    path = bungieCommon+result.jsonWorldContentPaths.en;
    return getRequest(path).then(function(result){
      console.log("manifest data retrieved, now writing contents to files.");
      for(i in result.data){
        console.log("Iteration: "+i);
        let data = JSON.stringify(result.data[i], null, 2);
        console.log("Now writing item "+i+" to  file "+i+".json");
        fs.writeFileSync(manifestRoot+"/"+i+".json", data, function(error){
          console.error(error);
          return false;
        });
      }
      console.log("Manifest loading finished.");
      fs.writeFileSync(root+"/ManifestVersion.json", JSON.stringify({version: result.version}), function(error){
        console.error(error);
        return false;
      });
      console.log("Manifest version updated.");
      return true;
    }).catch(function(error){ console.log(error); return error; });
  }).catch(function(error){ console.log(error); return error; });
};

function getRequest(path){
  return axios({
    method:"GET",
    url: path,
    headers: {"X-API-Key":process.env.Bungie_API_KEY},
  }).catch(function(error){ throw error; });
};

async function main(){
  var result = await loadManifest();
  console.log(result);
  console.log("Done with main.");
}
console.log("entry point of manifest load.");
main();
console.log("exit point of manifest load.");
