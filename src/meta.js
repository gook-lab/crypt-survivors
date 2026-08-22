// Meta-progression — cost maths + applying permanent upgrades to a run.

import { META_UPGRADES } from './content/metaUpgrades.js';

// Inflation factor applied to every shop cost — keeps the per-upgrade
// `cost` arrays as design intent while making the shop genuinely expensive.
export const COST_SCALE = 1.5;

// Gold cost to buy the NEXT level of `upgrade` (currentLevel -> +1).
export function costFor(upgrade, currentLevel) {
  const base = upgrade.cost[currentLevel];
  return base == null ? Infinity : Math.ceil(base * COST_SCALE);
}

// Fold the player's saved permanent upgrades into the loadout + player at the
// start of a run. `savedUpgrades` is the { id: level } map from the save file.
export function applyMetaUpgrades(loadout, player, savedUpgrades) {
  const meta = loadout.meta;
  for (let i = 0; i < META_UPGRADES.length; i++) {
    const u = META_UPGRADES[i];
    const level = savedUpgrades[u.id] ?? 0;
    if (level <= 0) continue;
    if (u.meta) {
      for (const k in u.meta) meta[k] = (meta[k] ?? 0) + u.meta[k] * level;
    }
    if (u.token) {
      loadout.tokens[u.token] = (loadout.tokens[u.token] ?? 0) + level;
    }
  }
  loadout.recompute();
  player.armor = meta.armor; // damage reduction (collision reads it)
  player.revives = Math.round(meta.revive);
  player.maxHp = loadout.maxHp;
  player.hp = loadout.maxHp;
}
