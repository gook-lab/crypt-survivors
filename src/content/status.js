// Status-effect content — DATA only.
//
// The status system (systems/status.js) ticks these on enemies; the damage
// system applies them on a weapon's on-hit proc; the renderer reads icon/color.
// Adding a status is a pure data edit here.
//
// Schema per status:
//   name        Korean label (HUD / bestiary)
//   icon        8×8 status sprite floated above the afflicted enemy
//   color       theme colour (hex int)
//   element     drives cleanse matching — applying X removes statuses whose
//               `cleansedBy` lists X (fire melts ice, holy purges poison…)
//   kind        'dot' | 'control' | 'debuff'
//   duration    seconds a fresh application lasts (re-applying refreshes it)
//   tickDamage  per-tick damage for a DoT, before stack/synergy scaling
//   maxStacks   re-applying adds a stack up to this (DoT scales with stacks)
//   cleansedBy  elements that strip this status when applied to the target

export const STATUS = {
  burn: {
    name: '화상', icon: 'status_burn', color: 0xf08a2a,
    element: 'fire', kind: 'dot',
    duration: 5, tickDamage: 8, maxStacks: 5, cleansedBy: ['ice'],
    blurb: '뜨거운 화염이 적의 살갗을 태운다.',
  },
  freeze: {
    name: '빙결', icon: 'status_freeze', color: 0x6fb4dc,
    element: 'ice', kind: 'control',
    duration: 2, tickDamage: 0, maxStacks: 1, cleansedBy: ['fire'],
    blurb: '얼음이 적을 정지시킨다. 빙결된 적은 모든 피해를 1.5배로 받는다.',
  },
  poison: {
    name: '독', icon: 'status_poison', color: 0x88b85a,
    element: 'nature', kind: 'dot',
    duration: 8, tickDamage: 5, maxStacks: 3, cleansedBy: ['holy'],
    blurb: '독이 살을 부식시킨다.',
  },
  shock: {
    name: '감전', icon: 'status_shock', color: 0xf0d27a,
    element: 'lightning', kind: 'debuff',
    duration: 1.5, tickDamage: 3, maxStacks: 1, cleansedBy: [],
    blurb: '전류가 근육을 마비시켜 둔하게 만든다.',
  },
  stun: {
    name: '스턴', icon: 'status_stun', color: 0xece2c8,
    element: 'physical', kind: 'control',
    duration: 1, tickDamage: 0, maxStacks: 1, cleansedBy: [],
    blurb: '강한 충격이 적을 기절시킨다.',
  },
  bleed: {
    name: '출혈', icon: 'status_bleed', color: 0xc8332a,
    element: 'physical', kind: 'dot',
    duration: 6, tickDamage: 6, maxStacks: 5, cleansedBy: [],
    blurb: '깊은 상처에서 피가 흐른다.',
  },
  slow: {
    name: '둔화', icon: 'status_slow', color: 0x3a78c8,
    element: 'ice', kind: 'debuff',
    duration: 3, tickDamage: 0, maxStacks: 3, cleansedBy: ['fire'],
    blurb: '얼음 또는 점액이 적의 움직임을 묶는다.',
  },
};

// ──────────────────────────────────────────────────────────────────────────
// SYNERGIES — combos that fire while two statuses overlap on one enemy.
// `mult` fields are read by the status tick loop; the last two are noted as
// data but implemented at hit/chain time (see damage.js / collision.js).
// ──────────────────────────────────────────────────────────────────────────
export const STATUS_SYNERGIES = [
  { ids: ['burn', 'bleed'], name: '출혈 폭발', burnMult: 3,
    effect: '화상 피해 3배', blurb: '불에 탄 상처는 더 깊게 갈라진다.' },
  { ids: ['poison', 'slow'], name: '시드는 저주', poisonMult: 2,
    effect: '독 피해 2배', blurb: '발이 묶인 채 천천히 시들어간다.' },
  { ids: ['stun', 'bleed'], name: '절단', bleedMult: 1.5,
    effect: '출혈 피해 1.5배', blurb: '쓰러진 적은 더 깊게 베인다.' },
  { ids: ['burn', 'poison'], name: '독연기', spreadPoison: true,
    effect: '인접한 적에게 독을 전염', blurb: '독초가 타며 독안개를 흩뿌린다.' },
  { ids: ['freeze', 'any'], name: '깨부수기',
    effect: '빙결된 적은 모든 공격을 1.5배로 받음', blurb: '얼어붙은 적은 산산조각 난다.' },
  { ids: ['shock', 'freeze'], name: '도전체',
    effect: '빙결된 적을 거치면 사슬 번개가 추가로 도약', blurb: '얼음은 전류의 완벽한 도전체.' },
];
