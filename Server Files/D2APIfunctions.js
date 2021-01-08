const dotenv = require("dotenv");
const ospath = require("path");
const root = ospath.join(__dirname,"..\\");
dotenv.config( { path: ospath.join(root,"process.env") } );
const axios = require('axios');
const https = require("https");
const fs = require('fs');
const D2Components = require("./D2components");
const DestinyEntities = require("./D2components").Entities;
const DestinyComponentType = require("./D2components").DestinyComponentType;

const bungieRoot = "https://www.bungie.net/Platform";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";
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

function getManifest(type,membership_id){
  var path =bungieRoot+"/Destiny2/Manifest/";
  return getRequest(path);
};
exports.getManifest = getManifest;
/////////
//EVERYTHING ABOVE THIS HAS BEEN RAN AND HAS HAD A SUCCESSFUL RETURN RESULT
////////
function getBungieUser(bungieID){
  var path = bungieRoot+"/User/GetBungieNetUserById/"+bungieID+"/";
  return getRequest(path);
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
    body: body
  });
}
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
  var body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("refresh_token", token);
  let request = await axios({
    method:"POST",
    url: bungieTokURL,
    headers: {"X-API-Key":process.env.Bungie_API_KEY},
    body: body
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
