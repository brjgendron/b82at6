let http    = require("http"),
    express = require("express"),
    socket  = require("socket.io"),
		mysql   = require("mysql"),
		bodyparser = require("body-parser"),
		{ check, validationResult } = require("express-validator/check"),
		// sanitizeBody = require("express-validator/filter"),
		bcrypt = require("bcrypt"),
		cookieParser = require("cookie-parser")
		user = require("./user");

const pool = mysql.createPool({
	connectionLimit: 100,
	host: process.env.MYSQL_HOST,
	user: process.env.MYSQL_U,
	password: process.env.MYSQL_P,
	database: process.env.MYSQL_CHATDB
});

let app = express();
let server = http.createServer(app);
let io = socket(server);

const port = process.env.PORT || 3000;
let hostname = "0.0.0.0";

app.set("view engine", "pug");
app.use(cookieParser());
app.use(express.static(`${__dirname}/public`));
app.use(bodyparser.urlencoded({extended:true}));

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

function checkCookie(username, hash, callback) {
	bcrypt.compare(username, hash, (err, same) => {
		if (err) callback(err, null);
		
		if (same) {
			callback(null, true);
		} else {
			callback(null, false);
		}
	});
}

function signup(username_, password_, callback) {
	const query = "INSERT INTO users SET ?";

	usernameExists(username_, (err, exists) => {
		if (exists) { // check if username is already taken
			callback(null, true);
		} else { // if not, hash password and add user to database
			callback(null, false);
			bcrypt.hash(password_, 16, (err, hash) => {
				pool.query(query, { id: null, username: username_, password: hash, color: genColorHsl(50, 80, 90), globalAdmin: (username_ === "bones_mcstoner" || username_ === "BigCal") ? true : false }, (err, res) => {
					if (err) throw err;
					console.log(res);
				});
			});
		}
	});
}

function login(username_, password_, callback) {
	let query = "SELECT password FROM users WHERE username = ?";
	pool.query(query, username_, (err, rows) => {
		if (err) throw err;

		if (rows.length !== 0) {
			console.log(rows);
			bcrypt.compare(password_, rows[0].password, (err, same) => {
				if (err) callback(err, null);

				callback(null, same);
			});
		}
	});
}


app.get("/", (req, res) => {
	res.redirect("/chat");
});

app.get("/chat", (req, res) => {
	io.on("connection", (socket) => {
		let connectedUsers = [];
		pool.query("SELECT * FROM messages", (err, rows) => {
			if (rows.length > 0) {
				if (rows.length >= 50) {
					let offset = rows.length - 50;
					console.log("rows.length:", rows.length, "\noffset:", offset);

					for (var i = offset; i < rows.length; i++) {
						console.log(i);
						io.to(socket.id).emit("show previous messages", rows[i]);
					}
				} else {
					for (var i = 0; i < rows.length; i++) {
						io.to(socket.id).emit("show previous messages", rows[i]);
					}
				}
			}
		});

		let query = "SELECT id, username, color, globalAdmin FROM users WHERE username = ?";
		pool.query(query, req.cookies.user.x, (err, rows) => {
			if (err) throw err;

			if (rows.length !== 0) {
				let userSet = {
					id: rows[0].id,
					username: rows[0].username,
					color: rows[0].color,
					globalAdmin: rows[0].globalAdmin
				};
				
				connectedUsers.push(userSet);
				
				io.emit("new connection", userSet, connectedUsers);
				console.log(userSet);
				
				socket.on("message", (message_) => {
					let messageSet = {
						id: null,
						contents: message_,
						senderID: userSet.id,
						senderUsername: userSet.username,
						senderUsernameWithID: `${userSet.username}-${userSet.id}`,
						senderColorHSL: userSet.color,
						messageTimestamp: null,
						server: "temp-server",
						channel: "temp-channel"
					};
					
					let query = "INSERT INTO ?? SET ?";
					let insert = ["messages", messageSet];
					pool.query(query, insert, (err, res) => {
						if (err) throw err;
	
						pool.query("SELECT * FROM messages WHERE id = ?", res.insertId, (err, rows) => {
							if (err) throw err;
			
							console.log(rows[0]);
							io.emit("message", rows[0]);
						});
					});
				});
			}
		});
	});

	if (Object.keys(req.cookies).includes("user", 0)) {

		checkCookie(req.cookies.user.x, req.cookies.user.y, (err, valid) => {
			if (valid) {
				res.sendFile(`${__dirname}/public/html/index/index.min.html`);
			} else {
				res.redirect("/login");
			}
		});
	} else {
		res.redirect("/login");
	}
});

app.get("/signup", (req, res) => {
	res.sendFile(`${__dirname}/public/html/signup/signup.html`);
});

app.get("/login", (req, res) => {
	res.sendFile(`${__dirname}/public/html/login/login.html`);
});

app.post("/processlogin", [check("usernamefield").isLength({ min: 5, max: 25 }), check("passwordfield").isLength({ min: 8, max: 128 })], (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

	login(req.body.usernamefield, req.body.passwordfield, (err, success) => {
		if (success) {
			bcrypt.hash(req.body.usernamefield, 10, (err, hash) => {
				if (err) throw err;
				res.cookie("user", { x: req.body.usernamefield, y: hash }, { httpOnly: true, secure: true });
				res.redirect("/");
			});
			
		} else {
			res.send("username and password do not match");
		}
	});
});

