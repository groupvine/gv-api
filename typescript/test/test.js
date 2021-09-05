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

const accountAbbrev = 'apitest';

// Local test server
// const hostUrl       = `http://${accountAbbrev}.localhost.test:8098`;
// let   accountApiKey = 'gv10_b78a4f9c3aa1a9d2e052d648ae75b354';

// groupvine.work test server
const hostUrl     = `https://${accountAbbrev}.groupvine.work`;
let   accountApiKey = 'gv10_c45c9f58e3f388d6459f574cd74d25e1';   // test server

// Production
// const hostUrl     = `https://${accountAbbrev}.groupvine.com`;
// let   accountApiKey = 'gv10_61548fb1af2effc0ea773c959fbea888';


const apiPath     = '/api';

const testUserAdr = 'test.user@example.com';

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
                // consoleIndent("Response: " + JSON.stringify(resp, null, 2));

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
                // consoleIndent("Response: " + JSON.stringify(resp, null, 2));

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
                // consoleIndent("Response: " + JSON.stringify(resp, null, 2));

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
                // consoleIndent("Response: " + JSON.stringify(resp, null, 2));

                assert.isNull(resp.error, null);
                assert.equal(resp.data.message, 'pong');

                done();
            }
        });
    });
});

////////////////////////////////////////////////////////////////////////////////
//
// Membership export tests
//
////////////////////////////////////////////////////////////////////////////////

describe('Export test group', () => {
    it('export test should return membership', (done) => {
        apiRequest('export', 'export test 1', {}, (error, resp) => {
            if (error) {
                done(error);
            } else {
                // consoleIndent("Response: " + JSON.stringify(resp, null, 2));

                assert.isNull(resp.error, null);

                // Returned fields includes 'Email'
                assert.include(resp.data.fields.attributes.standard, 'Email');
                
                // should have at least one member
                assert.isNotEmpty(resp.data.members);

                // should not include id property
                assert.notProperty(resp.data.members[0], 'id');

                done();
            }
        });
    });

    it('export test should include user IDs', (done) => {
        apiRequest('export', 'export test 2', {inclUserIds:true}, (error, resp) => {
            if (error) {
                done(error);
            } else {
                // consoleIndent("Response: " + JSON.stringify(resp, null, 2));

                assert.isNull(resp.error, null);

                // Returned fields includes 'Email'
                assert.include(resp.data.fields.attributes.standard, 'Email');
                
                // should have at least one member
                assert.isNotEmpty(resp.data.members);

                // should include id property
                assert.property(resp.data.members[0], 'id');

                done();
            }
        });
    });
});

////////////////////////////////////////////////////////////////////////////////
//
// Membership import/export modify tests
//
////////////////////////////////////////////////////////////////////////////////

describe('Import/export test group', () => {
    it('Add test member to membership (in case not present already)', (done) => {
        let data = {
            importMode : 'modify',
            members : [
                {
                    email : testUserAdr,
                    role  : 'x',
                    'grouptag:sub1' : 'x'
                }
            ]
        };
        
        apiRequest('import', 'Modify test 1', data, (error, resp) => {
            if (error) {
                done(error);
            } else {
                // consoleIndent("Response: " + JSON.stringify(resp, null, 2));

                assert.isNull(resp.error, null);

                assert.equal(resp.data.successCount, 1);
                assert.isNull(resp.data.warnings);

                done();
            }
        });
    });

    it('Ensure test user is in sub-group membership', (done) => {
        apiRequest('export', 'Modify test 2', {groupTags:true}, (error, resp) => {
            if (error) {
                done(error);
            } else {
                // consoleIndent("Response: " + JSON.stringify(resp, null, 2));

                assert.isNull(resp.error, null);

                // Set global info on testMember
                let testMember = resp.data.members.reduce( (mem, x) => {
                    if (x['Email'] === testUserAdr) { return x; }
                    else { return mem; }
                }, null);

                assert.isNotNull(testMember);

                // consoleIndent("Test member: " + JSON.stringify(testMember, null, 2));

                // Check that test member is in sub-group
                assert.equal(testMember['grouptag:sub1'], 'x');

                done();
            }
        });
    });

    it('Failed attempt to remove test member from membership', (done) => {
        let data = {
            importMode : 'modify',
            members : [
                {
                    email : testUserAdr,

                    // should fail since also need to remove from sub-group
                    role  : ''   
                }
            ]
        };
        
        apiRequest('import', 'Modify test 3', data, (error, resp) => {
            if (error) {
                done(error);
            } else {
                //consoleIndent("Response: " + JSON.stringify(resp, null, 2));

                assert.isNull(resp.error, null);

                assert.equal(resp.data.successCount, 1);
                assert.equal(resp.data.warnings.length, 1);
                assert.include(resp.data.warnings[0], 
                               "unless also removed from the sub-groups");

                done();
            }
        });
    });

    it('Remove test member from membership', (done) => {
        let data = {
            importMode : 'modify',
            members : [
                {
                    email : testUserAdr,

                    role  : '',
                    'grouptag:sub1' : ''
                }
            ]
        };
        
        apiRequest('import', 'Modify test 3', data, (error, resp) => {
            if (error) {
                done(error);
            } else {
                // consoleIndent("Response: " + JSON.stringify(resp, null, 2));

                assert.isNull(resp.error, null);

                assert.equal(resp.data.successCount, 1);
                assert.isNull(resp.data.warnings);

                done();
            }
        });
    });


    it('Ensure test user is not in membership', (done) => {
        apiRequest('export', 'Modify test 4', {}, (error, resp) => {
            if (error) {
                done(error);
            } else {
                // consoleIndent("Response: " + JSON.stringify(resp, null, 2));

                assert.isNull(resp.error, null);

                let emailAdrs = resp.data.members.map(x => x['Email']);
                assert.notInclude(emailAdrs, testUserAdr);

                done();
            }
        });
    });

});
