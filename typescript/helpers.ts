import * as sha256       from "crypto-js/sha256.js";
import * as moment       from "moment";

import { GvApiConstants,
         GvApiErrorCodes,
         GvApiRequest,
         GvApiAuth,
         GvApiError } from "./consts";

// Examples:
//   rqstType:    'import', 'export', ...
//   rqstId:      Arbitrary information to identify this request, included in response
//   context:     account abbreviation
//   contextKey:  secret apiKey for this account
//   data:        Relevant data object

export function GvApiGenerateHash (context: string, contextKey: string, date: string) {
    return sha256(context.trim().toLowerCase() + contextKey.trim() + date.trim()).toString();
}

export function GvApiMakeRequest(rqstType: string, rqstId: string,
                               context: string, contextKey: string, rqstData: any) {
    if (!rqstType || !context || !contextKey) {
        throw new Error("Invalid GvApiMakeRequest() attempt.  rqstType, context, and contextKey all required");
    }

    let date = (new Date()).toISOString();
    let hash = GvApiGenerateHash(context, contextKey, date);

    let resp = new GvApiRequest({
        request   : rqstType,
        requestId : rqstId,
        auth      : new GvApiAuth(date, hash),
        data      : rqstData
    });

    return resp;
}

// Returns GvApiError object on error, else null
export function GvApiIsInvalidRequest(rqstObj: any): GvApiError {

    if (rqstObj.version == null) {
        return new GvApiError(GvApiErrorCodes.MissingAPIVersion,
                              "Missing API version field");
    }

    if (rqstObj.version !== GvApiConstants.apiVersion) {
        return new GvApiError(GvApiErrorCodes.InvalidAPIVersion,
                              `API version ${rqstObj.version} is unsupported; currently on version ${GvApiConstants.apiVersion}`);
    }

    let auth = rqstObj.auth;

    //
    // Authentication object check
    //

    if (auth == null) {
        return new GvApiError(GvApiErrorCodes.MissingAuthentication,
                            "Missing authentication object");
    }

    if (auth.date == null) {
        return new GvApiError(GvApiErrorCodes.MissingAuthenticationDate,
                            "Missing authentication date");
    }

    if (auth.hash == null) {
        return new GvApiError(GvApiErrorCodes.MissingAuthenticationHash,
                            "Missing authentication hash");
    }

    //
    // Date check
    //

    let date = moment(auth.date);

    if (! date.isValid()) {
        return new GvApiError(GvApiErrorCodes.InvalidAuthDateFormat,
                            "Unable to parse authentication date");
    }

    let now = moment();

    let early = date.clone().subtract(GvApiConstants.apiAuthTooEarly_s, "seconds");

    // If the date plus 1 min is still before now, then it's too early
    if (now.isBefore(early)) {
        return new GvApiError(GvApiErrorCodes.EarlyAuthDate,
                            "Authentication date is too early");
    }

    let late = date.clone().add(GvApiConstants.apiAuthTooLate_s, "seconds");

    // If the date minus 1 min is still after now, then it's too stale
    if (now.isAfter(late)) {
        return new GvApiError(GvApiErrorCodes.StaleAuthDate,
                            "Authentication has expired");
    }

    // Following this, still need to check:
    //   auth.date is advancing from prior API call
    //   auth.hash matches based on context's api key

    return null;
}

export function GvApiMakeResponse(rqstType: string, rqstId: string, respData: any, errObj?: GvApiError) {
    return {
        version   : GvApiConstants.apiVersion,

        request   : rqstType,
        requestId : rqstId,

        data      : respData,
        error     : errObj != null ? errObj : null
    };
}



