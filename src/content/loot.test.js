import { describe, it, expect } from 'vitest';
import { rollChest, lootItem, LOOT_ITEMS, CHEST_TYPES } from './loot.js';
import { createRng } from '../util/rng.js';

describe('rollChest', () => {
  it('every chest type reveals 1-3 items', () => {
    for (const t of ['wood', 'gold', 'boss']) {
      for (let seed = 0; seed < 30; seed++) {
        const r = rollChest(createRng(seed), t);
        expect(r.items.length).toBeGreaterThanOrEqual(1);
        expect(r.items.length).toBeLessThanOrEqual(3);
      }
    }
  });

  it('a boss chest can still hit a 3-item jackpot at some seeds', () => {
    let sawJackpot = false;
    for (let seed = 0; seed < 30 && !sawJackpot; seed++) {
      const r = rollChest(createRng(seed), 'boss');
      if (r.items.length === 3) sawJackpot = true;
    }
    expect(sawJackpot).toBe(true);
  });

  it('is deterministic for a given seed', () => {
    const a = rollChest(createRng(42), 'gold');
    const b = rollChest(createRng(42), 'gold');
    expect(a.items.map((i) => i.id)).toEqual(b.items.map((i) => i.id));
  });

  it('only yields ids that exist in LOOT_ITEMS', () => {
    const ids = new Set(LOOT_ITEMS.map((i) => i.id));
    for (let seed = 0; seed < 20; seed++) {
      for (const item of rollChest(createRng(seed), 'boss').items) {
        expect(ids.has(item.id)).toBe(true);
        expect(lootItem(item.id)).toBe(item);
      }
    }
  });

  it('does not repeat an item within one chest', () => {
    for (let seed = 0; seed < 20; seed++) {
      const items = rollChest(createRng(seed), 'boss').items;
      expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
    }
  });

  it('every chest type carries valid tier weights', () => {
    for (const t in CHEST_TYPES) {
      const w = CHEST_TYPES[t].weights;
      expect(w.common + w.rare + w.epic).toBeGreaterThan(0);
    }
  });
});
