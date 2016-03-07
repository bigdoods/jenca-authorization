# jenca-authorization

The authorization service for jenca-cloud.

This service decides if the user can perform the action they are attempting.

It is called *after* the authentication service and is provided with:

 * the request URL
 * the request method
 * the request headers
 * the data returned from the authentication step

## run tests

To run the tests get into the `jenca-cloud` dev environment (or anything that has a docker server).

Then:

```bash
$ make test
```

This will:

 * use docker to spin up a postgres container
 * run the tests in a container linked to postgres
 * use docker to stop the postgres container

## run tests locally

If you want to run the tests using node on your host the process is a bit different.

Start postgres (do this whereever you have a Docker server):

```bash
$ make postgres
```

Run tests (do this whereever your native code is):

```
$ POSTGRES_HOST=172.17.8.150 npm test
```

Point the `POSTGRES_HOST` to whereever your tests can access a running postgres

## routes

#### POST /v1/access

This route accepts JSON with the following keys:

 * url
 * method
 * headers
 * data
   * loggedIn
   * email

It should respond with the following JSON:

 * error
 * statusCode
 * access

`error` if defined means the request will be denied - this text will be written as the body of the response

`statusCode` allows fine grained control over the response statusCode

`access` is written to all backend service requests as the `x-jenca-access` header.  It should be a string (JSON or other) that services will use to decide on what access level.

## middleware

The `router.js` will accept a `middleware` argument and in this way the authorization logic is pluggable.

The `middleware` function has the following signature:

```js
function(data, done){
  
}
```

`data` is the incoming JSON body (with url, method, headers and data fields).
`done` is the callback with a signature of `(error, reply)`

`reply` is what is returned back to the `jenca-router` and should have (access, error and statusCode fields)

## CLI

The server is started with the following options:

```js
var args = require('minimist')(process.argv, {
  alias:{
    p:'port',
    m:'middleware'
  },
  default:{
    port:process.env.PORT || 80,
    middleware:process.env.MIDDLEWARE || 'allowall'
  }
})
```

The `port` setting controls the TCP port the server listens on.
The `middleware` setting controls which module from the `middleware` folder it will load.  For example the following command would load the `allowall` middleware (`middleware/allowall.js`):

```bash
$ node index.js --middleware allowall
```
