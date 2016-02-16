module.exports = function(config){
  function authorise_request(data, done){
    done(null, {
      access:'all'
    })
  }

  return {
  	authorise_request:authorise_request
  }
}