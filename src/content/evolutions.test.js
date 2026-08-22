import { describe, it, expect } from 'vitest';
import { EVOLUTIONS, evolveCheck } from './evolutions.js';
import { WEAPONS } from './weapons.js';

describe('evolveCheck', () => {
  it('evolves a maxed base weapon when the paired passive is owned', () => {
    const loadout = { weapons: { wand: 5 }, passives: { might: 1 } };
    const evolved = evolveCheck(loadout);
    expect(loadout.weapons.wand).toBeUndefined();
    expect(loadout.weapons.leg_blade).toBe(1);
    expect(evolved.map((d) => d.id)).toEqual(['leg_blade']);
  });

  it('does not evolve a weapon below max level', () => {
    const loadout = { weapons: { wand: 4 }, passives: { might: 3 } };
    expect(evolveCheck(loadout)).toEqual([]);
    expect(loadout.weapons.wand).toBe(4);
  });

  it('does not evolve without the paired passive', () => {
    const loadout = { weapons: { wand: 5 }, passives: {} };
    expect(evolveCheck(loadout)).toEqual([]);
    expect(loadout.weapons.wand).toBe(5);
  });

  it('does not evolve when the legendary is already owned', () => {
    const loadout = {
      weapons: { wand: 5, leg_blade: 1 },
      passives: { might: 1 },
    };
    expect(evolveCheck(loadout)).toEqual([]);
    expect(loadout.weapons.wand).toBe(5);
  });

  it('every recipe references real base + legendary weapons', () => {
    for (const r of EVOLUTIONS) {
      expect(WEAPONS[r.from], r.from).toBeTruthy();
      expect(WEAPONS[r.to], r.to).toBeTruthy();
      expect(WEAPONS[r.to].tier).toBe('legendary');
    }
  });

  // Phase 1 rebuild — each new weapon has exactly one recipe slot.
  it.each([
    ['holy_nova', 'vigor', 'leg_bible'],
    ['divine_rain', 'endure', 'leg_tempest'],
    ['whirlwind_blade', 'haste', 'leg_blade'],
  ])('Phase 1 recipe: %s + %s → %s evolves and grants the legendary', (from, passive, to) => {
    const loadout = {
      weapons: { [from]: WEAPONS[from].maxLevel },
      passives: { [passive]: 1 },
    };
    const evolved = evolveCheck(loadout);
    expect(loadout.weapons[from]).toBeUndefined();
    expect(loadout.weapons[to]).toBe(1);
    expect(evolved.map((d) => d.id)).toContain(to);
  });

  // ── build-freedom expansion — every new passive has ≥1 evolution path ──
  it.each(['fortune', 'wisdom', 'regen2', 'pierce_passive'])(
    'build-freedom passive %s has at least one evolution recipe',
    (passive) => {
      const matching = EVOLUTIONS.filter((r) => r.passive === passive);
      expect(matching.length).toBeGreaterThanOrEqual(1);
    },
  );
});
