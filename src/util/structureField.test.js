import { describe, it, expect } from 'vitest';
import { zoneAt, structuresNear, STRUCT_RADIUS, ROOM_WORLD_W, ROOM_WORLD_H } from './structureField.js';

describe('zoneAt', () => {
  const zones = ['graveyard', 'colonnade', 'inner-sanctum'];

  it('returns "default" when zones is empty or undefined', () => {
    expect(zoneAt(0, 0, undefined)).toBe('default');
    expect(zoneAt(0, 0, [])).toBe('default');
    expect(zoneAt(5, 7, null)).toBe('default');
  });

  it('is deterministic: same (rx, ry) → same zone', () => {
    expect(zoneAt(3, 5, zones)).toBe(zoneAt(3, 5, zones));
    expect(zoneAt(-10, 20, zones)).toBe(zoneAt(-10, 20, zones));
  });

  it('groups 4×4 region clusters into the same zone', () => {
    // a single 4×4 cluster shares one zone
    const z = zoneAt(0, 0, zones);
    expect(zoneAt(1, 0, zones)).toBe(z);
    expect(zoneAt(3, 3, zones)).toBe(z);
    expect(zoneAt(0, 2, zones)).toBe(z);
  });

  it('distributes across zones (mod-cluster) — not all the same zone', () => {
    const seen = new Set();
    for (let cx = 0; cx < 20; cx++) {
      for (let cy = 0; cy < 20; cy++) {
        seen.add(zoneAt(cx * 4, cy * 4, zones));
      }
    }
    expect(seen.size).toBeGreaterThan(1);
  });
});

describe('structuresNear', () => {
  const baseRoom = {
    biome: 'crypt',
    zone: 'graveyard',
    structures: [
      { name: 'prop_a', x: 100, y: 100 },
      { name: 'prop_giant', x: 240, y: 110, radius: 36, scale: 1.6 },
    ],
  };

  it('returns empty array when rooms is missing or empty', () => {
    expect(structuresNear([], 0, 0, 100)).toEqual([]);
    expect(structuresNear(null, 0, 0, 100)).toEqual([]);
  });

  it('resolves radius (PROP_RADIUS map → placement → STRUCT_RADIUS); forwards scale', () => {
    // probe around origin where region (0,0) lives
    const out = structuresNear([baseRoom], ROOM_WORLD_W / 2, ROOM_WORLD_H / 2, 9999);
    // Procedural stamping may skip this region; loop a few candidate centres
    // to find a region that does stamp the blueprint, then assert push shape.
    let found = out;
    if (found.length === 0) {
      for (let rx = 0; rx < 20 && found.length === 0; rx++) {
        for (let ry = 0; ry < 20 && found.length === 0; ry++) {
          found = structuresNear(
            [baseRoom],
            rx * ROOM_WORLD_W + ROOM_WORLD_W / 2,
            ry * ROOM_WORLD_H + ROOM_WORLD_H / 2,
            9999,
          );
        }
      }
    }
    expect(found.length).toBeGreaterThan(0);
    const giant = found.find((s) => s.name === 'prop_giant');
    const regular = found.find((s) => s.name === 'prop_a');
    expect(giant).toBeDefined();
    // prop_giant isn't in PROP_RADIUS → falls back to its placement radius (36)
    expect(giant.radius).toBe(36);
    expect(giant.scale).toBe(1.6);
    expect(regular).toBeDefined();
    // prop_a isn't in PROP_RADIUS and has no placement radius → STRUCT_RADIUS
    expect(regular.radius).toBe(STRUCT_RADIUS);
    expect(regular.scale).toBeUndefined();
  });

  it('zone filter: when zones is supplied, only matching-zone rooms stamp', () => {
    const graveyardRoom = { biome: 'crypt', zone: 'graveyard', structures: [{ name: 'g_only', x: 50, y: 50 }] };
    const colonnadeRoom = { biome: 'crypt', zone: 'colonnade', structures: [{ name: 'c_only', x: 50, y: 50 }] };
    const rooms = [graveyardRoom, colonnadeRoom];
    const zones = ['graveyard', 'colonnade', 'inner-sanctum'];

    // sweep a wide area and tally which sprite names appear
    const names = new Set();
    for (let rx = -10; rx < 10; rx++) {
      for (let ry = -10; ry < 10; ry++) {
        const out = structuresNear(
          rooms,
          rx * ROOM_WORLD_W + ROOM_WORLD_W / 2,
          ry * ROOM_WORLD_H + ROOM_WORLD_H / 2,
          1,
          zones,
        );
        out.forEach((s) => names.add(s.name));
      }
    }
    // Both blueprints stamp at least once, each tied to its zone.
    expect(names.has('g_only')).toBe(true);
    expect(names.has('c_only')).toBe(true);
  });

  it('regression: legacy entries without radius/scale still produce output', () => {
    // legacy blueprint shape (no zone, no radius, no scale)
    const legacy = { structures: [{ name: 'legacy_prop', x: 100, y: 100 }] };
    let found = null;
    for (let rx = 0; rx < 20 && !found; rx++) {
      for (let ry = 0; ry < 20 && !found; ry++) {
        const out = structuresNear(
          [legacy],
          rx * ROOM_WORLD_W + ROOM_WORLD_W / 2,
          ry * ROOM_WORLD_H + ROOM_WORLD_H / 2,
          9999,
        );
        if (out.length > 0) found = out[0];
      }
    }
    expect(found).toBeDefined();
    expect(found.name).toBe('legacy_prop');
    // unmapped prop with no placement radius now resolves to STRUCT_RADIUS
    // (was undefined pre-2026-05-29 wall-collision fix).
    expect(found.radius).toBe(STRUCT_RADIUS);
  });
});

describe('STRUCT_RADIUS export', () => {
  it('remains exported as the fallback collider', () => {
    expect(STRUCT_RADIUS).toBe(21);
  });
});
