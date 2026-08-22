// Elemental spirits — DATA.
//
// A spirit is a companion that orbits the player and acts on its own
// cooldown. Spirits are picked / tiered up at level-up (like weapons and
// passives); a spirit's tier (1..maxTier) scales its effect and swaps its
// sprite. Roles:
//   'heal'   — restore HP                        (fairy)
//   'shield' — top up the player's damage shield (water)
//   'attack' — fire a projectile at the nearest enemy (earth / fire)

export const SPIRITS = {
  fairy: {
    id: 'fairy', name: '요정 정령', role: 'heal', maxTier: 3,
    sprites: ['spirit_fairy_1', 'spirit_fairy_2', 'spirit_fairy_3'],
    desc: '주기적으로 체력을 회복',
    cooldown: 4.5, heal: 9, // HP healed = heal * tier
  },
  water: {
    id: 'water', name: '물 정령', role: 'shield', maxTier: 3,
    sprites: ['spirit_water_1', 'spirit_water_2', 'spirit_water_3'],
    desc: '주기적으로 보호막을 생성',
    cooldown: 6.0, shield: 22, // shield added = shield * tier
  },
  earth: {
    id: 'earth', name: '대지 정령', role: 'attack', maxTier: 3,
    sprites: ['spirit_earth_1', 'spirit_earth_2', 'spirit_earth_3'],
    atkSprite: 'spirit_atk_earth', color: 0x9a6a3a,
    desc: '바위를 던져 적을 타격',
    cooldown: 2.2, damage: 16, speed: 230, radius: 8, life: 1.6,
    knockback: 14, pierce: 2, // damage dealt = damage * tier
  },
  fire: {
    id: 'fire', name: '불 정령', role: 'attack', maxTier: 3,
    sprites: ['spirit_fire_1', 'spirit_fire_2', 'spirit_fire_3'],
    atkSprite: 'spirit_atk_fire', color: 0xf08a2a,
    desc: '화염을 쏘아 적을 지짐',
    cooldown: 1.5, damage: 9, speed: 300, radius: 7, life: 1.2,
    knockback: 6, pierce: 1, // damage dealt = damage * tier
    proc: 'status_burn', impactFx: 'fx_impact_scorch',
  },
  // — extension spirits (BB): no new sprites, reuse existing atk clips with
  //   a new tint + proc so each adds a distinct combat flavour without art.
  shadow: {
    id: 'shadow', name: '그림자 정령', role: 'attack', maxTier: 3,
    sprites: ['spirit_fire_1', 'spirit_fire_2', 'spirit_fire_3'],
    atkSprite: 'spirit_atk_fire', color: 0x9a5acc,
    desc: '독을 묻혀 적을 서서히 녹임',
    cooldown: 1.8, damage: 7, speed: 260, radius: 7, life: 1.5,
    knockback: 4, pierce: 2,
    proc: 'status_poison', impactFx: 'fx_impact_smash',
  },
  lightning: {
    id: 'lightning', name: '번개 정령', role: 'attack', maxTier: 3,
    sprites: ['spirit_water_1', 'spirit_water_2', 'spirit_water_3'],
    atkSprite: 'spirit_atk_water', color: 0xfff066,
    desc: '전류로 적 사이를 튕긴다',
    cooldown: 2.4, damage: 13, speed: 420, radius: 6, life: 0.9,
    knockback: 4, pierce: 1, chain: 2,
    proc: 'status_shock', impactFx: 'fx_impact_smash',
  },
  // — fused spirits (BB extension) — sprites resolve to a runtime composite
  //   of the two parent spirits' tier art, so no new pixel art is required.
  //   See renderer.js for the composite render pipeline.
  steam: {
    id: 'steam', name: '증기 정령', role: 'attack', maxTier: 3,
    sprites: ['spirit_water_1', 'spirit_water_2', 'spirit_water_3'], // base layer
    accentSprites: ['spirit_fire_1', 'spirit_fire_2', 'spirit_fire_3'], // overlay layer
    atkSprite: 'spirit_atk_fire', color: 0xe0f7ff,
    desc: '물 + 불의 합일 — 뜨거운 수증기',
    cooldown: 1.6, damage: 14, speed: 320, radius: 8, life: 1.4,
    knockback: 8, pierce: 2,
    proc: 'status_burn', impactFx: 'fx_impact_scorch',
    fused: true,
  },
  oberon: {
    id: 'oberon', name: '오베론', role: 'heal', maxTier: 3,
    sprites: ['spirit_fairy_1', 'spirit_fairy_2', 'spirit_fairy_3'],
    accentSprites: ['spirit_earth_1', 'spirit_earth_2', 'spirit_earth_3'],
    desc: '요정 + 대지의 합일 — 회복과 보호',
    cooldown: 3.2, heal: 18, // bigger heal + a small shield bump
    bonusShield: 14, // applied each pulse in addition to the heal
    fused: true,
  },
  frostbolt: {
    id: 'frostbolt', name: '빙결 정령', role: 'attack', maxTier: 3,
    sprites: ['spirit_water_1', 'spirit_water_2', 'spirit_water_3'],
    accentSprites: ['spirit_fire_1', 'spirit_fire_2', 'spirit_fire_3'], // reusing tinted overlay for visual variety
    atkSprite: 'spirit_atk_water', color: 0x88cfff,
    desc: '물 + 번개의 합일 — 얼어붙는 번개',
    cooldown: 2.0, damage: 17, speed: 440, radius: 7, life: 1.0,
    knockback: 6, pierce: 1, chain: 3,
    proc: 'status_freeze', impactFx: 'fx_impact_smash',
    fused: true,
  },
  verdant: {
    id: 'verdant', name: '초록 정령', role: 'attack', maxTier: 3,
    sprites: ['spirit_earth_1', 'spirit_earth_2', 'spirit_earth_3'],
    accentSprites: ['spirit_fairy_1', 'spirit_fairy_2', 'spirit_fairy_3'],
    atkSprite: 'spirit_atk_earth', color: 0x9bd860,
    desc: '대지 + 요정의 합일 — 생명의 새싹',
    cooldown: 1.9, damage: 14, speed: 250, radius: 9, life: 1.8,
    knockback: 16, pierce: 3,
    proc: 'status_poison', impactFx: 'fx_impact_smash',
    fused: true,
  },
};

