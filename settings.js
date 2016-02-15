module.exports = {
  defaultFilePath:'/tmp/jencadata.json',
  leveldbPort: 8303,
  leveldbHost: "localhost",
  levelPrefix:"projects",

  url_map:{
  	POST:{
  		'/v1/projects':'projects.create'
  	},
  	GET:{
  		'/v1/projects':'projects.view'
  	}
  }
}