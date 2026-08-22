// Weapon definitions — DATA (eng-review premise #2).
//
// Schema merges the share2 weapon pack's behaviour model with the engine's
// numeric tuning. Per weapon:
//   tier        'basic' | 'legendary'
//   kind        'projectile' | 'melee'
//   pattern     engine fire pattern — 'fan' | 'ring' | 'orbit' | 'boomerang'
//               (the pack's aimed = fan/count1+homing, beam = fast fan,
//                static = orbit/orbitRadius0, exotic patterns approximated)
//   maxLevel, dmgPerLevel, cooldown, damage  — tuning; level scales damage
//   projectiles, pierce, spread, speed, radius, life, knockback — per pattern
//   orbitRadius, orbitSpeed — orbit pattern
//   reach, radius, life — melee pattern
//   homing      projectile steers toward the nearest enemy (movement.js)
//   proc        { fx, chance } — on hit, roll chance: a `status_*` fx applies
//               that status, any other fx spawns a one-shot burst
//   impact      impact-FX clip shown where a hit lands
//   muzzle      muzzle-flash clip shown at the player on fire (optional)
//   tags, icon, sprite, color
//
// Adding a weapon is a pure data edit (+ its id in BASE/LEGENDARY_WEAPONS).

// Sky-drop palettes by tag theme. Used by aoeKitFor() to build a complete
// def.aoeKit without per-weapon repetition. PNG assets are optional — when
// omitted, the renderer falls back to a Graphics fireball drop + radial
// impact burst tinted with these colours. Match an obvious tag on the
// weapon (fire / holy / ice / lightning / shadow / arcane / nature /
// physical / void).
const SKY_DROP_PALETTES = {
  fire:      { ring: 0x6a1a0a, fill: 0xff9a45, rune: 0xffd070, outer: 0x6a1a0a, core: 0xff9a45, hi: 0xffd070, trail: 0xc64628, iCore: 0xfff0c0, iMid: 0xff9a45, iArc: 0xc64628 },
  holy:      { ring: 0x8a5a18, fill: 0xfac860, rune: 0xfff0c0, outer: 0x8a5a18, core: 0xf0c878, hi: 0xfff0c0, trail: 0xc8a050, iCore: 0xffffff, iMid: 0xfac860, iArc: 0xf0d27a },
  ice:       { ring: 0x2a4060, fill: 0x88c8ff, rune: 0xc0e8ff, outer: 0x2a4060, core: 0x88c8ff, hi: 0xc0e8ff, trail: 0x4080a8, iCore: 0xffffff, iMid: 0x88c8ff, iArc: 0x4080a8 },
  lightning: { ring: 0x2a5070, fill: 0xbfe6ff, rune: 0xffffff, outer: 0x2a5070, core: 0xbfe6ff, hi: 0xffffff, trail: 0x80b8d8, iCore: 0xffffff, iMid: 0xbfe6ff, iArc: 0x4080a8 },
  shadow:    { ring: 0x2a1040, fill: 0x8a6abf, rune: 0xb574d8, outer: 0x2a1040, core: 0x6a4a9f, hi: 0xb574d8, trail: 0x4a2a6f, iCore: 0xece2c8, iMid: 0xb574d8, iArc: 0x3a1a55 },
  arcane:    { ring: 0x3a1a55, fill: 0xb574d8, rune: 0xece2c8, outer: 0x3a1a55, core: 0x8a6abf, hi: 0xb574d8, trail: 0x6a4a9f, iCore: 0xffffff, iMid: 0xb574d8, iArc: 0x3a1a55 },
  nature:    { ring: 0x2a4020, fill: 0x88b85a, rune: 0xc0d890, outer: 0x2a4020, core: 0x6a8838, hi: 0xc0d890, trail: 0x4a6828, iCore: 0xe8f0c0, iMid: 0x88b85a, iArc: 0x4a6828 },
  physical:  { ring: 0x4a3820, fill: 0xc8a24e, rune: 0xfff0c0, outer: 0x4a3820, core: 0xc8a24e, hi: 0xfff0c0, trail: 0x6a4830, iCore: 0xfff0c0, iMid: 0xc8a24e, iArc: 0x8a6040 },
  void:      { ring: 0x1a0a2a, fill: 0x4a2a6f, rune: 0x8a6abf, outer: 0x0a0010, core: 0x2a1040, hi: 0x6a4a9f, trail: 0x0a0010, iCore: 0xb574d8, iMid: 0x6a4a9f, iArc: 0x1a0a2a },
};

// Build a complete aoeKit (palette only, no PNG assets) for a weapon.
// `theme` picks a SKY_DROP_PALETTES entry. `radius` controls the telegraph
// footprint — for `aoe` and `pull` it matches the weapon's damage radius;
// for `rain` pass a generous ground-footprint (the weapon's def.radius is
// the projectile size, not the impact area). Pass `rainSkipDrop: true` for
// rain weapons so the renderer doesn't draw a synthesized falling body on
// top of the actual rain projectiles.
function aoeKitFor(theme, radius, opts = {}) {
  const p = SKY_DROP_PALETTES[theme] || SKY_DROP_PALETTES.fire;
  const kit = {
    telegraphTime: opts.telegraphTime ?? 0.5,
    fallTime: opts.fallTime ?? 0.5,
    radius,
    // Unified pre-cast indicator — purple magic circle. Per-weapon overrides
    // still supported via opts.telegraphAsset.
    telegraphAsset: opts.telegraphAsset || 'aoe_telegraph_circle',
    telegraphRing: p.ring, telegraphFill: p.fill, telegraphRune: p.rune,
    meteorOuter: p.outer, meteorCore: p.core, meteorHighlight: p.hi,
    meteorSpec: 0xffffff, meteorTrail: p.trail, shadow: 0x0a0a14,
    impactCore: p.iCore, impactMid: p.iMid, impactArcane: p.iArc,
    impactFxLife: opts.impactFxLife ?? 0.45,
    impactScale: opts.impactScale ?? 2.0,
    dropScale: opts.dropScale ?? 1.4,
  };
  if (opts.rainSkipDrop) kit.rainSkipDrop = true;
  return kit;
}