export const SPIRIT_IDS = ['fairy', 'water', 'earth', 'fire', 'shadow', 'lightning'];
export const SPIRIT_SLOTS = 2; // how many distinct base spirits a run may hold

// Spirit fusion recipes — owning both ingredients (any tier) auto-fuses to
// the result spirit. The two source slots are consumed in exchange for one
// fused slot (the result's tier = max of the ingredients). Recipes are
// declarative so the picker / choices system can preview them in the UI.
//
// Visual: result spirit reuses the source sprites as a layered composite
// (see renderer.js spiritSprite resolver) — no new pixel art needed.
export const SPIRIT_FUSIONS = [
  { id: 'steam', from: ['water', 'fire'] },
  { id: 'oberon', from: ['fairy', 'earth'] },
  { id: 'frostbolt', from: ['water', 'lightning'] },
  { id: 'verdant', from: ['earth', 'fairy'] },
];

// The sprite clip for a spirit at a given tier.
export function spiritSprite(id, tier) {
  const s = SPIRITS[id].sprites;
  return s[Math.min(Math.max(tier, 1), s.length) - 1];
}

// Check loadout.spirits for a satisfied fusion recipe — both ingredient
// spirits owned. Returns the recipe + the higher tier (used for the fused
// result), or null. Caller is responsible for replacing the ingredients
// with the fused id in loadout.spirits.
export function detectFusion(spiritsMap) {
  for (const r of SPIRIT_FUSIONS) {
    const [a, b] = r.from;
    if (spiritsMap[a] && spiritsMap[b] && !spiritsMap[r.id]) {
      return { recipe: r, tier: Math.max(spiritsMap[a], spiritsMap[b]) };
    }
  }
  return null;
}
