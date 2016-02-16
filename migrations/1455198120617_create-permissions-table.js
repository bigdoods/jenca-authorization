exports.up = function(pgm) {
	pgm.createTable("permissions",
		{
			id:{
				type:"varchar",
				unique:true,
				primaryKey:true,
				notNull:true
			},
			name:"varchar",
			description:"text",
		})
};

exports.down = function(pgm) {
	pgm.dropTable("groups")
};
