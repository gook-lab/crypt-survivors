// Procedural structure field — stamps the hand-designed room blueprints
// (content/rooms.js) across the open world. Each room-region deterministically
// picks one layout (or stays an open arena); both the renderer and the sim
// query the same function, so the drawn structures and their colliders match.

import { ROOM_W, ROOM_H } from '../content/rooms.js';

const ROOM_SCALE = 5; // design-grid unit -> world px (3 → 4 → 5; the user
                      // wanted regions closer to 2500px wide for a more
                      // Minecraft-like "광활한 동네" feel. 480 × 5 = 2400,
                      // just under the 2500 target. collision/decor/spawn
                      // invariants flow through the ROOM_WORLD_W/H exports.
export const ROOM_WORLD_W = ROOM_W * ROOM_SCALE; // 2400
export const ROOM_WORLD_H = ROOM_H * ROOM_SCALE; // 1350

// circular collider radius at a structure's base (it blocks movement)
export const STRUCT_RADIUS = 21;

// Per-prop-type collision radius (world px). Props render at sourcePx × 3 ×
// scale (~400px for a 96px wall prop, ~144px for a 48px prop), so the old
// flat ~21px collider let the player clip straight through the visible art.
// These radii are tuned to each prop's SOLID floor footprint so structures
// read as real walls — substantial props get big radii, thin/flat clutter
// stays small so it doesn't block empty floor. This map is the source of
// truth (overrides any per-placement `radius`). Player + enemies both use it.
const PROP_RADIUS = {
  // crypt — walls / landmarks
  prop_bookshelf_wall: 60, prop_reading_table: 50, prop_lectern: 30, prop_book_stack: 22,
  prop_giant_tombstone: 60, prop_broken_colonnade: 60, prop_altar_dark: 52,
  prop_castle_tower: 54, prop_well_hd: 34, prop_sarcophagus_hd: 36,
  prop_tombstone_hd: 30, prop_pillar_broken_hd: 28, prop_gargoyle_hd: 28,
  prop_candelabra: 15, prop_bone_pile_hd: 18, prop_stone_wall_hd: 40,
  // overgrown (구 forest)
  prop_giant_ancient_oak: 58, prop_mossy_shrine: 40, prop_forest_shrine_hd: 34,
  prop_dead_tree_hd: 26, prop_skull_totem: 28, prop_mushroom_hd: 18,
  // swamp
  prop_giant_mangrove: 54, prop_witch_cauldron: 32, prop_rotten_log: 30,
  // volcano
  prop_magma_vent: 38, prop_obsidian_obelisk: 36, prop_obsidian_pillar_hd: 30,
  prop_broken_brazier: 28, prop_fire_altar: 32, prop_lava_crack_hd: 16,
  // ice
  prop_ice_spike_cluster: 44, prop_mammoth_bones: 44, prop_ice_altar: 38,
  prop_frozen_statue_hd: 30, prop_ice_spike_hd: 24, prop_ice_crystal_hd: 26,
  // void
  prop_dimensional_rift: 34, prop_black_singularity: 42, prop_star_cluster: 18,
};
export function propRadius(name, fallback) {
  return PROP_RADIUS[name] ?? fallback ?? STRUCT_RADIUS;
}

// Zone for a given region (rx, ry). `clusterSize` regions share one zone, so
// the player stays in a single "동네" for clusterSize × ROOM_WORLD_W px before
// crossing into the next zone. Default 4 (~9600×5400 at SCALE 5). `zones` is
// passed in by the caller (maps.js → renderer/movement); empty or missing
// zones collapse to 'default' so other chapters keep working.
export function zoneAt(rx, ry, zones, clusterSize) {
  const list = (zones && zones.length > 0) ? zones : ['default'];
  const N = clusterSize && clusterSize > 0 ? clusterSize : 4;
  const cx = Math.floor(rx / N);
  const cy = Math.floor(ry / N);
  const cluster = ((cx * 374761393) ^ (cy * 668265263)) >>> 0;
  return list[cluster % list.length];
}

// The room layout stamped at room-region (rx, ry), or null for an open arena.
// When `zones` is supplied, the picked blueprint must match the region's zone;
// blueprints without an explicit `zone` field default to 'default'.
function roomAt(rx, ry, rooms, zones, clusterSize) {
  if (!rooms || rooms.length === 0) return null;
  const h = ((rx * 374761393) ^ (ry * 668265263)) >>> 0;
  if (h % 100 >= 72) return null; // ~28% of regions are open arenas
  let candidates = rooms;
  if (zones && zones.length > 0) {
    const zone = zoneAt(rx, ry, zones, clusterSize);
    candidates = rooms.filter((r) => (r.zone || 'default') === zone);
    if (candidates.length === 0) return null;
  }
  return candidates[(h >>> 7) % candidates.length];
}

// Every structure within `range` of (x, y), in world coords. Used by the
// renderer to draw props and by movement to resolve structure collision.
// `zones` is optional — if provided, the room blueprint is zone-filtered.
// `radius` and `scale` flow through from the source entry so callers can
// override the default STRUCT_RADIUS / TILE_SCALE on a per-prop basis.
//
// To kill the "same blueprint repeats verbatim across a zone" feel, two
// region-deterministic variations are applied:
//   1. ~25% of props are skipped per region (region hash mod 4 === 0)
//   2. ±12px position jitter per prop (region+prop hash)
// `s.fixed: true` opts a prop out of both — useful for the giant landmark
// at the centre of a blueprint, which should always stamp at its anchor.
export function structuresNear(rooms, x, y, range, zones, clusterSize) {
  const out = [];
  if (!rooms || rooms.length === 0) return out;
  const r0x = Math.floor((x - range) / ROOM_WORLD_W);
  const r1x = Math.floor((x + range) / ROOM_WORLD_W);
  const r0y = Math.floor((y - range) / ROOM_WORLD_H);
  const r1y = Math.floor((y + range) / ROOM_WORLD_H);
  for (let ry = r0y; ry <= r1y; ry++) {
    for (let rx = r0x; rx <= r1x; rx++) {
      const room = roomAt(rx, ry, rooms, zones, clusterSize);
      if (!room) continue;
      const ox = rx * ROOM_WORLD_W;
      const oy = ry * ROOM_WORLD_H;
      const regionHash = ((rx * 1597) ^ (ry * 9281)) >>> 0;
      for (let i = 0; i < room.structures.length; i++) {
        const s = room.structures[i];
        const isFixed = s.fixed === true;
        const propHash = (regionHash + i * 3041) >>> 0;
        // skip ~25% of non-fixed props per region for visual variety
        if (!isFixed && propHash % 4 === 0) continue;
        // ±12px jitter per non-fixed prop (collision + visual match)
        let dx = 0;
        let dy = 0;
        if (!isFixed) {
          const jx = (regionHash + i * 7919) >>> 0;
          const jy = (regionHash + i * 5413) >>> 0;
          dx = (jx % 25) - 12;
          dy = (jy % 25) - 12;
        }
        out.push({
          name: s.name,
          x: ox + s.x * ROOM_SCALE + dx,
          y: oy + s.y * ROOM_SCALE + dy,
          // PROP_RADIUS map is the source of truth so colliders match the
          // rendered art; per-placement `s.radius` is a last-resort fallback.
          radius: propRadius(s.name, s.radius),
          scale: s.scale,
        });
      }
    }
  }
  return out;
}
