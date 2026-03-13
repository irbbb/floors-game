import { TILE_SIZE, TILE, COLOR, MAX_FLOORS, LEVEL_UP_CHOICES, HUD_H } from './constants.js';

export function render(canvas, ctx, state) {
  const { map, player, enemies, items, log, status, floor, turns, kills } = state;
  const rows = map.tiles.length;
  const cols = map.tiles[0].length;

  canvas.width  = cols * TILE_SIZE;
  canvas.height = rows * TILE_SIZE + HUD_H;

  // --- Tiles ---
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const visible  = map.visible?.[y][x];
      const explored = map.explored?.[y][x];

      if (!explored) {
        ctx.fillStyle = '#000';
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        continue;
      }

      const t = map.tiles[y][x];
      ctx.fillStyle = t === TILE.WALL ? COLOR.WALL :
                      t === TILE.EXIT ? COLOR.EXIT : COLOR.FLOOR;
      ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

      if (!visible) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  // Exit glow (only when visible)
  if (map.visible?.[map.exitPos.y][map.exitPos.x]) {
    ctx.fillStyle = 'rgba(240,192,64,0.18)';
    ctx.fillRect(
      map.exitPos.x * TILE_SIZE - TILE_SIZE,
      map.exitPos.y * TILE_SIZE - TILE_SIZE,
      TILE_SIZE * 3,
      TILE_SIZE * 3,
    );
  }

  // --- Items ---
  for (const item of items) {
    if (!map.visible?.[item.y][item.x]) continue;
    ctx.fillStyle = item.color;
    const cx = item.x * TILE_SIZE + TILE_SIZE / 2;
    const cy = item.y * TILE_SIZE + TILE_SIZE / 2;
    if (item.symbol === '+') {
      const arm = TILE_SIZE * 0.28, thick = TILE_SIZE * 0.12;
      ctx.fillRect(cx - thick, cy - arm,   thick * 2, arm * 2);
      ctx.fillRect(cx - arm,   cy - thick, arm * 2,   thick * 2);
    } else {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${Math.round(TILE_SIZE * 0.7)}px monospace`;
      ctx.fillText(item.symbol, cx, cy - 2);
      // Bonus label below symbol
      const bonusParts = [];
      if (item.atkBonus) bonusParts.push(`+${item.atkBonus}A`);
      if (item.defBonus) bonusParts.push(`+${item.defBonus}D`);
      if (bonusParts.length) {
        ctx.font = `${Math.round(TILE_SIZE * 0.4)}px monospace`;
        ctx.fillText(bonusParts.join(' '), cx, cy + Math.round(TILE_SIZE * 0.38));
      }
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
  }

  // --- Enemies ---
  for (const e of enemies) {
    if (!e.alive) continue;
    if (!map.visible?.[e.y][e.x]) continue;
    ctx.fillStyle = e.color;
    drawCircle(ctx, e.x, e.y, TILE_SIZE * 0.38);

    // Mini HP bar
    const barW = TILE_SIZE - 4;
    const frac = e.hp / e.maxHp;
    ctx.fillStyle = '#3a1a1a';
    ctx.fillRect(e.x * TILE_SIZE + 2, e.y * TILE_SIZE + TILE_SIZE - 4, barW, 3);
    ctx.fillStyle = '#e05050';
    ctx.fillRect(e.x * TILE_SIZE + 2, e.y * TILE_SIZE + TILE_SIZE - 4, Math.round(barW * frac), 3);
  }

  // --- Player ---
  ctx.fillStyle = COLOR.PLAYER;
  drawCircle(ctx, player.x, player.y, TILE_SIZE * 0.42);

  // --- HUD ---
  const hudY = rows * TILE_SIZE;
  ctx.fillStyle = COLOR.HUD_BG;
  ctx.fillRect(0, hudY, canvas.width, HUD_H);

  // HP bar
  const barTotalW = 120;
  const hpFrac = player.hp / player.maxHp;
  ctx.fillStyle = COLOR.HUD_HP_BG;
  ctx.fillRect(10, hudY + 8, barTotalW, 12);
  ctx.fillStyle = COLOR.HUD_HP;
  ctx.fillRect(10, hudY + 8, Math.round(barTotalW * hpFrac), 12);
  ctx.fillStyle = COLOR.HUD_TEXT;
  ctx.font = '11px monospace';
  ctx.fillText(`HP ${player.hp}/${player.maxHp}`, 14, hudY + 19);

  // Level + XP bar (same row as HP)
  const xpBarX = 185;
  const xpBarW = 80;
  const xpFrac = player.xpToNext > 0 ? player.xp / player.xpToNext : 1;
  ctx.fillStyle = '#1a1a3a';
  ctx.fillRect(xpBarX, hudY + 8, xpBarW, 12);
  ctx.fillStyle = '#8060e0';
  ctx.fillRect(xpBarX, hudY + 8, Math.round(xpBarW * xpFrac), 12);
  ctx.fillStyle = COLOR.HUD_TEXT;
  ctx.font = '11px monospace';
  ctx.fillText(`Lv ${player.level}`, 145, hudY + 19);
  ctx.fillText(`XP ${player.xp}/${player.xpToNext}`, xpBarX + xpBarW + 6, hudY + 19);

  // Stats row: floor, kills, turns
  ctx.fillStyle = COLOR.HUD_TEXT;
  ctx.font = '12px monospace';
  ctx.fillText(`Floor ${floor}/${MAX_FLOORS}`, 10, hudY + 38);
  ctx.fillText(`Kills: ${kills}`, 110, hudY + 38);
  ctx.fillText(`Turns: ${turns}`, 210, hudY + 38);
  ctx.fillText(`ATK: ${player.atk}`, 310, hudY + 38);
  ctx.fillText(`DEF: ${player.def}`, 390, hudY + 38);

  // Log line
  ctx.fillStyle = '#a0a0b8';
  ctx.font = '11px monospace';
  ctx.fillText(log ?? '', 10, hudY + 57);

  // Gear row
  ctx.font = '11px monospace';
  ctx.fillStyle = COLOR.HUD_EQUIP_LABEL;
  ctx.fillText('WPN:', 10, hudY + 74);
  ctx.fillStyle = COLOR.HUD_EQUIP_ITEM;
  ctx.fillText(player.gear.weapon?.name ?? '—', 42, hudY + 74);
  ctx.fillStyle = COLOR.HUD_EQUIP_LABEL;
  ctx.fillText('ARM:', 180, hudY + 74);
  ctx.fillStyle = COLOR.HUD_EQUIP_ITEM;
  ctx.fillText(player.gear.armor?.name ?? '—', 212, hudY + 74);
  ctx.fillStyle = COLOR.HUD_EQUIP_LABEL;
  ctx.fillText('RNG:', 350, hudY + 74);
  ctx.fillStyle = COLOR.HUD_EQUIP_ITEM;
  ctx.fillText(player.gear.ring?.name ?? '—', 382, hudY + 74);

  // Controls (right side)
  ctx.fillStyle = '#555';
  ctx.font = '11px monospace';
  ctx.fillText('Move: arrow keys / WASD   R: restart', canvas.width - 265, hudY + 19);
  ctx.fillText('+  potion   /  sword   ]  armor   o  ring', canvas.width - 320, hudY + 38);

  // --- Overlay ---
  if (status === 'levelup') {
    ctx.fillStyle = COLOR.OVERLAY_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    ctx.font = 'bold 32px monospace';
    ctx.fillStyle = '#f0e080';
    ctx.fillText(`LEVEL UP!  →  Lv ${player.level + 1}`, cx, cy - 50);
    ctx.font = '18px monospace';
    ctx.fillStyle = COLOR.HUD_TEXT;
    LEVEL_UP_CHOICES.forEach((c, i) => {
      ctx.fillText(`[${i + 1}]  ${c.label}`, cx, cy + i * 34);
    });
    ctx.textAlign = 'left';
  } else if (status === 'win' || status === 'lose') {
    ctx.fillStyle = COLOR.OVERLAY_BG;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = status === 'win' ? COLOR.WIN : COLOR.LOSE;
    ctx.fillText(status === 'win' ? 'YOU ESCAPED!' : 'YOU DIED', cx, cy - 40);

    ctx.font = '16px monospace';
    ctx.fillStyle = COLOR.HUD_TEXT;
    ctx.fillText(`Floor reached: ${floor}   Kills: ${kills}   Turns: ${turns}`, cx, cy + 5);

    ctx.font = '18px monospace';
    ctx.fillStyle = '#888';
    ctx.fillText('Press R to restart', cx, cy + 38);
    ctx.textAlign = 'left';
  }
}

function drawCircle(ctx, tx, ty, r) {
  ctx.beginPath();
  ctx.arc(tx * TILE_SIZE + TILE_SIZE / 2, ty * TILE_SIZE + TILE_SIZE / 2, r, 0, Math.PI * 2);
  ctx.fill();
}
