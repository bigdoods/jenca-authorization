var HttpHashRouter = require('http-hash-router')
var concat = require('concat-stream')

module.exports = function(config){

  var router = HttpHashRouter();

  router.set('/v1/access', {
    POST:function(req, res, opts, cb){
      res.end('ok')
    }
  })

  function handler(req, res) {
    router(req, res, {}, onError);

    function onError(err) {
      if (err) {
        res.statusCode = err.statusCode || 500;
        res.end(err.message);
      }
    }
  }

  return handler
}