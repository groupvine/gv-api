"use strict";
exports.__esModule = true;
exports.apiErrorCodes = exports.apiError = exports.apiAuthTooEarly_s = exports.apiAuthTooLate_s = exports.apiVersion = void 0;
exports.apiVersion = "1.0";
exports.apiAuthTooLate_s = 30 * 60; // 30 mins
exports.apiAuthTooEarly_s = exports.apiAuthTooLate_s;
/* tslint:disable  (pascal case) */
var apiError = /** @class */ (function () {
    function apiError(code, msg) {
        this.code = code;
        this.message = msg;
    }
    apiError.prototype.toString = function () {
        "Error code: " + this.code + "; \"" + this.message + "\"";
    };
    return apiError;
}());
exports.apiError = apiError;
/* tslint:enable */
exports.apiErrorCodes = {
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
