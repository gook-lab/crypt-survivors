// Drop items — DATA.
//
// Enemies have a small chance (DROP_CHANCE) to drop one item on death; bosses
// always drop a chest. A drop's `kind` decides what collecting it does — the
// pickup system detects the collect, main.js applies the effect:
//   'heal'   — restore healFrac of max HP
//   'buff'   — push a timed multiplier buff onto the loadout (duration secs)
//   'magnet' — vacuum every XP gem on the field
//   'bomb'   — deal `damage` to every enemy on screen
//   'gold'   — add `amount` gold to the run tally
//   'chest'  — open the legendary-weapon picker (boss reward)

export const DROPS = {
  heart: {
    id: 'heart', name: '하트', sprite: 'pickup_heart',
    kind: 'heal', healFrac: 0.3,
  },
  potion_hp: {
    id: 'potion_hp', name: '체력 포션', sprite: 'pickup_potion_hp',
    kind: 'heal', healFrac: 0.6,
  },
  chicken: {
    id: 'chicken', name: '통구이', sprite: 'pickup_chicken',
    kind: 'heal', healFrac: 1.0,
  },
  potion_might: {
    id: 'potion_might', name: '힘의 물약', sprite: 'pickup_potion_might',
    kind: 'buff', buff: { damage: 1.5 }, duration: 12,
  },
  potion_swift: {
    id: 'potion_swift', name: '신속의 물약', sprite: 'pickup_potion_swift',
    kind: 'buff', buff: { moveSpeed: 1.4 }, duration: 12,
  },
  potion_arcane: {
    id: 'potion_arcane', name: '비전의 물약', sprite: 'pickup_potion_arcane',
    kind: 'buff', buff: { cooldown: 0.6 }, duration: 12,
  },
  potion_mana: {
    id: 'potion_mana', name: '마나 물약', sprite: 'pickup_potion_mana',
    kind: 'buff', buff: { damage: 1.25, cooldown: 0.8 }, duration: 10,
  },
  magnet: {
    id: 'magnet', name: '자석', sprite: 'pickup_magnet', kind: 'magnet',
  },
  bomb: {
    id: 'bomb', name: '폭탄', sprite: 'pickup_bomb', kind: 'bomb', damage: 260,
  },
  gold: {
    id: 'gold', name: '금화', sprite: 'pickup_gold', kind: 'gold', amount: 6,
  },
  chest: {
    id: 'chest', name: '보물 상자', sprite: 'pickup_chest', kind: 'chest',
  },
};

// Per non-boss kill: DROP_CHANCE to roll, then this weighted table picks one.
export const DROP_CHANCE = 0.04;

const DROP_TABLE = [
  { id: 'gold', weight: 34 },
  { id: 'heart', weight: 20 },
  { id: 'potion_hp', weight: 9 },
  { id: 'magnet', weight: 9 },
  { id: 'potion_might', weight: 7 },
  { id: 'potion_swift', weight: 7 },
  { id: 'potion_arcane', weight: 6 },
  { id: 'potion_mana', weight: 5 },
  { id: 'bomb', weight: 4 },
  { id: 'chicken', weight: 3 },
];

const NO_HEAL_TABLE = DROP_TABLE.filter((d) => DROPS[d.id].kind !== 'heal');

// Pick a drop id from the weighted table. `rng` is the seeded generator.
// `noHeal` (weekly rule) rolls from the table without heal drops — still one rng draw.
export function rollDrop(rng, { noHeal = false } = {}) {
  const table = noHeal ? NO_HEAL_TABLE : DROP_TABLE;
  let total = 0;
  for (let i = 0; i < table.length; i++) total += table[i].weight;
  let r = rng.next() * total;
  for (let i = 0; i < table.length; i++) {
    r -= table[i].weight;
    if (r <= 0) return table[i].id;
  }
  return table[table.length - 1].id;
}
