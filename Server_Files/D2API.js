const path = require("path");
const root = path.join(__dirname,'..');

const webpageRoot = root+"/Client_Files";
const serverRoot = root+"/Server_Files";
const assetRoot = root+"/Asset_Files";
const manifestRoot = root+"/Manifest_Files";

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
const DestinyInventoryBucketDefinition = require(manifestRoot+"/DestinyInventoryBucketDefinition.json");
const D2Enums = require(serverRoot+"/D2Enums.js");
const ServerResponses = require(serverRoot+"/Server_Responses.js");

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
  result.data = parseDataComponents(result.data);
  if(result.data.itemComponents !== undefined) { result.data = combineItemsInstanceData(result.data); }
  return result;
};
exports.characterComponentRequest = characterComponentRequest;

async function profileComponentRequest(request, components){
  var path = buildComponentPath(request);
  var params = constructComponentString(components);

  path = path+"?"+params;
  var access_token = decryptData(request.session.data.tokenData).access_token;
  let result = await getRequestAuth(path, access_token).catch(function(error){ throw new D2Responses.APIError(error); });
  result = new D2Responses.APIResponse(result);
  result.data = parseDataComponents(result.data);
  return result;
};
exports.profileComponentRequest = profileComponentRequest;

function parseDataComponents(data){
  for(i in data){ data[i] = D2Components[i](data[i]); }
  return data;
}
exports.parseDataComponents = parseDataComponents;

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
async function generalHistoricalStats(request){
  var bnetInfo = request.session.data.bnetInfo;
  var profileID = bnetInfo.primaryMembershipId;
  var membershipType = bnetInfo[bnetInfo.primaryMembershipId].membershipType;
  var parameters = new URLSearchParams();
  parameters.set("groups", "General");
  var path = bungieRoot+"/Destiny2/"+membershipType+"/Account/"+profileID+"/Stats/"+"?"+parameters.toString();
  var access_token = decryptData(request.session.data.tokenData).access_token;
  let result = await getRequestAuth(path, access_token).catch(function(error){ throw new D2Responses.APIError(error); });
  result = new D2Responses.APIResponse(result);
  return result;
}
exports.generalHistoricalStats = generalHistoricalStats;
async function specificHistoricalStats(request){
  var bnetInfo = request.session.data.bnetInfo;
  var profileID = bnetInfo.primaryMembershipId;
  var membershipType = bnetInfo[bnetInfo.primaryMembershipId].membershipType;
  var params = new URLSearchParams();
  params.set("dayend","2018-09-13");
  params.set("daystart","2018-08-13");
  params.set("groups","General");
  params.set("modes", D2Enums.ActivityModeType[request.params.mode]); //
  var path = bungieRoot+"/Destiny2/"+membershipType+"/Account/"+profileID+"/Character/"+request.params.character+"/Stats/?"+params.toString();
  var access_token = decryptData(request.session.data.tokenData).access_token;
  let result = await getRequestAuth(path, access_token).catch(function(error){ console.log(error); throw new D2Responses.APIError(error); });
  return result;
}
exports.specificHistoricalStats = specificHistoricalStats;

async function getActivityHistory(request){
  var bnetInfo = request.session.data.bnetInfo;
  var profileID = bnetInfo.primaryMembershipId;
  var membershipType = bnetInfo[bnetInfo.primaryMembershipId].membershipType;
  var params = new URLSearchParams();
  params.set("count", "100");
  params.set("mode",D2Enums.ActivityModeType[request.params.mode]);
  params.set("page", request.params.page);
  var path = bungieRoot+"/Destiny2/"+membershipType+"/Account/"+profileID+"/Character/"+request.params.character+"/Stats/Activities/?"+params.toString();
  var access_token = decryptData(request.session.data.tokenData).access_token;
  let result = await getRequestAuth(path, access_token).catch(function(error){ console.log(error); throw new D2Responses.APIError(error); });
  return result;
};
exports.getActivityHistory = getActivityHistory;

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
  console.log(body);
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
  console.log(body);
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
  request.session.data.membership_id = tokenData.membership_id;
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

