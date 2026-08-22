// Enemy ability system — gives tagged enemies a real combat skill.
//
// spawn.js stamps `enemy.ability` from content/bestiary.js. Each frame this
// system ticks the enemy's ability cooldown and, when ready, acts:
//   'charge'   — a short speed burst toward the player (movement.js reads
//                e.charging as a speed-multiplier window)
//   'ranged'   — fires an enemy shot: a projectile flagged `enemyShot`, which
//                collision.js routes at the player
//   'bosscast' — alternates a 12-way bullet ring and a minion summon
// 'burst' is NOT ticked here — it fires once on death (main.js kill handler,
// via spawnEnemyShot).

import { ENEMIES } from '../config.js';
import { BESTIARY } from '../content/bestiary.js';

const SHOT_SPEED = 224; // px/sec — slow enough to dodge on foot
const SHOT_LIFE = 3.6;
const RANGED_CD = 2.7; // seconds between ranged shots
const RANGED_RANGE = 540; // only fires when the player is within this
const CHARGE_CD = 3.4;
const CHARGE_DUR = 0.55; // seconds a charge burst lasts
const CHARGE_RANGE = 380;
const BOSS_CD = 4.2;
const BOSS_TELEGRAPH = 0.5; // seconds a boss windup tells before the cast fires
const RANGED_TELEGRAPH = 0.35; // smaller windup for plain ranged enemies

// Expansion archetypes (2026-05-29 monster behaviour pass).
const SHIELD_UP = 1.5; // seconds a 'shielded' barrier holds (90% soak — damage.js)
const SHIELD_CD = 5.0; // seconds between barriers (measured from barrier drop)
const SUMMON_CD = 5.0; // seconds between a 'summoner' spawning adds
const SUMMON_TELEGRAPH = 0.4; // short windup before adds appear
const SUMMON_RANGE = 620; // only summons when the player is roughly on-screen
const SUMMON_CAP = 6; // lifetime cap on adds one summoner may spawn
const KAMI_RANGE = 320; // arms the dash when the player is within this
const KAMI_WINDUP = 0.4; // telegraph (red) before the lunge
const KAMI_DASH = 0.55; // dash duration; detonates when it expires
const KAMI_SHARDS = 7; // shrapnel projectiles on detonation (gaps to dodge through)
const BUFFER_TICK = 0.5; // seconds between a 'buffer' refreshing nearby allies
const BUFFER_RANGE = 180; // radius the haste aura reaches
// Entity soft cap — split/summoner skip spawning past this so a runaway pack
// can't blow the spatial-grid / 60fps budget. Tune via balance.js.
const ENEMY_SOFT_CAP = 420;

// Per-boss ability kits — each boss has a signature shot pattern + a themed
// minion, so a boss fight feels distinct. Patterns: 'ring' (full circle),
// 'cone' (a breath fan toward the player), 'spiral' (a rotating pinwheel),
// 'aimed' (a tight fast burst at the player). `tint` colours the shots.
//
// `signature` is the displayed ability name (shown on the boss bar + toast
// at spawn). `shotProc` is the on-hit status the shot applies — gives each
// boss a distinct combat flavour without new patterns.
const BOSS_KITS = {
  boss_skeleton_king: {
    signature: '뼈 폭풍', shot: 'ring', minion: 'walker', tint: 'boss',
  },
  boss_demon: {
    signature: '지옥의 불꽃', shot: 'ring', minion: 'imp', tint: 'boss',
    shotProc: 'burn',
  },
  boss_werewolf_king: {
    signature: '포효의 광기', shot: 'spiral', minion: 'wolf', tint: 'boss',
  },
  boss_bog_witch: {
    signature: '독무', shot: 'spiral', minion: 'frog', tint: null,
    shotProc: 'poison',
  },
  boss_magma_drake: {
    signature: '화염 숨결', shot: 'cone', minion: 'fire_bat', tint: 'fire',
    shotProc: 'burn',
  },
  boss_ice_queen: {
    signature: '서리 폭풍', shot: 'cone', minion: 'ice_wraith', tint: 'ice',
    shotProc: 'freeze',
  },
  boss_vampire: {
    signature: '흡혈 일격', shot: 'aimed', minion: 'bat', tint: 'boss',
    shotProc: 'bleed',
  },
  boss_idle: {
    signature: '공허의 부름', shot: 'aimed', minion: 'wisp', tint: null,
    shotProc: 'slow',
  },
  default: { signature: '암흑의 권능', shot: 'ring', minion: 'bat', tint: 'boss' },
};

