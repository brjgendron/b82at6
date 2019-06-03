(() => {
	var socket = io();

	const messageCharLimit = 2500;
	const usernameCharLimit = 25;
	
	let messages = document.querySelector("#messages");
	let usersList = document.querySelector("#users");

	let chatbox = document.querySelector("#chatbox");

	let serverName = document.getElementsByClassName("server-name");
	// let serverNameIcons = document.getElementsByClassName("expand-collapse-icon");
	let expandIcons = document.getElementsByClassName("expand-icon");
	let collapseIcons = document.getElementsByClassName("collapse-icon");
	for (var i = 0; i < serverName.length; i++) {
		let currentIndex = serverName[i];
		serverName[i].addEventListener("click", (event_) => {
			if (currentIndex.classList.contains("expanded")) {
				currentIndex.classList.add("collapsed");
				currentIndex.classList.remove("expanded");

				currentIndex.children[0].classList.add("hidden");
				currentIndex.children[1].classList.remove("hidden");

				currentIndex.nextElementSibling.classList.add("hidden");
			} else if (currentIndex.classList.contains("collapsed")) {
				currentIndex.classList.add("expanded");
				currentIndex.classList.remove("collapsed");

				currentIndex.children[0].classList.remove("hidden");
				currentIndex.children[1].classList.add("hidden");

				currentIndex.nextElementSibling.classList.remove("hidden");
			}
		});
	}

		function genListObj(sender_) {
		let messageJSON = {
			container: {
				html: document.createElement("li"),
				class: "message"
			}
		};

		for (var i = 1; i < arguments.length; i++) {
			messageJSON[`domObj${i}`] = {
				html: document.createElement(Object.values(arguments[i])[0]),
				class: Object.values(arguments[i])[1],
				contents: Object.values(arguments[i])[2]
			}
		}

		const values = Object.values(messageJSON);
		for (var x = 0; x < values.length; x++) {
			if (x < values.length - 1) {
				let y = x;
				values[0].html.appendChild(values.slice(1)[y].html)
			}

			if (values[x].class !== "") {
				values[x].html.classList.add(values[x].class);
				
				if (values[x].class === sender_.id) {
					values[x].html.setAttribute("style", `color: ${sender_.color}; font-weight: 500;`);
				}
			}

			if (values[x].contents != undefined) values[x].html.appendChild(document.createTextNode(values[x].contents));
		}

		return messageJSON.container.html;
	}

	function fillList(list_, items_) {
		let listItem;

		while (list_.firstChild) {
			list_.removeChild(list_.firstChild);
		}
		
		for (var i = 0; i < items_.length; i++) {
			listItem = document.createElement("li");
			listItem.classList.add(items_[i].id);
			listItem.setAttribute("style", `color: ${items_[i].color}; font-weight: 500`);
			listItem.appendChild(document.createTextNode(items_[i].username));
			list_.appendChild(listItem);
		}
	}
	
	document.querySelector("#compose").addEventListener("submit", (event_) => {
		event_.preventDefault();
		if (chatbox.value.length > 0 && chatbox.value.length <= messageCharLimit) {
			socket.emit("chat.message", chatbox.value);
			chatbox.value = "";
		} else if (chatbox.value.length > messageCharLimit) {
			alert(`Your message exceeds the character limit of ${messageCharLimit}`);
		}
	});

	socket.on("user.connect", (users_, user_) => {
		document.querySelector("#change-username").onclick = (event_) => {
			event_.preventDefault();
			let newUsername = prompt("Enter a new username");
			if (newUsername.length > 0 && newUsername.length <= 25) {
				socket.emit("user.setusername", newUsername, user_);
			} else if (newUsername.length > usernameCharLimit) {
				alert("Your username exceeds the character limit of " + usernameCharLimit);
			}
		};

		fillList(usersList, users_);
		
		messages.appendChild(genListObj(user_, {html: "span", class: "", contents: "User "}, {html: "span", class: user_.id, contents: user_.id}, {html: "span", class: "", contents: " has connected"}));
		console.log(`user ${user_.username} has connected`);
	});

	socket.on("user.setusername", (users_, user_, oldUsername_) => {
		if (user_.id != oldUsername_) {
			messages.appendChild(genListObj(user_, {html: "span", class: "", contents: "User "}, {html: "span", class: user_.id, contents: `${oldUsername_} (${user_.id})`}, {html: "span", class: "", contents: " has changed their username to "}, {html: "span", class: user_.id, contents: user_.username}));
		} else {
			messages.appendChild(genListObj(user_, {html: "span", class: "", contents: "User "}, {html: "span", class: user_.id, contents: user_.id}, {html: "span", class: "", contents: " has changed their username to "}, {html: "span", class: user_.id, contents: user_.username}));
		}
		fillList(usersList, users_);
	});


	socket.on("chat.message", (message_) => {
		messages.appendChild(genListObj({id: message_.senderID, username: message_.senderUsername, color: message_.senderColorHSL}, {html: "span", class: "message-timestamp", contents: `[${message_.messageTimestamp}] `}, {html: "span", class: message_.senderID, contents: message_.senderUsername}, {html: "span", class: "message-text", contents: `: ${message_.contents}`}));
		
		document.querySelector("#messages-container").SimpleBar.getScrollElement().scrollTop = document.querySelector("#messages-container").SimpleBar.getScrollElement().scrollHeight;

		console.log(message_);
	});
	// socket.on("chat.message", (message_) => {
	// 	messages.appendChild(genListObj(message_.sender, {html: "span", class: "message-timestamp", contents: `[${message_.timestamp}] `}, {html: "span", class: message_.sender.id, contents: message_.sender.username}, {html: "span", class: "message-text", contents: `: ${message_.message}`}));
		
	// 	document.querySelector("#messages-container").SimpleBar.getScrollElement().scrollTop = document.querySelector("#messages-container").SimpleBar.getScrollElement().scrollHeight;

	// 	// document.querySelector("#messages-container").scrollTop = document.querySelector("#messages-container").scrollHeight;

	// 	console.log(`[${message_.timestamp}] ${message_.sender.username}: ${message_.message}`);
	// });

	socket.on("garbage test", (data_) => {
		
		console.log(data_.senderID);
		messages.appendChild(genListObj({id: data_.senderID, username: data_.senderUsername, color: data_.senderColorHSL}, {html: "span", class: "message-timestamp", contents: `[${data_.messageTimestamp}] `}, {html: "span", class: data_.senderID, contents: data_.senderUsername}, {html: "span", class: "message-text", contents: `: ${data_.contents}`}));
		document.querySelector("#messages-container").SimpleBar.getScrollElement().scrollTop = document.querySelector("#messages-container").SimpleBar.getScrollElement().scrollHeight;
	});

	socket.on("user.disconnect", (users_, user_) => {
		fillList(usersList, users_);
		messages.appendChild(genListObj(user_, {html: "span", class: "", contents: "User "}, {html: "span", class: user_.id, contents: user_.id}, {html: "span", class: "", contents: " has disconnected"}));
		console.log(`user ${user_.username} (${user_.id}) has disconnected`);
	});
})();