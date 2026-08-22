// Headless balance harness.
//
// Runs the full game simulation in Node — no renderer, no browser — driven by
// a simple kiting AI, and prints the difficulty curve. This is possible only
// because the simulation never imports PixiJS (premise #3): the whole game is
// just data + pure functions.
//
//   node scripts/balance.js

import { createWorld } from '../src/engine/world.js';
import { createRngStreams } from '../src/util/rng.js';
import { createEvents } from '../src/engine/events.js';
import { createProgression } from '../src/progression.js';
import { createLoadout } from '../src/loadout.js';
import { rollChoices, applyChoice } from '../src/choices.js';
import { createMovement } from '../src/systems/movement.js';
import { createSpawn } from '../src/systems/spawn.js';
import { createWeaponFire } from '../src/systems/weaponFire.js';
import { createCollision } from '../src/systems/collision.js';
import { createDamage } from '../src/systems/damage.js';
import { createPickup } from '../src/systems/pickup.js';
import { createStatus } from '../src/systems/status.js';
import { createEnemyAbilities } from '../src/systems/enemyAbilities.js';
import { createSpirits } from '../src/systems/spirits.js';
import { createActive } from '../src/systems/active.js';
import { FIXED_DT, PLAYER, DIRECTOR, SURVIVAL_GOLD_PER_SEC } from '../src/config.js';

// NOTE (2026-05-29): wiring a real biome map here (spawn.setMap) was tried so
// the harness would roll the actual biome pool incl. the new behaviour-pass
// monsters. It collapses survival to 0/24 — but that's a harness-AI artifact,
// not a balance signal: the naive kiter (a conservative floor, no prop pathing,
// never tuned against charge/ranged/swarm mixes) can't survive any real biome
// roster. Validating the new biome monsters needs a stronger harness AI +
// recalibration (separate effort) or in-game QA. The harness stays on the
// null-map walker/brute floor it was calibrated against. The new monsters
// reach the harness only via the reaper gate + formation waves (walker shape).

// Circle-strafing kiter: flee the nearest enemy but at an angle, so the
// player orbits the swarm and stays near its own gem drops rather than
// fleeing in a straight line. Still far from optimal — a conservative floor.
function steer(world, player, input) {
  input.clear();
  let nx = 0;
  let ny = 0;
  let best = Infinity;
  for (const e of world.entities) {
    if (e.type !== 'enemy') continue;
    const dx = e.x - player.x;
    const dy = e.y - player.y;
    const d = dx * dx + dy * dy;
    if (d < best) {
      best = d;
      nx = dx;
      ny = dy;
    }
  }
  if (best === Infinity) return;
  const a = Math.atan2(-ny, -nx) + 0.95; // flee direction, rotated ~55deg
  const mx = Math.cos(a);
  const my = Math.sin(a);
  if (mx > 0.35) input.add('right');
  else if (mx < -0.35) input.add('left');
  if (my > 0.35) input.add('down');
  else if (my < -0.35) input.add('up');
}

// Sensible upgrade taste: evolve, then diversify weapons, then offensive
// passives (projectiles > damage > fire rate), then level a weapon.
//
// Slot 4→5 expansion (2026-05-22): real players don't fill all 5 slots
// before levelling — they typically pick the 4 they like and then up.
// Mirror that by scoring weapon-new 65 (above weapon-up but below
// offensive passives). With weapon-new=80 the harness was filling 5
// slots before passive picks, leaving builds shallow and underpowered.
function autoPick(choices) {
  const score = (c) => {
    if (c.kind === 'evolve') return 100;
    if (c.kind === 'weapon-new') return 65;
    if (c.kind === 'passive-new' || c.kind === 'passive-up') {
      if (c.id === 'multi') return 72;
      if (c.id === 'might') return 62;
      if (c.id === 'haste') return 56;
      return 42;
    }
    if (c.kind === 'weapon-up') return 50;
    return 10;
  };
  return choices.slice().sort((a, b) => score(b) - score(a))[0];
}

