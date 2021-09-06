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
    public const string hostUrl       = "https://apitest.groupvine.work";
    public const string accountApiKey = "gv10_c45c9f58e3f388d6459f574cd74d25e1"; 

    // Production
    // public const string hostUrl       = "https://apitest.groupvine.com";
    // public const string accountApiKey = "gv10_61548fb1af2effc0ea773c959fbea888";
}


public class Member
{
    public string emailAdr { get; set; }
    public string firstName { get; set; }
    public string lastName { get; set; }
    public string itodID { get; set; }
}

public class NullData
{
}


namespace vs_c_sharp
{
    class Program
    {
        static async Task Main( string[ ] args )
        {
            await new Program( ).MainAsync(args);
        }

        public async Task MainAsync(string[] args)
        { 
            HttpClient httpClient = new HttpClient();

            var member1_pre = new Member
            {
                emailAdr  = "test.member@example.com",
                firstName = "Bob",
                lastName  = "Smith",
                itodID    = "1234"
            };

            string jsonStr = JsonSerializer.Serialize(member1_pre);

            Console.WriteLine("Member1 pre: " + jsonStr);

            Member member1_post = JsonSerializer.Deserialize<Member>(jsonStr);

            Console.WriteLine("Member1 post: " +
                JsonSerializer.Serialize(member1_post));

            Console.WriteLine("Sample error code: " + GvApiErrorCodes.ServerException);

            string hash = GvApiHelpers.generateHash("myaccount",
                                                    "gv10_ec06a1f23832114967e1aac88594fded",
                                                    "2020-07-11T01:32:56.020Z");
            
            Console.WriteLine("Hash result: " + hash);

            GvApiRequest rqst = GvApiHelpers.makeRequest("ping", "my ping test",
                                                         GvAccountConsts.accountAbbrev,
                                                         GvAccountConsts.accountApiKey,
                                                         new NullData());
            
            
            string rqstStr = JsonSerializer.Serialize(rqst);
            Console.WriteLine("Request str: " + rqstStr);

            string url = GvAccountConsts.hostUrl + "/api";

            HttpResponseMessage resp = await httpClient.PostAsJsonAsync(url, rqst);
            
            string respStr = await resp.Content.ReadAsStringAsync();

            Console.WriteLine("Response str: " + respStr);
        }
    }
}
