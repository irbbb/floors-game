import { generateDungeon, randomFloorTile } from './dungeon.js';
import { Player, Enemy, Item } from './entities.js';
import { resolveAttack } from './combat.js';
import { render } from './renderer.js';
import { BASE_ENEMY_COUNT, MAX_FLOORS, ENEMY_TYPES, TILE, FOV_RADIUS, LEVEL_UP_CHOICES } from './constants.js';

const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');

let state;

// --- Helpers ---

function spawnEnemies(spawnTiles, occupied, floor) {
  const count = BASE_ENEMY_COUNT + (floor - 1) * 2;
  const hpScale  = 1 + (floor - 1) * 0.3;
  const atkScale = 1 + (floor - 1) * 0.2;
  const enemies = [];
  for (let i = 0; i < count; i++) {
    const pos = randomFloorTile(spawnTiles, [...occupied, ...enemies]);
    if (!pos) break;
    const typeIndex = Math.floor(Math.random() * ENEMY_TYPES.length);
    const e = new Enemy(pos.x, pos.y, typeIndex);
    e.hp    = Math.round(e.hp    * hpScale);
    e.maxHp = Math.round(e.maxHp * hpScale);
    e.atk   = Math.round(e.atk   * atkScale);
    enemies.push(e);
  }
  return enemies;
}

function spawnItems(spawnTiles, occupied) {
  const items = [];
  for (let i = 0; i < 2; i++) {
    const pos = randomFloorTile(spawnTiles, [...occupied, ...items]);
    if (!pos) break;
    items.push(new Item(pos.x, pos.y));
  }
  return items;
}

// --- Init / Next floor ---

// --- FOV ---

function computeFOV(px, py, tiles) {
  const rows = tiles.length;
  const cols = tiles[0].length;
  const visible = Array.from({ length: rows }, () => Array(cols).fill(false));
  visible[py][px] = true;
  const STEPS = 360;
  for (let i = 0; i < STEPS; i++) {
    const angle = (i / STEPS) * Math.PI * 2;
    let rx = px + 0.5, ry = py + 0.5;
    const dx = Math.cos(angle), dy = Math.sin(angle);
    for (let step = 0; step < FOV_RADIUS; step++) {
      rx += dx; ry += dy;
      const tx = Math.floor(rx), ty = Math.floor(ry);
      if (tx < 0 || ty < 0 || ty >= rows || tx >= cols) break;
      visible[ty][tx] = true;
      if (tiles[ty][tx] === TILE.WALL) break;
    }
  }
  return visible;
}

function updateFOV() {
  const { player, map } = state;
  const visible = computeFOV(player.x, player.y, map.tiles);
  map.visible = visible;
  for (let y = 0; y < map.explored.length; y++)
    for (let x = 0; x < map.explored[0].length; x++)
      if (visible[y][x]) map.explored[y][x] = true;
}

// --- Floor building ---

function buildFloor(floor, player) {
  const { tiles, rooms: _rooms, exitPos, spawnTiles, startRoom, explored } = generateDungeon();
  const startX = Math.floor(startRoom.x + startRoom.w / 2);
  const startY = Math.floor(startRoom.y + startRoom.h / 2);
  player.x = startX;
  player.y = startY;
  const enemies = spawnEnemies(spawnTiles, [player], floor);
  const items    = spawnItems(spawnTiles, [player, ...enemies]);
  return { map: { tiles, exitPos, explored, visible: null }, enemies, items };
}

function init() {
  const player = new Player(0, 0); // position set by buildFloor
  const floor  = 1;
  const { map, enemies, items } = buildFloor(floor, player);

  state = {
    map,
    player,
    enemies,
    items,
    log:    'Find the golden exit and escape!',
    status: 'playing',
    floor,
    turns:  0,
    kills:  0,
  };

  updateFOV();
  render(canvas, ctx, state);
}

