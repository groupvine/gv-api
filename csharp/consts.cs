static class GvApiConstants
{
    public const string apiVersion = "1.0";

    public const int apiAuthTooLate_s  = 30 * 60;   // 30 mins
    public const int apiAuthTooEarly_s = 30 * 60;  
}


static class GvApiErrorCodes
{
    //
    // General envelope API errors
    //

    public const int ServerException           = 100;
    public const int MissingMsgBody            = 101;
    public const int MissingAPIVersion         = 102;
    public const int InvalidAPIVersion         = 103;
    public const int MissingAuthentication     = 110;
    public const int MissingAuthenticationDate = 111;
    public const int MissingAuthenticationHash = 112;
    public const int InvalidAuthDateFormat     = 113;
    public const int EarlyAuthDate             = 114;
    public const int StaleAuthDate             = 115;

    //
    // Context/storage dependent
    //

    public const int NonAdvancedAuthDate       = 120;
    public const int AccountAuthKeyIsNull      = 121;
    public const int FailedAuthentication      = 122;

    //
    // Generic API type and data errors
    //

    public const int UnknownRequestType        = 150;
    public const int InvalidRequestData        = 151;

    //
    // GroupVine 3rd-party management API
    //

    // Import-specific errors
    public const int InvalidImportData         = 300;

    // Export-specific errors
    public const int InvalidExportData         = 310;
};
