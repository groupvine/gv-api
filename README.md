# GroupVine API

The GroupVine API gives account owners or managers a secure,
programatic way to manage accounts via a REST- and JSON-based API.  

The API currently supports complete management of your account
membership.


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
  version   : "1.0",

  request   : <<request type string, see types below>>,
  requestId : <<optional, arbitrary client-specified string, returned in response>>,

  auth : {
    date    : <<ISO current date string, e.g., 2019-10-16T14:44:38.321Z>>,
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
    date : <<ISO current date string, e.g., 2019-10-16T14:44:38.321Z>>,
    hash : <<Authentication hash>>
  },
  ...
```

The authentication ```date``` is a string representing the date and
time in ISO format with msec resolution, such as
```'2019-10-16T06:13:47.548Z```.  Note that this date must be current
for each request (as requests with early or stale dates, by more than
about 30 seconds, will be rejected), and the dates in subsequent
requests for a given account must be increasing.

For example, the date can be generated with the following javascript:

```
(new Date()).toISOString();
```

The authentication ```hash``` is the value of a SHA256 hash on the
concatenation of the following three values, in this order:

- The account abbreviation, lower-cased
- The account API key found on your Account Settings page.
- The ISO date string used in the request, and


(Note that for managed accounts, either the API key for the specific
account or the management account may be used.)


## Membership management

### Importing membership changes

**Request type: ```import```**

#### Import Request

The data of the request object resembles a regular CSV membership
import (see GroupVine documentation for details) but has the following
JSON form:

```
    ...
    data : {
        fields: null | [
            <<Optional ordered field list, matching column headers in a CSV import>>
        ] 
        members: [
            <<List of member modifications, with objects having key-values with keys matching the fields>>
        ]
    }
```

If no fields property is provided, then it will be determined from the
keys specified in the member object list.  Note that if the account
has sub-groups, and any sub-group related membership is being
modified, then the fields property must be provided (as the sub-group
and list header fields in a corresponding CSV import is order
depdendent, see GroupVine documentation).

#### Import Response

The data of the response object has the following form:

```
    ...
    data : {
        successCount : <<number of member "rows" that were able to be processed>>
        warnings : [
            <<list of warning strings regarding certain member rows or settings>>
        ]
    }
```

#### Import Examples

To simply add a couple new members, along with their first and last names:


```
    ...
    data : {
        members : [
            {
                "email"     : "sue.smith@example.com",
                "FirstName" : "Sue",
                "LastName"  : "Smith"
            },
            {
                "email"     : "toni.tang@example.com",
                "FirstName" : "Toni",
                "LastName"  : "Tang"
            },
       ]
    }
```

The above member additions are equivalent to adding members with
"role" property set to "x" or "Member".  I.e., if no "role" is field
is included (either in the "fields" list or a particular member
object), then ``` "role" : "x"``` is assumed.

To then remove one of the above new members (i.e., with an empty role).

```
    ...
    data : {
        members : [
            {
                "email" : "sue.smith@example.com",
                "role"  : ""
            }
        ]
    }
```

To add a new member with a custom attribute to a couple lists and to the "marketing" sub-group as an Editor:

```
    ...
    data : {
        fields  : [ "email", "FirstName", "LastName", "Company ID", "list:parttime", "list:telecommuter", "group:marketing" ],
                     
        members : [
            {
                "email"             : "Alvin.Anderson@example.com",
                "FirstName"         : "Alvin",
                "LastName"          : "Anderson",
                "Company ID"        : "M12345",
                "list:partime"      : "x",
                "list:telecommuter" : "x",
                "group:marketing"   : "Editor"
            }
       ]
    }
```

(In this case, the "fields" property is required to give the ordering
of the group and list fields, in case any of the lists are only
defined within a particular sub-group.)

### Exporting membership

**Request type: ```export```**

#### Export Request

No data is required in the request object, or can be included with the
following options:

```
    ...
    data : {
        inclUserIds : true | false   <<default false>>
    }
```

#### Export Response

The data of the response object resembles a regular CSV membership
export (see GroupVine documentation for details) but has the following
JSON form:


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
          "City",
          "Company ID",
          ... <<list of custom attribute names>>
        ]
      },
      groupsLists : [
        "role",
        "list:volunteers",
        "group:staff",
        ... <<ordered list of role, group, and list names>>
      ],
    } ,

    members [
      { "firstname" : "Sam",  "lastname" : "Smith", "email" : "sam.smith@example.com", ... },
      { "firstname" : "Toni", "lastname" : "Tang",  "email" : "toni.tang@example.com", ... },
      ...
    ]
  }
```


## Testing

### Example SHA256 Hash Computation

A SHA256 hash on the following values:

```
    Account abbreviation:  myaccount
    Account API key:       gv10_ec06a1f23832114967e1aac88594fded
    ISO date string:       2020-07-11T01:32:56.020Z
```

should result in the following value:

``` 
   Auth hash value:  0993a144813c3c03b50a7d750801edbb33344d92cb679b53ad9c9b654d8a891b
```


### API Ping

**Request type: ```ping```**

#### Ping Request

Any data in the request is ignored.  

#### Ping Response

The response data has the structure:

```
{
  ...
  data : {
    message: 'pong',
    date:    <<ISO format date>>
  }
}
```

## node.js Environment

In a node.js environment, the gv-api package provides the
apiMakeRequest() convenience method that can be used to construct the
request object with properly computed date and authentication hash
value.  For instance, for the "ping" request, it could be used in the
following way.

Install package:

```
npm install --save groupvine/gv-api
```

Ping example:

```
import { apiMakeRequest } from 'gv-api';

// GroupVine account being managed
let accountAbbrev = "myaccount";

// Private API key for this account
let accountApiKey = "gv10_ec06a1f23832114967e1aac88594fded";

// No data for ping
let data = {};

let rqstObj = apiMakeRequest('ping', 'example ping', accountAbbrev, accountApiKey, data);
```

Then the rqstObj would be sent to the GroupVine API endpoint as JSON
data in an https POST request, using the node.js "request" package for
instance.
