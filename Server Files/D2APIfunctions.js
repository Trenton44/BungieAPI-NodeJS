const dotenv = require("dotenv");
const path = require("path");
const root = path.join(__dirname,"..\\");
dotenv.config( { path: path.join(root,"process.env") } );
const axios = require('axios');
const https = require("https");
const fs = require('fs');
const manifestRoot = path.join(__dirname,"..\\","manifestData");
//const D2Manifest = require(manifestRoot+"/D2Manifest2.js").D2Manifest;
const D2Manifest = require(manifestRoot+"/d2manifest.json");
const d2components = require("./D2Components.js");
const bungieRoot = "https://www.bungie.net/Platform";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";
const bungieCommon = "https://www.bungie.net";
function combineComponentString(value){
  var params = "";
  for(i in value){
    if(i == value.length-1)
      params+= value[i];
    else
      params+= value[i]+",";
  }
  var parameters = new URLSearchParams();
  parameters.set("components",params);
  return parameters;
}
exports.combineComponentString = combineComponentString;
//Requests of the GET Type.
function searchD2Player(type,displayName){
  var path = bungieRoot+"/Destiny2/SearchDestinyPlayer/"+type+"/"+displayName+"/";
  return getRequest(path);
};
exports.searchD2Player = searchD2Player;

function getBungieUser(id,token){
  var path = bungieRoot+"/User/GetBungieNetUserById/"+id+"/";
  return getRequestAuth(path,token);
}
exports.getBungieUser = getBungieUser;
function searchBungieuser(bungieID){
  path = bungieRoot+"/User/SearchUsers/?"+bungieID;
  return getRequest(path);
}
exports.searchBungieuser = searchBungieuser;
function getCredentialsforAccount(membership_id){
  var path = bungieRoot+"/User/GetCredentialTypesForTargetAccount/"+membership_id+"/";
  return getRequest(path);
}
exports.getCredentialsforAccount = getCredentialsforAccount;
function getThemesAvailable(membership_id){
  path = bungieRoot+"/User/GetAvailableThemes/";
  return getRequest(path);
}
exports.getThemesAvailable = getThemesAvailable;
function getBungieMembershipData(membership_id,memType){
  path = bungieRoot+"/User/GetMembershipsById/"+membership_id+"/"+memType+"/";
  return getRequest(path);
}
exports.getBungieMembershipData = getBungieMembershipData;
function getBungieCurrentUserData(token){
  var path = bungieRoot+"/User/GetMembershipsForCurrentUser/";
  return getRequestAuth(path,token);
};
exports.getBungieCurrentUserData = getBungieCurrentUserData;
function getBungieMemberDataviaCredential(crType,credential){
  path = bungieRoot+"/User/GetMembershipFromHardLinkedCredential/"+crType+"/"+credential+"/";
  return getRequest(path);
}
exports.getBungieMemberDataviaCredential = getBungieMemberDataviaCredential;
function getDestinyEntityDefinition(entityType,hashID){
  path = bungieRoot+"/Destiny2/Manifest/"+entityType+"/"+hashID+"/";
  return getRequest(path);
}
exports.getDestinyEntityDefinition = getDestinyEntityDefinition;
function getLinkedProfiles(type,membership_id){
  var path =bungieRoot+"/Destiny2/"+type+"/Profile/"+membership_id+"/LinkedProfiles/";
  return getRequest(path);
};
exports.getLinkedProfiles = getLinkedProfiles;
function getDestinyProfile(type, d2ID, components){
  var params = combineComponentString(components);
  var path =bungieRoot+"/Destiny2/"+type+"/Profile/"+d2ID+"/"+"?"+params.toString();
  return getRequest(path);
};
exports.getDestinyProfile = getDestinyProfile;
function getDestinyProfileAuth(type, d2ID, components, token){
  var params = combineComponentString(components);
  var path =bungieRoot+"/Destiny2/"+type+"/Profile/"+d2ID+"/"+"?"+params.toString();
  return getRequestAuth(path,token);
};
exports.getDestinyProfileAuth = getDestinyProfileAuth;
function getCharacter(type, d2ID,characterID,components){
  var path = bungieRoot+"/Destiny2/"+type+"/Profile/"+d2ID+"/Character/"+characterID+"/";
  return getRequest(path);
};
exports.getCharacter = getDestinyProfile;

function getItem(type, d2ID, itemID, components){
  var params= combineComponentString(components);
  var path = bungieRoot+"/Destiny2/"+type+"/Profile/"+d2ID+"/Item/"+itemID+"/?"+params;
  return getRequest(path);
};
exports.getItem = getItem;
//Requests of the POST Type.
async function postRequest(path,body,token){
  return axios({
    method:"POST",
    url: path,
    headers: {"X-API-Key":process.env.Bungie_API_KEY, "Authorization":"Bearer "+token},
    data: body,
  });
};
exports.postRequest = postRequest;
function getRequest(path){
  return axios({
    method:"GET",
    url: path,
    headers: {"X-API-Key":process.env.Bungie_API_KEY},
  });
};
function getRequestAuth(path,token){
  return axios({
    method:"GET",
    url: path,
    headers: {"X-API-Key":process.env.Bungie_API_KEY, "Authorization":"Bearer "+token},
  });
}


