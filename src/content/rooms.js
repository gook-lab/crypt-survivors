// Room blueprints — structure-placement templates ported from the share's
// ROOM_LAYOUTS. Each room is laid out on a 480×270 design grid; the structure
// field (util/structureField.js) stamps one room per room-region across the
// open world, so structures form deliberate hand-designed formations instead
// of a uniform scatter.
//
// Only the `structures` are kept (pickups / spawn-zones / exits from the
// original blueprints are not relevant to the open-field sim).

export const ROOM_W = 480; // design-grid dimensions
export const ROOM_H = 270;

export const ROOM_LAYOUTS = [
  // ── crypt — zones: graveyard / colonnade / inner-sanctum ─────────────────
  // structureField.roomAt picks a blueprint whose `zone` matches the region's
  // zone (zoneAt 4×4 region clusters). Each zone has THREE blueprints — two
  // landmark variants and one "no landmark" variant — so the same zone
  // shows different scenery as the player crosses regions. structuresNear
  // also adds per-region prop-skip (~25%) and ±12px jitter, so even the
  // same blueprint never repeats verbatim. `fixed: true` opts the giant
  // landmark out of skip/jitter so it always stamps at its anchor.

  // graveyard — 1 landmark + 3 plain variants (~25% region show the landmark)
  {
    biome: 'crypt',
    zone: 'graveyard',
    structures: [
      { name: 'prop_giant_tombstone', x: 240, y: 110, radius: 24, scale: 1.6, fixed: true },
      { name: 'prop_tombstone_hd', x: 80, y: 220 },
      { name: 'prop_tombstone_hd', x: 400, y: 220 },
      { name: 'prop_candelabra', x: 140, y: 95 },
      { name: 'prop_candelabra', x: 340, y: 95 },
    ],
  },
  {
    biome: 'crypt',
    zone: 'graveyard',
    structures: [
      { name: 'prop_tombstone_hd', x: 80, y: 130 },
      { name: 'prop_tombstone_hd', x: 160, y: 100 },
      { name: 'prop_tombstone_hd', x: 320, y: 120 },
      { name: 'prop_tombstone_hd', x: 400, y: 95 },
      { name: 'prop_tombstone_hd', x: 110, y: 230 },
      { name: 'prop_tombstone_hd', x: 380, y: 235 },
      { name: 'prop_candelabra', x: 240, y: 90 },
    ],
  },
  {
    biome: 'crypt',
    zone: 'graveyard',
    structures: [
      { name: 'prop_tombstone_hd', x: 90, y: 110 },
      { name: 'prop_tombstone_hd', x: 220, y: 130 },
      { name: 'prop_tombstone_hd', x: 380, y: 110 },
      { name: 'prop_gargoyle_hd', x: 60, y: 240 },
      { name: 'prop_gargoyle_hd', x: 420, y: 240 },
      { name: 'prop_candelabra', x: 240, y: 230 },
    ],
  },
  {
    biome: 'crypt',
    zone: 'graveyard',
    structures: [
      { name: 'prop_tombstone_hd', x: 130, y: 90 },
      { name: 'prop_tombstone_hd', x: 200, y: 100 },
      { name: 'prop_tombstone_hd', x: 290, y: 105 },
      { name: 'prop_tombstone_hd', x: 360, y: 90 },
      { name: 'prop_tombstone_hd', x: 240, y: 230 },
      { name: 'prop_candelabra', x: 100, y: 240 },
      { name: 'prop_candelabra', x: 380, y: 240 },
    ],
  },

  // inner-sanctum — 1 landmark + 3 plain variants
  {
    biome: 'crypt',
    zone: 'inner-sanctum',
    structures: [
      { name: 'prop_altar_dark', x: 240, y: 135, radius: 24, scale: 1.6, fixed: true },
      { name: 'prop_sarcophagus_hd', x: 100, y: 220 },
      { name: 'prop_sarcophagus_hd', x: 380, y: 220 },
      { name: 'prop_candelabra', x: 100, y: 80 },
      { name: 'prop_candelabra', x: 380, y: 80 },
      { name: 'prop_bone_pile_hd', x: 240, y: 235 },
    ],
  },
  {
    biome: 'crypt',
    zone: 'inner-sanctum',
    structures: [
      { name: 'prop_sarcophagus_hd', x: 90, y: 130 },
      { name: 'prop_sarcophagus_hd', x: 240, y: 130 },
      { name: 'prop_sarcophagus_hd', x: 390, y: 130 },
      { name: 'prop_bone_pile_hd', x: 150, y: 230 },
      { name: 'prop_bone_pile_hd', x: 330, y: 230 },
      { name: 'prop_candelabra', x: 80, y: 235 },
      { name: 'prop_candelabra', x: 400, y: 235 },
    ],
  },
  {
    biome: 'crypt',
    zone: 'inner-sanctum',
    structures: [
      { name: 'prop_well_hd', x: 240, y: 100 },
      { name: 'prop_sarcophagus_hd', x: 130, y: 220 },
      { name: 'prop_sarcophagus_hd', x: 350, y: 220 },
      { name: 'prop_bone_pile_hd', x: 220, y: 240 },
      { name: 'prop_bone_pile_hd', x: 280, y: 240 },
      { name: 'prop_candelabra', x: 60, y: 130 },
      { name: 'prop_candelabra', x: 420, y: 130 },
    ],
  },
  {
    biome: 'crypt',
    zone: 'inner-sanctum',
    structures: [
      { name: 'prop_bone_pile_hd', x: 100, y: 120 },
      { name: 'prop_bone_pile_hd', x: 240, y: 100 },
      { name: 'prop_bone_pile_hd', x: 380, y: 120 },
      { name: 'prop_bone_pile_hd', x: 160, y: 240 },
      { name: 'prop_bone_pile_hd', x: 320, y: 240 },
      { name: 'prop_candelabra', x: 240, y: 230 },
    ],
  },

  // colonnade — 1 landmark + 3 plain variants
  {
    biome: 'crypt',
    zone: 'colonnade',
    structures: [
      { name: 'prop_broken_colonnade', x: 240, y: 135, radius: 24, scale: 1.6, fixed: true },
      { name: 'prop_pillar_broken_hd', x: 80, y: 250 },
      { name: 'prop_pillar_broken_hd', x: 400, y: 250 },
      { name: 'prop_bone_pile_hd', x: 200, y: 200 },
      { name: 'prop_bone_pile_hd', x: 280, y: 200 },
      { name: 'prop_gargoyle_hd', x: 240, y: 90 },
    ],
  },
  {
    biome: 'crypt',
    zone: 'colonnade',
    structures: [
      { name: 'prop_pillar_broken_hd', x: 60, y: 110 },
      { name: 'prop_pillar_broken_hd', x: 160, y: 110 },
      { name: 'prop_pillar_broken_hd', x: 320, y: 110 },
      { name: 'prop_pillar_broken_hd', x: 420, y: 110 },
      { name: 'prop_pillar_broken_hd', x: 60, y: 250 },
      { name: 'prop_pillar_broken_hd', x: 160, y: 250 },
      { name: 'prop_pillar_broken_hd', x: 320, y: 250 },
      { name: 'prop_pillar_broken_hd', x: 420, y: 250 },
      { name: 'prop_bone_pile_hd', x: 240, y: 180 },
    ],
  },
  {
    biome: 'crypt',
    zone: 'colonnade',
    structures: [
      { name: 'prop_pillar_broken_hd', x: 100, y: 130 },
      { name: 'prop_pillar_broken_hd', x: 240, y: 110 },
      { name: 'prop_pillar_broken_hd', x: 380, y: 130 },
      { name: 'prop_gargoyle_hd', x: 60, y: 240 },
      { name: 'prop_gargoyle_hd', x: 420, y: 240 },
      { name: 'prop_candelabra', x: 240, y: 240 },
    ],
  },
  {
    biome: 'crypt',
    zone: 'colonnade',
    structures: [
      { name: 'prop_pillar_broken_hd', x: 90, y: 90 },
      { name: 'prop_pillar_broken_hd', x: 200, y: 110 },
      { name: 'prop_pillar_broken_hd', x: 290, y: 110 },
      { name: 'prop_pillar_broken_hd', x: 400, y: 90 },
      { name: 'prop_bone_pile_hd', x: 150, y: 240 },
      { name: 'prop_bone_pile_hd', x: 330, y: 240 },
      { name: 'prop_candelabra', x: 240, y: 200 },
    ],
  },
  // colonnade "great archive" — Inlaid-Library nook (Workstream C). Bookshelf
  // walls form PARTIAL enclosures (always ≥2 open sides) so they give cover +
  // identity without cornering the player in a kiting auto-battler. The reading
  // table is the fixed centerpiece; lecterns + book stacks fill the nook.
  {
    biome: 'crypt',
    zone: 'colonnade',
    structures: [
      // reading gallery: bookshelf back wall (top) + table centre, open bottom
      { name: 'prop_reading_table', x: 240, y: 140, radius: 22, scale: 1.2, fixed: true },
      { name: 'prop_bookshelf_wall', x: 120, y: 50, radius: 26, scale: 1.4 },
      { name: 'prop_bookshelf_wall', x: 240, y: 45, radius: 26, scale: 1.4 },
      { name: 'prop_bookshelf_wall', x: 360, y: 50, radius: 26, scale: 1.4 },
      { name: 'prop_lectern', x: 150, y: 118, radius: 15, scale: 1.0 },
      { name: 'prop_lectern', x: 330, y: 118, radius: 15, scale: 1.0 },
      { name: 'prop_book_stack', x: 200, y: 205, radius: 13, scale: 0.85 },
      { name: 'prop_book_stack', x: 300, y: 200, radius: 13, scale: 0.85 },
    ],
  },
  {
    biome: 'crypt',
    zone: 'colonnade',
    structures: [
      // stacks corridor: two vertical bookshelf columns channel movement
      // through a walkable centre gap (x≈240). Top + bottom fully open.
      { name: 'prop_bookshelf_wall', x: 140, y: 90, radius: 26, scale: 1.4 },
      { name: 'prop_bookshelf_wall', x: 140, y: 180, radius: 26, scale: 1.4 },
      { name: 'prop_bookshelf_wall', x: 340, y: 90, radius: 26, scale: 1.4 },
      { name: 'prop_bookshelf_wall', x: 340, y: 180, radius: 26, scale: 1.4 },
      { name: 'prop_lectern', x: 240, y: 135, radius: 15, scale: 1.0 },
      { name: 'prop_book_stack', x: 240, y: 55, radius: 13, scale: 0.85 },
      { name: 'prop_book_stack', x: 240, y: 215, radius: 13, scale: 0.85 },
    ],
  },
  // ── crypt "overgrown" (이끼 정원) — 구 forest 흡수: 고목/버섯/이끼 사당 ────
  {
    biome: 'crypt',
    zone: 'overgrown',
    structures: [
      { name: 'prop_giant_ancient_oak', x: 240, y: 130, radius: 24, scale: 1.6, fixed: true },
      { name: 'prop_dead_tree_hd', x: 80, y: 230 },
      { name: 'prop_dead_tree_hd', x: 400, y: 230 },
      { name: 'prop_mushroom_hd', x: 150, y: 240 },
      { name: 'prop_mushroom_hd', x: 330, y: 240 },
    ],
  },
  {
    biome: 'crypt',
    zone: 'overgrown',
    structures: [
      { name: 'prop_dead_tree_hd', x: 60, y: 230 },
      { name: 'prop_dead_tree_hd', x: 420, y: 230 },
      { name: 'prop_dead_tree_hd', x: 240, y: 120 },
      { name: 'prop_mushroom_hd', x: 120, y: 220 },
      { name: 'prop_mushroom_hd', x: 180, y: 240 },
      { name: 'prop_mushroom_hd', x: 320, y: 240 },
    ],
  },
  {
    biome: 'crypt',
    zone: 'overgrown',
    structures: [
      { name: 'prop_mossy_shrine', x: 240, y: 135, radius: 24, scale: 1.6, fixed: true },
      { name: 'prop_stone_wall_hd', x: 80, y: 240 },
      { name: 'prop_stone_wall_hd', x: 400, y: 240 },
      { name: 'prop_dead_tree_hd', x: 130, y: 100 },
      { name: 'prop_dead_tree_hd', x: 350, y: 100 },
    ],
  },
  {
    biome: 'crypt',
    zone: 'overgrown',
    structures: [
      { name: 'prop_forest_shrine_hd', x: 240, y: 130 },
      { name: 'prop_stone_wall_hd', x: 60, y: 90 },
      { name: 'prop_stone_wall_hd', x: 420, y: 90 },
      { name: 'prop_stone_wall_hd', x: 60, y: 240 },
      { name: 'prop_stone_wall_hd', x: 420, y: 240 },
      { name: 'prop_mushroom_hd', x: 200, y: 210 },
      { name: 'prop_mushroom_hd', x: 280, y: 210 },
    ],
  },
  {
    biome: 'crypt',
    zone: 'overgrown',
    structures: [
      { name: 'prop_skull_totem', x: 240, y: 135, radius: 24, scale: 1.6, fixed: true },
      { name: 'prop_dead_tree_hd', x: 80, y: 220 },
      { name: 'prop_dead_tree_hd', x: 400, y: 220 },
      { name: 'prop_bone_pile_hd', x: 150, y: 240 },
      { name: 'prop_bone_pile_hd', x: 330, y: 240 },
    ],
  },
  {
    biome: 'crypt',
    zone: 'overgrown',
    structures: [
      { name: 'prop_bone_pile_hd', x: 120, y: 130 },
      { name: 'prop_bone_pile_hd', x: 240, y: 110 },
      { name: 'prop_bone_pile_hd', x: 360, y: 130 },
      { name: 'prop_dead_tree_hd', x: 80, y: 240 },
      { name: 'prop_dead_tree_hd', x: 400, y: 240 },
    ],
  },

  // ── swamp — mire / rot-pool / witch-grove ───────────────────────────────
  {
    biome: 'swamp',
    zone: 'mire',
    structures: [
      { name: 'prop_giant_mangrove', x: 240, y: 130, radius: 24, scale: 1.6, fixed: true },
      { name: 'prop_dead_tree_hd', x: 80, y: 220 },
      { name: 'prop_dead_tree_hd', x: 400, y: 220 },
      { name: 'prop_mushroom_hd', x: 130, y: 240 },
      { name: 'prop_mushroom_hd', x: 350, y: 240 },
    ],
  },
  {
    biome: 'swamp',
    zone: 'mire',
    structures: [
      { name: 'prop_dead_tree_hd', x: 100, y: 120 },
      { name: 'prop_dead_tree_hd', x: 240, y: 100 },
      { name: 'prop_dead_tree_hd', x: 380, y: 120 },
      { name: 'prop_mushroom_hd', x: 160, y: 240 },
      { name: 'prop_mushroom_hd', x: 320, y: 240 },
    ],
  },
  {
    biome: 'swamp',
    zone: 'rot-pool',
    structures: [
      { name: 'prop_rotten_log', x: 240, y: 135, radius: 24, scale: 1.6, fixed: true },
      { name: 'prop_mushroom_hd', x: 100, y: 220 },
      { name: 'prop_mushroom_hd', x: 380, y: 220 },
      { name: 'prop_bone_pile_hd', x: 160, y: 100 },
      { name: 'prop_bone_pile_hd', x: 320, y: 100 },
    ],
  },
  {
    biome: 'swamp',
    zone: 'rot-pool',
    structures: [
      { name: 'prop_mushroom_hd', x: 100, y: 120 },
      { name: 'prop_mushroom_hd', x: 180, y: 100 },
      { name: 'prop_mushroom_hd', x: 300, y: 100 },
      { name: 'prop_mushroom_hd', x: 380, y: 120 },
      { name: 'prop_bone_pile_hd', x: 240, y: 230 },
    ],
  },
  {
    biome: 'swamp',
    zone: 'witch-grove',
    structures: [
      { name: 'prop_witch_cauldron', x: 240, y: 135, radius: 24, scale: 1.6, fixed: true },
      { name: 'prop_dead_tree_hd', x: 80, y: 220 },
      { name: 'prop_dead_tree_hd', x: 400, y: 220 },
      { name: 'prop_candelabra', x: 130, y: 95 },
      { name: 'prop_candelabra', x: 350, y: 95 },
    ],
  },
  {
    biome: 'swamp',
    zone: 'witch-grove',
    structures: [
      { name: 'prop_candelabra', x: 100, y: 130 },
      { name: 'prop_candelabra', x: 380, y: 130 },
      { name: 'prop_bone_pile_hd', x: 200, y: 110 },
      { name: 'prop_bone_pile_hd', x: 280, y: 110 },
      { name: 'prop_mushroom_hd', x: 240, y: 230 },
    ],
  },

  // ── volcano — lava-flow / ash-plain / forge-ruin ────────────────────────
  {
    biome: 'volcano',
    zone: 'lava-flow',
    structures: [
      { name: 'prop_magma_vent', x: 240, y: 135, radius: 22, scale: 1.3, fixed: true },
      { name: 'prop_lava_crack_hd', x: 100, y: 220 },
      { name: 'prop_lava_crack_hd', x: 380, y: 220 },
      { name: 'prop_obsidian_pillar_hd', x: 80, y: 100 },
      { name: 'prop_obsidian_pillar_hd', x: 400, y: 100 },
    ],
  },
  {
    biome: 'volcano',
    zone: 'lava-flow',
    structures: [
      { name: 'prop_lava_crack_hd', x: 120, y: 90 },
      { name: 'prop_lava_crack_hd', x: 240, y: 110 },
      { name: 'prop_lava_crack_hd', x: 360, y: 90 },
      { name: 'prop_bone_pile_hd', x: 100, y: 240 },
      { name: 'prop_bone_pile_hd', x: 380, y: 240 },
    ],
  },
  {
    biome: 'volcano',
    zone: 'ash-plain',
    structures: [
      { name: 'prop_obsidian_obelisk', x: 240, y: 130, radius: 22, scale: 1.3, fixed: true },
      { name: 'prop_obsidian_pillar_hd', x: 100, y: 220 },
      { name: 'prop_obsidian_pillar_hd', x: 380, y: 220 },
      { name: 'prop_bone_pile_hd', x: 150, y: 100 },
      { name: 'prop_bone_pile_hd', x: 330, y: 100 },
    ],
  },
  {
    biome: 'volcano',
    zone: 'ash-plain',
    structures: [
      { name: 'prop_obsidian_pillar_hd', x: 60, y: 250 },
      { name: 'prop_obsidian_pillar_hd', x: 200, y: 250 },
      { name: 'prop_obsidian_pillar_hd', x: 280, y: 250 },
      { name: 'prop_obsidian_pillar_hd', x: 420, y: 250 },
      { name: 'prop_bone_pile_hd', x: 240, y: 130 },
    ],
  },
  {
    biome: 'volcano',
    zone: 'forge-ruin',
    structures: [
      { name: 'prop_broken_brazier', x: 240, y: 135, radius: 22, scale: 1.3, fixed: true },
      { name: 'prop_fire_altar', x: 100, y: 220 },
      { name: 'prop_fire_altar', x: 380, y: 220 },
      { name: 'prop_obsidian_pillar_hd', x: 80, y: 100 },
      { name: 'prop_obsidian_pillar_hd', x: 400, y: 100 },
    ],
  },
  {
    biome: 'volcano',
    zone: 'forge-ruin',
    structures: [
      { name: 'prop_fire_altar', x: 240, y: 130 },
      { name: 'prop_obsidian_pillar_hd', x: 60, y: 250 },
      { name: 'prop_obsidian_pillar_hd', x: 420, y: 250 },
      { name: 'prop_lava_crack_hd', x: 120, y: 90 },
      { name: 'prop_lava_crack_hd', x: 360, y: 90 },
    ],
  },

  // ── ice — frost-cavern / glacier / frozen-shrine ────────────────────────
  {
    biome: 'ice',
    zone: 'frost-cavern',
    structures: [
      { name: 'prop_ice_spike_cluster', x: 240, y: 135, radius: 24, scale: 1.6, fixed: true },
      { name: 'prop_ice_spike_hd', x: 80, y: 220 },
      { name: 'prop_ice_spike_hd', x: 400, y: 220 },
      { name: 'prop_ice_crystal_hd', x: 130, y: 100 },
      { name: 'prop_ice_crystal_hd', x: 350, y: 100 },
    ],
  },
  {
    biome: 'ice',
    zone: 'frost-cavern',
    structures: [
      { name: 'prop_ice_spike_hd', x: 60, y: 240 },
      { name: 'prop_ice_spike_hd', x: 420, y: 240 },
      { name: 'prop_ice_spike_hd', x: 120, y: 100 },
      { name: 'prop_ice_spike_hd', x: 360, y: 100 },
      { name: 'prop_ice_crystal_hd', x: 240, y: 170 },
    ],
  },
  {
    biome: 'ice',
    zone: 'glacier',
    structures: [
      { name: 'prop_mammoth_bones', x: 240, y: 135, radius: 24, scale: 1.6, fixed: true },
      { name: 'prop_ice_crystal_hd', x: 100, y: 220 },
      { name: 'prop_ice_crystal_hd', x: 380, y: 220 },
      { name: 'prop_ice_spike_hd', x: 80, y: 100 },
      { name: 'prop_ice_spike_hd', x: 400, y: 100 },
    ],
  },
  {
    biome: 'ice',
    zone: 'glacier',
    structures: [
      { name: 'prop_frozen_statue_hd', x: 100, y: 230 },
      { name: 'prop_frozen_statue_hd', x: 380, y: 230 },
      { name: 'prop_ice_crystal_hd', x: 240, y: 90 },
      { name: 'prop_ice_spike_hd', x: 160, y: 160 },
      { name: 'prop_ice_spike_hd', x: 320, y: 160 },
    ],
  },
  {
    biome: 'ice',
    zone: 'frozen-shrine',
    structures: [
      { name: 'prop_ice_altar', x: 240, y: 135, radius: 24, scale: 1.6, fixed: true },
      { name: 'prop_frozen_statue_hd', x: 100, y: 220 },
      { name: 'prop_frozen_statue_hd', x: 380, y: 220 },
      { name: 'prop_ice_crystal_hd', x: 130, y: 100 },
      { name: 'prop_ice_crystal_hd', x: 350, y: 100 },
    ],
  },
  {
    biome: 'ice',
    zone: 'frozen-shrine',
    structures: [
      { name: 'prop_frozen_statue_hd', x: 240, y: 130 },
      { name: 'prop_ice_crystal_hd', x: 100, y: 220 },
      { name: 'prop_ice_crystal_hd', x: 380, y: 220 },
      { name: 'prop_ice_spike_hd', x: 60, y: 100 },
      { name: 'prop_ice_spike_hd', x: 420, y: 100 },
    ],
  },

  // ── void — rift / nebula / singularity ──────────────────────────────────
  // Void is intentionally sparse — only the giant landmark per zone, no
  // base props. The cosmic emptiness is part of the chapter identity.
  {
    biome: 'void',
    zone: 'rift',
    structures: [
      { name: 'prop_dimensional_rift', x: 240, y: 135, radius: 28, scale: 2.4, fixed: true },
    ],
  },
  {
    biome: 'void',
    zone: 'rift',
    structures: [], // open void — emptiness pull
  },
  {
    biome: 'void',
    zone: 'nebula',
    structures: [
      { name: 'prop_star_cluster', x: 240, y: 135, radius: 12, scale: 2.4, fixed: true },
    ],
  },
  {
    biome: 'void',
    zone: 'nebula',
    structures: [],
  },
  {
    biome: 'void',
    zone: 'singularity',
    structures: [
      { name: 'prop_black_singularity', x: 240, y: 135, radius: 28, scale: 2.4, fixed: true },
    ],
  },
  {
    biome: 'void',
    zone: 'singularity',
    structures: [],
  },

  // ── "full package" nook blueprints (bands+variety 보강과 짝) — 각 바이옴의
  // 기존 prop으로 partial enclosure(≥2면 개방, kiting 가드레일 준수). ────────
  {
    // swamp 마녀 제단 nook — 가마솥 중심 + 맹그로브가 뒤·옆 partial wall
    biome: 'swamp', zone: 'witch-grove',
    structures: [
      { name: 'prop_witch_cauldron', x: 240, y: 150, radius: 20, scale: 1.3, fixed: true },
      { name: 'prop_giant_mangrove', x: 110, y: 70, radius: 26, scale: 1.3 },
      { name: 'prop_giant_mangrove', x: 370, y: 70, radius: 26, scale: 1.3 },
      { name: 'prop_rotten_log', x: 160, y: 210 },
      { name: 'prop_rotten_log', x: 320, y: 210 },
    ],
  },
  {
    // volcano 대장간 nook — 화로 중심 + 흑요석 기둥이 좌우 통로벽
    biome: 'volcano', zone: 'forge-ruin',
    structures: [
      { name: 'prop_broken_brazier', x: 240, y: 150, radius: 18, scale: 1.2, fixed: true },
      { name: 'prop_obsidian_pillar_hd', x: 120, y: 80, radius: 22, scale: 1.2 },
      { name: 'prop_obsidian_pillar_hd', x: 120, y: 200, radius: 22, scale: 1.2 },
      { name: 'prop_obsidian_pillar_hd', x: 360, y: 80, radius: 22, scale: 1.2 },
      { name: 'prop_obsidian_pillar_hd', x: 360, y: 200, radius: 22, scale: 1.2 },
      { name: 'prop_obsidian_obelisk', x: 240, y: 60, radius: 18, scale: 1.1 },
    ],
  },
  {
    // ice 얼음 제단 nook — 제단 중심 + 얼음 가시 군집이 뒤벽, 하단 개방
    biome: 'ice', zone: 'frozen-shrine',
    structures: [
      { name: 'prop_ice_altar', x: 240, y: 150, radius: 20, scale: 1.3, fixed: true },
      { name: 'prop_ice_spike_cluster', x: 120, y: 70, radius: 24, scale: 1.2 },
      { name: 'prop_ice_spike_cluster', x: 360, y: 70, radius: 24, scale: 1.2 },
      { name: 'prop_frozen_statue_hd', x: 150, y: 120 },
      { name: 'prop_frozen_statue_hd', x: 330, y: 120 },
      { name: 'prop_ice_crystal_hd', x: 240, y: 215 },
    ],
  },
  {
    // void 별무리 nook — 가벼운 배치(공허는 비움이 정체성), 성단 둘 + 균열
    biome: 'void', zone: 'nebula',
    structures: [
      { name: 'prop_dimensional_rift', x: 240, y: 130, radius: 26, scale: 2.0, fixed: true },
      { name: 'prop_star_cluster', x: 110, y: 210, radius: 12, scale: 1.6 },
      { name: 'prop_star_cluster', x: 380, y: 80, radius: 12, scale: 1.6 },
    ],
  },
];

// rooms for a biome (the structure field picks among these per room-region)
export function roomsForBiome(biome) {
  return ROOM_LAYOUTS.filter((r) => r.biome === biome);
}
