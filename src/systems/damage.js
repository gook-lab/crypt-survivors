// Damage system — applies damage, knockback, crits, on-hit procs and death.
//
// Emits hit-events (eng-review D11): the renderer draws damage numbers, hit
// flash and impact/proc FX, audio plays SFX, all off the same channel. A hit
// may roll a critical and an on-hit proc (a `status_*` proc applies a status,
// any other proc fx is a one-shot burst). On an enemy's death it drops an XP
// gem and, rarely, a loot item; a boss always drops a treasure chest.

import { GEM } from '../config.js';
import { DROPS, DROP_CHANCE, rollDrop } from '../content/drops.js';
import { applyStatus } from './status.js';

const STAGGER_KB = 16; // knockback at/above this briefly staggers the enemy

export function createDamage(rng, loadout) {
  let weeklyModifier = null; // weekly challenge rule for the current run (null = normal run)
  function gemSprite(xp) {
    if (xp >= 12) return 'pickup_xp_red';
    if (xp >= 4) return 'pickup_xp_green';
    return 'pickup_xp_blue';
  }

  function spawnDrop(world, dropId, x, y) {
    world.spawn('drop', {
      dropId,
      sprite: DROPS[dropId].sprite,
      x,
      y,
      vx: 0,
      vy: 0,
      radius: 10,
    });
  }

  // dirx/diry: direction the hit came from. `source` is the projectile that
  // landed the hit (carries crit params, impact FX, on-hit proc) — may be absent.
  function apply(world, events, stats, target, amount, dirx, diry, knockback, source) {
    if (target.dead) return;

    // critical hit roll
    let dmg = amount;
    let crit = false;
    if (source && rng && source.critChance && rng.next() < source.critChance) {
      dmg *= source.critMult || 2;
      crit = true;
    }
    // 깨부수기 — a frozen enemy is brittle; every hit lands for 1.5×
    if (target.status && target.status.freeze > 0) dmg *= 1.5;
    // 실드 — a 'shielded' enemy raises a periodic barrier (enemyAbilities ticks
    // shieldT down). While up, it soaks 90% of incoming damage, so the player
    // has to wait out the window or burst between cycles.
    if (target.shieldT > 0) dmg *= 0.1;
    target.hp -= dmg;

    // attribute damage to the weapon that fired the source projectile —
    // result.js reads stats.damageByWeapon for the per-weapon contribution
    // chart. Each weapon also tracks its kill share so the breakdown line up.
    if (source && source.weaponId) {
      if (!stats.damageByWeapon) stats.damageByWeapon = {};
      stats.damageByWeapon[source.weaponId] = (stats.damageByWeapon[source.weaponId] || 0) + dmg;
    }
    stats.damage = (stats.damage || 0) + dmg;
    stats.hits = (stats.hits || 0) + 1; // every damage event — accurate base for crit rate
    if (crit) stats.crits = (stats.crits || 0) + 1;

    if (knockback) {
      const len = Math.hypot(dirx, diry) || 1;
      target.x += (dirx / len) * knockback;
      target.y += (diry / len) * knockback;
      // a heavy hit also staggers — a brief movement halt (movement.js reads
      // staggerT). Bosses are too massive to be staggered.
      if (!target.boss && knockback >= STAGGER_KB) {
        const s = Math.min(0.32, knockback / 110);
        target.staggerT = Math.max(target.staggerT || 0, s);
      }
    }

    // on-hit proc — a status_* fx applies that status; any other fx is a burst
    let procFx = null;
    if (source && source.proc && rng && rng.next() < source.proc.chance) {
      const pfx = source.proc.fx;
      if (pfx && pfx.indexOf('status_') === 0 && target.hp > 0) {
        applyStatus(target, pfx.slice(7));
      } else if (pfx) {
        procFx = pfx;
      }
    }

    events.emit('hit', {
      x: target.x,
      y: target.y,
      amount: dmg,
      id: target.id,
      crit,
      impactFx: source ? source.impactFx : null,
      classImpactFx: source ? source.classImpactFx : null,
      procFx,
      // hit direction — renderer uses it to bias the shake (사방랜덤 ❌, 맞은
      // 방향으로 ✅) so the impact reads as "this hit came from here"
      dirx, diry,
    });

    if (target.hp <= 0) {
      world.kill(target);
      stats.kills += 1;
      stats.gold += target.gold ?? 0;
      events.emit('kill', {
        id: target.id,
        x: target.x,
        y: target.y,
        enemyType: target.enemyType,
        boss: !!target.boss,
        miniBoss: !!target.miniBoss,
        ability: target.ability || null, // for the on-death 'burst' skill
        dmg: target.damage || 0,
      });

      const xp = target.xp ?? 1;
      world.spawn('gem', {
        x: target.x,
        y: target.y,
        vx: 0,
        vy: 0,
        xp,
        radius: GEM.radius,
        color: GEM.color,
        sprite: gemSprite(xp),
      });

      if (target.boss) {
        spawnDrop(world, 'chest', target.x, target.y);
        events.emit('bossKill', { x: target.x, y: target.y });
      } else if (target.miniBoss) {
        // mini-boss reward — a wood-tier chest (smaller than the boss chest)
        // and a 'miniBossKill' event so main can play a flourish
        const drop = world.spawn('drop', {
          dropId: 'chest',
          chestTier: 'wood',
          sprite: DROPS.chest.sprite,
          x: target.x, y: target.y,
          vx: 0, vy: 0, radius: 10,
        });
        events.emit('miniBossKill', { x: target.x, y: target.y });
        void drop;
      } else if (rng && rng.next() < DROP_CHANCE * (1 + (loadout ? loadout.luck : 0))) {
        spawnDrop(world, rollDrop(rng, { noHeal: weeklyModifier?.modifierName === 'no_healing' }), target.x, target.y);
      }
    }
  }

  function setWeeklyModifier(modifier) {
    weeklyModifier = modifier;
  }

  return { apply, setWeeklyModifier };
}
