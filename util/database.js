// modules
const
	dotenv = require("dotenv"),
	mysql  = require("mysql");

dotenv.config();

const pool = mysql.createPool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME
});

module.exports = { pool };
