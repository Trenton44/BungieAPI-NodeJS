const path = require("path");
const root = path.join(__dirname,'..');

const webpageRoot = root+"/client_files";
const serverRoot = root+"/server_files";
const assetRoot = root+"/asset_files";
const manifestRoot = root+"/manifest_files";

const bungieRoot = "https://www.bungie.net/Platform";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";
const bungieCommon = "https://www.bungie.net";

const axios = require('axios');
const https = require("https");
const fs = require('fs');
const dotenv = require("dotenv");
const crypto = require("crypto");

const D2ManifestVersion = require(root+"/ManifestVersion.json");
const D2Components = require(serverRoot+"/D2Components.js");
const D2Responses = require(serverRoot+"/D2APIResponseObjects.js");

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
dotenv.config( { path: path.join(root,"process.env") } );

async function getBnetInfo(request, response, next){
  var path = bungieRoot+"/User/GetMembershipsForCurrentUser/";
  var access_token = decryptData(request.session.data.tokenData).access_token;
  let result = await getRequestAuth(path, access_token).catch(function(error){ next(new D2Responses.APIError(error)); });
  request.session.data.bnetInfo = parseBnetInfo(result.data.Response);
  next();
};
exports.getBnetInfo = getBnetInfo;

function parseBnetInfo(data){
  var info = {};
  for(i in data.destinyMemberships){
    var temp = data.destinyMemberships[i];
    info[temp.membershipId] = temp;
  }
  info.primaryMembershipId = data.primaryMembershipId;
  info.bnetUser = data.bungieNetUser;
  return info;
};

async function characterComponentRequest(request, components, characterID){
  var path = buildComponentPath(request);
  var params = constructComponentString(components);

  var path = path+"Character/"+characterID+"/"+"?"+params;
  var access_token = decryptData(request.session.data.tokenData).access_token;
  let result = await getRequestAuth(path, access_token).catch(function(error){ throw new D2Responses.APIError(error); });

  result = new D2Responses.APIResponse(result);
  result.parseDataComponents();
  if(result.data.itemComponents !== undefined) { result.data = combineItemsInstanceData(result.data); }
  return result;
};
exports.characterComponentRequest = characterComponentRequest;

async function profileComponentRequest(request, components){
  var path = buildComponentPath(request);
  var params = constructComponentString(components);

  path = path+"?"+params;
  var access_token = decryptData(request.session.data.tokenData).access_token;
  let result = await getRequestAuth(path,access_token).catch(function(error){ throw new D2Responses.APIError(error); });
  result = new D2Responses.APIResponse(result);
  result.parseDataComponents();
  return result;
};
exports.profileComponentRequest = profileComponentRequest;

function buildComponentPath(request){
  var bnetInfo = request.session.data.bnetInfo;
  var membershipType = bnetInfo[bnetInfo.primaryMembershipId].membershipType;
  var profileID = bnetInfo.primaryMembershipId;
  var path = bungieRoot+"/Destiny2/"+membershipType+"/Profile/"+profileID+"/";
  return path;
};
//used to parse incoming component data from the bungie api.
//Requires the list of components used in the api request, and the data returned from said request.
//sends component data to prebuilt functions, which structure the data and return it here afterwards.

async function lockCharacterItem(request){
  var bnetInfo = request.session.data.bnetInfo;
  var membershipType = bnetInfo[bnetInfo.primaryMembershipId].membershipType;
  var path = bungieRoot+"/Destiny2/Actions/Items/SetLockState/";
  var body = JSON.stringify({
    characterId: request.body.characterReceiving,
    itemId: request.body.itemInstanceId,
    membershipType: memType,
    state: !request.body.item.lockState,
  });
  var access_token = decryptData(request.session.data.tokenData).access_token;
  let result = await postRequest(path, body, access_token).catch(function(error){ throw new D2Responses.APIError(error); });
  return "Successfully locked item.";
};
exports.lockCharacterItem = lockCharacterItem;

async function transferFromVault(request){
  console.log("transferring to character from vault");
  var path = bungieRoot+"/Destiny2/Actions/Items/TransferItem/";
  var access_token = decryptData(request.session.data.tokenData).access_token;
  var body = buildTransferRequestBody(request);
  body.characterId = request.body.characterReceiving;
  body.transferToVault = false;
  let result = await postRequest(path, body, access_token).catch(function(error){ throw new D2Responses.APIError(error); });
  return "Successfully transferred item to character";
};
exports.transferFromVault = transferFromVault;

async function transferToVault(request){
  console.log("transferring to vault");
  var path = bungieRoot+"/Destiny2/Actions/Items/TransferItem/";
  var access_token = decryptData(request.session.data.tokenData).access_token;
  var body = buildTransferRequestBody(request);
  body.characterId = request.body.characterTransferring;
  body.transferToVault = true;
  let result = await postRequest(path, body, access_token).catch(function(error){ throw new D2Responses.APIError(error); });
  console.log("Successfully transferred item to vault");
  return "Successfully transferred item to vault";
};
exports.transferToVault = transferToVault;

function buildTransferRequestBody(request){
  var bnetInfo = request.session.data.bnetInfo;
  var membershipType = bnetInfo[bnetInfo.primaryMembershipId].membershipType;
  return {
    itemReferenceHash: request.body.itemHash,
    ItemId: request.body.itemInstanceId,
    stackSize:request.body.quantity,
    membershipType: membershipType,
  };
};

