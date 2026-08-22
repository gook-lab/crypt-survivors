// PixelLab projectile sprite registry. Maps weapon sprite names (from
// content/weapons.js `sprite` field) to PNG URLs.
//
// Renderer's projectile texture path: if a projectile's sprite name is
// registered here, the PNG texture is used (rotated to follow velocity
// via spriteBaseAngles) instead of the ASCII art.
//
// Phase 1: just the mage starter wand. Knight cross / warrior axe /
// huntress arrow can be added the same way (download → register here →
// the renderer + spriteAngles do the rest).

export const WEAPON_ASSETS = {
  // Mage wand starter weapon — actual sprite key is proj_spell_arcane_swirl,
  // not proj_wand. Tier S animated (5818d7d7 → d7afb293, pulsing arcane swirl).
  // proj_wand kept as legacy alias pointing at the same frame cycle.
  proj_spell_arcane_swirl: {
    frames: [
      '/projectiles/anim/proj_spell_arcane_swirl_0.png',
      '/projectiles/anim/proj_spell_arcane_swirl_1.png',
      '/projectiles/anim/proj_spell_arcane_swirl_2.png',
      '/projectiles/anim/proj_spell_arcane_swirl_3.png',
      '/projectiles/anim/proj_spell_arcane_swirl_4.png',
    ],
    fps: 12,
  },
  proj_wand: {
    frames: [
      '/projectiles/anim/proj_spell_arcane_swirl_0.png',
      '/projectiles/anim/proj_spell_arcane_swirl_1.png',
      '/projectiles/anim/proj_spell_arcane_swirl_2.png',
      '/projectiles/anim/proj_spell_arcane_swirl_3.png',
      '/projectiles/anim/proj_spell_arcane_swirl_4.png',
    ],
    fps: 12,
  },
  // Knight cross — Tier S animated (e474b005 → 93b4cd5a, spinning holy radiance).
  proj_cross: {
    frames: [
      '/projectiles/anim/proj_cross_0.png',
      '/projectiles/anim/proj_cross_1.png',
      '/projectiles/anim/proj_cross_2.png',
      '/projectiles/anim/proj_cross_3.png',
      '/projectiles/anim/proj_cross_4.png',
    ],
    fps: 10,
  },
  proj_holywater: {                                                      // Batch 13: pre-animated 9f (91b786a3 → 7c3e0a3c, "water splashing")
    frames: [
      '/projectiles/anim/proj_holywater_0.png',
      '/projectiles/anim/proj_holywater_1.png',
      '/projectiles/anim/proj_holywater_2.png',
      '/projectiles/anim/proj_holywater_3.png',
      '/projectiles/anim/proj_holywater_4.png',
      '/projectiles/anim/proj_holywater_5.png',
      '/projectiles/anim/proj_holywater_6.png',
      '/projectiles/anim/proj_holywater_7.png',
      '/projectiles/anim/proj_holywater_8.png',
    ],
    fps: 14,
  },
  // Porta — chain lightning ring (Wave 1) — Tier S animated.
  // tesla_ring: d6cae0f6 → 0c17d3e6 floating gently (electric pulse).
  // storm_crown: dee2a130 → e1691829 crackling golden lightning halo.
  proj_tesla_arc: {
    frames: [
      '/projectiles/anim/proj_tesla_arc_0.png',
      '/projectiles/anim/proj_tesla_arc_1.png',
      '/projectiles/anim/proj_tesla_arc_2.png',
      '/projectiles/anim/proj_tesla_arc_3.png',
      '/projectiles/anim/proj_tesla_arc_4.png',
    ],
    fps: 14,
  },
  proj_storm_arc: {
    frames: [
      '/projectiles/anim/proj_storm_arc_0.png',
      '/projectiles/anim/proj_storm_arc_1.png',
      '/projectiles/anim/proj_storm_arc_2.png',
      '/projectiles/anim/proj_storm_arc_3.png',
      '/projectiles/anim/proj_storm_arc_4.png',
    ],
    fps: 14,
  },
  // Gennaro — multi-dagger volley (Wave 2) — Tier S animated.
  // dagger_fan: 6bf54280 → 64e362eb floating gently (silver knife pulse).
  // dagger_storm: 921434f0 → 8e94accc flipping crimson blood dagger.
  proj_dagger_blade: {
    frames: [
      '/projectiles/anim/proj_dagger_blade_0.png',
      '/projectiles/anim/proj_dagger_blade_1.png',
      '/projectiles/anim/proj_dagger_blade_2.png',
      '/projectiles/anim/proj_dagger_blade_3.png',
      '/projectiles/anim/proj_dagger_blade_4.png',
    ],
    fps: 14,
  },
  proj_dagger_legendary: {
    frames: [
      '/projectiles/anim/proj_dagger_legendary_0.png',
      '/projectiles/anim/proj_dagger_legendary_1.png',
      '/projectiles/anim/proj_dagger_legendary_2.png',
      '/projectiles/anim/proj_dagger_legendary_3.png',
      '/projectiles/anim/proj_dagger_legendary_4.png',
    ],
    fps: 16,
  },
  // Pasqualina — bouncing runetracer (Wave 3) — Tier S animated.
  // runetracer: a5fe2b6b → 5097373d rotating violet rune.
  // nox_runica: e68a8697 → a99b7c76 pulsing void corruption.
  proj_rune_violet: {
    frames: [
      '/projectiles/anim/proj_rune_violet_0.png',
      '/projectiles/anim/proj_rune_violet_1.png',
      '/projectiles/anim/proj_rune_violet_2.png',
      '/projectiles/anim/proj_rune_violet_3.png',
      '/projectiles/anim/proj_rune_violet_4.png',
    ],
    fps: 12,
  },
  proj_rune_void: {
    frames: [
      '/projectiles/anim/proj_rune_void_0.png',
      '/projectiles/anim/proj_rune_void_1.png',
      '/projectiles/anim/proj_rune_void_2.png',
      '/projectiles/anim/proj_rune_void_3.png',
      '/projectiles/anim/proj_rune_void_4.png',
    ],
    fps: 12,
  },
  // Batch 1 sweep — basic-tier projectiles wired from PixelLab review backlog.
  // All review IDs are 1-direction completed objects (no generation cost).
  proj_spear: '/projectiles/proj_spear.png',           // chained iron spear (review 63d8a46f)
  proj_ice_spear: '/projectiles/proj_ice_spear.png',   // crystalline ice spear (review ddd3ac51) — was wired to proj_frost_bolt by mistake; PNG is a halberd-style spear, fits ice_spear weapon, not frost_bolt (basic 빙결 화살)
  proj_bear_trap: '/projectiles/proj_bear_trap.png',   // steel bear trap (review c73cebe3) — placed AoE
  proj_salvo_shot: '/projectiles/proj_salvo_shot.png', // salvo volley dual arrow (review 39178dcb)
  // Batch 2 — 12 more static projectiles (arrows / knives / shields / lances / axes).
  proj_piercing_arrow: {                                                   // basic 관통 화살 — gentle float (ff578555 / bd5b6b6f)
    frames: [
      '/projectiles/anim/proj_piercing_arrow_0.png',
      '/projectiles/anim/proj_piercing_arrow_1.png',
      '/projectiles/anim/proj_piercing_arrow_2.png',
      '/projectiles/anim/proj_piercing_arrow_3.png',
      '/projectiles/anim/proj_piercing_arrow_4.png',
    ],
    fps: 12,
  },
  proj_phantom_arrow: '/projectiles/proj_phantom_arrow.png',    // phantom shadow arrow (17bc8c57)
  // proj_marksman_shot moved to Batch 13 animated entry below (08378e5e → f3d1f24d).
  proj_hunters_blade: '/projectiles/proj_hunters_blade.png',    // hunters throwing knife (f89fc734)
  proj_gladius_throw: '/projectiles/proj_gladius_throw.png',    // gladius dual dagger (77324042)
  proj_spike_burst: '/projectiles/proj_spike_burst.png',        // spike burst (f27040d2)
  proj_aegis_throw: '/projectiles/proj_aegis_throw.png',        // aegis throw shield (b6bb945f)
  proj_guardian_orbit: {                                                   // basic 수호 궤도 — gentle float (343ff99d / 4d33c3d7)
    frames: [
      '/projectiles/anim/proj_guardian_orbit_0.png',
      '/projectiles/anim/proj_guardian_orbit_1.png',
      '/projectiles/anim/proj_guardian_orbit_2.png',
      '/projectiles/anim/proj_guardian_orbit_3.png',
      '/projectiles/anim/proj_guardian_orbit_4.png',
    ],
    fps: 10,
  },
  proj_crusader_lance: '/projectiles/proj_crusader_lance.png',  // crusader lance (817c09de)
  proj_meat_cleaver: '/projectiles/proj_meat_cleaver.png',      // meat cleaver (c28053b6)
  proj_berserker_axe: '/projectiles/proj_berserker_axe.png',    // berserker dual axe (0a8ab354)
  // Batch 3 — 6 more (spinning blades / anvil / nets / pulses / legendary daggers / lightning).
  proj_whirlwind_blade: '/projectiles/proj_whirlwind_blade.png', // whirlwind blade (e413d4dd)
  proj_anvil_drop: '/projectiles/proj_anvil_drop.png',           // massive iron anvil (7b923b8c)
  proj_barbed_net: {                                                     // Batch 13: pre-animated 5f (ab7aa4a3 → 688059cf, "spreading and snapping shut")
    frames: [
      '/projectiles/anim/proj_barbed_net_0.png',
      '/projectiles/anim/proj_barbed_net_1.png',
      '/projectiles/anim/proj_barbed_net_2.png',
      '/projectiles/anim/proj_barbed_net_3.png',
      '/projectiles/anim/proj_barbed_net_4.png',
    ],
    fps: 10,
  },
  proj_warcry_pulse: '/projectiles/proj_warcry_pulse.png',       // warcry sound pulse (9d368efa) — animation pending (PixelLab failed 3x)
  proj_leg_crimson_knives: '/projectiles/proj_leg_crimson_knives.png', // crimson blood knives (b412f62f)
  proj_dawnbreaker: '/projectiles/proj_dawnbreaker.png',         // dawnbreaker holy lightning (30422565)
  // Batch 5 — orbital basic + legendary tier wire-ups.
  proj_leg_seraph_wing: '/projectiles/proj_leg_seraph_wing.png',   // seraph angelic wing (a285d7d5)
  proj_leg_frozen_throne: '/projectiles/proj_leg_frozen_throne.png', // frozen throne AoE (bb9afc1d)
  proj_leg_inferno_wall: '/projectiles/proj_leg_inferno_wall.png',   // infernal flame wall (0f95d6d9)
  proj_leg_demon_heart: '/projectiles/proj_leg_demon_heart.png',     // purple plasma sphere (3987bbb9) — demon heart pulsing core
  // Batch 7 — mined from completed asset pool (no select_object_frames needed
  // because these were already promoted in earlier sessions).
  proj_meteor: '/projectiles/proj_meteor.png',                           // falling meteor projectile (basic 운석)
  proj_elemental_burst: '/projectiles/proj_elemental_burst.png',         // elemental burst spell (basic 원소 폭발)
  proj_glacial_lance: '/projectiles/proj_glacial_lance.png',             // glacial lance (legendary 빙하 창)
  proj_spell_ice_crystal: '/projectiles/proj_glacial_lance.png',         // prism + a leg weapon share this sprite key — reuse glacial lance PNG
  proj_hawk_swarm: '/projectiles/proj_hawk_swarm.png',                   // flying hawk variant (basic 매 무리)
  proj_spell_rune_circle: '/projectiles/proj_spell_rune_circle.png',     // violet arcane rune (basic 아케인 미사일)
  proj_consecrate: '/projectiles/proj_consecrate.png',                   // golden magic glyph (basic 성지화)
  proj_leg_thunder_lord: '/projectiles/proj_leg_thunder_lord.png',       // thunder lord lightning (legendary 뇌신의 권능)
  // Batch 8 — final sweep from completed pool tagged with weapon sprite keys.
  // Arrow Tier S animated (330e354a → f80fd997, east-pointing flying — note:
  // new PNG is east-oriented, so the legacy -PI/2 spriteAngles entry was removed).
  proj_arrow: {
    frames: [
      '/projectiles/anim/proj_arrow_0.png',
      '/projectiles/anim/proj_arrow_1.png',
      '/projectiles/anim/proj_arrow_2.png',
      '/projectiles/anim/proj_arrow_3.png',
      '/projectiles/anim/proj_arrow_4.png',
    ],
    fps: 12,
  },
  proj_knives: {                                                         // Batch 13: animated 5f (49d0dc59 → 2e2bd319, spinning) — basic knives starter
    frames: [
      '/projectiles/anim/proj_knives_0.png',
      '/projectiles/anim/proj_knives_1.png',
      '/projectiles/anim/proj_knives_2.png',
      '/projectiles/anim/proj_knives_3.png',
      '/projectiles/anim/proj_knives_4.png',
    ],
    fps: 14,
  },
  proj_nova: {                                                           // Batch 13: animated 5f (04e3b4ea → a4ed4b45, pulsing)
    frames: [
      '/projectiles/anim/proj_nova_0.png',
      '/projectiles/anim/proj_nova_1.png',
      '/projectiles/anim/proj_nova_2.png',
      '/projectiles/anim/proj_nova_3.png',
      '/projectiles/anim/proj_nova_4.png',
    ],
    fps: 12,
  },
  fx_slash: '/projectiles/fx_slash.png',                                 // sword slash arc (basic 검 — melee fx sprite)
  fx_swing: '/projectiles/fx_swing.png',                                 // huge wide horizontal sword (leg 강철 사슬 채찍 — uses fx_swing)
  proj_leg_judgement_hammer: '/projectiles/proj_leg_judgement_hammer.png', // divine golden hammer slam (leg 심판의 망치)
  proj_leg_black_hole: '/projectiles/proj_leg_black_hole.png',           // dark void vortex (leg 블랙홀 룬)
  proj_leg_blade: {                                                       // legendary 여명의 검기 — frost-holy 5프레임 (c376a89c)
    frames: [
      '/projectiles/anim/leg_blade_0.png',
      '/projectiles/anim/leg_blade_1.png',
      '/projectiles/anim/leg_blade_2.png',
      '/projectiles/anim/leg_blade_3.png',
      '/projectiles/anim/leg_blade_4.png',
    ],
    fps: 14,
  },
  proj_leg_scythe: {                                                      // legendary 사신의 낫 — near-white orb tinted necrotic violet 5프레임 (c046e23a)
    frames: [
      '/projectiles/anim/leg_scythe_0.png',
      '/projectiles/anim/leg_scythe_1.png',
      '/projectiles/anim/leg_scythe_2.png',
      '/projectiles/anim/leg_scythe_3.png',
      '/projectiles/anim/leg_scythe_4.png',
    ],
    fps: 16,
  },
  proj_leg_whip: {                                                        // legendary 강철 사슬 채찍 — crimson chain lash 5프레임 (e4de77d5)
    frames: [
      '/projectiles/anim/leg_whip_0.png',
      '/projectiles/anim/leg_whip_1.png',
      '/projectiles/anim/leg_whip_2.png',
      '/projectiles/anim/leg_whip_3.png',
      '/projectiles/anim/leg_whip_4.png',
    ],
    fps: 18,
  },
  proj_leg_obsidian_blade: {                                              // legendary 흑요석 검 — purple-black shadow slash 5프레임 (3716b669)
    frames: [
      '/projectiles/anim/leg_obsidian_blade_0.png',
      '/projectiles/anim/leg_obsidian_blade_1.png',
      '/projectiles/anim/leg_obsidian_blade_2.png',
      '/projectiles/anim/leg_obsidian_blade_3.png',
      '/projectiles/anim/leg_obsidian_blade_4.png',
    ],
    fps: 16,
  },
  // Batch 9 — confident shape-matched additions.
  proj_leg_axe: '/projectiles/proj_leg_axe.png',                         // spinning battle axe (leg 폭풍 도끼)
  proj_leg_galaxy_orb: '/projectiles/proj_leg_galaxy_orb.png',           // purple arcane nova orb (leg 은하의 핵)
  fx_explosion: '/projectiles/fx_explosion.png',                         // huge fire explosion (fallback for melee fx_explosion sprite weapons)
  // Batch 10 — legendary collection 14-pack bulk-distributed (user OK'd rough
  // mapping since in-game skills fire their own distinct projectiles).
  proj_leg_spear: '/projectiles/proj_leg_spear.png',                     // 미스릴 할버드
  proj_leg_arrow: '/projectiles/proj_leg_arrow.png',                     // 은룡의 화살
  proj_leg_cross: '/projectiles/proj_leg_cross.png',                     // 작열 십자가
  proj_leg_bible: '/projectiles/proj_leg_bible.png',                     // 성광서
  proj_leg_nova: '/projectiles/proj_leg_nova.png',                       // 황금 태양
  proj_leg_spectral_bow: '/projectiles/proj_leg_spectral_bow.png',       // 유령의 활
  proj_leg_tempest: '/projectiles/proj_leg_tempest.png',                 // 템페스트 해머
  proj_leg_necro_skull: '/projectiles/proj_leg_necro_skull.png',         // 네크로 스쿨
  proj_leg_soul_lantern: '/projectiles/proj_leg_soul_lantern.png',       // 영혼의 등
  proj_leg_sun_phoenix: '/projectiles/proj_leg_sun_phoenix.png',         // 태양의 봉황활
  proj_leg_eternal_frost: '/projectiles/proj_leg_eternal_frost.png',     // 영원의 빙결
  proj_leg_storm_caller: '/projectiles/proj_leg_storm_caller.png',       // 폭풍 소환자
  proj_leg_world_tree: '/projectiles/proj_leg_world_tree.png',           // 세계수의 가지
  // Exclusive + basic 추가 — astral_staff Tier S animated (0d3f2cc6 → f1b2d40b,
  // pulsing cosmic radiance).
  proj_astral_staff: {
    frames: [
      '/projectiles/anim/proj_astral_staff_0.png',
      '/projectiles/anim/proj_astral_staff_1.png',
      '/projectiles/anim/proj_astral_staff_2.png',
      '/projectiles/anim/proj_astral_staff_3.png',
      '/projectiles/anim/proj_astral_staff_4.png',
    ],
    fps: 12,
  },
  proj_hunters_bow: {                                                    // 사냥꾼의 활 (exclusive) — green energy arrow 5-frame streak (aee107cb)
    frames: [
      '/projectiles/anim/proj_hunters_bow_0.png',
      '/projectiles/anim/proj_hunters_bow_1.png',
      '/projectiles/anim/proj_hunters_bow_2.png',
      '/projectiles/anim/proj_hunters_bow_3.png',
      '/projectiles/anim/proj_hunters_bow_4.png',
    ],
    fps: 12,
  },
  proj_holy_censer: '/projectiles/proj_holy_censer.png',                 // 신성 향로 (exclusive)
  proj_heal_beam: '/projectiles/proj_heal_beam.png',                     // 치유의 빛줄기 (basic)
  proj_sanctuary: '/projectiles/proj_sanctuary.png',                     // 성역 의식 (basic)
  // aoeKit 무기들의 정적 sprite 추가 (기존 aoeKit telegraph/drop은 hover tooltip
  // 용이고, 카드 썸네일은 weaponAssets.js를 봄)
  proj_divine_hammer: '/projectiles/proj_divine_hammer.png',             // 신성 망치
  proj_firewall: {                                                       // Batch 13: pre-animated 9f (1db4dce3 → 7f45b6cb, "flames dancing")
    frames: [
      '/projectiles/anim/proj_firewall_0.png',
      '/projectiles/anim/proj_firewall_1.png',
      '/projectiles/anim/proj_firewall_2.png',
      '/projectiles/anim/proj_firewall_3.png',
      '/projectiles/anim/proj_firewall_4.png',
      '/projectiles/anim/proj_firewall_5.png',
      '/projectiles/anim/proj_firewall_6.png',
      '/projectiles/anim/proj_firewall_7.png',
      '/projectiles/anim/proj_firewall_8.png',
    ],
    fps: 14,
  },
  proj_void_sphere: '/projectiles/proj_void_sphere.png',                 // 공허 구체 + leg 공허 붕괴 (sprite 공유)
  // Warhammer Tier S animated (6d8f0138 → 173c65a4, spinning rotating slowly).
  proj_warhammer: {
    frames: [
      '/projectiles/anim/proj_warhammer_0.png',
      '/projectiles/anim/proj_warhammer_1.png',
      '/projectiles/anim/proj_warhammer_2.png',
      '/projectiles/anim/proj_warhammer_3.png',
      '/projectiles/anim/proj_warhammer_4.png',
    ],
    fps: 10,
  },
  proj_smite: '/sigs/smite_drop.png',                                    // 천벌 (existing smite drop asset 재활용)
  // Batch 11 — basic orphan sweep from review pool (frame [8] each).
  proj_scythe: '/projectiles/proj_scythe.png',               // iron scythe (14e56aaf) — animation pending (PixelLab failed 4x)
  // proj_lightning static entry was here — superseded by animated {frames, fps}
  // entry below (Batch 12 chain lightning crackle 5f, fc42a65e → b6a35f08).
  // Batch 13 (2026-05-22) — 7 weapons promoted to {frames, fps} animations.
  proj_holy_nova: {
    frames: [
      '/projectiles/anim/proj_holy_nova_0.png',
      '/projectiles/anim/proj_holy_nova_1.png',
      '/projectiles/anim/proj_holy_nova_2.png',
      '/projectiles/anim/proj_holy_nova_3.png',
      '/projectiles/anim/proj_holy_nova_4.png',
    ],
    fps: 12,
  },
  proj_divine_rain: {
    frames: [
      '/projectiles/anim/proj_divine_rain_0.png',
      '/projectiles/anim/proj_divine_rain_1.png',
      '/projectiles/anim/proj_divine_rain_2.png',
      '/projectiles/anim/proj_divine_rain_3.png',
      '/projectiles/anim/proj_divine_rain_4.png',
    ],
    fps: 14,
  },
  proj_judgement_beam: {
    frames: [
      '/projectiles/anim/proj_judgement_beam_0.png',
      '/projectiles/anim/proj_judgement_beam_1.png',
      '/projectiles/anim/proj_judgement_beam_2.png',
      '/projectiles/anim/proj_judgement_beam_3.png',
      '/projectiles/anim/proj_judgement_beam_4.png',
    ],
    fps: 12,
  },
  proj_chain_void: {
    frames: [
      '/projectiles/anim/proj_chain_void_0.png',
      '/projectiles/anim/proj_chain_void_1.png',
      '/projectiles/anim/proj_chain_void_2.png',
      '/projectiles/anim/proj_chain_void_3.png',
      '/projectiles/anim/proj_chain_void_4.png',
    ],
    fps: 14,
  },
  proj_frost_nova: {
    frames: [
      '/projectiles/anim/proj_frost_nova_0.png',
      '/projectiles/anim/proj_frost_nova_1.png',
      '/projectiles/anim/proj_frost_nova_2.png',
      '/projectiles/anim/proj_frost_nova_3.png',
      '/projectiles/anim/proj_frost_nova_4.png',
    ],
    fps: 12,
  },
  proj_magma_burst: {
    frames: [
      '/projectiles/anim/proj_magma_burst_0.png',
      '/projectiles/anim/proj_magma_burst_1.png',
      '/projectiles/anim/proj_magma_burst_2.png',
      '/projectiles/anim/proj_magma_burst_3.png',
      '/projectiles/anim/proj_magma_burst_4.png',
    ],
    fps: 12,
  },
  proj_marksman_shot: {
    frames: [
      '/projectiles/anim/proj_marksman_shot_0.png',
      '/projectiles/anim/proj_marksman_shot_1.png',
      '/projectiles/anim/proj_marksman_shot_2.png',
      '/projectiles/anim/proj_marksman_shot_3.png',
      '/projectiles/anim/proj_marksman_shot_4.png',
    ],
    fps: 14,
  },
  // Batch 12 — ASCII fallback rescues via PNG aliasing (no new generation).
  // These weapon sprite keys reference PNGs already on disk under different
  // names; map them so the renderer's PNG path wins over ASCII fallback.
  proj_spell_shadow_flame: '/projectiles/proj_void_sphere.png',       // 공허 구체 (basic) — same purple galaxy swirl
  proj_leg_shadow_arrow: '/projectiles/proj_phantom_arrow.png',       // 그림자 화살 (leg) — phantom shadow arrow reuse
  proj_leg_hammer_of_dawn: '/projectiles/proj_divine_rain.png',       // 여명의 망치 (leg) — divine falling hammer fits rain pattern
  proj_arcane_orb_v2: '/projectiles/proj_spell_arcane_swirl.png',     // 아케인 오브 (basic) — purple arcane swirl shared with mage wand
  // Tier S 4-frame animation pilot — proj_axe (Warrior starter). Object
  // 65c11b27 → animation bb744656 → 5 frames cycling at 10fps (full spin
  // ~0.5s feels right for a boomerang axe). Renderer's pngTexture caches
  // each frame URL; first cycle has a one-frame flash if not preloaded.
  proj_axe: {
    frames: [
      '/projectiles/anim/proj_axe_0.png',
      '/projectiles/anim/proj_axe_1.png',
      '/projectiles/anim/proj_axe_2.png',
      '/projectiles/anim/proj_axe_3.png',
      '/projectiles/anim/proj_axe_4.png',
    ],
    fps: 10,
  },
  // Batch 12 — chain test: lightning crackle 5-frame (fc42a65e). east-pointing,
  // default spriteAngle offset (0). chain pattern spawns new entities on hop,
  // each carries weaponId so one-at-a-time keeps fire blocked until the last
  // bolt fizzles.
  proj_lightning: {
    frames: [
      '/projectiles/anim/proj_lightning_0.png',
      '/projectiles/anim/proj_lightning_1.png',
      '/projectiles/anim/proj_lightning_2.png',
      '/projectiles/anim/proj_lightning_3.png',
      '/projectiles/anim/proj_lightning_4.png',
    ],
    fps: 14,
  },
  // vanguard_sword (knight exclusive) — golden holy crescent slash arc.
  // East-pointing PNG (no spriteAngles entry needed). Source object
  // 80489f55 → animation 6cb8244d → 5 frames. fps higher (16) because
  // a slash should snap-feel rather than linger.
  proj_vanguard_slash: {
    frames: [
      '/projectiles/anim/vanguard_sword_0.png',
      '/projectiles/anim/vanguard_sword_1.png',
      '/projectiles/anim/vanguard_sword_2.png',
      '/projectiles/anim/vanguard_sword_3.png',
      '/projectiles/anim/vanguard_sword_4.png',
    ],
    fps: 16,
  },
  // Batch 11 — review-queue promote (no new generations).
  proj_barbed_net: {                                                       // basic 가시 그물 — net spread+snap (ab7aa4a3 / 688059cf)
    frames: [
      '/projectiles/anim/proj_barbed_net_0.png',
      '/projectiles/anim/proj_barbed_net_1.png',
      '/projectiles/anim/proj_barbed_net_2.png',
      '/projectiles/anim/proj_barbed_net_3.png',
      '/projectiles/anim/proj_barbed_net_4.png',
    ],
    fps: 10,
  },
  proj_aegis_throw: {                                                      // basic 방패 던지기 — slow spin (edc1a080 / 48dd05d6)
    frames: [
      '/projectiles/anim/proj_aegis_throw_0.png',
      '/projectiles/anim/proj_aegis_throw_1.png',
      '/projectiles/anim/proj_aegis_throw_2.png',
      '/projectiles/anim/proj_aegis_throw_3.png',
      '/projectiles/anim/proj_aegis_throw_4.png',
    ],
    fps: 12,
  },
  proj_anvil_drop: {                                                       // basic 모루 낙하 — sky-drop fall (fbd4e8a4 / 3c7da588)
    frames: [
      '/projectiles/anim/proj_anvil_drop_0.png',
      '/projectiles/anim/proj_anvil_drop_1.png',
      '/projectiles/anim/proj_anvil_drop_2.png',
      '/projectiles/anim/proj_anvil_drop_3.png',
      '/projectiles/anim/proj_anvil_drop_4.png',
    ],
    fps: 10,
  },
  proj_whirlwind_blade: {                                                  // basic 회오리 검 — gentle float (c75cb94c / 4dfdc22a)
    frames: [
      '/projectiles/anim/proj_whirlwind_blade_0.png',
      '/projectiles/anim/proj_whirlwind_blade_1.png',
      '/projectiles/anim/proj_whirlwind_blade_2.png',
      '/projectiles/anim/proj_whirlwind_blade_3.png',
      '/projectiles/anim/proj_whirlwind_blade_4.png',
    ],
    fps: 14,
  },
  proj_bear_trap: {                                                        // basic 곰덫 — gentle float (e81e1c31 / d64f7bfa)
    frames: [
      '/projectiles/anim/proj_bear_trap_0.png',
      '/projectiles/anim/proj_bear_trap_1.png',
      '/projectiles/anim/proj_bear_trap_2.png',
      '/projectiles/anim/proj_bear_trap_3.png',
      '/projectiles/anim/proj_bear_trap_4.png',
    ],
    fps: 8,
  },
  proj_salvo_shot: {                                                       // basic 살보 화살 — gentle float (228e2755 / 7d44b463)
    frames: [
      '/projectiles/anim/proj_salvo_shot_0.png',
      '/projectiles/anim/proj_salvo_shot_1.png',
      '/projectiles/anim/proj_salvo_shot_2.png',
      '/projectiles/anim/proj_salvo_shot_3.png',
      '/projectiles/anim/proj_salvo_shot_4.png',
    ],
    fps: 12,
  },
  // Batch 15 — alternate-source promote (보류 6 중 4개 성공).
  proj_meat_cleaver: {                                                     // basic 정육 칼 — gentle float (alt 45707869 → b524a314 / a7e1f8d8)
    frames: [
      '/projectiles/anim/proj_meat_cleaver_0.png',
      '/projectiles/anim/proj_meat_cleaver_1.png',
      '/projectiles/anim/proj_meat_cleaver_2.png',
      '/projectiles/anim/proj_meat_cleaver_3.png',
      '/projectiles/anim/proj_meat_cleaver_4.png',
    ],
    fps: 12,
  },
  proj_gladius_throw: {                                                    // basic 글라디우스 투척 — gentle float (alt 77324042 → 21219f5a / 088abf44)
    frames: [
      '/projectiles/anim/proj_gladius_throw_0.png',
      '/projectiles/anim/proj_gladius_throw_1.png',
      '/projectiles/anim/proj_gladius_throw_2.png',
      '/projectiles/anim/proj_gladius_throw_3.png',
      '/projectiles/anim/proj_gladius_throw_4.png',
    ],
    fps: 14,
  },
  proj_warcry_pulse: {                                                     // basic 전투함성 펄스 — pulsing (alt 9d368efa → 178c3608 / cc1e6b19)
    frames: [
      '/projectiles/anim/proj_warcry_pulse_0.png',
      '/projectiles/anim/proj_warcry_pulse_1.png',
      '/projectiles/anim/proj_warcry_pulse_2.png',
      '/projectiles/anim/proj_warcry_pulse_3.png',
      '/projectiles/anim/proj_warcry_pulse_4.png',
    ],
    fps: 10,
  },
  proj_spike_burst: {                                                      // basic 가시 폭발 — shimmering (alt f27040d2 → 447fa9fa / 6022eb00)
    frames: [
      '/projectiles/anim/proj_spike_burst_0.png',
      '/projectiles/anim/proj_spike_burst_1.png',
      '/projectiles/anim/proj_spike_burst_2.png',
      '/projectiles/anim/proj_spike_burst_3.png',
      '/projectiles/anim/proj_spike_burst_4.png',
    ],
    fps: 14,
  },
  proj_berserker_axe: {                                                    // basic 광전사 도끼 — rotating (alt 0a8ab354 → ca1cb665 / 45e77a9c) — 3 verb 시도 끝에 rotating으로 성공
    frames: [
      '/projectiles/anim/proj_berserker_axe_0.png',
      '/projectiles/anim/proj_berserker_axe_1.png',
      '/projectiles/anim/proj_berserker_axe_2.png',
      '/projectiles/anim/proj_berserker_axe_3.png',
      '/projectiles/anim/proj_berserker_axe_4.png',
    ],
    fps: 12,
  },
  proj_crusader_lance: {                                                   // basic 십자군 창 — drifting (alt 817c09de → 435ea555 / 628594d3) — 3 verb 시도 끝에 drifting으로 성공
    frames: [
      '/projectiles/anim/proj_crusader_lance_0.png',
      '/projectiles/anim/proj_crusader_lance_1.png',
      '/projectiles/anim/proj_crusader_lance_2.png',
      '/projectiles/anim/proj_crusader_lance_3.png',
      '/projectiles/anim/proj_crusader_lance_4.png',
    ],
    fps: 12,
  },
  // Batch 16 — 6/8 success (meteor + spear holdover, 3차 verb 모두 fail).
  proj_dawnbreaker: {                                                      // basic 여명의 일격 — floating (30422565 → 2be9f868 / 7e0997bc)
    frames: [
      '/projectiles/anim/proj_dawnbreaker_0.png',
      '/projectiles/anim/proj_dawnbreaker_1.png',
      '/projectiles/anim/proj_dawnbreaker_2.png',
      '/projectiles/anim/proj_dawnbreaker_3.png',
      '/projectiles/anim/proj_dawnbreaker_4.png',
    ],
    fps: 12,
  },
  proj_hunters_blade: {                                                    // basic 사냥꾼 검 — floating (f89fc734 → 00585024 / d297d25c)
    frames: [
      '/projectiles/anim/proj_hunters_blade_0.png',
      '/projectiles/anim/proj_hunters_blade_1.png',
      '/projectiles/anim/proj_hunters_blade_2.png',
      '/projectiles/anim/proj_hunters_blade_3.png',
      '/projectiles/anim/proj_hunters_blade_4.png',
    ],
    fps: 14,
  },
  proj_scythe: {                                                           // basic 낫 — swinging (e1b4e9d9 → eb9c1e32 / a8092268)
    frames: [
      '/projectiles/anim/proj_scythe_0.png',
      '/projectiles/anim/proj_scythe_1.png',
      '/projectiles/anim/proj_scythe_2.png',
      '/projectiles/anim/proj_scythe_3.png',
      '/projectiles/anim/proj_scythe_4.png',
    ],
    fps: 12,
  },
  proj_ice_spear: {                                                        // basic 얼음 창 — drifting (ddd3ac51 → 2a20c256 / a4059f45)
    frames: [
      '/projectiles/anim/proj_ice_spear_0.png',
      '/projectiles/anim/proj_ice_spear_1.png',
      '/projectiles/anim/proj_ice_spear_2.png',
      '/projectiles/anim/proj_ice_spear_3.png',
      '/projectiles/anim/proj_ice_spear_4.png',
    ],
    fps: 12,
  },
  proj_divine_hammer: {                                                    // basic 신성한 망치 — rotating (7b923b8c → d3e1d94d / 70efb7a0)
    frames: [
      '/projectiles/anim/proj_divine_hammer_0.png',
      '/projectiles/anim/proj_divine_hammer_1.png',
      '/projectiles/anim/proj_divine_hammer_2.png',
      '/projectiles/anim/proj_divine_hammer_3.png',
      '/projectiles/anim/proj_divine_hammer_4.png',
    ],
    fps: 10,
  },
  proj_phantom_arrow: {                                                    // basic 환영 화살 — shimmering (17bc8c57 → 4e18200d / b832e13d)
    frames: [
      '/projectiles/anim/proj_phantom_arrow_0.png',
      '/projectiles/anim/proj_phantom_arrow_1.png',
      '/projectiles/anim/proj_phantom_arrow_2.png',
      '/projectiles/anim/proj_phantom_arrow_3.png',
      '/projectiles/anim/proj_phantom_arrow_4.png',
    ],
    fps: 14,
  },
  // Batch 17 — 6/8 success (spell_shadow_flame + elemental_burst holdover).
  proj_consecrate: {                                                       // basic 성역 의식 — floating (2e828d16 → a2eb517a / 8f2ecf43)
    frames: [
      '/projectiles/anim/proj_consecrate_0.png',
      '/projectiles/anim/proj_consecrate_1.png',
      '/projectiles/anim/proj_consecrate_2.png',
      '/projectiles/anim/proj_consecrate_3.png',
      '/projectiles/anim/proj_consecrate_4.png',
    ],
    fps: 10,
  },
  proj_glacial_lance: {                                                    // basic 빙하 창 — floating (9b3ae4d0 → 008bbcac / b046bf07)
    frames: [
      '/projectiles/anim/proj_glacial_lance_0.png',
      '/projectiles/anim/proj_glacial_lance_1.png',
      '/projectiles/anim/proj_glacial_lance_2.png',
      '/projectiles/anim/proj_glacial_lance_3.png',
      '/projectiles/anim/proj_glacial_lance_4.png',
    ],
    fps: 12,
  },
  proj_smite: {                                                            // basic 천벌 — pulsing (5e21eb7e → 7719d4db / 7dbecfcb)
    frames: [
      '/projectiles/anim/proj_smite_0.png',
      '/projectiles/anim/proj_smite_1.png',
      '/projectiles/anim/proj_smite_2.png',
      '/projectiles/anim/proj_smite_3.png',
      '/projectiles/anim/proj_smite_4.png',
    ],
    fps: 14,
  },
  proj_throw_axes: {                                                       // basic 도끼 던지기 — spinning (2ab67c37 → e5f5ae1c / f462df9c)
    frames: [
      '/projectiles/anim/proj_throw_axes_0.png',
      '/projectiles/anim/proj_throw_axes_1.png',
      '/projectiles/anim/proj_throw_axes_2.png',
      '/projectiles/anim/proj_throw_axes_3.png',
      '/projectiles/anim/proj_throw_axes_4.png',
    ],
    fps: 12,
  },
  proj_shield_throw: {                                                     // basic 방패 투척 — shimmering (b6bb945f → 39549f2f / 0e4b4778)
    frames: [
      '/projectiles/anim/proj_shield_throw_0.png',
      '/projectiles/anim/proj_shield_throw_1.png',
      '/projectiles/anim/proj_shield_throw_2.png',
      '/projectiles/anim/proj_shield_throw_3.png',
      '/projectiles/anim/proj_shield_throw_4.png',
    ],
    fps: 12,
  },
  proj_spell_rune_circle: {                                                // basic 마법 룬 원 — glowing (4ec38e59 → a35d10d0 / bef8556f)
    frames: [
      '/projectiles/anim/proj_spell_rune_circle_0.png',
      '/projectiles/anim/proj_spell_rune_circle_1.png',
      '/projectiles/anim/proj_spell_rune_circle_2.png',
      '/projectiles/anim/proj_spell_rune_circle_3.png',
      '/projectiles/anim/proj_spell_rune_circle_4.png',
    ],
    fps: 10,
  },
  // Batch 18 — 6/8 legendary success (leg_frozen_throne + leg_seraph_wing holdover).
  proj_leg_arrow: {                                                        // legendary 화살 — floating (5d5fd336 → 4715958a / 9dd05b18)
    frames: [
      '/projectiles/anim/proj_leg_arrow_0.png',
      '/projectiles/anim/proj_leg_arrow_1.png',
      '/projectiles/anim/proj_leg_arrow_2.png',
      '/projectiles/anim/proj_leg_arrow_3.png',
      '/projectiles/anim/proj_leg_arrow_4.png',
    ],
    fps: 12,
  },
  proj_leg_axe: {                                                          // legendary 도끼 — floating (72bfb3d0 → bbf83306 / fb04c248)
    frames: [
      '/projectiles/anim/proj_leg_axe_0.png',
      '/projectiles/anim/proj_leg_axe_1.png',
      '/projectiles/anim/proj_leg_axe_2.png',
      '/projectiles/anim/proj_leg_axe_3.png',
      '/projectiles/anim/proj_leg_axe_4.png',
    ],
    fps: 10,
  },
  proj_leg_bible: {                                                        // legendary 마법서 — glowing (02951f23 → 70fb3b84 / e08af5b3)
    frames: [
      '/projectiles/anim/proj_leg_bible_0.png',
      '/projectiles/anim/proj_leg_bible_1.png',
      '/projectiles/anim/proj_leg_bible_2.png',
      '/projectiles/anim/proj_leg_bible_3.png',
      '/projectiles/anim/proj_leg_bible_4.png',
    ],
    fps: 10,
  },
  proj_leg_crimson_knives: {                                               // legendary 핏빛 칼 — spinning (b412f62f → e29ca747 / 43e36afa)
    frames: [
      '/projectiles/anim/proj_leg_crimson_knives_0.png',
      '/projectiles/anim/proj_leg_crimson_knives_1.png',
      '/projectiles/anim/proj_leg_crimson_knives_2.png',
      '/projectiles/anim/proj_leg_crimson_knives_3.png',
      '/projectiles/anim/proj_leg_crimson_knives_4.png',
    ],
    fps: 14,
  },
  proj_leg_cross: {                                                        // legendary 십자가 — glowing (32d5f34a → e09531db / 979d677d)
    frames: [
      '/projectiles/anim/proj_leg_cross_0.png',
      '/projectiles/anim/proj_leg_cross_1.png',
      '/projectiles/anim/proj_leg_cross_2.png',
      '/projectiles/anim/proj_leg_cross_3.png',
      '/projectiles/anim/proj_leg_cross_4.png',
    ],
    fps: 12,
  },
  proj_leg_inferno_wall: {                                                 // legendary 지옥 화염벽 — swirling (0f95d6d9 → 8df4f91d / f349cdb1)
    frames: [
      '/projectiles/anim/proj_leg_inferno_wall_0.png',
      '/projectiles/anim/proj_leg_inferno_wall_1.png',
      '/projectiles/anim/proj_leg_inferno_wall_2.png',
      '/projectiles/anim/proj_leg_inferno_wall_3.png',
      '/projectiles/anim/proj_leg_inferno_wall_4.png',
    ],
    fps: 14,
  },
  // Batch 19 — holdover 4차 verb recovery (2/6 회복).
  proj_meteor: {                                                           // basic 운석 — spinning (6062d5a0 → db604e0e / b207866d, 4차 verb)
    frames: [
      '/projectiles/anim/proj_meteor_0.png',
      '/projectiles/anim/proj_meteor_1.png',
      '/projectiles/anim/proj_meteor_2.png',
      '/projectiles/anim/proj_meteor_3.png',
      '/projectiles/anim/proj_meteor_4.png',
    ],
    fps: 12,
  },
  proj_spear: {                                                            // basic 창 — shimmering (63d8a46f → e9849e73 / a7f28f67, 4차 verb)
    frames: [
      '/projectiles/anim/proj_spear_0.png',
      '/projectiles/anim/proj_spear_1.png',
      '/projectiles/anim/proj_spear_2.png',
      '/projectiles/anim/proj_spear_3.png',
      '/projectiles/anim/proj_spear_4.png',
    ],
    fps: 12,
  },
  // Batch 20 — 5/6 legendary success (leg_thunder_lord holdover).
  proj_leg_galaxy_orb: {                                                   // legendary 은하 구슬 — floating (54172048 → 1632f491 / 901bfd9d)
    frames: [
      '/projectiles/anim/proj_leg_galaxy_orb_0.png',
      '/projectiles/anim/proj_leg_galaxy_orb_1.png',
      '/projectiles/anim/proj_leg_galaxy_orb_2.png',
      '/projectiles/anim/proj_leg_galaxy_orb_3.png',
      '/projectiles/anim/proj_leg_galaxy_orb_4.png',
    ],
    fps: 10,
  },
  proj_leg_hammer_of_dawn: {                                               // legendary 여명의 망치 — floating (3c94607c → 79524a5d / 2908ace3)
    frames: [
      '/projectiles/anim/proj_leg_hammer_of_dawn_0.png',
      '/projectiles/anim/proj_leg_hammer_of_dawn_1.png',
      '/projectiles/anim/proj_leg_hammer_of_dawn_2.png',
      '/projectiles/anim/proj_leg_hammer_of_dawn_3.png',
      '/projectiles/anim/proj_leg_hammer_of_dawn_4.png',
    ],
    fps: 12,
  },
  proj_leg_nova: {                                                         // legendary 노바 — glowing (526a260e → 3b7e75ce / 4005f47b)
    frames: [
      '/projectiles/anim/proj_leg_nova_0.png',
      '/projectiles/anim/proj_leg_nova_1.png',
      '/projectiles/anim/proj_leg_nova_2.png',
      '/projectiles/anim/proj_leg_nova_3.png',
      '/projectiles/anim/proj_leg_nova_4.png',
    ],
    fps: 10,
  },
  proj_leg_sun_phoenix: {                                                  // legendary 태양 봉황 — pulsing (cc44ee62 → 5607c9e4 / dfeda269)
    frames: [
      '/projectiles/anim/proj_leg_sun_phoenix_0.png',
      '/projectiles/anim/proj_leg_sun_phoenix_1.png',
      '/projectiles/anim/proj_leg_sun_phoenix_2.png',
      '/projectiles/anim/proj_leg_sun_phoenix_3.png',
      '/projectiles/anim/proj_leg_sun_phoenix_4.png',
    ],
    fps: 12,
  },
  proj_leg_tempest: {                                                      // legendary 폭풍의 군주 — glowing (b8965db8 → bcddf1e1 / e320f41f)
    frames: [
      '/projectiles/anim/proj_leg_tempest_0.png',
      '/projectiles/anim/proj_leg_tempest_1.png',
      '/projectiles/anim/proj_leg_tempest_2.png',
      '/projectiles/anim/proj_leg_tempest_3.png',
      '/projectiles/anim/proj_leg_tempest_4.png',
    ],
    fps: 14,
  },
  // Batch 21 — 6/6 perfect (mix legendary + basic).
  proj_leg_black_hole: {                                                   // legendary 블랙홀 — floating (2eb80079 → 7df02c93 / 6ccb0815)
    frames: [
      '/projectiles/anim/proj_leg_black_hole_0.png',
      '/projectiles/anim/proj_leg_black_hole_1.png',
      '/projectiles/anim/proj_leg_black_hole_2.png',
      '/projectiles/anim/proj_leg_black_hole_3.png',
      '/projectiles/anim/proj_leg_black_hole_4.png',
    ],
    fps: 10,
  },
  proj_leg_spectral_bow: {                                                 // legendary 영혼의 활 — floating (d1e06224 → 36f7ee4c / 1d06c5bb)
    frames: [
      '/projectiles/anim/proj_leg_spectral_bow_0.png',
      '/projectiles/anim/proj_leg_spectral_bow_1.png',
      '/projectiles/anim/proj_leg_spectral_bow_2.png',
      '/projectiles/anim/proj_leg_spectral_bow_3.png',
      '/projectiles/anim/proj_leg_spectral_bow_4.png',
    ],
    fps: 12,
  },
  proj_leg_storm_caller: {                                                 // legendary 폭풍 소환술사 — crackling (e71d920f → b9fc7b51 / e96b078f)
    frames: [
      '/projectiles/anim/proj_leg_storm_caller_0.png',
      '/projectiles/anim/proj_leg_storm_caller_1.png',
      '/projectiles/anim/proj_leg_storm_caller_2.png',
      '/projectiles/anim/proj_leg_storm_caller_3.png',
      '/projectiles/anim/proj_leg_storm_caller_4.png',
    ],
    fps: 14,
  },
  proj_leg_world_tree: {                                                   // legendary 세계수 — swirling (3c6df7ec → 760cefc9 / cd7a8eaf)
    frames: [
      '/projectiles/anim/proj_leg_world_tree_0.png',
      '/projectiles/anim/proj_leg_world_tree_1.png',
      '/projectiles/anim/proj_leg_world_tree_2.png',
      '/projectiles/anim/proj_leg_world_tree_3.png',
      '/projectiles/anim/proj_leg_world_tree_4.png',
    ],
    fps: 12,
  },
  proj_arcane_orb_v2: {                                                    // basic 비전 구체 — swirling (fcfc3bd5 → 164e571b / 227c4fe0)
    frames: [
      '/projectiles/anim/proj_arcane_orb_v2_0.png',
      '/projectiles/anim/proj_arcane_orb_v2_1.png',
      '/projectiles/anim/proj_arcane_orb_v2_2.png',
      '/projectiles/anim/proj_arcane_orb_v2_3.png',
      '/projectiles/anim/proj_arcane_orb_v2_4.png',
    ],
    fps: 12,
  },
  proj_holy_censer: {                                                      // basic 신성 향로 — shimmering (99a8a7c3 → a2a30431 / 0f6814f5)
    frames: [
      '/projectiles/anim/proj_holy_censer_0.png',
      '/projectiles/anim/proj_holy_censer_1.png',
      '/projectiles/anim/proj_holy_censer_2.png',
      '/projectiles/anim/proj_holy_censer_3.png',
      '/projectiles/anim/proj_holy_censer_4.png',
    ],
    fps: 12,
  },
  // Batch 22 — 6/6 frame-reuse (이미 사용된 review source의 다른 frame index 선택).
  proj_leg_shadow_arrow: {                                                 // legendary 그림자 화살 — floating (17bc8c57 idx10 → 665c59af / e911bcb4)
    frames: [
      '/projectiles/anim/proj_leg_shadow_arrow_0.png',
      '/projectiles/anim/proj_leg_shadow_arrow_1.png',
      '/projectiles/anim/proj_leg_shadow_arrow_2.png',
      '/projectiles/anim/proj_leg_shadow_arrow_3.png',
      '/projectiles/anim/proj_leg_shadow_arrow_4.png',
    ],
    fps: 14,
  },
  proj_leg_spear: {                                                        // legendary 창 — floating (63d8a46f idx10 → 8a1c2a1b / f2ac49e8)
    frames: [
      '/projectiles/anim/proj_leg_spear_0.png',
      '/projectiles/anim/proj_leg_spear_1.png',
      '/projectiles/anim/proj_leg_spear_2.png',
      '/projectiles/anim/proj_leg_spear_3.png',
      '/projectiles/anim/proj_leg_spear_4.png',
    ],
    fps: 12,
  },
  proj_bible: {                                                            // basic 성경 — glowing (02951f23 idx10 → 96074e2a / 8808a97f)
    frames: [
      '/projectiles/anim/proj_bible_0.png',
      '/projectiles/anim/proj_bible_1.png',
      '/projectiles/anim/proj_bible_2.png',
      '/projectiles/anim/proj_bible_3.png',
      '/projectiles/anim/proj_bible_4.png',
    ],
    fps: 10,
  },
  proj_sanctuary: {                                                        // basic 성역 의식 — swirling (2e828d16 idx8 → 466076c1 / b733a737)
    frames: [
      '/projectiles/anim/proj_sanctuary_0.png',
      '/projectiles/anim/proj_sanctuary_1.png',
      '/projectiles/anim/proj_sanctuary_2.png',
      '/projectiles/anim/proj_sanctuary_3.png',
      '/projectiles/anim/proj_sanctuary_4.png',
    ],
    fps: 10,
  },
  proj_leg_judgement_hammer: {                                             // legendary 심판의 망치 — glowing (3c94607c idx10 → 76ac5e67 / 1cae2775)
    frames: [
      '/projectiles/anim/proj_leg_judgement_hammer_0.png',
      '/projectiles/anim/proj_leg_judgement_hammer_1.png',
      '/projectiles/anim/proj_leg_judgement_hammer_2.png',
      '/projectiles/anim/proj_leg_judgement_hammer_3.png',
      '/projectiles/anim/proj_leg_judgement_hammer_4.png',
    ],
    fps: 12,
  },
  proj_leg_eternal_frost: {                                                // legendary 영원의 빙결 — glowing (9b3ae4d0 idx10 → f1d8c86a / f731ba65)
    frames: [
      '/projectiles/anim/proj_leg_eternal_frost_0.png',
      '/projectiles/anim/proj_leg_eternal_frost_1.png',
      '/projectiles/anim/proj_leg_eternal_frost_2.png',
      '/projectiles/anim/proj_leg_eternal_frost_3.png',
      '/projectiles/anim/proj_leg_eternal_frost_4.png',
    ],
    fps: 12,
  },
  // Batch 24 — 신규 PixelLab 생성 (create_1_direction_object × 3).
  proj_leg_demon_heart: {                                                  // legendary 악마 심장 — floating (NEW fe28724e → 05c2a70d / 6af59ce8)
    frames: [
      '/projectiles/anim/proj_leg_demon_heart_0.png',
      '/projectiles/anim/proj_leg_demon_heart_1.png',
      '/projectiles/anim/proj_leg_demon_heart_2.png',
      '/projectiles/anim/proj_leg_demon_heart_3.png',
      '/projectiles/anim/proj_leg_demon_heart_4.png',
    ],
    fps: 12,
  },
  proj_leg_soul_lantern: {                                                 // legendary 영혼의 등불 — floating (NEW 41ec7b3b → 61432259 / 721bf5b7)
    frames: [
      '/projectiles/anim/proj_leg_soul_lantern_0.png',
      '/projectiles/anim/proj_leg_soul_lantern_1.png',
      '/projectiles/anim/proj_leg_soul_lantern_2.png',
      '/projectiles/anim/proj_leg_soul_lantern_3.png',
      '/projectiles/anim/proj_leg_soul_lantern_4.png',
    ],
    fps: 10,
  },
  proj_hawk_swarm: {                                                       // basic 매 떼 — flying (NEW 9ab08366 → 07645557 / fd12ad1a)
    frames: [
      '/projectiles/anim/proj_hawk_swarm_0.png',
      '/projectiles/anim/proj_hawk_swarm_1.png',
      '/projectiles/anim/proj_hawk_swarm_2.png',
      '/projectiles/anim/proj_hawk_swarm_3.png',
      '/projectiles/anim/proj_hawk_swarm_4.png',
    ],
    fps: 14,
  },
};

// Resolve a sprite name to a frame URL.
//
// Entries can be either:
//   string                       → static URL, no animation
//   { frames: [...], fps }       → multi-frame; cycles by elapsed * fps
//
// Mirrors sigAssets.js / heroAssets.js shape so the same {frames, fps}
// pattern works across all PNG bridges. The optional `elapsed` argument
// is needed only for animated entries; static entries ignore it.
export function weaponAssetUrl(spriteName, elapsed = 0) {
  const v = WEAPON_ASSETS[spriteName];
  if (!v) return null;
  if (typeof v === 'string') return v;
  if (v.url) return v.url;
  if (v.frames && v.frames.length) {
    const idx = Math.floor(elapsed * (v.fps || 12)) % v.frames.length;
    return v.frames[idx];
  }
  return null;
}
