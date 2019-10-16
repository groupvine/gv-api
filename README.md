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

The following outlines the JSON structure of each request body:

```
{
  version : "1.0",  // version string

  request : <request type string, see types below>,
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

The following outlines the JSON structure of each response body:

```
{
  version : "1.0",  // version string 

  request : <echoed from request>,
  requestId : <echoed from request>,

  error : null | {
    code : <numeric error code defined in ```index.js``` file>,
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

- The account abbreviation, lower-cased
- The generated ISO date string, and
- The account API key found in your account settings

For example (and to test an implementation), the following values

- Account abbreviation: ``` myaccount ```
- ISO date string: ``` 2019-10-16T14:44:38.321Z ```
- The account API key: ``` gv10_a5b01f39478bbe9d50e54e2de79860b2 ```

would result in the hash value: ``` 2419c00a9b1a6f1d746fdf1a629346322e7ada5c2e0ef14f2306dcc1b4b67392 ```


## Membership management

### Importing membership changes

**Request type: ```import```**



### Exporting membership

**Request type: ```export```**


## Testing

### API Ping

**Request type: ```ping```**

Any data in the request is ignored.  The returned data has the structure:

```
{
  ...
  data : {
    message: 'pong',
    date: <ISO format date>
  }
}
```

