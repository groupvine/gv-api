using System;

using System.Text.Json;
using System.Text.Json.Serialization;

using System.Threading.Tasks;

using System.Net.Http;
using System.Net.Http.Json;


static class GvAccountConsts
{
    // Note that we're using 'apitest' account

    public const string accountAbbrev = "apitest";
  
    // test server
    public const string hostUrl       = "https://apitest.groupvine.work/api";
    public const string accountApiKey = "gv10_c45c9f58e3f388d6459f574cd74d25e1"; 

    // Production
    // public const string hostUrl       = "https://apitest.groupvine.com/api";
    // public const string accountApiKey = "gv10_61548fb1af2effc0ea773c959fbea888";
}


public class Member
{
    public string emailAdr { get; set; }
    public string firstName { get; set; }
    public string lastName { get; set; }
    public string itodID { get; set; }
}

//            var member1_pre = new Member
//            {
//                emailAdr  = "test.member@example.com",
//                firstName = "Bob",
//                lastName  = "Smith",
//                itodID    = "1234"
//            };


public class NullData { }


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
            await program.PingTestError();
        }

        public async Task PingTest()
        {
            // Create request with an invalid API Key
            Console.WriteLine("\nPing test 1");
            
            GvApiRequest rqst = GvApiHelpers.makeRequest("ping", "my ping test",
                                                         GvAccountConsts.accountAbbrev,
                                                         GvAccountConsts.accountApiKey,
                                                         new NullData());
            
            HttpResponseMessage respMsg = await httpClient.PostAsJsonAsync(GvAccountConsts.hostUrl, rqst);
            
            string respStr = await respMsg.Content.ReadAsStringAsync();
            // Console.WriteLine("Response str: " + respStr);
            
            GvApiResponse resp = JsonSerializer.Deserialize<GvApiResponse>(respStr);

            if (resp.error != null) {
                Console.WriteLine("  Error [" + resp.error.code + "]: " + resp.error.message);
            } else {
                Console.WriteLine("  Success:  " + resp.data);
            }
        }

        public async Task PingTestError()
        {
            // Create request with an invalid API Key
            Console.WriteLine("\nPing test 2 (authentication error)");
          
            GvApiRequest rqst = GvApiHelpers.makeRequest("ping", "my ping test",
                                                         GvAccountConsts.accountAbbrev,
                                                         GvAccountConsts.accountApiKey + "XYZ",  // BAD KEY
                                                         new NullData());
            
            HttpResponseMessage respMsg = await httpClient.PostAsJsonAsync(GvAccountConsts.hostUrl, rqst);
            
            string respStr = await respMsg.Content.ReadAsStringAsync();
            // Console.WriteLine("Response str: " + respStr);

            GvApiResponse resp = JsonSerializer.Deserialize<GvApiResponse>(respStr);

            if (resp.error != null) {
                Console.WriteLine("  Error [" + resp.error.code + "]: " + resp.error.message);
            } else {
                Console.WriteLine("  Success:  " + resp.data);
            }
        }

    }
}
