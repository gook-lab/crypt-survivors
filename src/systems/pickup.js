// Pickup system — magnet + collection for XP gems and loot drops.
//
// A gem or drop inside the magnet radius is pulled toward the player; once it
// touches the player it is collected. A gem feeds XP into progression; a drop
// is handed to onCollectDrop so main.js can apply its effect.

import { GEM } from '../config.js';

export function createPickup() {
  let weeklyModifier = null;

  function update(dt, world, player, loadout, progression, onCollectDrop) {
    const ents = world.entities;
    const magnetSq = loadout.magnet * loadout.magnet;
    const gemCollect = player.radius + GEM.radius;
    const gemCollectSq = gemCollect * gemCollect;

    for (let i = 0; i < ents.length; i++) {
      const g = ents[i];
      if (g.dead) continue;
      const isGem = g.type === 'gem';
      if (!isGem && g.type !== 'drop') continue;

      const dx = player.x - g.x;
      const dy = player.y - g.y;
      const sq = dx * dx + dy * dy;

      if (isGem) {
        if (sq <= gemCollectSq) {
          let xpGain = g.xp * (loadout.xpGainMult ?? 1);
          // Apply weekly challenge xp multiplier
          if (weeklyModifier?.modifierName === 'xp_mult') {
            xpGain *= weeklyModifier.value;
          }
          progression.addXp(xpGain);
          world.kill(g);
          continue;
        }
      } else {
        const collect = player.radius + g.radius;
        if (sq <= collect * collect) {
          world.kill(g);
          if (onCollectDrop) onCollectDrop(g);
          continue;
        }
      }

      if (sq <= magnetSq) {
        const d = Math.sqrt(sq) || 1;
        g.x += (dx / d) * GEM.pull * dt;
        g.y += (dy / d) * GEM.pull * dt;
      }
    }
  }

  function setWeeklyModifier(modifier) {
    weeklyModifier = modifier;
  }

  return { update, setWeeklyModifier };
}
