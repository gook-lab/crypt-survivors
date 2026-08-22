import { describe, it, expect } from 'vitest';
import { createWorld } from './world.js';

describe('world', () => {
  it('spawn adds an entity with a unique id', () => {
    const w = createWorld();
    const a = w.spawn('enemy', { x: 1 });
    const b = w.spawn('enemy', { x: 2 });
    expect(a.id).not.toBe(b.id);
    expect(w.entities).toHaveLength(2);
  });

  it('reap removes dead entities', () => {
    const w = createWorld();
    const a = w.spawn('enemy', {});
    const b = w.spawn('enemy', {});
    w.kill(a);
    w.reap();
    expect(w.entities).toHaveLength(1);
    expect(w.entities[0]).toBe(b);
  });

  it('pooled types are recycled after reap', () => {
    const w = createWorld();
    const p = w.spawn('projectile', { tag: 'first' });
    w.kill(p);
    w.reap();
    const p2 = w.spawn('projectile', { tag: 'second' });
    expect(p2).toBe(p); // same object, recycled
    expect(p2.tag).toBe('second'); // fields wiped + reset
    expect(p2.dead).toBe(false);
  });

  it('non-pooled types are not recycled', () => {
    const w = createWorld();
    const e = w.spawn('enemy', {});
    w.kill(e);
    w.reap();
    const e2 = w.spawn('enemy', {});
    expect(e2).not.toBe(e);
  });

  it('count() tallies a given type', () => {
    const w = createWorld();
    w.spawn('enemy', {});
    w.spawn('enemy', {});
    w.spawn('gem', {});
    expect(w.count('enemy')).toBe(2);
    expect(w.count('gem')).toBe(1);
  });
});