export const WEAPONS = {
  // ── basic ───────────────────────────────────────────────────────────────
  wand: {
    // Starter weapon — every player sees it for the entire opening. Density
    // bump made the wand feel weak because single-pierce + short range = whiffs
    // in crowded rooms. Tuned damage 35→42 (+20%) and life 1.6→2.0 (range
    // 576→720, now reaches the enemy spawn ring). Cooldown/projectiles/etc
    // untouched so build identity stays.
    id: 'wand', tier: 'basic', name: '매직 완드', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.0, damage: 42,
    projectiles: 1, projGrowth: true, pierce: 1, spread: 0.16, speed: 360, radius: 6, life: 2.0,
    knockback: 7, homing: true, tags: ['arcane'],
    proc: { fx: 'status_freeze', chance: 0.12 },
    impact: 'fx_impact_arcane', muzzle: 'fx_muzzle_arcane',
    // mage staff doesn't physically fly out — fires an arcane spell instead
    color: 0xf0e8c8, sprite: 'proj_spell_arcane_swirl', icon: 'icon_wand',
    skills: [
      { lvl: 2, name: '추적 강화', mod: { life: 1.25, speed: 1.1 } },
      { lvl: 3, name: '결빙 강화', mod: { proc: { chance: 0.35 } } },
      { lvl: 4, name: '날렵한 회복', mod: { cooldown: 0.85 } },
      { lvl: 5, name: '연속 시전', mod: { projectiles: '+1' } }
    ],
  },
  nova: {
    id: 'nova', tier: 'basic', name: '노바', kind: 'projectile', pattern: 'ring',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.7, damage: 9,
    projectiles: 8, pierce: 1, speed: 300, radius: 5, life: 1.0, knockback: 5,
    tags: ['arcane', 'fire'], proc: { fx: 'fx_impact_burn', chance: 0.18 },
    impact: 'fx_impact_arcane', muzzle: 'fx_muzzle_arcane',
    color: 0xffe060, sprite: 'proj_nova', icon: 'icon_nova',
    skills: [
      { lvl: 2, name: '확장 노바', mod: { radius: 1.25, speed: 1.1 } },
      { lvl: 3, name: '폭염 노바', mod: { proc: { chance: 0.5 } } },
      { lvl: 4, name: '신속 노바', mod: { cooldown: 0.85 } },
      { lvl: 5, name: '쌍둥이 노바', mod: { projectiles: '+4' } }
    ],
  },
  spear: {
    id: 'spear', tier: 'basic', name: '창', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 0.9, damage: 20,
    projectiles: 1, pierce: 999, spread: 0, speed: 520, radius: 5, life: 1.4,
    knockback: 4, tags: ['physical'], impact: 'fx_impact_pierce',
    color: 0xd7d2b4, sprite: 'proj_spear', icon: 'icon_spear',
  },
  axe: {
    id: 'axe', tier: 'basic', name: '도끼', kind: 'projectile', pattern: 'boomerang',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.35, damage: 32,
    projectiles: 1, projGrowth: true, pierce: 999, spread: 0.4, speed: 320, radius: 9, life: 1.5,
    knockback: 12, tags: ['physical'], impact: 'fx_impact_slash',
    color: 0xc8a24e, sprite: 'proj_axe', icon: 'icon_axe', effectAsset: 'axe_fx',
    skills: [
      { lvl: 2, name: '광역 회전', mod: { radius: 1.2 } },
      { lvl: 3, name: '예리한 날', mod: { proc: { chance: 0.4 } } },
      { lvl: 4, name: '회수 가속', mod: { speed: 1.2 } },
      { lvl: 5, name: '쌍날 도끼', mod: { projectiles: '+1' } }
    ],
  },
  arcane_field: {
    id: 'arcane_field', tier: 'basic', name: '마력 영역', kind: 'aura', pattern: 'aura_buff',
    maxLevel: 5, dmgPerLevel: 0, cooldown: 10.0, damage: 0,
    // buff stamp into loadout.buffs (existing fold path) — duration 6s, gap 4s
    buff: { damage: 1.20, cooldown: 0.90 },
    duration: 6.0,
    tags: ['arcane'], color: 0xb574d8,
    impact: null, sprite: 'proj_spell_rune_circle', icon: 'icon_arcane_missile',
    assetKey: 'buff_arcane_field',
  },
  holywater: {
    id: 'holywater', tier: 'basic', name: '성수병', kind: 'projectile', pattern: 'aoe',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.5, damage: 14,
    projectiles: 1, projGrowth: true, radius: 44, life: 2.4,
    knockback: 4, tags: ['holy'], proc: { fx: 'fx_holywater_splash', chance: 0.4 },
    impact: 'fx_impact_splash', muzzle: 'fx_muzzle_holy',
    color: 0x8fd6ff, sprite: 'proj_holywater', icon: 'icon_holywater',
    classNeutral: true, // 공용 풀 — affinity 무시, 모든 영웅 동일 weight로 roll
    aoeKit: {
      telegraphTime: 0.5, fallTime: 0.5, radius: 44,
      telegraphAsset: 'aoe_telegraph_circle',
      dropAsset: 'holywater_drop',
      // No impactAsset — Graphics fallback paints a blue splash via the palette below
      telegraphRing: 0x2a5a7a, telegraphFill: 0x8fd6ff, telegraphRune: 0xc0e8ff,
      meteorOuter: 0x2a5a7a, meteorCore: 0x8fd6ff, meteorHighlight: 0xc0e8ff,
      meteorSpec: 0xffffff, meteorTrail: 0x4080a8, shadow: 0x0a0a14,
      impactCore: 0xffffff, impactMid: 0x8fd6ff, impactArcane: 0x4080a8,
      impactFxLife: 0.4, impactScale: 1.2, dropScale: 1.0,
    },
  },
  arrow: {
    id: 'arrow', tier: 'basic', name: '화살', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.2, damage: 17,
    projectiles: 1, projGrowth: true, pierce: 2, spread: 0, speed: 420, radius: 4, life: 1.6,
    knockback: 3, tags: ['physical'], proc: { fx: 'status_bleed', chance: 0.28 },
    impact: 'fx_impact_pierce', muzzle: 'fx_muzzle_arcane',
    color: 0xe6cf94, sprite: 'proj_arrow', icon: 'icon_arrow',
    skills: [
      { lvl: 2, name: '매의 눈', mod: { speed: 1.2, life: 1.15 } },
      { lvl: 3, name: '깊은 출혈', mod: { proc: { chance: 0.5 } } },
      { lvl: 4, name: '꿰뚫는 화살', mod: { pierce: '+2' } },
      { lvl: 5, name: '연발', mod: { projectiles: '+1' } }
    ],
  },
  cross: {
    id: 'cross', tier: 'basic', name: '십자가', kind: 'projectile', pattern: 'boomerang',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.2, damage: 19,
    projectiles: 1, pierce: 999, spread: 0, speed: 360, radius: 7, life: 1.5,
    knockback: 7, tags: ['holy'], impact: 'fx_impact_holy',
    color: 0xffe7a8, sprite: 'proj_cross', icon: 'icon_cross', effectAsset: 'cross_fx',
    skills: [
      { lvl: 2, name: '거대화', mod: { radius: 1.25 } },
      { lvl: 3, name: '신성 충격', mod: { proc: { fx: 'status_slow', chance: 0.4 } } },
      { lvl: 4, name: '복귀 가속', mod: { speed: 1.2 } },
      { lvl: 5, name: '쌍십자가', mod: { projectiles: '+1' } }
    ],
  },
  lightning: {
    id: 'lightning', tier: 'basic', name: '낙뢰', kind: 'projectile', pattern: 'rain',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.8, damage: 24,
    projectiles: 1, pierce: 1, bounces: 4, bouncesGrowth: true,
    speed: 520, radius: 14, life: 0.8, knockback: 5,
    strikeRadius: 220, // rain only lands within this distance from player
    aoeKit: aoeKitFor('lightning', 50, { telegraphTime: 0.4, fallTime: 0.25, impactFxLife: 1.5, impactScale: 1.4 }),
    tags: ['lightning'], proc: { fx: 'status_shock', chance: 0.5 },
    impact: 'fx_chain_lightning', color: 0xbfe6ff, sprite: 'proj_lightning', icon: 'icon_lightning', effectAsset: 'lightning_fx',
  },
  firewall: {
    id: 'firewall', tier: 'basic', name: '화염벽', kind: 'projectile', pattern: 'aoe',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 2.0, damage: 9,
    projectiles: 1, radius: 48, life: 2.8,
    knockback: 2, tags: ['fire'], proc: { fx: 'status_burn', chance: 1 },
    impact: 'fx_impact_scorch', color: 0xff9a45, sprite: 'proj_firewall', icon: 'icon_firewall',
    groundAsset: 'zone_meteor', // fire theme — keep burning crater overlay
    aoeKit: {
      telegraphTime: 0.5, fallTime: 0.55, radius: 48,
      telegraphAsset: 'aoe_telegraph_circle',
      dropAsset: 'firewall_drop',
      impactAsset: 'warrior_magma', // reuse the lava-burst from warrior signature
      telegraphRing: 0x6a1a0a, telegraphFill: 0xff9a45, telegraphRune: 0xffd070,
      meteorOuter: 0x6a1a0a, meteorCore: 0xff9a45, meteorHighlight: 0xffd070,
      meteorSpec: 0xfff0c0, meteorTrail: 0xc64628, shadow: 0x0a0a14,
      impactCore: 0xfff0c0, impactMid: 0xff9a45, impactArcane: 0xc64628,
      impactFxLife: 0.45, impactScale: 1.3, dropScale: 1.1,
    },
  },
  knives: {
    id: 'knives', tier: 'basic', name: '단검 투척', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.1, damage: 14,
    projectiles: 1, projGrowth: true, pierce: 1, spread: 0.22, speed: 220, radius: 4, life: 0.55,
    knockback: 5, tags: ['physical'], proc: { fx: 'status_bleed', chance: 0.2 },
    impact: 'fx_impact_pierce', color: 0xd3dae0, sprite: 'proj_knives', icon: 'icon_knives', effectAsset: 'knives_fx', trailAsset: 'blood_drop_fx',
  },
  scythe: {
    id: 'scythe', tier: 'basic', name: '낫', kind: 'melee', pattern: 'melee',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.0, damage: 34,
    reach: 72, radius: 72, life: 0.18, knockback: 10, tags: ['shadow', 'physical'],
    proc: { fx: 'status_bleed', chance: 0.3 },
    // Effect = shared slash arc (검기), NOT the weapon model. icon stays the
    // scythe image; the in-world swing reads as a slash. See melee-qi design.
    // color tints the fx_slash per type (renderer): scythe = shadow violet
    // (matches its 'shadow' tag), distinct from sword's steel-white.
    impact: 'fx_impact_slash', color: 0x9a6fd0, sprite: 'fx_slash', icon: 'icon_scythe',
  },
  sword: {
    id: 'sword', tier: 'basic', name: '검', kind: 'melee', pattern: 'melee',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 0.85, damage: 26,
    reach: 70, radius: 60, life: 0.16, knockback: 11, tags: ['physical'],
    impact: 'fx_impact_slash', color: 0xeef0ff, sprite: 'fx_slash', icon: 'icon_axe',
  },

  // ── share5 expansion (exotic patterns approximated until Task 4) ─────────
  shield_throw: {
    id: 'shield_throw', tier: 'basic', name: '방패 투척', kind: 'projectile', pattern: 'boomerang',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.1, damage: 24,
    projectiles: 1, pierce: 999, spread: 0, speed: 360, radius: 9, life: 1.5,
    knockback: 14, tags: ['holy', 'physical'], proc: { fx: 'status_shield', chance: 0.15 },
    impact: 'fx_impact_smash', color: 0xd8c878, sprite: 'proj_shield_throw', icon: 'icon_shield_throw', effectAsset: 'shield_throw_fx',
  },
  divine_hammer: {
    id: 'divine_hammer', tier: 'basic', name: '신성 망치', kind: 'projectile', pattern: 'aoe',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.8, damage: 30,
    projectiles: 1, radius: 46, life: 2.2,
    knockback: 36, tags: ['holy', 'physical'], proc: { fx: 'status_stun', chance: 0.5 },
    impact: 'fx_impact_smash', color: 0xf0e0a0, sprite: 'proj_divine_hammer', icon: 'icon_divine_hammer',
    // Sky-drop visual overlay (cosmetic — damage still pulses on the zone
    // projectile). Holy/gold palette so the cast reads as a hammer of
    // judgment crashing down. PNG assets go here when ready; until then
    // Graphics fallback is the gold fireball below.
    aoeKit: {
      telegraphTime: 0.55,
      fallTime: 0.5,
      radius: 46,
      // PixelLab PNG assets — fallback to Graphics palette below if missing
      telegraphAsset: 'aoe_telegraph_circle',
      dropAsset: 'divine_hammer_drop',
      impactAsset: 'knight_flare', // reuse existing knight signature flare
      // Telegraph rune palette — gold ring on parchment glow (fallback)
      telegraphRing: 0x8a5a18,
      telegraphFill: 0xfac860,
      telegraphRune: 0xfff0c0,
      // Drop body fallback palette (Graphics fireball)
      meteorOuter: 0x8a5a18,
      meteorCore: 0xf0c878,
      meteorHighlight: 0xfff0c0,
      meteorSpec: 0xffffff,
      meteorTrail: 0xc8a050,
      shadow: 0x0a0a14,
      // Impact burst palette
      impactCore: 0xffffff,
      impactMid: 0xfac860,
      impactArcane: 0xf0d27a,
      impactFxLife: 0.45,
      impactScale: 1.2,
      dropScale: 1.0,
    },
    skills: [
      { lvl: 2, name: '거대화', mod: { radius: 1.15 } },
      { lvl: 3, name: '치명적 충격', mod: { proc: { chance: 0.8 } } },
      { lvl: 4, name: '연속 강타', mod: { cooldown: 0.85 } },
      { lvl: 5, name: '심판의 메아리', mod: { projectiles: '+1', projGrowth: true } }
    ],
  },
  throw_axes: {
    id: 'throw_axes', tier: 'basic', name: '연쇄 도끼 투척', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.0, damage: 20,
    projectiles: 1, projGrowth: true, pierce: 2, spread: 0.32, speed: 280, radius: 7, life: 1.3,
    knockback: 8, tags: ['physical'], proc: { fx: 'status_bleed', chance: 0.35 },
    impact: 'fx_impact_smash', color: 0xc8a24e, sprite: 'proj_throw_axes', icon: 'icon_throw_axes', effectAsset: 'throw_axes_fx',
  },
  void_sphere: {
    id: 'void_sphere', tier: 'basic', name: '공허 구체', kind: 'projectile', pattern: 'pull',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 2.4, damage: 20,
    projectiles: 1, radius: 65, pullRadius: 200, life: 5.0, knockback: 0,
    tags: ['shadow', 'arcane'], proc: { fx: 'status_slow', chance: 1 },
    impact: 'fx_impact_arcane', color: 0x8a6abf, sprite: 'proj_spell_shadow_flame', icon: 'icon_void_sphere',
    aoeKit: {
      telegraphTime: 0.6, fallTime: 0.55, radius: 58,
      telegraphAsset: 'aoe_telegraph_circle',
      dropAsset: 'void_sphere_drop',
      // No impactAsset — Graphics fallback paints a purple void implosion via palette
      telegraphRing: 0x3a1a55, telegraphFill: 0xb574d8, telegraphRune: 0xece2c8,
      meteorOuter: 0x3a1a55, meteorCore: 0x8a6abf, meteorHighlight: 0xb574d8,
      meteorSpec: 0xece2c8, meteorTrail: 0x6a4a9f, shadow: 0x07060c,
      impactCore: 0xece2c8, impactMid: 0xb574d8, impactArcane: 0x3a1a55,
      impactFxLife: 0.5, impactScale: 1.5, dropScale: 1.2,
    },
  },
  arcane_missile: {
    id: 'arcane_missile', tier: 'basic', name: '아케인 미사일', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 0.9, damage: 18,
    projectiles: 1, projGrowth: true, pierce: 1, spread: 0.5, speed: 360, radius: 5, life: 1.5,
    knockback: 4, homing: true, tags: ['arcane'], proc: { fx: 'fx_explosion', chance: 0.15 },
    impact: 'fx_impact_arcane', muzzle: 'fx_muzzle_arcane',
    color: 0xb574d8, sprite: 'proj_spell_rune_circle', icon: 'icon_arcane_missile',
  },
  bible: {
    id: 'bible', tier: 'basic', name: '성서', kind: 'projectile', pattern: 'orbit',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 3.0, damage: 18,
    // bible-specific projectile count: Lv1=3, +1/level, cap 10 (incl. projectileBonus).
    // 10s active, 3s cooldown → 한 번에 하나 룰이 자연스럽게 cycle 형성.
    baseProj: 3, growthPerLevel: 1, projCap: 10,
    orbitRadius: 64, orbitSpeed: 3.0, radius: 14, life: 10.0,
    knockback: 20, tags: ['holy'], impact: 'fx_impact_holy',
    color: 0xf0d27a, sprite: 'proj_bible', icon: 'icon_bible',
  },
  heal_beam: {
    id: 'heal_beam', tier: 'basic', name: '치유의 빛줄기', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.0, damage: 30,
    projectiles: 1, pierce: 999, spread: 0, speed: 1100, radius: 8, life: 0.5,
    knockback: 4, tags: ['holy'], proc: { fx: 'status_burn', chance: 0.5 },
    impact: 'fx_impact_holy', muzzle: 'fx_muzzle_holy',
    color: 0xfff4c0, sprite: 'proj_heal_beam', icon: 'icon_heal_beam',
    classNeutral: true, // 공용 풀
  },
  smite: {
    id: 'smite', tier: 'basic', name: '천벌', kind: 'projectile', pattern: 'rain',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.5, damage: 28,
    projectiles: 6, pierce: 999, speed: 620, radius: 9, life: 1.7, knockback: 6,
    tags: ['holy', 'lightning'], proc: { fx: 'status_stun', chance: 0.5 },
    impact: 'fx_impact_holy', color: 0xfff0b0, sprite: 'proj_smite', icon: 'icon_smite',
    // aoeKit reads on rain pattern: telegraph rings + impact bursts at landing
    // points. The falling body is the projectile itself, so dropAsset is null —
    // weaponFire's rain branch emits aoeCast(skipDrop=true) so the renderer
    // only draws the telegraph + impact stages, no separate drop sprite.
    aoeKit: {
      telegraphTime: 0.5, fallTime: 0.5, radius: 50,
      telegraphAsset: 'aoe_telegraph_circle',
      dropAsset: 'smite_drop',
      impactAsset: 'knight_flare', // gold solar flare on hit
      telegraphRing: 0x8a5a18, telegraphFill: 0xfff0b0, telegraphRune: 0xfff8d8,
      meteorOuter: 0x8a5a18, meteorCore: 0xfff0b0, meteorHighlight: 0xfff8d8,
      meteorSpec: 0xffffff, meteorTrail: 0xd8b870, shadow: 0x0a0a14,
      impactCore: 0xffffff, impactMid: 0xfff0b0, impactArcane: 0xd8b870,
      impactFxLife: 0.35, impactScale: 1.5, dropScale: 1.0,
      rainSkipDrop: true, // hint: rain pattern doesn't need the falling-body sprite
    },
  },
  sanctuary: {
    id: 'sanctuary', tier: 'basic', name: '성역 의식', kind: 'projectile', pattern: 'orbit',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.0, damage: 9,
    projectiles: 1, orbitRadius: 0, orbitSpeed: 0, radius: 90, life: 1.1,
    knockback: 2, tags: ['holy', 'nature'], proc: { fx: 'status_shield', chance: 0.3 },
    impact: 'fx_impact_holy', color: 0xc0f0d8, sprite: 'proj_sanctuary', icon: 'icon_sanctuary',
    classNeutral: true, // 공용 풀
  },
  falling_axe: {
    // Ballistic salvo (arc_burst) — every cooldown, hurls a handful of
    // axes upward in random angles within a wide arc; gravity pulls them
    // down so each axe traces its own parabola. landYOffset is unset so
    // axes fly until def.life expires — they sail across the map like a
    // thrown boomerang (the "도끼 던지기" feel preserved when arc_burst
    // was split out of black_pigeon).
    //
    // Piercing: 999 = effectively unlimited; the projectile keeps flying
    // through every enemy it touches (each enemy hit once, since hits[]
    // dedupes — same as MELEE_PIERCE behaviour). Combined with no landY
    // and a long life, axes cut a swath until they exit the play area.
    id: 'falling_axe', tier: 'basic', name: '낙하 도끼',
    kind: 'projectile', pattern: 'arc_burst',
    maxLevel: 5, cooldown: 1.6, damage: 32,
    pierce: 999, radius: 8, life: 2.6, knockback: 8,
    // ballistic params — moderate launch + medium gravity so the arc
    // peaks high enough to read clearly and lands well past the player.
    // angle window + speed jitter live in weaponFire.js defaults; override
    // here if a future weapon wants a tighter or wider arc.
    launchSpeed: 420, gravity: 620,
    originOffsetY: -18,
    tags: ['physical'],
    proc: { fx: 'status_bleed', chance: 0.25 },
    impact: 'fx_impact_slash',
    color: 0xc8a24e, sprite: 'proj_axe', icon: 'icon_axe',
  },
  // Sibling of falling_axe — same arc_burst pattern, heavier feel. Slower
  // launch + higher gravity so the hammer reads as "heavy descent" instead
  // of a thrown weapon flying flat. Fewer projectiles per volley (uniform
  // ramp) but each shot stuns ~50% on hit; the silhouette + arc speed do
  // the work of differentiating it from the axe.
  holy_hammer_toss: {
    id: 'holy_hammer_toss', tier: 'basic', name: '신성 망치 투척',
    kind: 'projectile', pattern: 'arc_burst',
    maxLevel: 5, cooldown: 1.8, damage: 48,
    pierce: 999, radius: 11, life: 2.4, knockback: 14,
    // heavier ballistics — slower launch, more gravity → tighter arc that
    // peaks lower and lands closer than falling_axe. Combined with the
    // bigger radius it reads as a hammer "thunk" instead of axe sailing.
    launchSpeed: 360, gravity: 720,
    originOffsetY: -18,
    tags: ['holy', 'physical'],
    proc: { fx: 'status_stun', chance: 0.5 },
    impact: 'fx_impact_smash',
    color: 0xf0d878, sprite: 'proj_warhammer', icon: 'icon_warhammer',
  },
  black_pigeon: {
    // VS-style "검은 비둘기" — a pet pigeon hovers above the player and,
    // every ~10s, picks ONE random target zone around the hero and rains
    // a swarm of bezier-curved beams that all converge into that zone.
    // Each beam takes its own perpendicular control-offset (random sign
    // + magnitude) so the salvo mixes S-shapes, gentle bows, and longer
    // swirls — but they all aim into the same disc, reading as a plasma
    // strike on the target area.
    //
    // Spec target: ~10 beams at Lv1, ramping to ~45 via the skill tree —
    // matches the VS reference of a 10~40 beam storm.
    id: 'black_pigeon', tier: 'basic', name: '검은 비둘기',
    kind: 'projectile', pattern: 'bezier_strike',
    maxLevel: 5, cooldown: 10, damage: 28,
    baseProj: 10, growthPerLevel: 5, projCap: 50,
    // pierce 999 = beams never die mid-flight from enemy hits; each beam
    // only retires when it reaches its landing point (movement.js bezier
    // t>=1 kill). Reads as a true "AoE drop" — the volley always finishes
    // the strike no matter how many enemies are in the path.
    // radius is the collision hit-box; bumped up so beams in flight clip
    // wider through enemy groups (the line VISUAL is drawn by drawBeams
    // independently of this number — width lives in renderer.js).
    pierce: 999, radius: 12, life: 3.0, knockback: 6,
    // bezier_strike params:
    //   strikeMinDist / strikeRadius — distance band where the volley's
    //     SINGLE target zone CENTER lands (around the player)
    //   targetRadius — beams scatter inside a disc this wide around that
    //     zone center (= the "plasma blob" footprint)
    //   flightTime   — seconds from launch to landing (whole bezier)
    //   curveAmount  — perpendicular control-offset multiplier (0=직선, ~1=극단)
    //   originOffsetY — emission point above the player (pigeon hover)
    strikeMinDist: 180, strikeRadius: 460,
    targetRadius: 160,
    flightTime: 1.2, curveAmount: 0.55,
    // Spread the volley over 5s so a 10-beam shot reads as a sustained
    // barrage and extra projectiles (multi-shot passives, level-ups)
    // genuinely densify the rain instead of widening one flash.
    staggerWindow: 5.0,
    originOffsetY: -34,
    tags: ['arcane', 'shadow'],
    proc: { fx: 'status_freeze', chance: 0.15 },
    impact: 'fx_impact_arcane',
    // Visual is pure Graphics polyline (renderer.js drawBeams). `color`
    // tints the glow halo; sprite/icon stay set for the inventory cards
    // but the in-flight beam never reads the sprite (sync skips it).
    // Color sits darker than the rune-shadow palette so the bright cream
    // core (drawBeams) carries the contrast — reads as deep arcane plasma.
    color: 0x6a4a9f, sprite: 'proj_judgement_beam', icon: 'icon_judgement_beam',
  },

  // ── exclusive — one per hero, only that hero can roll it ─────────────────
  vanguard_sword: {
    id: 'vanguard_sword', tier: 'exclusive', name: '선봉의 검', kind: 'melee', pattern: 'melee',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 0.7, damage: 34,
    reach: 50, radius: 56, life: 0.18, knockback: 13, tags: ['holy', 'physical'],
    proc: { fx: 'status_shield', chance: 0.3 },
    // hero exclusive melee: render a holy slash arc (PixelLab 5-frame
    // crescent qi) — distinct from the shared fx_slash used by generic
    // melee weapons. Knight starter only.
    impact: 'fx_impact_slash', color: 0xfff0c0, sprite: 'proj_vanguard_slash', icon: 'icon_vanguard',
  },
  warhammer: {
    id: 'warhammer', tier: 'exclusive', name: '전쟁 망치', kind: 'projectile', pattern: 'aoe',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.8, damage: 30,
    projectiles: 1, radius: 54, life: 2.4,
    knockback: 36, tags: ['physical'], proc: { fx: 'status_stun', chance: 0.4 },
    impact: 'fx_impact_smash', color: 0xc8a24e, sprite: 'proj_warhammer', icon: 'icon_warhammer',
    aoeKit: {
      telegraphTime: 0.6, fallTime: 0.55, radius: 54,
      telegraphAsset: 'aoe_telegraph_circle',
      dropAsset: 'warhammer_drop',
      impactAsset: 'warrior_magma', // reuse magma burst (red/orange smash energy)
      telegraphRing: 0x5a4030, telegraphFill: 0xc8a24e, telegraphRune: 0xfff0c0,
      meteorOuter: 0x5a4030, meteorCore: 0xc8a24e, meteorHighlight: 0xfff0c0,
      meteorSpec: 0xffffff, meteorTrail: 0x8a6a40, shadow: 0x0a0a14,
      impactCore: 0xfff0c0, impactMid: 0xc8a24e, impactArcane: 0x8a6040,
      impactFxLife: 0.5, impactScale: 1.4, dropScale: 1.2,
    },
  },
  astral_staff: {
    id: 'astral_staff', tier: 'exclusive', name: '아스트랄 지팡이', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 0.8, damage: 18,
    projectiles: 4, pierce: 2, spread: 0.3, speed: 420, radius: 6, life: 1.6,
    knockback: 6, homing: true, tags: ['arcane'], proc: { fx: 'fx_explosion', chance: 0.3 },
    impact: 'fx_impact_arcane', muzzle: 'fx_muzzle_arcane',
    color: 0xb574d8, sprite: 'proj_astral_staff', icon: 'icon_astral_staff',
  },
  hunters_bow: {
    id: 'hunters_bow', tier: 'exclusive', name: '사냥꾼의 활', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.4, damage: 22,
    projectiles: 3, pierce: 3, spread: 0.18, speed: 420, radius: 5, life: 1.7,
    knockback: 5, tags: ['physical'], proc: { fx: 'status_bleed', chance: 0.3 },
    impact: 'fx_impact_pierce', muzzle: 'fx_muzzle_arcane',
    color: 0x88b85a, sprite: 'proj_hunters_bow', icon: 'icon_hunters_bow',
  },
  holy_censer: {
    id: 'holy_censer', tier: 'exclusive', name: '신성 향로', kind: 'projectile', pattern: 'orbit',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 2.0, damage: 22,
    // orbit 무기는 baseProj로 Lv1 카운트를 명시 — projCount가 def.projectiles를 무시함.
    projectiles: 2, baseProj: 2, growthPerLevel: 1, projCap: 6,
    orbitRadius: 60, orbitSpeed: 2.4, radius: 9, life: 2.2,
    knockback: 6, tags: ['holy'], proc: { fx: 'status_shield', chance: 0.2 },
    impact: 'fx_impact_holy', color: 0xbfe6f0, sprite: 'proj_holy_censer', icon: 'icon_holy_censer',
  },

  // ── legendary — boss-chest reward pool ───────────────────────────────────
  leg_blade: {
    id: 'leg_blade', tier: 'legendary', name: '여명의 검기', kind: 'projectile', pattern: 'fan',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 0.55, damage: 58,
    projectiles: 1, pierce: 999, spread: 0, speed: 1300, radius: 7, life: 2.0, spriteScaleY: 1.6,
    knockback: 8, tags: ['holy', 'physical'], impact: 'fx_impact_slash', muzzle: 'fx_muzzle_holy',
    color: 0xfff0c0, sprite: 'proj_leg_blade', icon: 'icon_leg_blade',
  },
  leg_axe: {
    id: 'leg_axe', tier: 'legendary', name: '폭풍 도끼', kind: 'projectile', pattern: 'boomerang',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 1.0, damage: 64,
    projectiles: 3, pierce: 999, spread: 0.5, speed: 340, radius: 11, life: 1.6,
    knockback: 16, tags: ['physical', 'lightning'],
    proc: { fx: 'fx_chain_lightning', chance: 0.25 },
    impact: 'fx_impact_smash', color: 0xffb24a, sprite: 'proj_leg_axe', icon: 'icon_leg_axe',
  },
  leg_spear: {
    id: 'leg_spear', tier: 'legendary', name: '미스릴 할버드', kind: 'projectile', pattern: 'fan',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 0.7, damage: 44,
    projectiles: 1, pierce: 999, spread: 0, speed: 1200, radius: 6, life: 0.5,
    knockback: 6, tags: ['holy', 'physical'], impact: 'fx_impact_pierce',
    color: 0xbff0ff, sprite: 'proj_leg_spear', icon: 'icon_leg_spear',
  },
  leg_arrow: {
    id: 'leg_arrow', tier: 'legendary', name: '은룡의 화살', kind: 'projectile', pattern: 'fan',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 0.55, damage: 30,
    projectiles: 1, pierce: 5, spread: 0, speed: 600, radius: 5, life: 1.7,
    knockback: 5, homing: true, tags: ['holy', 'physical'],
    proc: { fx: 'fx_explosion', chance: 1 },
    impact: 'fx_impact_pierce', muzzle: 'fx_muzzle_holy',
    color: 0xffe79a, sprite: 'proj_leg_arrow', icon: 'icon_leg_arrow',
  },
  leg_whip: {
    id: 'leg_whip', tier: 'legendary', name: '강철 사슬 채찍', kind: 'projectile', pattern: 'fan',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 0.5, damage: 40,
    projectiles: 1, pierce: 999, spread: 0, speed: 1300, radius: 8, life: 2.0, spriteScaleY: 1.6,
    knockback: 32, tags: ['physical'],
    // legendary qi projectile: crimson chain whip lash (PixelLab 5-frame)
    impact: 'fx_impact_lash', color: 0xc8a0ff, sprite: 'proj_leg_whip', icon: 'icon_leg_whip',
  },
  leg_cross: {
    id: 'leg_cross', tier: 'legendary', name: '작열 십자가', kind: 'projectile', pattern: 'boomerang',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 1.3, damage: 36,
    projectiles: 3, pierce: 999, spread: 0.6, speed: 380, radius: 9, life: 1.6,
    knockback: 9, tags: ['holy', 'fire'], proc: { fx: 'status_burn', chance: 0.4 },
    impact: 'fx_impact_holy', color: 0xfff0b0, sprite: 'proj_leg_cross', icon: 'icon_leg_cross',
  },
  leg_bible: {
    id: 'leg_bible', tier: 'legendary', name: '성광서', kind: 'projectile', pattern: 'orbit',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 2.2, damage: 40,
    projectiles: 4, baseProj: 4, growthPerLevel: 1, projCap: 8,
    orbitRadius: 72, orbitSpeed: 2.6, radius: 10, life: 3.0,
    knockback: 8, tags: ['holy'], impact: 'fx_impact_holy',
    color: 0xffd24a, sprite: 'proj_leg_bible', icon: 'icon_leg_bible',
  },
  leg_scythe: {
    id: 'leg_scythe', tier: 'legendary', name: '사신의 낫', kind: 'projectile', pattern: 'fan',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 0.85, damage: 64,
    projectiles: 1, pierce: 999, spread: 0, speed: 1100, radius: 10, life: 2.0, spriteScaleY: 1.6,
    knockback: 16, tags: ['shadow'],
    proc: { fx: 'status_bleed', chance: 0.4 },
    // legendary qi projectile (PixelLab 5-frame near-white orb; tint sets the
    // on-screen hue). Evolves the basic scythe's shadow violet (0x9a6fd0) — a
    // vivid necrotic violet befits the legendary 사신의 낫, matching its
    // 'shadow' tag + bleed proc (was an off-theme pale green 0xb6f0c0).
    impact: 'fx_impact_slash', color: 0xb066ff, sprite: 'proj_leg_scythe', icon: 'icon_scythe',
  },
  leg_nova: {
    id: 'leg_nova', tier: 'legendary', name: '황금 태양', kind: 'projectile', pattern: 'ring',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 1.2, damage: 30,
    projectiles: 12, pierce: 3, speed: 360, radius: 8, life: 1.5, knockback: 6,
    tags: ['holy', 'fire'], proc: { fx: 'status_burn', chance: 0.5 },
    impact: 'fx_impact_holy', muzzle: 'fx_muzzle_holy',
    color: 0xd0b0ff, sprite: 'proj_leg_nova', icon: 'icon_leg_nova',
  },
  leg_spectral_bow: {
    id: 'leg_spectral_bow', tier: 'legendary', name: '유령의 활', kind: 'projectile', pattern: 'fan',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 0.9, damage: 22,
    projectiles: 8, pierce: 1, spread: 0.5, speed: 480, radius: 5, life: 1.5,
    knockback: 4, homing: true, tags: ['shadow', 'arcane'],
    proc: { fx: 'status_freeze', chance: 0.18 },
    impact: 'fx_impact_arcane', muzzle: 'fx_muzzle_arcane',
    color: 0xb0c8ff, sprite: 'proj_leg_spectral_bow', icon: 'icon_leg_spectral_bow',
  },
  // Legendary sibling of holy_hammer_toss — also arc_burst, but boss-tier
  // numbers: more hammers per volley (via uniform ramp), full stun proc,
  // wide knockback. Pierce 999 + long life means each hammer sweeps the
  // play area instead of dying on impact.
  leg_world_hammer: {
    id: 'leg_world_hammer', tier: 'legendary', name: '세계의 분노',
    kind: 'projectile', pattern: 'arc_burst',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 2.4, damage: 80,
    pierce: 999, radius: 14, life: 2.8, knockback: 28,
    launchSpeed: 380, gravity: 700,
    originOffsetY: -22,
    tags: ['holy', 'physical'],
    proc: { fx: 'status_stun', chance: 1.0 },
    impact: 'fx_impact_smash',
    color: 0xffe060, sprite: 'proj_leg_judgement_hammer', icon: 'icon_divine_hammer',
  },
  leg_tempest: {
    id: 'leg_tempest', tier: 'legendary', name: '템페스트 해머', kind: 'projectile', pattern: 'aoe',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 2.0, damage: 30,
    projectiles: 1, radius: 132, life: 2.8,
    knockback: 40, tags: ['lightning', 'physical'],
    proc: { fx: 'status_shock', chance: 0.6 },
    impact: 'fx_impact_smash', color: 0xc8d8ff, sprite: 'proj_leg_tempest', icon: 'icon_leg_tempest',
    groundAsset: 'zone_thunder', // lightning theme — electric ground burst
    aoeKit: aoeKitFor('lightning', 132, { telegraphTime: 0.55, impactScale: 2.2 }),
  },
  leg_necro_skull: {
    id: 'leg_necro_skull', tier: 'legendary', name: '네크로 스쿨', kind: 'projectile', pattern: 'orbit',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 1.4, damage: 24,
    projectiles: 2, baseProj: 2, growthPerLevel: 1, projCap: 6,
    orbitRadius: 60, orbitSpeed: 2.4, radius: 9, life: 1.6,
    knockback: 6, tags: ['shadow'], impact: 'fx_impact_arcane',
    color: 0xcfe0c0, sprite: 'proj_leg_necro_skull', icon: 'icon_leg_necro',
  },
  leg_black_hole: {
    id: 'leg_black_hole', tier: 'legendary', name: '블랙홀 룬', kind: 'projectile', pattern: 'pull',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 2.5, damage: 40,
    projectiles: 1, radius: 168, life: 2.8, knockback: 0,
    tags: ['shadow', 'arcane'], proc: { fx: 'status_stun', chance: 1 },
    impact: 'fx_explosion', color: 0x8a6abf, sprite: 'proj_leg_black_hole', icon: 'icon_leg_blackhole',
    aoeKit: aoeKitFor('void', 168, { telegraphTime: 0.65, fallTime: 0.6, impactScale: 2.4 }),
  },
  leg_soul_lantern: {
    id: 'leg_soul_lantern', tier: 'legendary', name: '영혼의 등', kind: 'projectile', pattern: 'orbit',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 1.8, damage: 26,
    projectiles: 2, baseProj: 2, growthPerLevel: 1, projCap: 6,
    orbitRadius: 56, orbitSpeed: 2.2, radius: 9, life: 2.0,
    knockback: 6, tags: ['holy', 'shadow'], impact: 'fx_impact_holy',
    color: 0xb6f0d0, sprite: 'proj_leg_soul_lantern', icon: 'icon_leg_soul_lantern',
  },
  leg_sun_phoenix: {
    id: 'leg_sun_phoenix', tier: 'legendary', name: '태양의 봉황활', kind: 'projectile', pattern: 'fan',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 0.7, damage: 36,
    projectiles: 1, pierce: 999, spread: 0, speed: 620, radius: 6, life: 1.8,
    knockback: 6, homing: true, tags: ['fire', 'holy'],
    proc: { fx: 'status_burn', chance: 0.8 },
    impact: 'fx_impact_scorch', muzzle: 'fx_muzzle_fire',
    color: 0xffb24a, sprite: 'proj_leg_sun_phoenix', icon: 'icon_leg_arrow',
  },
  leg_eternal_frost: {
    id: 'leg_eternal_frost', tier: 'legendary', name: '영원의 빙결', kind: 'projectile', pattern: 'fan',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 0.9, damage: 38,
    projectiles: 1, pierce: 999, spread: 0, speed: 1200, radius: 7, life: 0.5,
    knockback: 6, tags: ['ice', 'arcane'], proc: { fx: 'status_freeze', chance: 1 },
    impact: 'fx_impact_arcane', muzzle: 'fx_muzzle_arcane',
    color: 0xbfe6ff, sprite: 'proj_leg_eternal_frost', icon: 'icon_leg_blade',
  },
  leg_demon_heart: {
    id: 'leg_demon_heart', tier: 'legendary', name: '악마의 심장', kind: 'projectile', pattern: 'aoe',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 2.0, damage: 26,
    projectiles: 1, radius: 100, life: 2.8,
    knockback: 4, tags: ['shadow', 'fire'], proc: { fx: 'status_bleed', chance: 0.5 },
    impact: 'fx_impact_arcane', color: 0xc8485a, sprite: 'proj_leg_demon_heart', icon: 'icon_leg_nova',
    groundAsset: 'zone_meteor', // demon/fire theme — keep burning crater overlay
    aoeKit: aoeKitFor('shadow', 100, { telegraphTime: 0.55, impactScale: 2.1 }),
  },
  leg_storm_caller: {
    id: 'leg_storm_caller', tier: 'legendary', name: '폭풍 소환자', kind: 'projectile', pattern: 'rain',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 1.5, damage: 30,
    projectiles: 8, pierce: 999, speed: 620, radius: 9, life: 1.7, knockback: 7,
    tags: ['lightning'], proc: { fx: 'status_shock', chance: 1 },
    impact: 'fx_impact_arcane', color: 0xbfe6ff, sprite: 'proj_leg_storm_caller', icon: 'icon_leg_tempest',
    aoeKit: aoeKitFor('lightning', 60, { telegraphTime: 0.5, fallTime: 0.45, impactScale: 1.5, rainSkipDrop: true }),
  },
  leg_world_tree: {
    id: 'leg_world_tree', tier: 'legendary', name: '세계수의 가지', kind: 'projectile', pattern: 'orbit',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 0.6, damage: 12,
    projectiles: 1, orbitRadius: 0, orbitSpeed: 0, radius: 76, life: 0.7,
    knockback: 3, tags: ['nature', 'holy'], proc: { fx: 'status_poison', chance: 0.4 },
    impact: 'fx_impact_pierce', color: 0x8fd06a, sprite: 'proj_leg_world_tree', icon: 'icon_leg_bible',
  },

  // ── v2 rebuild — Legendary expansion (13 new) ────────────────────────────
  // These reuse base sprites with deliberate color shifts; final visuals will
  // route through pixellab_candidates/<concept>/* in Wave B (see PROMOTE).
  leg_shadow_arrow: {
    id: 'leg_shadow_arrow', tier: 'legendary', name: '그림자 화살', kind: 'projectile', pattern: 'fan',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 0.7, damage: 28,
    projectiles: 1, pierce: 999, spread: 0, speed: 760, radius: 5, life: 2.0,
    knockback: 4, homing: true, tags: ['shadow', 'physical'], proc: { fx: 'status_poison', chance: 0.7 },
    impact: 'fx_impact_pierce',
    color: 0x6840a0, sprite: 'proj_leg_shadow_arrow', icon: 'icon_arrow',
  },
  leg_obsidian_blade: {
    id: 'leg_obsidian_blade', tier: 'legendary', name: '흑요석 검', kind: 'projectile', pattern: 'fan',
    maxLevel: 3, dmgPerLevel: 0.1, cooldown: 0.6, damage: 56,
    projectiles: 1, pierce: 999, spread: 0, speed: 1200, radius: 9, life: 2.0, spriteScaleY: 1.6,
    knockback: 18, tags: ['physical', 'shadow'],
    proc: { fx: 'status_bleed', chance: 0.6 },
    // legendary qi projectile: dark obsidian shadow slash (PixelLab 5-frame)
    impact: 'fx_impact_slash', color: 0x6b3aa0, sprite: 'proj_leg_obsidian_blade', icon: 'icon_cleaver',
  },
  leg_judgement_hammer: {
    id: 'leg_judgement_hammer', tier: 'legendary', name: '심판의 망치', kind: 'projectile', pattern: 'aoe',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 1.5, damage: 44,
    projectiles: 1, projGrowth: true, radius: 132, life: 2.6,
    knockback: 42, tags: ['holy', 'physical'], proc: { fx: 'status_stun', chance: 0.7 },
    impact: 'fx_impact_holy',
    color: 0xffe060, sprite: 'proj_leg_judgement_hammer', icon: 'icon_divine_hammer',
    aoeKit: aoeKitFor('holy', 132, { telegraphTime: 0.6, fallTime: 0.55, impactScale: 2.4 }),
  },
  leg_crimson_knives: {
    id: 'leg_crimson_knives', tier: 'legendary', name: '핏빛 단검', kind: 'projectile', pattern: 'fan',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 0.6, damage: 18,
    projectiles: 5, projGrowth: true, pierce: 2, spread: 0.32, speed: 340, radius: 4, life: 0.8,
    knockback: 5, tags: ['physical'], proc: { fx: 'status_bleed', chance: 1 },
    impact: 'fx_impact_pierce',
    color: 0xc04848, sprite: 'proj_leg_crimson_knives', icon: 'icon_knives',
  },
  leg_galaxy_orb: {
    id: 'leg_galaxy_orb', tier: 'legendary', name: '은하의 핵', kind: 'projectile', pattern: 'pull',
    maxLevel: 3, dmgPerLevel: 0.1, cooldown: 2.5, damage: 48,
    projectiles: 1, radius: 180, life: 3.0, knockback: 0,
    tags: ['shadow', 'arcane'], proc: { fx: 'status_freeze', chance: 1 },
    impact: 'fx_impact_arcane', color: 0x6028b0, sprite: 'proj_leg_galaxy_orb', icon: 'icon_void_sphere',
    aoeKit: aoeKitFor('arcane', 180, { telegraphTime: 0.65, fallTime: 0.6, impactScale: 2.4 }),
  },
  leg_inferno_wall: {
    id: 'leg_inferno_wall', tier: 'legendary', name: '지옥불 장벽', kind: 'projectile', pattern: 'aoe',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 1.4, damage: 18,
    projectiles: 1, projGrowth: true, radius: 130, life: 3.4,
    knockback: 4, tags: ['fire'], proc: { fx: 'status_burn', chance: 1 },
    impact: 'fx_impact_burn',
    color: 0xff4020, sprite: 'proj_leg_inferno_wall', icon: 'icon_firewall',
    groundAsset: 'zone_meteor', // fire theme — keep burning crater overlay
    aoeKit: aoeKitFor('fire', 130, { telegraphTime: 0.55, fallTime: 0.55, impactScale: 2.3 }),
  },
  leg_thunder_lord: {
    id: 'leg_thunder_lord', tier: 'legendary', name: '뇌신의 권능', kind: 'projectile', pattern: 'chain',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 1.2, damage: 40,
    projectiles: 1, pierce: 1, bounces: 8, bouncesGrowth: true,
    speed: 620, radius: 9, life: 0.8, knockback: 8,
    tags: ['lightning', 'holy'], proc: { fx: 'status_shock', chance: 1 },
    impact: 'fx_chain_lightning',
    color: 0xfff0e0, sprite: 'proj_leg_thunder_lord', icon: 'icon_lightning',
  },
  leg_seraph_wing: {
    id: 'leg_seraph_wing', tier: 'legendary', name: '치천사의 날개', kind: 'projectile', pattern: 'ring',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 1.5, damage: 24,
    projectiles: 10, pierce: 3, speed: 380, radius: 8, life: 1.6, knockback: 8,
    tags: ['holy'], proc: { fx: 'status_burn', chance: 0.5 },
    impact: 'fx_impact_holy', muzzle: 'fx_muzzle_holy',
    color: 0xfff8c0, sprite: 'proj_leg_seraph_wing', icon: 'icon_nova',
  },
  leg_hammer_of_dawn: {
    id: 'leg_hammer_of_dawn', tier: 'legendary', name: '여명의 망치', kind: 'projectile', pattern: 'rain',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 1.6, damage: 38,
    projectiles: 5, projGrowth: true, pierce: 999, speed: 700, radius: 12, life: 1.8,
    knockback: 16, tags: ['holy', 'physical'], proc: { fx: 'status_stun', chance: 0.6 },
    impact: 'fx_impact_holy',
    color: 0xffd870, sprite: 'proj_leg_hammer_of_dawn', icon: 'icon_divine_hammer',
    aoeKit: aoeKitFor('holy', 80, { telegraphTime: 0.55, fallTime: 0.5, impactScale: 1.8, rainSkipDrop: true }),
  },
  leg_frozen_throne: {
    id: 'leg_frozen_throne', tier: 'legendary', name: '얼어붙은 옥좌', kind: 'projectile', pattern: 'aoe',
    maxLevel: 3, dmgPerLevel: 0.08, cooldown: 2.0, damage: 22,
    projectiles: 1, radius: 140, life: 3.0,
    knockback: 0, tags: ['ice', 'arcane'], proc: { fx: 'status_freeze', chance: 1 },
    impact: 'fx_impact_arcane',
    color: 0x80a8ff, sprite: 'proj_leg_frozen_throne', icon: 'icon_holywater',
    aoeKit: aoeKitFor('ice', 140, { telegraphTime: 0.6, fallTime: 0.55, impactScale: 2.3 }),
  },
  // — extension weapons (5종) — reuse existing projectile sprites with
  //   different patterns / numbers so they feel distinct without new art.
  soul_arrow: {
    id: 'soul_arrow', tier: 'basic', name: '영혼 화살', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.2, damage: 20,
    projectiles: 1, projGrowth: true, pierce: 4, spread: 0, speed: 480, radius: 5, life: 1.8,
    knockback: 3, homing: true, tags: ['shadow', 'arcane'],
    proc: { fx: 'status_poison', chance: 0.35 },
    impact: 'fx_impact_arcane',
    color: 0xa078ff, sprite: 'proj_arrow', icon: 'icon_arrow',
  },
  time_stop: {
    id: 'time_stop', tier: 'basic', name: '시간 멈춤', kind: 'projectile', pattern: 'aoe',
    maxLevel: 3, dmgPerLevel: 0.1, cooldown: 6.0, damage: 8,
    projectiles: 1, radius: 52, life: 1.2,
    knockback: 0, tags: ['arcane', 'ice'], proc: { fx: 'status_freeze', chance: 1 },
    impact: 'fx_impact_arcane',
    color: 0x88c8ff, sprite: 'proj_holywater', icon: 'icon_holywater',
    aoeKit: aoeKitFor('ice', 52, { telegraphTime: 0.65, fallTime: 0.5, impactScale: 1.4 }),
    classNeutral: true, // 공용 풀
  },

  // ── Phase 1 rebuild — class-themed weapons reusing PixelLab sprites ──────
  // No new art required: each weapon picks an existing projectile + impact
  // sprite and gets a unique pattern + proc to feel distinct.
  holy_nova: {
    id: 'holy_nova', tier: 'basic', name: '신성 노바', kind: 'projectile', pattern: 'ring',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 2.0, damage: 14,
    projectiles: 6, pierce: 2, speed: 200, radius: 8, life: 1.4, knockback: 5,
    tags: ['holy'], proc: { fx: 'status_slow', chance: 0.35 },
    impact: 'fx_impact_holy', muzzle: 'fx_muzzle_holy',
    color: 0xfff0a8, sprite: 'proj_holy_nova', icon: 'icon_nova', effectAsset: 'holy_nova_fx',
  },
  divine_rain: {
    id: 'divine_rain', tier: 'basic', name: '신성 강림', kind: 'projectile', pattern: 'rain',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 2.4, damage: 28,
    projectiles: 4, projGrowth: true, pierce: 999, speed: 540, radius: 10, life: 1.6,
    knockback: 8, tags: ['holy', 'physical'], proc: { fx: 'status_stun', chance: 0.4 },
    impact: 'fx_impact_holy',
    color: 0xf0e0a0, sprite: 'proj_divine_rain', icon: 'icon_divine_hammer', effectAsset: 'divine_rain_fx',
    aoeKit: aoeKitFor('holy', 60, { telegraphTime: 0.55, fallTime: 0.5, impactScale: 1.7, rainSkipDrop: true }),
  },
  whirlwind_blade: {
    id: 'whirlwind_blade', tier: 'basic', name: '회오리 칼날', kind: 'projectile', pattern: 'orbit',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.4, damage: 16,
    projectiles: 4, baseProj: 4, growthPerLevel: 1, projCap: 8,
    projGrowth: true, orbitRadius: 52, orbitSpeed: 4.5,
    radius: 10, life: 1.5, knockback: 6,
    tags: ['physical'], proc: { fx: 'status_bleed', chance: 0.3 },
    impact: 'fx_swing',
    color: 0xd3dae0, sprite: 'proj_whirlwind_blade', icon: 'icon_knives',
  },

  // ── v2 rebuild — Knight (7 new, paladin/holy theme) ──────────────────────
  crusader_lance: {
    id: 'crusader_lance', tier: 'basic', name: '십자군 창', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.1, damage: 30,
    projectiles: 1, pierce: 999, spread: 0, speed: 980, radius: 6, life: 0.7,
    knockback: 8, tags: ['holy', 'physical'], proc: { fx: 'status_stun', chance: 0.25 },
    impact: 'fx_impact_holy', muzzle: 'fx_muzzle_holy',
    color: 0xfff0c0, sprite: 'proj_crusader_lance', icon: 'icon_holy_lance',
  },
  guardian_orbit: {
    id: 'guardian_orbit', tier: 'basic', name: '수호의 고리', kind: 'projectile', pattern: 'orbit',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.3, damage: 14,
    projectiles: 3, baseProj: 3, growthPerLevel: 1, projCap: 8,
    projGrowth: true, orbitRadius: 56, orbitSpeed: 2.6,
    radius: 11, life: 1.6, knockback: 10,
    tags: ['holy'], proc: { fx: 'status_shield', chance: 0.3 },
    impact: 'fx_impact_holy',
    color: 0xf0e0a0, sprite: 'proj_guardian_orbit', icon: 'icon_shield_throw',
  },
  judgement_beam: {
    id: 'judgement_beam', tier: 'basic', name: '심판의 광선', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.4, damage: 38,
    projectiles: 1, pierce: 999, spread: 0, speed: 1500, radius: 8, life: 0.5,
    knockback: 6, tags: ['holy'], proc: { fx: 'status_burn', chance: 0.4 },
    impact: 'fx_impact_holy', muzzle: 'fx_muzzle_holy',
    color: 0xfff8a0, sprite: 'proj_judgement_beam', icon: 'icon_heal_beam', effectAsset: 'judgement_beam_fx',
  },
  consecrate: {
    id: 'consecrate', tier: 'basic', name: '성지화', kind: 'projectile', pattern: 'orbit',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.4, damage: 10,
    projectiles: 1, orbitRadius: 0, orbitSpeed: 0, radius: 88, life: 1.0,
    knockback: 3, tags: ['holy'], proc: { fx: 'status_slow', chance: 0.5 },
    impact: 'fx_impact_holy', spriteAlpha: 0.55,
    color: 0xfff0c0, sprite: 'proj_consecrate', icon: 'icon_sanctuary',
  },
  aegis_throw: {
    id: 'aegis_throw', tier: 'basic', name: '이지스 방패', kind: 'projectile', pattern: 'boomerang',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.0, damage: 26,
    projectiles: 1, projGrowth: true, pierce: 999, spread: 0.4, speed: 380, radius: 11, life: 1.6,
    knockback: 18, tags: ['holy', 'physical'], proc: { fx: 'status_stun', chance: 0.35 },
    impact: 'fx_impact_smash',
    color: 0xe0c878, sprite: 'proj_aegis_throw', icon: 'icon_shield_throw',
  },
  dawnbreaker: {
    id: 'dawnbreaker', tier: 'basic', name: '여명 분쇄자', kind: 'projectile', pattern: 'chain',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.6, damage: 28,
    projectiles: 1, pierce: 1, bounces: 3, bouncesGrowth: true,
    speed: 540, radius: 8, life: 0.7, knockback: 6,
    tags: ['holy', 'lightning'], proc: { fx: 'status_shock', chance: 0.5 },
    impact: 'fx_chain_lightning',
    color: 0xfff0a8, sprite: 'proj_dawnbreaker', icon: 'icon_lightning',
  },

  // ── v2 rebuild — Warrior (8 new, melee/physical theme) ──────────────────
  berserker_axe: {
    id: 'berserker_axe', tier: 'basic', name: '광전사 도끼', kind: 'melee', pattern: 'melee',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 0.75, damage: 30,
    reach: 56, radius: 76, life: 0.18, knockback: 16, tags: ['physical'],
    proc: { fx: 'status_bleed', chance: 0.4 },
    // Effect = shared slash arc (검기), NOT the axe model. icon stays the axe.
    impact: 'fx_impact_slash', color: 0xcc6a3a, sprite: 'fx_slash', icon: 'icon_cleaver',
  },
  gladius_throw: {
    id: 'gladius_throw', tier: 'basic', name: '글라디우스 투척', kind: 'projectile', pattern: 'boomerang',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 0.95, damage: 22,
    projectiles: 2, projGrowth: true, pierce: 999, spread: 0.5, speed: 420, radius: 7, life: 1.3,
    knockback: 9, tags: ['physical'], proc: { fx: 'status_bleed', chance: 0.3 },
    impact: 'fx_impact_slash',
    color: 0xd8c8a0, sprite: 'proj_gladius_throw', icon: 'icon_throw_axes',
  },
  anvil_drop: {
    id: 'anvil_drop', tier: 'basic', name: '거대 망치 낙하', kind: 'projectile', pattern: 'rain',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 2.6, damage: 36,
    projectiles: 3, projGrowth: true, pierce: 999, speed: 620, radius: 13, life: 1.8,
    knockback: 22, tags: ['physical'], proc: { fx: 'status_stun', chance: 0.5 },
    impact: 'fx_impact_smash',
    color: 0xa89070, sprite: 'proj_anvil_drop', icon: 'icon_divine_hammer',
    aoeKit: aoeKitFor('physical', 70, { telegraphTime: 0.6, fallTime: 0.55, impactScale: 1.9, rainSkipDrop: true }),
  },
  spike_burst: {
    id: 'spike_burst', tier: 'basic', name: '가시 분출', kind: 'projectile', pattern: 'ring',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.8, damage: 15,
    projectiles: 10, pierce: 2, speed: 340, radius: 6, life: 1.1, knockback: 8,
    tags: ['physical'], proc: { fx: 'status_bleed', chance: 0.25 },
    impact: 'fx_impact_pierce',
    color: 0xb8b0a0, sprite: 'proj_spike_burst', icon: 'icon_bone',
  },
  meat_cleaver: {
    id: 'meat_cleaver', tier: 'basic', name: '핏빛 식칼', kind: 'melee', pattern: 'melee',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 0.95, damage: 28,
    reach: 64, radius: 64, life: 0.17, knockback: 14, tags: ['physical'],
    proc: { fx: 'status_bleed', chance: 0.65 },
    // Effect = shared slash arc (검기), NOT the cleaver model. icon stays.
    // deep blood red — distinct from berserker_axe's orange (0xcc6a3a).
    impact: 'fx_impact_slash', color: 0xd83a3a, sprite: 'fx_slash', icon: 'icon_cleaver',
  },
  warcry_pulse: {
    id: 'warcry_pulse', tier: 'basic', name: '전투 함성', kind: 'aura', pattern: 'aura_buff',
    maxLevel: 5, dmgPerLevel: 0, cooldown: 8.0, damage: 0,
    buff: { damage: 1.15, cooldown: 0.90 }, // +15% 데미지, -10% 공격 쿨다운
    duration: 5.0,
    tags: ['physical'], color: 0xd88060,
    impact: null, sprite: 'proj_warcry_pulse', icon: 'icon_warhammer',
    assetKey: 'buff_warcry_pulse',
  },
  wrath_focus: {
    id: 'wrath_focus', tier: 'basic', name: '격노', kind: 'aura', pattern: 'aura_buff',
    maxLevel: 5, dmgPerLevel: 0, cooldown: 9.0, damage: 0,
    buff: { cooldown: 0.75, moveSpeed: 1.10 }, // 공속 +33% (cooldown -25%), 이속 +10%
    duration: 5.0,
    tags: ['nature', 'physical'], color: 0x88b85a,
    impact: null, sprite: 'proj_consecrate', icon: 'icon_arrow',
    assetKey: 'buff_wrath_focus',
  },
  holy_blessing: {
    id: 'holy_blessing', tier: 'basic', name: '성스러운 가호', kind: 'aura', pattern: 'aura_buff',
    maxLevel: 5, dmgPerLevel: 0, cooldown: 12.0, damage: 0,
    buff: { damage: 1.10, critChance: 0.35 }, // +10% 데미지, 치명타 35% (base 10% → 35%)
    duration: 8.0,
    tags: ['holy'], color: 0xfff0c0,
    impact: null, sprite: 'proj_sanctuary', icon: 'icon_sanctuary',
    assetKey: 'buff_holy_blessing',
  },
  garlic_aura: {
    id: 'garlic_aura', tier: 'basic', name: '마늘 향기', kind: 'aura', pattern: 'aura_buff',
    maxLevel: 5, dmgPerLevel: 0, cooldown: 9.0, damage: 0,
    buff: { damage: 1.10 }, // 약한 데미지 buff — 공용 풀
    duration: 6.0,
    tags: ['nature'], color: 0xe8e2c0,
    impact: null, sprite: 'proj_spell_rune_circle', icon: 'icon_garlic',
    classNeutral: true, // 공용 풀
    assetKey: 'buff_garlic_aura',
  },

  // ── v2 rebuild — Huntress (9 new, ranged/trap theme) ─────────────────────
  piercing_arrow: {
    id: 'piercing_arrow', tier: 'basic', name: '꿰뚫는 화살', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.1, damage: 22,
    projectiles: 1, pierce: 999, spread: 0, speed: 540, radius: 5, life: 1.8,
    knockback: 4, tags: ['physical'], proc: { fx: 'status_bleed', chance: 0.3 },
    impact: 'fx_impact_pierce', muzzle: 'fx_muzzle_arcane',
    color: 0xc8b074, sprite: 'proj_piercing_arrow', icon: 'icon_arrow',
  },
  barbed_net: {
    id: 'barbed_net', tier: 'basic', name: '가시 그물', kind: 'projectile', pattern: 'aoe',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 2.0, damage: 9,
    projectiles: 1, projGrowth: true, radius: 36, life: 2.8,
    knockback: 2, tags: ['nature', 'physical'], proc: { fx: 'status_slow', chance: 1 },
    impact: 'fx_impact_pierce',
    color: 0x8aa46a, sprite: 'proj_barbed_net', icon: 'icon_snare_trap',
    aoeKit: aoeKitFor('nature', 36, { telegraphTime: 0.5, impactScale: 1.0 }),
  },
  hawk_swarm: {
    id: 'hawk_swarm', tier: 'basic', name: '매 무리', kind: 'projectile', pattern: 'orbit',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.3, damage: 14,
    projectiles: 3, baseProj: 3, growthPerLevel: 1, projCap: 8,
    projGrowth: true, orbitRadius: 72, orbitSpeed: 3.4,
    radius: 8, life: 1.6, knockback: 4,
    tags: ['physical', 'nature'], proc: { fx: 'status_bleed', chance: 0.5 },
    impact: 'fx_impact_slash',
    color: 0xc8a060, sprite: 'proj_hawk_swarm', icon: 'icon_hunting_hawk',
  },
  bear_trap: {
    id: 'bear_trap', tier: 'basic', name: '곰 덫', kind: 'projectile', pattern: 'aoe',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 2.2, damage: 26,
    projectiles: 1, radius: 34, life: 2.4,
    knockback: 4, tags: ['physical'], proc: { fx: 'status_stun', chance: 0.8 },
    impact: 'fx_impact_pierce',
    // Disc color bumped from 0x8a6a4a (dark brown — invisible on forest
    // grass tiles) to brighter copper-amber so the placed zone reads as
    // a hazard, not a dirt patch. Radius shrunk 56 → 34 so the trap
    // visual reads as a single bite rather than a small crater.
    color: 0xd8a848, sprite: 'proj_bear_trap', icon: 'icon_snare_trap',
    aoeKit: aoeKitFor('physical', 34, { telegraphTime: 0.45, fallTime: 0.4, impactScale: 1.0 }),
  },
  marksman_shot: {
    id: 'marksman_shot', tier: 'basic', name: '명사수의 일격', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.1, cooldown: 2.0, damage: 38,
    projectiles: 1, pierce: 3, spread: 0, speed: 600, radius: 5, life: 1.5,
    knockback: 6, tags: ['physical'], proc: { fx: 'status_bleed', chance: 0.4 },
    impact: 'fx_impact_pierce', muzzle: 'fx_muzzle_arcane',
    color: 0xffd870, sprite: 'proj_marksman_shot', icon: 'icon_crossbow_bolt',
  },
  phantom_arrow: {
    id: 'phantom_arrow', tier: 'basic', name: '유령 화살', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.3, damage: 18,
    projectiles: 1, projGrowth: true, pierce: 3, spread: 0.4, speed: 360, radius: 5, life: 1.8,
    knockback: 3, homing: true, tags: ['shadow', 'physical'], proc: { fx: 'status_poison', chance: 0.35 },
    impact: 'fx_impact_pierce',
    color: 0xb0c0e0, sprite: 'proj_phantom_arrow', icon: 'icon_arrow',
  },
  salvo_shot: {
    id: 'salvo_shot', tier: 'basic', name: '일제 사격', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.6, damage: 14,
    projectiles: 4, projGrowth: true, pierce: 2, spread: 0.35, speed: 420, radius: 4, life: 1.6,
    knockback: 4, tags: ['physical'], proc: { fx: 'status_bleed', chance: 0.2 },
    impact: 'fx_impact_pierce',
    color: 0xc8b88a, sprite: 'proj_salvo_shot', icon: 'icon_arrow',
  },
  hunters_blade: {
    id: 'hunters_blade', tier: 'basic', name: '사냥꾼의 단검', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.05, damage: 16,
    projectiles: 1, projGrowth: true, pierce: 2, spread: 0.18, speed: 280, radius: 4, life: 0.6,
    knockback: 5, tags: ['physical'], proc: { fx: 'status_bleed', chance: 0.4 },
    impact: 'fx_impact_pierce',
    color: 0x90b078, sprite: 'proj_hunters_blade', icon: 'icon_knives',
  },

  // ── Gennaro Belpaese — dual dagger fan ───────────────────────────────
  dagger_fan: {
    id: 'dagger_fan', tier: 'basic', name: '단검 부채', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 0.65, damage: 12,
    projectiles: 3, pierce: 1, spread: 0.22, speed: 380, radius: 4, life: 0.7,
    knockback: 4, tags: ['physical'], proc: { fx: 'status_bleed', chance: 0.35 },
    impact: 'fx_impact_pierce', color: 0xe6dba0, sprite: 'proj_dagger_blade', icon: 'icon_knives',
  },
  dagger_storm: {
    id: 'dagger_storm', tier: 'legendary', name: '단검의 폭풍', kind: 'projectile', pattern: 'ring',
    maxLevel: 3, dmgPerLevel: 0.1, cooldown: 1.1, damage: 22,
    projectiles: 8, pierce: 2, speed: 460, radius: 5, life: 0.9,
    knockback: 6, tags: ['physical'], proc: { fx: 'status_bleed', chance: 0.6 },
    impact: 'fx_impact_pierce', color: 0xf2e6c0, sprite: 'proj_dagger_legendary', icon: 'icon_knives',
  },

  // ── Pasqualina Belpaese — bouncing runetracer ────────────────────────
  runetracer: {
    id: 'runetracer', tier: 'basic', name: '룬 트레이서', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.3, damage: 18,
    projectiles: 1, pierce: 999, spread: 0, speed: 360, radius: 7, life: 4.0,
    knockback: 5, tags: ['arcane'],
    bounceLeft: 3, bounceInterval: 0.42,
    impact: 'fx_impact_arcane', color: 0xb574d8, sprite: 'proj_rune_violet', icon: 'icon_arcane_missile',
  },
  nox_runica: {
    id: 'nox_runica', tier: 'legendary', name: '녹스 루니카', kind: 'projectile', pattern: 'fan',
    maxLevel: 3, dmgPerLevel: 0.1, cooldown: 1.1, damage: 28,
    projectiles: 2, pierce: 999, spread: 0.18, speed: 420, radius: 8, life: 5.0,
    knockback: 7, tags: ['arcane', 'shadow'],
    bounceLeft: 7, bounceInterval: 0.38,
    impact: 'fx_impact_arcane', color: 0xc894ff, sprite: 'proj_rune_void', icon: 'icon_arcane_missile',
  },

  // ── Porta Ladonna — chain lightning ring ─────────────────────────────
  tesla_ring: {
    id: 'tesla_ring', tier: 'basic', name: '뇌격의 반지', kind: 'projectile', pattern: 'chain',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.0, damage: 16,
    projectiles: 1, pierce: 1, bounces: 3, bouncesGrowth: true,
    speed: 580, radius: 8, life: 0.7, knockback: 4,
    tags: ['lightning'], proc: { fx: 'status_shock', chance: 0.4 },
    impact: 'fx_chain_lightning', color: 0x9ad8ff, sprite: 'proj_tesla_arc', icon: 'icon_lightning',
  },
  storm_crown: {
    id: 'storm_crown', tier: 'legendary', name: '뇌제의 왕관', kind: 'projectile', pattern: 'chain',
    maxLevel: 3, dmgPerLevel: 0.1, cooldown: 0.9, damage: 32,
    projectiles: 1, pierce: 1, bounces: 6, bouncesGrowth: true,
    speed: 680, radius: 10, life: 0.9, knockback: 7,
    tags: ['lightning', 'arcane'], proc: { fx: 'status_shock', chance: 1 },
    impact: 'fx_chain_lightning', color: 0xc8e8ff, sprite: 'proj_storm_arc', icon: 'icon_lightning',
  },

  // ── v2 rebuild — Mage (11 new, full 6-element coverage) ──────────────────
  meteor: {
    id: 'meteor', tier: 'basic', name: '운석', kind: 'projectile', pattern: 'rain',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 2.6, damage: 40,
    projectiles: 2, projGrowth: true, pierce: 999, speed: 600, radius: 14, life: 1.8,
    knockback: 16, tags: ['fire', 'physical'], proc: { fx: 'status_burn', chance: 0.7 },
    impact: 'fx_impact_burn',
    color: 0xff7030, sprite: 'proj_meteor', icon: 'icon_firewall',
    aoeKit: aoeKitFor('fire', 80, { telegraphTime: 0.6, fallTime: 0.55, impactScale: 2.0, rainSkipDrop: true }),
  },
  ice_spear: {
    id: 'ice_spear', tier: 'basic', name: '빙결 창', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.0, damage: 22,
    projectiles: 1, pierce: 999, spread: 0, speed: 720, radius: 6, life: 1.5,
    knockback: 5, tags: ['ice', 'arcane'], proc: { fx: 'status_freeze', chance: 0.5 },
    impact: 'fx_impact_arcane', muzzle: 'fx_muzzle_arcane',
    color: 0xa8e0ff, sprite: 'proj_ice_spear', icon: 'icon_frost_bolt',
  },
  chain_void: {
    id: 'chain_void', tier: 'basic', name: '연쇄 공허', kind: 'projectile', pattern: 'chain',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 2.0, damage: 26,
    projectiles: 1, pierce: 1, bounces: 5, bouncesGrowth: true,
    speed: 480, radius: 8, life: 0.8, knockback: 4,
    tags: ['shadow', 'lightning'], proc: { fx: 'status_poison', chance: 0.5 },
    impact: 'fx_chain_lightning',
    color: 0x8a4ad4, sprite: 'proj_chain_void', icon: 'icon_lightning', effectAsset: 'chain_void_fx',
  },
  arcane_orb: {
    id: 'arcane_orb', tier: 'basic', name: '아케인 오브', kind: 'projectile', pattern: 'orbit',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 2.4, damage: 24,
    projectiles: 1, orbitRadius: 0, orbitSpeed: 0, radius: 80, life: 1.4,
    knockback: 4, tags: ['arcane'], proc: { fx: 'status_freeze', chance: 0.4 },
    impact: 'fx_impact_arcane',
    color: 0xc888ff, sprite: 'proj_arcane_orb_v2', icon: 'icon_nova',
  },
  elemental_burst: {
    id: 'elemental_burst', tier: 'basic', name: '원소 폭발', kind: 'projectile', pattern: 'ring',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 2.4, damage: 16,
    projectiles: 6, pierce: 2, speed: 320, radius: 7, life: 1.4, knockback: 6,
    tags: ['fire', 'ice', 'lightning', 'arcane'], proc: { fx: 'status_burn', chance: 0.5 },
    impact: 'fx_impact_arcane', muzzle: 'fx_muzzle_arcane',
    color: 0xff80c0, sprite: 'proj_elemental_burst', icon: 'icon_nova',
  },
  frost_nova: {
    id: 'frost_nova', tier: 'basic', name: '빙결 노바', kind: 'projectile', pattern: 'ring',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 2.0, damage: 12,
    projectiles: 8, pierce: 1, speed: 260, radius: 6, life: 1.2, knockback: 5,
    tags: ['ice'], proc: { fx: 'status_freeze', chance: 0.6 },
    impact: 'fx_impact_arcane',
    color: 0xa0e0ff, sprite: 'proj_frost_nova', icon: 'icon_nova', effectAsset: 'frost_nova_fx',
  },
  magma_burst: {
    id: 'magma_burst', tier: 'basic', name: '용암 분출', kind: 'projectile', pattern: 'aoe',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.8, damage: 14,
    projectiles: 1, projGrowth: true, radius: 48, life: 2.6,
    knockback: 3, tags: ['fire'], proc: { fx: 'status_burn', chance: 1 },
    impact: 'fx_impact_burn',
    color: 0xff5828, sprite: 'proj_magma_burst', icon: 'icon_firewall', effectAsset: 'magma_burst_fx',
    groundAsset: 'zone_meteor', // fire theme — keep burning crater overlay
    aoeKit: aoeKitFor('fire', 48, { telegraphTime: 0.5, impactScale: 1.2 }),
  },
  glacial_lance: {
    id: 'glacial_lance', tier: 'basic', name: '빙하 창', kind: 'projectile', pattern: 'fan',
    maxLevel: 5, dmgPerLevel: 0.08, cooldown: 1.3, damage: 32,
    projectiles: 1, pierce: 999, spread: 0, speed: 1100, radius: 7, life: 0.6,
    knockback: 8, tags: ['ice'], proc: { fx: 'status_freeze', chance: 0.6 },
    impact: 'fx_impact_arcane', muzzle: 'fx_muzzle_arcane',
    color: 0x80c8ff, sprite: 'proj_glacial_lance', icon: 'icon_frost_bolt',
  },
};

