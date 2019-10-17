# GroupVine API

The GroupVine API gives account owners or managers a secure,
programatic way to manage accounts via a REST- and JSON-based API.  

The API currently supports complete management of your account
membership.


## API Endpoint

All API requests must use HTTPS and are invoked using the POST method
on the following URL:

```
https://<account>.groupvine.email/api
```

(Replace ```<account>``` with the associated account abbreviation.)


## Message envelope

### Request

The following outlines the JSON structure of each request body:

```
{
  version   : "1.0",

  request   : <<request type string, see types below>>,
  requestId : <<optional, arbitrary client-specified string, returned in response>>,

  auth : {
    date    : <<ISO current date string>>,
    hash    : <<Authenitcation hash>>
  },

  data : null | {
    <<request-specific data>>
  }
}
```

### Response

The following outlines the JSON structure of each response body:

```
{
  version   : "1.0",

  request   : <<echoed from request>>,
  requestId : <<echoed from request>>,

  error : null | {
    code    : <<numeric error code defined in index.js file>>,
    message : <<string describing error>>
  }

  data : null | {
    <<request-specific data (if no error)>>
  }
}
```

### Authentication 

As indicated in the above message envelope, each request includes the
following authentcation object:

```
  ...
  auth : {
    date : <<ISO current date string>>,
    hash : <<Authenitcation hash>>
  },
  ...
```

The authentication ```date``` is a string representing the date and
time in ISO format with msec resolution, such as
```'2019-10-16T06:13:47.548Z```.  Note that this date must be current
for each request (as requests with early or stale dates, by more than
about 30 seconds, will be rejected).

For example, the date can be generated with the following javascript:

```
(new Date()).toISOString();
```

The authentication ```hash``` is the value of a SHA256 hash on the
concatenation of the following three values, in this order:

- The account abbreviation, lower-cased
- The ISO date string used in the request, and
- The account API key found on your Account Settings page.


## Membership management

### Importing membership changes

**Request type: ```import```**



### Exporting membership

**Request type: ```export```**

No data is required in the request object, or can be included with the
following options:

```
    ...
    data : {
        inclUserIds : true | false   <<default false>>
    }
    ...
```

The data of the response object resembles a regular CSV membership
export (see here for details) but has the following JSON form:


```
  ...
  data : {
    fields : {
      attributes : {
        standard : [
          "email",
          "firstName", 
          ... <<list of standard attribute names>>
        ],
        custom : [
          "city",
          "favColor",
          ... <<list of custom attribute names>>
        ]
      },
      groupsLists : [
        "role",
        "staff",
        ... <<ordered list of role, group, and list names>>
      ],
    } ,

    members [
      { "firstname" : "Sam",  "lastname" : "Smith", "email" : "sam.smith@example.com", ... },
      { "firstname" : "Toni", "lastname" : "Tang",  "email" : "toni.tang@example.com", ... },
      ...
    ]
  }
  ...
```


## Testing

### Example Hash Computation

A hash on the following values:

```
    Account abbreviation:  myaccount
    ISO date string:       2019-10-16T14:44:38.321Z
    Account API key:       gv10_a5b01f39478bbe9d50e54e2de79860b2
```

should result in the following hash value: 

``` 
   Auth hash value:  2419c00a9b1a6f1d746fdf1a629346322e7ada5c2e0ef14f2306dcc1b4b67392 
```


### API Ping

**Request type: ```ping```**

Any data in the request is ignored.  The returned data has the structure:

```
{
  ...
  data : {
    message: 'pong',
    date: <<ISO format date>>
  }
}
```

