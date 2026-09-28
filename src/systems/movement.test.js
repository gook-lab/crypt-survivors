import { describe, it, expect } from 'vitest';
import { createMovement } from './movement.js';
import {
  structuresNear,
  ROOM_WORLD_W,
  ROOM_WORLD_H,
  STRUCT_RADIUS,
} from '../util/structureField.js';

function setup() {
  const input = new Set();
  const movement = createMovement(input);
  const world = { entities: [] };
  const player = { x: 0, y: 0, vx: 0, vy: 0, radius: 13 };
  const loadout = { moveSpeed: 100 };
  return { input, movement, world, player, loadout };
}

// Helper — sweep the room grid until structuresNear actually returns a prop
// for some region. Returns the first prop's world position (already includes
// the jitter applied by structuresNear) so the test can put the player next
// to the real, jittered location instead of the blueprint's design-grid one.
function firstStampedProp(rooms) {
  for (let rx = 0; rx < 30; rx++) {
    for (let ry = 0; ry < 30; ry++) {
      const cx = rx * ROOM_WORLD_W + ROOM_WORLD_W / 2;
      const cy = ry * ROOM_WORLD_H + ROOM_WORLD_H / 2;
      const out = structuresNear(rooms, cx, cy, 9999);
      if (out.length > 0) return out[0];
    }
  }
  return null;
}

describe('movement — structure collision', () => {
  it('regression: legacy prop without radius uses STRUCT_RADIUS fallback', () => {
    const { movement, world, player, loadout } = setup();
    const room = {
      structures: [{ name: 'legacy_prop', x: 80, y: 80 }],
    };
    movement.setMap({ rooms: [room] });

    const prop = firstStampedProp([room]);
    expect(prop).not.toBeNull();
    // Place the player at the prop's actual (jittered) position +1px so the
    // collision sq > 0.0001 epsilon fires.
    player.x = prop.x + 1;
    player.y = prop.y;
    const before = { x: player.x, y: player.y };
    movement.update(0.016, world, player, loadout);
    const moved = Math.hypot(player.x - before.x, player.y - before.y);
    // legacy prop has no radius override → STRUCT_RADIUS (21) fallback.
    // Separation distance ≈ player.radius + STRUCT_RADIUS = 34.
    expect(moved).toBeGreaterThan(STRUCT_RADIUS - 1);
  });

  it('radius override: large prop pushes player farther than STRUCT_RADIUS', () => {
    const { movement, world, player, loadout } = setup();
    const giantRadius = 36;
    const room = {
      structures: [{ name: 'giant_prop', x: 80, y: 80, radius: giantRadius }],
    };
    movement.setMap({ rooms: [room] });

    const prop = firstStampedProp([room]);
    expect(prop).not.toBeNull();
    player.x = prop.x + 1;
    player.y = prop.y;
    const before = { x: player.x, y: player.y };
    movement.update(0.016, world, player, loadout);
    const pushedDistance = Math.hypot(player.x - before.x, player.y - before.y);
    // 13 + 36 = 49 — must exceed the legacy 13+21=34 sum.
    expect(pushedDistance).toBeGreaterThan(13 + STRUCT_RADIUS);
  });
});

describe('movement — behaviour patterns (2026-05-29)', () => {
  it('a plain seeker walks straight toward the player', () => {
    const { movement, world, player, loadout } = setup();
    const e = { type: 'enemy', id: 3, x: 100, y: 0, speed: 100, movePattern: null };
    world.entities.push(e);
    movement.update(0.1, world, player, loadout);
    // moved toward the player along -x, zero lateral drift
    expect(e.x).toBeLessThan(100);
    expect(Math.abs(e.y)).toBeCloseTo(0, 5);
  });

  it('a weave enemy drifts laterally while still closing in', () => {
    const { movement, world, player, loadout } = setup();
    // start far enough that it stays in transit (never converges on the player,
    // which would null out the lateral offset). Track the PEAK lateral drift.
    const e = { type: 'enemy', id: 3, x: 400, y: 0, speed: 100, movePattern: 'weave' };
    world.entities.push(e);
    let maxLateral = 0;
    for (let i = 0; i < 30; i++) {
      movement.update(0.05, world, player, loadout);
      maxLateral = Math.max(maxLateral, Math.abs(e.y));
    }
    expect(e.x).toBeLessThan(400); // still advancing toward the player
    expect(maxLateral).toBeGreaterThan(1); // and it weaved off the axis en route
  });

  it('an orbit_strafe enemy circles instead of closing when in the band', () => {
    const { movement, world, player, loadout } = setup();
    // start it exactly on the standoff ring (default R=220) so it takes the
    // tangent branch — it should keep its distance roughly constant, not close.
    const e = { type: 'enemy', id: 2, x: 220, y: 0, speed: 100, movePattern: 'orbit_strafe' };
    world.entities.push(e);
    const d0 = Math.hypot(e.x - player.x, e.y - player.y);
    for (let i = 0; i < 10; i++) movement.update(0.05, world, player, loadout);
    const d1 = Math.hypot(e.x - player.x, e.y - player.y);
    expect(Math.abs(d1 - d0)).toBeLessThan(60); // held the ring (didn't rush in)
    expect(Math.abs(e.y)).toBeGreaterThan(1); // moved tangentially
  });

  it('a buffer-hasted enemy (hasteT) moves faster and the timer decays', () => {
    const { movement, world, player, loadout } = setup();
    const plain = { type: 'enemy', id: 5, x: 100, y: 0, speed: 100 };
    const hasted = { type: 'enemy', id: 6, x: 100, y: 0, speed: 100, hasteT: 1.0 };
    world.entities.push(plain, hasted);
    movement.update(0.1, world, player, loadout);
    // hasted covered more ground toward the player this frame
    expect(hasted.x).toBeLessThan(plain.x);
    expect(hasted.hasteT).toBeCloseTo(0.9, 5); // timer ticked down by dt
  });
});

describe('movement — weekly challenge', () => {
  it('player_speed_mult speeds the player up only while the rule is set', () => {
    const { input, movement, world, player, loadout } = setup();
    input.add('right');
    movement.setWeeklyModifier({ modifierName: 'player_speed_mult', value: 1.15 });
    movement.update(0.1, world, player, loadout);
    expect(player.x).toBeCloseTo(11.5);
    movement.setWeeklyModifier(null);
    player.x = 0;
    movement.update(0.1, world, player, loadout);
    expect(player.x).toBeCloseTo(10);
  });
});