function runOnce(seed) {
  const world = createWorld();
  // Per-category RNG streams (butterfly fix): spawn / combat / motion each pull
  // from their own seeded stream, so changing one difficulty dial no longer
  // reshuffles unrelated randomness — a single-dial A/B compares at a near-fixed
  // scenario. See createRngStreams in src/util/rng.js.
  const streams = createRngStreams(seed);
  // Determinism guard: the sim calls global Math.random() in hot paths
  // (weaponFire fan/scatter/bezier, movement bounce, active scatter) that never
  // received a seeded rng. Route Math.random through the MOTION stream for this
  // run, then restore — those FX draws become reproducible AND independent of
  // the spawn/combat streams. Live-game behavior is untouched (only this script
  // patches the global).
  const _origRandom = Math.random;
  Math.random = () => streams.motion.next();
  const events = createEvents();
  const progression = createProgression();
  const loadout = createLoadout();
  const player = world.spawn('player', {
    x: 0, y: 0, vx: 0, vy: 0,
    hp: PLAYER.maxHp, maxHp: PLAYER.maxHp,
    radius: PLAYER.radius, color: PLAYER.color, armor: 0, revives: 0,
  });
  const stats = { time: 0, kills: 0, gold: 0 };
  const input = new Set();
  const movement = createMovement(input);
  const spawn = createSpawn(streams.spawn);
  const weaponFire = createWeaponFire();
  const collision = createCollision();
  const damage = createDamage(streams.combat, loadout);
  const pickup = createPickup();
  const status = createStatus();
  const enemyAbilities = createEnemyAbilities();
  const spirits = createSpirits();
  const active = createActive();
  // input set is reused for kiter steering; no spacebar from the AI so the
  // ultimate is dormant unless we expose .pick() in autoPick later
  const runEvent = { hell: false, bloodMoon: false };

  const samples = [];
  let nextSample = 30;
  let died = false;
  const maxTime = 600; // stop at 10 game-minutes

  while (stats.time < maxTime) {
    steer(world, player, input);
    stats.time += FIXED_DT;
    movement.update(FIXED_DT, world, player, loadout);
    player.level = progression.level; // expose to spawn.js levelScale (mirrors main.js)
    spawn.update(FIXED_DT, world, player, stats.time, runEvent);
    enemyAbilities.update(FIXED_DT, world, player, events);
    weaponFire.update(FIXED_DT, world, player, loadout, events);
    active.update(FIXED_DT, world, player, loadout, input, events, stats, damage);
    spirits.update(FIXED_DT, world, player, loadout);
    collision.update(FIXED_DT, world, player, damage, events, stats);
    status.update(FIXED_DT, world, events, stats, damage);
    pickup.update(FIXED_DT, world, player, loadout, progression);
    world.reap();

    while (progression.pendingLevels > 0) {
      applyChoice(autoPick(rollChoices(streams.combat, 3, loadout)), loadout, player);
      progression.consumeLevel();
    }

    if (player.hp <= 0) {
      died = true;
      break;
    }
    if (stats.time >= nextSample) {
      samples.push({
        t: Math.round(stats.time),
        lvl: progression.level,
        kills: stats.kills,
        enemies: world.count('enemy'),
        hp: Math.round(player.hp),
        weapons: Object.keys(loadout.weapons).join('+'),
      });
      nextSample += 30;
    }
  }
  // peak levelScale — verifies player.level stamp is reaching spawn.js. If this
  // stays at 1.00 the stamp regressed and enemy HP scaling is silently broken.
  // Reads DIRECTOR.hpPerLevel directly so it can never drift from the real
  // dial (it was hardcoded 0.045 while the dial had moved to 0.030 — the
  // printed peak overstated enemy scaling).
  const peakLevelScale = Math.max(1, progression.level * DIRECTOR.hpPerLevel);
  Math.random = _origRandom; // restore — see determinism guard at top
  // mirror main.js run-end gold: raw kill-gold + survival bonus (goldMult is
  // 1 in the harness — no meta upgrades — so it's omitted).
  const gold = stats.gold + Math.floor(stats.time * SURVIVAL_GOLD_PER_SEC);
  return { seed, died, time: stats.time, level: progression.level, kills: stats.kills, gold, samples, peakLevelScale };
}

// Seed count is configurable: `node scripts/balance.js 20` runs 20 seeds.
// 5 seeds is too few to tell a real balance change from build-roll variance.
// RNG is now split into per-category streams (spawn / combat / motion — see
// createRngStreams in runOnce), so a dial that only touches one category no
// longer reshuffles the others: single-dial A/B is far less noisy than the old
// single-shared-stream harness. Cross-category dials (or anything that changes
// how many draws a stream makes) can still drift, so use a larger N (20-50)
// before trusting a survival-rate delta. The detailed per-30s sample dump only
// prints for small N to avoid flooding the console.
const N = Math.max(1, parseInt(process.argv[2], 10) || 5);
console.log(`=== balance harness — kiting AI, ${N} seeds, up to 10 min ===\n`);
const results = [];
for (let seed = 1; seed <= N; seed++) {
  const r = runOnce(seed);
  results.push(r);
  console.log(
    `seed ${seed}: ${r.died ? 'DIED' : 'survived 10min'} @ ${r.time.toFixed(0)}s` +
      `  ·  Lv ${r.level}  ·  ${r.kills} kills  ·  ${r.gold} gold  ·  peak levelScale ${r.peakLevelScale.toFixed(2)}`,
  );
  if (N <= 5) {
    for (const s of r.samples) {
      console.log(
        `   ${String(s.t).padStart(3)}s  Lv${String(s.lvl).padStart(2)}  ` +
          `${String(s.kills).padStart(4)}k  ${String(s.enemies).padStart(3)} enemies  ` +
          `${String(s.hp).padStart(3)}hp  [${s.weapons}]`,
      );
    }
    console.log('');
  }
}

// Distribution summary — the signal that actually matters at scale.
const survived = results.filter((r) => !r.died).length;
const early = results.filter((r) => r.died && r.time < 240).length; // dead before 4:00
const times = results.map((r) => r.time).sort((a, b) => a - b);
const median = times[Math.floor(times.length / 2)];
const golds = results.map((r) => r.gold).sort((a, b) => a - b);
const medianGold = golds[Math.floor(golds.length / 2)];
const avgGold = Math.round(golds.reduce((a, b) => a + b, 0) / golds.length);
console.log('--- distribution ---');
console.log(`survived 10:00 : ${survived}/${N}  (${((survived / N) * 100).toFixed(0)}%)`);
console.log(`died < 4:00     : ${early}/${N}  (early-death builds — the bipolar tail)`);
console.log(`median survival : ${median.toFixed(0)}s`);
// Gold here = kill-gold + survival bonus (no pickups/chests/boss/goldMult).
// In-game a run yields meaningfully more; treat this as a lower bound.
console.log(`gold/run (kill+survival, no goldMult): median ${medianGold} · avg ${avgGold} · range ${golds[0]}-${golds[golds.length - 1]}`);
console.log(`healthy band    : ~20-60% survival, few early deaths (project baseline 1-3/5)`);
