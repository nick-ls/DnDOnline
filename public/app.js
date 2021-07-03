const socket = new SocketClient("ws://localhost:2738");//new SocketClient("wss://www.dndonline.tk");//
const tools = new Tools();

console.log(document.cookie);

var cacheState;
var statusArr = [0,0,0,0,0,0,0,0,0,0,0,0,0];

window.onresize = () => { updateState(cacheState) };

document.addEventListener("click", createGame);
document.addEventListener("click", selectColor);
document.addEventListener("input", handleInput);
document.addEventListener("input", sendGameCode);
document.addEventListener("mousedown", e => {
	if (e.target.id === "field") tools.init(e);
});
document.addEventListener("mousemove", e => { tools.move(e) });
document.addEventListener("mouseup", e => { tools.finish(e) });
document.addEventListener("click", addColor);
document.addEventListener("click", e=>{
	if (e.target.id === "leave") {
		document.cookie = "user=;";
		location.reload();
	}
})

// hides modals when clicking on a greyed out background
document.addEventListener("click", e => {
	if (e.target.className.includes("modal") && e.target.id !== "start") {
		e.target.style.display = "none";
	}
});
// listen for changes in radio for tool change
document.addEventListener("change", changeTool);
document.getElementById("statuses").addEventListener("change", calcStatusInt);

function changeTool(e) {
	let elem = e.target;
	while (!elem.id && temp.tagName != "BODY") {
		elem = e.parentElement;
	}
	if (Tools.types.includes(elem.id)) {
		tools.tool = elem.id;
		tools.props.selectedIndex = -1;
	}
}
function selectColor(e) {
	if (e.target.classList.contains("color")) {
		if (e.ctrlKey) {
			e.target.parentElement.removeChild(e.target);
			return;
		}
		let color = "#"+e.target.style.backgroundColor.match(/\d{1,3}/g).map(x=>Number(x)).map(x=>{
				return ("0".repeat(2 - x.toString(16).length) + x.toString(16));
		}).join("");
		tools.props.color = color;
		document.getElementById("currentColor").value = color;
		handleInput(e);
		let hsl = rgbToHsl(color);
		document.getElementById("h").value = hsl[0];
		document.getElementById("s").value = hsl[1];
		document.getElementById("l").value = hsl[2];
		document.getElementById("htext").value = hsl[0];
		document.getElementById("stext").value = hsl[1];
		document.getElementById("ltext").value = hsl[2];
	}
}
function addColor(e) {
	if (e.target.id === "addColor") {
		let node = document.createElement("div");
		node.classList.add("color");
		node.style.backgroundColor = tools.props.color;
		document.getElementById("colorTrain").appendChild(node);
	}
}

function handleInput(e) {
	if (!e) return;
	if (tools.props.selectedIndex >= 0) {
		let i = tools.props.selectedIndex;
		cacheState.entities[i].color = document.getElementById("currentColor").value;
		cacheState.entities[i].d = document.getElementById("entitySize").value;
		cacheState.entities[i].name = document.getElementById("entityName").value;
		cacheState.entities[i].statusInt = calcStatusInt();
		updateState(cacheState);
	}
	let currentColor = document.getElementById("currentColor");
	if (e.target.id === "entityName") tools.props.name = e.target.value;
	if (e.target.parentElement) {
		if (e.target.parentElement.classList.contains("row")) {
			e.target.parentElement.querySelector(".smallText").value = e.target.value;
			if (e.target.id === "entitySize") tools.props.d = e.target.value;

			let children = document.getElementById("draggers").children;
			let hsv = [];
			for (var i = 0; i < children.length; i++) {
				hsv.push(children[i].querySelector("input[type=range]").value);
			}
			currentColor.value = hslToRgb(hsv[0] / 360, hsv[1] / 100, hsv[2] / 100);
		}
	}
	document.getElementById("dispColor").style.backgroundColor = currentColor.value;
	tools.props.color = currentColor.value;
}
function createGame(e) {
	if (e.target.id === "createGame" || e.target.parentElement.id === "createGame") {
		document.getElementById("createParams").style.display = "";
	} else if (e.target.id === "create" || e.target.parentElement.id === "create") {
		let width = document.getElementById("width").value;
		let height = document.getElementById("height").value;
		if (width > 0 && width <= 50 && height > 0 && height <= 50) {
			socket.send("createGame", width + "x" + height);
			document.getElementById("createParams").style.display = "none";
		} else {
			alert("Please provide a valid input! (number 0-50)");
		}
	}
}
function sendGameCode(e) {
	if (e.target.id === "gameID") {
		let id = document.getElementById("gameID").value;
		if (id.length === 6) {
			socket.send("joinGame", id);
		}
	}
}
function calcStatusInt(e) {
	let stat = document.getElementById("statuses");
	let bin = "";
	for (var i = 0; i < stat.children.length; i++) {
		bin += stat.children[i].querySelector("input").checked ? "1" : "0";
	}
	tools.props.statusInt = parseInt(bin, 2);
	return parseInt(bin, 2);
}
socket.on("joined", msg=>{
	console.log(msg);
	document.cookie = "user="+msg+";SameSite=Strict;";
});
socket.on("gameCode", msg=>{
	let code = document.getElementById("joinCode");
	code.style.display = "";
	code.children[0].textContent = msg;
});
socket.on("gameJoined", msg=>{
	let elems = document.getElementsByClassName("modal");
	for (var i = 0; i < elems.length; i++) {
		elems[i].style.display = "none";
	}
	socket.send("amIDM");
});
socket.on("gameState", msg=>{
	cacheState = msg;
	updateState(msg);
});
socket.on("dm", msg=>{
	document.getElementById("toolPanel").style.display = "";
	document.getElementById("editPanel").style.display = "";
});