import { describe, it, expect } from 'vitest';
import { DROPS, rollDrop } from './drops.js';
import { createRng } from '../util/rng.js';

describe('rollDrop', () => {
  it('never rolls a heal drop under the no-healing weekly rule', () => {
    const rng = createRng(42);
    for (let i = 0; i < 2000; i++) {
      expect(DROPS[rollDrop(rng, { noHeal: true })].kind).not.toBe('heal');
    }
  });

  it('still rolls heal drops in a normal run', () => {
    const rng = createRng(42);
    const kinds = new Set(Array.from({ length: 2000 }, () => DROPS[rollDrop(rng)].kind));
    expect(kinds.has('heal')).toBe(true);
  });
});
