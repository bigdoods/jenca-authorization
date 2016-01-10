var tape = require('tape')
var async = require('async')
var Router = require('./router')
var http = require('http')
var hyperquest = require('hyperquest')
var concat = require('concat-stream')

tape('basic http request response', function (t) {

  var router = Router({})
  var server = http.createServer(router)

  async.series([
    function(next){
      server.listen(8060, next)
    },
    function(next){
      hyperquest('http://127.0.0.1:8060/v1/access', {
        headers:{
          'x-jenca-user':'oranges'
        }
      }).pipe(concat(function(data){
        data = data.toString()

        console.log('-------------------------------------------');
        console.log(data)
        
        next()
      }))
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