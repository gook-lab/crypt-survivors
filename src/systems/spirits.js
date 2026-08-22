// Spirit system — companion entities + their per-element effects.
//
// For each spirit the player owns (loadout.spirits[id] = tier) a 'spirit'
// entity orbits the player. On its own cooldown the spirit acts per its
// role: heal the player, refill the damage shield, or fire a projectile at
// the nearest enemy. Spirit projectiles flow through the normal collision
// pipeline. 'spirit' entities are inert to every other system — this module
// alone spawns, positions and ticks them.

import { SPIRITS, spiritSprite } from '../content/spirits.js';

// Resolve the accent (overlay) sprite for a fused spirit — picks the
// accentSprites entry at the current tier. Returns null for plain spirits.
function accentSprite(id, tier) {
  const def = SPIRITS[id];
  if (!def || !def.accentSprites) return null;
  const arr = def.accentSprites;
  return arr[Math.min(Math.max(tier, 1), arr.length) - 1];
}

const ORBIT_RADIUS = 52; // px the companions circle the player at
const ORBIT_SPEED = 1.4; // rad/sec
const SHIELD_CAP = 90; // most shield the water spirit can stack

export function createSpirits() {
  const companions = new Map(); // spirit id -> companion entity
  const timers = {}; // spirit id -> seconds until next act

  function nearestEnemy(world, x, y) {
    let best = null;
    let bestSq = Infinity;
    const ents = world.entities;
    for (let i = 0; i < ents.length; i++) {
      const e = ents[i];
      if (e.type !== 'enemy' || e.dead) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      const sq = dx * dx + dy * dy;
      if (sq < bestSq) {
        bestSq = sq;
        best = e;
      }
    }
    return best;
  }

  // Run one spirit's effect. Returns false if it could not act (no target).
  function act(world, player, id, tier, comp) {
    const def = SPIRITS[id];
    if (def.role === 'heal') {
      player.hp = Math.min(player.maxHp, player.hp + def.heal * tier);
      // fused spirits (oberon) also top up the shield each pulse — a heal
      // spirit that also grants barrier so the role combo reads as "queen"
      if (def.bonusShield) {
        player.shield = Math.min(SHIELD_CAP, (player.shield ?? 0) + def.bonusShield * tier);
      }
    } else if (def.role === 'shield') {
      player.shield = Math.min(SHIELD_CAP, (player.shield ?? 0) + def.shield * tier);
    } else if (def.role === 'attack') {
      const target = nearestEnemy(world, comp.x, comp.y);
      if (!target) return false;
      const ang = Math.atan2(target.y - comp.y, target.x - comp.x);
      // proc + impactFx are defined per-spirit in content/spirits.js so a
      // new spirit (shadow / lightning / …) doesn't need a code change here
      world.spawn('projectile', {
        x: comp.x,
        y: comp.y,
        vx: Math.cos(ang) * def.speed,
        vy: Math.sin(ang) * def.speed,
        radius: def.radius,
        damage: def.damage * tier,
        pierce: def.pierce,
        life: def.life,
        knockback: def.knockback,
        color: def.color,
        sprite: def.atkSprite,
        hits: [],
        chain: def.chain || 0,
        impactFx: def.impactFx || 'fx_impact_smash',
        proc: def.proc ? { fx: def.proc, chance: 1 } : null,
      });
    }
    return true;
  }

  function update(dt, world, player, loadout) {
    const owned = Object.keys(loadout.spirits);
    for (let s = 0; s < owned.length; s++) {
      const id = owned[s];
      const tier = loadout.spirits[id];

      // ensure a companion entity exists for this spirit
      let comp = companions.get(id);
      if (!comp || comp.dead) {
        comp = world.spawn('spirit', {
          element: id,
          tier,
          x: player.x,
          y: player.y,
          radius: 6 + tier * 2,
          orbitAngle: (s / 4) * Math.PI * 2,
          sprite: spiritSprite(id, tier),
          accent: accentSprite(id, tier),
        });
        companions.set(id, comp);
      }
      comp.tier = tier;
      comp.radius = 6 + tier * 2;
      comp.sprite = spiritSprite(id, tier);
      comp.accent = accentSprite(id, tier);

      // orbit the player
      comp.orbitAngle += ORBIT_SPEED * dt;
      comp.x = player.x + Math.cos(comp.orbitAngle) * ORBIT_RADIUS;
      comp.y = player.y + Math.sin(comp.orbitAngle) * ORBIT_RADIUS;

      // act on cooldown
      timers[id] = (timers[id] ?? SPIRITS[id].cooldown) - dt;
      if (timers[id] <= 0) {
        const acted = act(world, player, id, tier, comp);
        timers[id] = acted ? SPIRITS[id].cooldown : 0;
      }
    }
  }

  return { update };
}
