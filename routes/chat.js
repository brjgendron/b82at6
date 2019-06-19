// modules
const
	express = require("express"),
	io      = require("../index").io,
	pool    = require("../util/database").pool;
	router  = express.Router();
// middleware

// routes
router.route("/")
	.get((req, res) => {
		res.render("chat/templates/chat");
	});

io.on("connect", socket => {
	const sessionUsername = socket.handshake.session.username;
	let connectedUsers = [];

	pool.query("SELECT * FROM messages", (err, rows) => {
		if (err) throw err;

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
	pool.query(query, sessionUsername, (err, rows) => {
		if (err) throw err;
		if (rows.length !== 0) {
			const userSet = {
				id: rows[0].id,
				username: rows[0].username,
				color: rows[0].color,
				globalAdmin: rows[0].globalAdmin
			};

			connectedUsers.push(userSet);
			io.emit("user connected", userSet, connectedUsers);

			socket.on("chat message", message => {
				const messageSet = {
					id: null,
					contents: message,
					senderID: userSet.id,
					senderUsername: userSet.username,
					senderUsernameWithID: `${userSet.username}-${userSet.id}`,
					senderColorHSL: userSet.color,
					messageTimestamp: null,
					server: "temp-server",
					channel: "temp-channel"
				};
				
				let sql = {
					query: "INSERT INTO messages SET ?",
					set: messageSet
				};

				pool.query(sql.query, sql.set, (err, res) => {
					if (err) throw err;

					pool.query("SELECT * FROM messages WHERE id = ?", res.insertId, (err, rows) => {
						if (err) throw err;
						io.emit("chat message", rows[0]);
					})
				});
			});
		}
	});
});

module.exports = router;