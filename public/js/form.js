let toggleVisibility = document.getElementsByClassName("visibility-toggle");

let usernameField = document.querySelector(".username-input");
let passwordField = document.querySelector(".password-input");
let visibleToggle = document.getElementsByClassName("visibility-toggle")[0];
let hiddenToggle = document.getElementsByClassName("visibility-toggle")[1];
let passwordVisible;

let str = "aaajksn7aHa bbb";
let passwordregexp = /\d[A-Z][a-z]/;
let containsNumber = str.match(/\d/i).length != -1;
let containsUppercase = str.match(/[A-Z]/) != -1;
let containsLowercase = str.match(/[a-z]/) != -1;
let containsWhitespace = str.indexOf(" ") != -1;
let meetsLength = str.length >= 8;

function validatePassword(field_, password_, length_) {
	let containsUppercase = new RegExp(/[A-Z]/).test(password_);
	let containsLowercase = new RegExp(/[a-z]/).test(password_);
	let containsNumber = new RegExp(/\d/).test(password_);
	let containsWhitespace = password_.indexOf(" ") != -1;
	let meetsLength = password_.length >= length_;

	if (containsUppercase && containsLowercase && containsNumber && !containsWhitespace && meetsLength) {
		field_.classList.add("valid");
		field_.classList.remove("invalid");
	} else {
		field_.classList.add("invalid");
		field_.classList.remove("valid");
	}
}


passwordField.addEventListener("keyup", (event_) => {
	// const value = passwordField.value;
	// console.log(passwordField, value, 8);
	validatePassword(passwordField, passwordField.value, 8);
});

// if (containsNumber && containsUppercase && containsLowercase && !containsWhitespace && meetsLength) {
// 	console.log("this is a good password");
// } else {
// 	console.log("fuck you");
// }
// let containsSpace = str.match()
// console.log(containsNumber, containsUppercase, containsLowercase, containsWhitespace, meetsLength);

// if (passwordField.value.length >= 8 && passwordField.value.length && passwordField.value.)

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

