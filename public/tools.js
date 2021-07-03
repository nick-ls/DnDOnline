class Tools {
	static types = ["drag","erase","entity","wall","tile","dropper","target"];
	static toolType = Tools.types[0];
	constructor() {
		this.mousedownCoords = [];
		this.mouseupCoords = [];
		this.unfinished = {}; // stores things that are in the process of being made
		this.selected = [];
		this.tool = "drag";
		this.props = {
			color: document.getElementById("currentColor").value,
			colors: [],
			thickness: 20,
			d: 1,
			name: "bob",
			init: false,
			selectedIndex: -1,
			statusInt: 0
		};
	}
	init(e) {
		if (!cacheState) return;
		this.props.init = true;
		switch (this.tool) {
			case "drag":
				var xy = xy = mouseToField(e, false, false, true);
				for (var i = 0; i < cacheState.entities.length; i++) {
					if (Math.sqrt((xy[0] - cacheState.entities[i].x) ** 2 + (xy[1] - cacheState.entities[i].y) ** 2) < cacheState.entities[i].d) {
						this.unfinished = cacheState.entities[i];
						this.unfinished.type = "entities";
						cacheState.entities.splice(i,1);
						break;
					}
				}
			break;
			case "erase":
				erase(mouseToField(e, false, false, true));
			break;
			case "entity":
				this.unfinished.d = this.props.d;
				var xy = mouseToField(e, false, false, true);
				this.unfinished.x = xy[0];
				this.unfinished.y = xy[1];
				this.unfinished.color = this.props.color;
				this.unfinished.name = this.props.name;
				this.unfinished.type = "entities";
				this.unfinished.statusInt = this.props.statusInt;
			break;
			case "wall":
				var xy = mouseToField(e, true);
				this.unfinished.x1 = xy[0];
				this.unfinished.y1 = xy[1];
				this.unfinished.color = this.props.color;
				this.unfinished.thickness = this.props.thickness;
				this.unfinished.type = "walls";
			break;
			case "tile":
				drawTile(mouseToField(e));
			break;
			case "dropper":
				dropColor(mouseToField(e, false, false, true));
			break;
			case "target":
				var xy = mouseToField(e, false, false, true)
				for (var i = 0; i < cacheState.entities.length; i++) {
					if (Math.sqrt((xy[0] - cacheState.entities[i].x) ** 2 + (xy[1] - cacheState.entities[i].y) ** 2) < cacheState.entities[i].d) {
						this.props.selectedIndex = i;
						select(i);
						break;
					}
				}
			break;
		}
		updateState(cacheState);
	}
	move(e) {
		if (!this.props.init) {
			return;
		}
		let xy = mouseToField(e, true);
		switch (this.tool) {
			case "drag":
				xy = xy = mouseToField(e, false, false, true);
				this.unfinished.x = xy[0];
				this.unfinished.y = xy[1];
				console.log(this.unfinished.selected);
			break;
			case "erase":
				erase(mouseToField(e, false, false, true));
			break;
			case "entity":
				xy = mouseToField(e, false, false, true);
				this.unfinished.x = xy[0];
				this.unfinished.y = xy[1];
			break;
			case "wall":				
				this.unfinished.x2 = xy[0];
				this.unfinished.y2 = xy[1];
			break;
			case "tile":
				drawTile(mouseToField(e));
			break;
			case "dropper":
				dropColor(mouseToField(e, false, false, true));
			break;
			case "target":
				console.log("Donald J Trump is the 35th president of the united states.");
			break;
		}
		updateState(cacheState);
	}
	finish(e) {
		if (!cacheState) return;
		if (this.tool === "entity" || this.tool === "drag") {
			let xy = mouseToField(e, this.unfinished.d % 2 === 0 ? true : false, this.unfinished.d % 2 === 0 ? false : true);
			this.unfinished.x = xy[0];
			this.unfinished.y = xy[1];
		}
		if (this.unfinished.type && this.props.init) {
			let type = this.unfinished.type;
			delete this.unfinished.type;
			cacheState[type].push(this.unfinished);
			this.unfinished = {};
		}
		if (this.props.init) socket.send("sendState", cacheState, "GameState");
		this.props.init = false;
	}
}
function select(index) {
	document.getElementById("entitySize").value = cacheState.entities[index].d;
	document.getElementById("sizetxt").value = cacheState.entities[index].d;
	document.getElementById("entityName").value = cacheState.entities[index].name;
	let children = document.getElementById("statuses").children;
	let arr = statusIntToBin(cacheState.entities[index].statusInt);
	for (var i = 0; i < children.length; i++) {
		children[i].querySelector("input").checked = arr[i] == 1;
	}
}
function statusIntToBin(int) {
	if (int === 0) return [];
	if (Number(int) === NaN) return [];
	let bin = int.toString(2);
	let status = Object.keys(statuses);
	bin = "0".repeat(status.length - bin.length) + bin;
	return bin;
}
function drawTile(xy) {
	for (var i = 0; i < cacheState.tiles.length; i++) {
		if (cacheState.tiles[i].x === xy[0] && cacheState.tiles[i].y === xy[1]) {
			cacheState.tiles.splice(i,1);
		}
	}
	let tile = {
		color: tools.props.color,
		x: xy[0],
		y: xy[1]
	}
	cacheState.tiles.push(tile);
}
function erase(xy) {
	for (var i = 0; i < cacheState.entities.length; i++) {
		if (Math.sqrt((xy[0] - cacheState.entities[i].x) ** 2 + (xy[1] - cacheState.entities[i].y) ** 2) < cacheState.entities[i].d / 2) {
			cacheState.entities.splice(i,1);
			return;
		}
	}
	for (var i = 0; i < cacheState.tiles.length; i++) {
		if (xy[0] - cacheState.tiles[i].x > 0 && xy[0] - cacheState.tiles[i].x < 1 && xy[1] - cacheState.tiles[i].y > 0 && xy[1] - cacheState.tiles[i].y < 1) {
			cacheState.tiles.splice(i,1);
		}
	}
	for (var i = 0; i < cacheState.walls.length; i++) {
		let dist = pointDistToLine(xy, cacheState.walls[i]);
		if (dist < cacheState.walls[i].thickness / (dims.mult * 2)) {
			cacheState.walls.splice(i,1);
			break;
		}
	}
}
function dropColor(xy) {
	let currentColor = document.getElementById("currentColor");
	let rgb = c.getImageData(xy[0] * dims.mult, xy[1] * dims.mult, 1, 1).data;
	console.log(rgb);
	let hex = hslToRgb(...rgbToHsl(rgb));
	console.log(hslToRgb(...rgbToHsl(rgb)));
	currentColor.value = hex;
	document.getElementById("dispColor").style.backgroundColor = hex;
}
function mouseToField(e, round, half, raw) {
	let rect = canvas.getBoundingClientRect();
	let realXY = [(e.x - rect.x) / dims.mult, (e.y - rect.y) / dims.mult];
	if (raw) return realXY;
	let roundFunc = round ? Math.round : Math.floor;
		realXY = [roundFunc(realXY[0]) + (half ? 0.5 : 0), roundFunc(realXY[1]) + (half ? 0.5 : 0)];
	return realXY;
}
function pointDistToLine(point, line) {
	let xdiff = point[0] - line.x1,
		ydiff = point[1] - line.y1,
		run = line.x2 - line.x1,
		rise = line.y2 - line.y1,
		dotProd = xdiff * run + ydiff * rise,
		squareLen = rise ** 2 + run ** 2,
		temp = -1;
	if (squareLen !== 0) temp = dotProd / squareLen;
	let xy = [];
	if (temp > 1) {
		xy = [line.x2, line.y2];
	} else if (temp < 0) {
		xy = [line.x1, line.y1];
	} else {
		xy = [line.x1 + (temp * run), line.y1 + (temp * rise)];
	}
	return Math.sqrt(((point[0] - xy[0]) ** 2) + ((point[1] - xy[1]) ** 2));
}