// Resolve the kit for a boss sprite — exported so the UI can render the
// signature on the boss bar and spawn-toast pop without re-keying.
export function bossKitFor(spriteId) {
  return BOSS_KITS[spriteId] || BOSS_KITS.default;
}

// Spawn one enemy shot — a projectile flagged so collision aims it at the
// player. `kind` tints it so the player can read the threat at a glance.
// New kinds map to per-boss signature procs (poison / bleed / slow) on top
// of the original fire / ice / boss / void palette.
export function spawnEnemyShot(world, x, y, dirx, diry, speed, damage, kind) {
  const color = kind === 'fire' ? 0xf0822a
    : kind === 'ice' ? 0x7cc4e4
    : kind === 'boss' ? 0xc8463a
    : kind === 'poison' ? 0x88c850
    : kind === 'bleed' ? 0xc8332a
    : kind === 'slow' ? 0x9a78e8
    : 0xc060d0;
  world.spawn('projectile', {
    x,
    y,
    vx: dirx * speed,
    vy: diry * speed,
    radius: 8,
    damage,
    life: SHOT_LIFE,
    pierce: 1,
    knockback: 0,
    color,
    sprite: null,
    hits: [],
    enemyShot: true,
  });
}

export function createEnemyAbilities() {
  // `events` is optional — when present (main.js), ability moments emit an
  // 'enemyFx' event so main can play SFX / spawn a renderer flourish. The sim
  // stays headless (no audio/Pixi); balance.js passes its events harmlessly.
  function update(dt, world, player, events) {
    const ents = world.entities;
    for (let i = 0; i < ents.length; i++) {
      const e = ents[i];
      if (e.type !== 'enemy' || e.dead || !e.ability) continue;

      if (e.charging > 0) e.charging -= dt; // run the charge window down
      if (e.shieldT > 0) e.shieldT -= dt; // 'shielded' barrier counts down

      // kamikaze detonation — once armed, the enemy dashes (e.charging window)
      // then blows up when the dash expires. Resolved at the top so it runs
      // before any cooldown logic; the shrapnel ring + self-kill happen once.
      if (e.kamiArmed) {
        if (e.charging > 0) continue; // still lunging
        detonateKamikaze(world, e, events);
        continue;
      }

      // Telegraph window — the enemy commits to a cast and shows it for a
      // beat before firing. While `telegraph > 0` the enemy stands still
      // (movement.js can read e.telegraph as a freeze), and the renderer
      // shows a pulsing danger disc. When it hits 0, the queued cast fires.
      if (e.telegraph > 0) {
        e.telegraph -= dt;
        if (e.telegraph > 0) continue;
        // resolve the queued cast — castDir was captured at queue time so
        // dodging mid-windup actually works (the boss can't track you)
        if (e.castQueued === 'ranged') {
          spawnEnemyShot(world, e.x, e.y, e.castDx, e.castDy, SHOT_SPEED,
            Math.round(e.damage * 0.85), e.castTint);
          e.abilityCd = RANGED_CD;
        } else if (e.castQueued === 'boss') {
          fireBossCast(world, e);
          e.abilityCd = BOSS_CD * (e.castPhase === 3 ? 0.62 : e.castPhase === 2 ? 0.82 : 1);
        } else if (e.castQueued === 'summon') {
          spawnAdds(world, e, events);
          e.abilityCd = SUMMON_CD;
        } else if (e.castQueued === 'kamikaze') {
          // windup over → commit to the lunge. detonation handled at loop top.
          e.charging = KAMI_DASH;
          e.kamiArmed = true;
          e.abilityCd = 99; // suppressed; the entity dies on detonation anyway
        }
        e.castQueued = null;
        continue;
      }

      e.abilityCd = (e.abilityCd ?? 1) - dt;
      if (e.abilityCd > 0) continue;

      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const dist = Math.hypot(dx, dy) || 1;

      if (e.ability === 'ranged') {
        // Tier gate (user feedback): only elite / boss / mini-boss enemies
        // may fire projectiles. A basic-role enemy with `ability: 'ranged'`
        // (legacy data or a mod) silently no-ops here. Bestiary lookup is
        // O(1) and the result is cached on the entity after first call.
        if (e.tierAllowsShots === undefined) {
          const role = BESTIARY[e.enemyType] ? BESTIARY[e.enemyType].role : 'basic';
          e.tierAllowsShots = role === 'elite' || !!e.boss || !!e.miniBoss;
        }
        if (!e.tierAllowsShots) {
          e.abilityCd = 9999; // dormant — never fires
          continue;
        }
        if (dist < RANGED_RANGE && dist > 70) {
          const kind = /fire|imp|lava|magma/.test(e.enemyType) ? 'fire'
            : /ice|frost|wraith/.test(e.enemyType) ? 'ice' : null;
          // queue the shot; resolve it after the telegraph
          e.telegraph = RANGED_TELEGRAPH;
          e.castQueued = 'ranged';
          e.castDx = dx / dist;
          e.castDy = dy / dist;
          e.castTint = kind;
          e.abilityCd = 99; // suppress until telegraph resolves
        } else {
          e.abilityCd = 0.5; // out of range — re-check soon
        }
      } else if (e.ability === 'charge') {
        if (dist < CHARGE_RANGE) {
          e.charging = CHARGE_DUR;
          e.abilityCd = CHARGE_CD;
        } else {
          e.abilityCd = 0.5;
        }
      } else if (e.ability === 'bosscast') {
        // queue a boss cast: capture phase + aim NOW, fire after the telegraph.
        // The player sees a windup ring and can reposition — castDx/Dy snap at
        // queue time, so kiting through the windup actually pays off.
        e.castN = (e.castN ?? 0) + 1;
        const hpFrac = e.maxHp > 0 ? e.hp / e.maxHp : 1;
        e.castPhase = hpFrac > 0.66 ? 1 : hpFrac > 0.33 ? 2 : 3;
        e.castDx = dx / dist;
        e.castDy = dy / dist;
        e.telegraph = BOSS_TELEGRAPH;
        e.castQueued = 'boss';
        e.abilityCd = 99; // wait for the telegraph to resolve
      } else if (e.ability === 'summoner') {
        // periodically conjure adds. Gated by a lifetime cap + the world soft
        // cap so a summoner can't flood the field. Telegraphs before spawning.
        if (dist < SUMMON_RANGE
          && (e.summonedTotal || 0) < SUMMON_CAP
          && world.count('enemy') < ENEMY_SOFT_CAP) {
          e.telegraph = SUMMON_TELEGRAPH;
          e.castQueued = 'summon';
          e.abilityCd = 99;
        } else {
          e.abilityCd = 1.0;
        }
      } else if (e.ability === 'kamikaze') {
        // arm the dash when the player is close; the windup tells before lunge
        if (dist < KAMI_RANGE) {
          e.telegraph = KAMI_WINDUP;
          e.castQueued = 'kamikaze';
          e.castDx = dx / dist;
          e.castDy = dy / dist;
          e.abilityCd = 99;
        } else {
          e.abilityCd = 0.4;
        }
      } else if (e.ability === 'shielded') {
        // raise the barrier (90% soak — damage.js reads shieldT) on a cycle.
        // The shield ring (renderer drawEnemyAuras) + SFX are the tell.
        e.shieldT = SHIELD_UP;
        e.abilityCd = SHIELD_CD + SHIELD_UP;
        if (events) events.emit('enemyFx', { kind: 'shield', x: e.x, y: e.y });
      } else if (e.ability === 'buffer') {
        // haste aura — stamp a short hasteT on nearby allies (movement reads it
        // and owns its expiry). Refreshes on a fast tick so the buff holds while
        // the buffer lives and lapses on its own once it dies. Skips self.
        const ents2 = world.entities;
        for (let b = 0; b < ents2.length; b++) {
          const o = ents2[b];
          if (o === e || o.type !== 'enemy' || o.dead) continue;
          const bx = o.x - e.x;
          const by = o.y - e.y;
          if (bx * bx + by * by <= BUFFER_RANGE * BUFFER_RANGE) {
            o.hasteT = BUFFER_TICK + 0.15;
          }
        }
        e.abilityCd = BUFFER_TICK;
      }
    }
  }

  // 'summoner' spawn — 1-2 biome-appropriate adds in a small arc in front of
  // the summoner. Counts toward e.summonedTotal (the lifetime cap). Reuses the
  // bosscast minion stat-copy shape; no ring/bullet-hell.
  function spawnAdds(world, e, events) {
    const type = e.summonType || 'bat';
    if (events) events.emit('enemyFx', { kind: 'summon', x: e.x, y: e.y });
    const md = ENEMIES[type] || ENEMIES.bat;
    const count = 1 + (e.id % 2); // 1 or 2, deterministic
    for (let k = 0; k < count; k++) {
      if (world.count('enemy') >= ENEMY_SOFT_CAP) break;
      const a = (k / Math.max(1, count)) * 1.4 - 0.7 + Math.atan2(e.castDy || 0, e.castDx || 1);
      world.spawn('enemy', {
        enemyType: type,
        sprite: md.sprite || ('' + type + '_walk'),
        x: e.x + Math.cos(a) * 40,
        y: e.y + Math.sin(a) * 40,
        vx: 0,
        vy: 0,
        hp: md.maxHp,
        maxHp: md.maxHp,
        radius: md.radius,
        speed: md.speed,
        damage: md.damage,
        xp: md.xp,
        gold: md.gold,
        color: md.color,
      });
      e.summonedTotal = (e.summonedTotal || 0) + 1;
    }
  }

  // kamikaze detonation — a dense shrapnel ring of enemy shots, then self-kill.
  // Bypasses the elite-only ranged tier gate on purpose: the windup telegraph +
  // the visible lunge make the explosion fair to dodge, and exploding is the
  // whole identity of the archetype. Damage per shard is a fraction of contact.
  function detonateKamikaze(world, e, events) {
    const dmg = Math.max(1, Math.round((e.damage || 8) * 0.5));
    for (let k = 0; k < KAMI_SHARDS; k++) {
      const a = (k / KAMI_SHARDS) * Math.PI * 2;
      spawnEnemyShot(world, e.x, e.y, Math.cos(a), Math.sin(a), 196, dmg, 'fire');
    }
    if (events) events.emit('enemyFx', { kind: 'kamikaze', x: e.x, y: e.y });
    world.kill(e);
  }

  // Resolve a queued boss cast — runs after BOSS_TELEGRAPH seconds elapsed.
  function fireBossCast(world, e) {
    const phase = e.castPhase || 1;
    const kit = BOSS_KITS[e.sprite] || BOSS_KITS.default;
    // signature procs override the base kit.tint so the shot colour matches
    // the named ability (e.g., 화염 숨결 → fire orange, 독무 → poison green).
    const shotKind = kit.shotProc || kit.tint;
    const spd = SHOT_SPEED * (phase === 3 ? 1.12 : 0.92);
    const dmg = Math.round(e.damage * 0.3);
    const aim = Math.atan2(e.castDy, e.castDx);
    const shoot = kit.shot !== 'ring' || phase >= 2 || e.castN % 2 === 1;
    if (shoot) {
      if (kit.shot === 'cone') {
        const n = phase === 3 ? 9 : phase === 2 ? 7 : 5;
        for (let k = 0; k < n; k++) {
          const a = aim + (k / (n - 1) - 0.5) * 1.1;
          spawnEnemyShot(world, e.x, e.y, Math.cos(a), Math.sin(a), spd, dmg, shotKind);
        }
      } else if (kit.shot === 'spiral') {
        const n = phase === 3 ? 14 : phase === 2 ? 11 : 9;
        for (let k = 0; k < n; k++) {
          const a = aim + k * 0.5 + e.castN * 0.7;
          spawnEnemyShot(world, e.x, e.y, Math.cos(a), Math.sin(a), spd, dmg, shotKind);
        }
      } else if (kit.shot === 'aimed') {
        const n = phase === 3 ? 6 : phase === 2 ? 4 : 3;
        for (let k = 0; k < n; k++) {
          const a = aim + (k / Math.max(1, n - 1) - 0.5) * 0.52;
          spawnEnemyShot(world, e.x, e.y, Math.cos(a), Math.sin(a), spd, dmg, shotKind);
        }
      } else {
        const n = phase === 3 ? 16 : phase === 2 ? 13 : 10;
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2 + e.castN * 0.4;
          spawnEnemyShot(world, e.x, e.y, Math.cos(a), Math.sin(a), spd, dmg, shotKind);
        }
      }
    }
    if (e.castN % 2 === 0) {
      const md = ENEMIES[kit.minion] || ENEMIES.bat;
      const count = phase === 3 ? 4 : 3;
      for (let k = 0; k < count; k++) {
        const a = (k / count) * Math.PI * 2 + e.castN;
        world.spawn('enemy', {
          enemyType: kit.minion,
          x: e.x + Math.cos(a) * 74,
          y: e.y + Math.sin(a) * 74,
          vx: 0,
          vy: 0,
          hp: md.maxHp * 2,
          maxHp: md.maxHp * 2,
          radius: md.radius,
          speed: md.speed,
          damage: md.damage,
          xp: md.xp,
          gold: md.gold,
          color: md.color,
        });
      }
    }
  }

  return { update };
}
