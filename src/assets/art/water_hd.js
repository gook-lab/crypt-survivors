// High-detail water tile — deep cobalt with shimmering waves, ripples, and
// foam highlights. Replaces the simpler tile_water silhouette around bridges.

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }

  // Deep water tile A — base wave pattern
  const WATER_HD_A = pad([
    'kkikkiIkkikkIkki',
    'kIikkkikIikkkiIk',
    'kkkikkkkkkikkkkk',  // ripple lines
    'kikIikkikikIikIi',
    'kkkkkikkkkkikkki',
    'WIikkIkIikkikkki',  // foam crests
    'kkkkkkkikkkkikkk',
    'kIikIikkikIikIik',
    'kkkikkkikkkikkki',
    'kikIikkikikIikIi',
    'kkkkkkkkkkkkikkk',
    'IikkIkIikkIkIikk',  // brighter wave
    'kkkkikkkkkkikkki',
    'kIikIikkIikIikIk',
    'kkkikkkkikkkkikk',
    'kikIikkikikIikIi',
  ], 16);

  // Deep water tile B — same palette, different ripple positions
  const WATER_HD_B = pad([
    'kIikkkikIikkkiIk',
    'kkikkiIkkikkIkki',
    'kikIikkikikIikIi',
    'kkkikkkkkkikkkkk',
    'IikkIkIikkIkIikk',
    'kkkkkikkkkkikkki',
    'kIikIikkikIikIik',
    'WIikkIkIikkikkki',
    'kkkkkkkikkkkikkk',
    'kkkikkkikkkikkki',
    'kIikIikkIikIikIk',
    'kkkkkkkkkkkkikkk',
    'kikIikkikikIikIi',
    'kkkkikkkkkkikkki',
    'kkkikkkkikkkkikk',
    'IikkIkIikkIkIikk',
  ], 16);

  // Water with bridge foam — used around bridge pilings
  const WATER_HD_FOAM = pad([
    'kIikkkikIikkkiIk',
    'kkikkiIkkikkIkki',
    'WPWPIWIPWPWPIWIP',  // foam crest
    'WWPPWWPPWWPPWWPP',
    'IikkIkIikkIkIikk',
    'kkkkkikkkkkikkki',
    'kIikIikkikIikIik',
    'WIikkIkIikkikkki',
    'kkkkkkkikkkkikkk',
    'kkkikkkikkkikkki',
    'kIikIikkIikIikIk',
    'kkkkkkkkkkkkikkk',
    'WWPPWWPPWWPPWWPP',  // bottom foam
    'WPWPIWIPWPWPIWIP',
    'kkkikkkkikkkkikk',
    'IikkIkIikkIkIikk',
  ], 16);

  // Edge tile — water meets land (shoreline) on top
  const WATER_HD_SHORE_TOP = pad([
    'IikkIkIikkIkIikk',  // shore water
    'WIWPWIIWWIWPWIIW',
    'WPWPWPWPWPWPWPWP',  // foam line
    'WWPPWWPPWWPPWWPP',
    'IikkIkIikkIkIikk',
    'kIikIikkikIikIik',
    'kkkkkikkkkkikkki',
    'kIikIikkIikIikIk',
    'kkkikkkkkkikkkkk',
    'kIikIikkikIikIik',
    'kkkkkkkikkkkikkk',
    'kIikIikkIikIikIk',
    'kkkikkkikkkikkki',
    'kIikIikkikIikIik',
    'kkkkkikkkkkikkki',
    'IikkIkIikkIkIikk',
  ], 16);

  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      tile_water_hd:       [WATER_HD_A, WATER_HD_B],
      tile_water_hd_foam:  [WATER_HD_FOAM, WATER_HD_FOAM, WATER_HD_FOAM],
      tile_water_hd_shore: [WATER_HD_SHORE_TOP],
    });
    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'High-Detail Water · 다리 옆',
        items: ['tile_water_hd', 'tile_water_hd_foam', 'tile_water_hd_shore'],
      });
    }
    // Alias original tile_water → tile_water_hd
    if (window.HD2_ENABLED !== false) {
      if (!window.SPRITES.tile_water_original) {
        window.SPRITES.tile_water_original = window.SPRITES.tile_water;
      }
      window.SPRITES.tile_water = window.SPRITES.tile_water_hd;
    }
  }
  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      tile_water_hd: 2,
      tile_water_hd_foam: 4,
    });
  }
})();
