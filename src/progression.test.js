import { describe, it, expect } from 'vitest';
import { createProgression } from './progression.js';

describe('progression', () => {
  it('starts at level 1 with nothing pending', () => {
    const p = createProgression();
    expect(p.level).toBe(1);
    expect(p.pendingLevels).toBe(0);
  });

  it('does not level up below the threshold', () => {
    const p = createProgression();
    p.addXp(1);
    expect(p.level).toBe(1);
    expect(p.xp).toBe(1);
  });

  it('levels up when xp crosses the threshold', () => {
    const p = createProgression();
    p.addXp(p.xpToNext);
    expect(p.level).toBe(2);
    expect(p.pendingLevels).toBe(1);
  });

  it('grants several levels at once for a big xp gain', () => {
    const p = createProgression();
    p.addXp(1000);
    expect(p.level).toBeGreaterThan(2);
    expect(p.pendingLevels).toBe(p.level - 1);
  });

  it('consumeLevel drains the pending queue', () => {
    const p = createProgression();
    p.addXp(1000);
    const before = p.pendingLevels;
    p.consumeLevel();
    expect(p.pendingLevels).toBe(before - 1);
  });
});
