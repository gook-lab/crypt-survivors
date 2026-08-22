// PixelLab structure / prop sprite registry. Maps prop sprite names
// (from content/rooms.js blueprint entries) to PNG URLs.
//
// Renderer's prop texture path (renderer.js updateProps): if a prop's sprite
// name is registered here, the PNG texture is used instead of the ASCII art.
// Falls back to spriteTexture() (window.SPRITES) when null is returned.
//
// Phase 1: zone landmark props for Ch.1 던전. Other chapters' landmarks
// register the same way (download → register here → renderer auto-picks).

export const STRUCTURE_ASSETS = {
  // ── Ch.1 dungeon — zone landmarks (96×96) + base props (48-64) ─────────
  prop_giant_tombstone: '/structures/prop_giant_tombstone.png',
  prop_broken_colonnade: '/structures/prop_broken_colonnade.png',
  prop_altar_dark: '/structures/prop_altar_dark.png',
  prop_tombstone_hd: '/structures/prop_tombstone_hd.png',
  prop_gargoyle_hd: '/structures/prop_gargoyle_hd.png',
  prop_candelabra: '/structures/prop_candelabra.png',
  prop_pillar_broken_hd: '/structures/prop_pillar_broken_hd.png',
  prop_sarcophagus_hd: '/structures/prop_sarcophagus_hd.png',
  prop_well_hd: '/structures/prop_well_hd.png',
  prop_bone_pile_hd: '/structures/prop_bone_pile_hd.png',
  prop_castle_tower: '/structures/prop_castle_tower.png',
  // Inlaid-Library nook props (Workstream C) — colonnade zone "great archive".
  // Bookshelf walls form partial enclosures; table/lectern/books fill the nook.
  prop_bookshelf_wall: '/structures/prop_bookshelf_wall.png',
  prop_reading_table: '/structures/prop_reading_table.png',
  prop_lectern: '/structures/prop_lectern.png',
  prop_book_stack: '/structures/prop_book_stack.png',
  // ── Ch.2 forest — old-grove / mossy-ruins / wolf-den ────────────────────
  prop_giant_ancient_oak: '/structures/prop_giant_ancient_oak.png',
  prop_mossy_shrine: '/structures/prop_mossy_shrine.png',
  prop_skull_totem: '/structures/prop_skull_totem.png',
  // ── Ch.3 swamp — mire / rot-pool / witch-grove ──────────────────────────
  prop_giant_mangrove: '/structures/prop_giant_mangrove.png',
  prop_rotten_log: '/structures/prop_rotten_log.png',
  prop_witch_cauldron: '/structures/prop_witch_cauldron.png',
  // ── Ch.4 volcano — lava-flow / ash-plain / forge-ruin ───────────────────
  prop_magma_vent: '/structures/prop_magma_vent.png',
  prop_obsidian_obelisk: '/structures/prop_obsidian_obelisk.png',
  prop_broken_brazier: '/structures/prop_broken_brazier.png',
  // ── Ch.5 ice — frost-cavern / glacier / frozen-shrine ───────────────────
  prop_ice_spike_cluster: '/structures/prop_ice_spike_cluster.png',
  prop_mammoth_bones: '/structures/prop_mammoth_bones.png',
  prop_ice_altar: '/structures/prop_ice_altar.png',
  // ── Ch.6 void — rift / nebula / singularity ─────────────────────────────
  prop_dimensional_rift: '/structures/prop_dimensional_rift.png',
  prop_star_cluster: '/structures/prop_star_cluster.png',
  prop_black_singularity: '/structures/prop_black_singularity.png',
  // ── Ch.2 forest base props ──────────────────────────────────────────────
  prop_dead_tree_hd: '/structures/prop_dead_tree_hd.png',
  prop_mushroom_hd: '/structures/prop_mushroom_hd.png',
  prop_stone_wall_hd: '/structures/prop_stone_wall_hd.png',
  prop_forest_shrine_hd: '/structures/prop_forest_shrine_hd.png',
  // ── Ch.4 volcano base props ─────────────────────────────────────────────
  prop_obsidian_pillar_hd: '/structures/prop_obsidian_pillar_hd.png',
  prop_fire_altar: '/structures/prop_fire_altar.png',
  prop_lava_crack_hd: '/structures/prop_lava_crack_hd.png',
  // ── Ch.5 ice base props ─────────────────────────────────────────────────
  prop_ice_spike_hd: '/structures/prop_ice_spike_hd.png',
  prop_frozen_statue_hd: '/structures/prop_frozen_statue_hd.png',
  prop_ice_crystal_hd: '/structures/prop_ice_crystal_hd.png',
};

export function structureAssetUrl(spriteName) {
  return STRUCTURE_ASSETS[spriteName] || null;
}
