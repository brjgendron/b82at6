// modules
const
	bcrypt = require("bcrypt"),
	pool   = require("./database").pool;

// helper functions
function genColorHsl(minL, maxL, saturation) {
	return `hsl(${Math.floor(Math.random() * 360)}, ${saturation}%, ${Math.floor(Math.random() * (maxL - minL)) + minL}%)`;
}

function usernameExists(username_, callback) {
	pool.query("SELECT username FROM users WHERE username = ?", username_, (err, res) => {
		if (err) {
			callback(err, null);
		} else {
			if (res.length !== 0) {
				callback(null, true);
			} else {
				callback(null, false);
			}
		}
	});
}

// account management functions
function signup(username_, password_, callback) {
	usernameExists(username_, (err, exists) => {
		if (err) callback(err, null);
		if (exists) { // check if username is already taken
			callback(null, null, true);
		} else { // if not, hash password and add user to database
			callback(null, null, false);
			bcrypt.hash(password_, 16, (err, hash) => {
				const sql = {
					query: "INSERT INTO users SET ?",
					set: {
						id: null,
						username: username_,
						password: hash,
						color: genColorHsl(50, 80, 90),
						globalAdmin: (username_ === "bones_mcstoner" || username_ === "BigCal") ? true : false
					}
				};
				
				pool.query(sql.query, sql.set, (err, res) => {
					if (err) callback(err, hash, null);
				});
			});
		}
	});
}

function login(username_, password_, callback) {
	const query = "SELECT password FROM users WHERE username = ?";
	pool.query(query, username_, (err, rows) => {
		if (err) callback(err, null, null); // process error in callback

		if (rows.length !== 0) {
			bcrypt.compare(password_, rows[0].password, (err, same) => {
				if (err) callback(err, null, null);

				callback(null, rows[0].password, same);
			});
		}
	});
}

// exports
module.exports = {
	usernameExists: usernameExists,
	signup: signup,
	login: login
}