import { describe, it, expect } from 'vitest';
import { createEnemyAbilities, spawnEnemyShot } from './enemyAbilities.js';
import { createWorld } from '../engine/world.js';

describe('spawnEnemyShot', () => {
  it('spawns a projectile flagged as an enemy shot, aimed by direction', () => {
    const world = createWorld();
    spawnEnemyShot(world, 0, 0, 1, 0, 200, 9, null);
    world.reap();
    const shot = world.entities.find((e) => e.type === 'projectile');
    expect(shot.enemyShot).toBe(true);
    expect(shot.vx).toBeCloseTo(200, 5);
    expect(shot.vy).toBeCloseTo(0, 5);
    expect(shot.damage).toBe(9);
  });
});

describe('enemy abilities', () => {
  it('a ranged enemy fires a shot at the player once its cooldown lapses', () => {
    const world = createWorld();
    const ab = createEnemyAbilities();
    // 'elite' bestiary entry has role: 'elite' — passes the tier gate that
    // restricts ranged shots to elite/boss/mini-boss enemies.
    const shooter = world.spawn('enemy', {
      enemyType: 'elite', x: 200, y: 0, hp: 10, maxHp: 10,
      speed: 50, damage: 8, ability: 'ranged', abilityCd: 0,
    });
    world.reap();
    const player = { x: 0, y: 0 };
    // first tick queues the shot and starts the telegraph windup
    ab.update(0.016, world, player);
    expect(shooter.telegraph).toBeGreaterThan(0);
    expect(world.entities.some((e) => e.type === 'projectile')).toBe(false);
    // a full telegraph's worth of time later, the queued shot fires
    ab.update(0.4, world, player);
    world.reap();
    const shots = world.entities.filter((e) => e.type === 'projectile' && e.enemyShot);
    expect(shots.length).toBe(1);
  });

  it('a basic-role enemy with ranged ability does NOT fire (tier gate)', () => {
    // User feedback: only elite / boss / mini-boss may fire projectiles.
    // A legacy basic enemy with ability: 'ranged' (or a mod that adds one)
    // is silently neutralised by the tier gate in enemyAbilities.update.
    const world = createWorld();
    const ab = createEnemyAbilities();
    const wisp = world.spawn('enemy', {
      enemyType: 'wisp', x: 200, y: 0, hp: 10, maxHp: 10,
      speed: 50, damage: 8, ability: 'ranged', abilityCd: 0,
    });
    world.reap();
    // Tick repeatedly — gate should make this enemy permanently dormant.
    for (let i = 0; i < 200; i++) ab.update(0.05, world, { x: 0, y: 0 });
    world.reap();
    expect(wisp.telegraph || 0).toBe(0);
    expect(world.entities.some((e) => e.type === 'projectile')).toBe(false);
  });

  it('a mini-boss with ranged ability bypasses the tier gate', () => {
    const world = createWorld();
    const ab = createEnemyAbilities();
    const mini = world.spawn('enemy', {
      enemyType: 'wisp', miniBoss: true, x: 200, y: 0, hp: 10, maxHp: 10,
      speed: 50, damage: 8, ability: 'ranged', abilityCd: 0,
    });
    world.reap();
    ab.update(0.016, world, { x: 0, y: 0 });
    expect(mini.telegraph).toBeGreaterThan(0);
  });

  it('a charge enemy opens a charge window when the player is near', () => {
    const world = createWorld();
    const ab = createEnemyAbilities();
    const wolf = world.spawn('enemy', {
      enemyType: 'wolf', x: 150, y: 0, hp: 10, maxHp: 10,
      speed: 100, damage: 9, ability: 'charge', abilityCd: 0,
    });
    world.reap();
    ab.update(0.016, world, { x: 0, y: 0 });
    expect(wolf.charging).toBeGreaterThan(0);
  });

  it('does not fire while the cooldown is still counting down', () => {
    const world = createWorld();
    const ab = createEnemyAbilities();
    world.spawn('enemy', {
      enemyType: 'wisp', x: 200, y: 0, hp: 10, maxHp: 10,
      speed: 50, damage: 8, ability: 'ranged', abilityCd: 5,
    });
    world.reap();
    ab.update(0.016, world, { x: 0, y: 0 });
    world.reap();
    expect(world.entities.some((e) => e.type === 'projectile')).toBe(false);
  });

  it('leaves plain (ability-less) enemies alone', () => {
    const world = createWorld();
    const ab = createEnemyAbilities();
    world.spawn('enemy', {
      enemyType: 'walker', x: 100, y: 0, hp: 10, maxHp: 10,
      speed: 50, damage: 8, ability: null,
    });
    world.reap();
    ab.update(0.016, world, { x: 0, y: 0 });
    world.reap();
    expect(world.entities.some((e) => e.type === 'projectile')).toBe(false);
  });
});