export const STARTING_WEAPON = 'wand';

// Weapons offered as a "new weapon" level-up choice.
export const BASE_WEAPONS = [
  // ── classic pool (40) ─────────────────────────────────────────────────
  'wand', 'nova', 'spear', 'axe', 'holywater', 'arcane_field', 'wrath_focus', 'holy_blessing', 'garlic_aura', 'arrow',
  'cross', 'lightning', 'firewall', 'knives',
  'scythe', 'sword',
  'shield_throw', 'divine_hammer', 'throw_axes', 'void_sphere', 'arcane_missile', 'bible', 'heal_beam', 'smite', 'sanctuary',
  'black_pigeon', 'falling_axe', 'holy_hammer_toss',
  // extension weapons
  'soul_arrow', 'time_stop',
  // Phase 1 rebuild — class-themed weapons
  'holy_nova', 'divine_rain', 'whirlwind_blade',
  'holy_censer', // demoted from cleric exclusive after cleric fold
  // ── v2 rebuild — Knight (7) ───────────────────────────────────────────
  'crusader_lance', 'guardian_orbit', 'judgement_beam',
  'consecrate', 'aegis_throw', 'dawnbreaker',
  // ── v2 rebuild — Warrior (8) ──────────────────────────────────────────
  'berserker_axe', 'gladius_throw', 'anvil_drop', 'spike_burst', 'meat_cleaver', 'warcry_pulse',
  // ── v2 rebuild — Huntress (9) ─────────────────────────────────────────
  'piercing_arrow', 'barbed_net', 'hawk_swarm', 'bear_trap', 'marksman_shot',
  'phantom_arrow', 'salvo_shot', 'hunters_blade',
  // ── v2 rebuild — Mage (11, full elemental coverage) ───────────────────
  'meteor', 'ice_spear', 'chain_void', 'arcane_orb', 'elemental_burst',
  'frost_nova', 'magma_burst',
  'glacial_lance'
];

