let http = require("http");
let express = require("express");
let socket = require("socket.io");

let app = express();
let server = http.createServer(app);
let io = socket(server);
let port = process.env.PORT;
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
	let user = new User(genUserID(6), "", genColorHsl(35, 65, 80));
	users.push(user);

	io.emit("user.connect", users, user);
	console.log(`\nuser ${users.slice(-1)[0].username} connected`);
	console.log("currently connected users:", users); 
	console.log(io.engine.clientsCount);


	socket_.on("user.setusername", (newUsername_, user_) => {
		user.username = newUsername_;
		console.log(user.id, "has changed their username to", newUsername_);
		io.emit("user.setusername", users, user);
	});

	socket_.on("chat.message", (message_) => {
		timestamp = genTimestamp();
		let message = new Message(message_, user, timestamp);

		io.emit("chat.message", message);
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
});

server.listen(port, hostname, () => {
	console.log(`listening on port ${port}`);
});