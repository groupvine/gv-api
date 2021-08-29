"use strict";
exports.__esModule = true;
exports.GvApiMakeResponse = exports.GvApiIsInvalidRequest = exports.GvApiMakeRequest = exports.GvApiGenerateHash = void 0;
var sha256 = require("crypto-js/sha256.js");
var moment = require("moment");
var consts_1 = require("./consts");
// Examples:
//   rqstType:    'import', 'export', ...
//   rqstId:      Arbitrary information to identify this request, included in response
//   context:     account abbreviation
//   contextKey:  secret apiKey for this account
//   data:        Relevant data object
function GvApiGenerateHash(context, contextKey, date) {
    return sha256(context.trim().toLowerCase() + contextKey.trim() + date.trim()).toString();
}
exports.GvApiGenerateHash = GvApiGenerateHash;
function GvApiMakeRequest(rqstType, rqstId, context, contextKey, rqstData) {
    if (!rqstType || !context || !contextKey) {
        throw new Error("Invalid GvApiMakeRequest() attempt.  rqstType, context, and contextKey all required");
    }
    var date = (new Date()).toISOString();
    var hash = GvApiGenerateHash(context, contextKey, date);
    var resp = new consts_1.GvApiRequest({
        request: rqstType,
        requestId: rqstId,
        auth: new consts_1.GvApiAuth(date, hash),
        data: rqstData
    });
    return resp;
}
exports.GvApiMakeRequest = GvApiMakeRequest;
// Returns GvApiError object on error, else null
function GvApiIsInvalidRequest(rqstObj) {
    if (rqstObj.version == null) {
        return new consts_1.GvApiError(consts_1.GvApiErrorCodes.MissingAPIVersion, "Missing API version field");
    }
    if (rqstObj.version !== consts_1.GvApiConstants.apiVersion) {
        return new consts_1.GvApiError(consts_1.GvApiErrorCodes.InvalidAPIVersion, "API version " + rqstObj.version + " is unsupported; currently on version " + consts_1.GvApiConstants.apiVersion);
    }
    var auth = rqstObj.auth;
    //
    // Authentication object check
    //
    if (auth == null) {
        return new consts_1.GvApiError(consts_1.GvApiErrorCodes.MissingAuthentication, "Missing authentication object");
    }
    if (auth.date == null) {
        return new consts_1.GvApiError(consts_1.GvApiErrorCodes.MissingAuthenticationDate, "Missing authentication date");
    }
    if (auth.hash == null) {
        return new consts_1.GvApiError(consts_1.GvApiErrorCodes.MissingAuthenticationHash, "Missing authentication hash");
    }
    //
    // Date check
    //
    var date = moment(auth.date);
    if (!date.isValid()) {
        return new consts_1.GvApiError(consts_1.GvApiErrorCodes.InvalidAuthDateFormat, "Unable to parse authentication date");
    }
    var now = moment();
    var early = date.clone().subtract(consts_1.GvApiConstants.apiAuthTooEarly_s, "seconds");
    // If the date plus 1 min is still before now, then it's too early
    if (now.isBefore(early)) {
        return new consts_1.GvApiError(consts_1.GvApiErrorCodes.EarlyAuthDate, "Authentication date is too early");
    }
    var late = date.clone().add(consts_1.GvApiConstants.apiAuthTooLate_s, "seconds");
    // If the date minus 1 min is still after now, then it's too stale
    if (now.isAfter(late)) {
        return new consts_1.GvApiError(consts_1.GvApiErrorCodes.StaleAuthDate, "Authentication has expired");
    }
    // Following this, still need to check:
    //   auth.date is advancing from prior API call
    //   auth.hash matches based on context's api key
    return null;
}
exports.GvApiIsInvalidRequest = GvApiIsInvalidRequest;
function GvApiMakeResponse(rqstType, rqstId, respData, errObj) {
    return {
        version: consts_1.GvApiConstants.apiVersion,
        request: rqstType,
        requestId: rqstId,
        data: respData,
        error: errObj != null ? errObj : null
    };
}
exports.GvApiMakeResponse = GvApiMakeResponse;
