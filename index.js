let http    = require("http"),
    express = require("express"),
    socket  = require("socket.io"),
		mysql   = require("mysql"),
		bodyparser = require("body-parser"),
		{ check, validationResult } = require("express-validator/check"),
		// sanitizeBody = require("express-validator/filter"),
		bcrypt = require("bcrypt");

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

app.use(express.static(`${__dirname}/public`));
app.use(bodyparser.urlencoded({extended:true}));


app.get("/", (req, res) => {
	res.sendFile(`${__dirname}/public/html/index/index.min.html`);
});

app.get("/signup", (req, res) => {
	res.sendFile(`${__dirname}/public/html/signup/signup.html`);
});

app.post("/processform", [check("usernamefield").isLength({ min: 5, max: 25 }), check("passwordfield").isLength({ min: 8, max: 128 })], (req, res) => {

	const errors = validationResult(req);
	if (!errors.isEmpty()) return res.status(422).json({ errors: errors.array() });

	let UserSet = {
		id: null,
		username: req.body.usernamefield,
		password: req.body.passwordfield
	}

	const saltRounds = 16;
	// const username = req.body.user_name;
	// const plainTextPassword = req.body.pass_word;

	bcrypt.hash(UserSet.password, saltRounds, (err, hash) => {
		if (err) throw err;

		UserSet.password = hash;
		let inserts = ["users", UserSet];

		pool.query("SELECT username FROM users", (err, rows) => {
			let exists = false;
			for (var i = 0; i < rows.length; i++) {
				if (UserSet.username == rows[i].username) {
					exists = true;
					// return;
				} else {
					exists = false;
				}

			}
			
			console.log(exists);
			if (!exists) {
				pool.query("INSERT INTO ?? SET ?", inserts, (err, res) => {
					if (err) throw err;
					console.log(res);
				});
			} else {
				console.log("fuck you bitch");
			}
		});


		// bcrypt.compare(plainTextPassword, hash, (err, res) => {
		// 	console.log(res);
		// });
	});

	res.send("i need a message here");
});


// app.get("/login", (req, res) => {
// });

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
	let color = `hsl(${Math.floor(Math.random() * 360)}, ${saturation}%, ${Math.floor(Math.random() * (maxL - minL)) + minL}%)`;
	return color;
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

io.on("connection", (socket_) => {
	pool.query("SELECT * FROM messages", (err, rows) => {
		if (err) throw err;
		

		if (rows.length > 0) {
			if (rows.length >= 50) {
				let offset = rows.length - 50;
				console.log("rows.length:", rows.length, "\noffset:", offset);
		
				for (var i = offset; i < rows.length; i++) {
					console.log(i);
					io.to(socket_.id).emit("garbage test", rows[i]);
				}
			} else {
				for (var i = 0; i < rows.length; i++) {
					io.to(socket_.id).emit("garbage test", rows[i]);
				}
			}
		}
	});

	let user = new User(genUserID(6), "", genColorHsl(50, 80, 90));
	users.push(user);

	io.emit("user.connect", users, user);
	console.log(`\nuser ${users.slice(-1)[0].username} connected`);
	console.log("currently connected users:", users); 
	console.log(io.engine.clientsCount);


	socket_.on("user.setusername", (newUsername_, oldUsername_, user_) => {
		oldUsername_ = user.username;
		user.username = newUsername_;
		console.log(user.id, "has changed their username to", newUsername_);
		io.emit("user.setusername", users, user, oldUsername_);
	});

	socket_.on("chat.message", (message_) => {
		
		timestamp = genTimestamp();
		let message = new Message(message_, user, timestamp);

		let messageQuery = {
			id: null,
			contents: message.message,
			senderID: message.sender.id,
			senderUsername: message.sender.username,
			senderColorHSL: message.sender.color,
			messageTimestamp: null,
			server: "temp-server",
			channel: "temp-channel"
		};

		let table = "messages";
		let inserts = ["messages", messageQuery];
		pool.query("INSERT INTO ?? SET ?", inserts, (err, res) => {
			if (err) throw err;
			pool.query("SELECT * FROM messages WHERE id = ?", res.insertId, (err, rows) => {
				if (err) throw err;

				io.emit("chat.message", rows[0]);
				console.log(rows[0]);
			});
		});

		// io.emit("chat.message", message);
		console.log(`\n[${message.timestamp}] ${message.sender.username}: ${message.message}`);
	});


	socket_.on("disconnect", () => {
		let lastUser;

		for (var i = 0; i < users.length; i++) {
			if (user == users[i]) {
				lastUser = users[i];
				users.splice(i, 1);
			}
		}

		io.emit("user.disconnect", users, user);
		console.log(`\nuser ${lastUser.username} (${lastUser.id}) disconnected`);
		console.log("currently connected users:", users); 
	});

	socket_.on("deeznuts", (deeznuts_) => {
		deeznuts_ = "deeznuts.ogg";
		io.emit("deeznuts", deeznuts_);
	}); 

	socket_.on("username request", (username_) => {
		let querySet = ["users"];
		var match = false;
		pool.query("SELECT username FROM ??", querySet, (err, rows) => {
			if (err) throw err;

			for (var i = 0; i < rows.length; i++) {
				console.log(rows[i]);
				if (username_ == rows[i].username) {
					match = true;
					io.emit("matched username", match);
					console.log(match);
				} else {
					match = false;
					io.emit("matched username", match);
					console.log(match);
				}
			}

			// if (rows[0].username == username_) {
			// 	match = true;
			// 	socket_.emit("matched username", match);
			// 	console.log("usernames match");
			// } else {
			// 	match = false;
			// 	socket_.emit("matched username", match);
			// 	console.log("usernames do not match");
			// }
		});
		// let inserts = ["users", "username", username_];
		// pool.query("SELECT * FROM ?? WHERE ? = ?", inserts, (err, rows) => {
		// 	console.log(rows);
		// });
		
		// console.log(username_);
	});
});

server.listen(port, hostname, () => {
	console.log(`listening on port ${port}`);
});