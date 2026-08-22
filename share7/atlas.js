// Atlas builder — turns ASCII sprite arrays into a packed PNG sheet + JSON.
//
// Each animation is laid out as a horizontal strip; strips stack vertically
// per group. The atlas record for each clip is { x, y, w, h, frames, fps }.

(function () {
  const PALETTE = window.PALETTE;
  const SPRITES = window.SPRITES;

  // Default playback rates by sprite kind (frames per second).
  const FPS = {
    // Heroes
    player_walk: 8, knight_walk: 8, warrior_walk: 7,
    mage_walk: 6, huntress_walk: 9, cleric_walk: 6,
    // Enemies
    walker_walk: 3, runner_walk: 10, brute_walk: 3, elite_walk: 3,
    bat_fly: 12, spider_walk: 6, slime_idle: 4, chimera_walk: 3,
    // Bosses
    boss_idle: 4, boss_vampire: 3, boss_skeleton_king: 2, boss_demon: 4,
    // Projectiles
    proj_nova: 8, proj_wand: 14, proj_prism: 10,
    proj_axe: 16, proj_spear: 6, proj_mace: 6, proj_holywater: 6,
    proj_arrow: 16, proj_garlic: 8, proj_bible: 5, proj_cross: 18,
    proj_whip: 14, proj_lightning: 16, proj_firewall: 10,
    proj_knives: 18, proj_scythe: 10, proj_bone: 8,
    // Legendary projectiles
    proj_leg_blade: 8, proj_leg_axe: 18, proj_leg_spear: 8,
    proj_leg_arrow: 16, proj_leg_whip: 14, proj_leg_cross: 22,
    proj_leg_bible: 6, proj_leg_scythe: 12, proj_leg_nova: 10,
    // Trails
    trail_arrow: 20, trail_slash_arc: 18, trail_proj: 14,
    // Pickups
    pickup_xp_blue: 4, pickup_gold: 6, pickup_heart: 3, pickup_bomb: 4,
    pickup_potion_hp: 4, pickup_potion_might: 4, pickup_potion_mana: 4,
    pickup_potion_swift: 4, pickup_potion_arcane: 4,
    pickup_chest: 2, pickup_chest_gold: 2, pickup_rune: 3,
    // Spirits
    spirit_fairy_1: 4, spirit_fairy_2: 4, spirit_fairy_3: 4,
    spirit_water_1: 4, spirit_water_2: 4, spirit_water_3: 4,
    spirit_earth_1: 3, spirit_earth_2: 3, spirit_earth_3: 3,
    spirit_fire_1: 8, spirit_fire_2: 8, spirit_fire_3: 8,
    fx_heal_aura: 12, fx_shield_bubble: 5,
    spirit_atk_fairy: 10, spirit_atk_water: 8,
    spirit_atk_earth: 6, spirit_atk_fire: 12,
    // Impact / weapon-specific reactions
    fx_impact_pierce: 18, fx_impact_slash: 16, fx_impact_bash: 14,
    fx_impact_magic: 14, fx_impact_burn: 12, fx_impact_shock: 18,
    fx_impact_holy: 12, fx_impact_ice: 14, fx_impact_whip: 16,
    // Misc FX
    fx_muzzle: 20, fx_levelup: 10, fx_dust: 10, fx_reticle: 6,
    fx_death_poof: 14, fx_bone_shatter: 12,
    proj_holy_censer: 6,
    proj_vanguard_sword: 8,
    proj_warhammer: 6,
    proj_astral_staff: 8,
    proj_hunters_bow: 10,
    fx_hit: 24, fx_explosion: 20, fx_slash: 24, fx_holywater_splash: 14,
    // Weapon action FX
    fx_swing: 24, fx_boomerang_arc: 14, fx_beam: 24, fx_chain_lightning: 18,
    fx_vortex: 12, fx_summon_circle: 8, fx_fan_burst: 0,
    fx_ground_spike: 18, fx_whirlwind: 16, fx_soul_wisp: 10,
    // More legendaries
    proj_leg_spectral_bow: 6, proj_leg_tempest: 14,
    proj_leg_necro_skull: 6, proj_leg_black_hole: 10, proj_leg_soul_lantern: 5,
    // v3 new content
    wolf_run: 10, goblin_walk: 4, hornet_fly: 18,
    frog_idle: 2, bog_zombie_walk: 3, wisp_float: 8,
    imp_walk: 5, lava_slug_idle: 3, fire_bat_fly: 14,
    frost_wolf_run: 10, yeti_walk: 3, ice_wraith_float: 4,
    boss_werewolf_king: 3, boss_bog_witch: 3, boss_magma_drake: 3,
    boss_ice_queen: 3, boss_treant: 2,
    pickup_vacuum: 6, pickup_hourglass: 3, pickup_star_power: 10,
    pickup_lucky_coin: 8, pickup_soul_crystal: 3, pickup_tome: 4,
    pickup_talisman: 3, pickup_mystic_orb: 6,
    proj_boomerang: 14, proj_crystal_shard: 6, proj_sun_arrow: 8,
    proj_frostblade: 4, proj_plague_dart: 6,
    proj_leg_sun_phoenix: 8, proj_leg_eternal_frost: 5,
    proj_leg_demon_heart: 6, proj_leg_storm_caller: 10,
    proj_leg_world_tree: 4,
  };

  function frameSize(frame) {
    return { w: frame[0].length, h: frame.length };
  }

  // Stamp one ASCII frame onto ctx at (ox, oy), 1 px per char.
  function stampFrame(ctx, frame, ox, oy) {
    for (let y = 0; y < frame.length; y++) {
      const row = frame[y];
      for (let x = 0; x < row.length; x++) {
        const c = row[x];
        if (c === '.' || c === ' ') continue;
        const color = PALETTE[c];
        if (!color) continue;
        ctx.fillStyle = color;
        ctx.fillRect(ox + x, oy + y, 1, 1);
      }
    }
  }

  // Build atlas: pack each clip as a horizontal strip; pad 1 px between sprites.
  function buildAtlas() {
    const entries = [];
    const PAD = 1;
    const MAX_W = 512;
    let cursorX = PAD;
    let cursorY = PAD;
    let rowH = 0;
    let totalW = 0;
    let totalH = 0;

    for (const name in SPRITES) {
      const frames = SPRITES[name];
      const { w, h } = frameSize(frames[0]);
      const stripW = (w + PAD) * frames.length;
      if (cursorX + stripW > MAX_W) {
        cursorX = PAD;
        cursorY += rowH + PAD;
        rowH = 0;
      }
      entries.push({
        name, x: cursorX, y: cursorY, w, h,
        frames: frames.length, fps: FPS[name] ?? 0,
      });
      cursorX += stripW;
      if (h > rowH) rowH = h;
      if (cursorX > totalW) totalW = cursorX;
      if (cursorY + rowH > totalH) totalH = cursorY + rowH;
    }

    totalW = Math.ceil(totalW / 4) * 4;
    totalH = Math.ceil(totalH / 4) * 4;

    const canvas = document.createElement('canvas');
    canvas.width = totalW;
    canvas.height = totalH;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    for (const e of entries) {
      const frames = SPRITES[e.name];
      for (let i = 0; i < frames.length; i++) {
        stampFrame(ctx, frames[i], e.x + i * (e.w + PAD), e.y);
      }
    }

    const atlasJson = {
      meta: {
        image: 'spritesheet.png',
        size: { w: totalW, h: totalH },
        scale: 1,
        format: 'RGBA8888',
        note: 'Each clip is N frames laid out as a horizontal strip starting at (x,y), each frame is (w,h), separated by 1 px pad.',
      },
      clips: {},
    };
    for (const e of entries) {
      atlasJson.clips[e.name] = {
        x: e.x, y: e.y, w: e.w, h: e.h,
        frames: e.frames, fps: e.fps, pad: 1,
      };
    }

    return { canvas, atlasJson, entries };
  }

  function renderFrame(name, frameIdx) {
    const frames = SPRITES[name];
    const idx = ((frameIdx % frames.length) + frames.length) % frames.length;
    const frame = frames[idx];
    const { w, h } = frameSize(frame);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    stampFrame(c.getContext('2d'), frame, 0, 0);
    return c;
  }

  window.AtlasBuilder = { buildAtlas, renderFrame, stampFrame, frameSize, FPS };
})();
