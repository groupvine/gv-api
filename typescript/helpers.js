"use strict";
exports.__esModule = true;
exports.GvApiMakeRequest = exports.GvApiGenerateHash = exports.GvApiRequest = exports.GvApiAuth = exports.GvApiError = void 0;
var sha256 = require("crypto-js/sha256.js");
var consts_1 = require("./consts");
// Examples:
//   rqstType:    'import', 'export', ...
//   rqstId:      Arbitrary information to identify this request, included in response
//   context:     account abbreviation
//   contextKey:  secret apiKey for this account
//   data:        Relevant data object
var GvApiError = /** @class */ (function () {
    function GvApiError(code, msg) {
        this.code = code;
        this.message = msg;
    }
    GvApiError.prototype.toString = function () {
        "Error code: " + this.code + "; \"" + this.message + "\"";
    };
    return GvApiError;
}());
exports.GvApiError = GvApiError;
var GvApiAuth = /** @class */ (function () {
    function GvApiAuth(date, hash) {
        this.date = date;
        this.hash = hash;
    }
    return GvApiAuth;
}());
exports.GvApiAuth = GvApiAuth;
var GvApiRequest = /** @class */ (function () {
    function GvApiRequest(data) {
        var _this = this;
        this.version = consts_1.GvApiConstants.apiVersion;
        Object.keys(data).map(function (x) { _this[x] = data[x]; });
    }
    return GvApiRequest;
}());
exports.GvApiRequest = GvApiRequest;
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
    var resp = new GvApiRequest({
        request: rqstType,
        requestId: rqstId,
        auth: new GvApiAuth(date, hash),
        data: rqstData
    });
    return resp;
}
exports.GvApiMakeRequest = GvApiMakeRequest;