function nextFloor() {
  state.floor += 1;
  if (state.floor > MAX_FLOORS) {
    state.status = 'win';
    return;
  }
  const { map, enemies, items } = buildFloor(state.floor, state.player);
  state.map     = map;
  state.enemies = enemies;
  state.items   = items;
  state.log     = `Floor ${state.floor} — deeper dangers await…`;
  updateFOV();
}

// --- Leveling ---

function levelUp() {
  state.status = 'levelup';
}

function applyLevelUp(index) {
  const { player } = state;
  player.xp -= player.xpToNext;
  player.level += 1;
  player.xpToNext = player.level * 10;
  LEVEL_UP_CHOICES[index].apply(player);
  state.log = `Level ${player.level}! You chose ${LEVEL_UP_CHOICES[index].label}.`;
  state.status = 'playing';
  updateFOV();
  render(canvas, ctx, state);
}

// --- Turn logic ---

function tryMove(dx, dy) {
  if (state.status !== 'playing') return;

  const { player, enemies, items, map } = state;
  const nx = player.x + dx;
  const ny = player.y + dy;

  if (map.tiles[ny]?.[nx] === undefined || map.tiles[ny][nx] === 0) return; // wall

  state.turns += 1;

  // Attack enemy?
  const target = enemies.find(e => e.alive && e.x === nx && e.y === ny);
  if (target) {
    const dmg = resolveAttack(player, target);
    state.log = `You hit the ${target.name} for ${dmg} damage!`;
    if (!target.alive) {
      state.kills += 1;
      state.log += ` The ${target.name} dies.`;
      player.xp += target.xp;
      if (player.xp >= player.xpToNext) levelUp();
    }
  } else {
    player.x = nx;
    player.y = ny;

    // Pick up item?
    const itemIdx = items.findIndex(it => it.x === nx && it.y === ny);
    if (itemIdx !== -1) {
      const item = items[itemIdx];
      items.splice(itemIdx, 1);
      if (item.effect === 'heal') {
        const healed = Math.min(item.value, player.maxHp - player.hp);
        player.hp += healed;
        state.log = `You drink a ${item.name} and restore ${healed} HP.`;
      }
    } else if (map.tiles[ny][nx] === TILE.EXIT) {
      nextFloor();
      render(canvas, ctx, state);
      return;
    } else {
      state.log = '';
    }
  }

  // Enemies act
  enemyTurn();

  if (!player.alive) state.status = 'lose';
  updateFOV();
  render(canvas, ctx, state);
}

function enemyTurn() {
  const { player, enemies, map } = state;
  const allEntities = [player, ...enemies.filter(e => e.alive)];

  for (const e of enemies) {
    if (!e.alive) continue;
    if (Math.abs(e.x - player.x) <= 1 && Math.abs(e.y - player.y) <= 1) {
      const dmg = resolveAttack(e, player);
      state.log = `The ${e.name} hits you for ${dmg}!`;
    } else {
      const others = allEntities.filter(en => en !== e);
      const next = e.stepToward(player.x, player.y, map.tiles, others);
      if (next) { e.x = next.x; e.y = next.y; }
    }
  }
}

// --- Input ---

const KEY_MAP = {
  ArrowUp: [0,-1], ArrowDown: [0,1], ArrowLeft: [-1,0], ArrowRight: [1,0],
  w: [0,-1], s: [0,1], a: [-1,0], d: [1,0],
  W: [0,-1], S: [0,1], A: [-1,0], D: [1,0],
};

window.addEventListener('keydown', e => {
  if (e.key === 'r' || e.key === 'R') { init(); return; }
  if (state.status === 'levelup') {
    const idx = { '1': 0, '2': 1, '3': 2 }[e.key];
    if (idx !== undefined) applyLevelUp(idx);
    return;
  }
  const dir = KEY_MAP[e.key];
  if (dir) { e.preventDefault(); tryMove(...dir); }
});

init();
