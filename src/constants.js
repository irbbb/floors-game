export const TILE_SIZE = 20;
export const MAP_W = 40;
export const MAP_H = 30;

export const TILE = { WALL: 0, FLOOR: 1, EXIT: 2 };

export const COLOR = {
  WALL:            '#1a1a2e',
  FLOOR:           '#2d2d3d',
  EXIT:            '#f0c040',
  PLAYER:          '#e8e8ff',
  ENEMY:           '#e05050',
  ITEM:            '#60c080',
  HUD_BG:          '#0d0d1a',
  HUD_TEXT:        '#c8c8d8',
  HUD_HP:          '#e05050',
  HUD_HP_BG:       '#3a1a1a',
  OVERLAY_BG:      'rgba(0,0,0,0.7)',
  WIN:             '#80e080',
  LOSE:            '#e08080',
  HUD_EQUIP_LABEL: '#888899',
  HUD_EQUIP_ITEM:  '#d8d8f0',
};

export const PLAYER_STATS = { hp: 20, maxHp: 20, atk: 5, def: 2 };

export const ENEMY_TYPES = [
  { name: 'Rat',    color: '#c06030', hp: 4,  atk: 2, def: 0, xp: 2 },
  { name: 'Goblin', color: '#608040', hp: 8,  atk: 4, def: 1, xp: 4 },
  { name: 'Orc',    color: '#804040', hp: 14, atk: 6, def: 2, xp: 8 },
];

export const CLASSES = [
  {
    name: 'Warrior', color: '#e08040',
    desc: 'Sturdy melee fighter. Talents focus on HP and DEF.',
    talents: [
      { label: 'Toughness',  desc: '+5 Max HP, restore 5 HP',     apply: p => { p.maxHp += 5; p.hp = Math.min(p.hp + 5, p.maxHp); } },
      { label: 'Iron Skin',  desc: '+3 DEF',                       apply: p => { p.def += 3; } },
      { label: 'Battle Cry', desc: '+3 ATK, +3 Max HP',            apply: p => { p.atk += 3; p.maxHp += 3; } },
      { label: 'Endurance',  desc: '+8 Max HP, restore 8 HP',      apply: p => { p.maxHp += 8; p.hp = Math.min(p.hp + 8, p.maxHp); } },
      { label: 'Fortitude',  desc: '+2 DEF, regenerate 1 HP/turn', apply: p => { p.def += 2; p.regen += 1; } },
    ],
  },
  {
    name: 'Rogue', color: '#40c0a0',
    desc: 'Swift killer. Talents focus on ATK and on-kill rewards.',
    talents: [
      { label: 'Precision',  desc: '+5 ATK',                         apply: p => { p.atk += 5; } },
      { label: 'Nimble',     desc: '+3 ATK, +1 DEF, +3 Max HP',      apply: p => { p.atk += 3; p.def += 1; p.maxHp += 3; } },
      { label: 'Bloodlust',  desc: 'Heal 2 HP on each kill',         apply: p => { p.vampireHeal += 2; } },
      { label: 'Blitz',      desc: '+4 ATK, +4 Max HP',              apply: p => { p.atk += 4; p.maxHp += 4; } },
      { label: 'Shadowstep', desc: '+3 ATK, regenerate 1 HP/turn',   apply: p => { p.atk += 3; p.regen += 1; } },
    ],
  },
  {
    name: 'Mage', color: '#8080e0',
    desc: 'Arcane scholar. Balanced ATK/DEF with passive bonuses.',
    talents: [
      { label: 'Arcane Surge',  desc: '+4 ATK, +3 Max HP',             apply: p => { p.atk += 4; p.maxHp += 3; } },
      { label: 'Arcane Ward',   desc: '+4 DEF',                        apply: p => { p.def += 4; } },
      { label: 'Mana Shield',   desc: '+2 DEF, +3 ATK',                apply: p => { p.def += 2; p.atk += 3; } },
      { label: 'Resonance',     desc: '+2 ATK, regenerate 1 HP/turn',  apply: p => { p.atk += 2; p.regen += 1; } },
      { label: 'Life Tap',      desc: 'Heal 3 HP on each kill',        apply: p => { p.vampireHeal += 3; } },
    ],
  },
];

export const BASE_ENEMY_COUNT = 6;
export const MAX_FLOORS = 5;
export const FOV_RADIUS = 6;
export const HUD_H = 90;

export const ITEM_TYPES = [
  { name: 'Health Potion', color: '#60c080', effect: 'heal',  value: 10, slot: null,     symbol: '+', atkBonus: 0, defBonus: 0 },
  { name: 'Short Sword',   color: '#c0c0e0', effect: 'equip', value: 0,  slot: 'weapon', symbol: '/', atkBonus: 2, defBonus: 0 },
  { name: 'Long Sword',    color: '#e0e0ff', effect: 'equip', value: 0,  slot: 'weapon', symbol: '/', atkBonus: 4, defBonus: 0 },
  { name: 'Leather Armor', color: '#c09040', effect: 'equip', value: 0,  slot: 'armor',  symbol: ']', atkBonus: 0, defBonus: 1 },
  { name: 'Chain Mail',    color: '#a0b8c0', effect: 'equip', value: 0,  slot: 'armor',  symbol: ']', atkBonus: 0, defBonus: 3 },
  { name: 'Ring of Power', color: '#e0a020', effect: 'equip', value: 0,  slot: 'ring',   symbol: 'o', atkBonus: 1, defBonus: 1 },
];
