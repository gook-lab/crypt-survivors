import { describe, it, expect } from 'vitest';
import { createLoadout } from './loadout.js';

describe('loadout', () => {
  it('starts with the starting weapon at level 1', () => {
    expect(createLoadout().weapons.wand).toBe(1);
  });

  it('starts with baseline modifiers', () => {
    const lo = createLoadout();
    expect(lo.damageMult).toBe(1);
    expect(lo.cooldownMult).toBe(1);
    expect(lo.projectileBonus).toBe(0);
  });

  it('recompute derives damageMult from the might level', () => {
    const lo = createLoadout();
    lo.passives.might = 3;
    lo.recompute();
    expect(lo.damageMult).toBeCloseTo(1.36, 5); // 1 + 0.12 * 3
  });

  it('recompute derives projectileBonus from the multi level', () => {
    const lo = createLoadout();
    lo.passives.multi = 2;
    lo.recompute();
    expect(lo.projectileBonus).toBe(2);
  });

  it('recompute derives cooldownMult from the haste level', () => {
    const lo = createLoadout();
    lo.passives.haste = 2;
    lo.recompute();
    expect(lo.cooldownMult).toBeCloseTo(0.92 * 0.92, 5);
  });

  // ── build-freedom expansion — 4 recompute-only passives ─────────────────
  it('fortune Lv5 folds into loadout.luck (+0.6)', () => {
    const lo = createLoadout();
    lo.passives.fortune = 5;
    lo.recompute();
    expect(lo.luck).toBeCloseTo(0.6, 5); // 0.12 * 5
  });

  it('wisdom Lv3 multiplies xpGainMult by 1.30', () => {
    const lo = createLoadout();
    lo.passives.wisdom = 3;
    lo.recompute();
    expect(lo.xpGainMult).toBeCloseTo(1.3, 5); // (1+0) * (1 + 0.10*3)
  });

  it('regen2 Lv3 folds into loadout.regen on top of the base regen floor', () => {
    const lo = createLoadout();
    lo.recompute();
    const base = lo.regen; // PLAYER.regen innate floor (anti-chip survivability)
    expect(base).toBeGreaterThan(0); // floor is active
    lo.passives.regen2 = 3;
    lo.recompute();
    expect(lo.regen).toBeCloseTo(base + 0.9, 5); // base + 0.3 * 3
  });

  it('pierce_passive Lv3 folds into loadout.pierceBonus (+3)', () => {
    const lo = createLoadout();
    lo.passives.pierce_passive = 3;
    lo.recompute();
    expect(lo.pierceBonus).toBe(3);
  });
});
