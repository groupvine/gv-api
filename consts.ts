export const apiVersion = "1.0";

export const apiAuthTooLate_s  = 30 * 60;  // 30 mins
export const apiAuthTooEarly_s = apiAuthTooLate_s;

/* tslint:disable  (pascal case) */
export class apiError {
    code: number;
    message: string;

    constructor (code:number, msg:string) {
        this.code = code;
        this.message = msg;
    }

    toString() {
        `Error code: ${this.code}; "${this.message}"`;
    }
}
/* tslint:enable */

export const apiErrorCodes = {
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

