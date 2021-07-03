const {Entropy, charset64} = require("entropy-string");
const entropy = new Entropy();
class Game {
	constructor(width, height, dm) {
		this.width = width;
		this.height = height;
		this.entities = [];
		this.walls = [];
		this.tiles = [];
		this.players = [];
		this.dm = dm;
		this.gameID = entropy.string();
		this.joinID = entropy.smallID();
	}
	getID() {
		return this.gameID;
	}
	getJoinCode() {
		return this.joinID;
	}
	getState(){
		return new GameState(this.width, this.height, this.entities, this.walls, this.tiles);
	}
	setState(gameState) {
		if (gameState.walls) {
			let validWalls = [];
			gameState.walls.forEach(wall=>{
				if (Number(wall.x1) && Number(wall.y1) && Number(wall.x2) && Number(wall.y2) && Number(wall.thickness) && wall.color.toString()) {
					validWalls.push(wall);
				}
			});
			this.walls = validWalls;
		}
		if (gameState.entities) {
			let validEntities = [];
			gameState.entities.forEach(entity=>{
				if (Number(entity.x) && Number(entity.y) && entity.color.toString() && Number(entity.initiative) && entity.name.toString() && Number(entity.radius)) {
					validEntities.push(entity);
				}
			});
			this.entities = validEntities;
		}
		if (gameState.tiles) {
			let validTiles = [];
			gameState.tiles.forEach(tile=>{
				if (Number(tile.x) && Number(tile.y) && tile.color.toString()) {
					validTiles.push(tile);
				}
			});
			this.tiles = validTiles;
		}
	}
	addPlayer(ws) {
		this.players.push(ws);
	}
}
class GameState {
	constructor(width, height, entities, walls, tiles) {
		this.width = width;
		this.height = height;
		this.entities = entities;
		this.walls = walls;
		this.tiles = tiles;
	}
	static generic() {
		return new GameState(0,0,[],[],[]);
	}
}
class Tile {
	constructor(x, y, color) {
		this.x = x;
		this.y = y;
		this.color = color;
	}
}
class Entity extends Tile {
	constructor(x, y, color, diameter, name, initiative) {
		super();
		this.diameter = diameter;
		this.name = name;
		this.initiative = initiative;
	}
}
class Wall {
	constructor(x1, y1, x2, y2, color, thickness) {
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
		this.color = color;
		this.thickness = thickness;
	}
}
module.exports = {
	Wall, Tile, Entity, GameState, Game
}
module.exports.available = ["GameState"];