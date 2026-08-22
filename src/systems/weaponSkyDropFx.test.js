import { describe, it, expect } from 'vitest';
import { createWeaponSkyDropFx } from './weaponSkyDropFx.js';
import { createWeaponFire } from './weaponFire.js';
import { createWorld } from '../engine/world.js';
import { createEvents } from '../engine/events.js';

describe('createWeaponSkyDropFx', () => {
  it('spawn adds a tracked instance with the kit + position', () => {
    const fx = createWeaponSkyDropFx();
    fx.spawn({
      x: 10,
      y: 20,
      kit: { telegraphTime: 0.5, fallTime: 0.5 },
      weaponId: 'divine_hammer',
    });
    const insts = fx.getRenderInstances();
    expect(insts.length).toBe(1);
    expect(insts[0].x).toBe(10);
    expect(insts[0].y).toBe(20);
    expect(insts[0].weaponId).toBe('divine_hammer');
    expect(insts[0].state.castPhase).toBe('telegraph');
  });

  it('spawn without kit is a no-op', () => {
    const fx = createWeaponSkyDropFx();
    fx.spawn({ x: 0, y: 0, kit: null, weaponId: 'foo' });
    expect(fx.getRenderInstances().length).toBe(0);
  });

  it('update progresses instances through phases and removes resolved ones', () => {
    const fx = createWeaponSkyDropFx();
    fx.spawn({
      x: 0,
      y: 0,
      kit: { telegraphTime: 0.1, fallTime: 0.1, impactFxLife: 0.1 },
      weaponId: 'divine_hammer',
    });
    expect(fx.getRenderInstances()[0].state.castPhase).toBe('telegraph');
    // 0.15s — telegraph completes, falling starts
    fx.update(0.15);
    expect(fx.getRenderInstances()[0].state.castPhase).toBe('falling');
    // step 0.5s — covers fall + impact fade
    for (let i = 0; i < 30; i++) fx.update(0.02);
    expect(fx.getRenderInstances().length).toBe(0);
  });

  it('reset clears all in-flight instances', () => {
    const fx = createWeaponSkyDropFx();
    fx.spawn({ x: 0, y: 0, kit: { telegraphTime: 1 }, weaponId: 'a' });
    fx.spawn({ x: 50, y: 0, kit: { telegraphTime: 1 }, weaponId: 'b' });
    expect(fx.getRenderInstances().length).toBe(2);
    fx.reset();
    expect(fx.getRenderInstances().length).toBe(0);
  });

  it('multiple concurrent instances tick independently', () => {
    const fx = createWeaponSkyDropFx();
    fx.spawn({ x: 0, y: 0, kit: { telegraphTime: 0.1, fallTime: 0.1 }, weaponId: 'a' });
    // advance the first one mid-telegraph
    fx.update(0.05);
    // spawn a second one — should be fresh
    fx.spawn({ x: 100, y: 0, kit: { telegraphTime: 0.1, fallTime: 0.1 }, weaponId: 'b' });
    const insts = fx.getRenderInstances();
    expect(insts.length).toBe(2);
    expect(insts[0].state.telegraphTime).toBeCloseTo(0.05, 2); // first half-elapsed
    expect(insts[1].state.telegraphTime).toBeCloseTo(0.1, 2);  // second fresh
  });
});

describe('weaponFire → aoeCast event integration', () => {
  it('AoE weapon with aoeKit emits aoeCast on fire', () => {
    const events = createEvents();
    const casts = [];
    events.on('aoeCast', (p) => casts.push(p));

    const world = createWorld();
    world.spawn('enemy', { enemyType: 'walker', x: 100, y: 0, hp: 100, maxHp: 100, radius: 8 });
    world.reap();

    const fire = createWeaponFire();
    const loadout = {
      weapons: { divine_hammer: 1 },
      cooldownMult: 1,
      projSizeMult: 1,
      projLifeMult: 1,
      hero: { id: 'knight' },
    };
    const player = { x: 0, y: 0, dead: false };

    // first tick — weapon cooldown elapses (timers default to 0, so it fires)
    fire.update(0.016, world, player, loadout, events);
    expect(casts.length).toBeGreaterThanOrEqual(1);
    expect(casts[0].weaponId).toBe('divine_hammer');
    expect(casts[0].kit).toBeTruthy();
    expect(casts[0].kit.telegraphTime).toBeGreaterThan(0);
  });

  it('non-aoe/rain/pull weapons (fan/orbit/melee etc.) never emit aoeCast', () => {
    // Every aoe/rain/pull weapon in the catalog now ships with aoeKit (Step
    // 3 + bulk fill). The opt-in safety net is verified instead by checking
    // that non-eligible patterns (fan/orbit/melee/ring/chain/boomerang) do
    // not emit aoeCast even if a hypothetical aoeKit were attached — that
    // emission lives only inside the aoe/rain/pull branches of fire().
    const events = createEvents();
    const casts = [];
    events.on('aoeCast', (p) => casts.push(p));

    const world = createWorld();
    world.spawn('enemy', { enemyType: 'walker', x: 100, y: 0, hp: 100, maxHp: 100, radius: 8 });
    world.reap();

    const fire = createWeaponFire();
    // wand is a fan pattern — should never trigger sky-drop FX.
    const loadout = {
      weapons: { wand: 1 },
      cooldownMult: 1,
      projSizeMult: 1,
      projLifeMult: 1,
      hero: { id: 'mage' },
    };
    const player = { x: 0, y: 0, dead: false };

    fire.update(0.016, world, player, loadout, events);
    expect(casts.length).toBe(0);
  });
});
