const apiVersion = '1.0';

export const apiErrors = {
    // General envelope API errors
    ServerException           : 100,
    MissingMsgBody            : 101,
    MissingAPIVersion         : 102,
    InvalidAPIVersion         : 103,

    MissingAuthentication     : 110,
    MissingAuthenticationDate : 111,
    MissingAuthenticationHash : 112,
    FailedAuthentication      : 115,

    UnknownRequestType        : 120,

    // Import-specific errors
    InvalidImportData         : 200,

    // Export-specific errors
    InvalidExportData         : 300
}