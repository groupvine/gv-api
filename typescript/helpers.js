"use strict";
exports.__esModule = true;
exports.GvApiMakeRequest = exports.GvApiGenerateHash = void 0;
var sha256 = require("crypto-js/sha256.js");
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
