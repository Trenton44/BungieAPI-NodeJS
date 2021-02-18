const path = require("path");
const root = path.join(__dirname,'..');

const serverRoot = root+"/server_files";
const assetRoot = root+"/asset_files";
const manifestRoot = root+"/manifest_files";

const bungieRoot = "https://www.bungie.net/Platform";
const bungieAuthURL = "https://www.bungie.net/en/OAuth/Authorize";
const bungieTokURL = bungieRoot+"/app/oauth/token/";
const bungieCommon = "https://www.bungie.net";
const D2Components = require(serverRoot+"/D2Components.js");

class TokenError extends Error {
  constructor(error){
    super();
    this.error = error;
  }
  toString(){
    return "Something went wrong while trying to obtain an access token.";
  }
}
exports.TokenError = TokenError;

class APIError extends Error {
  constructor(error){
    super();
    this.status = error.response.status;
    this.errorStatus = error.response.data.ErrorStatus;
    this.code = error.response.data.ErrorCode;
    this.message = error.response.data.Message;
  }
  toString(){
    return "Error "+this.code+": "+this.message;
  }
}
exports.APIError = APIError;
class APIResponse {
  constructor(info){
    this.status = info.status;
    this.code = info.data.ErrorCode;
    this.waitSeconds = info.data.ThrottleSeconds;
    this.message = info.data.Message;
    this.data = info.data.Response;
  }
  setData(value){
    this.data = value;
  }
  parseDataComponents(){
    for(i in this.data)
    { this.data[i] = D2Components[i](this.data[i]); }
  }
  toString(){ return "Status "+this.status+": "+this.message; }
}
exports.APIResponse = APIResponse;