function appendEquipmentToInventory(equipment, inventory){
  for(i in equipment){
    for(z in equipment[i]){
      inventory[i].push(equipment[i][z]);
    }
  }
  return inventory;
};
exports.appendEquipmentToInventory = appendEquipmentToInventory;

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
exports.combineItemsInstanceData = combineItemsInstanceData;
function appendInstanceData(inventory, instancedata){
  for(i in inventory){
    for(z in inventory[i]){
      if(inventory[i][z].itemInstanceId !== undefined){
        inventory[i][z].instanceData = instancedata[inventory[i][z].itemInstanceId];
      }
    }
  }
  return inventory;
}
exports.appendInstanceData = appendInstanceData;

function filterAlteredData(stored, data){
  var changedData = [];
  var uninstanced = [];
  var newstored = {};
  var newdata = {};
  for(i in stored){
    if(stored[i].itemInstanceId !== undefined){
      newstored[stored[i].itemInstanceId] = stored[i];
    }
  }
  for(i in data){
    if(data[i].itemInstanceId !== undefined){
      newdata[data[i].itemInstanceId] = data[i];
    }
    else {
      uninstanced.push(data[i]);
    }
  }
  for(i in newstored){
    if(newdata[i] === undefined){
      console.log("item has been removed");
      var temp = Object.assign({},newstored[i]);
      temp.changed = false;
      changedData.push(temp);
    }
    else {
      if(JSON.stringify(newdata[i]) !== JSON.stringify(newstored[i])){
        console.log("item has been altered");
        var temp = Object.assign({},newdata[i]);
        temp.changed = null;
        changedData.push(temp);
      }
    }
  }
  for(i in newdata){
    if(newstored[i] === undefined){
      console.log("item has been added");
      var temp = Object.assign({},newdata[i]);
      temp.changed = true;
      changedData.push(temp);
    }

  }
  return [uninstanced, changedData];
}
exports.filterAlteredData = filterAlteredData;
function sortByBucketCategory(items){
  var itemscopy = Array.from(items);
  var bucketCategory = {
    Invisible:[],
    Item:[],
    Currency:[],
    Equippable:[],
    Ignored:[],
  };
  for(i in itemscopy){
    var bucket = D2Enums.BucketCategory[itemscopy[i].bucketHashData.category];
    bucketCategory[bucket].push(itemscopy[i]);
  }
  return bucketCategory;
};
exports.sortByBucketCategory = sortByBucketCategory;

function bucketHashSort(items){
  var sortedEquipment = {};
  for(i in items){
    var buckethash = items[i].bucketHash;
    var bucketname = DestinyInventoryBucketDefinition[buckethash].displayProperties.name;
    if(bucketname === undefined){
      bucketname = buckethash;
    }
    else {
      bucketname = bucketname.split(" ").join("");
      bucketname = String(bucketname);
    }
    if(sortedEquipment[bucketname] == undefined)
      { sortedEquipment[bucketname] = []; }
    var template = ServerResponses.DestinyItemTypes[bucketname];
    if(template == undefined){ template = ServerResponses.DestinyItemTypes.default; }
    items[i].HTMLTemplate = ServerResponses[template](items[i]);
    sortedEquipment[bucketname].push(items[i]);
  }
  return sortedEquipment;
};
exports.bucketHashSort = bucketHashSort;

function sortByLocation(items){
  var itemscopy = Array.from(items);
  var location = {
    Unknown: [],
    Inventory: [],
    Vault: [],
    Vendor: [],
    Postmaster: [],
  };
  for(i in itemscopy){
    var locationindex = D2Enums.ItemLocation[itemscopy[i].location];
    location[locationindex].push(itemscopy[i]);
  }
  return location;
};
exports.sortByLocation = sortByLocation;

function sortByBucketTypeHash(items){
  var sortedEquipment = {};
  for(i in items){
    var bucketTypeHash = items[i].itemHashData.inventory.bucketTypeHash;
    var bucketname = DestinyInventoryBucketDefinition[bucketTypeHash].displayProperties.name;
    if(bucketname === undefined){
      bucketname = bucketTypeHash;
    }
    else {
      bucketname = bucketname.split(" ").join("");
      bucketname = String(bucketname);
    }
    if(sortedEquipment[bucketname] == undefined)
      { sortedEquipment[bucketname] = []; }
    sortedEquipment[bucketname].push(items[i]);
  }
  return sortedEquipment;
}
exports.sortByBucketTypeHash = sortByBucketTypeHash;
