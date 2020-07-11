import * as sha256       from "crypto-js/sha256.js";
import * as moment       from "moment-timezone";

import { apiVersion,
         apiErrorCodes,
         apiAuthTooEarly_s,
         apiAuthTooLate_s,
         apiError } from "./consts";

// Examples:
//   rqstType:    'import', 'export', ...
//   rqstId:      Arbitrary information to identify this request, included in response
//   context:     account abbreviation
//   contextKey:  secret apiKey for this account
//   data:        Relevant data object

export function apiGenerateHash (context: string, contextKey: string, date: string) {
    return sha256(context.trim().toLowerCase() + contextKey.trim() + date.trim());
}

export function apiMakeRequest(rqstType: string, rqstId: string,
                               context: string, contextKey: string, rqstData: any) {
    let date = (new Date()).toISOString();

    let hash = apiGenerateHash(context, contextKey, date);

    return {
        version   : apiVersion,

        request   : rqstType,
        requestId : rqstId,

        auth : {
            date : date,
            hash : hash
        },

        data : rqstData
    };
}

// Returns apiError object on error, else null
export function apiIsInvalidRequest(rqstObj: any): apiError {

    if (rqstObj.version == null) {
        return new apiError(apiErrorCodes.MissingAPIVersion,
                            "Missing API version field");
    }

    if (rqstObj.version !== apiVersion) {
        return new apiError(apiErrorCodes.InvalidAPIVersion,
                            `API version ${rqstObj.version} is unsupported; currently on version ${apiVersion}`);
    }

    let auth = rqstObj.auth;

    //
    // Authentication object check
    //

    if (auth == null) {
        return new apiError(apiErrorCodes.MissingAuthentication,
                            "Missing authentication object");
    }

    if (auth.date == null) {
        return new apiError(apiErrorCodes.MissingAuthenticationDate,
                            "Missing authentication date");
    }

    if (auth.hash == null) {
        return new apiError(apiErrorCodes.MissingAuthenticationHash,
                            "Missing authentication hash");
    }

    //
    // Date check
    //


    let date = moment(auth.date);

    if (! date.isValid()) {
        return new apiError(apiErrorCodes.InvalidAuthDateFormat,
                            "Unable to parse authentication date");
    }

    let now = moment();

    let early = date.clone().subtract(apiAuthTooEarly_s);

    // If the date plus 1 min is still before now, then it's too early
    if (now.isBefore(early)) {
        return new apiError(apiErrorCodes.EarlyAuthDate,
                            "Authentication date is too early");
    }

    let late = date.clone().add(apiAuthTooLate_s);

    // If the date minus 1 min is still after now, then it's too stale
    if (now.isAfter(late)) {
        return new apiError(apiErrorCodes.StaleAuthDate,
                            "Authentication has expired");
    }

    // Following this, still need to check:
    //   auth.date is advancing from prior API call
    //   auth.hash matches based on context's api key

    return null;
}


export function apiMakeResponse(rqstType: string, rqstId: string, respData: any, errObj?: apiError) {
    return {
        version   : apiVersion,

        request   : rqstType,
        requestId : rqstId,

        data      : respData,
        error     : errObj != null ? errObj : null
    };
}



