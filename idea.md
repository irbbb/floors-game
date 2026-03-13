# Roguelike Game (Browser)

Turn-based dungeon crawler running in the browser.

## Core Loop
Procedurally generated dungeon → explore rooms → fight enemies in turn-based combat → reach the golden exit → win. Die if HP reaches 0.

## Tech
- Vanilla JS (ES modules, no build step)
- Canvas 2D API for rendering
- Serve with `npx serve .` or VS Code Live Server (required for ES modules)

## Controls
- Move / attack: Arrow keys or WASD
- Restart: R

## Architecture
```
index.html          entry point
src/
  constants.js      tile size, colors, stats
  dungeon.js        BSP procedural map generation
  entities.js       Player and Enemy classes
  combat.js         resolveAttack(attacker, defender)
  renderer.js       render(canvas, ctx, state)
  main.js           game loop, input handling, state
```

## Game State Shape
```js
{
  map:     { tiles: TILE[][], exitPos: {x,y} },
  player:  Player,
  enemies: Enemy[],
  log:     string,     // last combat message
  status:  'playing' | 'win' | 'lose'
}
```

## Prototype Scope
1 floor, 8 enemies (Rats / Goblins / Orcs), one exit. No persistence.

## Possible Next Steps
- Multiple floors (staircase descend)
- Items / potions
- FOV / fog of war
- Score / turn counter
- Ranged attacks or spells
