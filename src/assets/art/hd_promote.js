// HD asset promotion — loads last, after sprites.js / atlas.js and every
// *_hd / *_hd2 / *_xhd / structures / tiles pack. Each base sprite key is
// re-pointed at its best available HD variant (and its FPS copied across), so
// all existing references — characters.js, weapons.js, the renderer's
// ENEMY_SPRITE table, the bestiary — render the polished art with no churn.
//
// Variant tiers, newest wins:  base  <  _hd  <  _hd2 / _xhd
// Keys with no HD variant (most biome enemies, the non-HD bosses, weapon
// icons) are untouched and keep their original art.

(function () {
  const S = window.SPRITES;
  const F = window.AtlasBuilder && window.AtlasBuilder.FPS;
  if (!S) return;

  // base sprite key -> its best (newest) HD counterpart
  const PROMOTE = {
    // heroes — 48×48 HD3 with an 8-frame smooth walk cycle
    knight_walk: 'knight_smooth_walk',
    warrior_walk: 'warrior_smooth_walk',
    mage_walk: 'mage_smooth_walk',
    huntress_walk: 'huntress_smooth_walk',
    cleric_walk: 'cleric_smooth_walk',
    // common enemies — refined 24×24 (hd2); chimera has only the hd pass
    walker_walk: 'walker_hd2_walk',
    runner_walk: 'runner_hd2_walk',
    brute_walk: 'brute_hd2_walk',
    elite_walk: 'elite_hd2_walk',
    bat_fly: 'bat_hd2_fly',
    slime_idle: 'slime_hd2_idle',
    spider_walk: 'spider_hd2_walk',
    chimera_walk: 'chimera_hd_walk',
    // bosses (boss_idle — the 망령 리치 — uses the HD lich art)
    boss_skeleton_king: 'boss_skeleton_king_hd',
    boss_vampire: 'boss_vampire_hd',
    boss_demon: 'boss_demon_hd',
    boss_idle: 'boss_lich_hd',
    // weapon projectiles — refined (hd2)
    proj_wand: 'proj_wand_hd2',
    proj_nova: 'proj_nova_hd2',
    proj_prism: 'proj_prism_hd2',
    proj_spear: 'proj_spear_hd2',
    proj_axe: 'proj_axe_hd2',
    proj_mace: 'proj_mace_hd2',
    proj_holywater: 'proj_holywater_hd2',
    proj_arrow: 'proj_arrow_hd2',
    proj_cross: 'proj_cross_hd2',
    proj_knives: 'proj_knives_hd2',
    proj_scythe: 'proj_scythe_hd2',
    proj_whip: 'proj_whip_hd2',
    proj_leg_blade: 'proj_leg_blade_hd2',
    proj_leg_arrow: 'proj_leg_arrow_hd2',
    proj_leg_nova: 'proj_leg_nova_hd2',
    // newly hand-drawn lightning art (lightning_polish.js)
    proj_lightning: 'proj_lightning_hd2',
    proj_leg_storm_caller: 'proj_leg_storm_caller_hd2',
    // skill / impact VFX — effects_hd3 self-aliases its own keys; these two
    // are pinned here so the hd3 art wins over the older hd / hd2 variants
    fx_explosion: 'fx_explosion_hd3',
    fx_chain_lightning: 'fx_chain_lightning_hd',
    fx_impact_shock: 'fx_impact_shock_hd3',
    // pickups + potions (hd2)
    pickup_heart: 'pickup_heart_hd2',
    pickup_gold: 'pickup_gold_hd2',
    pickup_bomb: 'pickup_bomb_hd2',
    pickup_magnet: 'pickup_magnet_hd2',
    pickup_chicken: 'pickup_chicken_hd2',
    pickup_potion_hp: 'pickup_potion_hp_hd2',
    pickup_potion_mana: 'pickup_potion_mana_hd2',
    pickup_potion_might: 'pickup_potion_might_hd2',
    pickup_potion_swift: 'pickup_potion_swift_hd2',
    pickup_potion_arcane: 'pickup_potion_arcane_hd2',
    pickup_rune: 'pickup_rune_hd2',
    pickup_scroll: 'pickup_scroll_hd2',
    pickup_xp_blue: 'pickup_xp_blue_hd2',
    pickup_xp_green: 'pickup_xp_green_hd2',
    pickup_xp_red: 'pickup_xp_red_hd2',
  };

  let promoted = 0;
  for (const base in PROMOTE) {
    const hd = PROMOTE[base];
    if (S[hd]) {
      S[base] = S[hd];
      if (F && F[hd] != null) F[base] = F[hd];
      promoted++;
    }
  }
  if (typeof console !== 'undefined') {
    console.info('[hd] promoted ' + promoted + ' sprites to HD art');
  }
})();
