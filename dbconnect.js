var pgp = require('pg-promise')();
pgp.pg.defaults.ssl = true;

//db connect string

var conn = process.env.DATABASE || 'postgres://ovupydrjqbmvhi:cbe82bb1f20f88bf4eb55412a30762cc0d972d6d5bdcd0763c7bbed8a7952cca@ec2-54-247-123-130.eu-west-1.compute.amazonaws.com:5432/dcrqvvimje2voh';

var db = pgp(conn);


//export module
module.exports = db;
