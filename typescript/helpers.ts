import * as sha256 from "crypto-js/sha256.js";

import { GvApiRequest,
         GvApiAuth } from "./consts";

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
