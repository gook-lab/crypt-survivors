// Auto-polish — programmatically generate HD versions of every existing
// sprite by post-processing the original frames. Adds:
//   1. A dark outline ('1' = deep night) in 8 directions around the silhouette
//   2. A subtle top-left highlight on opaque pixels that have empty/dark
//      neighbours up-left (gives a sense of light direction)
//   3. A faint bottom-right shadow tone shift on pixels with bright neighbours
//      up-left (adds depth without changing colour identity)
//
// Output sprites keyed as `<orig>_hd` so the originals stay untouched. This
// runs once at load and registers all variants into window.SPRITES.

(function () {
  if (!window.SPRITES || !window.PALETTE) return;

  // Surface tone families: dark / mid / light / spec.
  // Keys → tone-up (lighten) / tone-down (darken).
  const LIGHTEN = {
    '0': '1', '1': '2', '2': '3', '3': '4', '4': '5', '5': '6', '6': '7',
    '8': '9', '9': 'Y', 'Y': 'P',
    'a': 'b', 'b': 'c', 'c': '7',
    'd': 'e', 'e': 'f', 'f': 'P',
    'r': 'R', 'R': 'P',
    'g': 'G', 'G': 'h', 'h': 'P',
    'k': 'i', 'i': 'I', 'I': 'W', 'W': 'P',
    'p': 'm', 'm': 'M', 'M': 'q', 'q': 'P',
    'n': 'N', 'N': 'q', '7': 'P',
  };
  const DARKEN = {};
  for (const [k, v] of Object.entries(LIGHTEN)) DARKEN[v] = DARKEN[v] || k;
  // Manual additions for darkening
  Object.assign(DARKEN, { 'P': 'Y', 'q': 'M', 'M': 'm', 'm': 'p', 'W': 'I', 'I': 'i', 'i': 'k' });

  // Already-outline-style colors we shouldn't paint over
  const OUTLINE_KEEPS = new Set(['0', '1']);

  function isOpaque(c) {
    return c && c !== '.' && c !== ' ';
  }

  function polishFrame(frame) {
    const H = frame.length;
    const W = frame[0].length;
    // Output is grown by 1px on each side for outline room
    const OH = H + 2, OW = W + 2;
    const out = Array.from({ length: OH }, () => Array(OW).fill('.'));

    // 1. Copy original (shifted by +1,+1)
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const c = frame[y][x];
        if (isOpaque(c)) out[y + 1][x + 1] = c;
      }
    }

    // 2. Add outline in 8 directions where transparent neighbours touch opaque
    const offsets = [[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];
    for (let y = 0; y < OH; y++) {
      for (let x = 0; x < OW; x++) {
        if (out[y][x] !== '.') continue;
        // Check if any neighbour is opaque
        let hasOpaqueNeighbour = false;
        for (const [dx, dy] of offsets) {
          const nx = x + dx, ny = y + dy;
          if (nx < 0 || nx >= OW || ny < 0 || ny >= OH) continue;
          if (isOpaque(out[ny][nx]) && !OUTLINE_KEEPS.has(out[ny][nx])) {
            hasOpaqueNeighbour = true;
            break;
          }
        }
        if (hasOpaqueNeighbour) out[y][x] = '1';
      }
    }

    // 3. Add highlights on top-left edge pixels
    //    A pixel gets lightened if its up-left neighbour is transparent/outline
    //    and it's on the edge of the sprite.
    const work = out.map((r) => r.slice());
    for (let y = 1; y < OH - 1; y++) {
      for (let x = 1; x < OW - 1; x++) {
        const c = work[y][x];
        if (!isOpaque(c) || OUTLINE_KEEPS.has(c)) continue;
        // up-left transparent/outline ⇒ catch light
        const ul = work[y - 1][x - 1];
        const u  = work[y - 1][x];
        const l  = work[y][x - 1];
        if ((!isOpaque(ul) || ul === '1') &&
            (!isOpaque(u)  || u === '1') &&
            (!isOpaque(l)  || l === '1')) {
          const lighter = LIGHTEN[c];
          if (lighter && lighter !== c) out[y][x] = lighter;
        }
      }
    }

    // 4. Add shadows on bottom-right edges
    for (let y = 1; y < OH - 1; y++) {
      for (let x = 1; x < OW - 1; x++) {
        const c = work[y][x];
        if (!isOpaque(c) || OUTLINE_KEEPS.has(c)) continue;
        const br = work[y + 1][x + 1];
        const r  = work[y][x + 1];
        const b  = work[y + 1][x];
        if ((!isOpaque(br) || br === '1') &&
            (!isOpaque(r)  || r === '1') &&
            (!isOpaque(b)  || b === '1')) {
          const darker = DARKEN[c];
          if (darker && darker !== c && out[y][x] === c) {
            // only apply darken if we haven't already lightened this pixel
            out[y][x] = darker;
          }
        }
      }
    }

    return out.map((r) => r.join(''));
  }

  function polishClip(name) {
    const frames = window.SPRITES[name];
    if (!frames) return null;
    return frames.map(polishFrame);
  }

  // Target categories — programmatically polish these.
  const TARGETS_ENEMIES = [
    // Crypt
    'walker_walk', 'runner_walk', 'brute_walk', 'elite_walk',
    'crypt_archer', 'crypt_wraith', 'crypt_bone_pile', 'crypt_keeper',
    // Forest
    'forest_wolf', 'forest_vine', 'forest_owl', 'forest_treant',
    'bat_fly', 'spider_walk',
    // Volcano
    'volcano_imp', 'volcano_slug', 'volcano_ash', 'volcano_brute',
    'slime_idle', 'chimera_walk',
    // Ice
    'ice_wisp', 'ice_spider', 'ice_golem', 'ice_frost_lich',
  ];

  const TARGETS_PROJECTILES = [
    'proj_wand', 'proj_nova', 'proj_prism', 'proj_spear', 'proj_axe',
    'proj_mace', 'proj_holywater', 'proj_arrow', 'proj_garlic',
    'proj_bible', 'proj_cross', 'proj_whip', 'proj_lightning',
    'proj_firewall', 'proj_knives', 'proj_scythe', 'proj_bone',
    'proj_leg_blade', 'proj_leg_axe', 'proj_leg_spear', 'proj_leg_arrow',
    'proj_leg_whip', 'proj_leg_cross', 'proj_leg_bible',
    'proj_leg_scythe', 'proj_leg_nova',
  ];

  const TARGETS_SPIRITS = [
    'spirit_fairy_1', 'spirit_fairy_2', 'spirit_fairy_3',
    'spirit_water_1', 'spirit_water_2', 'spirit_water_3',
    'spirit_earth_1', 'spirit_earth_2', 'spirit_earth_3',
    'spirit_fire_1',  'spirit_fire_2',  'spirit_fire_3',
  ];

  const TARGETS_PICKUPS = [
    'pickup_xp_blue', 'pickup_xp_green', 'pickup_xp_red',
    'pickup_gold', 'pickup_heart', 'pickup_magnet',
    'pickup_bomb', 'pickup_chicken',
    'pickup_potion_hp', 'pickup_potion_might', 'pickup_potion_mana',
    'pickup_potion_swift', 'pickup_potion_arcane',
    'pickup_chest', 'pickup_chest_gold', 'pickup_rune',
    'pickup_scroll', 'pickup_key',
  ];

  // Generate _hd variants
  const ALL = [
    ...TARGETS_ENEMIES,
    ...TARGETS_PROJECTILES,
    ...TARGETS_SPIRITS,
    ...TARGETS_PICKUPS,
  ];
  for (const name of ALL) {
    if (!window.SPRITES[name]) continue;
    const polished = polishClip(name);
    if (polished) {
      window.SPRITES[name + '_hd'] = polished;
      if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
        window.AtlasBuilder.FPS[name + '_hd'] = window.AtlasBuilder.FPS[name] || 0;
      }
    }
  }

  window.AutoPolish = {
    polishFrame,
    polishClip,
    targets: {
      TARGETS_ENEMIES,
      TARGETS_PROJECTILES,
      TARGETS_SPIRITS,
      TARGETS_PICKUPS,
    },
  };
})();
