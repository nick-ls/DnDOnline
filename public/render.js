const canvas = document.getElementById("field");
const c = canvas.getContext("2d");
const statuses = {
	"poisoned": "#6FD600",
	"blinded": "#303030",
	"deafened": "#B2B2B2",
	"charmed": "#FA4EF8",
	"frightened": "#FF2222",
	"grappled": "#FFCF9B",
	"restrained": "#FFA441",
	"incapacitated": "#FF8500",
	"paralyzed": "#E4DB05",
	"petrified": "#794D39",
	"invisible": "#E1E1E1",
	"unconscious": "#B25A5A",
	"dead": "#880921"
};
var dims = {
	w: 0,
	h: 0,
	mult: 0
};


function updateState(field) {
	if (!field) return;
	// initialization
	dims.mult = Math.floor(Math.min((window.innerWidth - 100) / field.width, (window.innerHeight - 100) / field.height));
	dims.w = field.width;
	dims.h = field.height;
	canvas.width = dims.mult * field.width;
	canvas.height = dims.mult * field.height;
	c.fillStyle = "white";
	c.fillRect(0, 0, canvas.width, canvas.height);
	// draw pixel grid
	for (var i = 0; i < dims.w; i++) {
		for (var j = 0; j < dims.h; j++) {
			let baseXY = [i * dims.mult, j * dims.mult];
			c.strokeStyle = "rgba(0,0,0,0.3)";
			c.lineWidth = 2;
			c.beginPath();
			c.moveTo(baseXY[0], baseXY[1]);
			c.lineTo(baseXY[0] + dims.mult, baseXY[1]);
			c.lineTo(baseXY[0] + dims.mult, baseXY[1] + dims.mult);
			c.lineTo(baseXY[0], baseXY[1] + dims.mult);
			c.lineTo(baseXY[0], baseXY[1]);
			c.stroke();
		}
	}
	// draw tiles
	field.tiles.forEach(tile => {
		c.fillStyle = tile.color;
		c.fillRect(tile.x * dims.mult, tile.y * dims.mult, dims.mult, dims.mult);
	});
	// draw walls
	field.walls.forEach(wall => {
		c.strokeStyle = wall.color;
		c.lineWidth = wall.thickness;
		let difs = [
			(wall.y1 === wall.y2 ? (wall.thickness / 2) * Math.sign(wall.x1 - wall.x2) : 0),
			(wall.x1 === wall.x2 ? (wall.thickness / 2) * Math.sign(wall.y1 - wall.y2) : 0)
		];
		c.beginPath();
		c.moveTo(wall.x1 * dims.mult + difs[0],	wall.y1 * dims.mult + difs[1]);
		c.lineTo(wall.x2 * dims.mult - difs[0],	wall.y2 * dims.mult - difs[1]);
		c.stroke();
	});
	if (tools.unfinished.x1) {
		c.strokeStyle = tools.props.color;
		c.lineWidth = tools.unfinished.thickness;
		c.beginPath();
		c.moveTo(tools.unfinished.x1 * dims.mult, tools.unfinished.y1 * dims.mult);
		c.lineTo(tools.unfinished.x2 * dims.mult, tools.unfinished.y2 * dims.mult);
		c.stroke();
	}
	// draw entities
	field.entities.forEach(entity=>{
		drawEntity(entity);
	});
	field.entities.forEach(entity=>{
		drawName(entity);
	});
	if (tools.unfinished.name) {
		drawEntity(tools.unfinished);
		drawName(tools.unfinished);	
	}
}
function drawEntity(entity) {
	let debuffs = statusIntToArr(entity.statusInt);
	let radius = 1 + 0.15 * debuffs.length;
	debuffs.forEach(name=>{
		c.fillStyle = statuses[name];
		c.beginPath();
		c.arc(entity.x * dims.mult, entity.y * dims.mult, (entity.d / 2) * dims.mult * radius, 0, Math.PI * 2);
		c.fill();
		radius -= 0.15;
	});
	c.fillStyle = entity.color;
	c.beginPath();
	c.arc(entity.x * dims.mult, entity.y * dims.mult, (entity.d / 2) * dims.mult, 0, Math.PI * 2);
	c.fill();
}
function drawName(entity) {
	if (entity.name) {
		c.font = "15pt Segoe UI";
		let fontSize = [c.measureText(entity.name).width, c.measureText(entity.name).actualBoundingBoxAscent + 2];
		let corner = [(entity.x * dims.mult - fontSize[0] / 2) - 2.5, entity.y * dims.mult - (entity.d * dims.mult) / 2 - fontSize[1]];
		c.fillStyle = "rgba(0,0,0,0.5)";
		c.fillRect(corner[0], corner[1], (fontSize[0] + 5), fontSize[1] + c.measureText(entity.name).actualBoundingBoxDescent + 2);
		c.fillStyle = "white";
		c.fillText(entity.name, corner[0] + 2.5, corner[1] + fontSize[1]);
	}
}
function statusIntToArr(int) {
	if (int === 0) return [];
	if (Number(int) === NaN) return [];
	let bin = int.toString(2);
	let status = Object.keys(statuses);
	bin = "0".repeat(status.length - bin.length) + bin;
	let statusArr = [];
	for (var i = 0; i < bin.length; i++) {
		if (bin[i] === "1") statusArr.push(status[i]);
	}
	return statusArr;
}