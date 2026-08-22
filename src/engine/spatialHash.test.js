import { describe, it, expect } from 'vitest';
import { createSpatialHash } from './spatialHash.js';

describe('spatialHash', () => {
  it('finds an entity inside the query circle', () => {
    const h = createSpatialHash(48);
    const e = { x: 10, y: 10 };
    h.insert(e);
    expect(h.queryCircle(12, 12, 20)).toContain(e);
  });

  it('omits entities far outside (different cells)', () => {
    const h = createSpatialHash(48);
    const near = { x: 0, y: 0 };
    const far = { x: 500, y: 500 };
    h.insert(near);
    h.insert(far);
    const r = h.queryCircle(0, 0, 10);
    expect(r).toContain(near);
    expect(r).not.toContain(far);
  });

  it('handles an entity exactly on a cell boundary', () => {
    const h = createSpatialHash(48);
    const e = { x: 48, y: 48 }; // on the (0,0)/(1,1) cell edge
    h.insert(e);
    expect(h.queryCircle(46, 46, 8)).toContain(e);
  });

  it('clear() empties the grid', () => {
    const h = createSpatialHash(48);
    h.insert({ x: 1, y: 1 });
    h.clear();
    expect(h.queryCircle(0, 0, 100)).toHaveLength(0);
  });

  it('a query over empty space returns nothing', () => {
    const h = createSpatialHash(48);
    expect(h.queryCircle(0, 0, 50)).toHaveLength(0);
  });
});
