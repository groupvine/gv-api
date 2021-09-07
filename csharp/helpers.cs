using System;
using System.Text;
using System.Security.Cryptography;

//////////////////////////////////////////////////////////////////////////
//
// API request types
//
//////////////////////////////////////////////////////////////////////////

public class GvApiError
{
    public int code { get; }
    public string message  { get; }

    public GvApiError(int code, string message) {
        this.code    = code;
        this.message = message;
    }
    
    public override string ToString() 
    {
        return String.Format("[{0}] {1}", this.code, this.message);
    }
}

public class GvApiAuth {
    public string date { get; set; }
    public string hash { get; set; }

    public GvApiAuth(string date, string hash) {
      this.date = date;
      this.hash = hash;
    }

    public override string ToString() 
    {
        return String.Format("{0}; {1}", this.date, this.hash);
    }
}

public class GvApiRequest {
    public string version { get; set; }
    public string request { get; set; }
    public string requestId { get; set; }

    public GvApiAuth auth { get; set; }
    public object data { get; set; }

    public GvApiRequest(string request, string requestId, GvApiAuth auth, object data) {
        this.version   = GvApiConstants.apiVersion;
        this.request   = request;
        this.requestId = requestId;
        this.auth      = auth;
        this.data      = data;
    }

    public override string ToString() 
    {
        return String.Format("version: {0} request {1} requestId {2} auth {3} data {4}",
                             this.version, this.request, this.requestId, this.auth, this.data);
    }
}

//////////////////////////////////////////////////////////////////////////
//
// API response types
//
//////////////////////////////////////////////////////////////////////////

public class GvApiResponse {
    public string version { get; }
    public string request { get; }
    public string requestId { get; }
    public GvApiError error { get; }

    public GvApiResponse(string version, string request, string requestId, GvApiError error) {
        this.version   = version;
        this.request   = request;
        this.requestId = requestId;
        this.error     = error;
    }

    public override string ToString() 
    {
        if (this.error == null) {
            return String.Format("Success: {0}({1})", this.request, this.requestId);
        } else {
            return String.Format("Error: {0}({1}) -- {2}", this.request, this.requestId, this.error);
        }
    }
}

//
// Ping requests
//

public class GvApiPingResponseData {
    public string message { get; }
    public string date { get; }

    public GvApiPingResponseData(string message, string date)
    {
      this.message = message;
      this.date = date;
    }
    
    public override string ToString() 
    {
      return String.Format("{0}, {1}", this.message, this.date);
    }
}

public class GvApiPingResponse : GvApiResponse {
    public GvApiPingResponseData data { get; }
    
    public GvApiPingResponse(string version, string request, string requestId, GvApiError error,
                             GvApiPingResponseData data) : base(version, request, requestId, error) {
        this.data = data;
    }

    public override string ToString() 
    {
        string res = base.ToString();
        if (this.data != null) {
            res = res + " -- " + this.data.ToString();
        }
        return res;
    }
}

//
// Import requests
//

public class GvApiImportResponseData {
    // number of members successfully processed (whether or not any warnings)
    public int      successCount { get; }    
    public string[] warnings     { get; }

    public GvApiImportResponseData(int successCount, string[] warnings) {
        this.warnings     = warnings;
        this.successCount = successCount;
    }
    
    public override string ToString() 
    {
        string res = String.Format("{0} import member(s) processed", this.successCount);

        if (this.warnings != null) {
            res = res + String.Format("; {0} warning(s)", this.warnings.Length);
          
            for (int i = 0; i < this.warnings.Length; i++) 
            {
                res = res + String.Format("\n    " + this.warnings[i]);
            }
        }
        return res;
    }
}

public class GvApiImportResponse : GvApiResponse {
    public GvApiImportResponseData data { get; }
    
    public GvApiImportResponse(string version, string request, string requestId, GvApiError error,
                               GvApiImportResponseData data) : base(version, request, requestId, error) {
        this.data = data;
    }
    
    public override string ToString() 
    {
        string res = base.ToString();
        if (this.data != null) {
            res = res + " -- " + this.data.ToString();
        }
        return res;
    }
}

//////////////////////////////////////////////////////////////////////////
//
// API helper functions
//
//////////////////////////////////////////////////////////////////////////

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
