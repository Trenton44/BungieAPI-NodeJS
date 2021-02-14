const path = require("path");
const root = path.join(__dirname,'..');
const webpageRoot = root+"/Client Files";

const serverRoot = root+"/Server Files";
const assetRoot = root+"/assets";
const manifestRoot = root+"/Manifest";
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

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
dotenv.config( { path: path.join(root,"process.env") } );

async function getBnetInfo(request,response,next){
  console.log("Requesting user's Bnet profile.");
  var path = bungieRoot+"/User/GetMembershipsForCurrentUser/";
  var access_token = decryptData(request.session.data.tokenData).access_token;
  let result = await getRequestAuth(path, access_token).catch(function(error){return error;});
  if(result instanceof Error) { return Promise.reject(result); }
  request.session.data.bnetInfo = parseBnetInfo(result.data.Response);
  console.log("finished bnet profile.");
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
  console.log("finished parsing bnet info");
  return info;
};

async function characterComponentRequest(request, response, components, characterID){
  var path = buildComponentPath(request);
  var params = constructComponentString(components);

  var path = path+"Character/"+characterID+"/"+"?"+params;
  var access_token = decryptData(request.session.data.tokenData).access_token;
  let result = await getRequestAuth(path, access_token).catch(function(error){ return error; });
  if(result instanceof Error) { return Promise.reject(result); }
  console.log("finished character component request.");
  return parseComponents(result.data.Response);
};
exports.characterComponentRequest = characterComponentRequest;

async function profileComponentRequest(request, response, components){
  var path = buildComponentPath(request);
  var params = constructComponentString(components);

  path = path+"?"+params;
  var access_token = decryptData(request.session.data.tokenData).access_token;
  let result = await getRequestAuth(path,access_token).catch(function(error){ return error; });
  if(result instanceof Error) { return Promise.reject(result); }
  console.log("finished profile component request.");
  return parseComponents(result.data.Response);
};
exports.profileComponentRequest = profileComponentRequest;
function buildComponentPath(request){
  var bnetInfo = request.session.data.bnetInfo;
  var membershipType = bnetInfo[bnetInfo.primaryMembershipId].membershipType;
  var profileID = bnetInfo.primaryMembershipId;
  var path = bungieRoot+"/Destiny2/"+membershipType+"/Profile/"+profileID+"/";
  console.log("finished building component path.");
  return path;
};
//used to parse incoming component data from the bungie api.
//Requires the list of components used in the api request, and the data returned from said request.
//sends component data to prebuilt functions, which structure the data and return it here afterwards.
function parseComponents(data){
  var parsedData = {};
  for(i in data){ parsedData[i] = D2Components[i](data[i]); }
  return parsedData;
};

async function lockCharacterItem(request, response){
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
  let result = await postRequest(path, body, access_token).catch(function(error){ return error; });
  if(result instanceof Error) { return Promise.reject(result); }
  return result;
};
exports.lockCharacterItem = lockCharacterItem;

async function transferFromVault(request, response){
  var path = bungieRoot+"/Destiny2/Actions/Items/TransferItem/";
  var access_token = decryptData(request.session.data.tokenData).access_token;
  var body = buildTransferRequestBody(request);
  body.transferToVault = false;
  body.characterId = request.body.characterReceiving;
  let result = await postRequest(path, body, access_token).catch(function(error){ return error; });
  if(result instanceof Error) { return Promise.reject(result); }
  return result;
};
exports.transferFromVault = transferFromVault;

async function transferToVault(request, response){
  var path = bungieRoot+"/Destiny2/Actions/Items/TransferItem/";
  var access_token = decryptData(request.session.data.tokenData).access_token;
  var body = buildTransferRequestBody(request);
  body.transferToVault = true;
  body.characterId = request.body.characterTransferring;
  let result = await postRequest(path, body, access_token).catch(function(error){ return error; });
  if(result instanceof Error) { return Promise.reject(result); }
  return result;
};
exports.transferToVault = transferToVault;

