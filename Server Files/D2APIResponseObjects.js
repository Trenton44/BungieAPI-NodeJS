class APIError extends Error {
  constructor(data){
    super();
    this.status = data.response.status;
    this.errorStatus = data.response.data.ErrorStatus;
    this.code = data.response.data.ErrorCode;
    this.message = data.response.data.Message;
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
  toString(){
    return "Status "+this.status+": "+this.message;
  }
}
exports.APIResponse = APIResponse;
