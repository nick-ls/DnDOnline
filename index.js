const express = require("express");
const app = express();
const server = require("http").createServer(app);
const Socket = require("./socket.js");
const socket = new Socket(server);
const t = require("./types.js");
const {Entropy, charset64} = require("entropy-string");
const entropy = new Entropy();
//https://app.streamlineicons.com/streamline-light/interface-essential
//https://soundcloud.com/user-532261325/sets/yes
app.use(express.static("public"));

var users = {};
var games = {};

app.get("/", (req,res)=>{
	res.sendFile("index.html",  { root: __dirname+"/public/"});
});

socket.on("createGame", (msg, ws) => {
	let dims = msg.split("x");
	console.log(console.log(msg));	
	dims.map(num=>{
		return Number(num);
	});
	if (dims.length !== 2 || dims.includes(NaN)) {
		return;
	}
	let game = new t.Game(dims[0], dims[1], ws);
	console.log(game);
	games[game.getID()] = game;
	ws.props.inGame = game.getID();
	ws.sendMsg("gameJoined");
	ws.sendMsg("gameCode", game.getJoinCode());
	ws.sendMsg("gameState", game.getState());
});
socket.on("joinGame", (msg, ws) => {
	//console.log(games);
	socket.wss.clients.forEach(s=>{
		console.log(s.props);
	});
	//console.log(users);
	if (users[ws.props.id].inGame) return;
	Object.values(games).forEach(game=>{
		console.log(games);
		if (game.getJoinCode() === msg) {
			game.addPlayer(ws);
			ws.sendMsg("gameState", game.getState());
			users[ws.props.id].inGame = game.getID();
			console.log("Sending:", Socket.construct("gameJoined"));
			ws.sendMsg("gameJoined");
		}
	});
});
socket.on("join", (msg, ws) => {
	if (users[msg]) {
		console.log("rejoining");
		ws.props = users[msg].props;
		users[msg].terminate();
		if (games[ws.props.inGame]) {
			if (games[ws.props.inGame].dm.props.id === ws.props.id) {
				games[ws.props.inGame].dm = ws;
			} else {
				games[ws.props.inGame].players.push(ws);
			}
			console.log("Sending:",Socket.construct("gameJoined"));
			ws.sendMsg("gameJoined");
			console.log("Sending:",Socket.construct("gameState", games[ws.props.inGame].getState()));
			ws.sendMsg("gameState", games[ws.props.inGame].getState());
		}
	} else {
		ws.props.id = entropy.string();
	}
	users[ws.props.id] = ws;
	//console.log("Sending:",Socket.construct("joined", ws.props.id));
	ws.sendMsg("joined", ws.props.id);
});

socket.on("amIDM", (msg, ws) => {
	if (isPlayerDM(ws, ws.props.inGame)) {
		console.log("Sending:", " dm = true");
		ws.sendMsg("dm",true);
	}
});
socket.on("sendState", (msg, ws)=>{
	if (!ws.props.inGame) return;
	if (isPlayerDM(ws, ws.props.inGame)) {
		games[ws.props.inGame].setState(msg);
		console.log(Socket.construct("gameState", msg));
		games[ws.props.inGame].dm.sendMsg("gameState", msg);
		games[ws.props.inGame].players.forEach(player=>{
			player.sendMsg("gameState", msg);
		});
	}
});

function isPlayerDM(ws, gameID) {
	if (ws.props.inGame === gameID) {
		if (games[ws.props.inGame]) {
			if (games[ws.props.inGame].dm.props.id === ws.props.id) {
				return true;
			}
		}
	}
	return false;
}
server.listen(2738);