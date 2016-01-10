var path = require('path')
var http = require('http')
var fs = require('fs')
var Router = require('./router')

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

var middleware = []
if(args.middleware){
  var parts = args.middleware.split(',')
  middleware = parts.map(function(name){
    if(!fs.existsSync(path.join(__dirname, 'middleware', name))){
      throw new Error('middleware: ' + name + ' does not exist')
    }
    return require('./middleware/' + name)(process.env)
  })
}

var router = Router({
  middleware:middleware
})

var server = http.createServer(router.handler)

server.listen(args.port, function(err){
  if(err){
    console.error(err.toString())
    return
  }
  console.log('server listening on port: ' + args.port)
})