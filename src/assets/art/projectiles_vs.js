// PixelLab-generated weapon projectiles + AoE zones — most are single-frame
// static sprites (renderer rotates by velocity vector). A subset has 8-frame
// animations generated via PixelLab animate_object — those override the
// static render with a frame cycle at ANIM_FPS[slug] (or default 10fps).

// Glob both single-frame and animated folders. Vite resolves URLs eagerly so
// the loader can iterate frame_00{0..7} without runtime fetching.
const PNG_URLS = import.meta.glob('../projectiles_vs/*/frame_*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const PROJECTILES = {
  // basic projectiles
  wand:          'proj_wand',
  axe:           'proj_axe',
  arrow:         'proj_arrow',
  nova:          'proj_nova',
  cross:         'proj_cross',
  lightning:     'proj_lightning',
  knives:        'proj_knives',
  garlic:        'proj_garlic',
  // AoE zone effects
  holywater:     'proj_holywater',
  firewall:      'proj_firewall',
  divine_hammer: 'proj_divine_hammer',
  void_sphere:   'proj_void_sphere',
  // ── v2 rebuild — legendary weapon art (PixelLab legendary_pack) ────────
  leg_blade:            'proj_leg_blade',
  leg_obsidian_blade:   'proj_leg_obsidian_blade',
  leg_judgement_hammer: 'proj_leg_judgement_hammer',
  leg_hammer_of_dawn:   'proj_leg_hammer_of_dawn',
  leg_axe:              'proj_leg_axe',
  leg_spear:            'proj_leg_spear',
  leg_arrow:            'proj_leg_arrow',
  leg_scythe:           'proj_leg_scythe',
  leg_shadow_arrow:     'proj_leg_shadow_arrow',
  leg_phoenix_arrow:    'proj_leg_phoenix_arrow',
  // ── v2 rebuild — mage staff variants (PixelLab wand_rod) ───────────────
  astral_staff:    'proj_astral_staff',
  arcane_orb:      'proj_arcane_orb_v2',
  leg_world_tree:  'proj_leg_world_tree',
  // ── v2 rebuild — bespoke base & legendary art (PixelLab v2 batch) ──────
  meteor:             'proj_meteor',
  ice_spear:          'proj_ice_spear',
  bear_trap:          'proj_bear_trap',
  leg_frozen_throne:  'proj_leg_frozen_throne',
  leg_galaxy_orb:     'proj_leg_galaxy_orb',
  leg_seraph_wing:    'proj_leg_seraph_wing',
  leg_thunder_lord:   'proj_leg_thunder_lord',
  // ── v2 rebuild — priority v2 weapon art (PixelLab batch 2) ─────────────
  solar_flare:        'proj_solar_flare',
  dawnbreaker:        'proj_dawnbreaker',
  anvil_drop:         'proj_anvil_drop',
  titans_grip:        'proj_titans_grip',
  hawk_swarm:         'proj_hawk_swarm',
  marksman_shot:      'proj_marksman_shot',
  chain_void:         'proj_chain_void',
  magma_burst:        'proj_magma_burst',
  // ── v2 rebuild — batch 3 class-themed sprites ──────────────────────────
  holy_nova:          'proj_holy_nova',
  divine_rain:        'proj_divine_rain',
  ember_ring:         'proj_ember_ring',
  whirlwind_blade:    'proj_whirlwind_blade',
  crusader_lance:     'proj_crusader_lance',
  berserker_axe:      'proj_berserker_axe',
  frost_nova:         'proj_frost_nova',
  elemental_burst:    'proj_elemental_burst',
  // ── v2 rebuild — batch 4 sprites ───────────────────────────────────────
  judgement_beam:     'proj_judgement_beam',
  consecrate:         'proj_consecrate',
  spike_burst:        'proj_spike_burst',
  warcry_pulse:       'proj_warcry_pulse',
  barbed_net:         'proj_barbed_net',
  phantom_arrow:      'proj_phantom_arrow',
  inferno_bolt:       'proj_inferno_bolt',
  plasma_orb:         'proj_plasma_orb',
  // ── v2 rebuild — batch 5 sprites ───────────────────────────────────────
  guardian_orbit:     'proj_guardian_orbit',
  gladius_throw:      'proj_gladius_throw',
  piercing_arrow:     'proj_piercing_arrow',
  salvo_shot:         'proj_salvo_shot',
  voltaic_ring:       'proj_voltaic_ring',
  meat_cleaver:       'proj_meat_cleaver',
  // ── v2 rebuild — batch 6 sprites (final v2 + 2 legendary) ──────────────
  aegis_throw:        'proj_aegis_throw',
  chained_spear:      'proj_chained_spear',
  silencer_dart:      'proj_silencer_dart',
  hunters_blade:      'proj_hunters_blade',
  glacial_lance:      'proj_glacial_lance',
  leg_inferno_wall:   'proj_leg_inferno_wall',
  leg_crimson_knives: 'proj_leg_crimson_knives',
  // ── v2 rebuild — mage elemental spell projectiles ─────────────────────
  // Mage weapons fire spells, not the weapon itself. These spell sprites
  // replace weapon-shaped visuals (proj_wand staff, proj_void_sphere staff,
  // etc.) so the projectile reads as a magical effect rather than a
  // physically thrown wand/orb.
  spell_arcane_swirl:   'proj_spell_arcane_swirl',
  spell_lightning_fork: 'proj_spell_lightning_fork',
  spell_shadow_flame:   'proj_spell_shadow_flame',
  spell_rune_circle:    'proj_spell_rune_circle',
  spell_ice_crystal:    'proj_spell_ice_crystal',
  spell_fireball:       'proj_spell_fireball',
  spell_multi_element:  'proj_spell_multi_element',
  spell_poison_orb:     'proj_spell_poison_orb',
};

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('failed to load ' + url));
    img.src = url;
  });
}

// fps per slug for weapons with multi-frame animations (animate_object output).
// Slugs not listed default to 10fps when N>1 frames are present, or 0 (static)
// when only frame_000 exists.
const ANIM_FPS = {
  leg_inferno_wall:  10,
  consecrate:         8,
  magma_burst:        9,
  solar_flare:       10,
  leg_frozen_throne:  6,
  ember_ring:        12,
  voltaic_ring:      14,
  plasma_orb:        12,
  leg_galaxy_orb:     6,
  barbed_net:         6,
};

// Load all sequential frame_00X.png entries for a slug. Returns the canvases
// in order; the registration step picks fps based on count.
async function loadProjectile(slug) {
  const canvases = [];
  for (let i = 0; i < 16; i++) {
    const p = `../projectiles_vs/${slug}/frame_00${i}.png`;
    const u = PNG_URLS[p];
    if (!u) break;
    const img = await loadImage(u);
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0);
    canvases.push(c);
  }
  return canvases.length > 0 ? canvases : null;
}

window.PROJECTILES_VS_LOAD = async function loadProjectilesVS() {
  if (!window.SPRITES) return;
  let n = 0;
  let animated = 0;
  for (const [slug, key] of Object.entries(PROJECTILES)) {
    const frames = await loadProjectile(slug);
    if (!frames) continue;
    const fps = frames.length > 1 ? (ANIM_FPS[slug] ?? 10) : 0;
    window.SPRITES[key] = { __canvasFrames: true, frames, fps };
    if (frames.length > 1) {
      animated += 1;
      if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
        window.AtlasBuilder.FPS[key] = fps;
      }
    }
    n++;
  }
  console.info(
    `[projectiles_vs] registered ${n} VS-style projectiles (${animated} animated)`,
  );
};
