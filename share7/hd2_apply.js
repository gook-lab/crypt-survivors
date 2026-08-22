// HD2 apply — alias all original sprite keys to their _hd2 (or _hd) polished
// counterparts. Include this AFTER all *_hd*.js files and BEFORE any showcase
// rendering. Original keys are preserved as `<key>_original` so anything that
// needs the legacy art (e.g. before/after comparisons) can still get it.
//
// Toggle with window.HD2_ENABLED = false before this script runs to opt out.

(function () {
  if (window.HD2_ENABLED === false) return;
  if (!window.SPRITES) return;

  // ── Map: <original key> -> <polished key> ────────────────────
  // If polished doesn't exist, the mapping is silently skipped.
  const ALIASES = {
    // Heroes (use 48×48 HD3 in-game, HD/XHD remain available as separate keys)
    knight_walk:       'knight_hd3_walk',
    warrior_walk:      'warrior_hd3_walk',
    mage_walk:         'mage_hd3_walk',
    huntress_walk:     'huntress_hd3_walk',
    cleric_walk:       'cleric_hd3_walk',
    player_walk:       'knight_hd3_walk',  // alias default

    // Enemies — prefer HD2 hand-drawn over HD procedural
    walker_walk:       'walker_hd2_walk',
    runner_walk:       'runner_hd2_walk',
    brute_walk:        'brute_hd2_walk',
    elite_walk:        'elite_hd2_walk',
    bat_fly:           'bat_hd2_fly',
    slime_idle:        'slime_hd2_idle',
    spider_walk:       'spider_hd2_walk',
    crypt_archer:      'crypt_archer_hd2',
    forest_wolf:       'forest_wolf_hd2',
    ice_wisp:          'ice_wisp_hd2',
    volcano_imp:       'volcano_imp_hd2',

    // Bosses (HD)
    boss_skeleton_king: 'boss_skeleton_king_hd',
    boss_vampire:       'boss_vampire_hd',
    boss_demon:         'boss_demon_hd',
    boss_pyrolord:      'boss_pyrolord_hd',
    boss_idle:          'boss_lich_hd',
    boss_frost_dragon:  'boss_frost_dragon_hd',

    // Projectiles — prefer HD2
    proj_wand:          'proj_wand_hd2',
    proj_nova:          'proj_nova_hd2',
    proj_prism:         'proj_prism_hd2',
    proj_spear:         'proj_spear_hd2',
    proj_axe:           'proj_axe_hd2',
    proj_mace:          'proj_mace_hd2',
    proj_holywater:     'proj_holywater_hd2',
    proj_arrow:         'proj_arrow_hd2',
    proj_garlic:        'proj_garlic_hd2',
    proj_bible:         'proj_bible_hd2',
    proj_cross:         'proj_cross_hd2',
    proj_whip:          'proj_whip_hd2',
    proj_knives:        'proj_knives_hd2',
    proj_scythe:        'proj_scythe_hd2',
    proj_leg_blade:     'proj_leg_blade_hd2',
    proj_leg_arrow:     'proj_leg_arrow_hd2',
    proj_leg_nova:      'proj_leg_nova_hd2',

    // Skill VFX
    fx_explosion:       'fx_explosion_hd',
    fx_holywater_splash:'fx_explosion_hd',  // reuse for now
    // (lightning/ice/poison kept as separate keys, no original)

    // Pickups — HD2 across the board
    pickup_xp_blue:     'pickup_xp_blue_hd2',
    pickup_xp_green:    'pickup_xp_green_hd2',
    pickup_xp_red:      'pickup_xp_red_hd2',
    pickup_gold:        'pickup_gold_hd2',
    pickup_heart:       'pickup_heart_hd2',
    pickup_magnet:      'pickup_magnet_hd2',
    pickup_bomb:        'pickup_bomb_hd2',
    pickup_chicken:     'pickup_chicken_hd2',
    pickup_potion_hp:     'pickup_potion_hp_hd2',
    pickup_potion_might:  'pickup_potion_might_hd2',
    pickup_potion_mana:   'pickup_potion_mana_hd2',
    pickup_potion_swift:  'pickup_potion_swift_hd2',
    pickup_potion_arcane: 'pickup_potion_arcane_hd2',
    pickup_scroll:      'pickup_scroll_hd2',
    pickup_key:         'pickup_key_hd2',
    pickup_rune:        'pickup_rune_hd2',
  };

  const applied = [];
  const skipped = [];

  for (const orig in ALIASES) {
    const polished = ALIASES[orig];
    if (!window.SPRITES[polished]) {
      skipped.push(orig + ' (target ' + polished + ' missing)');
      continue;
    }
    if (!window.SPRITES[orig]) {
      skipped.push(orig + ' (original missing)');
      continue;
    }
    // Preserve original under _original suffix (only first time)
    if (!window.SPRITES[orig + '_original']) {
      window.SPRITES[orig + '_original'] = window.SPRITES[orig];
    }
    // Apply polished
    window.SPRITES[orig] = window.SPRITES[polished];
    // Carry over FPS too if defined
    if (window.AtlasBuilder && window.AtlasBuilder.FPS && window.AtlasBuilder.FPS[polished] != null) {
      if (window.AtlasBuilder.FPS[orig + '_original'] == null) {
        window.AtlasBuilder.FPS[orig + '_original'] = window.AtlasBuilder.FPS[orig];
      }
      window.AtlasBuilder.FPS[orig] = window.AtlasBuilder.FPS[polished];
    }
    applied.push(orig);
  }

  window.HD2_APPLIED = { applied, skipped, count: applied.length };

  // Expose a toggle so the user can revert at runtime if needed.
  window.revertHD2 = function () {
    for (const orig in ALIASES) {
      if (window.SPRITES[orig + '_original']) {
        window.SPRITES[orig] = window.SPRITES[orig + '_original'];
      }
      if (window.AtlasBuilder && window.AtlasBuilder.FPS && window.AtlasBuilder.FPS[orig + '_original'] != null) {
        window.AtlasBuilder.FPS[orig] = window.AtlasBuilder.FPS[orig + '_original'];
      }
    }
    console.log('HD2 reverted to original');
  };
})();