//Other useful functions that I haven't gotten around to wanting to do.
async function tokenRefresh(token){
  console.log("access token expired, requesting a new one");
  var body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("refresh_token", token);
  body.append("client_secret",process.env.Bungie_ClientSecret);
  body.append("client_id", process.env.Bungie_ClientID);
  let request = await axios({
    method:"POST",
    url: bungieTokURL,
    headers: {"X-API-Key":process.env.Bungie_API_KEY},
    data: body
  });
  return request;
}
exports.tokenRefresh = tokenRefresh;
async function tokenRequest(request){
  var body = new URLSearchParams();
  body.append("client_secret",process.env.Bungie_ClientSecret);
  body.append("client_id", process.env.Bungie_ClientID);
  body.append("grant_type", "authorization_code");
  body.append("code",request.session.data.authCode);
  let token = await axios({
    method:"POST",
    url: bungieTokURL,
    headers:{"Content-Type": "application/x-www-form-urlencoded"},
    data: body
  });
  return token;
};
exports.tokenRequest = tokenRequest;

function parseBungieCurrentUserDataResponse(data){
  //console.log(data);
  var memberships = {};
  var i = 0;
  for(i in data.destinyMemberships){
    memberships[data.destinyMemberships[i].membershipId] = data.destinyMemberships[i];
  }
  memberships.primaryMembershipId = data.primaryMembershipId;
  memberships.bnetUser = data.bungieNetUser;
  return memberships;
}
exports.parseBungieCurrentUserDataResponse = parseBungieCurrentUserDataResponse;

function loadManifest(){
  var path =bungieRoot+"/Destiny2/Manifest/";
  getRequest(path).then(function(result){
    var d2contentManifest = bungieCommon+result.data.Response.jsonWorldContentPaths.en;
    getRequest(d2contentManifest).then(function(result){
      var manifestItems = Object.keys(result.data);
      for(i in result.data){
        console.log("Iteration: "+i);
        let data = JSON.stringify(result.data[i], null, 2);
        console.log("Now writing item "+i+" to  file "+i+".json");
        fs.writeFileSync(manifestRoot+"/"+i+".json", data, function(error){
          console.error(error);
        });
      }
      console.log("Now writing entire manifest to d2manifest.json");
      let data = JSON.stringify(result.data, null, 2);
      fs.writeFileSync(manifestRoot+"/d2manifest.json", data, function(error){
        console.error(error);
      });
      console.log("Done");
    });
  });
}
exports.loadManifest = loadManifest;

function parseComponentResponses(data,components){
  console.log("Parsing the following components:"+ components);
  var parsedComponents = {};
  for(i in components){
    console.log();
    console.log("Currently parsing: "+components[i]);
    var componentMethod = d2components.components[components[i]];
    console.log("Method used by component: "+componentMethod);
    switch(components[i]){
      case "500":
        var datapassed = d2components[componentMethod](data.profileKiosks,data.characterKiosks);
        break;
      case "600":
        var datapassed = d2components[componentMethod](data.profileCurrencyLookups,data.characterCurrencyLookups);
        break;
      case "700":
        var datapassed = d2components[componentMethod](data.profilePresentationNodes,data.characterPresentationNodes);
        break;
      case "800":
        var datapassed = d2components[componentMethod](data.profileCollectibles,data.characterCollectibles);
        break;
      case "900":
        var datapassed = d2components[componentMethod](data.profileRecords,data.characterRecords);
        break;
      default:
        var datapassed = d2components[componentMethod](data[componentMethod]);
        break;
    }
    parsedComponents[componentMethod] = datapassed;
    console.log("Component has been parsed");
  }
  console.log("All components have been parsed, returning data.");
  return parsedComponents;
}
exports.parseComponentResponses = parseComponentResponses;

function saveTokenData(request, tokenData){
  request.session.data.tokenData = tokenData;
  request.session.data.tokenData.tokenExpiration = new Date().getTime()+(tokenData.expires_in*1000);
  request.session.data.tokenData.refreshExpiration = new Date().getTime()+(tokenData.refresh_expires_in*1000);
  console.log("New token expiration date: "+new Date(request.session.data.tokenData.tokenExpiration));
  console.log("New refresh expiration date: "+new Date(request.session.data.tokenData.refreshExpiration));
  return true;
}
exports.saveTokenData = saveTokenData;
