"use strict";

exports.apiVersion = '1.0';

exports.apiErrors = {
    // General envelope API errors
    ServerException           : 100,
    MissingMsgBody            : 101,
    MissingAPIVersion         : 102,
    InvalidAPIVersion         : 103,

    MissingAuthentication     : 110,
    MissingAuthenticationDate : 111,
    MissingAuthenticationHash : 112,
    InvalidAuthDateFormat     : 113,
    ExpiredAuthDate           : 114,
    TooEarlyAuthDate          : 115,
    FailedAuthentication      : 116,

    UnknownRequestType        : 120,

    // Import-specific errors
    InvalidImportData         : 200,

    // Export-specific errors
    InvalidExportData         : 300
}