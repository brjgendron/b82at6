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

function randomColorHsl(minL, maxL, saturation) {
	let color = `hsl(${Math.floor(Math.random() * 360)}, ${saturation}%, ${Math.floor(Math.random() * (maxL - minL)) + minL}%)`;
	return color;
}

app.use(express.static(`${__dirname}/public`));

app.get("/", (req, res) => {
	res.sendFile(`${__dirname}/public/index.html`);
});

let users = [];
let connectedUsers = 0;

io.on("connection", (socket) => {
	// let testUser = new User(generateUserID(6), randomColorHsl(35, 65, 75));
	// console.log(testUser.color());
	let senderID = generateUserID(6);
	let userColor = randomColorHsl(35, 65, 100);
	console.log(`user ${senderID} connected, assigned color ${userColor}`);
	
	users.push([senderID, userColor]);
	connectedUsers++;
	io.emit("user connect", senderID, userColor, users);
	console.log(users);

	socket.on("chat message", (msg, userID, time, color) => {
		userID = senderID;
		dateTime = new Date();
		time = `${(dateTime.getMonth() + 1)}/${dateTime.getDate()}/${dateTime.getFullYear()} ${dateTime.getHours()}:${dateTime.getMinutes()}:${dateTime.getSeconds()}`;
		color = userColor;

		io.emit("chat message", msg, userID, time, color);
		console.log(`message: ${msg}\nsender: ${userID}\ntime: ${time}`);
	});

	socket.on("disconnect", (userID, color, currentUsers) => {
		userID = senderID;
		color = userColor;
		currentUsers = users;
		// console.log(users);
		// console.log(currentUsers);
		for (var i = 0; i < users.length; i++) {
			if (userID == users[i][0] && color == users[i][1]) {
				users.splice(i, 1);
				console.log(users);
			}
		}

		connectedUsers--;
		io.emit("user disconnect", userID, color, currentUsers);
		console.log(`user ${userID} disconnected`);
		console.log(currentUsers);
	});
});

server.listen(port, hostname, () => {
	console.log(`listening on port ${port}`);
});