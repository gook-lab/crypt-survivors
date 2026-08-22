import { describe, it, expect } from 'vitest';
import { createDamage } from './damage.js';
import { createWorld } from '../engine/world.js';
import { createEvents } from '../engine/events.js';

function setup() {
  return {
    world: createWorld(),
    events: createEvents(),
    stats: { time: 0, kills: 0 },
    damage: createDamage(),
  };
}

describe('damage.apply', () => {
  it('reduces hp by the amount', () => {
    const { world, events, stats, damage } = setup();
    const e = world.spawn('enemy', { x: 0, y: 0, hp: 20, maxHp: 20 });
    damage.apply(world, events, stats, e, 8, 0, 0, 0);
    expect(e.hp).toBe(12);
    expect(e.dead).toBe(false);
  });

  it('kills the target on lethal damage and counts the kill', () => {
    const { world, events, stats, damage } = setup();
    const e = world.spawn('enemy', { x: 0, y: 0, hp: 10, maxHp: 10 });
    damage.apply(world, events, stats, e, 10, 0, 0, 0);
    expect(e.dead).toBe(true);
    expect(stats.kills).toBe(1);
  });

  it('overkill still kills exactly once', () => {
    const { world, events, stats, damage } = setup();
    const e = world.spawn('enemy', { x: 0, y: 0, hp: 5, maxHp: 5 });
    damage.apply(world, events, stats, e, 999, 0, 0, 0);
    expect(e.dead).toBe(true);
    expect(stats.kills).toBe(1);
  });

  it('emits a hit event always, and a kill event on death', () => {
    const { world, events, stats, damage } = setup();
    let hits = 0;
    let kills = 0;
    events.on('hit', () => hits++);
    events.on('kill', () => kills++);
    const e = world.spawn('enemy', { x: 0, y: 0, hp: 10, maxHp: 10 });
    damage.apply(world, events, stats, e, 4, 0, 0, 0);
    expect(hits).toBe(1);
    expect(kills).toBe(0);
    damage.apply(world, events, stats, e, 10, 0, 0, 0);
    expect(hits).toBe(2);
    expect(kills).toBe(1);
  });

  it('ignores damage to an already-dead target', () => {
    const { world, events, stats, damage } = setup();
    const e = world.spawn('enemy', { x: 0, y: 0, hp: 10, maxHp: 10 });
    world.kill(e);
    damage.apply(world, events, stats, e, 5, 0, 0, 0);
    expect(stats.kills).toBe(0);
    expect(e.hp).toBe(10); // untouched
  });

  it('knockback nudges the target along the hit direction', () => {
    const { world, events, stats, damage } = setup();
    const e = world.spawn('enemy', { x: 0, y: 0, hp: 50, maxHp: 50 });
    damage.apply(world, events, stats, e, 1, 10, 0, 7); // +x direction, kb 7
    expect(e.x).toBeCloseTo(7, 5);
    expect(e.y).toBeCloseTo(0, 5);
  });

  it('a heavy hit (knockback >= 16) staggers the enemy; a light one does not', () => {
    const { world, events, stats, damage } = setup();
    const light = world.spawn('enemy', { x: 0, y: 0, hp: 50, maxHp: 50 });
    damage.apply(world, events, stats, light, 1, 10, 0, 7);
    expect(light.staggerT || 0).toBe(0);
    const heavy = world.spawn('enemy', { x: 0, y: 0, hp: 50, maxHp: 50 });
    damage.apply(world, events, stats, heavy, 1, 10, 0, 28);
    expect(heavy.staggerT).toBeGreaterThan(0);
  });

  it('does not stagger a boss — too massive', () => {
    const { world, events, stats, damage } = setup();
    const boss = world.spawn('enemy', { x: 0, y: 0, hp: 500, maxHp: 500, boss: true });
    damage.apply(world, events, stats, boss, 1, 10, 0, 36);
    expect(boss.staggerT || 0).toBe(0);
  });

  it('a shielded enemy (shieldT > 0) soaks 90% of incoming damage', () => {
    const { world, events, stats, damage } = setup();
    const e = world.spawn('enemy', { x: 0, y: 0, hp: 100, maxHp: 100, shieldT: 1.0 });
    damage.apply(world, events, stats, e, 50, 0, 0, 0);
    expect(e.hp).toBeCloseTo(95, 5); // only 10% (5) landed
  });
});
