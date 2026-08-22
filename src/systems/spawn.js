// Spawn system — the difficulty director.
//
// Spawn rate + enemy hp scale with elapsed run time (the DIRECTOR curve) AND
// with player level (VS-style "HP × level" coupling). Type comes from the
// chosen map's biome pool: `enemies` (common) or, with a share that rises
// over time, `elites` (tougher). Bosses arrive on their own timer and use
// the map's biome boss. Enemies appear on a ring just off the 1280x720 view.
//
// HP formula (continuous / wave / mini-boss):
//   hp = baseHp × (1 + min × DIRECTOR.hpPerMinute)
//                × max(1, level × DIRECTOR.hpPerLevel)
//                × hellMul
//                × roleMult   // mini-boss = 4, wave/ambient = 1
//
// HP formula (boss):
//   hp = BOSS.hp × (1 + min × BOSS.hpPerMinute)
//                × max(1, level × BOSS.hpPerLevel)
//                × hellMul
//
// Density: continuous accumulator-based spawn PLUS a min-count buffer
// (DIRECTOR.minEnemies step function) — burst-fills (≤8/frame) when the
// world dips below the active tier so the screen always feels full.

import { SPAWN, ENEMIES, DIRECTOR, BOSS } from '../config.js';
import { BESTIARY } from '../content/bestiary.js';

// Mini-boss arrives halfway between regular bosses (first at 1:00, then
// every 2.5 min — so 1:00, 3:30, 6:00, 8:30, alternating with the main
// boss at 2:00, 4:30, 7:00, 9:30). Picks a sprite from the chapter's elite
// pool so it always feels biome-appropriate without new art.
const MINI = { firstMinute: 1, intervalMinute: 2.5 };

// Cohesive rush wave — every WAVE_PERIOD seconds, drop a tight pack of
// enemies on one side of the player so the swarm feels intentional, not
// just random ambient spawn. The pack shares a single approach angle, which
// reads as "they're charging together" without any group-AI logic.
const WAVE = { firstMinute: 0.75, intervalMinute: 1.1 };

// 사신 (reaper) gate — the VS 30:00 panic moment, scaled to this game's run
// length. First at 9:00, another every 1.5 min, never more than maxAlive at
// once. Hell mode pulls the first trigger earlier (7:00).
const REAPER = { firstMinute: 9, hellFirstMinute: 7, intervalMinute: 1.5, maxAlive: 3 };

// Cap per frame on minimum-count buffer burst-fill. 8 keeps the spatial
// hash + collision loop from a visible hitch when the floor jumps tiers
// (e.g. 0→25 at t=0, 70→140 at 7:00). Continuous accumulator still adds
// alongside, so the buffer just sets the floor.
const BUFFER_BURST_CAP = 8;

// Shared HP formula for ambient / wave / mini-boss. Mirrors the BOSS variant
// via dedicated dials. `roleMult` is the role multiplier (mini-boss=4).
function enemyHp(baseHp, minutes, level, hellMul, roleMult = 1) {
  const timeScale = 1 + minutes * DIRECTOR.hpPerMinute;
  const levelScale = Math.max(1, (level || 1) * DIRECTOR.hpPerLevel);
  return Math.round(baseHp * timeScale * levelScale * hellMul * roleMult);
}

function bossHp(minutes, level, hellMul) {
  const timeScale = 1 + minutes * BOSS.hpPerMinute;
  const levelScale = Math.max(1, (level || 1) * BOSS.hpPerLevel);
  return Math.round(BOSS.hp * timeScale * levelScale * hellMul);
}

