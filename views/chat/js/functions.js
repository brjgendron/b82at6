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

function sendMessage(event) {
	event.preventDefault();

	if (chatbox.value.length > 0 && chatbox.value.length <= messageCharacterLimit) {
		socket.emit("chat message", chatbox.value);
		chatbox.value = "";
	} else if (chatbox.value.length > messageCharacterLimit) {
		alert(`your message exceeds the character limit of ${messageCharacterLimit}`);
	}
}