// Exclusive weapons — one per hero, added only to that hero's roll pool.
// cleric folded into knight (v2 rebuild) — holy_censer demoted to knight base.
export const EXCLUSIVE_WEAPONS = {
  knight: 'vanguard_sword',
  warrior: 'warhammer',
  mage: 'astral_staff',
  huntress: 'hunters_bow',
  porta: 'storm_crown',
  gennaro: 'dagger_storm',
  pasqualina: 'nox_runica',
};

// Legendary weapons — the boss-chest reward pool.
export const LEGENDARY_WEAPONS = [
  // classic (19)
  'leg_blade', 'leg_axe', 'leg_spear', 'leg_arrow', 'leg_whip', 'leg_cross',
  'leg_bible', 'leg_scythe', 'leg_nova', 'leg_spectral_bow', 'leg_tempest',
  'leg_necro_skull', 'leg_black_hole', 'leg_soul_lantern', 'leg_sun_phoenix',
  'leg_eternal_frost', 'leg_demon_heart', 'leg_storm_caller', 'leg_world_tree',
  // v2 expansion (13)
  'leg_shadow_arrow', 'leg_obsidian_blade',
  'leg_judgement_hammer', 'leg_crimson_knives', 'leg_galaxy_orb',
  'leg_inferno_wall', 'leg_thunder_lord', 'leg_seraph_wing',
  'leg_hammer_of_dawn', 'leg_frozen_throne',
  // arc_burst legendary — sibling of holy_hammer_toss
  'leg_world_hammer',
];

