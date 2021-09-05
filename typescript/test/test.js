'use strict';
const chai     = require('chai');
const chaiHttp = require('chai-http');
const assert   = chai.assert;

const gvApi = require('..');

chai.use(chaiHttp);

////////////////////////////////////////////////////////////////////////////////
//
// Replace accountAbbrev and accountApiKey as appropriate for target account 
//
////////////////////////////////////////////////////////////////////////////////

const accountAbbrev = 'gvdev';
let   accountApiKey = 'gv10_14449cbf923017bf076933364a5ea8e4'; 

//
// hostUrl should ordinarily be set to https://<your account>.groupvine.com
// but is 
//

const hostUrl    = `http://${accountAbbrev}.localhost.test:8098`;
// let hostUrl   = `https://${accountAbbrev}.groupvine.com`;
const apiPath    = '/api';


function apiRequest(requestType, requestId, requestData, cb) {

    let apiRqst = gvApi.GvApiMakeRequest(requestType,
                                         requestId,
                                         accountAbbrev, 
                                         accountApiKey, 
                                         requestData);

    chai.request(hostUrl)
        .post(apiPath)
        .set('content-type', 'application/json')
        .send(apiRqst)
        .end( (error, response, body) => {
            if (error) {
                cb(error, null);
            } else {
                let resp = JSON.parse(response.text);
                cb(null, resp);
            }
        });
}

function consoleIndent(outString) {
    console.group(); console.group(); console.group(); console.group();
    console.log(outString);
    console.groupEnd(); console.groupEnd(); console.groupEnd(); console.groupEnd();
}

////////////////////////////////////////////////////////////////////////////////
//
// Basic authentication tests using 'ping' API method
//
////////////////////////////////////////////////////////////////////////////////

describe('Ping test group', () => {
    it('ping test should generate a pong response', (done) => {
        apiRequest('ping', 'ping test 1', {}, (error, resp) => {
            if (error) {
                done(error);
            } else {
                // consoleIndent("Ping response: " + JSON.stringify(resp, null, 2));

                assert.isNull(resp.error, null);
                assert.equal(resp.data.message, 'pong');

                done();
            }
        });
    });

    it('should return authentication failure', (done) => {
        let saveKey = accountApiKey; 
        accountApiKey += 'xyz';  // BAD KEY

        apiRequest('ping', 'ping test 2', {}, (error, resp) => {

            accountApiKey = saveKey; // restore key

            if (error) {
                done(error);
            } else {
                // consoleIndent("Ping response: " + JSON.stringify(resp, null, 2));

                assert.isNotNull(resp.error);
                assert.equal(resp.error.code, 
                             gvApi.GvApiErrorCodes.FailedAuthentication); 
                assert.include(resp.error.message, 'Authentication failed');

                done();
            }
        });
    });

    it('should return unknown request type', (done) => {
        apiRequest('pingXYZ', 'ping test 3', {}, (error, resp) => {
            if (error) {
                done(error);
            } else {
                // consoleIndent("Ping response: " + JSON.stringify(resp, null, 2));

                assert.isNotNull(resp.error);
                assert.equal(resp.error.code, 
                             gvApi.GvApiErrorCodes.UnknownRequestType); 
                assert.include(resp.error.message, 'Unsupported request type');

                done();
            }
        });
    });

    it('Another ping test should generate a pong response', (done) => {
        apiRequest('ping', 'ping test 4', {}, (error, resp) => {
            if (error) {
                done(error);
            } else {
                // consoleIndent("Ping response: " + JSON.stringify(resp, null, 2));

                assert.isNull(resp.error, null);
                assert.equal(resp.data.message, 'pong');

                done();
            }
        });
    });
});
