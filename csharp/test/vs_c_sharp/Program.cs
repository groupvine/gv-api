using System;

using System.Text.Json;
using System.Text.Json.Serialization;

using System.Threading.Tasks;

using System.Net.Http;
using System.Net.Http.Json;

using System.Collections.Generic;


static class GvAccountConsts
{
    // Note that we're using 'apitest' account

    public const string accountAbbrev = "apitest";
  
    // test server (make key non-const so we can test with invalid key)
    public const string hostUrl       = "https://apitest.groupvine.work/api";
    public const string accountApiKey = "gv10_c45c9f58e3f388d6459f574cd74d25e1";   

    // Production
    // public const string hostUrl       = "https://apitest.groupvine.com/api";
    // public const string accountApiKey = "gv10_61548fb1af2effc0ea773c959fbea888";
}


namespace vs_c_sharp
{
    class Program
    {
        // Common HTTP client
        static HttpClient httpClient;
    
        static async Task Main( string[ ] args )
        {
            httpClient = new HttpClient();

            Program program = new Program();

            await program.PingTest();
            await program.PingTestAuthError();

            await program.ModifyTestAddMember();
            await program.ExportTest();
            
            await program.ModifyTestRemoveMemberFail();
            await program.ModifyTestRemoveMember();
            await program.ExportTest();
        }
        
        //////////////////////////////////////////////////////////////////////////
        //
        // API Request convenience functions
        //
        //////////////////////////////////////////////////////////////////////////

        public async Task<string> apiRequest(string rqstType, string rqstId, object data,
                                             string accountKey = GvAccountConsts.accountApiKey)
        {            
            GvApiRequest rqst = GvApiHelpers.makeRequest(rqstType, rqstId,
                                                         GvAccountConsts.accountAbbrev,
                                                         accountKey,
                                                         data);
            
            HttpResponseMessage respMsg = await httpClient.PostAsJsonAsync(GvAccountConsts.hostUrl, rqst);
            
            string respStr = await respMsg.Content.ReadAsStringAsync();

            // Uncomment for debugging with raw response
            // Console.WriteLine("Response str: " + respStr);

            return respStr;
        }

        public async Task<GvApiPingResponse> apiRequestPing(string rqstId, object data,
                                                            string accountKey    = GvAccountConsts.accountApiKey)
        {
            string respStr = await this.apiRequest("ping", rqstId, data,
                                                   accountKey:accountKey);
            
            return JsonSerializer.Deserialize<GvApiPingResponse>(respStr);
        }
        
        public async Task<GvApiExportResponse> apiRequestExport(string rqstId, object data)
        {
            string respStr = await this.apiRequest("export", rqstId, data);
            
            return JsonSerializer.Deserialize<GvApiExportResponse>(respStr);
        }

        
        public async Task<GvApiImportResponse> apiRequestImport(string rqstId, object data)
        {
            string respStr = await this.apiRequest("import", rqstId, data);
            
            return JsonSerializer.Deserialize<GvApiImportResponse>(respStr);
        }
        
        //////////////////////////////////////////////////////////////////////////
        //
        // Ping-based tests
        //
        //////////////////////////////////////////////////////////////////////////
        
        public async Task PingTest()
        {
            // Create request with an invalid API Key
            Console.WriteLine("\nPing test (expect success)");

            GvApiPingResponse resp = await this.apiRequestPing("ping test", new object());

            Console.WriteLine(resp);
        }

        public async Task PingTestAuthError()
        {
            // Create request with an invalid API Key
            Console.WriteLine("\nPing test (expect authentication error)");

            // mess with the authentication key
            GvApiPingResponse resp = await this.apiRequestPing("ping test (fail)", new object(),
                accountKey:GvAccountConsts.accountApiKey + "XYZ"
            );

            Console.WriteLine(resp);
        }

        //////////////////////////////////////////////////////////////////////////
        //
        // Export tests
        //
        //////////////////////////////////////////////////////////////////////////

        public async Task ExportTest()
        {
            // Create request with an invalid request type
            Console.WriteLine("\nExport membership (expect success)");

            // mess with the authentication key
            GvApiExportResponse resp = await this.apiRequestExport("export membership", new object());
            
            Console.WriteLine(resp);
        }

        //////////////////////////////////////////////////////////////////////////
        //
        // Membership import/export modify tests
        //
        //////////////////////////////////////////////////////////////////////////
        
        public async Task ModifyTestAddMember()
        {
            Console.WriteLine("\nModify test - Add member (expect success)");

            // noDemotions option included in case this member is already present
            // with a higher role (note that the noDemotions option won't prevent
            // member from being removed entirely, just not demoted to a lower role)
            var options = new Dictionary<string, bool>()
            {
                { "noDemotions", true }
            };

            // Note that the "grouptag:sub1" below can be any sequence of
            // characters (for easy reference in the API client system) but 
            // must match the tag assigned to the sub-group in the GroupVine
            // system.
            
            var data = new Dictionary<string, object>()
            {
                { "importMode", "modify" },
                { "options", options },

                // List of member dicts
                { "members", new object[]  
                    {
                       new Dictionary<string, string>()
                       {
                           { "email",         "csharp.test.user@example.com" },
                           { "first name",    "CSharp"},
                           { "last name",     "Test User"},
                           { "ITOD ID",       "AB12345"},
                           { "role",          "x" },
                           { "grouptag:sub1", "x" },
                       }
                    }
                }
            };

            GvApiImportResponse resp = await this.apiRequestImport("add member", data);

            Console.WriteLine(resp);
        }
        
        public async Task ModifyTestRemoveMemberFail()
        {
            Console.WriteLine("\nModify test - Remove member (expect warning)");

            var data = new Dictionary<string, object>()
            {
                { "importMode", "modify" },

                // List of member dicts
                { "members", new object[]  
                    {
                       new Dictionary<string, string>()
                       {
                           { "email",         "csharp.test.user@example.com" },
                           { "role",          "" },
                           // { "grouptag:sub1", "" },    // not removing from sub-group!
                       }
                    }
                }
            };

            GvApiImportResponse resp = await this.apiRequestImport("remove member (fail)", data);
            
            Console.WriteLine(resp);
        }
        
        public async Task ModifyTestRemoveMember()
        {
            Console.WriteLine("\nModify test - Remove member (expect success)");

            var data = new Dictionary<string, object>()
            {
                { "importMode", "modify" },

                // List of member dicts
                { "members", new object[]  
                    {
                       new Dictionary<string, string>()
                       {
                           { "email",         "csharp.test.user@example.com" },
                           { "role",          "" },
                           { "grouptag:sub1", "" },    // not removing from sub-group!
                       }
                    }
                }
            };

            GvApiImportResponse resp = await this.apiRequestImport("remove member", data);
            
            Console.WriteLine(resp);
        }
        
    }
}
