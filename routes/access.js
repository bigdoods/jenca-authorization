var concat = require('concat-stream')
var async = require('async')

module.exports = function(config){

  var middlewareFactory = function(data){
    return function(done){
      var fns = (config.middleware || []).map(function(fn){
        return function(next){
          fn(data, next)
        }
      })

      async.series(fns, done)
    }
  })

  return {
    POST:function(req, res, opts, cb){
      req.pipe(concat(function(body){
        try {
          body = JSON.parse(body.toString())
        } catch (e){
          res.statusCode = 500
          res.end(e.toString())
          return
        }
        var middleware = middlewareFactory(body)

        middleware(function(err, data){
          if(!data){
            data = {
              statusCode:200,
              access:null
            }
          }
          if(err){
            res.statusCode = 500
            res.end(err.toString())
            return
          }
          res.statusCode = 200
          res.headers['content-type'] = 'application/json'
          res.end(JSON.stringify(data))
        })
      }))
    }
  }
}