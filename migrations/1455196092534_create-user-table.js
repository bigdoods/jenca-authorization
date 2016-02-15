exports.up = function(pgm) {
	pgm.createTable("users",
		{id:{
			type:"varchar",
			unique:true,
			primaryKey:true,
			notNull:true
		}})
};

exports.down = function(pgm) {
	pgm.dropTable("users")
};
