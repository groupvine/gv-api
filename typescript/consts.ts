export const GvApiConstants = {
    apiVersion        : "1.0",

    apiAuthTooLate_s  : 30 * 60,  // 30 mins
    apiAuthTooEarly_s : 30 * 60
};

export const GvApiErrorCodes = {
    //
    // General envelope API errors
    //

    ServerException           : 100,
    MissingMsgBody            : 101,
    MissingAPIVersion         : 102,
    InvalidAPIVersion         : 103,
    MissingAuthentication     : 110,
    MissingAuthenticationDate : 111,
    MissingAuthenticationHash : 112,
    InvalidAuthDateFormat     : 113,
    EarlyAuthDate             : 114,
    StaleAuthDate             : 115,

    //
    // Context/storage dependent
    //

    NonAdvancedAuthDate       : 120,
    AccountAuthKeyIsNull      : 121,
    FailedAuthentication      : 122,

    //
    // Generic API type and data errors
    //

    UnknownRequestType        : 150,
    InvalidRequestData        : 151,

    //
    // GroupVine 3rd-party management API
    //

    // Import-specific errors
    InvalidImportData         : 300,

    // Export-specific errors
    InvalidExportData         : 310
};

