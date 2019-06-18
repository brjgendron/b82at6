(() => {
	const socket = io();

	const messageCharacterLimit = 2500;

	let
		compose = document.getElementsByClassName("compose-message")[0],
		chatbox = document.getElementsByClassName("chatbox")[0],
		messages = document.getElementsByClassName("messages")[0],
		usersList = document.getElementsByClassName("users")[0];

	compose.addEventListener("submit", event => {
		event.preventDefault();

		if (chatbox.value.length > 0 && chatbox.value.length <= messageCharacterLimit) {
			socket.emit("chat message", chatbox.value);
			chatbox.value = "";
		} else if (chatbox.value.length > messageCharacterLimit) {
			alert(`your message exceeds the character limit of ${messageCharacterLimit}`);
		}
	});

	socket.on("user connected", (user, connectedUsers) => {
		fillList(usersList, connectedUsers);
		messages.appendChild(generateItem(user, {html: "span", class: "", contents: "User "}, {html: "span", class: user.id, contents: `${user.username}-${user.id}`}, {html: "span", class: "", contents: " has connected"}));
		console.log(`user ${user.username} has connected`);
	});

	socket.on("show previous messages", (data) => {
		messages.appendChild(
			generateItem(
				{ id: data.senderID, username: data.senderUsername, color: data.senderColorHSL },
				{ html: "span", class: "message-timestamp", contents: `[${data.messageTimestamp}] ` },
				{ html: "span", class: data.senderID, contents: data.senderUsernameWithID },
				{ html: "span", class: "message-text", contents: `: ${data.contents}`}
			)
		);

		scrollToBottom("messages-container");
	});

	socket.on("chat message", (message) => {
		messages.appendChild(
			generateItem(
				{ id: message.senderID, username: message.senderUsername, color: message.senderColorHSL },
				{ html: "span", class: "message-timestamp", contents: `[${message.messageTimestamp}] ` },
				{ html: "span", class: message.senderID, contents: message.senderUsernameWithID },
				{ html: "span", class: "message-text", contents: `: ${message.contents}` }
			)
		);
		
		scrollToBottom("messages-container");
		console.log(message);
	});

	function generateItem(sender_) {
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

	function scrollToBottom(selector) {
		document.getElementsByClassName(selector)[0].SimpleBar.getScrollElement().scrollTop =
		document.getElementsByClassName(selector)[0].SimpleBar.getScrollElement().scrollHeight;
	}
})();