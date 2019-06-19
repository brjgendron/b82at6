// modules
const
	express    = require("express"),
	bodyparser = require("body-parser"),
	{ check, validationResult } = require("express-validator/check"),
	session    = require("express-session"),
	MySQLStore = require("express-mysql-session")(session),
	accMgmt    = require("../util/account-management"),
	pool       = require("../util/database").pool,
	server     = require("../index").server,
	router     = express.Router();

// validation
const
	usernameMinLength      = 5,
	usernameMaxLength      = 25,
	passwordMinLength      = 8,
	passwordMaxLength      = 128,
	validationRequirements = [
		check("username").isLength({
			min: usernameMinLength,
			max: usernameMaxLength
		}),
		check("password").isLength({
			min: passwordMinLength,
			max: passwordMaxLength
		})
	];

// middleware
router.use(bodyparser.urlencoded({ extended: true }));

// routes
router.route("/")
	.get((req, res) => {
		res.redirect("/account/signup");
	});

router.route("/signup")
	.get((req, res) => {
		res.render("account/signup/templates/signup", { title: "sign up", text: "sign up" });
	})
	.post(validationRequirements, (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(418).json({ errors: errors.array() });

		accMgmt.signup(req.body.username, req.body.password, (err, hash, exists) => {
			if (err) res.status(418).send(err);
			if (!exists) {
				req.session.username = req.body.username;
				req.session.password = hash;

				res.redirect("../../chat");
			} else {
				res.status(418).send("that account already exists");
			}
		});
	});

router.route("/login")
	.get((req, res) => {
		res.render("account/login/templates/login", { title: "log in", text: "log in" });
	})
	.post(validationRequirements, (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(418).json({ errors: errors.array() });
	
		accMgmt.login(req.body.username, req.body.password, (err, hash, exists) => {
			if (err) {
				res.status(418).send(err);
				console.error(err);
			}

			if (exists) {
				req.session.username = req.body.username;
				req.session.password = hash;
				console.log("logged in to account " + req.body.username);
				res.redirect("../../chat");
				// module.exports = { sessionUsername: req.session.username };
			}
		});
	});

router.route("/logout")
	.get((req, res) => {
		req.session.destroy(err => {
			if (err) {
				console.error(err);
				res.status(418).send("there was an error");
			} else {
				res.send("you have logged out of your account");
			}
		});
	})

router.route("/settings")
	.get((req, res) => {
		res.render("account/settings/templates/settings", { title: "account settings", text: "account settings" });
	});

// other routes
router.route("*")
	.get((req, res) => {
		res.status(404).render("errors/templates/404", { title: "404", error: "this page doesn't exist" });
	});

module.exports = { router, MySQLStore };