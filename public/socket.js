class SocketClient {
	constructor(url, listeners) {
		this.url = url;
		this._connect(url, listeners);
	}
	on(listener, callback) {
		this.listeners[listener] = callback;
	}
	send (name, msg, type) {
		let message = SocketClient._constructMessage(name, msg, type);
		if (this.socket.readyState !== this.socket.OPEN) {
			this.reconnect(()=>{
				this.socket.send(message);
			});
		} else {
			this.socket.send(message);
		}
	}
	reconnect(callback) {
		this._connect(this.url, this.listeners, callback);
	}
	_handle(msg) {
		let message = this._parse(msg);
		console.log("Received Message:", msg, message);
		if (message) {
			if (this.listeners[message.name]) {
				if (!message.content && message.content !== "") return;				
				this.listeners[message.name](message.content);
			} else {
				console.warn("Missing server message:", msg.name, msg, message);
			}
		}
	}
	_isConnected() {
		return this.socket.readyState === this.socket.OPEN;
	}
	_parse(msg) {
		try {
			let message = JSON.parse(msg);
			if (typeof message.name !== "string") {
				throw new Error();
			}
			return message;
		} catch (e) {
			return msg;
		}
	}
	_connect(url, listeners = [], callback) {
		this.socket = new WebSocket(url);
		this.listeners = listeners;
		this.ready = false;
		this.socket.onopen = () => {
			let previousUser = getCookie("user");
			socket.send("join", previousUser);
			if (callback) callback();
		}
		this.socket.onmessage = msg => {
			if (msg.data === "ping") {
				this.socket.send("pong");
			} else {
				this._handle(msg.data);
			}
		}
		if (this.reconnectLoop) clearInterval(this.reconnectLoop);
		this.reconnectLoop = setInterval(() => {
			if (!this._isConnected()) {
				this.reconnect();
			}
		}, 5000);
	}
	static _constructMessage(name, message, type) {
		let msg = {
			name: name,
			content: (message ? message : "")
		};
		if (type) msg.type = type;
		return JSON.stringify(msg);
	}
}

function getCookie(name) {
	let match = document.cookie.match(new RegExp(`${name}=(.*?(?=;|$))`));
	if (match) {
		return match[1];
	} else {
		return null;
	}
}