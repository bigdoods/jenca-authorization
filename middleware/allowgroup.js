var pg = require('pg');

var settings = require('../settings.js');
var uuid = require('uuid');

function parse_conditions(data, seperator){
  var conditions = Object.keys(data).map(function(e,i){
    return ""+ e +"=$"+ (i+1) + ""
  })

  return conditions.join(seperator)
}

module.exports = function(config){

  var host = config.host || '127.0.0.1'
  
  if(host.indexOf('env:')==0){
    var envname = host.split(':')[1]
    host = process.env[envname]
  }
  
  var username = config.username || 'username'
  var password = config.password || 'password'
  var database = config.database || 'jenca-authorisation'
  var connection_string = 'postgres://' + username + ':' + password + '@' + host + '/jenca-authorisation';
  
  function pg_query(query, params, done){
    //this initializes a connection pool
    //it will keep idle connections open for a (configurable) 30 seconds
    //and set a limit of 20 (also configurable)
    pg.connect(connection_string, function(err, client, release) {
      if(err){
        release(err)
        done(err)
        return
      }

  /*    console.log(query)
      console.dir(params)*/

      client.query(query, params, function(err, result) {
        //call `release()` to release the client back to the pool
        release();

        if(err){
  /*        console.log(err.toString())
          console.log(query)
          console.dir(params)
  */
          release(err)
          done(err)
          return
        }

        done(null, result)
      });
    });
  }

  function get(params, table, done){
    var conditions = parse_conditions(params, " AND ")
    var param_values = Object.keys(params).map(function(k){return params[k]});
    pg_query("SELECT * FROM "+ table +" WHERE "+ conditions +";", param_values, function(err, result){
      if(err) return done(err)

      done(null, result.rows[0])
    })
  }

  function set(params, table, done){
    var param_keys = []
    var param_values = []
    Object.keys(params).forEach(function(k){
      if(params[k] == null)
        return
      param_keys.push(k)
      param_values.push(params[k])
    });

    if(param_keys.length ==0 || param_keys.length != param_values.length)
      return done('key value mismatch')

    var value_substitutions = param_keys.map(function(e,i){
      return "$"+(i+1)
    })
    var query_pattern = "INSERT INTO "+ table +" ("+ (param_keys.join(",")) +") VALUES ("+ value_substitutions.join() +");"
    pg_query(query_pattern, param_values, function(err, result){
      if(err) return done(err)

      done(null, params)
    })
  }

  function save_unique_permission(name, description, done){
    get({name:name}, 'permissions', function(err, permission){
      if(err) return done(err)

      if(permission == undefined)
        permission = {id:uuid.v1()}

      set({id:permission.id,name:name, description:description}, "permissions", function(err){
        if(err) return done(err)

        done(null, permission.id)
      })
    })
  }

  function save_unique_group(name, done){
    get({name:name}, 'groups', function(err, group){
      if(err) return done(err)

      var group_id = group.group_id
      if(group_id == undefined)
        group_id = uuid.v1()

      set({id:group_id,name:name}, "groups", function(err){
        if(err) return done(err)

        done(null, group_id)
      })
    })
  }

  function save_user(user, group, permissions, done){
    set({id:user.id}, "users", function(err){
      if(err) return done(err)

      set({id:group.id,name:group.name}, "groups", function(err, group){
        if(err) return done(err)

        set({group_id:group.id,user_id:user.id}, "user_groups", function(err){

          // save permissions
          permissions.forEach(function(permission, index){
            save_unique_permission(permission, null, function(err, permission_id){
              if(err) return done(err)

              set({group_id:group.id,permission_id:permission_id}, "group_permissions", function(err){
                if(err) return done(err)

                if(index == (permissions.length-1))
                  done(null, group.id)
              })
            })
          })
        })
      })
    })
  }

  function authorise(userid, permissionid, done){
    pg_query("SELECT ug.group_id FROM users u LEFT JOIN user_groups ug ON u.id=ug.user_id WHERE u.id=$1", [userid], function(err, result){
      if(err) return done(err)

      var group_ids = result.rows.map(function(u){
        return u.group_id
      })

      pg_query("SELECT p.* FROM group_permissions gp INNER JOIN permissions p ON p.name=$1 AND gp.permission_id=p.id WHERE gp.group_id=$2", [permissionid, group_ids.join("','")], function(err, result){
        if(err) return done(err)

        var access = {
          access:false
        }

        if(result.rows.length >0)
          access.access = true

        done(null, access)
      })
    })
  }

  function authorise_request(req, done){
    var userid = req.headers['x-jenca-user']
    var permissionid = settings.url_map[req.method.toUpperCase()][req.jsonBody.url]

    // console.log(req.method.toUpperCase() + ' : '+ req.jsonBody.url +' -> '+ permissionid)

    authorise(userid, permissionid, done)
  }

  return {
    authorise:authorise,
    authorise_request:authorise_request,
    save_user:save_user
  }
}