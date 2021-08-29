"use strict";
exports.__esModule = true;
exports.GvApiErrorCodes = exports.GvApiRequest = exports.GvApiAuth = exports.GvApiError = exports.GvApiConstants = void 0;
exports.GvApiConstants = {
    apiVersion: "1.0",
    apiAuthTooLate_s: 30 * 60,
    apiAuthTooEarly_s: 30 * 60
};
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
        this.version = exports.GvApiConstants.apiVersion;
        Object.keys(data).map(function (x) { _this[x] = data[x]; });
    }
    return GvApiRequest;
}());
exports.GvApiRequest = GvApiRequest;
exports.GvApiErrorCodes = {
    //
    // General envelope API errors
    //
    ServerException: 100,
    MissingMsgBody: 101,
    MissingAPIVersion: 102,
    InvalidAPIVersion: 103,
    MissingAuthentication: 110,
    MissingAuthenticationDate: 111,
    MissingAuthenticationHash: 112,
    InvalidAuthDateFormat: 113,
    EarlyAuthDate: 114,
    StaleAuthDate: 115,
    //
    // Context/storage dependent
    //
    NonAdvancedAuthDate: 120,
    AccountAuthKeyIsNull: 121,
    FailedAuthentication: 122,
    //
    // Generic API type and data errors
    //
    UnknownRequestType: 150,
    InvalidRequestData: 151,
    //
    // GroupVine 3rd-party management API
    //
    // Import-specific errors
    InvalidImportData: 300,
    // Export-specific errors
    InvalidExportData: 310
};
