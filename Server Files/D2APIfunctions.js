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

//When a function takes a list of components as a parameter, this function is called to
//combine those functions into a single search parameter the bungie API can understand.
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
//GET REQUESTS -----------------------
//Searches for a D2 player account using the given display name
//and return a list of all D2 memberships tied to it.
//https://bungie-net.github.io/multi/operation_get_Destiny2-SearchDestinyPlayer.html#operation_get_Destiny2-SearchDestinyPlayer
function searchD2Player(type,displayName){
  var path = bungieRoot+"/Destiny2/SearchDestinyPlayer/"+type+"/"+displayName+"/";
  return getRequest(path);
};
exports.searchD2Player = searchD2Player;

//obtains bungienet user data by searching for user with given id parameter.
//https://bungie-net.github.io/multi/operation_get_User-GetBungieNetUserById.html#operation_get_User-GetBungieNetUserById
function getBungieUser(id){
  var path = bungieRoot+"/User/GetBungieNetUserById/"+id+"/";
  return getRequest(path);
}
exports.getBungieUser = getBungieUser;

//Obtains a list of accounts associated with the given id and type parameter.
//https://bungie-net.github.io/multi/operation_get_User-GetMembershipDataById.html#operation_get_User-GetMembershipDataById
function getBungieMembershipData(membership_id,memType){
  path = bungieRoot+"/User/GetMembershipsById/"+membership_id+"/"+memType+"/";
  return getRequest(path);
}
exports.getBungieMembershipData = getBungieMembershipData;

//obtains basic bnet user data on the user identified by the token passed in the request.
//Only works for users that have been authorized and given an access token by the bungie API.
//https://bungie-net.github.io/multi/operation_get_User-GetMembershipDataForCurrentUser.html#operation_get_User-GetMembershipDataForCurrentUser
function getBungieCurrentUserData(token){
  var path = bungieRoot+"/User/GetMembershipsForCurrentUser/";
  return getRequestAuth(path,token);
};
exports.getBungieCurrentUserData = getBungieCurrentUserData;

//obtains the static "definition" of an D2 entity, using the type & hash id of the entity.
//Note: beta endpoint according to D2 API, should be used sparingly.
//https://bungie-net.github.io/multi/operation_get_Destiny2-GetDestinyEntityDefinition.html#operation_get_Destiny2-GetDestinyEntityDefinition
function getDestinyEntityDefinition(entityType,hashID){
  path = bungieRoot+"/Destiny2/Manifest/"+entityType+"/"+hashID+"/";
  return getRequest(path);
}
exports.getDestinyEntityDefinition = getDestinyEntityDefinition;
//obtains basic info about any/all profiles linked to given parameters.
//Note: Does not return linked profiles user has specifically set to private.
//Note: Passed ID/type can be of either bnet or D2 membership
//https://bungie-net.github.io/multi/operation_get_Destiny2-GetLinkedProfiles.html#operation_get_Destiny2-GetLinkedProfiles
function getLinkedProfiles(type,membership_id){
  var path =bungieRoot+"/Destiny2/"+type+"/Profile/"+membership_id+"/LinkedProfiles/";
  return getRequest(path);
};
exports.getLinkedProfiles = getLinkedProfiles;
//obtains all requested data on the requested profile.
//Data requested is determined by the components passed into the components parameter.
//https://bungie-net.github.io/multi/operation_get_Destiny2-GetProfile.html#operation_get_Destiny2-GetProfile
function getDestinyProfile(type, d2ID, components){
  var params = combineComponentString(components);
  var path =bungieRoot+"/Destiny2/"+type+"/Profile/"+d2ID+"/"+"?"+params.toString();
  return getRequest(path);
};
exports.getDestinyProfile = getDestinyProfile;

//Functions exactly as getDestinyProfile(), however, it also passes the access token as an
//authentication for the bungie API.
//https://bungie-net.github.io/multi/operation_get_Destiny2-GetProfile.html#operation_get_Destiny2-GetProfile
function getDestinyProfileAuth(type, d2ID, components, token){
  var params = combineComponentString(components);
  var path =bungieRoot+"/Destiny2/"+type+"/Profile/"+d2ID+"/"+"?"+params.toString();
  return getRequestAuth(path,token);
};
exports.getDestinyProfileAuth = getDestinyProfileAuth;
//obtains all requested info on the corresponding character ID of the passed profile
//Note: Info requested is determined by the components parameter.
function getCharacter(type, d2ID,characterID,components){
  var path = bungieRoot+"/Destiny2/"+type+"/Profile/"+d2ID+"/Character/"+characterID+"/";
  return getRequest(path);
};
exports.getCharacter = getDestinyProfile;
//obtains requested info of a specific Item in possession of a passed profile.
//Note: Info requested is determined by the components parameter.
function getItem(type, d2ID, itemID, components){
  var params= combineComponentString(components);
  var path = bungieRoot+"/Destiny2/"+type+"/Profile/"+d2ID+"/Item/"+itemID+"/?"+params;
  return getRequest(path);
};
exports.getItem = getItem;

//BASIC REQUESTS
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

//Requests a new access token from the bungie API using an avaiable refresh token.
function tokenRefresh(token){
  console.log("access token expired, requesting a new one");
  var body = new URLSearchParams();
  body.append("grant_type", "refresh_token");
  body.append("refresh_token", token);
  body.append("client_secret",process.env.Bungie_ClientSecret);
  body.append("client_id", process.env.Bungie_ClientID);
  return axios({
    method:"POST",
    url: bungieTokURL,
    headers: {"X-API-Key":process.env.Bungie_API_KEY},
    data: body,
  });
}
exports.tokenRefresh = tokenRefresh;
//Requests an access token from the bungie API, using application credentials obtained via bungie
async function tokenRequest(request){
  request.session.data.tokenData.access_token = "sorry bungi, i just wanna see what this error returns.";
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

//Parses data of requests made to bungie API endpoints that return bnet user information.
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

//Loads the current d2 manifest from bungie api and saves to root.
//Note: the manifest file as a whole is large enough to crash notepad,
//so this splits each piece of the manifest into it's own json file so it can be
//read, but also saves it as a whole json so it is easy to import into code later.
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

//used to parse incoming component data from the bungie api.
//Requires the list of components used in the api request, and the data returned from said request.
//sends component data to prebuilt functions, which structure the data and return it here afterwards.
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

//Used to overwrite token data currently stored inside the user's cookie. 
function saveTokenData(request, tokenData){
  request.session.data.tokenData = tokenData;
  request.session.data.tokenData.tokenExpiration = new Date().getTime()+(tokenData.expires_in*1000);
  request.session.data.tokenData.refreshExpiration = new Date().getTime()+(tokenData.refresh_expires_in*1000);
  console.log("New token expiration date: "+new Date(request.session.data.tokenData.tokenExpiration));
  console.log("New refresh expiration date: "+new Date(request.session.data.tokenData.refreshExpiration));
  return true;
}
exports.saveTokenData = saveTokenData;
