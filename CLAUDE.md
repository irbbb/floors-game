# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Browser-based turn-based roguelike. See [idea.md](idea.md) for full design notes.

## Running

ES modules require a local HTTP server — open `index.html` via:
```
npx serve .
```
or use VS Code Live Server. Do **not** open `index.html` directly as a `file://` URL.

## Architecture

No build step, no dependencies. Pure Vanilla JS + Canvas 2D.

**State object** flows through all modules:
```js
{ map: { tiles, exitPos }, player, enemies, log, status }
```
`status` drives the game: `'playing'` | `'win'` | `'lose'`.

**Turn order:** Player moves/attacks → `enemyTurn()` runs → render. Everything happens synchronously on each keypress.

**Key files:**
- [src/main.js](src/main.js) — wires everything; `init()` builds state, `tryMove()` is the game tick
- [src/dungeon.js](src/dungeon.js) — BSP room generation; returns `tiles[][]`, `rooms[]`, `spawnTiles[]`, `exitPos`
- [src/renderer.js](src/renderer.js) — stateless `render(canvas, ctx, state)`; called once per tick
- [src/constants.js](src/constants.js) — all magic numbers (tile size, colors, stats) live here

## Adding Content

- **New enemy type:** add an entry to `ENEMY_TYPES` in [src/constants.js](src/constants.js)
- **New tile type:** add to the `TILE` enum in `constants.js`, handle in `renderer.js` and `dungeon.js`
- **Bigger map or more enemies:** change `MAP_W`, `MAP_H`, `ENEMY_COUNT` in `constants.js`
