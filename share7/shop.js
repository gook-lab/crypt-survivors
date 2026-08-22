// Meta-progression shop — gold-cost upgrade tree that persists across runs.
//
// Each upgrade has 1..max levels. Total spent gold is tracked in a save.
// When a run starts, the engine applies every owned upgrade as a stat mod.

window.SHOP_UPGRADES = [
  // ── Combat ───────────────────────────────────────────────
  { id: 'might', tab: 'combat',
    name: '근력 강화', icon: 'icon_might',
    blurb: '모든 무기 피해 +5% / 레벨. 모든 빌드에 영향.',
    max: 10, cost: [50, 80, 130, 200, 300, 450, 650, 900, 1200, 1600],
    effect: '+5% damage / lvl' },
  { id: 'haste', tab: 'combat',
    name: '신속함', icon: 'icon_haste',
    blurb: '공격 속도 / 회복 시간 +4% / 레벨.',
    max: 10, cost: [60, 90, 140, 210, 320, 470, 680, 950, 1300, 1750],
    effect: '+4% atk speed / lvl' },
  { id: 'crit', tab: 'combat',
    name: '치명타', icon: 'fx_levelup',
    blurb: '크리티컬 확률 +3% / 레벨, 크리티컬 피해 +5% / 레벨.',
    max: 6, cost: [120, 200, 320, 500, 750, 1100],
    effect: '+3% CRIT / +5% CRIT dmg' },
  { id: 'pierce', tab: 'combat',
    name: '관통력', icon: 'fx_impact_pierce',
    blurb: '모든 투사체 관통 +1 / 레벨.',
    max: 3, cost: [200, 450, 900],
    effect: '+1 pierce' },

  // ── Survival ─────────────────────────────────────────────
  { id: 'vigor', tab: 'survival',
    name: '활력', icon: 'icon_vigor',
    blurb: '최대 HP +10 / 레벨. 시작 HP 그대로 적용.',
    max: 10, cost: [40, 70, 110, 170, 250, 360, 510, 720, 1000, 1400],
    effect: '+10 max HP / lvl' },
  { id: 'regen', tab: 'survival',
    name: '재생', icon: 'pickup_heart',
    blurb: '초당 +0.2 HP 자동 회복 / 레벨.',
    max: 5, cost: [150, 300, 600, 1100, 2000],
    effect: '+0.2 HP/s / lvl' },
  { id: 'revive', tab: 'survival',
    name: '부활', icon: 'icon_hero_cleric',
    blurb: '런당 자동 부활 횟수 +1.',
    max: 3, cost: [500, 1500, 4000],
    effect: '+1 revive / run' },
  { id: 'armor', tab: 'survival',
    name: '방어구', icon: 'status_shield',
    blurb: '받는 피해 -2 / 레벨 (최소 1).',
    max: 5, cost: [120, 240, 480, 900, 1700],
    effect: '−2 damage taken / lvl' },

  // ── Utility ──────────────────────────────────────────────
  { id: 'magnet', tab: 'utility',
    name: '자석', icon: 'icon_lodestone',
    blurb: '아이템 획득 범위 +20% / 레벨.',
    max: 5, cost: [80, 160, 320, 600, 1100],
    effect: '+20% pickup radius / lvl' },
  { id: 'swift', tab: 'utility',
    name: '발걸음', icon: 'icon_swift',
    blurb: '이동 속도 +5% / 레벨.',
    max: 5, cost: [100, 200, 400, 750, 1400],
    effect: '+5% move speed / lvl' },
  { id: 'greed', tab: 'utility',
    name: '탐욕', icon: 'pickup_gold',
    blurb: '적이 떨어뜨리는 골드 +10% / 레벨. 다음 상점에서 즉시 효과.',
    max: 5, cost: [200, 400, 800, 1600, 3200],
    effect: '+10% gold drop / lvl' },
  { id: 'luck', tab: 'utility',
    name: '운', icon: 'pickup_chest_gold',
    blurb: '상자 / 보스 드랍 확률 +5% / 레벨.',
    max: 5, cost: [180, 360, 720, 1400, 2800],
    effect: '+5% rare drop / lvl' },

  // ── Run economy ──────────────────────────────────────────
  { id: 'reroll', tab: 'economy',
    name: '리롤 토큰', icon: 'pickup_scroll',
    blurb: '레벨업 카드 리롤 횟수 +1 / 레벨 (런당).',
    max: 5, cost: [100, 250, 500, 1000, 2000],
    effect: '+1 reroll / run' },
  { id: 'skip', tab: 'economy',
    name: '스킵 토큰', icon: 'pickup_chicken',
    blurb: '레벨업 스킵으로 +2 HP 회복. 스킵 횟수 +1 / 레벨.',
    max: 5, cost: [80, 200, 400, 800, 1600],
    effect: '+1 skip / run' },
  { id: 'banish', tab: 'economy',
    name: '금지 토큰', icon: 'pickup_key',
    blurb: '특정 무기/패시브를 풀에서 영구 제외 (런당 N회).',
    max: 3, cost: [400, 1200, 3000],
    effect: '+1 banish / run' },
];

window.SHOP_TABS = [
  { id: 'combat',   name: '전투',   icon: 'icon_might' },
  { id: 'survival', name: '생존',   icon: 'pickup_heart' },
  { id: 'utility',  name: '유틸',   icon: 'icon_lodestone' },
  { id: 'economy',  name: '경제',   icon: 'pickup_gold' },
];

// Hero unlocks — gated by gold totals or stage clears
window.HERO_UNLOCKS = [
  { id: 'knight',   condition: '기본 해금',           cost: 0 },
  { id: 'warrior',  condition: '챕터 1 클리어',       cost: 800 },
  { id: 'mage',     condition: '챕터 2 클리어',       cost: 2000 },
  { id: 'huntress', condition: '챕터 3 클리어',       cost: 4000 },
  { id: 'cleric',   condition: '챕터 4 클리어 + 보스 처치', cost: 8000 },
];
