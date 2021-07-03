const websocket = require("ws");
const {Entropy, charset64} = require("entropy-string");
const entropy = new Entropy();
const types = require("./types.js");

class SocketServer {
	constructor(server) {
		this.listeners = {};
		this.wss = new websocket.Server({server});
		this.wss.on("connection", ws => {
			ws.props = {};
			ws.on("message", msg => {
				if (msg === "pong") {
					ws._isDead = false;
				} else {
					console.log(msg);
					this._handle(msg, ws);
				}
			});
			setInterval(()=>{
				if (ws._isDead) {
					ws.terminate();
				}
				ws.send("ping");
				ws._isDead = true;
			}, 60000);
			ws.sendMsg = function(name, message) {
				this.send(SocketServer.construct(name, message));
			}
		});
	}
	on(listener, callback) {
		this.listeners[listener] = callback;
	}
	_handle(msg, ws) {
		let message = this._parse(msg);
		if (!message) {
			console.log("err:", message);
		}
		//console.log("Received message:",message.name);
		if (message) {
			if (this.listeners[message.name]) {
				if (!message.content && message.content !== "") return;
				console.log("responding to: "+message.name);
				this.listeners[message.name](message.content, ws);
			} else {
				console.warn("Missing client message:", message.name, msg, message);
			}
		}
	}
	_parse(msg) {
		try {
			let message = JSON.parse(msg);
			console.log(message, 1);
			if (typeof message.name !== "string") {
				throw new Error();
			}
			if (typeof message.content === "object" && typeof message.type === "string") {
				console.log(2);
				if (types.available.includes(message.type)) {
					console.log(3)
					if (this._sameProperties(types[message.type].generic(), message.content)) {
						console.log(4);
						return message;
					} else {
						throw new Error();
					}
				} else {
					throw new Error();
				}
			} else if (typeof message.content === "string") {
				if (message.type) {
					delete message.type;
				}
				return message;
			}
		} catch (e) {
			console.warn("There was an error parsing the message:" + msg);
			return msg;
		}
	}
	_sameProperties(source, target) {
		let src = Object.keys(source);
		for (var i = 0; i < src.length; i++) {
			if (!target[src[i]]) {
				return false;
			}
		}
		for (var i = 0; i < src.length; i++) {
			if (typeof source[src[i]] === "object") {
				if (target[src[i]]) {
					return this._sameProperties(source[src[i]], target[src[i]]);
				} else {
					return false;
				}
			}
		}
		return true;
	}
	static construct(name, message) {
		let msg = {
			name: name,
			content: (message ? message : "")
		};
		return JSON.stringify(msg);
	}
}

module.exports = SocketServer;