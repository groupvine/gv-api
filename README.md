# GroupVine API

The GroupVine API is used to give account owners or managers a secure,
automated management way to manage accounts via a REST- and
JSON-based API.

## API Endpoint

All API requests must use HTTPS and are invoked using the POST method
on the following URL:

```
https://<account>.groupvine.com/api
```

(Replace ```<account>``` with the associated account abbreviation.)


## Message envelope

### Request

The following outlines the JSON structure body of each request:

```
{
  version : 1.0,

  request : <request type>,
  requestId : <optional, arbitrary client-specified string, returned in response>,

  auth : {
    date : <ISO current date string>,
    hash : <Authenitcation hash>
  },

  data : null | {
    // request-specific data
  }
}
```

### Response

The following outlines the JSON structure body of each response:

```
{
  version : 1.0,

  request : <echoed from request>,
  requestId : <echoed from request>,

  error : null | {
    code : <numeric error code from consts.js>,
    message : <string describing error>
  }

  data : null | {
    // request-specific data (if no error)
  }
}
```

### Authentication 

As indicated in the above message envelope, each request includes the
following authentcation object:

```
  auth : {
    date : <ISO current date string>,
    hash : <Authenitcation hash>
  },
```

where ```date``` is a string representing the date and time in ISO
format with msec resolution, like ```'2019-10-16T06:13:47.548Z```.
Note that this date must be current for each request (as requests with
stale dates, older than several seconds, will be rejected).

For example, the date can be generated with the following javascript:

```
(new Date()).toISOString();
```

and where ```hash``` is the value of a SHA256 hash on the concatenation of the
following three values, in this order:

    # The account abbreviation
    # The generated ISO date string, and
    # The account API key found in your account settings

For example (and to test an implementation), the following values

    # Account abbreviation: ```myaccount```
    # ISO date string: ```2019-10-16T06:13:47.548Z```
    # The account API key: ```gv1_18v3qbgz0v5hqff5tqc56```

results in hash value of: ``` TBD ```;


## Membership management

### Importing membership changes

Request type: ```import```



### Exporting membership

Request type: ```export```



