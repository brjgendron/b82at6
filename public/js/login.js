(() => {
	let socket = io();
	
	let toggleVisibility = document.getElementsByClassName("visibility-toggle");
	
	let passwordLengthCounter = document.querySelector(".password-length");
	let usernameLengthCounter = document.querySelector(".username-length");
	let usernameField = document.querySelector(".username-input");
	let passwordField = document.querySelector(".password-input");
	let visibleToggle = document.getElementsByClassName("visibility-toggle")[0];
	let hiddenToggle = document.getElementsByClassName("visibility-toggle")[1];
	let submitButton = document.querySelector(".submit-button");
	let passwordVisible;
	
	let errors = {
		username: {
			taken: "This username is taken",
			tooLong: "This username is too long",
			tooShort: "This username is too short"
		},

		password: {
			tooLong: "This password is too long",
			tooShort: "This password is too short"
		}
	};
	
	function validateUsername(field_, username_, minLength_, maxLength_) {
		let valid = false;

		if (username_.length >= minLength_ && username_.length <= maxLength_) {
			valid = true;
			socket.emit("username request", username_);
			socket.on("matched username", (match_) => {
				console.log(match_)
				if (match_) {
					field_.classList.add("valid");
					field_.classList.remove("invalid");
					
					valid = true;
				} else {
					field_.classList.add("invalid");
					field_.classList.remove("valid");
					
					valid = false;
				}
			});
		} else {
			field_.classList.add("invalid");
			field_.classList.remove("valid");
			
			valid = false;
		}

		if (username_.length < minLength_) {
			usernameLengthCounter.innerText = `${username_.length}/5`;
			usernameLengthCounter.classList.add("invalid");
			usernameLengthCounter.classList.remove("valid");
		} else if (username_.length >= minLength_ && username_.length < (maxLength_ - 5)) {
			usernameLengthCounter.innerText = ``;
			usernameLengthCounter.classList.add("valid");
			usernameLengthCounter.classList.remove("invalid");
		} else if (username_.length >= (maxLength_ - 5) && username_.length <= maxLength_) {
			usernameLengthCounter.innerText = `${username_.length}/25`;
			usernameLengthCounter.classList.add("valid");
			usernameLengthCounter.classList.remove("invalid");
		} else if (username_.length > maxLength_) {
			usernameLengthCounter.innerText = `25/25`;
			usernameLengthCounter.classList.add("invalid");
			usernameLengthCounter.classList.remove("valid");
		}

		return valid;
	}

	function validatePassword(field_, password_, minLength_, maxLength_) {
		let valid = false;
		
		if (password_.length >= minLength_ && password_.length <= maxLength_) {
			field_.classList.add("valid");
			field_.classList.remove("invalid");

			valid = true;
		} else {
			field_.classList.add("invalid");
			field_.classList.remove("valid");
			
			valid = false;
		}
		
		if (password_.length < minLength_) {
			passwordLengthCounter.innerText = `${password_.length}/8`;
			passwordLengthCounter.classList.add("invalid");
			passwordLengthCounter.classList.remove("valid");
		} else if (password_.length >= minLength_) {
			passwordLengthCounter.innerText = `8/8`;
			passwordLengthCounter.classList.add("valid");
			passwordLengthCounter.classList.remove("invalid");
		}

		return valid;
	}

	usernameField.addEventListener("keyup", (event_) => {
		if (!validateUsername(usernameField, usernameField.value, 5, 25) || !validatePassword(passwordField, passwordField.value, 8, 128)) {
			submitButton.toggleAttribute("disabled", true);
		} else {
			submitButton.toggleAttribute("disabled", false);
		}
	});

	passwordField.addEventListener("keyup", (event_) => {
		if (!validatePassword(passwordField, passwordField.value, 8, 128) || !validateUsername(usernameField, usernameField.value, 5, 25)) {
			submitButton.toggleAttribute("disabled", true);
		} else {
			submitButton.toggleAttribute("disabled", false);
		}
	});

	visibleToggle.addEventListener("click", (event_) => {
		if (visibleToggle.classList.contains("visible")) {
			visibleToggle.classList.add("hidden");
			visibleToggle.classList.remove("visible");
			
			hiddenToggle.classList.add("visible");
			hiddenToggle.classList.remove("hidden");
			
			passwordVisible = false;
		} else if (visibleToggle.classList.contains("hidden")) {
			visibleToggle.classList.add("visible");
			visibleToggle.classList.remove("hidden");
			
			hiddenToggle.classList.add("hidden");
			hiddenToggle.classList.remove("visible");
			
			passwordVisible = true;
		}
		
		if (passwordVisible) {
			document.querySelector(".password-input").setAttribute("type", "text");
		} else {
			document.querySelector(".password-input").setAttribute("type", "password");
		}
	});

	hiddenToggle.addEventListener("click", (event_) => {
		if (hiddenToggle.classList.contains("visible")) {
			hiddenToggle.classList.add("hidden");
			hiddenToggle.classList.remove("visible");
			
			visibleToggle.classList.add("visible");
			visibleToggle.classList.remove("hidden");
			
			passwordVisible = true;
		} else if (hiddenToggle.classList.contains("hidden")) {
			hiddenToggle.classList.add("visible");
			hiddenToggle.classList.remove("hidden");
			
			visibleToggle.classList.add("hidden");
			visibleToggle.classList.remove("visible");
			
			passwordVisible = false;
		}
		
		if (passwordVisible) {
			document.querySelector(".password-input").setAttribute("type", "text");
		} else {
			document.querySelector(".password-input").setAttribute("type", "password");
		}
	});
})();