async function transferToCharacter(request, response){
  var path = bungieRoot+"/Destiny2/Actions/Items/TransferItem/";
  var access_token = decryptData(request.session.data.tokenData).access_token;
  var body = buildTransferRequestBody(request);
  body.transferToVault = true;
  body.characterId = request.body.characterTransferring;
  let vaultTransfer = await postRequest(path, body, access_token).catch(function(error){ return error; });
  if(vaultTransfer instanceof Error) { return Promise.reject(vaultTransfer); }
  console.log("Past first transfer.");
  body.transferToVault = false;
  body.characterId = request.body.characterReceiving;
  sleep(500);
  console.log("Past sleep");
  let characterTransfer = await postRequest(path, body, access_token).catch(function(error){ return error; });
  if(characterTransfer instanceof Error) { return Promise.reject(characterTransfer); }
  console.log("Past second transfer.");
  console.log(characterTransfer);
  return characterTransfer;
};
exports.transferToCharacter = transferToCharacter;

function buildTransferRequestBody(request){
  var bnetInfo = request.session.data.bnetInfo;
  var membershipType = bnetInfo[bnetInfo.primaryMembershipId].membershipType;
  return {
    itemReferenceHash: request.body.item.itemHash,
    ItemId: request.body.item.itemInstanceId,
    stackSize:request.body.item.quantity,
    membershipType: membershipType,
  };
};

async function equipItem(request, response){
  var bnetInfo = request.session.data.bnetInfo;
  var membershipType = bnetInfo[bnetInfo.primaryMembershipId].membershipType;
  var path = bungieRoot+"/Destiny2/Actions/Items/EquipItem/";
  var body = {
    characterId: request.body.characterReceiving,
    itemId: request.body.item.itemInstanceId,
    membershipType: membershipType,
  };
  var access_token = decryptData(request.session.data.tokenData).access_token;
  let result = await postRequest(path, body, access_token).catch(function(error){ return error; });
  if(result instanceof Error) { Promise.reject(result); }
  return result.data;
};
exports.equipItem = equipItem;

async function requestToken(request, response){
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
  }).catch(function(error){ return error; });
  if(token instanceof Error) { Promise.reject(token); }
  saveTokenData(request, token.data);
};
exports.requestToken = requestToken;

async function tokenRefresh(request, response){
  var body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("refresh_token", refreshtoken);
  body.append("client_secret",process.env.Bungie_ClientSecret);
  body.append("client_id", process.env.Bungie_ClientID);
  let result = await axios({
    method:"POST",
    url: bungieTokURL,
    headers: {"X-API-Key":process.env.Bungie_API_KEY},
    data: body,
  }).catch(function(error){ return error; });
  if(result instanceof Error) { Promise.reject(result); }
  saveTokenData(request, result.data);
  return true;
};
exports.tokenRefresh = tokenRefresh;
//Used to overwrite token data currently stored inside the user's cookie.
function saveTokenData(request, tokenData){
  tokenData.tokenExpiration = new Date().getTime()+((tokenData.expires_in)*1000); //took 5 minutes off the given expiration time to make sure it updated before actual expiration.
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
  }).catch(function(error){ return error; });
  if(result instanceof Error) { Promise.reject(result); }
  return result;
};

async function getRequestAuth(path, token){
  let result = await axios({
    method:"GET",
    url: path,
    headers: {"X-API-Key":process.env.Bungie_API_KEY, "Authorization":"Bearer "+token},
  }).catch(function(error){ return error; });
  if(result instanceof Error) { Promise.reject(result); }
  return result;
};
async function getRequest(path){
  let result = await axios({
    method:"GET",
    url: path,
    headers: {"X-API-Key":process.env.Bungie_API_KEY},
  }).catch(function(error){ return error; });
  if(result instanceof Error) { Promise.reject(result); }
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

//Loads the current d2 manifest from bungie api and saves to root.
async function loadManifest(){
  console.log("Obtaining Manifest");
  var path = bungieRoot+"/Destiny2/Manifest/";
  var version = await getRequest(path).catch(function(error){ return error; });
  if(result instanceof Error) { Promise.reject(result); }
  version = version.Response;
  console.log(version.version);
  if(result.Response.version === D2ManifestVersion.version) { return true; }
  console.log("Pulling new manifest version.");
  path = bungieCommon+version.jsonWorldContentPaths.en;
  var manifest = await getRequest(path).catch(function(error){ return error; });
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
  fs.writeFileSync(root+"/ManifestVersion.json", JSON.stringify({version: manifestversion}), function(error){
    console.error(error);
    return false;
  });
  console.log("Manifest version updated.");
  return true;
};
exports.loadManifest = loadManifest;
