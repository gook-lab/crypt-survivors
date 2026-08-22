// Character signature actives — DATA ONLY.
//
// Each hero (by `char` id) can have ONE signature spell fired with the
// spacebar. The runtime (systems/active.js) reads this map, runs the
// telegraph window, picks targets, and applies AoE damage. The renderer
// reads the active state to draw the telegraph ring + falling meteors +
// impact bursts.
//
// One mechanic (auto-aim meteor cluster), N visual variants per hero.
// Phase 1 ships mage only. Phase 2 adds knight/warrior/huntress variants
// reusing the same engine — just different sprites and palette indices.

export const SIGNATURES = {
  meteor_storm: {
    id: 'meteor_storm',
    char: 'mage',
    name: '운석 폭풍',
    desc: '하늘에서 아케인 운석 5개가 적 무리에 떨어진다.',
    cooldown: 21, // seconds between casts (was 25, -15% for density-matched pacing)
    count: 5, // meteors per cast
    telegraphTime: 0.8, // seconds the target rings flash before falling
    radius: 125, // px AoE radius per meteor (80 → 104 → 125; "range too small" pass, + scaleSignature growth)
    damage: 60, // raw damage per meteor (folds through damage system crit roll)
    kind: 'meteor',
    // Telegraph stays arcane purple — mage identity at the ground level
    telegraphRing: 0x3a1a55, // outer ring p (arcane dark)
    telegraphFill: 0xb574d8, // inner disc M (arcane light)
    telegraphAsset: 'aoe_telegraph_circle',

    telegraphRune: 0xece2c8, // hex rune lines (parchment 7)
    // PixelLab PNG: rocky fireball with ember trail. renderer rotates it
    // to follow trajectory. 48x48 source — scaled up for visibility.
    meteorAsset: 'mage_meteor',
    meteorScale: 1.6,
    shadow: 0x07060c, // pitch shadow 0 (under-meteor ground shadow)
    // Impact: Graphics arcane ring (mage signature crater). The PixelLab
    // meteor PNG mid-flight already reads as fire — the ground impact is
    // pure magic. Splits the visual identity: fire object, magic crater.
    impactCore: 0xffffff,
    impactMid: 0xf08a2a,
    impactArcane: 0xb574d8,
  },

  // ---- Knight: holy_beam ------------------------------------------------
  // Same auto-aim + telegraph mechanism as meteor_storm, but the falling
  // body is invisible (vertical light pillar) and the IMPACT is a 9-frame
  // golden solar flare PNG. Telegraph rings are golden + cross-shaped
  // accents so the cast reads "holy" not "arcane".
  holy_beam: {
    id: 'holy_beam',
    char: 'knight',
    castSfx: 'knight_cast', dropSfx: 'knight_drop', impactSfx: 'knight_impact',
    name: '천상의 십자가',
    desc: '하늘에서 신성한 빛 기둥 3개가 강림한다.',
    cooldown: 19, // was 22, -15%
    count: 3,
    telegraphTime: 0.7,
    radius: 140, // 90 → 117 → 140 (range pass)
    damage: 95, // fewer beams than meteor, more damage each
    kind: 'beam',
    // Telegraph palette: gold rim, white inner, cross-rune
    telegraphRing: 0x8a5a18, // gold dark 8
    telegraphFill: 0xf0d27a, // gold bright Y
    telegraphAsset: 'aoe_telegraph_circle',

    telegraphRune: 0xffffff,
    // No falling body — the "meteor" phase is a vertical pillar of light,
    // drawn by the renderer with Graphics when beamPillar is true.
    beamPillar: true,
    pillarColor: 0xfac860, // flame highlight (warm gold)
    pillarHighlight: 0xffffff,
    shadow: 0x07060c,
    // Impact: PixelLab 9-frame solar flare burst
    impactAsset: 'knight_flare',
    impactScale: 2.2,
  },

  // ---- Warrior: earth_crack --------------------------------------------
  // Self-centered single big AoE. Telegraph = expanding ground crack around
  // the player. Impact = 9-frame magma burst PixelLab animation at player.
  earth_crack: {
    id: 'earth_crack',
    char: 'warrior',
    castSfx: 'warrior_cast', dropSfx: 'warrior_drop', impactSfx: 'warrior_impact',
    name: '대지 갈라짐',
    desc: '발 아래 대지를 가른다 — 자신을 중심으로 광역 충격파.',
    cooldown: 24, // was 28, -15%
    count: 1,
    telegraphTime: 0.6,
    radius: 225, // 160 → 208 → 225. Earth-shake; only +8% (already screen-clearing)
    damage: 180, // single bigger hit
    kind: 'self',
    centerOnPlayer: true, // active.js special-cases this — target = player.x/y
    // Telegraph palette: stone + ember crack lines
    telegraphRing: 0x3d3050, // stone shadow 3
    telegraphFill: 0xc64628, // ember dark d (glowing magma crack)
    telegraphAsset: 'aoe_telegraph_circle',

    telegraphRune: 0xfac860, // flame highlight (crack inner)
    shadow: 0x07060c,
    // Impact: PixelLab magma burst (9-frame lava animation)
    impactAsset: 'warrior_magma',
    impactScale: 4.0, // big eruption
  },


  // ---- Huntress: arrow_rain --------------------------------------------
  // Many small arrows fall from above on scattered targets. Reuses the
  // existing arrow projectile sprite (via codebase ASCII art) — falling
  // body is drawn as a small Graphics arrow tilted toward target. Impact
  // is tiny per-arrow (no big PNG burst needed — visual is the swarm).
  arrow_rain: {
    id: 'arrow_rain',
    char: 'huntress',
    castSfx: 'huntress_cast', dropSfx: 'huntress_drop', impactSfx: 'huntress_impact',
    name: '폭우 화살비',
    desc: '하늘에서 화살 12발이 쏟아진다.',
    cooldown: 15, // was 18, -15%
    count: 12,
    telegraphTime: 0.5,
    radius: 58, // 36 → 47 → 58 per-arrow AoE (smallest sigs get a bigger bump)
    damage: 28, // per arrow, but 12 of them = high total
    kind: 'arrows',
    // Telegraph palette: vile green + steel
    telegraphRing: 0x24502a, // vile dark g
    telegraphFill: 0x88b85a, // vile light h
    telegraphAsset: 'aoe_telegraph_circle',

    telegraphRune: 0xbfe6f0, // ice highlight W (steel arrow shimmer)
    // Arrow body — Graphics-drawn small arrow (Phase 2 can swap in PixelLab)
    arrowColor: 0xece2c8, // parchment 7 (arrow shaft)
    arrowTip: 0xbfe6f0, // ice highlight W (sharp tip glint)
    arrowFletch: 0x88b85a, // vile light h (green feather)
    shadow: 0x07060c,
    // Impact: PixelLab 6-frame dust burst (per-arrow) — supplements the
    // swarm-as-visual identity with a tactile per-hit punch. The Graphics
    // colours below stay as fallback while the PNG streams in.
    impactAsset: 'arrow_impact',
    impactScale: 1.6,
    impactCore: 0xffffff,
    impactMid: 0x88b85a,
    impactArcane: 0xbfe6f0,
  },

  // ---- Porta: tesla_field ----------------------------------------------
  // 5 electric pillars descend on scattered targets — reuses 'beam' kind
  // (knight visual) recolored to electric cyan. More pillars, smaller
  // radius, snappier cooldown to match Porta's chain-lightning identity.
  tesla_field: {
    id: 'tesla_field',
    char: 'porta',
    castSfx: 'porta_cast', dropSfx: 'porta_drop', impactSfx: 'porta_impact',
    name: '뇌격 폭풍',
    desc: '하늘에서 번개 기둥 5개가 적 무리에 떨어진다.',
    cooldown: 17, // was 20, -15%
    count: 5,
    telegraphTime: 0.6,
    radius: 118, // 75 → 98 → 118 (range pass)
    damage: 70,
    kind: 'beam',
    telegraphRing: 0x1a3a55, // deep electric blue
    telegraphFill: 0x9ad8ff, // bright cyan
    telegraphAsset: 'aoe_telegraph_circle',

    telegraphRune: 0xffffff,
    beamPillar: true,
    pillarColor: 0x9ad8ff,    // electric cyan
    pillarHighlight: 0xffffff,
    shadow: 0x07060c,
    // PixelLab 4-frame electric burst (sparkle → starburst → puff → arc legs).
    // Replaces the Graphics-only impact that was a recolored holy_beam fallback.
    impactAsset: 'tesla_burst',
    impactScale: 2.0,
    impactCore: 0xffffff,
    impactMid: 0xc8e8ff,
    impactArcane: 0x6e8aff,
  },

  // ---- Gennaro: blade_volley -------------------------------------------
  // Many small daggers rain down on scattered targets. Reuses huntress
  // 'arrows' kind — different palette (steel + crimson) to read like
  // thrown blades, not fletched arrows.
  blade_volley: {
    id: 'blade_volley',
    char: 'gennaro',
    castSfx: 'gennaro_cast', dropSfx: 'gennaro_drop', impactSfx: 'gennaro_impact',
    name: '단검 비',
    desc: '하늘에서 단검 16자루가 쏟아진다.',
    cooldown: 14, // was 17, -15%
    count: 16,
    telegraphTime: 0.45,
    radius: 52, // 32 → 42 → 52 (smallest sigs get a bigger bump)
    damage: 24,
    kind: 'arrows',
    telegraphRing: 0x4a3a18, // dark brass
    telegraphFill: 0xe6dba0, // bright blade
    telegraphAsset: 'aoe_telegraph_circle',

    telegraphRune: 0xc64628, // crimson edge
    arrowColor: 0xc8b88a,   // brass shaft
    arrowTip: 0xffffff,     // razor tip
    arrowFletch: 0xc64628,  // crimson ribbon
    shadow: 0x07060c,
    // Crimson blood splash impact — distinct from huntress' parchment+green
    // arrow_impact, even though both share kind:'arrows'. Read 무기고 카드
    // PixelLab label to verify the split.
    impactAsset: 'gennaro_blood_splash',
    impactScale: 1.5,
    impactCore: 0xffffff,
    impactMid: 0xe6dba0,
    impactArcane: 0xc64628,
  },

  // ---- Pasqualina: rune_barrage ----------------------------------------
  // Falling arcane runes that explode on impact — reuses 'meteor' kind
  // with violet+cyan palette, smaller per-rune radius but more of them
  // for the bouncing-rune identity.
  rune_barrage: {
    id: 'rune_barrage',
    char: 'pasqualina',
    castSfx: 'pasqualina_cast', dropSfx: 'pasqualina_drop', impactSfx: 'pasqualina_impact',
    name: '룬의 강림',
    desc: '하늘에서 거대한 룬 6개가 떨어져 폭발한다.',
    cooldown: 20, // was 24, -15%
    count: 6,
    telegraphTime: 0.7,
    radius: 110, // 70 → 91 → 110 (range pass)
    damage: 75,
    kind: 'meteor',
    telegraphRing: 0x3a1a55, // deep arcane
    telegraphFill: 0xb574d8, // arcane purple
    telegraphAsset: 'aoe_telegraph_circle',

    telegraphRune: 0x9ad8ff, // cyan rune glyph
    meteorScale: 1.4,
    shadow: 0x07060c,
    impactCore: 0xffffff,
    impactMid: 0x9ad8ff,
    impactArcane: 0xb574d8,
    // PixelLab 4-frame swirling cosmic galaxy nebula (violet+indigo, bright
    // stars). Distinct from mage_meteor's fire rock on shared kind:'meteor'.
    meteorAsset: 'rune_barrage',
    // Graphics fallback palette still used until PNG loads.
    meteorCore: 0xb574d8,
    meteorOuter: 0x6e3a8a,
    meteorHighlight: 0x9ad8ff,
    meteorTrail: 0x6e3a8a,
    meteorSpec: 0xffffff,
  },
};

// Resolve the signature for a hero id. Null if the hero has none (Phase 1
// only mage has one — knight/warrior/huntress unlock in Phase 2).
export function signatureFor(heroId) {
  if (!heroId) return null;
  for (const sigId in SIGNATURES) {
    if (SIGNATURES[sigId].char === heroId) return SIGNATURES[sigId];
  }
  return null;
}
