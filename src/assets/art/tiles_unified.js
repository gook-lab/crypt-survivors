// Unified floor tile sets — themed groups designed to tile together
// cleanly. Each set has:
//   - base: the main repeating tile (used 80%+)
//   - variant: secondary tile that fits the same grid (~15%)
//   - accent: rare decorative tile (~5%, like a flower or rune)
//   - border_h / border_v: edge tiles for walls / hallways
//
// Goal: instead of random mixing 6 tiles that creates visual noise,
// use ~3 tiles that share rhythm and color palette so the floor looks
// like one continuous surface with subtle variation.

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }

  // ============================================================
  // CRYPT · Polished gray cobblestone (uniform 4×4 grid)
  // ============================================================
  // Base: tight 4×4 cobbles with thin dark mortar — same color values
  // across all variants so it reads as ONE floor.
  const CRYPT_STONE_BASE = pad([
    '5555155551555515',
    '5555155551555515',
    '5455145551545515',  // subtle highlights
    '5555155551555515',
    '1111111111111111',  // horizontal mortar
    '5555155551555515',
    '5555155551555515',
    '5555155551545515',
    '5555155551555515',
    '1111111111111111',
    '5555154551555515',
    '5555155551555515',
    '5455155551555515',
    '5555155551555515',
    '1111111111111111',
    '5555155551555515',
  ], 16);

  // Variant — exact same grid, different highlight cells (avoids tiling lines)
  const CRYPT_STONE_VAR = pad([
    '5455155551545515',
    '5555155551555515',
    '5555145551555515',
    '5455155551555515',
    '1111111111111111',
    '5555155551555515',
    '5555155451555515',
    '5555155551555415',
    '5555155551555515',
    '1111111111111111',
    '5555155551555515',
    '5455155551545515',
    '5555155451555515',
    '5555155551555515',
    '1111111111111111',
    '5555155551555515',
  ], 16);

  // Accent — single small detail (skull / rune / drain)
  const CRYPT_STONE_ACC_SKULL = pad([
    '5555155551555515',
    '5555155551555515',
    '5555155551555515',
    '5555155551555515',
    '1111111111111111',
    '5555155551555515',
    '5555677776555515',  // small skull
    '5555670076555515',
    '5555677776555515',
    '1111155551111115',  // mortar around
    '5555155551555515',
    '5555155551555515',
    '5555155551555515',
    '5555155551555515',
    '1111111111111111',
    '5555155551555515',
  ], 16);

  // ============================================================
  // CRYPT · Ornate carpet runner (red carpet center, stone edges)
  // ============================================================
  // For boss arenas / sanctums. Two pieces: center, edge.
  const CRYPT_CARPET_CENTER = pad([
    'rRRRRRRRRRRRRRRr',
    'RYRrRrRrRrRrRrRY',
    'RrRrRrRrRrRrRrRr',
    'RYRrRRRRRRRRrRrY',  // diamond start
    'RrRrRYYYY9YYrRrR',
    'RrRrRY9889889YrR',  // gold diamond
    'RrRrRY9889889YrR',
    'RrRrRYYYY9YYrRrR',
    'RrRrRrRrRrRrRrRr',
    'RYRrRrRrRrRrRrRY',
    'RrRrRrRrRrRrRrRr',
    'RYRrRrRrRrRrRrRY',
    'RrRrRrRrRrRrRrRr',
    'RYRrRrRrRrRrRrRY',
    'RrRrRrRrRrRrRrRr',
    'rRRRRRRRRRRRRRRr',
  ], 16);

  // Carpet edge — left side (carpet runs east)
  const CRYPT_CARPET_EDGE_L = pad([
    '5555155551rrrrrr',
    '5555155551RrRrRr',
    '5455155551RrRrRr',
    '5555155551RYRrRr',
    '1111111111RrRrRr',
    '5555155551RrRrRr',
    '5555155551RYRrRr',
    '5555155551RrRrRr',
    '5555155551RrRrRr',
    '1111111111RYRrRr',
    '5455155551RrRrRr',
    '5555155551RrRrRr',
    '5555155551RYRrRr',
    '5555155551RrRrRr',
    '1111111111RrRrRr',
    '5555155551rrrrrr',
  ], 16);

  // ============================================================
  // FOREST · Mossy stone path (cohesive earthy palette)
  // ============================================================
  const FOREST_PATH_BASE = pad([
    'bbcbbcbbcbbcbbcb',
    'cbbbcbbbcbbbcbbb',
    'bccbbccbbccbbccb',
    'cbbbcbbbcbbbcbbb',
    'bbcbbcbbcbbcbbcb',
    'cbcbcbcbcbcbcbcb',  // path stones
    'bbcbbcbbcbbcbbcb',
    'cbbbcbbbcbbbcbbb',
    'bccbbccbbccbbccb',
    'cbbbcbbbcbbbcbbb',
    'bbcbbcbbcbbcbbcb',
    'cbcbcbcbcbcbcbcb',
    'bbcbbcbbcbbcbbcb',
    'cbbbcbbbcbbbcbbb',
    'bccbbccbbccbbccb',
    'cbbbcbbbcbbbcbbb',
  ], 16);

  const FOREST_PATH_MOSS = pad([
    'bbcbbcbbcbbcbbcb',
    'cbbbcbbbcbbbcbbb',
    'bccbbghhgccbbccb',  // moss patch
    'cbbbcghhgbbcbbbb',
    'bbcbbghhgbcbbcbb',
    'cbcbcgGGgcbcbcbc',
    'bbcbbghhgbbcbbcb',
    'cbbbcbbbcbbbcbbb',
    'bccbbccbbccbbccb',
    'cbbbcbbbcbbbcbbb',
    'bbcbbcbbcbbcbbcb',
    'cbcbcbcbcbcbcbcb',
    'bbcbbcbbcbbcbbcb',
    'cbbbcbbbcbbbcbbb',
    'bccbbccbbccbbccb',
    'cbbbcbbbcbbbcbbb',
  ], 16);

  // Forest leaves drift — accent tile
  const FOREST_PATH_LEAVES = pad([
    'bbcbbcbbcbbcbbcb',
    'cbbbcgGcbbbcbbbb',  // single leaf
    'bccbbgGbbccbbccb',
    'cbbbcbbbcbbbcbbb',
    'bbcbbcbbcbbcbbcb',
    'cbcbcbcGcbcbcbcb',  // another leaf
    'bbcbbcbgGbcbbcbb',
    'cbbbcbbgGcbbbcbbb',
    'bccbbccbbccbbccb',
    'cbbbcbbbcGbbcbbb',
    'bbcbbcbbcgGbcbcb',
    'cbcbcbcbcbcbcbcb',
    'bbcbbcbbcbbcbbcb',
    'cbbbcbbbcbbbcbbb',
    'bccbbccbbccbbccb',
    'cbbbcbbbcbbbcbbb',
  ], 16);

  // ============================================================
  // VOLCANO · Cracked obsidian floor (dark with red lava cracks)
  // ============================================================
  const VOLCANO_OBSIDIAN_BASE = pad([
    '2222222222222222',
    '2333322233332223',
    '2233323333233233',
    '2333232233332333',
    '2333322233332223',  // dark base
    '2222222222222222',
    '2333222233332223',
    '2333323333233233',
    '2233332233332333',
    '2222222222222222',
    '2333322233332223',
    '2333323333233233',
    '2333232233332333',
    '2333322233332223',
    '2222222222222222',
    '2333222233332223',
  ], 16);

  const VOLCANO_OBSIDIAN_CRACK = pad([
    '2222222222222222',
    '2333322233332223',
    '233de32333d2332e',  // glowing crack
    '23d3232233e32333',
    '23332e2233d32223',
    '22222d2222e22222',
    '2333d22233d32223',
    '2333d23333e33233',
    '22d3332233d32333',
    '22e22d22dd22222e',
    '2333d22d33332223',
    '2333d23333233233',
    '2333232233332333',
    '2333d22d33332223',
    '2222222222222222',
    '2333222233332223',
  ], 16);

  // ============================================================
  // ICE · Polished frozen floor (cool blue-white with cracks)
  // ============================================================
  const ICE_BASE = pad([
    '5566555566555566',
    '6555665555665555',
    '5566555566555566',
    '6555665555665555',
    '5566555566555566',
    'WIWIWIWIWIWIWIWI',  // shine row
    '5566555566555566',
    '6555665555665555',
    '5566555566555566',
    '6555665555665555',
    '5566555566555566',
    'WIWIWIWIWIWIWIWI',
    '5566555566555566',
    '6555665555665555',
    '5566555566555566',
    '6555665555665555',
  ], 16);

  const ICE_CRACK = pad([
    '5566555566555566',
    '6555665555665555',
    '55665555W6555566',  // tiny crack line
    '6555665W55665555',
    '5566555W66555566',
    'WIWIWIWWWIWIWIWI',
    '5566555W66555566',
    '6555665555665555',
    '5566555566555566',
    '6555665555665555',
    '5566555566555566',
    'WIWIWIWIWIWIWIWI',
    '5566555566555566',
    '6555665555665555',
    '5566555566555566',
    '6555665555665555',
  ], 16);

  // Snow drift — pure white spots
  const ICE_SNOW_DRIFT = pad([
    '5566P55P66P5556P',
    '6PP56P5P56P655P5',
    '5566P55566P5556P',
    '6555PP5555665555',
    '5566P55PP6555566',
    'WIWIWIWIWIWIWIWI',
    '5566P5556PP55566',
    '6555PP5555665555',
    '5566P55566PP5566',
    '6555665P55665555',
    '5566555PP6555566',
    'WIWIWIWIWIWIWIWI',
    '55PP555566555566',
    '6555665P55665555',
    '5566555566555566',
    '6555665555665555',
  ], 16);

  // ============================================================
  // SANCTUARY · Holy marble (white + gold inlay)
  // ============================================================
  const SANCTUARY_MARBLE = pad([
    '7777177771777717',
    '7777177771777717',
    '7677176671777617',  // subtle gradient
    '7777177771777717',
    '1111111111111111',
    '7777177771777717',
    '7777176771777717',
    '7777177771777617',
    '7777177771777717',
    '1111111111111111',
    '7777177771777717',
    '7777177771777717',
    '7677176671777617',
    '7777177771777717',
    '1111111111111111',
    '7777177771777717',
  ], 16);

  const SANCTUARY_INLAY = pad([
    '7777177771777717',
    '777Y17777177Y717',  // gold inlay corners
    'YY77177Y8Y77Y7Y7',
    'YY771Y9989Y17Y17',
    'YY77Y9888889YY17',  // gold pattern
    '1111Y888888Y1111',
    'YY77Y9888889YY17',
    'YY771Y9989Y17Y17',
    'YY77177Y8Y77Y7Y7',
    '777Y17777177Y717',
    '7777177771777717',
    '7777177771777717',
    '7777177771777717',
    '7777177771777717',
    '1111111111111111',
    '7777177771777717',
  ], 16);

  // ============================================================
  // Register all unified tile sets
  // ============================================================
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      // Crypt — uniform cobble
      tile_crypt_base:        [CRYPT_STONE_BASE],
      tile_crypt_var:         [CRYPT_STONE_VAR],
      tile_crypt_acc_skull:   [CRYPT_STONE_ACC_SKULL],
      tile_crypt_carpet:      [CRYPT_CARPET_CENTER],
      tile_crypt_carpet_edge: [CRYPT_CARPET_EDGE_L],

      // Forest — uniform path
      tile_forest_base:    [FOREST_PATH_BASE],
      tile_forest_moss:    [FOREST_PATH_MOSS],
      tile_forest_leaves:  [FOREST_PATH_LEAVES],

      // Volcano — obsidian with cracks
      tile_volcano_base:   [VOLCANO_OBSIDIAN_BASE],
      tile_volcano_crack:  [VOLCANO_OBSIDIAN_CRACK],

      // Ice — polished
      tile_ice_base:       [ICE_BASE],
      tile_ice_crack_new:  [ICE_CRACK],
      tile_ice_snow_drift: [ICE_SNOW_DRIFT],

      // Sanctuary — holy marble
      tile_sanctuary_base: [SANCTUARY_MARBLE],
      tile_sanctuary_inlay:[SANCTUARY_INLAY],
    });

    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Unified Tile Sets · Cohesive Floors',
        items: ['tile_crypt_base','tile_crypt_var','tile_crypt_acc_skull','tile_crypt_carpet','tile_crypt_carpet_edge',
                'tile_forest_base','tile_forest_moss','tile_forest_leaves',
                'tile_volcano_base','tile_volcano_crack',
                'tile_ice_base','tile_ice_crack_new','tile_ice_snow_drift',
                'tile_sanctuary_base','tile_sanctuary_inlay'],
      });
    }
  }

  // Default tile-pool recipes — recommended weights per biome
  window.UNIFIED_TILE_POOLS = {
    crypt: [
      { tile: 'tile_crypt_base', weight: 70 },
      { tile: 'tile_crypt_var',  weight: 25 },
      { tile: 'tile_crypt_acc_skull', weight: 5 },
    ],
    crypt_boss: [
      { tile: 'tile_crypt_carpet', weight: 100 },
    ],
    forest: [
      { tile: 'tile_forest_base',   weight: 80 },
      { tile: 'tile_forest_moss',   weight: 15 },
      { tile: 'tile_forest_leaves', weight: 5 },
    ],
    volcano: [
      { tile: 'tile_volcano_base',  weight: 80 },
      { tile: 'tile_volcano_crack', weight: 20 },
    ],
    ice: [
      { tile: 'tile_ice_base',       weight: 75 },
      { tile: 'tile_ice_crack_new',  weight: 15 },
      { tile: 'tile_ice_snow_drift', weight: 10 },
    ],
    sanctuary: [
      { tile: 'tile_sanctuary_base',  weight: 85 },
      { tile: 'tile_sanctuary_inlay', weight: 15 },
    ],
  };
})();
