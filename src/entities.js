import { PLAYER_STATS, ENEMY_TYPES, ITEM_TYPES } from './constants.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    Object.assign(this, { ...PLAYER_STATS });
    this.level    = 1;
    this.xp       = 0;
    this.xpToNext = 10;
  }

  get alive() { return this.hp > 0; }
}

export class Enemy {
  constructor(x, y, typeIndex) {
    const type = ENEMY_TYPES[typeIndex ?? Math.floor(Math.random() * ENEMY_TYPES.length)];
    this.x = x;
    this.y = y;
    this.name  = type.name;
    this.color = type.color;
    this.hp    = type.hp;
    this.maxHp = type.hp;
    this.atk   = type.atk;
    this.def   = type.def;
    this.xp    = type.xp;
  }

  get alive() { return this.hp > 0; }

  // Simple Chebyshev-distance step toward target, avoiding walls
  stepToward(tx, ty, tiles, entities) {
    const dx = Math.sign(tx - this.x);
    const dy = Math.sign(ty - this.y);
    const candidates = [
      { x: this.x + dx, y: this.y + dy },
      { x: this.x + dx, y: this.y      },
      { x: this.x,      y: this.y + dy },
    ];
    for (const c of candidates) {
      if (!walkable(c.x, c.y, tiles)) continue;
      if (entities.some(e => e !== this && e.x === c.x && e.y === c.y)) continue;
      return c;
    }
    return null;
  }
}

export class Item {
  constructor(x, y, typeIndex) {
    const type = ITEM_TYPES[typeIndex ?? Math.floor(Math.random() * ITEM_TYPES.length)];
    this.x      = x;
    this.y      = y;
    this.name   = type.name;
    this.color  = type.color;
    this.effect = type.effect;
    this.value  = type.value;
  }
}

function walkable(x, y, tiles) {
  if (y < 0 || y >= tiles.length || x < 0 || x >= tiles[0].length) return false;
  return tiles[y][x] !== 0; // not a wall
}