// ── v2 rebuild — per-weapon skill trees ──────────────────────────────────
// Lv1 is no-perk (weapon at base values); Lv2-5 each unlock a meaningful
// perk that stacks. weaponFire.js → effectiveDef(def, level) folds these
// onto the weapon def before fire() consumes its fields.
//
// Mod rules (see effectiveDef):
//   number  → multiplicative   (`speed: 1.15`  → eff.speed *= 1.15)
//   '+N'    → additive         (`pierce: '+2'` → eff.pierce += 2)
//   proc {} → shallow-merge    (`{ chance: 0.5 }` overwrites proc.chance)
//   bool    → overwrite        (`bouncesGrowth: true`)
//
// Class flavor: knight=stun/holy, warrior=bleed/knockback, huntress=pierce/
// speed/crit, mage=element-proc/cooldown. Trees written separately from
// the weapon defs for grep-friendly batch editing.
const SKILL_TREES = {
  // ── Phase 1 weapons (5) ───────────────────────────────────────────────
  storm_field: [
    { lvl: 2, name: '폭풍 확장', mod: { radius: 1.2, speed: 1.1 } },
    { lvl: 3, name: '강화된 감전', mod: { proc: { chance: 0.7 } } },
    { lvl: 4, name: '신속 폭풍', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '천둥 군세', mod: { projectiles: '+4' } }
  ],
  holy_nova: [
    { lvl: 2, name: '확장 노바', mod: { radius: 1.25 } },
    { lvl: 3, name: '신성 둔화', mod: { proc: { chance: 0.7 } } },
    { lvl: 4, name: '신속 시전', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '쌍둥이 노바', mod: { projectiles: '+3' } }
  ],
  divine_rain: [
    { lvl: 2, name: '거대 망치', mod: { radius: 1.25 } },
    { lvl: 3, name: '심판의 충격', mod: { proc: { chance: 0.7 } } },
    { lvl: 4, name: '연속 강림', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '망치 폭우', mod: { projectiles: '+2' } }
  ],
  ember_ring: [
    { lvl: 2, name: '광역 잉걸', mod: { radius: 1.3 } },
    { lvl: 3, name: '폭염 잉걸', mod: { proc: { fx: 'status_burn', chance: 1 } } },
    { lvl: 4, name: '회전 가속', mod: { orbitSpeed: 1.5 } },
    { lvl: 5, name: '잉걸 군세', mod: { projectiles: '+2' } }
  ],
  whirlwind_blade: [
    { lvl: 2, name: '폭발적 회전', mod: { orbitSpeed: 1.4 } },
    { lvl: 3, name: '깊은 출혈', mod: { proc: { chance: 0.55 } } },
    { lvl: 4, name: '광역 칼날', mod: { radius: 1.25 } },
    { lvl: 5, name: '칼날 군세', mod: { projectiles: '+2' } }
  ],

  // ── Knight (7) — stun/holy 강화 ────────────────────────────────────────
  crusader_lance: [
    { lvl: 2, name: '강철 창대', mod: { speed: 1.15, life: 1.2 } },
    { lvl: 3, name: '심판의 둔화', mod: { proc: { chance: 0.5 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+999' } },
    { lvl: 5, name: '쌍창', mod: { projectiles: '+1' } }
  ],
  solar_flare: [
    { lvl: 2, name: '거대 태양', mod: { radius: 1.25 } },
    { lvl: 3, name: '강화 화염', mod: { proc: { chance: 0.85 } } },
    { lvl: 4, name: '연속 폭발', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '쌍태양', mod: { projectiles: '+1', projGrowth: true } }
  ],
  guardian_orbit: [
    { lvl: 2, name: '큰 수호 고리', mod: { orbitRadius: 1.25 } },
    { lvl: 3, name: '강화 보호막', mod: { proc: { chance: 0.6 } } },
    { lvl: 4, name: '회전 가속', mod: { orbitSpeed: 1.3 } },
    { lvl: 5, name: '수호 군세', mod: { projectiles: '+2' } }
  ],
  judgement_beam: [
    { lvl: 2, name: '강화 광선', mod: { radius: 1.2, life: 1.2 } },
    { lvl: 3, name: '심판의 화염', mod: { proc: { chance: 0.7 } } },
    { lvl: 4, name: '신속 시전', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '쌍광선', mod: { projectiles: '+1' } }
  ],
  consecrate: [
    { lvl: 2, name: '광역 성지', mod: { radius: 1.3 } },
    { lvl: 3, name: '강화 둔화', mod: { proc: { chance: 0.8 } } },
    { lvl: 4, name: '지속 시간', mod: { life: 1.5 } },
    { lvl: 5, name: '신속 의식', mod: { cooldown: 0.8 } }
  ],
  aegis_throw: [
    { lvl: 2, name: '거대 방패', mod: { radius: 1.25 } },
    { lvl: 3, name: '강화 충격', mod: { proc: { chance: 0.6 } } },
    { lvl: 4, name: '회수 가속', mod: { speed: 1.2 } },
    { lvl: 5, name: '쌍방패', mod: { projectiles: '+1' } }
  ],
  dawnbreaker: [
    { lvl: 2, name: '연쇄 강화', mod: { bouncesGrowth: true } },
    { lvl: 3, name: '강화 감전', mod: { proc: { chance: 0.8 } } },
    { lvl: 4, name: '신속 시전', mod: { cooldown: 0.85, speed: 1.15 } },
    { lvl: 5, name: '연쇄 폭주', mod: { bounces: '+3' } }
  ],

  // ── Warrior (8) — bleed/knockback 강화 ─────────────────────────────────
  berserker_axe: [
    { lvl: 2, name: '광역 회전', mod: { reach: 1.15, radius: 1.2 } },
    { lvl: 3, name: '깊은 출혈', mod: { proc: { chance: 0.7 } } },
    { lvl: 4, name: '광폭화', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '쌍도끼', mod: { knockback: '+10' } }
  ],
  gladius_throw: [
    { lvl: 2, name: '연마된 날', mod: { speed: 1.2 } },
    { lvl: 3, name: '강화 출혈', mod: { proc: { chance: 0.55 } } },
    { lvl: 4, name: '광역 회수', mod: { radius: 1.2 } },
    { lvl: 5, name: '검비', mod: { projectiles: '+2' } }
  ],
  anvil_drop: [
    { lvl: 2, name: '거대 망치', mod: { radius: 1.25 } },
    { lvl: 3, name: '강화 충격', mod: { proc: { chance: 0.8 } } },
    { lvl: 4, name: '연속 강림', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '망치비', mod: { projectiles: '+2' } }
  ],
  spike_burst: [
    { lvl: 2, name: '광역 가시', mod: { radius: 1.25, speed: 1.15 } },
    { lvl: 3, name: '강화 출혈', mod: { proc: { chance: 0.5 } } },
    { lvl: 4, name: '관통 가시', mod: { pierce: '+2' } },
    { lvl: 5, name: '폭발 가시', mod: { projectiles: '+4' } }
  ],
  titans_grip: [
    { lvl: 2, name: '거인의 사거리', mod: { reach: 1.2, radius: 1.2 } },
    { lvl: 3, name: '강화 기절', mod: { proc: { chance: 0.7 } } },
    { lvl: 4, name: '신속 강타', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '거인의 분노', mod: { knockback: '+12' } }
  ],
  meat_cleaver: [
    { lvl: 2, name: '확장 사거리', mod: { reach: 1.2 } },
    { lvl: 3, name: '핏빛 강화', mod: { proc: { chance: 0.9 } } },
    { lvl: 4, name: '광역 학살', mod: { radius: 1.25 } },
    { lvl: 5, name: '연속 학살', mod: { cooldown: 0.8 } }
  ],
  warcry_pulse: [
    { lvl: 2, name: '광역 함성', mod: { radius: 1.25 } },
    { lvl: 3, name: '강화 기절', mod: { proc: { chance: 0.85 } } },
    { lvl: 4, name: '지속 함성', mod: { life: 1.5 } },
    { lvl: 5, name: '연속 함성', mod: { cooldown: 0.8, knockback: '+12' } }
  ],

  // ── Huntress (9) — pierce/speed/crit 강화 ──────────────────────────────
  piercing_arrow: [
    { lvl: 2, name: '연마된 촉', mod: { speed: 1.2 } },
    { lvl: 3, name: '강화 출혈', mod: { proc: { chance: 0.55 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+999' } },
    { lvl: 5, name: '연사', mod: { projectiles: '+1', cooldown: 0.85 } }
  ],
  barbed_net: [
    { lvl: 2, name: '광역 그물', mod: { radius: 1.3 } },
    { lvl: 3, name: '강화 둔화', mod: { proc: { chance: 1 } } },
    { lvl: 4, name: '지속 그물', mod: { life: 1.3 } },
    { lvl: 5, name: '그물 군세', mod: { projectiles: '+1' } }
  ],
  hawk_swarm: [
    { lvl: 2, name: '큰 매', mod: { radius: 1.2, orbitRadius: 1.15 } },
    { lvl: 3, name: '강화 출혈', mod: { proc: { chance: 0.7 } } },
    { lvl: 4, name: '회전 가속', mod: { orbitSpeed: 1.3 } },
    { lvl: 5, name: '매 무리', mod: { projectiles: '+2' } }
  ],
  bear_trap: [
    { lvl: 2, name: '거대 덫', mod: { radius: 1.3 } },
    { lvl: 3, name: '강화 기절', mod: { proc: { chance: 1 } } },
    { lvl: 4, name: '지속 덫', mod: { life: 1.4 } },
    { lvl: 5, name: '신속 설치', mod: { cooldown: 0.8 } }
  ],
  marksman_shot: [
    { lvl: 2, name: '연마된 시야', mod: { speed: 1.2 } },
    { lvl: 3, name: '강화 출혈', mod: { proc: { chance: 0.6 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+3' } },
    { lvl: 5, name: '치명타 일격', mod: { damage: 1.4 } }
  ],
  silencer_dart: [
    { lvl: 2, name: '신속 다트', mod: { speed: 1.3 } },
    { lvl: 3, name: '강화 둔화', mod: { proc: { chance: 1 } } },
    { lvl: 4, name: '연사', mod: { cooldown: 0.8 } },
    { lvl: 5, name: '다트 폭주', mod: { projectiles: '+2' } }
  ],
  phantom_arrow: [
    { lvl: 2, name: '유령 추적', mod: { speed: 1.2 } },
    { lvl: 3, name: '강화 독', mod: { proc: { chance: 0.6 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+3' } },
    { lvl: 5, name: '유령 군세', mod: { projectiles: '+1' } }
  ],
  salvo_shot: [
    { lvl: 2, name: '연마된 활', mod: { speed: 1.15, life: 1.2 } },
    { lvl: 3, name: '강화 출혈', mod: { proc: { chance: 0.4 } } },
    { lvl: 4, name: '확장 사거리', mod: { pierce: '+2' } },
    { lvl: 5, name: '대규모 일제', mod: { projectiles: '+2' } }
  ],
  hunters_blade: [
    { lvl: 2, name: '신속 투척', mod: { speed: 1.3, life: 1.3 } },
    { lvl: 3, name: '강화 출혈', mod: { proc: { chance: 0.7 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+2' } },
    { lvl: 5, name: '연속 투척', mod: { projectiles: '+1' } }
  ],

  // ── Mage (11) — element proc / cooldown 강화 ──────────────────────────
  meteor: [
    { lvl: 2, name: '거대 운석', mod: { radius: 1.25 } },
    { lvl: 3, name: '강화 화염', mod: { proc: { chance: 1 } } },
    { lvl: 4, name: '연속 운석', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '운석우', mod: { projectiles: '+2' } }
  ],
  ice_spear: [
    { lvl: 2, name: '연마된 빙창', mod: { speed: 1.2 } },
    { lvl: 3, name: '강화 결빙', mod: { proc: { chance: 0.8 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+999' } },
    { lvl: 5, name: '쌍빙창', mod: { projectiles: '+1' } }
  ],
  chain_void: [
    { lvl: 2, name: '연쇄 강화', mod: { bounces: '+2' } },
    { lvl: 3, name: '강화 독성', mod: { proc: { chance: 0.8 } } },
    { lvl: 4, name: '신속 시전', mod: { cooldown: 0.85, speed: 1.15 } },
    { lvl: 5, name: '공허 폭주', mod: { bounces: '+3' } }
  ],
  arcane_orb: [
    { lvl: 2, name: '광역 오브', mod: { radius: 1.3 } },
    { lvl: 3, name: '강화 결빙', mod: { proc: { chance: 0.7 } } },
    { lvl: 4, name: '지속 오브', mod: { life: 1.4 } },
    { lvl: 5, name: '신속 시전', mod: { cooldown: 0.8 } }
  ],
  elemental_burst: [
    { lvl: 2, name: '광역 원소', mod: { radius: 1.2, speed: 1.1 } },
    { lvl: 3, name: '강화 화상', mod: { proc: { chance: 0.8 } } },
    { lvl: 4, name: '신속 폭발', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '원소 폭주', mod: { projectiles: '+4' } }
  ],
  inferno_bolt: [
    { lvl: 2, name: '연쇄 강화', mod: { bouncesGrowth: true } },
    { lvl: 3, name: '강화 화염', mod: { proc: { chance: 1 } } },
    { lvl: 4, name: '신속 시전', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '지옥불 폭주', mod: { bounces: '+3' } }
  ],
  frost_nova: [
    { lvl: 2, name: '광역 노바', mod: { radius: 1.25 } },
    { lvl: 3, name: '강화 결빙', mod: { proc: { chance: 0.85 } } },
    { lvl: 4, name: '신속 시전', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '쌍둥이 노바', mod: { projectiles: '+4' } }
  ],
  voltaic_ring: [
    { lvl: 2, name: '광역 전압', mod: { orbitRadius: 1.25 } },
    { lvl: 3, name: '강화 감전', mod: { proc: { chance: 0.75 } } },
    { lvl: 4, name: '회전 가속', mod: { orbitSpeed: 1.3 } },
    { lvl: 5, name: '전압 군세', mod: { projectiles: '+2' } }
  ],
  plasma_orb: [
    { lvl: 2, name: '거대 플라즈마', mod: { radius: 1.2, orbitRadius: 1.15 } },
    { lvl: 3, name: '강화 감전', mod: { proc: { chance: 0.8 } } },
    { lvl: 4, name: '지속 오브', mod: { life: 1.4 } },
    { lvl: 5, name: '플라즈마 군세', mod: { projectiles: '+2' } }
  ],
  magma_burst: [
    { lvl: 2, name: '광역 용암', mod: { radius: 1.3 } },
    { lvl: 3, name: '강화 화상', mod: { proc: { chance: 1 } } },
    { lvl: 4, name: '지속 용암', mod: { life: 1.4 } },
    { lvl: 5, name: '신속 분출', mod: { cooldown: 0.8 } }
  ],
  glacial_lance: [
    { lvl: 2, name: '연마된 빙창', mod: { speed: 1.15, life: 1.2 } },
    { lvl: 3, name: '강화 결빙', mod: { proc: { chance: 0.85 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+999' } },
    { lvl: 5, name: '쌍빙창', mod: { projectiles: '+1' } }
  ],

  // ── Classic — Mage element pool ────────────────────────────────────────
  prism: [
    { lvl: 2, name: '확장 프리즘', mod: { speed: 1.15, radius: 1.15 } },
    { lvl: 3, name: '강화 결빙', mod: { proc: { chance: 0.5 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+2' } },
    { lvl: 5, name: '쌍둥이 프리즘', mod: { projectiles: '+2' } }
  ],
  lightning: [
    // bouncesGrowth on the def already adds +1 hop per 2 levels (capped at
    // +2 at lv5). Skill tree leans into speed/proc/damage so the two
    // scaling axes don't double-stack into runaway bounce counts.
    { lvl: 2, name: '신속 낙뢰', mod: { speed: 1.2 } },
    { lvl: 3, name: '강화 감전', mod: { proc: { chance: 0.85 } } },
    { lvl: 4, name: '신속 시전', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '폭주 낙뢰', mod: { damage: 1.3 } }
  ],
  firewall: [
    { lvl: 2, name: '광역 화벽', mod: { radius: 1.25 } },
    { lvl: 3, name: '강화 화상', mod: { proc: { chance: 1 } } },
    { lvl: 4, name: '지속 화벽', mod: { life: 1.3 } },
    { lvl: 5, name: '신속 시전', mod: { cooldown: 0.8 } }
  ],
  frost_bolt: [
    { lvl: 2, name: '연마된 결빙', mod: { speed: 1.2 } },
    { lvl: 3, name: '강화 결빙', mod: { proc: { chance: 0.7 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+2' } },
    { lvl: 5, name: '쌍둥이 결빙', mod: { projectiles: '+1' } }
  ],
  arcane_missile: [
    { lvl: 2, name: '연마된 미사일', mod: { speed: 1.2, life: 1.15 } },
    { lvl: 3, name: '강화 폭발', mod: { proc: { chance: 0.4 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+2' } },
    { lvl: 5, name: '미사일 군세', mod: { projectiles: '+2' } }
  ],
  void_sphere: [
    { lvl: 2, name: '확장 공허', mod: { radius: 1.25 } },
    { lvl: 3, name: '강화 둔화', mod: { proc: { chance: 1 } } },
    { lvl: 4, name: '지속 공허', mod: { life: 1.4 } },
    { lvl: 5, name: '신속 시전', mod: { cooldown: 0.8 } }
  ],

  // ── Classic — Warrior melee/physical pool ──────────────────────────────
  spear: [
    { lvl: 2, name: '연마된 창', mod: { speed: 1.15, life: 1.15 } },
    { lvl: 3, name: '강화 출혈', mod: { proc: { chance: 0.4 } } },
    { lvl: 4, name: '광역 사거리', mod: { radius: 1.2 } },
    { lvl: 5, name: '쌍창', mod: { projectiles: '+1' } }
  ],
  mace: [
    { lvl: 2, name: '큰 철퇴 궤도', mod: { orbitRadius: 1.2 } },
    { lvl: 3, name: '강화 기절', mod: { proc: { chance: 0.5 } } },
    { lvl: 4, name: '회전 가속', mod: { orbitSpeed: 1.3 } },
    { lvl: 5, name: '쌍철퇴', mod: { projectiles: '+1' } }
  ],
  scythe: [
    { lvl: 2, name: '확장 사거리', mod: { reach: 1.2, radius: 1.15 } },
    { lvl: 3, name: '깊은 출혈', mod: { proc: { chance: 0.55 } } },
    { lvl: 4, name: '신속 회수', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '광역 학살', mod: { radius: 1.3 } }
  ],
  bone: [
    { lvl: 2, name: '연마된 뼈', mod: { speed: 1.2 } },
    { lvl: 3, name: '강화 충격', mod: { proc: { chance: 0.4 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+2' } },
    { lvl: 5, name: '뼈 폭우', mod: { projectiles: '+2' } }
  ],
  sword: [
    { lvl: 2, name: '확장 사거리', mod: { reach: 1.2 } },
    { lvl: 3, name: '깊은 출혈', mod: { proc: { fx: 'status_bleed', chance: 0.45 } } },
    { lvl: 4, name: '광역 일격', mod: { radius: 1.25 } },
    { lvl: 5, name: '신속 회수', mod: { cooldown: 0.8 } }
  ],
  cleaver: [
    { lvl: 2, name: '확장 사거리', mod: { reach: 1.2 } },
    { lvl: 3, name: '광폭화 출혈', mod: { proc: { chance: 0.8 } } },
    { lvl: 4, name: '광역 학살', mod: { radius: 1.25 } },
    { lvl: 5, name: '신속 학살', mod: { cooldown: 0.8 } }
  ],
  throw_axes: [
    { lvl: 2, name: '연마된 도끼', mod: { speed: 1.2 } },
    { lvl: 3, name: '깊은 출혈', mod: { proc: { chance: 0.55 } } },
    { lvl: 4, name: '광역 사거리', mod: { radius: 1.2 } },
    { lvl: 5, name: '쌍투척', mod: { projectiles: '+2' } }
  ],
  shield_throw: [
    { lvl: 2, name: '광역 방패', mod: { radius: 1.25 } },
    { lvl: 3, name: '강화 보호막', mod: { proc: { chance: 0.4 } } },
    { lvl: 4, name: '신속 회수', mod: { speed: 1.2 } },
    { lvl: 5, name: '쌍방패', mod: { projectiles: '+1' } }
  ],
  whip: [
    { lvl: 2, name: '확장 사거리', mod: { reach: 1.25, radius: 1.15 } },
    { lvl: 3, name: '강화 충격', mod: { proc: { fx: 'status_bleed', chance: 0.4 } } },
    { lvl: 4, name: '신속 회수', mod: { cooldown: 0.8 } },
    { lvl: 5, name: '쌍채찍', mod: { knockback: '+8' } }
  ],

  // ── Classic — Huntress ranged pool ─────────────────────────────────────
  knives: [
    { lvl: 2, name: '연마된 단검', mod: { speed: 1.3, life: 1.3 } },
    { lvl: 3, name: '강화 출혈', mod: { proc: { chance: 0.45 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+2' } },
    { lvl: 5, name: '단검 폭우', mod: { projectiles: '+2' } }
  ],
  crossbow_bolt: [
    { lvl: 2, name: '연마된 볼트', mod: { speed: 1.15, life: 1.2 } },
    { lvl: 3, name: '강화 출혈', mod: { proc: { chance: 0.6 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+3' } },
    { lvl: 5, name: '쌍석궁', mod: { projectiles: '+1' } }
  ],
  bible: [
    { lvl: 2, name: '두꺼운 책', mod: { radius: 1.25 } },
    { lvl: 3, name: '신성한 충격', mod: { proc: { fx: 'status_slow', chance: 0.4 } } },
    { lvl: 4, name: '먼 궤도', mod: { orbitRadius: 1.4 } },
    { lvl: 5, name: '빠른 회전', mod: { orbitSpeed: 1.3 } }
  ],

  // ── Classic — Knight/holy pool (from cleric fold) ──────────────────────
  holywater: [
    { lvl: 2, name: '광역 성수', mod: { radius: 1.3 } },
    { lvl: 3, name: '강화 정화', mod: { proc: { chance: 0.7 } } },
    { lvl: 4, name: '지속 성수', mod: { life: 1.4 } },
    { lvl: 5, name: '쌍병', mod: { projectiles: '+1' } }
  ],
  holy_lance: [
    { lvl: 2, name: '연마된 신성창', mod: { speed: 1.15, life: 1.15 } },
    { lvl: 3, name: '강화 화염', mod: { proc: { chance: 0.5 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+999' } },
    { lvl: 5, name: '쌍신성창', mod: { projectiles: '+1' } }
  ],
  heal_beam: [
    { lvl: 2, name: '확장 광선', mod: { radius: 1.2, life: 1.3 } },
    { lvl: 3, name: '강화 화염', mod: { proc: { chance: 0.7 } } },
    { lvl: 4, name: '신속 시전', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '쌍광선', mod: { projectiles: '+1' } }
  ],
  smite: [
    { lvl: 2, name: '거대 천벌', mod: { radius: 1.25 } },
    { lvl: 3, name: '강화 기절', mod: { proc: { chance: 0.8 } } },
    { lvl: 4, name: '신속 강림', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '천벌 폭우', mod: { projectiles: '+2' } }
  ],
  sanctuary: [
    { lvl: 2, name: '광역 성역', mod: { radius: 1.3 } },
    { lvl: 3, name: '강화 보호막', mod: { proc: { chance: 0.6 } } },
    { lvl: 4, name: '지속 성역', mod: { life: 1.5 } },
    { lvl: 5, name: '신속 의식', mod: { cooldown: 0.8 } }
  ],
  holy_censer: [
    { lvl: 2, name: '큰 향로', mod: { orbitRadius: 1.2 } },
    { lvl: 3, name: '강화 보호막', mod: { proc: { chance: 0.5 } } },
    { lvl: 4, name: '회전 가속', mod: { orbitSpeed: 1.3 } },
    { lvl: 5, name: '쌍향로', mod: { projectiles: '+1' } }
  ],

  // ── Classic — extension weapons ────────────────────────────────────────
  void_orb: [
    { lvl: 2, name: '큰 부유 성구', mod: { orbitRadius: 1.2, radius: 1.15 } },
    { lvl: 3, name: '강화 독성', mod: { proc: { chance: 0.6 } } },
    { lvl: 4, name: '회전 가속', mod: { orbitSpeed: 1.3 } },
    { lvl: 5, name: '쌍성구', mod: { projectiles: '+1' } }
  ],
  soul_arrow: [
    { lvl: 2, name: '신속 영혼', mod: { speed: 1.2, life: 1.15 } },
    { lvl: 3, name: '강화 독성', mod: { proc: { chance: 0.6 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+2' } },
    { lvl: 5, name: '쌍영혼', mod: { projectiles: '+1' } }
  ],
  time_stop: [
    { lvl: 2, name: '광역 정지', mod: { radius: 1.25 } },
    { lvl: 3, name: '연장 정지', mod: { life: 1.5 } },
    { lvl: 4, name: '신속 시전', mod: { cooldown: 0.85 } },
    { lvl: 5, name: '강화 결빙', mod: { proc: { chance: 1 } } }
  ],

  // ── Exclusive (4) ──────────────────────────────────────────────────────
  vanguard_sword: [
    { lvl: 2, name: '확장 사거리', mod: { reach: 1.2, radius: 1.15 } },
    { lvl: 3, name: '강화 보호막', mod: { proc: { chance: 0.5 } } },
    { lvl: 4, name: '광역 일격', mod: { radius: 1.25 } },
    { lvl: 5, name: '신속 회수', mod: { cooldown: 0.8 } }
  ],
  warhammer: [
    { lvl: 2, name: '거대 망치', mod: { radius: 1.25 } },
    { lvl: 3, name: '강화 기절', mod: { proc: { chance: 0.65 } } },
    { lvl: 4, name: '지속 진동', mod: { life: 1.3 } },
    { lvl: 5, name: '신속 강타', mod: { cooldown: 0.85, knockback: '+12' } }
  ],
  astral_staff: [
    { lvl: 2, name: '연마된 지팡이', mod: { speed: 1.2, life: 1.15 } },
    { lvl: 3, name: '강화 폭발', mod: { proc: { chance: 0.55 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+2' } },
    { lvl: 5, name: '미사일 군세', mod: { projectiles: '+2' } }
  ],
  hunters_bow: [
    { lvl: 2, name: '연마된 활', mod: { speed: 1.15, life: 1.15 } },
    { lvl: 3, name: '강화 출혈', mod: { proc: { chance: 0.55 } } },
    { lvl: 4, name: '관통 강화', mod: { pierce: '+3' } },
    { lvl: 5, name: '연발', mod: { projectiles: '+2' } }
  ],
  black_pigeon: [
    // baseProj ramp: Lv1=10 → Lv5=10+(5*4)=30; with +5 and +10 perks below
    // the final count is ~45 beams (still within projCap=50, ~VS spec).
    { lvl: 2, name: '추가 사출', mod: { baseProj: '+5' } },
    { lvl: 3, name: '빠른 비행', mod: { cooldown: 0.85, speed: 1.15 } },
    { lvl: 4, name: '꿰뚫는 빔', mod: { pierce: '+2' } },
    { lvl: 5, name: '비둘기 군세', mod: { baseProj: '+10' } }
  ],
  falling_axe: [
    // standard projectile ramp via the uniform projAtLevel curve, plus
    // a final cooldown trim. launchSpeed/gravity stay at the def values
    // — tuning the arc shape per level would feel chaotic.
    { lvl: 2, name: '날렵한 회수', mod: { cooldown: 0.92 } },
    { lvl: 3, name: '강화 출혈', mod: { proc: { chance: 0.5 } } },
    { lvl: 4, name: '강타', mod: { knockback: '+6' } },
    { lvl: 5, name: '연속 투척', mod: { cooldown: 0.85 } }
  ],
  holy_hammer_toss: [
    // Heavier sibling of falling_axe — same shape (cooldown trims + proc
    // bump + knockback), tuned higher per perk because the cooldown floor
    // and stun chance are both already higher.
    { lvl: 2, name: '단단한 손잡이', mod: { cooldown: 0.92 } },
    { lvl: 3, name: '강한 충격', mod: { proc: { chance: 0.75 } } },
    { lvl: 4, name: '진동파', mod: { knockback: '+8', radius: 1.15 } },
    { lvl: 5, name: '연속 망치질', mod: { cooldown: 0.85 } }
  ],
  leg_world_hammer: [
    // Legendary maxLevel=3 — only 2 perks. Lv2 trims cooldown, Lv3 widens
    // the impact radius so the late perk reads as "the hammer hits harder
    // visually, not just on the damage roll".
    { lvl: 2, name: '연쇄 강타', mod: { cooldown: 0.88 } },
    { lvl: 3, name: '대지 분쇄', mod: { radius: 1.25, knockback: '+10' } }
  ],
};

// Inject default skill trees onto weapons that don't already define one.
// Weapons with explicit `skills:` in their def (the 4 pilot starters + cross)
// override this. Idempotent on module re-import.
for (const id of Object.keys(SKILL_TREES)) {
  if (WEAPONS[id] && !WEAPONS[id].skills) {
    WEAPONS[id].skills = SKILL_TREES[id];
  }
}
