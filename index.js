let http    = require("http"),
    express = require("express"),
    socket  = require("socket.io"),
    mysql   = require("mysql");

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

app.get("/", (req, res) => {
	res.sendFile(`${__dirname}/public/index.html`);
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
		
		for (var i = 0; i < rows.length; i++) {
			io.to(socket_.id).emit("garbage test", rows[i]);
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

		pool.query("INSERT INTO messages SET ?", messageQuery, (err, res) => {
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
});

server.listen(port, hostname, () => {
	console.log(`listening on port ${port}`);
});