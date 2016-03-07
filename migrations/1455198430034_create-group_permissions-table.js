exports.up = function(pgm) {
	pgm.sql("CREATE TABLE \"group_permissions\" (group_id varchar NOT NULL, permission_id varchar NOT NULL,PRIMARY KEY (group_id,permission_id));")
};

exports.down = function(pgm) {
	pgm.dropTable("group_permissions")
};
