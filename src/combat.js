export function resolveAttack(attacker, defender) {
  const dmg = Math.max(1, attacker.atk - defender.def);
  defender.hp = Math.max(0, defender.hp - dmg);
  return dmg;
}
