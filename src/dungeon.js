import { TILE, MAP_W, MAP_H } from './constants.js';

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fillRect(tiles, x, y, w, h, type) {
  for (let row = y; row < y + h; row++)
    for (let col = x; col < x + w; col++)
      tiles[row][col] = type;
}

function hCorridor(tiles, x1, x2, y) {
  const [a, b] = x1 < x2 ? [x1, x2] : [x2, x1];
  for (let x = a; x <= b; x++) tiles[y][x] = TILE.FLOOR;
}

function vCorridor(tiles, y1, y2, x) {
  const [a, b] = y1 < y2 ? [y1, y2] : [y2, y1];
  for (let y = a; y <= b; y++) tiles[y][x] = TILE.FLOOR;
}

class BSPNode {
  constructor(x, y, w, h) {
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.left = null; this.right = null;
    this.room = null;
  }

  split(minSize) {
    if (this.left || this.right) return;
    const splitH = this.w > this.h ? false : this.h > this.w ? true : Math.random() < 0.5;
    const max = (splitH ? this.h : this.w) - minSize;
    if (max <= minSize) return; // too small to split
    const pos = rand(minSize, max);
    if (splitH) {
      this.left  = new BSPNode(this.x, this.y,       this.w, pos);
      this.right = new BSPNode(this.x, this.y + pos, this.w, this.h - pos);
    } else {
      this.left  = new BSPNode(this.x,       this.y, pos,           this.h);
      this.right = new BSPNode(this.x + pos, this.y, this.w - pos,  this.h);
    }
    this.left.split(minSize);
    this.right.split(minSize);
  }

  carveRooms(tiles) {
    if (this.left && this.right) {
      this.left.carveRooms(tiles);
      this.right.carveRooms(tiles);
      // connect centers of child rooms
      const lc = this.left.centerRoom();
      const rc = this.right.centerRoom();
      if (lc && rc) {
        hCorridor(tiles, lc.x, rc.x, lc.y);
        vCorridor(tiles, lc.y, rc.y, rc.x);
      }
    } else {
      const padding = 1;
      const rx = this.x + padding + rand(0, Math.floor(this.w * 0.2));
      const ry = this.y + padding + rand(0, Math.floor(this.h * 0.2));
      const rw = rand(3, this.w - 2 * padding - (rx - this.x));
      const rh = rand(3, this.h - 2 * padding - (ry - this.y));
      const w = Math.max(3, rw);
      const h = Math.max(3, rh);
      fillRect(tiles, rx, ry, w, h, TILE.FLOOR);
      this.room = { x: rx, y: ry, w, h };
    }
  }

  centerRoom() {
    if (this.room) {
      return { x: Math.floor(this.room.x + this.room.w / 2), y: Math.floor(this.room.y + this.room.h / 2) };
    }
    const lc = this.left?.centerRoom();
    const rc = this.right?.centerRoom();
    return lc || rc || null;
  }

  leafRooms() {
    if (this.room) return [this.room];
    return [...(this.left?.leafRooms() ?? []), ...(this.right?.leafRooms() ?? [])];
  }
}

export function generateDungeon() {
  // Init all walls
  const tiles = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(TILE.WALL));

  const root = new BSPNode(1, 1, MAP_W - 2, MAP_H - 2);
  root.split(6);
  root.carveRooms(tiles);

  const rooms = root.leafRooms();

  // Place exit in last room (furthest from first)
  const startRoom = rooms[0];
  const exitRoom  = rooms[rooms.length - 1];
  const exitPos = {
    x: Math.floor(exitRoom.x + exitRoom.w / 2),
    y: Math.floor(exitRoom.y + exitRoom.h / 2),
  };
  tiles[exitPos.y][exitPos.x] = TILE.EXIT;

  // Spawn positions: all floor tiles in rooms except exit tile
  const spawnTiles = [];
  for (const r of rooms) {
    for (let y = r.y; y < r.y + r.h; y++) {
      for (let x = r.x; x < r.x + r.w; x++) {
        if (tiles[y][x] === TILE.FLOOR) spawnTiles.push({ x, y });
      }
    }
  }

  const explored = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(false));

  return { tiles, rooms, exitPos, spawnTiles, startRoom, explored };
}

export function randomFloorTile(spawnTiles, occupied) {
  const free = spawnTiles.filter(t => !occupied.some(o => o.x === t.x && o.y === t.y));
  return free.length ? free[rand(0, free.length - 1)] : null;
}
