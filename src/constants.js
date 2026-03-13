export const TILE_SIZE = 20;
export const MAP_W = 40;
export const MAP_H = 30;

export const TILE = { WALL: 0, FLOOR: 1, EXIT: 2 };

export const COLOR = {
  WALL:       '#1a1a2e',
  FLOOR:      '#2d2d3d',
  EXIT:       '#f0c040',
  PLAYER:     '#e8e8ff',
  ENEMY:      '#e05050',
  ITEM:       '#60c080',
  HUD_BG:     '#0d0d1a',
  HUD_TEXT:   '#c8c8d8',
  HUD_HP:     '#e05050',
  HUD_HP_BG:  '#3a1a1a',
  OVERLAY_BG: 'rgba(0,0,0,0.7)',
  WIN:        '#80e080',
  LOSE:       '#e08080',
};

export const PLAYER_STATS = { hp: 20, maxHp: 20, atk: 5, def: 2 };

export const ENEMY_TYPES = [
  { name: 'Rat',    color: '#c06030', hp: 4,  atk: 2, def: 0, xp: 2 },
  { name: 'Goblin', color: '#608040', hp: 8,  atk: 4, def: 1, xp: 4 },
  { name: 'Orc',    color: '#804040', hp: 14, atk: 6, def: 2, xp: 8 },
];

export const LEVEL_UP_CHOICES = [
  { label: '+3 ATK',    apply: p => { p.atk += 3; } },
  { label: '+2 DEF',    apply: p => { p.def += 2; } },
  { label: '+8 Max HP', apply: p => { p.maxHp += 8; p.hp = Math.min(p.hp + 8, p.maxHp); } },
];

export const BASE_ENEMY_COUNT = 6;
export const MAX_FLOORS = 5;
export const FOV_RADIUS = 6;

export const ITEM_TYPES = [
  { name: 'Health Potion', color: '#60c080', effect: 'heal', value: 10 },
];
