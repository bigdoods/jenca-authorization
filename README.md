# jenca-authorization

The authorization service for jenca-cloud.

This service decides if the user can perform the action they are attempting.

It is called *after* the authentication service and is provided with:

 * the request URL
 * the request method
 * the request headers
 * the data returned from the authentication step

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

