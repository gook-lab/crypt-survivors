import { describe, it, expect } from 'vitest';
import { createRng, createRngStreams } from './rng.js';

describe('createRng', () => {
  it('same seed produces the same sequence', () => {
    const a = createRng(12345);
    const b = createRng(12345);
    for (let i = 0; i < 100; i++) expect(a.next()).toBe(b.next());
  });

  it('different seeds diverge', () => {
    const a = createRng(1);
    const b = createRng(2);
    let same = 0;
    for (let i = 0; i < 100; i++) if (a.next() === b.next()) same++;
    expect(same).toBeLessThan(5);
  });

  it('next() stays in [0, 1)', () => {
    const r = createRng(99);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int() respects inclusive bounds', () => {
    const r = createRng(7);
    for (let i = 0; i < 500; i++) {
      const v = r.int(3, 6);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(6);
      expect(Number.isInteger(v)).toBe(true);
    }
  });
});

describe('createRngStreams (harness butterfly fix)', () => {
  it('exposes spawn / combat / motion streams', () => {
    const s = createRngStreams(42);
    expect(typeof s.spawn.next).toBe('function');
    expect(typeof s.combat.next).toBe('function');
    expect(typeof s.motion.next).toBe('function');
  });

  it('same base seed → identical streams (deterministic)', () => {
    const a = createRngStreams(12345);
    const b = createRngStreams(12345);
    for (let i = 0; i < 50; i++) {
      expect(a.spawn.next()).toBe(b.spawn.next());
      expect(a.combat.next()).toBe(b.combat.next());
      expect(a.motion.next()).toBe(b.motion.next());
    }
  });

  it('the three streams are independent (decorrelated)', () => {
    // The whole point: draws in one category must not match another, so
    // advancing one stream leaves the others untouched. Different salts make
    // spawn/combat/motion produce distinct sequences from the same base seed.
    const s = createRngStreams(777);
    let sc = 0; let sm = 0; let cm = 0;
    const sp = []; const co = []; const mo = [];
    for (let i = 0; i < 100; i++) { sp.push(s.spawn.next()); co.push(s.combat.next()); mo.push(s.motion.next()); }
    for (let i = 0; i < 100; i++) {
      if (sp[i] === co[i]) sc++;
      if (sp[i] === mo[i]) sm++;
      if (co[i] === mo[i]) cm++;
    }
    expect(sc).toBeLessThan(5);
    expect(sm).toBeLessThan(5);
    expect(cm).toBeLessThan(5);
  });
});