describe('expansion archetypes (2026-05-29)', () => {
  it('a summoner telegraphs then spawns adds, respecting the lifetime cap', () => {
    const world = createWorld();
    const ab = createEnemyAbilities();
    const necro = world.spawn('enemy', {
      enemyType: 'necromancer', x: 120, y: 0, hp: 50, maxHp: 50,
      speed: 50, damage: 8, ability: 'summoner', summonType: 'walker', abilityCd: 0,
    });
    world.reap();
    const player = { x: 0, y: 0 };
    ab.update(0.016, world, player); // queue + telegraph
    expect(necro.telegraph).toBeGreaterThan(0);
    ab.update(0.5, world, player); // resolve → adds appear
    world.reap();
    const adds = world.entities.filter((e) => e.type === 'enemy' && e.enemyType === 'walker');
    expect(adds.length).toBeGreaterThanOrEqual(1);
    // run long enough to exceed the lifetime cap, then confirm it stops
    for (let i = 0; i < 4000; i++) ab.update(0.05, world, player);
    world.reap();
    const total = world.entities.filter((e) => e.enemyType === 'walker').length;
    expect(necro.summonedTotal).toBeLessThanOrEqual(6);
    expect(total).toBeLessThanOrEqual(6 + 1);
  });

  it('a kamikaze arms a dash then detonates into a shrapnel ring and dies', () => {
    const world = createWorld();
    const ab = createEnemyAbilities();
    const bomb = world.spawn('enemy', {
      enemyType: 'powder_skeleton', x: 100, y: 0, hp: 10, maxHp: 10,
      speed: 90, damage: 14, ability: 'kamikaze', abilityCd: 0,
    });
    world.reap();
    const player = { x: 0, y: 0 };
    ab.update(0.016, world, player); // arm windup
    expect(bomb.telegraph).toBeGreaterThan(0);
    ab.update(0.5, world, player); // windup → lunge
    expect(bomb.kamiArmed).toBe(true);
    // run the dash window out → detonation
    for (let i = 0; i < 40; i++) ab.update(0.05, world, player);
    world.reap();
    expect(bomb.dead).toBe(true);
    const shards = world.entities.filter((e) => e.type === 'projectile' && e.enemyShot);
    expect(shards.length).toBe(7); // KAMI_SHARDS
  });

  it('a shielded enemy raises a periodic barrier (shieldT) on its cycle', () => {
    const world = createWorld();
    const ab = createEnemyAbilities();
    const guard = world.spawn('enemy', {
      enemyType: 'rune_guardian', x: 80, y: 0, hp: 100, maxHp: 100,
      speed: 30, damage: 18, ability: 'shielded', abilityCd: 0,
    });
    world.reap();
    ab.update(0.016, world, { x: 0, y: 0 });
    expect(guard.shieldT).toBeGreaterThan(0);
  });

  it('a buffer stamps hasteT on a nearby ally but not itself', () => {
    const world = createWorld();
    const ab = createEnemyAbilities();
    const drummer = world.spawn('enemy', {
      enemyType: 'war_drummer', x: 0, y: 0, hp: 60, maxHp: 60,
      speed: 70, damage: 9, ability: 'buffer', abilityCd: 0,
    });
    const ally = world.spawn('enemy', {
      enemyType: 'walker', x: 60, y: 0, hp: 10, maxHp: 10,
      speed: 56, damage: 7, ability: null,
    });
    world.reap();
    ab.update(0.016, world, { x: 0, y: 0 });
    expect(ally.hasteT).toBeGreaterThan(0);
    expect(drummer.hasteT || 0).toBe(0);
  });
});
