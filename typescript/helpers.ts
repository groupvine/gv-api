import * as sha256 from "crypto-js/sha256.js";

import { GvApiConstants } from "./consts";


// Examples:
//   rqstType:    'import', 'export', ...
//   rqstId:      Arbitrary information to identify this request, included in response
//   context:     account abbreviation
//   contextKey:  secret apiKey for this account
//   data:        Relevant data object


export class GvApiError {
    code: number;
    message: string;

    constructor (code: number, msg: string) {
        this.code = code;
        this.message = msg;
    }

    toString() {
        `Error code: ${this.code}; "${this.message}"`;
    }
}

export class GvApiAuth {
    date: string;
    hash: string;

    constructor (date: string, hash: string) {
        this.date = date;
        this.hash = hash;
    }
}

export class GvApiRequest {
    version: string;
    request: string;
    requestId: string;

    auth: GvApiAuth;
    data: any;
    
    constructor(data: Partial<GvApiRequest>) {
        this.version = GvApiConstants.apiVersion;
        Object.keys(data).map( x => { this[x] = data[x]; });
    }
}

export function GvApiGenerateHash (context: string, contextKey: string, date: string) : string {
    return sha256(context.trim().toLowerCase() + contextKey.trim() + date.trim()).toString();
}


export function GvApiMakeRequest(rqstType: string, rqstId: string,
                                 context: string, contextKey: string, rqstData: any): GvApiRequest {
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
