// Headless monster smoke test — the integrated regression coverage the kiting
// balance harness can't give (its kiter AI dies to any real biome roster, and
// it never calls spawn.setMap so biome-pool monsters never spawn there — see
// memory balance-harness-kiter-cant-handle-biomes).
//
// This runs the FULL sim (movement + spawn + enemyAbilities + weaponFire +
// collision + damage + status) with the REAL dungeon pool and an invincible,
// near-passive player, then asserts: the behaviour-pass monsters spawn, their
// mechanics fire (haste aura / enemyFx ability events), the removed `split`
// mechanic stays gone, the entity soft cap holds, and nothing throws across a
// multi-minute run.
import { describe, it, expect, beforeAll } from 'vitest';
import { createWorld } from '../engine/world.js';
import { createRngStreams } from '../util/rng.js';
import { createEvents } from '../engine/events.js';
import { createLoadout } from '../loadout.js';
import { createMovement } from './movement.js';
import { createSpawn } from './spawn.js';
import { createWeaponFire } from './weaponFire.js';
import { createCollision } from './collision.js';
import { createDamage } from './damage.js';
import { createStatus } from './status.js';
import { createEnemyAbilities } from './enemyAbilities.js';
import { FIXED_DT, PLAYER } from '../config.js';
import { MAPS } from '../content/maps.js';

const DUNGEON = MAPS.find((m) => m.id === 'dungeon') || MAPS[0];

// Run the integrated sim on the dungeon pool for `secs` game-seconds with a
// god-mode, stationary player (minimal starter loadout so enemies live long
// enough to act). Returns observations gathered across the run.
function runDungeon(secs, seed = 7) {
  const streams = createRngStreams(seed);
  const origRandom = Math.random;
  Math.random = () => streams.motion.next(); // determinism (memory: balance-harness-nondeterministic)

  const obs = { types: new Set(), shield: false, haste: false, fx: new Set(), peak: 0, threw: null };
  try {
    const world = createWorld();
    const events = createEvents();
    const loadout = createLoadout();
    const player = world.spawn('player', {
      x: 0, y: 0, vx: 0, vy: 0, hp: 1e7, maxHp: 1e7, radius: PLAYER.radius, armor: 0, level: 20,
    });
    const stats = { time: 0, kills: 0, gold: 0, hits: 0, crits: 0 };
    const movement = createMovement(new Set());
    const weaponFire = createWeaponFire();
    const collision = createCollision();
    const damage = createDamage(streams.combat, loadout);
    const status = createStatus();
    const ab = createEnemyAbilities();
    const spawn = createSpawn(streams.spawn);
    spawn.setMap(DUNGEON);
    events.on('enemyFx', ({ kind }) => obs.fx.add(kind));

    const frames = Math.round(secs / FIXED_DT);
    for (let f = 0; f < frames; f++) {
      stats.time += FIXED_DT;
      player.level = 20; // pin a mid-game level so elite HP scaling is realistic
      movement.update(FIXED_DT, world, player, loadout);
      spawn.update(FIXED_DT, world, player, stats.time, { hell: false });
      ab.update(FIXED_DT, world, player, events);
      weaponFire.update(FIXED_DT, world, player, loadout, events);
      collision.update(FIXED_DT, world, player, damage, events, stats);
      status.update(FIXED_DT, world, events, stats, damage);
      player.hp = 1e7; // god-mode: never die, so the run reaches the full window
      world.reap();
      const ents = world.entities;
      let n = 0;
      for (let i = 0; i < ents.length; i++) {
        const e = ents[i];
        if (e.type !== 'enemy' || e.dead) continue;
        n++;
        obs.types.add(e.enemyType);
        if (e.shieldT > 0) obs.shield = true;
        if (e.hasteT > 0) obs.haste = true;
        if (e.ability === 'split' || e.splitDepth !== undefined) obs.threw = 'split leaked';
      }
      if (n > obs.peak) obs.peak = n;
    }
  } catch (err) {
    obs.threw = (err && err.message) ? err.message : String(err);
  } finally {
    Math.random = origRandom;
  }
  return obs;
}

describe('monster behaviour smoke test (integrated dungeon sim)', () => {
  // one 120s sim shared across all assertions (the run is the expensive part)
  let obs;
  beforeAll(() => { obs = runDungeon(120); }, 30000);

  it('runs a multi-minute dungeon sim with the real pool without throwing', () => {
    expect(obs.threw).toBe(null);
  });

  it('spawns the behaviour-pass monsters from the dungeon pool', () => {
    const expected = ['medusa_head', 'powder_skeleton', 'necromancer', 'war_drummer', 'brood_mother'];
    const seen = expected.filter((t) => obs.types.has(t));
    expect(seen.length).toBeGreaterThanOrEqual(3); // eliteChance is probabilistic; ≥3 of 5
  });

  it('fires the new mechanics (haste aura + an enemyFx ability event)', () => {
    expect(obs.haste || obs.fx.size > 0).toBe(true);
  });

  it('keeps the removed split mechanic gone (no ability/splitDepth leak)', () => {
    expect(obs.threw).not.toBe('split leaked');
  });

  it('holds the entity soft cap (no runaway summoner flood)', () => {
    expect(obs.peak).toBeLessThan(550);
  });
});
