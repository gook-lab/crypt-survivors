import { describe, it, expect } from 'vitest';
import { createPickup } from './pickup.js';
import { createWorld } from '../engine/world.js';
import { createProgression } from '../progression.js';

const LOADOUT = { magnet: 72 };

describe('pickup', () => {
  it('collects a gem touching the player and adds its xp', () => {
    const w = createWorld();
    const player = w.spawn('player', { x: 0, y: 0, radius: 13 });
    const gem = w.spawn('gem', { x: 4, y: 0, xp: 3 });
    const prog = createProgression();
    createPickup().update(0.016, w, player, LOADOUT, prog);
    expect(gem.dead).toBe(true);
    expect(prog.xp).toBe(3);
  });

  it('pulls a gem inside the magnet radius toward the player', () => {
    const w = createWorld();
    const player = w.spawn('player', { x: 0, y: 0, radius: 13 });
    const gem = w.spawn('gem', { x: 50, y: 0, xp: 1 });
    createPickup().update(0.05, w, player, LOADOUT, createProgression());
    expect(gem.x).toBeLessThan(50); // moved toward the player at the origin
    expect(gem.dead).toBe(false);
  });

  it('leaves a gem outside the magnet radius alone', () => {
    const w = createWorld();
    const player = w.spawn('player', { x: 0, y: 0, radius: 13 });
    const gem = w.spawn('gem', { x: 400, y: 0, xp: 1 });
    createPickup().update(0.05, w, player, LOADOUT, createProgression());
    expect(gem.x).toBe(400);
  });
});

describe('pickup — weekly challenge', () => {
  it('xp_mult rule multiplies gem xp, and clearing the rule restores normal xp', () => {
    const run = (rule) => {
      const w = createWorld();
      const player = w.spawn('player', { x: 0, y: 0, radius: 13 });
      w.spawn('gem', { x: 4, y: 0, xp: 5 }); // below the Lv2 threshold so xp isn't consumed by a level-up
      const prog = createProgression();
      const pickup = createPickup();
      pickup.setWeeklyModifier(rule);
      pickup.update(0.016, w, player, LOADOUT, prog);
      return prog.xp;
    };
    expect(run({ modifierName: 'xp_mult', value: 1.2 })).toBeCloseTo(6);
    expect(run(null)).toBe(5);
  });
});
