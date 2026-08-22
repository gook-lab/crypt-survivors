// Natural tile sets — replaces the grid-rigid floors with organic surfaces
// that read as continuous textures rather than checkerboards.
//
// Design principles (from VS / Soulstone Survivors reference):
//   1. NO visible mortar lines or hard grid edges
//   2. Subtle large-scale noise — every tile slightly different in color
//      placement, but same base palette
//   3. Optional ornate accent (diamond / medallion) every N tiles, very rare
//   4. Edge-blending — tiles share same border colors so seams disappear

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }

  // ============================================================
  // CRYPT · Natural dark stone — large 16×16 tiles, organic noise
  // ============================================================
  // Base: muted browns/grays, NO mortar grid, just subtle dithering.
  // Reads like one continuous polished floor.
  const NAT_CRYPT_A = pad([
    '4344343444443434',
    '4434434434434443',
    '4344444443344443',  // organic noise
    '4434343444443443',
    '4444334444443444',
    '4444444333444443',
    '4344443344444434',
    '4434334444443443',
    '4444443344334443',
    '4344443433444444',
    '4434444443344434',
    '4434443444444443',
    '4344334443344343',
    '4434444334444443',
    '4444443344433443',
    '4434343444443443',
  ], 16);
  const NAT_CRYPT_B = pad([
    '4434443434444343',
    '4343434443443444',
    '4444433343344334',
    '4344443443443434',
    '4434333443433343',
    '4443444443434444',
    '4444434334334434',
    '4344443343443343',
    '4434433344343344',
    '4444443334434444',
    '4434334443444334',
    '4443443443444443',
    '4434434343334434',
    '4444334434434343',
    '4344443343444444',
    '4444443434343443',
  ], 16);

  // Ornate medallion accent (rare, every 6-8 tiles) — looks like the
  // diamond/floral pattern from the reference, but subtle.
  const NAT_CRYPT_MEDALLION = pad([
    '4434443434444343',
    '4344443443444334',
    '4334555555533434',  // medallion ring outer
    '4345444444454343',
    '4354444444454434',
    '4354443344454344',  // diamond inside
    '4354433343454443',
    '4354343334354343',
    '4354343334354443',
    '4354433343454344',
    '4354443344454343',
    '4354444444454334',
    '4344555555533443',
    '4434443434444343',
    '4344443443444444',
    '4434434434434343',
  ], 16);

  // ============================================================
  // FOREST · Natural lush grass — short blades, scattered tufts
  // ============================================================
  const NAT_FOREST_A = pad([
    'gGgGgGghGgGgGghG',
    'GgGhGgGgGhGgGgGg',
    'gGgGhGgGgGgGgGhG',
    'GhGgGgGhGgGgGhGg',
    'gGgGgGgGgGhGgGgG',
    'GgGgGhGgGgGgGgGh',  // organic blades
    'gGhGgGgGgGgGhGgG',
    'GgGgGgGgGhGgGgGg',
    'gGgGgGhGgGgGgGgG',
    'GgGhGgGgGgGgGhGg',
    'gGgGgGgGgGhGgGgG',
    'GhGgGgGgGhGgGgGh',
    'gGgGgGhGgGgGgGgG',
    'GgGgGgGgGgGhGgGg',
    'gGgGgGgGhGgGgGgG',
    'GgGgGhGgGgGgGgGh',
  ], 16);
  const NAT_FOREST_B = pad([
    'GgGhGgGgGhGgGgGg',
    'gGgGhGgGgGgGgGhG',
    'GgGgGgGhGgGgGgGg',
    'gGhGgGgGgGgGhGgG',
    'GgGgGhGgGgGhGgGg',
    'gGgGgGgGgGgGgGhG',
    'GhGgGgGgGhGgGgGg',
    'gGgGhGgGgGgGhGgG',
    'GgGgGgGhGgGgGgGg',
    'gGgGgGgGgGhGgGgG',
    'GhGgGgGgGgGgGhGg',
    'gGgGhGgGhGgGgGgG',
    'GgGhGgGgGgGgGhGg',
    'gGgGgGhGgGgGgGgG',
    'GgGgGgGgGgGhGgGg',
    'gGhGgGgGhGgGgGgG',
  ], 16);

  // Forest with small flowers (rare accent)
  const NAT_FOREST_BLOOM = pad([
    'GgGhGgGgGhGgGgGg',
    'gGgGhGgGgGgGgGhG',
    'GgGgGgGhGgGYPGg.',  // tiny yellow flowers
    'gGhGgGgYPYGgGgG.',
    'GgGgGhGYYgGhGgGg',
    'gGgGgGgGgGgGgGhG',
    'GhGgGgGgGhGgGgGg',
    'gGgGhGgGgGgGhGgG',
    'GgGgGgGhGgGRPgGg',  // red flower
    'gGgGgGgGgGRRRgGg',
    'GhGgGgGgGgGRgGhG',
    'gGgGhGgGhGgGgGgG',
    'GgGhGgGgGgGgGhGg',
    'gGgGgGhGgGgGgGgG',
    'GgGgGgGgGgGhGgGg',
    'gGhGgGgGhGgGgGgG',
  ], 16);

  // ============================================================
  // VOLCANO · Cracked obsidian — dark with subtle ember veins
  // ============================================================
  const NAT_VOLCANO_A = pad([
    '2232232322323223',
    '2322322323222232',
    '2232232233222322',  // dark base no grid
    '2322322322322323',
    '2232232232232232',
    '2323223322323223',
    '2233222322322322',
    '2322333222323323',
    '2232232233232232',
    '2322322232233322',
    '2232233322322232',
    '2322322322333223',
    '2232232233222322',
    '2322322322322232',
    '2232232232232323',
    '2323223322323223',
  ], 16);
  const NAT_VOLCANO_EMBER = pad([
    '2232232322323223',
    '2322322323222232',
    '2232232233222322',
    '2322232eed222323',  // ember crack line
    '2232eeefdde22232',
    '232eefffeede2223',
    '22efedeefede2232',
    '2222dde22322323',
    '2232232233232232',
    '2322322232233322',
    '2232233322322232',
    '2322322322333223',
    '2232232233222322',
    '2322322322322232',
    '2232232232232323',
    '2323223322323223',
  ], 16);

  // ============================================================
  // ICE · Frozen surface — pale blue with subtle waves
  // ============================================================
  const NAT_ICE_A = pad([
    '5656565565656565',
    '6565656656565656',
    '5656566565656566',  // very subtle pattern
    '6565655665656565',
    '5656565565656565',
    '6565656656565656',
    '5656566565656566',
    '6565655665656565',
    '5656565565656565',
    '6565656656565656',
    '5656566565656566',
    '6565655665656565',
    '5656565565656565',
    '6565656656565656',
    '5656566565656566',
    '6565655665656565',
  ], 16);
  const NAT_ICE_CRACK = pad([
    '5656565565656565',
    '6565656656565656',
    '565656WIWIWIW566',  // hairline cracks
    '6565WIWIW565WI65',
    '565WIW6565656WIW',
    '6565656656565656',
    '5656566565656566',
    '6565655665656565',
    '5656565WIWIWWI65',
    '6565656656WIWI56',
    '5656566565656566',
    '6565655665656565',
    '5656565565656565',
    '6565656656565656',
    '5656566565656566',
    '6565655665656565',
  ], 16);

  // ============================================================
  // SANCTUARY · Polished marble — light cream with gold flecks
  // ============================================================
  const NAT_SANCTUARY_A = pad([
    '7767767677677677',
    '7676767767676776',
    '7767767677677776',  // marble veining
    '7676776767676776',
    '7767767677677677',
    '7676767767676776',
    '7767767677677776',
    '7676776767676776',
    '7767767677677677',
    '7676767767676776',
    '7767767677677776',
    '7676776767676776',
    '7767767677677677',
    '7676767767676776',
    '7767767677677776',
    '7676776767676776',
  ], 16);
  const NAT_SANCTUARY_INLAY = pad([
    '7767767677677677',
    '7676767767676776',
    '7767766Y76677776',  // gold flecks
    '76767Y6767676776',
    '776776767767YY77',
    '7676Y67767676776',
    '7767767677677776',
    '76767Y676767Y776',
    '7767767677677Y77',
    '76767Y67767Y6776',
    '77677767767Y7776',
    '7676776767676Y76',
    '7767767677677677',
    '7676767767Y76776',
    '77677Y7677677776',
    '76Y6776767676776',
  ], 16);

  // Register
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      tile_nat_crypt_a:       [NAT_CRYPT_A],
      tile_nat_crypt_b:       [NAT_CRYPT_B],
      tile_nat_crypt_medallion: [NAT_CRYPT_MEDALLION],
      tile_nat_forest_a:      [NAT_FOREST_A],
      tile_nat_forest_b:      [NAT_FOREST_B],
      tile_nat_forest_bloom:  [NAT_FOREST_BLOOM],
      tile_nat_volcano_a:     [NAT_VOLCANO_A],
      tile_nat_volcano_ember: [NAT_VOLCANO_EMBER],
      tile_nat_ice_a:         [NAT_ICE_A],
      tile_nat_ice_crack:     [NAT_ICE_CRACK],
      tile_nat_sanctuary_a:   [NAT_SANCTUARY_A],
      tile_nat_sanctuary_inlay: [NAT_SANCTUARY_INLAY],
    });
    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Natural Tiles (grid-free, organic)',
        items: ['tile_nat_crypt_a','tile_nat_crypt_b','tile_nat_crypt_medallion',
                'tile_nat_forest_a','tile_nat_forest_b','tile_nat_forest_bloom',
                'tile_nat_volcano_a','tile_nat_volcano_ember',
                'tile_nat_ice_a','tile_nat_ice_crack',
                'tile_nat_sanctuary_a','tile_nat_sanctuary_inlay'],
      });
    }
  }

  // Natural-look pool recipes
  window.NATURAL_TILE_POOLS = {
    crypt:     [{tile:'tile_nat_crypt_a',weight:50},{tile:'tile_nat_crypt_b',weight:46},{tile:'tile_nat_crypt_medallion',weight:4}],
    forest:    [{tile:'tile_nat_forest_a',weight:50},{tile:'tile_nat_forest_b',weight:47},{tile:'tile_nat_forest_bloom',weight:3}],
    volcano:   [{tile:'tile_nat_volcano_a',weight:90},{tile:'tile_nat_volcano_ember',weight:10}],
    ice:       [{tile:'tile_nat_ice_a',weight:85},{tile:'tile_nat_ice_crack',weight:15}],
    sanctuary: [{tile:'tile_nat_sanctuary_a',weight:80},{tile:'tile_nat_sanctuary_inlay',weight:20}],
  };

  // Auto-override the UNIFIED_TILE_POOLS so existing pages use natural set
  if (window.UNIFIED_TILE_POOLS && window.NATURAL_TILE_POOLS) {
    Object.assign(window.UNIFIED_TILE_POOLS, window.NATURAL_TILE_POOLS);
  }
})();
