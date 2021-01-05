const dotenv = require("dotenv");
const path = require("path");
const root = path.join(__dirname,"..\\");
dotenv.config( { path: path.join(root,"process.env") } );
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
async function searchD2Player(type,displayName){
  var path = bungieRoot+"/Destiny2/SearchDestinyPlayer/"+type+"/"+displayName+"/";
  let data = await getRequest(path);
  return Object.assign(DestinyEntities.UserInfoCard, data.data.Response[0]);
};
exports.searchD2Player = searchD2Player;

async function getManifest(type,membership_id){
  var path =bungieRoot+"/Destiny2/Manifest/";
  let data = await getRequest(path);
  return data.data;
};
exports.getManifest = getManifest;
/////////
//EVERYTHING ABOVE THIS HAS BEEN RAN AND HAS HAD A SUCCESSFUL RETURN RESULT
////////
async function getBungieUser(bungieID){
  path = bungieRoot+"/User/GetBungieNetUserById/"+bungieID+"/";
  let data = await getRequest(path);
  return data;
}
exports.getBungieUser = getBungieUser;
async function searchBungieuser(bungieID){
  path = bungieRoot+"/User/SearchUsers/?"+bungieID;
  let data = await getRequest(path);
  return data;
}
exports.searchBungieuser = searchBungieuser;
async function getCredentialsforAccount(membership_id){
  path = bungieRoot+"/User/GetCredentialTypesForTargetAccount/"+membership_id+"/";
  let data = await getRequest(path);
  return data;
}
exports.getCredentialsforAccount = getCredentialsforAccount;
async function getThemesAvailable(membership_id){
  path = bungieRoot+"/User/GetAvailableThemes/";
  let data = await getRequest(path);
  return data;
}
exports.getThemesAvailable = getThemesAvailable;
async function getBungieMembershipData(membership_id,memType){
  path = bungieRoot+"/User/GetMembershipsById/"+membership_id+"/"+memType+"/";
  let data = await getRequest(path);
  return data;
}
exports.getBungieMembershipData = getBungieMembershipData;
async function getBungieCurrentUserData(){
  path = bungieRoot+"/User/GetMembershipsForCurrentUser/";
  let data = await getRequest(path);
  return data;
}
exports.getBungieCurrentUserData = getBungieCurrentUserData;
async function getBungieMemberDataviaCredential(crType,credential){
  path = bungieRoot+"/User/GetMembershipFromHardLinkedCredential/"+crType+"/"+credential+"/";
  let data = await getRequest(path);
  return data;
}
exports.getBungieMemberDataviaCredential = getBungieMemberDataviaCredential;
async function getDestinyEntityDefinition(entityType,hashID){
  path = bungieRoot+"/Destiny2/Manifest/"+entityType+"/"+hashID+"/";
  let data = await getRequest(path);
  return data;
}
exports.getDestinyEntityDefinition = getDestinyEntityDefinition;
async function getLinkedProfiles(type,membership_id){
  var path =bungieRoot+"/Destiny2/"+type+"/Profile/"+membership_id+"/LinkedProfiles/";
  let data = await getRequest(path);
  return Object.assign(DestinyEntities.LinkedProfilesResponse, data.data.Response);
};
exports.getLinkedProfiles = getLinkedProfiles;
async function getDestinyProfile(type, d2ID, components){
  var params = combineComponentString(components);
  var path =bungieRoot+"/Destiny2/"+type+"/Profile/"+d2ID+"/"+"?"+parameters.toString();
  let data = await getRequest(path);
  return Object.assign(DestinyEntities.DestinyProfileResponse, data.data.Response[0]);
};
exports.getDestinyProfile = getDestinyProfile;

async function getCharacter(type, d2ID,characterID,components){
  var path = bungieRoot+"/Destiny2/"+type+"/Profile/"+d2ID+"/Character/"+characterID+"/";
  let data = await getRequest(path);
  return Object.assign(DestinyEntities.DestinyCharacterResponse, data.data.Response[0]);
};
exports.getCharacter = getDestinyProfile;

async function getItem(type, d2ID, itemID, components){
  var params= combineComponentString(components);
  var path = bungieRoot+"/Destiny2/"+type+"/Profile/"+d2ID+"/Item/"+itemID+"/?"+params;
  let data = await getRequest(path);
  return Object.assign(DestinyEntities.DestinyItemResponse, data.data.Response[0]);
};
exports.getItem = getItem;
//Requests of the POST Type.

async function postRequest(path,body,token){
  let request = await axios({
    method:"POST",
    url: path,
    headers: {"X-API-Key":process.env.Bungie_API_KEY, "Authorization":"Bearer "+token},
    body: body
  });
  return request;
}
async function getRequest(path){
  let request = await axios({
    method:"GET",
    url: path,
    headers: {"X-API-Key":process.env.Bungie_API_KEY},
  });
  return request;
};


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
