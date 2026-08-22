import { describe, it, expect } from 'vitest';
import { createCollision } from './collision.js';
import { createDamage } from './damage.js';
import { createWorld } from '../engine/world.js';
import { createEvents } from '../engine/events.js';

function setup() {
  return {
    world: createWorld(),
    events: createEvents(),
    stats: { time: 0, kills: 0 },
    damage: createDamage(),
    collision: createCollision(),
  };
}

describe('collision', () => {
  it('a projectile overlapping an enemy damages it', () => {
    const { world, events, stats, damage, collision } = setup();
    const player = world.spawn('player', { x: 0, y: 0, radius: 13 });
    const enemy = world.spawn('enemy', {
      x: 300, y: 0, radius: 12, hp: 30, maxHp: 30, speed: 0, damage: 0,
    });
    world.spawn('projectile', {
      x: 300, y: 0, vx: 100, vy: 0, radius: 6,
      damage: 12, pierce: 1, life: 2, knockback: 0,
    });
    collision.update(0.016, world, player, damage, events, stats);
    expect(enemy.hp).toBe(18);
  });

  it('a pierce-1 projectile dies after a single hit', () => {
    const { world, events, stats, damage, collision } = setup();
    const player = world.spawn('player', { x: 0, y: 0, radius: 13 });
    world.spawn('enemy', {
      x: 300, y: 0, radius: 12, hp: 99, maxHp: 99, speed: 0, damage: 0,
    });
    const proj = world.spawn('projectile', {
      x: 300, y: 0, vx: 100, vy: 0, radius: 6,
      damage: 5, pierce: 1, life: 2, knockback: 0,
    });
    collision.update(0.016, world, player, damage, events, stats);
    expect(proj.dead).toBe(true);
  });

  it('a projectile expires when its life runs out', () => {
    const { world, events, stats, damage, collision } = setup();
    const player = world.spawn('player', { x: 0, y: 0, radius: 13 });
    const proj = world.spawn('projectile', {
      x: 9999, y: 9999, vx: 0, vy: 0, radius: 6,
      damage: 5, pierce: 1, life: 0.01, knockback: 0,
    });
    collision.update(0.05, world, player, damage, events, stats);
    expect(proj.dead).toBe(true);
  });

  it('an enemy touching the player deals contact damage', () => {
    const { world, events, stats, damage, collision } = setup();
    const player = world.spawn('player', {
      x: 0, y: 0, radius: 13, hp: 100, maxHp: 100,
    });
    world.spawn('enemy', {
      x: 5, y: 0, radius: 12, hp: 20, maxHp: 20, speed: 0, damage: 10,
    });
    collision.update(1, world, player, damage, events, stats); // dt=1 -> 10 dmg
    expect(player.hp).toBeCloseTo(90, 5);
  });

  it('a projectile with hit tracking damages each enemy only once', () => {
    const { world, events, stats, damage, collision } = setup();
    const player = world.spawn('player', { x: 0, y: 0, radius: 13 });
    const enemy = world.spawn('enemy', {
      x: 300, y: 0, radius: 12, hp: 999, maxHp: 999, speed: 0, damage: 0,
    });
    world.spawn('projectile', {
      x: 300, y: 0, vx: 0, vy: 0, radius: 40,
      damage: 10, pierce: 9999, life: 2, knockback: 0, hits: [],
    });
    collision.update(0.016, world, player, damage, events, stats);
    collision.update(0.016, world, player, damage, events, stats); // still overlapping
    expect(enemy.hp).toBe(989); // hit once for 10, not twice
  });

  it('overlapping enemies are pushed apart (separation)', () => {
    const { world, events, stats, damage, collision } = setup();
    const player = world.spawn('player', {
      x: 0, y: 0, radius: 13, hp: 100, maxHp: 100,
    });
    const a = world.spawn('enemy', {
      x: 0, y: 0, radius: 12, hp: 20, maxHp: 20, speed: 0, damage: 0,
    });
    const b = world.spawn('enemy', {
      x: 6, y: 0, radius: 12, hp: 20, maxHp: 20, speed: 0, damage: 0,
    });
    const before = Math.hypot(a.x - b.x, a.y - b.y);
    collision.update(0.016, world, player, damage, events, stats);
    const after = Math.hypot(a.x - b.x, a.y - b.y);
    expect(after).toBeGreaterThan(before);
  });
});
