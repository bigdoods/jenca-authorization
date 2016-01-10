var concat = require('concat-stream')
var async = require('async')

function defaultMiddleware(data, done){
  done()
}

module.exports = function(config){

  return {
    /*
    
      we only accept POST because we need the auth data
      
    */
    POST:function(req, res, opts, cb){
      req.pipe(concat(function(body){

        /*
        
          bail on errors processing the incoming JSON
          
        */
        try {
          body = JSON.parse(body.toString())
        } catch (e){
          res.statusCode = 500
          res.end(e.toString())
          return
        }

        /*
        
          create a function that runs through our middleware
          
        */
        var middleware = config.middleware || defaultMiddleware

        // here we actuall trigger the middleware
        middleware(body, function(err, reply){
          if(err){
            res.statusCode = 500
            res.end(err.toString())
            return
          }
          
          reply = reply || {
            access:null
          }
          
          res.statusCode = 200
          res.headers['content-type'] = 'application/json'
          res.end(JSON.stringify(data))
        })
      }))
    }
  }
}