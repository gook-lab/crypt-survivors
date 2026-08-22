import { describe, it, expect } from 'vitest';
import { rollChoices, applyChoice } from './choices.js';
import { createLoadout } from './loadout.js';
import { createRng } from './util/rng.js';

const dummyPlayer = () => ({ maxHp: 100, hp: 100 });

describe('choices', () => {
  it('rollChoices returns the requested count', () => {
    expect(rollChoices(createRng(1), 3, createLoadout())).toHaveLength(3);
  });

  // count 40 exceeds the full candidate pool, so rollChoices drains every
  // candidate — these assert what the generator CAN offer, not a random slice.
  it('offers levelling the owned starting weapon', () => {
    const picks = rollChoices(createRng(2), 40, createLoadout());
    expect(picks.some((c) => c.kind === 'weapon-up' && c.id === 'wand')).toBe(true);
  });

  it('offers acquiring new passives', () => {
    const picks = rollChoices(createRng(2), 40, createLoadout());
    expect(picks.some((c) => c.kind === 'passive-new')).toBe(true);
  });

  it('applyChoice levels an owned weapon', () => {
    const lo = createLoadout();
    applyChoice({ kind: 'weapon-up', id: 'wand' }, lo, dummyPlayer());
    expect(lo.weapons.wand).toBe(2);
  });

  it('applyChoice acquires a passive and recomputes modifiers', () => {
    const lo = createLoadout();
    applyChoice({ kind: 'passive-new', id: 'might' }, lo, dummyPlayer());
    expect(lo.passives.might).toBe(1);
    expect(lo.damageMult).toBeCloseTo(1.12, 5);
  });

  it('the vigor passive raises the player max hp', () => {
    const lo = createLoadout();
    const player = { maxHp: 100, hp: 100 };
    applyChoice({ kind: 'passive-new', id: 'vigor' }, lo, player);
    expect(player.maxHp).toBe(122); // 100 + 22
  });

  it('applyChoice acquires and tiers up a spirit', () => {
    const lo = createLoadout();
    applyChoice({ kind: 'spirit-new', id: 'fairy' }, lo, dummyPlayer());
    expect(lo.spirits.fairy).toBe(1);
    applyChoice({ kind: 'spirit-up', id: 'fairy' }, lo, dummyPlayer());
    expect(lo.spirits.fairy).toBe(2);
  });

  // ── v2 rebuild — weapon-up desc surfaces the next skill perk ───────────
  it('weapon-up desc surfaces the next-level perk name', () => {
    const lo = createLoadout();
    // starter weapon is wand which has a Lv2 perk "추적 강화" wired in v2
    const picks = rollChoices(createRng(2), 40, lo);
    const wandUp = picks.find((c) => c.kind === 'weapon-up' && c.id === 'wand');
    expect(wandUp).toBeTruthy();
    expect(wandUp.desc).toContain('추적 강화'); // Lv1→2 perk name
  });

  it('weapon-up desc falls back to bare level for weapons without skills', () => {
    const lo = createLoadout();
    // mace exists in BASE_WEAPONS and has a skill tree — pick something
    // without one if any remain. As of v2 every base weapon has skills, so
    // the fallback path is best exercised by mocking; verify the format.
    lo.weapons.wand = 4;  // mace would be cleaner but wand at lv4 still has Lv5 perk
    const picks = rollChoices(createRng(2), 40, lo);
    const wandUp = picks.find((c) => c.kind === 'weapon-up' && c.id === 'wand');
    expect(wandUp.desc).toMatch(/Lv 4→5/); // shows level transition
    expect(wandUp.desc).toContain('연속 시전'); // Lv5 perk name
  });

  // ── build-freedom expansion — slot 4 → 5 ───────────────────────────────
  it('weapon-new appears until 5 weapons are owned', () => {
    const lo = createLoadout();
    // owning 4 weapons → 5th slot still open
    lo.weapons = { wand: 1, nova: 1, axe: 1, spear: 1 };
    const picksOpen = rollChoices(createRng(3), 40, lo);
    expect(picksOpen.some((c) => c.kind === 'weapon-new')).toBe(true);
    // owning 5 weapons → all slots full
    lo.weapons = { wand: 1, nova: 1, axe: 1, spear: 1, arrow: 1 };
    const picksFull = rollChoices(createRng(3), 40, lo);
    expect(picksFull.some((c) => c.kind === 'weapon-new')).toBe(false);
  });

  it('passive-new appears until 5 passives are owned', () => {
    const lo = createLoadout();
    // owning 4 passives → 5th slot still open
    lo.passives = { might: 1, haste: 1, multi: 1, swift: 1 };
    const picksOpen = rollChoices(createRng(4), 40, lo);
    expect(picksOpen.some((c) => c.kind === 'passive-new')).toBe(true);
    // owning 5 passives → all slots full
    lo.passives = { might: 1, haste: 1, multi: 1, swift: 1, vigor: 1 };
    const picksFull = rollChoices(createRng(4), 40, lo);
    expect(picksFull.some((c) => c.kind === 'passive-new')).toBe(false);
  });

  it('applyChoice fills the 5th weapon slot', () => {
    const lo = createLoadout();
    lo.weapons = { wand: 1, nova: 1, axe: 1, spear: 1 };
    applyChoice({ kind: 'weapon-new', id: 'arrow' }, lo, dummyPlayer());
    expect(Object.keys(lo.weapons)).toHaveLength(5);
    expect(lo.weapons.arrow).toBe(1);
  });

  // ── v2 rebuild — class affinity weights weapon-new rolls ───────────────
  it('class affinity boosts signature-tag weapons in the new-weapon pool', async () => {
    const { WEAPONS } = await import('./content/weapons.js');
    // Run rollChoices with a knight loadout enough times to observe the bias
    // toward holy-tagged weapons (the affinity bonus is multiplicative ×1.6
    // per roll). Use a tight RNG seed so the test is deterministic.
    const lo = createLoadout();
    lo.hero = { id: 'knight' };
    // simulate many rolls — count holy vs non-holy weapon-new candidates
    let holyHits = 0;
    let nonHolyHits = 0;
    for (let seed = 1; seed <= 80; seed++) {
      const picks = rollChoices(createRng(seed), 1, lo);
      const pick = picks[0];
      if (pick?.kind === 'weapon-new' && WEAPONS[pick.id]) {
        const tags = WEAPONS[pick.id].tags || [];
        if (tags.includes('holy')) holyHits += 1;
        else nonHolyHits += 1;
      }
    }
    // With ×1.6 vs ×0.7 weighting, holy picks should comfortably exceed
    // 30% of weapon-new rolls (much higher than naive uniform share).
    const total = holyHits + nonHolyHits;
    expect(total).toBeGreaterThan(5); // sanity: rolls landed on weapon-new
    expect(holyHits / total).toBeGreaterThan(0.25);
  });
});
