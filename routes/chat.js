// modules
const
	express = require("express"),
	pug     = require("pug"),
	io      = require("../index").io,
	pool    = require("../util/database").pool,
	router  = express.Router();
// middleware

// routes
router.route("/")
	.get((req, res) => {
		if (!req.session.username) {
			res.redirect("/account/signup");
		} else {
			res.render("chat/templates/chat");
		}
	});

io.on("connect", socket => {
	const sessionUsername = socket.handshake.session.username;
	let connectedUsers = [];
	let templatePath = "views/chat/templates/message.pug";
	let templateOptions = {};

	pool.query("SELECT * FROM messages", (err, rows) => {
		if (err) console.error(err);
		
		if (rows.length > 0) {
			if (rows.length >= 50) {
				let offset = rows.length - 50;
				console.log("rows.length:", rows.length, "\noffset:", offset);

				for (var i = offset; i < rows.length; i++) {
					console.log(i);
					templateOptions = {
						userid: rows[i].senderID,
						username: rows[i].senderUsername,
						usercolor: rows[i].senderColorHSL,
						timestamp: rows[i].messageTimestamp,
						messagebody: rows[i].contents
					}
					io.to(socket.id).emit("show previous messages", rows[i], pug.renderFile(templatePath, templateOptions));
				}
			} else {
				for (var i = 0; i < rows.length; i++) {
					templateOptions = {
						userid: rows[i].senderID,
						username: rows[i].senderUsername,
						usercolor: rows[i].senderColorHSL,
						timestamp: rows[i].messageTimestamp,
						messagebody: rows[i].contents
					}
					io.to(socket.id).emit("show previous messages", rows[i], pug.renderFile(templatePath, templateOptions));
				}
			}
		}
	});

	let query = "SELECT id, username, color, globalAdmin FROM users WHERE username = ?";
	pool.query(query, sessionUsername, (err, rows) => {
		if (err) console.error(err);
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
					if (err) console.error(err);

					pool.query("SELECT * FROM messages WHERE id = ?", res.insertId, (err, rows) => {
						if (err) console.error(err);

						let templateOptions = {
							userid: rows[0].senderID,
							username: rows[0].senderUsername,
							usercolor: rows[0].senderColorHSL,
							timestamp: rows[0].messageTimestamp,
							messagebody: rows[0].contents
						};

						io.emit("chat message", rows[0], pug.renderFile(templatePath, templateOptions));
					})
				});
			});
		}
	});
});

module.exports = router;