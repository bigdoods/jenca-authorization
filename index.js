var path = require('path')
var http = require('http')
var fs = require('fs')
var Router = require('./router')

var args = require('minimist')(process.argv, {
  alias:{
    p:'port',
    m:'middleware',
    h:'host',
    u:'username',
    p:'password',
    d:'database'
  },
  default:{
    port:process.env.PORT || 80,
    middleware:process.env.MIDDLEWARE || 'allowall',
    host:process.env.POSTGRES_HOST || 'postgres',
    username:process.env.POSTGRES_USER || 'username',
    password:process.env.POSTGRES_PASSWORD || 'password',
    database:process.env.POSTGRES_DATABASE || 'jenca-authorisation'
  }
})

var middleware = null
if(args.middleware){

  if(!fs.existsSync(path.join(__dirname, 'middleware', args.middleware + '.js'))){
    throw new Error('middleware: ' + args.middleware + ' does not exist')
  }
  middleware = require('./middleware/' + args.middleware)(args)
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