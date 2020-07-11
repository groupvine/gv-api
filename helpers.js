"use strict";
exports.__esModule = true;
exports.apiMakeResponse = exports.apiIsInvalidRequest = exports.apiMakeRequest = exports.apiGenerateHash = void 0;
var sha256 = require("crypto-js/sha256.js");
var moment = require("moment-timezone");
var consts_1 = require("./consts");
// Examples:
//   rqstType:    'import', 'export', ...
//   rqstId:      Arbitrary information to identify this request, included in response
//   context:     account abbreviation
//   contextKey:  secret apiKey for this account
//   data:        Relevant data object
function apiGenerateHash(context, contextKey, date) {
    return sha256(context.trim().toLowerCase() + contextKey.trim() + date.trim()).toString();
}
exports.apiGenerateHash = apiGenerateHash;
function apiMakeRequest(rqstType, rqstId, context, contextKey, rqstData) {
    if (!rqstType || !context || !contextKey) {
        throw new Error("Invalid apiMakeRequest() attempt.  rqstType, context, and contextKey all required");
    }
    var date = (new Date()).toISOString();
    var hash = apiGenerateHash(context, contextKey, date);
    return {
        version: consts_1.apiVersion,
        request: rqstType,
        requestId: rqstId,
        auth: {
            date: date,
            hash: hash
        },
        data: rqstData
    };
}
exports.apiMakeRequest = apiMakeRequest;
// Returns apiError object on error, else null
function apiIsInvalidRequest(rqstObj) {
    if (rqstObj.version == null) {
        return new consts_1.apiError(consts_1.apiErrorCodes.MissingAPIVersion, "Missing API version field");
    }
    if (rqstObj.version !== consts_1.apiVersion) {
        return new consts_1.apiError(consts_1.apiErrorCodes.InvalidAPIVersion, "API version " + rqstObj.version + " is unsupported; currently on version " + consts_1.apiVersion);
    }
    var auth = rqstObj.auth;
    //
    // Authentication object check
    //
    if (auth == null) {
        return new consts_1.apiError(consts_1.apiErrorCodes.MissingAuthentication, "Missing authentication object");
    }
    if (auth.date == null) {
        return new consts_1.apiError(consts_1.apiErrorCodes.MissingAuthenticationDate, "Missing authentication date");
    }
    if (auth.hash == null) {
        return new consts_1.apiError(consts_1.apiErrorCodes.MissingAuthenticationHash, "Missing authentication hash");
    }
    //
    // Date check
    //
    var date = moment(auth.date);
    if (!date.isValid()) {
        return new consts_1.apiError(consts_1.apiErrorCodes.InvalidAuthDateFormat, "Unable to parse authentication date");
    }
    var now = moment();
    var early = date.clone().subtract(consts_1.apiAuthTooEarly_s);
    // If the date plus 1 min is still before now, then it's too early
    if (now.isBefore(early)) {
        return new consts_1.apiError(consts_1.apiErrorCodes.EarlyAuthDate, "Authentication date is too early");
    }
    var late = date.clone().add(consts_1.apiAuthTooLate_s);
    // If the date minus 1 min is still after now, then it's too stale
    if (now.isAfter(late)) {
        return new consts_1.apiError(consts_1.apiErrorCodes.StaleAuthDate, "Authentication has expired");
    }
    // Following this, still need to check:
    //   auth.date is advancing from prior API call
    //   auth.hash matches based on context's api key
    return null;
}
exports.apiIsInvalidRequest = apiIsInvalidRequest;
function apiMakeResponse(rqstType, rqstId, respData, errObj) {
    return {
        version: consts_1.apiVersion,
        request: rqstType,
        requestId: rqstId,
        data: respData,
        error: errObj != null ? errObj : null
    };
}
exports.apiMakeResponse = apiMakeResponse;
