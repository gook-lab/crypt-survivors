// Permanent (meta-progression) upgrades — DATA. Vampire Survivors PowerUps
// model: GLOBAL (apply to every hero, no per-character upgrade), bought with
// gold, persisted across runs, applied at run start.
//
// Schema:
//   id, tab, name, icon, blurb
//   max          number of levels
//   cost         array — cost[L] is the price to buy level L+1 (from L)
//   meta         per-level contribution folded into loadout.meta (optional)
//   token        run-economy token granted per level (reroll/skip)
//
// Reference: https://vampire.survivors.wiki/w/PowerUps
// Values are VS-inspired but kept within this game's tuned plumbing
// (armor/maxHp/magnet stay in their existing additive/percent semantics).
// `Speed` (projSpeed) and `Curse` (curse) are new keys wired in loadout.js /
// weaponFire.js (speed) and main.js / spawn.js (curse).

export const SHOP_TABS = [
  { id: 'attack', name: '⚔️ 공격', icon: 'icon_might' },
  { id: 'defense', name: '🛡️ 방어', icon: 'status_shield' },
  { id: 'growth', name: '💰 성장', icon: 'pickup_gold' },
  { id: 'convenience', name: '🎲 편의', icon: 'pickup_scroll' },
];

export const META_UPGRADES = [
  // ── ⚔️ 공격 및 무기 ─────────────────────────────────────
  { id: 'might', tab: 'attack', name: 'Might · 힘', icon: 'icon_might',
    blurb: '주는 피해량 +5% / 랭크 (최대 +25%)', max: 5,
    cost: [60, 110, 190, 300, 460],
    meta: { damage: 0.05 } },
  { id: 'amount', tab: 'attack', name: 'Amount · 발사체', icon: 'icon_aura',
    blurb: '모든 무기 투사체 발사 수 +1 (최대 +1)', max: 1,
    cost: [1200],
    meta: { projectiles: 1 } },
  { id: 'cooldown', tab: 'attack', name: 'Cooldown · 쿨타임', icon: 'icon_haste',
    blurb: '무기 공격 주기 -2.5% / 랭크 (최대 -5%)', max: 2,
    cost: [220, 420],
    meta: { cooldown: 0.025 } },
  { id: 'area', tab: 'attack', name: 'Area · 범위', icon: 'icon_aura',
    blurb: '무기 공격 범위 +5% / 랭크 (최대 +10%)', max: 2,
    cost: [200, 380],
    meta: { projSize: 0.05 } },
  { id: 'speed', tab: 'attack', name: 'Speed · 투사체 속도', icon: 'icon_swift',
    blurb: '투사체 이동 속도 +10% / 랭크 (최대 +20%)', max: 2,
    cost: [160, 300],
    meta: { projSpeed: 0.10 } },
  { id: 'duration', tab: 'attack', name: 'Duration · 지속', icon: 'icon_endure',
    blurb: '무기 효과 지속 시간 +15% / 랭크 (최대 +30%)', max: 2,
    cost: [180, 340],
    meta: { projLife: 0.15 } },
  // game extras (no VS equivalent — kept because the run economy already
  // leans on crit/pierce builds)
  { id: 'crit', tab: 'attack', name: '치명타', icon: 'fx_levelup',
    blurb: '크리 확률 +2% · 크리 피해 +4% / 랭크 (최대 +12% / +24%)', max: 6,
    cost: [140, 230, 360, 540, 800, 1150],
    meta: { critChance: 0.02, critMult: 0.04 } },
  { id: 'pierce', tab: 'attack', name: '관통', icon: 'fx_impact_pierce',
    blurb: '모든 투사체 관통 +1 / 랭크 (최대 +3)', max: 3,
    cost: [260, 560, 1100],
    meta: { pierce: 1 } },

  // ── 🛡️ 방어 및 생존 ────────────────────────────────────
  { id: 'maxhealth', tab: 'defense', name: 'Max Health · 최대 체력', icon: 'icon_vigor',
    blurb: '최대 체력 +10 / 랭크 (최대 +30)', max: 3,
    cost: [70, 140, 260],
    meta: { maxHp: 10 } },
  { id: 'armor', tab: 'defense', name: 'Armor · 방어력', icon: 'status_shield',
    blurb: '받는 피해 -2.5% / 랭크 (최대 -12.5%)', max: 5,
    cost: [120, 240, 480, 900, 1700],
    meta: { armor: 0.025 } },
  { id: 'recovery', tab: 'defense', name: 'Recovery · 회복력', icon: 'pickup_heart',
    blurb: '초당 체력 회복 +0.1 / 랭크 (최대 +0.5)', max: 5,
    cost: [150, 300, 600, 1100, 2000],
    meta: { regen: 0.1 } },
  { id: 'movespeed', tab: 'defense', name: 'Move Speed · 이동 속도', icon: 'icon_swift',
    blurb: '이동 속도 +5% / 랭크 (최대 +10%)', max: 2,
    cost: [140, 280],
    meta: { moveSpeed: 0.05 } },
  { id: 'revival', tab: 'defense', name: 'Revival · 부활', icon: 'icon_hero_cleric',
    blurb: '체력 50% 상태로 1회 부활 / 랭크 (최대 2회)', max: 2,
    cost: [900, 2600],
    meta: { revive: 1 } },

  // ── 💰 성장 및 파밍 ─────────────────────────────────────
  { id: 'growth', tab: 'growth', name: 'Growth · 성장', icon: 'pickup_rune',
    blurb: '획득 경험치 +3% / 랭크 (최대 +15%)', max: 5,
    cost: [150, 320, 640, 1200, 2400],
    meta: { xpGain: 0.03 } },
  { id: 'greed', tab: 'growth', name: 'Greed · 탐욕', icon: 'pickup_gold',
    blurb: '획득 골드 +10% / 랭크 (최대 +50%)', max: 5,
    cost: [200, 400, 800, 1600, 3200],
    meta: { goldGain: 0.10 } },
  { id: 'luck', tab: 'growth', name: 'Luck · 행운', icon: 'pickup_chest_gold',
    blurb: '아이템 드랍 확률 +3% / 랭크 (최대 +15%)', max: 5,
    cost: [180, 360, 720, 1400, 2800],
    meta: { luck: 0.03 } },
  { id: 'magnet', tab: 'growth', name: 'Magnet · 자석', icon: 'icon_lodestone',
    blurb: '아이템 획득 범위 +16 / 랭크 (최대 +48)', max: 3,
    cost: [80, 160, 320],
    meta: { magnet: 16 } },
  { id: 'curse', tab: 'growth', name: 'Curse · 저주', icon: 'status_burn',
    blurb: '적 체력·수 +8% / 랭크 (최대 +40%) — 더 많은 적 = 더 많은 골드·경험치', max: 5,
    cost: [120, 240, 480, 900, 1700],
    meta: { curse: 0.08 } },

  // ── 🎲 편의 (run tokens) ────────────────────────────────
  { id: 'reroll', tab: 'convenience', name: 'Reroll · 리롤', icon: 'pickup_scroll',
    blurb: '레벨업 카드 리롤 +1회 / 랭크 (런당)', max: 5,
    cost: [100, 250, 500, 1000, 2000],
    token: 'reroll' },
  { id: 'skip', tab: 'convenience', name: 'Skip · 스킵', icon: 'pickup_chicken',
    blurb: '레벨업 스킵 +1회 / 랭크 — 스킵 시 체력 회복', max: 5,
    cost: [80, 200, 400, 800, 1600],
    token: 'skip' },
];
