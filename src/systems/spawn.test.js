import { describe, it, expect } from 'vitest';
import { createSpawn } from './spawn.js';
import { createWorld } from '../engine/world.js';
import { createRng } from '../util/rng.js';
import { DIRECTOR, SPAWN } from '../config.js';

// Step `seconds` of simulated time in 1/60 ticks at a fixed elapsed `time`.
// `event` lets a test feed hellMode / bloodMoon flags into spawn.update().
function run(spawn, world, player, time, seconds, event = null) {
  for (let i = 0; i < 60 * seconds; i++) {
    spawn.update(1 / 60, world, player, time, event);
  }
}

// Single-frame tick. Useful for verifying per-frame caps (burst-fill).
function tick(spawn, world, player, time, event = null) {
  spawn.update(1 / 60, world, player, time, event);
}

function walkerHp(world) {
  const w = world.entities.find((e) => e.enemyType === 'walker');
  return w ? w.maxHp : null;
}

function newPlayer(world, level = 1) {
  return world.spawn('player', { x: 0, y: 0, level });
}

describe('spawn director', () => {
  it('spawns at roughly the base rate at t=0 (no floor before first tier)', () => {
    // First minEnemies tier kicks in at 0.75 min — t=0 should ramp via the
    // continuous accumulator only (~baseRate per second). Verifies the floor
    // isn't dog-piling the opening seconds.
    const world = createWorld();
    const player = newPlayer(world);
    run(createSpawn(createRng(1)), world, player, 0, 5);
    const expected = 5 * DIRECTOR.baseRate; // ~baseRate enemies per second
    expect(world.count('enemy')).toBeGreaterThanOrEqual(expected - 2);
    expect(world.count('enemy')).toBeLessThanOrEqual(expected + 3);
  });

  it('spawns faster later in the run', () => {
    const early = createWorld();
    run(createSpawn(createRng(2)), early, newPlayer(early), 0, 2);

    const late = createWorld();
    run(createSpawn(createRng(2)), late, newPlayer(late), 300, 2);

    expect(late.count('enemy')).toBeGreaterThan(early.count('enemy'));
  });

  it('scales enemy hp up over time at fixed player level', () => {
    // Level pinned to 1 so levelScale = 1 (floor), isolating timeScale.
    const early = createWorld();
    run(createSpawn(createRng(3)), early, newPlayer(early, 1), 0, 3);

    const late = createWorld();
    run(createSpawn(createRng(3)), late, newPlayer(late, 1), 360, 3);

    expect(walkerHp(late)).toBeGreaterThan(walkerHp(early));
  });

  it('scales enemy hp up with player level at fixed time', () => {
    // Time pinned, level varies — isolates levelScale (the new VS-coupled dial).
    // Levels chosen so floor=1 in low and ~1.5× in high (Lv 50 × 0.030 = 1.50).
    const low = createWorld();
    run(createSpawn(createRng(7)), low, newPlayer(low, 1), 60, 2);

    const high = createWorld();
    run(createSpawn(createRng(7)), high, newPlayer(high, 50), 60, 2);

    const lowHp = walkerHp(low);
    const highHp = walkerHp(high);
    expect(highHp).toBeGreaterThan(lowHp);
    // Sanity: 50 × 0.030 = 1.50, so high should be ~1.50× low (allow ±10% for rounding).
    expect(highHp / lowHp).toBeGreaterThan(1.35);
    expect(highHp / lowHp).toBeLessThan(1.65);
  });

  it('respects the maxEnemies safety cap', () => {
    // Cap was bumped 400→500 (SPAWN.maxEnemies). Test against the live const
    // so the test doesn't drift when the cap moves.
    const world = createWorld();
    const player = newPlayer(world);
    run(createSpawn(createRng(4)), world, player, 600, 120);
    expect(world.count('enemy')).toBeLessThanOrEqual(SPAWN.maxEnemies);
  });

  it('minEnemies floor steps up at each tier minute', () => {
    // Sample the floor at the boundary minute of each tier. Tiers are
    // [{0,25},{3,70},{7,140},{11,240}]. Earliest tier wins via last-matching
    // logic, so at minute 11 floor = 240.
    const tiers = DIRECTOR.minEnemies;
    for (const t of tiers) {
      const world = createWorld();
      const player = newPlayer(world);
      // 6s of ticks at the tier's fromMinute — plenty for burst-fill (8/frame
      // × 360 frames = 2880 spawn budget) to reach any tier floor up to 240.
      run(createSpawn(createRng(11 + t.fromMinute)), world, player, t.fromMinute * 60, 6);
      expect(world.count('enemy')).toBeGreaterThanOrEqual(t.min);
    }
  });

  it('burst-fill is capped at 8 per frame', () => {
    // Single tick at t=0 (floor 25, wave/boss/mini-boss timers all > 0) so
    // ONLY the buffer fires. Without the cap, the buffer would dump all 25
    // in one frame and hitch the spatial hash. With the cap, 8 per frame.
    const world = createWorld();
    const player = newPlayer(world);
    const spawn = createSpawn(createRng(12));
    tick(spawn, world, player, 0);
    expect(world.count('enemy')).toBeLessThanOrEqual(8);
  });

  it('min-count buffer respects maxEnemies cap', () => {
    // Even at the highest tier × hell-mode (×2) the buffer never exceeds the
    // cap. activeMin = 240 × 2 = 480 — close to cap 500 but under. Run long
    // enough for the floor to settle, then assert.
    const world = createWorld();
    const player = newPlayer(world);
    run(createSpawn(createRng(13)), world, player, 11 * 60, 30, { hell: true });
    expect(world.count('enemy')).toBeLessThanOrEqual(SPAWN.maxEnemies);
  });

  it('hell-mode multiplies ambient + wave + mini-boss HP', () => {
    // D1 review decision: hellMul applies to all three. Sample walker HP from
    // each tree, hell on vs off.
    const off = createWorld();
    run(createSpawn(createRng(14)), off, newPlayer(off, 1), 60, 3, { hell: false });

    const on = createWorld();
    run(createSpawn(createRng(14)), on, newPlayer(on, 1), 60, 3, { hell: true });

    const offHp = walkerHp(off);
    const onHp = walkerHp(on);
    expect(onHp).toBeGreaterThan(offHp);
    // hellMul = 2 → roughly double (±10% rounding noise across ambient + waves)
    expect(onHp / offHp).toBeGreaterThan(1.8);
    expect(onHp / offHp).toBeLessThan(2.2);
  });

  it('spawns 사신(reaper) only after the 9:00 gate, capped at maxAlive', () => {
    // Before the gate: no reaper. After: at least one, never exceeding the cap.
    const early = createWorld();
    run(createSpawn(createRng(20)), early, newPlayer(early), 5 * 60, 3);
    expect(early.entities.some((e) => e.enemyType === 'reaper')).toBe(false);

    const late = createWorld();
    // run well past 9:00 long enough for several triggers to fire
    run(createSpawn(createRng(20)), late, newPlayer(late), 12 * 60, 30);
    const reapers = late.entities.filter((e) => e.enemyType === 'reaper' && !e.dead);
    expect(reapers.length).toBeGreaterThanOrEqual(1);
    expect(reapers.length).toBeLessThanOrEqual(3); // REAPER.maxAlive
  });

  it('hell mode pulls the reaper gate earlier (7:00)', () => {
    const world = createWorld();
    // at 7:30 with hell on, the reaper should already have triggered
    run(createSpawn(createRng(21)), world, newPlayer(world), 7.5 * 60, 3, { hell: true });
    expect(world.entities.some((e) => e.enemyType === 'reaper')).toBe(true);
  });

  it('a mini-boss inherits its elite bestiary ability (summoner/shielded/buffer)', () => {
    // map whose only elite is a summoner → the mini-boss must inherit 'summoner'
    // + its summonType, not fall back to the charge/ranged family heuristic.
    const world = createWorld();
    const spawn = createSpawn(createRng(30));
    spawn.setMap({ enemies: ['walker'], elites: ['necromancer'], boss: { sprite: 'boss_skeleton_king', name: 'x' } });
    run(spawn, world, newPlayer(world), 60, 5); // past MINI.firstMinute (1:00)
    const mb = world.entities.find((e) => e.miniBoss && e.enemyType === 'necromancer');
    expect(mb).toBeTruthy();
    expect(mb.ability).toBe('summoner');
    expect(mb.summonType).toBe('walker'); // necromancer summons walkers
  });

  it('a kamikaze elite mini-boss does NOT inherit kamikaze (would skip its chest)', () => {
    // powder_skeleton is kamikaze (basic), but if it were an elite the mini-boss
    // must fall back to a non-suicidal kit. Force it as the only elite.
    const world = createWorld();
    const spawn = createSpawn(createRng(31));
    spawn.setMap({ enemies: ['walker'], elites: ['powder_skeleton'], boss: { sprite: 'boss_skeleton_king', name: 'x' } });
    run(spawn, world, newPlayer(world), 60, 5);
    const mb = world.entities.find((e) => e.miniBoss && e.enemyType === 'powder_skeleton');
    expect(mb).toBeTruthy();
    expect(mb.ability).not.toBe('kamikaze'); // charge or ranged from the heuristic
  });
});
