let http = require("http");
let express = require("express");
let socket = require("socket.io");

let app = express();
let server = http.createServer(app);
let io = socket(server);
let port = process.env.PORT;
let hostname = "0.0.0.0";

function generateUserID(length) {
	let result = "";
	let charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let charLength = charset.length;

	for (var i = 0; i < length; i++) {
		result += charset.charAt(Math.floor(Math.random() * charLength));
	}

	return result;
}

function randomColor(minBrightness, maxBrightness) {
	let result = "rgb(";
 //prevent the color from being unreadable against the background
	// let charset = "0123456789ABCDEF";
	for (var i = 0; i < 3; i++) {
		result += `${Math.floor((Math.random() * (maxBrightness - minBrightness))) + minBrightness}, `;
	}
	let color = result.slice(0, -2);
	color += ")"
	return color;
}


app.use(express.static(`${__dirname}/public`));

app.get("/", (req, res) => {
	res.sendFile(`${__dirname}/public/index.html`);
});

io.on("connection", (socket) => {
	let senderID = generateUserID(6);
	let userColor = randomColor(50, 200);
	console.log(`user ${senderID} connected, assigned color ${userColor}`);
	
	io.emit("user connect", senderID, userColor);

	socket.on("chat message", (msg, userID, time, color) => {
		userID = senderID;
		dateTime = new Date();
		time = `${(dateTime.getMonth() + 1)}/${dateTime.getDate()}/${dateTime.getFullYear()} ${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds()}`;
		color = userColor;

		io.emit("chat message", msg, userID, time, color);
		console.log(`message: ${msg}\nsender: ${userID}\ntime: ${time}`);
	});

	socket.on("disconnect", (userID, color) => {
		userID = senderID;
		color = userColor;

		io.emit("user disconnect", userID, color);
		console.log(`user ${userID} disconnected`);
	});
});

server.listen(port, hostname, () => {
	console.log(`listening on port ${port}`);
});