async function equipItem(request){
  var bnetInfo = request.session.data.bnetInfo;
  var membershipType = bnetInfo[bnetInfo.primaryMembershipId].membershipType;
  var path = bungieRoot+"/Destiny2/Actions/Items/EquipItem/";
  var body = {
    characterId: request.body.characterReceiving,
    itemId: request.body.item.itemInstanceId,
    membershipType: membershipType,
  };
  var access_token = decryptData(request.session.data.tokenData).access_token;
  let result = await postRequest(path, body, access_token).catch(function(error){ throw new D2Responses.APIError(error); });
  return "Item succesfully Equipped.";
};
exports.equipItem = equipItem;

async function requestToken(request){
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
  }).catch(function(error){ throw new D2Responses.TokenError(error); });
  saveTokenData(request, token.data);
};
exports.requestToken = requestToken;

async function tokenRefresh(request){
  var tokenData = decryptData(request.session.data.tokenData);
  var body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("refresh_token", tokenData.refresh_token);
  body.append("client_secret",process.env.Bungie_ClientSecret);
  body.append("client_id", process.env.Bungie_ClientID);
  let result = await axios({
    method:"POST",
    url: bungieTokURL,
    headers: {"X-API-Key":process.env.Bungie_API_KEY},
    data: body,
  }).catch(function(error){ throw new D2Responses.TokenError(error); });
  saveTokenData(request, result.data);
  return true;
};
exports.tokenRefresh = tokenRefresh;
//Used to overwrite token data currently stored inside the user's cookie.
function saveTokenData(request, tokenData){
  tokenData.tokenExpiration = new Date().getTime()+((tokenData.expires_in)*1000);
  tokenData.refreshExpiration = new Date().getTime()+(tokenData.refresh_expires_in*1000);
  request.session.cookie.maxAge = tokenData.refreshExpiration;
  request.session.data.tokenData = encryptData(tokenData);
  return true;
}
exports.saveTokenData = saveTokenData;

function encryptData(data){
  data = JSON.stringify(data);
  var iv = Buffer.from(crypto.randomBytes(16));
  let cipher = crypto.createCipheriv(process.env.CipherAlgorithm,Buffer.from(process.env.mongopvk,'hex'),iv);
  let encryptedData = cipher.update(data);
  encryptedData = Buffer.concat([encryptedData, cipher.final()]);
  return { iv: iv.toString('hex'),data:encryptedData.toString('hex') };
};

function decryptData(data){
  let iv = Buffer.from(data.iv,'hex');
  let encrypted = Buffer.from(data.data,'hex');
  let decipher = crypto.createDecipheriv(process.env.CipherAlgorithm, Buffer.from(process.env.mongopvk,'hex'), iv);
  let result = decipher.update(encrypted);
  result = Buffer.concat([result,decipher.final()]);
  return JSON.parse(result.toString());
};
exports.decryptData = decryptData;

async function postRequest(path, body, token){
  let result = await axios({
    method:"POST",
    url: path,
    headers: {"X-API-Key":process.env.Bungie_API_KEY, "Authorization":"Bearer "+token},
    data: body,
  }).catch(function(error){ throw error; });
  return result;
};

async function getRequestAuth(path, token){
  let result = await axios({
    method:"GET",
    url: path,
    headers: {"X-API-Key":process.env.Bungie_API_KEY, "Authorization":"Bearer "+token},
  }).catch(function(error){ throw error; });
  return result;
};
async function getRequest(path){
  let result = await axios({
    method:"GET",
    url: path,
    headers: {"X-API-Key":process.env.Bungie_API_KEY},
  }).catch(function(error){ throw error; });
  return result;
};

//When a function takes a list of components as a parameter, this function is called to
//combine those functions into a single search parameter the bungie API can understand.
function constructComponentString(value){
  var params = "";
  for(i in value){
    if(i == value.length-1)
      params+= value[i];
    else
      params+= value[i]+",";
  }
  var parameters = new URLSearchParams();
  parameters.set("components",params);
  return parameters.toString();
};


function combineItemsInstanceData(items){
  for(z in items.itemComponents){
    for(i in items){
      if(i == "itemComponents"){ continue; }
      for(x in items[i]){
        var currentComponent = items.itemComponents[z];
        items[i][x][z] = currentComponent[items[i][x].itemInstanceId];
      }
    }
  }
  return items;
};
//Loads the current d2 manifest from bungie api and saves to root.
async function loadManifest(){
  console.log("Obtaining Manifest");
  var path = bungieRoot+"/Destiny2/Manifest/";
  var version = await getRequest(path).catch(function(error){ return error; });
  if(version instanceof Error) { return version; }
  version = version.Response;
  if(version.version === D2ManifestVersion.version) { return true; }
  console.log("Pulling new manifest version.");
  path = bungieCommon+version.jsonWorldContentPaths.en;
  var result = await getRequest(path).catch(function(error){ return error; });
  if(result instanceof Error) { Promise.reject(result); }
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
  fs.writeFileSync(root+"/ManifestVersion.json", JSON.stringify({version: version.version}), function(error){
    console.error(error);
    return false;
  });
  console.log("Manifest version updated.");
  return true;
};
exports.loadManifest = loadManifest;
