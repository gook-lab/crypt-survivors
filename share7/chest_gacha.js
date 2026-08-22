// Treasure chest gacha system — data + drop logic.
//
// When player picks up a treasure chest, a modal opens with a spinning
// gacha animation. After the reveal, 1-3 items appear. Jackpot (3 items)
// is rare. Each item has a tier (common/rare/epic) affecting roll weight.
//
// Chest types differ in:
//   1. base_loot_count   (1-2 baseline)
//   2. chance for +1 item
//   3. quality of items (tier weight)

window.LOOT_ITEMS = [
  // ── Currency (common, always weighted heavily) ──
  { id: 'gold_small',    name: '골드 50',       icon: 'pickup_gold',         tier: 'common', value: 50,  blurb: '소량의 골드.' },
  { id: 'gold_medium',   name: '골드 200',      icon: 'pickup_gold',         tier: 'common', value: 200, blurb: '적당한 골드.' },
  { id: 'gold_large',    name: '골드 500',      icon: 'pickup_chest_gold',   tier: 'rare',   value: 500, blurb: '큰 금액의 골드.' },

  // ── Healing (common) ──
  { id: 'heart_small',   name: '하트',          icon: 'pickup_heart',        tier: 'common', value: 20,  blurb: 'HP 20 즉시 회복.' },
  { id: 'chicken',       name: '치킨',          icon: 'pickup_chicken',      tier: 'common', value: 30,  blurb: 'HP 30% 회복.' },

  // ── Potions (rare) ──
  { id: 'potion_might',  name: '힘의 물약',     icon: 'pickup_potion_might', tier: 'rare',   value: 1,   blurb: '런 종료까지 피해 +15%.' },
  { id: 'potion_swift',  name: '신속의 물약',   icon: 'pickup_potion_swift', tier: 'rare',   value: 1,   blurb: '런 종료까지 이동 +20%.' },
  { id: 'potion_mana',   name: '마나 물약',     icon: 'pickup_potion_mana',  tier: 'rare',   value: 1,   blurb: '런 종료까지 회복 시간 -10%.' },
  { id: 'potion_arcane', name: '아케인 물약',   icon: 'pickup_potion_arcane',tier: 'rare',   value: 1,   blurb: '런 종료까지 원소 피해 +25%.' },

  // ── Utility (rare) ──
  { id: 'magnet',        name: '자석',          icon: 'pickup_magnet',       tier: 'rare',   value: 1,   blurb: '15초간 모든 아이템 자동 흡수.' },
  { id: 'bomb',          name: '폭탄',          icon: 'pickup_bomb',         tier: 'rare',   value: 200, blurb: '화면의 모든 적 200 피해.' },
  { id: 'scroll',        name: '리롤 두루마리', icon: 'pickup_scroll',       tier: 'rare',   value: 1,   blurb: '레벨업 리롤 토큰 +1.' },
  { id: 'key',           name: '열쇠',          icon: 'pickup_key',          tier: 'rare',   value: 1,   blurb: '잠긴 문/방을 열 수 있음.' },

  // ── Epic (rare drops, can trigger jackpot) ──
  { id: 'rune',          name: '룬스톤',        icon: 'pickup_rune',         tier: 'epic',   value: 1,   blurb: '랜덤 패시브 +1 레벨 (즉시).' },
  { id: 'weapon_roll',   name: '무기 카드',     icon: 'icon_leg_blade',      tier: 'epic',   value: 1,   blurb: '랜덤 무기를 즉시 획득 (만렙 시 진화 가능).' },
  { id: 'legendary_seed',name: '전설 씨앗',     icon: 'icon_leg_nova',       tier: 'epic',   value: 1,   blurb: '드랍 전용 전설 무기 1종 즉시 획득.' },
];

window.CHEST_TYPES = {
  wood: {
    name: '나무 상자', icon: 'pickup_chest',
    blurb: '평범한 나무 보물상자. 보통 1개 아이템, 가끔 2개.',
    base_count: 1,
    extra_chance_2: 0.30,
    extra_chance_3: 0.04,
    tier_weights: { common: 70, rare: 25, epic: 5 },
  },
  gold: {
    name: '황금 상자', icon: 'pickup_chest_gold',
    blurb: '귀한 황금 상자. 1-2개 아이템 보장, 가끔 잿팟 3개.',
    base_count: 2,
    extra_chance_2: 0,
    extra_chance_3: 0.15,
    tier_weights: { common: 30, rare: 50, epic: 20 },
  },
  cursed: {
    name: '저주받은 상자', icon: 'pickup_chest_cursed',
    blurb: '망자의 무덤에서 발견. 위험하지만 보상은 크다.',
    base_count: 1,
    extra_chance_2: 0.50,
    extra_chance_3: 0.20,
    tier_weights: { common: 10, rare: 50, epic: 40 },
    side_effect: 'spawn_skeletons',
  },
  boss: {
    name: '보스 보물', icon: 'pickup_chest_boss',
    blurb: '보스 처치 보상. 항상 3개의 아이템(잿팟 보장).',
    base_count: 3,
    extra_chance_2: 0,
    extra_chance_3: 1,
    tier_weights: { common: 5, rare: 40, epic: 55 },
  },
};
    blurb: '귀한 황금 상자. 1-2개 아이템 보장, 가끔 잿팟 3개.',
    base_count: 2,
    extra_chance_2: 0,     // already base 2
    extra_chance_3: 0.15,  // 15% jackpot
    tier_weights: { common: 30, rare: 50, epic: 20 },
  },
  cursed: {
    name: '저주받은 상자', icon: 'pickup_chest',
    blurb: '망자의 무덤에서 발견. 위험하지만 보상은 크다.',
    base_count: 1,
    extra_chance_2: 0.50,
    extra_chance_3: 0.20,
    tier_weights: { common: 10, rare: 50, epic: 40 },
    side_effect: 'spawn_skeletons',  // 적 4기 소환
  },
  boss: {
    name: '보스 보물', icon: 'pickup_chest_gold',
    blurb: '보스 처치 보상. 항상 3개의 아이템(잿팟 보장).',
    base_count: 3,
    extra_chance_2: 0,
    extra_chance_3: 1,    // 100%
    tier_weights: { common: 5, rare: 40, epic: 55 },
  },
};

// Sample one item by tier weight, optionally excluding already-rolled ids
window.rollLoot = function (chestType, exclude = new Set()) {
  const def = window.CHEST_TYPES[chestType] || window.CHEST_TYPES.wood;
  const tw = def.tier_weights;
  const totalT = tw.common + tw.rare + tw.epic;
  let r = Math.random() * totalT;
  let tier;
  if ((r -= tw.common) < 0) tier = 'common';
  else if ((r -= tw.rare) < 0) tier = 'rare';
  else tier = 'epic';

  const pool = window.LOOT_ITEMS.filter(i => i.tier === tier && !exclude.has(i.id));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
};

window.rollChest = function (chestType) {
  const def = window.CHEST_TYPES[chestType] || window.CHEST_TYPES.wood;
  let count = def.base_count;
  if (Math.random() < def.extra_chance_2 && count < 2) count = 2;
  if (Math.random() < def.extra_chance_3) count = 3;
  const rolled = [];
  const seen = new Set();
  for (let i = 0; i < count; i++) {
    const item = window.rollLoot(chestType, seen);
    if (item) {
      rolled.push(item);
      seen.add(item.id);
    }
  }
  return {
    chestType,
    count: rolled.length,
    isJackpot: rolled.length === 3,
    items: rolled,
    sideEffect: def.side_effect || null,
  };
};
