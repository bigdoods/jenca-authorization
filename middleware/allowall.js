module.exports = function(config){
  return function(data, done){
    done(null, {
      access:'all'
    })
  }
}