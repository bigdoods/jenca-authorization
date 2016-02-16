var tape = require('tape')
var async = require('async')
var Router = require('./router')
var http = require('http')
var from2 = require('from2-string')
var hyperquest = require('hyperquest')
var concat = require('concat-stream')

var pg = require('pg')
var uuid = require('uuid');
var postgresHost = process.env.POSTGRES_HOST || '127.0.0.1'
var conString = "postgres://username:password@" + postgresHost + "/jenca-authorisation";




var sourceData = {
  url:'/v1/projects',
  headers:{
    'x-jenca-test':'pineapple'
  },
  method:'post',
  data:{
    loggedIn:true,
    email:'bob@bob.com'
  }
}
var jenca_user_id = "banana-man"

function getSourceStream(){
  return from2(JSON.stringify(sourceData))
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
        t.equal(result.access, 'all', 'the access code is null')

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


tape('test middleware', function (t) {

  var middleware = {
    authorise_request:function(data, next){
      t.deepEqual(data.jsonBody, sourceData, 'data is sourcedata')
      next(null, {
        fruit:'guava'
      })
    }
  }

  var router = Router({
    middleware:middleware
  })

  var server = http.createServer(router.handler)

  async.series([
    function(next){
      server.listen(8060, next)
    },
    function(next){
      var req = hyperquest('http://127.0.0.1:8060/v1/access', {
        method:'POST'
      })

      var sourceStream = getSourceStream()

      var destStream = concat(function(result){
        result = JSON.parse(result.toString())
        t.deepEqual(result, {
          fruit:'guava'
        }, 'the returned access code is correct')
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


tape('allow all middleware', function (t) {

  var middleware = require('./middleware/allowall')(process.env)

  var router = Router({
    middleware:middleware
  })

  var server = http.createServer(router.handler)

  async.series([
    function(next){
      server.listen(8060, next)
    },
    function(next){
      var req = hyperquest('http://127.0.0.1:8060/v1/access', {
        method:'POST'
      })

      var sourceStream = getSourceStream()

      var destStream = concat(function(result){
        result = JSON.parse(result.toString())
        t.deepEqual(result, {
          access:'all'
        }, 'the returned access code is correct')
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


function reset_postgres(done){
  pg.connect(conString, function(err, client, release) {
    if(err){
      release(err)
      done(err)
      return
    }

/*    console.log(query)
    console.dir(params)*/

    client.query("delete from users;delete from groups;delete from user_groups;delete from group_permissions;delete from permissions;", [], function(err, result) {
      //call `release()` to release the client back to the pool
      release();

      if(err){
        release(err)
        done(err)
        return
      }

      done(null, result)
    });
  });
}


tape('allow group middleware auth', function (t) {

  var middleware = require('./middleware/allowgroup')(process.env)

  var router = Router({
    middleware:middleware
  })

  var server = http.createServer(router.handler)

  async.series([
    function(next){
      server.listen(8060, next)
    },
    function(next){
      reset_postgres(function(){
        // setup permissions for retrieval
        middleware.save_user({id:jenca_user_id}, {id:uuid.v1(),name:"testing group"}, ["projects.test","projects.manage"], function(err){
          next(err)
        })
      })
    },
    function(next){
      var req = hyperquest('http://127.0.0.1:8060/v1/access/projects.test', {
        method:'GET',
        headers: {
            "x-jenca-user":jenca_user_id
        }
      })

      var destStream = concat(function(result){
        result = JSON.parse(result.toString())
        t.deepEqual(result, {
          access:true
        }, 'the returned access code is correct')
        next()
      })

      req.pipe(destStream)

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


tape('allow group middleware auth request', function (t) {

  var middleware = require('./middleware/allowgroup')(process.env)

  var router = Router({
    middleware:middleware
  })

  var server = http.createServer(router.handler)

  async.series([
    function(next){
      server.listen(8060, next)
    },
    function(next){
      reset_postgres(function(){
        // setup permissions for retrieval
        middleware.save_user({id:jenca_user_id}, {id:uuid.v1(),name:"testing group"}, ["projects.create"], function(err){
          next(err)
        })
      })
    },
    function(next){
      var req = hyperquest('http://127.0.0.1:8060/v1/access', {
        method:'POST',
        headers:{
          'x-jenca-user':jenca_user_id
        }
      })

      var sourceStream = getSourceStream()

      var destStream = concat(function(result){
        result = JSON.parse(result.toString())
        t.equal(result.access, true, 'the access code is true')

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