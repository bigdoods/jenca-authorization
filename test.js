var tape = require('tape')
var async = require('async')
var Router = require('./router')
var http = require('http')
var from2 = require('from2-string')
var hyperquest = require('hyperquest')
var concat = require('concat-stream')

function getSourceStream(){
  return from2(JSON.stringify({
    url:'/v1/projects/project',
    headers:{
      'x-jenca-test':'pineapple'
    },
    method:'post',
    data:{
      loggedIn:true,
      email:'bob@bob.com'
    }
  }))
}

tape('basic http request response', function (t) {

  var router = Router({})
  var server = http.createServer(router.handler)

  async.series([
    function(next){
      server.listen(8060, next)
    },
    function(next){
      var req = hyperquest('http://127.0.0.1:8060/v1/access', {
        method:'POST',
        headers:{
          'x-jenca-user':'oranges'
        }
      })

      var sourceStream = getSourceStream()

      var destStream = concat(function(result){
        result = JSON.parse(result.toString())
        t.equal(result.access, null, 'the access code is null')
        
        next()
      })

      sourceStream.pipe(req).pipe(destStream)

      req.on('response', function(res){
        t.equal(res.statusCode, 200, 'The status code == 200')
      })

      req.on('error', function(err){
        next(err.toString())
      })
    },
    function(next){
      server.close(next)
    }
  ], function(err){
    if(err){
      t.error(err)
      t.end()
      return
    }
    t.end()
  })

})