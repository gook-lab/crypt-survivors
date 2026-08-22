import { describe, it, expect } from 'vitest';
import { applySkill } from './characters.js';
import { createLoadout } from '../loadout.js';

describe('applySkill', () => {
  it('folds a stat effect into loadout.meta', () => {
    const loadout = createLoadout();
    applySkill({ effect: { damage: 0.2, armor: 0.1 } }, loadout);
    expect(loadout.meta.damage).toBe(0.2);
    expect(loadout.meta.armor).toBeCloseTo(0.1, 5);
  });

  it('routes crit bonuses through meta so recompute keeps them', () => {
    const loadout = createLoadout();
    applySkill({ effect: { critChance: 0.15, critMult: 0.3 } }, loadout);
    loadout.recompute(); // recompute derives critChance from meta
    // base crit moved 0.15/2.0 → 0.10/1.6 in the post-playtest balance pass
    expect(loadout.critChance).toBeCloseTo(0.10 + 0.15, 5);
    expect(loadout.critMult).toBeCloseTo(1.6 + 0.3, 5);
  });

  it('registers an onKill effect without touching meta', () => {
    const loadout = createLoadout();
    applySkill({ effect: { onKill: 'ignite' } }, loadout);
    expect(loadout.onKill).toEqual(['ignite']);
  });

  it('ignores an unknown stat key instead of writing NaN', () => {
    const loadout = createLoadout();
    applySkill({ effect: { bogusKey: 5 } }, loadout);
    expect(loadout.meta.bogusKey).toBeUndefined();
  });

  it('an empty (Lv1 starter) effect is a no-op', () => {
    const loadout = createLoadout();
    const before = JSON.stringify(loadout.meta);
    applySkill({ effect: {} }, loadout);
    expect(JSON.stringify(loadout.meta)).toBe(before);
  });
});
