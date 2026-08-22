// Treasure-chest loot — DATA + roll logic.
//
// A collected chest opens the gacha modal (ui/gacha.js): it reveals 1-3 loot
// items, weighted by the chest's tier table. main.js applies each item's
// effect by `id`. rollChest takes the seeded rng so runs stay deterministic.
//
// Item tiers: common (heavy) · rare · epic (can land a jackpot of 3).

export const LOOT_ITEMS = [
  // currency
  { id: 'gold_small', name: '골드 50', icon: 'pickup_gold', tier: 'common', value: 50, blurb: '소량의 골드.' },
  { id: 'gold_medium', name: '골드 200', icon: 'pickup_gold', tier: 'common', value: 200, blurb: '적당한 골드.' },
  { id: 'gold_large', name: '골드 500', icon: 'pickup_chest_gold', tier: 'rare', value: 500, blurb: '큰 금액의 골드.' },
  // healing
  { id: 'heart_small', name: '하트', icon: 'pickup_heart', tier: 'common', value: 20, blurb: 'HP 20 즉시 회복.' },
  { id: 'chicken', name: '치킨', icon: 'pickup_chicken', tier: 'common', value: 0.3, blurb: '최대 HP의 30% 회복.' },
  // potions — run-long buffs
  { id: 'potion_might', name: '힘의 물약', icon: 'pickup_potion_might', tier: 'rare', value: 1, blurb: '런 종료까지 피해 +15%.' },
  { id: 'potion_swift', name: '신속의 물약', icon: 'pickup_potion_swift', tier: 'rare', value: 1, blurb: '런 종료까지 이동 +20%.' },
  { id: 'potion_mana', name: '마나 물약', icon: 'pickup_potion_mana', tier: 'rare', value: 1, blurb: '런 종료까지 회복 시간 -10%.' },
  { id: 'potion_arcane', name: '아케인 물약', icon: 'pickup_potion_arcane', tier: 'rare', value: 1, blurb: '런 종료까지 피해 +25%.' },
  // utility
  { id: 'magnet', name: '자석', icon: 'pickup_magnet', tier: 'rare', value: 1, blurb: 'field의 모든 경험치를 흡수.' },
  { id: 'bomb', name: '폭탄', icon: 'pickup_bomb', tier: 'rare', value: 220, blurb: '화면의 모든 적에게 피해.' },
  { id: 'scroll', name: '리롤 두루마리', icon: 'pickup_scroll', tier: 'rare', value: 1, blurb: '레벨업 리롤 토큰 +1.' },
  // epic
  { id: 'rune', name: '룬스톤', icon: 'pickup_rune', tier: 'epic', value: 1, blurb: '랜덤 패시브 +1 레벨 (즉시).' },
  { id: 'weapon_roll', name: '무기 카드', icon: 'icon_leg_blade', tier: 'epic', value: 1, blurb: '랜덤 무기를 즉시 획득.' },
  { id: 'legendary_seed', name: '전설 씨앗', icon: 'icon_leg_nova', tier: 'epic', value: 1, blurb: '전설 무기 1종 즉시 획득.' },
];

const LOOT_BY_ID = Object.fromEntries(LOOT_ITEMS.map((i) => [i.id, i]));
export const lootItem = (id) => LOOT_BY_ID[id];

// Chest types — boss kills drop 'boss' (3 epic-heavy items); the drop table
// can scatter a 'wood' chest in normal play.
// All chests open at 1 item, with rising odds of an extra 2nd or 3rd item
// by chest tier — keeps loot moments surprising (you usually get 1, sometimes
// hit 2-3) rather than mechanically dumping 3 on every boss. Weights skew
// the rarity of each rolled item by tier.
export const CHEST_TYPES = {
  wood: {
    name: '나무 상자', icon: 'pickup_chest',
    baseCount: 1, extra2: 0.32, extra3: 0.05,
    weights: { common: 70, rare: 25, epic: 5 },
  },
  gold: {
    name: '황금 상자', icon: 'pickup_chest_gold',
    baseCount: 1, extra2: 0.45, extra3: 0.15,
    weights: { common: 30, rare: 50, epic: 20 },
  },
  boss: {
    name: '보스 보물', icon: 'pickup_chest_boss',
    baseCount: 1, extra2: 0.55, extra3: 0.25,
    weights: { common: 5, rare: 40, epic: 55 },
  },
};

// Roll one item by the chest's tier weights, excluding already-rolled ids.
function rollOne(rng, type, exclude) {
  const def = CHEST_TYPES[type] || CHEST_TYPES.wood;
  const w = def.weights;
  const total = w.common + w.rare + w.epic;
  let r = rng.next() * total;
  let tier;
  if ((r -= w.common) < 0) tier = 'common';
  else if ((r -= w.rare) < 0) tier = 'rare';
  else tier = 'epic';
  const pool = LOOT_ITEMS.filter((i) => i.tier === tier && !exclude.has(i.id));
  if (pool.length === 0) return null;
  return pool[Math.floor(rng.next() * pool.length)];
}

// Roll a whole chest — returns { type, items[], isJackpot }.
export function rollChest(rng, type) {
  const def = CHEST_TYPES[type] || CHEST_TYPES.wood;
  let count = def.baseCount;
  if (count < 2 && rng.next() < def.extra2) count = 2;
  if (rng.next() < def.extra3) count = 3;
  const items = [];
  const seen = new Set();
  for (let i = 0; i < count && items.length < count; i++) {
    const item = rollOne(rng, type, seen);
    if (item) {
      items.push(item);
      seen.add(item.id);
    }
  }
  return { type, items, isJackpot: items.length >= 3 };
}
