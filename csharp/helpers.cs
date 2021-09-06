using System;
using System.Text;
using System.Security.Cryptography;

public class GvApiError
{
    public int code { get; }
    public string message  { get; }

    public GvApiError(int code, string message) {
      this.code    = code;
      this.message = message;
    }
}

public class GvApiAuth {
    public string date { get; set; }
    public string hash { get; set; }

    public GvApiAuth(string date, string hash) {
      this.date = date;
      this.hash = hash;
    }
}

public class GvApiRequest {
    public string version { get; set; }
    public string request { get; set; }
    public string requestId { get; set; }

    public GvApiAuth auth { get; set; }
    public object data { get; set; }

    public GvApiRequest(string rqstType, string rqstId, GvApiAuth auth, object rqstData) {
        this.version   = GvApiConstants.apiVersion;
        this.request   = rqstType;
        this.requestId = rqstId;
        this.auth      = auth;
        this.data      = rqstData;
    }
}

static class GvApiHelpers {

    //
    // Test hash check:
    //   GvApiHelpers.generateHash("myaccount",
    //                             "gv10_ec06a1f23832114967e1aac88594fded",
    //                             "2020-07-11T01:32:56.020Z");
    // Correctly generates:
    //   0993a144813c3c03b50a7d750801edbb33344d92cb679b53ad9c9b654d8a891b
    //
  
    static public string generateHash (string context, string contextKey, string date) {
        string dataStr   = context.Trim().ToLower() + contextKey.Trim() + date.Trim();
        byte[] dataBytes = Encoding.ASCII.GetBytes(dataStr);
        
        byte[] hash      = SHA256.HashData(dataBytes);
        
        string hashStr   = BitConverter.ToString(hash).Replace("-", string.Empty).ToLower();

        return hashStr;
    }

    static public GvApiRequest makeRequest(string rqstType, string rqstId,
                                           string context, string contextKey,
                                           object rqstData) {
        string date = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
        string hash = GvApiHelpers.generateHash(context, contextKey, date);
        
        GvApiAuth auth = new GvApiAuth(date, hash);
        
        return new GvApiRequest(rqstType, rqstId, auth, rqstData);
    }
};
