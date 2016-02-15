var concat = require('concat-stream')
var async = require('async')
var jsonRequest = require('json-request-handler')

function defaultMiddleware(data, done){
  return require('../middleware/allowall')
}

module.exports = function(config){

  return {
    GET:jsonRequest(function(req, res, opts, cb){
      /*

        create a function that runs through our middleware

      */
      var middleware = config.middleware || defaultMiddleware()

      // here we actually trigger the middleware
      middleware.authorise(req.headers['x-jenca-user'], opts.params.permissionid, function(err, reply){
        if(err){
          console.log('auth error')
          res.statusCode = 500
          // res.end(err.toString())
          res.end('auth error')
          return
        }

        reply = reply || {
          access:null
        }

        res.statusCode = 200
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(reply))
      })

    }),

    /*

      we only accept POST because we need the auth data

    */
    POST:jsonRequest(function(req, res, opts, cb){

      var body = req.jsonBody
      /*

        create a function that runs through our middleware

      */
      var middleware = config.middleware || defaultMiddleware()
      console.dir(middleware)
      // here we actuall trigger the middleware
      middleware.authorise_request(req, function(err, reply){
        if(err){
          res.statusCode = 500
          res.end(err.toString())
          return
        }

        reply = reply || {
          access:null
        }

        res.statusCode = 200
        res.setHeader('content-type', 'application/json')
        res.end(JSON.stringify(reply))
      })

    })
  }
}