export function createSpawn(rng) {
  let accumulator = 0; // fractional enemies owed
  let bossCount = 0; // bosses spawned so far
  let miniBossCount = 0; // mini-bosses spawned so far
  let waveCount = 0; // rush waves dropped so far
  let reaperTriggers = 0; // reaper waves triggered so far
  let map = null; // the chosen stage map (set by setMap)

  // chosen at map select — gives the biome enemy pool + boss
  function setMap(m) {
    map = m;
  }

  function pick(list) {
    return list[Math.floor(rng.next() * list.length)];
  }

  // Ability picker for a mini-boss. First INHERIT the elite's own bestiary
  // kit when it's a non-suicidal archetype — a brood_mother mini-boss summons
  // spiders, a rune_guardian mini-boss shields, a war_drummer mini-boss buffs,
  // a revenant mini-boss volleys. kamikaze is excluded on purpose: it ends in
  // world.kill(self) which bypasses damage.js's death block, so a kamikaze
  // mini-boss would self-destruct WITHOUT dropping its chest / firing the
  // miniBossKill event. Fall back to the sprite-family heuristic (flyers →
  // ranged, ground rushers → charge) for charge/null elites.
  function miniBossAbility(name) {
    const bd = BESTIARY[name];
    if (bd && /^(summoner|shielded|buffer|ranged)$/.test(bd.ability || '')) return bd.ability;
    if (/bat|wisp|hornet|wraith|fire_bat/.test(name)) return 'ranged';
    if (/wolf|frost_wolf|imp|goblin/.test(name)) return 'charge';
    // unknown family: 50/50 split, just so we don't pick the same kit twice
    return rng.next() < 0.5 ? 'charge' : 'ranged';
  }

  // A scaled-up elite from the chapter's pool — a 4× HP, +40% damage, +60%
  // size variant that uses the existing sprite/animation. On death it drops
  // a wood-tier chest. Ability is picked per family (charge / ranged); the
  // renderer outlines the result gold so the player sees it coming.
  function spawnMiniBoss(world, player, minutes, hellMul) {
    miniBossCount += 1;
    const elites = map && map.elites && map.elites.length > 0
      ? map.elites
      : ['brute'];
    const name = pick(elites);
    const def = ENEMIES[name];
    if (!def) return;
    const hp = enemyHp(def.maxHp, minutes, player.level, hellMul, 4);
    const angle = rng.next() * Math.PI * 2;
    const ability = miniBossAbility(name);
    const bd = BESTIARY[name] || {};
    world.spawn('enemy', {
      enemyType: name,
      miniBoss: true,
      x: player.x + Math.cos(angle) * SPAWN.radius,
      y: player.y + Math.sin(angle) * SPAWN.radius,
      vx: 0,
      vy: 0,
      hp,
      maxHp: hp,
      radius: def.radius * 1.6,
      speed: def.speed * (ability === 'charge' ? 0.9 : 0.7),
      damage: Math.round(def.damage * 1.4),
      xp: (def.xp || 1) * 6,
      gold: (def.gold || 1) * 6,
      color: ability === 'charge' ? 0xff8a3a : 0xa078ff, // rusher → orange, caster → purple
      ability,
      abilityCd: 1.5 + rng.next() * 2,
      // carry the elite's movement + summon kit so an orbit/weave/summoner
      // mini-boss behaves like its base elite (just bigger + tankier).
      movePattern: bd.movePattern || null,
      summonType: bd.summonType || null,
    });
  }

  // Formation placement — returns the (x,y) for the i-th member of a `shape`
  // wave, player-centred at SPAWN.radius. `theta` is the pack bearing. Shapes:
  //   wall        — a line abreast at one bearing, advancing as a front
  //   ring        — encircle the player from every side
  //   sine_column — a weaving column from one bearing (pairs with weave movers)
  //   pincer      — two halves from opposite bearings
  // Deterministic given (shape, theta, i) — no extra rng so the harness matches.
  function formationPos(shape, theta, i, count, player) {
    const R0 = SPAWN.radius;
    if (shape === 'ring') {
      const a = (i / count) * Math.PI * 2;
      return { x: player.x + Math.cos(a) * R0, y: player.y + Math.sin(a) * R0 };
    }
    if (shape === 'sine_column') {
      const d = R0 + i * 40;
      const s = Math.sin(i * 0.9) * 56;
      return {
        x: player.x + Math.cos(theta) * d + (-Math.sin(theta)) * s,
        y: player.y + Math.sin(theta) * d + Math.cos(theta) * s,
      };
    }
    // wall + pincer share the line-abreast math; pincer flips half to θ+π
    const th = shape === 'pincer' && i >= Math.floor(count / 2) ? theta + Math.PI : theta;
    const k = i - (count - 1) / 2;
    return {
      x: player.x + Math.cos(th) * R0 + (-Math.sin(th)) * k * 44,
      y: player.y + Math.sin(th) * R0 + Math.cos(th) * k * 44,
    };
  }

  // Drop a cohesive pack of enemies in a FORMATION — the swarm reads as a
  // designed wave (wall / ring / column / pincer) instead of an ambient
  // sprinkle. Shape cycles by waveCount so successive waves feel different.
  // Wave size scales with run time. Mix of common + elite per the current tier.
  function spawnWave(world, player, minutes, hellMul) {
    const shape = ['wall', 'ring', 'sine_column', 'pincer'][waveCount % 4];
    waveCount += 1;
    const bm = 1; // waves run cleanly through normal scaling — no blood-moon bonus
    const common = map && map.enemies ? map.enemies : ['walker'];
    const elites = map && map.elites ? map.elites : ['brute'];
    const eliteChance = Math.min(0.4, minutes * 0.08);
    const count = Math.min(18, 5 + Math.floor(minutes * 1.5));
    const cap = SPAWN.maxEnemies;
    const theta = rng.next() * Math.PI * 2; // pack bearing (rng is seeded)
    for (let i = 0; i < count; i++) {
      if (world.count('enemy') >= cap) break;
      const name = rng.next() < eliteChance ? pick(elites) : pick(common);
      const def = ENEMIES[name];
      if (!def) continue;
      const pos = formationPos(shape, theta, i, count, player);
      const maxHp = enemyHp(def.maxHp, minutes, player.level, hellMul);
      const bd = BESTIARY[name];
      const ability = bd ? bd.ability : null;
      world.spawn('enemy', {
        enemyType: name, wave: true,
        x: pos.x, y: pos.y,
        vx: 0, vy: 0,
        hp: maxHp, maxHp,
        radius: def.radius,
        speed: def.speed * 1.08, // wave members charge a touch faster than ambient
        damage: Math.round(def.damage * 0.85 * bm),
        xp: def.xp, gold: def.gold, color: def.color,
        ability, abilityCd: ability ? rng.next() * 2.5 : 0,
        movePattern: bd ? bd.movePattern || null : null,
        summonType: bd ? bd.summonType || null : null,
      });
    }
  }

  function spawnBoss(world, player, minutes, hellMul) {
    bossCount += 1;
    const hp = bossHp(minutes, player.level, hellMul);
    const slot = map && map.boss
      ? map.boss
      : BOSS.roster[(bossCount - 1) % BOSS.roster.length];
    const angle = rng.next() * Math.PI * 2;
    world.spawn('enemy', {
      enemyType: 'boss',
      boss: true,
      sprite: slot.sprite,
      bossName: slot.name,
      x: player.x + Math.cos(angle) * SPAWN.radius,
      y: player.y + Math.sin(angle) * SPAWN.radius,
      vx: 0,
      vy: 0,
      hp,
      maxHp: hp,
      radius: BOSS.radius,
      speed: BOSS.speed,
      damage: BOSS.damage,
      xp: BOSS.xp,
      gold: BOSS.gold,
      color: 0xff5454,
      ability: 'bosscast', // every boss casts (enemyAbilities.js)
      abilityCd: 3 + rng.next() * 1.5,
    });
  }

  // Single ambient enemy — used by continuous accumulator AND min-count
  // buffer burst-fill. Both call sites share the same biome pool, elite
  // chance, and HP formula, so the helper keeps them in lockstep.
  function spawnSingle(world, player, minutes, common, elites, eliteChance, hellMul, ev) {
    const name = rng.next() < eliteChance ? pick(elites) : pick(common);
    const def = ENEMIES[name];
    if (!def) return;
    const angle = rng.next() * Math.PI * 2;
    const bd = BESTIARY[name];
    const ability = bd ? bd.ability : null;
    const bm = ev ? 1.3 : 1; // blood-moon multiplier on speed + damage
    const hp = enemyHp(def.maxHp, minutes, player.level, hellMul);
    world.spawn('enemy', {
      enemyType: name,
      x: player.x + Math.cos(angle) * SPAWN.radius,
      y: player.y + Math.sin(angle) * SPAWN.radius,
      vx: 0,
      vy: 0,
      hp,
      maxHp: hp,
      radius: def.radius,
      speed: def.speed * bm,
      damage: Math.round(def.damage * 0.85 * bm * hellMul), // -15% global, blood moon, hell mode all stack
      xp: Math.round((def.xp || 1) * (hellMul > 1 ? 1.5 : 1)),
      gold: Math.round((def.gold || 1) * (hellMul > 1 ? 3 : 1)), // hell rewards ×3 gold
      color: ev ? 0xff5050 : def.color, // tint blood-moon spawns red
      ability,
      abilityCd: ability ? rng.next() * 2.5 : 0,
      // expansion fields — behaviour/movement come from the bestiary row so a
      // single wiring path feeds ambient, wave, and any future spawn source.
      movePattern: bd ? bd.movePattern || null : null,
      summonType: bd ? bd.summonType || null : null,
      bloodMoon: ev || undefined,
    });
  }

  // 사신 — the signature panic enemy. Near-unkillable (huge base HP) and almost
  // as fast as the player, it forces a run instead of a fight. Arrives late and
  // in small numbers; capped at REAPER.maxAlive at once. Big gold bounty if the
  // player somehow brings one down.
  function aliveReapers(world) {
    let n = 0;
    const ents = world.entities;
    for (let i = 0; i < ents.length; i++) {
      const e = ents[i];
      if (e.type === 'enemy' && !e.dead && e.enemyType === 'reaper') n++;
    }
    return n;
  }

  function spawnReaper(world, player, minutes, hellMul) {
    const def = ENEMIES.reaper;
    if (!def) return;
    const angle = rng.next() * Math.PI * 2;
    const hp = enemyHp(def.maxHp, minutes, player.level, hellMul);
    world.spawn('enemy', {
      enemyType: 'reaper',
      reaper: true,
      x: player.x + Math.cos(angle) * SPAWN.radius,
      y: player.y + Math.sin(angle) * SPAWN.radius,
      vx: 0,
      vy: 0,
      hp,
      maxHp: hp,
      radius: def.radius,
      speed: def.speed,
      damage: def.damage,
      xp: def.xp,
      gold: def.gold,
      color: def.color,
      ability: null,
    });
  }

  // Minimum on-screen enemy count for the current minute. Last-matching tier
  // wins so the floor steps up cleanly (25 → 70 → 140 → 240 at 0/3/7/11 min).
  function activeMinFor(minutes) {
    const tiers = DIRECTOR.minEnemies || [];
    let m = 0;
    for (const t of tiers) {
      if (minutes >= t.fromMinute) m = t.min;
    }
    return m;
  }

  function update(dt, world, player, time, event) {
    const minutes = time / 60;
    // hell-mode multiplier — fed by main.js via event.hell (run start checks
    // save.hellModeEnabled). Stacks on top of director scaling + blood moon.
    // Curse (VS forge powerup, stamped on player.curse by main.js) stacks
    // multiplicatively: it raises both enemy HP (via enemyHp's hellMul) AND
    // count (via activeMin's hellMul) — tankier + denser swarms, so the player
    // farms more gold/xp for the added risk.
    const hellMul = ((event && event.hell) ? 2 : 1) * (1 + (player.curse || 0));

    // boss milestones: firstMinute, then every intervalMinute after
    const bossDue = BOSS.firstMinute + bossCount * BOSS.intervalMinute;
    if (minutes >= bossDue) spawnBoss(world, player, minutes, hellMul);
    // mini-boss milestones — sandwiched between regular bosses
    const miniDue = MINI.firstMinute + miniBossCount * MINI.intervalMinute;
    if (minutes >= miniDue) spawnMiniBoss(world, player, minutes, hellMul);
    // rush wave — every ~50 s. Tight pack arrives in a formation.
    const waveDue = WAVE.firstMinute + waveCount * WAVE.intervalMinute;
    if (minutes >= waveDue) spawnWave(world, player, minutes, hellMul);

    // 사신 gate — late-game panic spawn. Honour the maxAlive cap so triggers
    // that fire while reapers still roam don't stack past the limit.
    const reaperFirst = (event && event.hell) ? REAPER.hellFirstMinute : REAPER.firstMinute;
    const reaperDue = reaperFirst + reaperTriggers * REAPER.intervalMinute;
    if (minutes >= reaperDue) {
      reaperTriggers += 1;
      if (aliveReapers(world) < REAPER.maxAlive) spawnReaper(world, player, minutes, hellMul);
    }

    // blood moon (event.bloodMoon true) — 3× spawn rate, +30% enemy damage
    // and speed, on top of the director curve. New enemies during the event
    // are the buffed ones; existing enemies keep their stats.
    const ev = event && event.bloodMoon;
    const rate = (DIRECTOR.baseRate + minutes * DIRECTOR.ratePerMinute) * (ev ? 3 : 1);
    // the elite share of spawns rises with run time (cap 45%)
    const eliteChance = Math.min(0.45, minutes * 0.06);

    const common = map && map.enemies ? map.enemies : ['walker'];
    const elites = map && map.elites ? map.elites : ['brute'];

    // min-count buffer — burst-fill if the world dropped below the floor.
    // Runs BEFORE the continuous accumulator so the per-frame cap doesn't
    // double-spend the same tick on both paths.
    const activeMin = Math.round(activeMinFor(minutes) * (ev ? 1.6 : 1) * hellMul);
    const currentCount = world.count('enemy');
    if (currentCount < activeMin) {
      const need = Math.min(BUFFER_BURST_CAP, activeMin - currentCount);
      for (let i = 0; i < need; i++) {
        if (world.count('enemy') >= SPAWN.maxEnemies) break;
        spawnSingle(world, player, minutes, common, elites, eliteChance, hellMul, ev);
      }
    }

    // continuous accumulator — the steady ambient drip on top of the floor
    accumulator += rate * dt;
    while (accumulator >= 1) {
      accumulator -= 1;
      if (world.count('enemy') >= SPAWN.maxEnemies) continue;
      spawnSingle(world, player, minutes, common, elites, eliteChance, hellMul, ev);
    }
  }

  return { update, setMap };
}
