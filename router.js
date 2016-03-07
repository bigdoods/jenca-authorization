var HttpHashRouter = require('http-hash-router')

var Access = require('./routes/access')

module.exports = function(config){

  var router = HttpHashRouter();

  router.set('/v1/access', Access(config))
  router.set('/v1/access/:permissionid', Access(config))

  function handler(req, res) {
    router(req, res, {}, onError);

    function onError(err) {
      if (err) {
        res.statusCode = err.statusCode || 500;
        res.end(err.message);
      }
    }
  }

  return {
    handler:handler
  }
}