app.post("/processsignup", [check("usernamefield").isLength({ min: 5, max: 25 }), check("passwordfield").isLength({ min: 8, max: 128 })], (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

	signup(req.body.usernamefield, req.body.passwordfield, (err, accountExists) => {
		if (accountExists) {
			res.send("invalid username or password");
		} else {
			bcrypt.hash(req.body.usernamefield, 10, (err, hash) => {
				if (err) throw err;
				res.cookie("user", { x: req.body.usernamefield, y: hash }, { httpOnly: true, secure: true });
				res.redirect("/");
			});
		}
	});
});

app.get("/usersettings", (req, res) => {
	res.render("usersettings.pug", { title: "User Settings", placeholder: req.cookies.user.x, color: "red" });
});

function genUserID(length) {
	let result = "";
	let charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let charLength = charset.length;

	for (var i = 0; i < length; i++) {
		result += charset.charAt(Math.floor(Math.random() * charLength));
	}

	return result;
}

function genColorHsl(minL, maxL, saturation) {
	// let color = `hsl(${Math.floor(Math.random() * 360)}, ${saturation}%, ${Math.floor(Math.random() * (maxL - minL)) + minL}%)`;
	return `hsl(${Math.floor(Math.random() * 360)}, ${saturation}%, ${Math.floor(Math.random() * (maxL - minL)) + minL}%)`;
}

function genTimestamp() {
	dateTime = new Date();
	return `${(dateTime.getMonth() + 1)}/${dateTime.getDate()}/${dateTime.getFullYear()} ${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds()}`;
}

class User {
	constructor(id, username, color) {
		this.id = id;
		if (username != "") {
			this.username = username;
		} else {
			this.username = id;
		}
		this.color = color;
	}
}

class Message {
	constructor(message, sender, timestamp) {
		this.message = message;
		this.sender = sender;
		this.timestamp = timestamp;
	}
}

let users = [];

function connect(cookie, callback) {
	callback();
}

// function getCookies(callback) {
	
// }

// io.on("connection", (socket_) => {
// 	pool.query("SELECT * FROM messages", (err, rows) => {
// 		if (err) throw err;

// 		if (rows.length > 0) {
// 			if (rows.length >= 50) {
// 				let offset = rows.length - 50;
// 				console.log("rows.length:", rows.length, "\noffset:", offset);
		
// 				for (var i = offset; i < rows.length; i++) {
// 					console.log(i);
// 					io.to(socket_.id).emit("show previous messages", rows[i]);
// 				}
// 			} else {
// 				for (var i = 0; i < rows.length; i++) {
// 					io.to(socket_.id).emit("show previous messages", rows[i]);
// 				}
// 			}
// 		}
// 	});

// 	let user = new User(genUserID(6), "", genColorHsl(50, 80, 90));
// 	users.push(user);

// 	io.emit("user.connect", users, user);
// 	console.log(`\nuser ${users.slice(-1)[0].username} connected`);
// 	console.log("currently connected users:", users); 
// 	console.log(io.engine.clientsCount);


// 	socket_.on("user.setusername", (newUsername_, oldUsername_, user_) => {
// 		oldUsername_ = user.username;
// 		user.username = newUsername_;
// 		console.log(user.id, "has changed their username to", newUsername_);
// 		io.emit("user.setusername", users, user, oldUsername_);
// 	});

// 	socket_.on("chat.message", (message_) => {
		
// 		timestamp = genTimestamp();
// 		let message = new Message(message_, user, timestamp);

// 		let messageQuery = {
// 			id: null,
// 			contents: message.message,
// 			senderID: message.sender.id,
// 			senderUsername: message.sender.username,
// 			senderColorHSL: message.sender.color,
// 			messageTimestamp: null,
// 			server: "temp-server",
// 			channel: "temp-channel"
// 		};

// 		let table = "messages";
// 		let inserts = ["messages", messageQuery];
// 		pool.query("INSERT INTO ?? SET ?", inserts, (err, res) => {
// 			if (err) throw err;
// 			pool.query("SELECT * FROM messages WHERE id = ?", res.insertId, (err, rows) => {
// 				if (err) throw err;

// 				io.emit("chat.message", rows[0]);
// 				console.log(rows[0]);
// 			});
// 		});

// 		// checkCookie(req.cookies.user.x, req.cookies.user.y, (err, valid) => {
// 		// 	if (err) throw err;

// 		// 	let messageSet = {
// 		// 		id: null,
// 		// 		contents: message_,
// 		// 		sender
// 		// 	}
// 		// 	let query = "INSERT INTO ?? SET ?";
// 		// 	let inserts = ["messages", messageQuery];
// 		// 	if (valid) {
// 		// 		pool.query(query, inserts, (err, res) => {
// 		// 			if (err) throw err;

// 		// 			pool.query()

// 		// 			io.emit("chat.message", rows[0]);
// 		// 		});
// 		// 	}
// 		// });
// 		console.log(`\n[${message.timestamp}] ${message.sender.username}: ${message.message}`);
// 	});


// 	socket_.on("disconnect", () => {
// 		let lastUser;

// 		for (var i = 0; i < users.length; i++) {
// 			if (user == users[i]) {
// 				lastUser = users[i];
// 				users.splice(i, 1);
// 			}
// 		}

// 		io.emit("user.disconnect", users, user);
// 		console.log(`\nuser ${lastUser.username} (${lastUser.id}) disconnected`);
// 		console.log("currently connected users:", users); 
// 	});

// 	socket_.on("deeznuts", (deeznuts_) => {
// 		deeznuts_ = "deeznuts.ogg";
// 		io.emit("deeznuts", deeznuts_);
// 	}); 

// 	socket_.on("username request", (username_) => {
// 		usernameExists(username_, (err, res) => {
// 			io.emit("matched username", res);
// 		});
// 	});
// });

server.listen(port, hostname, () => {
	console.log(`listening on port ${port}`);
});