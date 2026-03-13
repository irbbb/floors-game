# Floors

A browser-based turn-based roguelike dungeon crawler built with vanilla JS and Canvas 2D.

## Play

Requires a local HTTP server (ES modules don't work over `file://`):

```
npx serve .
```

Then open `http://localhost:3000` in your browser.

## Controls

| Key | Action |
|-----|--------|
| Arrow keys / WASD | Move / attack |
| 1 / 2 / 3 | Choose stat boost on level-up |
| R | Restart |

## Features

- Procedurally generated dungeons via BSP room splitting
- Turn-based combat with ATK/DEF stats
- 5 floors with scaling enemy difficulty
- Fog of war with field-of-view radius
- XP and leveling system — choose a stat boost on each level-up
- Health potions scattered throughout each floor
- 3 enemy types: Rat, Goblin, Orc

## Tech

Vanilla JS (ES modules), Canvas 2D API. No build step, no dependencies.
