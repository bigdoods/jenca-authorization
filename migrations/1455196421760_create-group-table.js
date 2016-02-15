exports.up = function(pgm) {
	pgm.createTable("groups",
		{
			id:{
				type:"varchar",
				unique:true,
				primaryKey:true,
				notNull:true
			},
			name:"varchar"
		})
};

exports.down = function(pgm) {
	pgm.dropTable("groups")
};
