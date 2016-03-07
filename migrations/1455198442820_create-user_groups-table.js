exports.up = function(pgm) {
	pgm.sql("CREATE TABLE \"user_groups\" (group_id varchar NOT NULL, user_id varchar NOT NULL,PRIMARY KEY (group_id,user_id));")
};

exports.down = function(pgm) {
	pgm.dropTable("user_groups")
};