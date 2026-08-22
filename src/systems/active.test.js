import { describe, it, expect } from 'vitest';
import { createActive, scaleSignature } from './active.js';
import { createWorld } from '../engine/world.js';

// Test doubles — minimal surfaces of the real systems active.update() reads.
function fakeInput(spaceDown = false) {
  return {
    has: () => false,
    justPressedSpace: spaceDown,
    consumeFrame() { this.justPressedSpace = false; },
  };
}

function fakeDamage() {
  const calls = [];
  return {
    apply(world, events, stats, target, amount) {
      calls.push({ id: target.id, amount });
      target.hp -= amount;
      if (target.hp <= 0) target.dead = true;
    },
    calls,
  };
}

function fakeEvents() {
  return { on() {}, emit() {} };
}

function magePlayer(world) {
  return { x: 0, y: 0, dead: false, hp: 100, maxHp: 100 };
}

function mageLoadout() {
  return { hero: { id: 'mage' } };
}

describe('createActive — state machine', () => {
  it('does not cast when the hero has no signature', () => {
    const active = createActive();
    const world = createWorld();
    const damage = fakeDamage();
    const events = fakeEvents();
    const player = { x: 0, y: 0, dead: false };
    const loadout = { hero: { id: 'unknown_hero' } }; // parked, no signature
    const input = fakeInput(true);
    active.update(0.016, world, player, loadout, input, events, {}, damage, null, null);
    expect(active.getRenderState().castPhase).toBe('idle');
    expect(damage.calls.length).toBe(0);
  });

  it('spacebar starts the telegraph window for the mage', () => {
    const active = createActive();
    const world = createWorld();
    world.spawn('enemy', { enemyType: 'walker', x: 100, y: 0, hp: 100, maxHp: 100, radius: 8 });
    world.reap();
    const damage = fakeDamage();
    const events = fakeEvents();
    const input = fakeInput(true);
    active.update(0.016, world, magePlayer(world), mageLoadout(), input, events, {}, damage, null, null);
    const s = active.getRenderState();
    expect(s.castPhase).toBe('telegraph');
    expect(s.castTargets.length).toBe(5); // 5 meteors per cast
    expect(s.telegraphTime).toBeCloseTo(0.8, 1);
  });

  it('respects cooldown — second press during CD is ignored', () => {
    const active = createActive();
    const world = createWorld();
    world.spawn('enemy', { enemyType: 'walker', x: 100, y: 0, hp: 100, maxHp: 100, radius: 8 });
    world.reap();
    const damage = fakeDamage();
    const events = fakeEvents();
    const player = magePlayer(world);
    const loadout = mageLoadout();
    // first press triggers telegraph
    active.update(0.016, world, player, loadout, { ...fakeInput(true) }, events, {}, damage, null, null);
    expect(active.getRenderState().castPhase).toBe('telegraph');
    // tick through telegraph + fall + impact to land in cooldown
    for (let i = 0; i < 200; i++) {
      active.update(0.016, world, player, loadout, fakeInput(false), events, {}, damage, null, null);
    }
    const s = active.getRenderState();
    expect(s.castPhase).toBe('idle');
    expect(s.cooldown).toBeGreaterThan(0);
    // second press while cooldown is still active does nothing
    active.update(0.016, world, player, loadout, fakeInput(true), events, {}, damage, null, null);
    expect(active.getRenderState().castPhase).toBe('idle');
  });

  it('telegraph resolves into falling meteors after telegraphTime', () => {
    const active = createActive();
    const world = createWorld();
    world.spawn('enemy', { enemyType: 'walker', x: 100, y: 0, hp: 100, maxHp: 100, radius: 8 });
    world.reap();
    const damage = fakeDamage();
    const events = fakeEvents();
    const player = magePlayer(world);
    const loadout = mageLoadout();
    // queue cast
    active.update(0.016, world, player, loadout, fakeInput(true), events, {}, damage, null, null);
    // run 0.9s — telegraph (0.8s) completes
    for (let i = 0; i < 60; i++) {
      active.update(0.015, world, player, loadout, fakeInput(false), events, {}, damage, null, null);
    }
    const s = active.getRenderState();
    expect(s.castPhase).toBe('falling');
    expect(s.drops.length).toBeGreaterThan(0);
  });

  it('meteors deal AoE damage to enemies within radius on landing', () => {
    const active = createActive();
    const world = createWorld();
    // 3 enemies near the player so they all sit inside at least one meteor radius
    for (let i = 0; i < 3; i++) {
      world.spawn('enemy', { enemyType: 'walker', x: 30 + i * 10, y: 0, hp: 200, maxHp: 200, radius: 8 });
    }
    world.reap();
    const damage = fakeDamage();
    const events = fakeEvents();
    const player = magePlayer(world);
    const loadout = mageLoadout();
    // press space
    active.update(0.016, world, player, loadout, fakeInput(true), events, {}, damage, null, null);
    // simulate ~2 seconds of game time — covers telegraph + full fall + impact + cleanup
    for (let i = 0; i < 140; i++) {
      active.update(0.015, world, player, loadout, fakeInput(false), events, {}, damage, null, null);
    }
    // After the cast, damage.apply should have fired at least once per enemy
    expect(damage.calls.length).toBeGreaterThan(0);
  });

  it('falls back to a player ring when no enemies are alive', () => {
    const active = createActive();
    const world = createWorld(); // no enemies
    const damage = fakeDamage();
    const events = fakeEvents();
    const player = magePlayer(world);
    const loadout = mageLoadout();
    active.update(0.016, world, player, loadout, fakeInput(true), events, {}, damage, null, null);
    const s = active.getRenderState();
    expect(s.castTargets.length).toBe(5);
    // every fallback target should be at the fallback ring distance (100±0.001)
    for (const t of s.castTargets) {
      const d = Math.hypot(t.x - player.x, t.y - player.y);
      expect(d).toBeCloseTo(100, 1);
    }
  });

  it('cancels the cast cleanly when the player dies mid-telegraph', () => {
    const active = createActive();
    const world = createWorld();
    world.spawn('enemy', { enemyType: 'walker', x: 100, y: 0, hp: 100, maxHp: 100, radius: 8 });
    world.reap();
    const damage = fakeDamage();
    const events = fakeEvents();
    const player = magePlayer(world);
    const loadout = mageLoadout();
    active.update(0.016, world, player, loadout, fakeInput(true), events, {}, damage, null, null);
    expect(active.getRenderState().castPhase).toBe('telegraph');
    // player dies mid-telegraph
    player.dead = true;
    active.update(0.016, world, player, loadout, fakeInput(false), events, {}, damage, null, null);
    const s = active.getRenderState();
    expect(s.castPhase).toBe('idle');
    expect(s.castTargets.length).toBe(0);
    expect(damage.calls.length).toBe(0); // no AoE applied — clean cancel
  });

  it('reset() clears all state for a new run', () => {
    const active = createActive();
    const world = createWorld();
    world.spawn('enemy', { enemyType: 'walker', x: 100, y: 0, hp: 100, maxHp: 100, radius: 8 });
    world.reap();
    const damage = fakeDamage();
    const events = fakeEvents();
    active.update(0.016, world, magePlayer(world), mageLoadout(), fakeInput(true), events, {}, damage, null, null);
    expect(active.getRenderState().castPhase).toBe('telegraph');
    active.reset();
    const s = active.getRenderState();
    expect(s.castPhase).toBe('idle');
    expect(s.cooldown).toBe(0);
    expect(s.castTargets.length).toBe(0);
    expect(s.drops.length).toBe(0);
  });

  it('getHudInfo returns null for heroes without a signature', () => {
    const active = createActive();
    const damage = fakeDamage();
    const events = fakeEvents();
    active.update(0.016, createWorld(), { x: 0, y: 0 }, { hero: { id: 'unknown_hero' } },
      fakeInput(false), events, {}, damage, null, null);
    expect(active.getHudInfo()).toBeNull();
  });

  it('warrior earth_crack targets center on player (centerOnPlayer flag)', () => {
    const active = createActive();
    const world = createWorld();
    // place enemies far from player — they MUST be ignored by self-centered targeting
    for (let i = 0; i < 5; i++) {
      world.spawn('enemy', { enemyType: 'walker', x: 500 + i * 30, y: 0, hp: 100, maxHp: 100, radius: 8 });
    }
    world.reap();
    const damage = fakeDamage();
    const events = fakeEvents();
    const player = { x: 17, y: 42, dead: false, hp: 100, maxHp: 100 };
    active.update(0.016, world, player, { hero: { id: 'warrior' } },
      fakeInput(true), events, {}, damage, null, null);
    const s = active.getRenderState();
    expect(s.castPhase).toBe('telegraph');
    expect(s.castTargets.length).toBe(1); // earth_crack uses count=1
    expect(s.castTargets[0].x).toBe(17);
    expect(s.castTargets[0].y).toBe(42);
  });

  it('knight holy_beam resolves with 3 targets in enemy cluster', () => {
    const active = createActive();
    const world = createWorld();
    for (let i = 0; i < 5; i++) {
      world.spawn('enemy', { enemyType: 'walker', x: 60 + i * 12, y: 0, hp: 100, maxHp: 100, radius: 8 });
    }
    world.reap();
    const damage = fakeDamage();
    const events = fakeEvents();
    active.update(0.016, world, magePlayer(), { hero: { id: 'knight' } },
      fakeInput(true), events, {}, damage, null, null);
    const s = active.getRenderState();
    expect(s.castTargets.length).toBe(3); // holy_beam count=3
    expect(s.sig.id).toBe('holy_beam');
  });

  it('huntress arrow_rain queues 12 arrows', () => {
    const active = createActive();
    const world = createWorld();
    for (let i = 0; i < 20; i++) {
      world.spawn('enemy', { enemyType: 'walker', x: 60 + i * 10, y: i * 5, hp: 50, maxHp: 50, radius: 8 });
    }
    world.reap();
    const damage = fakeDamage();
    const events = fakeEvents();
    active.update(0.016, world, magePlayer(), { hero: { id: 'huntress' } },
      fakeInput(true), events, {}, damage, null, null);
    const s = active.getRenderState();
    expect(s.castTargets.length).toBe(12); // arrow_rain count=12
    expect(s.sig.id).toBe('arrow_rain');
  });

  it('getHudInfo reports cooldown + ready state for mage', () => {
    const active = createActive();
    const damage = fakeDamage();
    const events = fakeEvents();
    active.update(0.016, createWorld(), magePlayer(), mageLoadout(),
      fakeInput(false), events, {}, damage, null, null);
    const info = active.getHudInfo();
    expect(info).not.toBeNull();
    expect(info.sigId).toBe('meteor_storm');
    expect(info.ready).toBe(true); // fresh run, cooldown 0
  });

  describe('scaleSignature — level scaling', () => {
    const base = { count: 5, damage: 60, radius: 100, cooldown: 20 };

    it('Lv1 is identity (no scaling on the first level)', () => {
      const s = scaleSignature(base, 1);
      expect(s.count).toBe(5);
      expect(s.damage).toBeCloseTo(60, 5);
      expect(s.radius).toBeCloseTo(100, 5);
      expect(s.cooldown).toBeCloseTo(20, 5);
    });

    it('higher level grows count/damage/radius and shrinks cooldown', () => {
      const s = scaleSignature(base, 17); // L=16
      expect(s.count).toBe(5 + Math.floor(16 / 8)); // +2 → 7
      expect(s.damage).toBeGreaterThan(60);
      expect(s.radius).toBeGreaterThan(100);
      expect(s.cooldown).toBeLessThan(20);
    });

    it('single-cast signatures (count 1) never gain extra projectiles', () => {
      // warrior earth_crack is count:1 + huge radius — one big quake. Adding
      // targets would stack overlapping AoEs into a multi-hit, not intended.
      const quake = { count: 1, damage: 180, radius: 208, cooldown: 24 };
      const s = scaleSignature(quake, 50);
      expect(s.count).toBe(1); // still one
      expect(s.radius).toBeGreaterThan(208); // but bigger + harder + faster
      expect(s.damage).toBeGreaterThan(180);
      expect(s.cooldown).toBeLessThan(24);
    });

    it('respects caps at very high level', () => {
      const s = scaleSignature(base, 200); // way past caps
      expect(s.count).toBe(5 + 5); // SIG_COUNT_MAX
      expect(s.radius).toBeCloseTo(100 * 1.85, 5); // SIG_RANGE_MAX +85%
      expect(s.damage).toBeCloseTo(60 * 2.5, 5); // SIG_DMG_MAX +150%
      expect(s.cooldown).toBeCloseTo(20 * 0.6, 5); // SIG_CD_MAX -40%
    });

    it('defends against missing/zero level', () => {
      expect(scaleSignature(base, 0).count).toBe(5);
      expect(scaleSignature(base, undefined).radius).toBeCloseTo(100, 5);
    });
  });

  it('plays the cast SFX on spacebar (meteor_charge fallback when sig has no castSfx)', () => {
    // Regression guard for the data-driven SFX wiring: active.js plays
    // `sig.castSfx || 'meteor_charge'`. The mage signature declares no
    // castSfx, so the fallback must fire. A hero that sets castSfx would
    // override it — that path is data-only in content/signatures.js.
    const active = createActive();
    const world = createWorld();
    world.spawn('enemy', { enemyType: 'walker', x: 100, y: 0, hp: 100, maxHp: 100, radius: 8 });
    const played = [];
    const audio = { play: (n) => played.push(n) };
    active.update(0.016, world, magePlayer(), mageLoadout(),
      fakeInput(true), fakeEvents(), {}, fakeDamage(), audio, null);
    expect(played).toContain('meteor_charge');
  });

  it('a hero with castSfx plays its own sound, not the meteor fallback', () => {
    // knight's holy_beam declares castSfx 'knight_cast' (content/signatures.js).
    // Per-hero signature SFX so ultimates no longer all sound identical.
    const active = createActive();
    const world = createWorld();
    world.spawn('enemy', { enemyType: 'walker', x: 100, y: 0, hp: 100, maxHp: 100, radius: 8 });
    const played = [];
    const audio = { play: (n) => played.push(n) };
    active.update(0.016, world, { x: 0, y: 0, dead: false, hp: 100, maxHp: 100 },
      { hero: { id: 'knight' } }, fakeInput(true), fakeEvents(), {}, fakeDamage(), audio, null);
    expect(played).toContain('knight_cast');
    expect(played).not.toContain('meteor_charge');
  });
});
