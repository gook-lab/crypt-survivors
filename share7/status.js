// Status effect definitions — DATA only.
// Each status is one row of game-mechanics data. The art lives in sprites.js
// (status_burn, status_freeze, etc.). The weapon -> status link is derived
// from weapons.js (proc_fx === status id).
//
// Schema:
//   name        human label
//   icon        sprite name (8×8 status icon)
//   color       theme color (hex)
//   element     'fire'|'ice'|'shadow'|'lightning'|'physical'|'holy'|'nature'|'arcane'
//   kind        'dot' | 'control' | 'debuff' | 'buff'
//   duration    seconds the effect lasts
//   tick        seconds between ticks (for DOT)
//   tick_damage description of damage per tick (string is fine — display only)
//   max_stacks  refreshable up to this many stacks (1 = non-stacking)
//   immune      enemy archetypes that ignore it
//   cleansed_by tags that remove this status when applied
//   blurb       short flavor text
//   tooltip     mechanical description (longer)
//   overlay_fx  sprite name to render on affected enemy (sticky, looping)

window.STATUS = {
  burn: {
    name: '화상', icon: 'status_burn', color: '#f08a2a',
    element: 'fire', kind: 'dot',
    duration: 5, tick: 0.5, tick_damage: '최대 체력 2%',
    max_stacks: 5, immune: ['boss_demon'], cleansed_by: ['ice'],
    blurb: '뜨거운 화염이 적의 살갗을 태운다.',
    tooltip: '0.5초마다 최대 HP의 2%를 화염 피해로 입힌다. 최대 5중첩, 중첩 시 지속시간 갱신. 빙결로 해제.',
    overlay_fx: 'fx_impact_scorch',
  },
  freeze: {
    name: '빙결', icon: 'status_freeze', color: '#6fb4dc',
    element: 'ice', kind: 'control',
    duration: 2, tick: 0, tick_damage: '—',
    max_stacks: 1, immune: ['boss_vampire', 'boss_demon'], cleansed_by: ['fire'],
    blurb: '얼음이 적을 정지시킨다.',
    tooltip: '2초간 행동 불가. 빙결된 적은 1.5× 피해를 받는다. 화염 효과로 해제, 해제 시 짧은 시각 폭발.',
    overlay_fx: 'fx_ice',
  },
  poison: {
    name: '독', icon: 'status_poison', color: '#88b85a',
    element: 'nature', kind: 'dot',
    duration: 8, tick: 1.0, tick_damage: '5 + 마법력 10%',
    max_stacks: 3, immune: [], cleansed_by: ['holy'],
    blurb: '독이 살을 부식시킨다.',
    tooltip: '1초마다 고정 피해. 독에 걸린 적은 회복 효과를 받을 수 없다. 신성으로 해제.',
    overlay_fx: 'fx_burn',
  },
  shock: {
    name: '감전', icon: 'status_shock', color: '#f0d27a',
    element: 'lightning', kind: 'debuff',
    duration: 1.5, tick: 0.3, tick_damage: '3 + 0.1s 스턴',
    max_stacks: 1, immune: [], cleansed_by: [],
    blurb: '전류가 근육을 마비시킨다.',
    tooltip: '0.3초마다 인접 적(60px)으로 1회 도약, 모든 적에게 짧은 스턴. 사슬 번개의 시각화.',
    overlay_fx: 'fx_chain_lightning',
  },
  stun: {
    name: '스턴', icon: 'status_stun', color: '#ece2c8',
    element: 'physical', kind: 'control',
    duration: 1, tick: 0, tick_damage: '—',
    max_stacks: 1, immune: ['brute_walk', 'boss_skeleton_king', 'boss_demon'], cleansed_by: [],
    blurb: '강한 충격이 적을 기절시킨다.',
    tooltip: '1초간 행동 불가. 피해를 받으면 즉시 해제. 상위 보스에는 통하지 않는다.',
    overlay_fx: 'fx_impact_smash',
  },
  bleed: {
    name: '출혈', icon: 'status_bleed', color: '#c8332a',
    element: 'physical', kind: 'dot',
    duration: 6, tick: 0.5, tick_damage: '최대 체력 1%',
    max_stacks: 5, immune: ['boss_skeleton_king'], cleansed_by: [],
    blurb: '깊은 상처에서 피가 흐른다.',
    tooltip: '0.5초마다 최대 HP의 1%. 이동 중인 적은 추가로 2배의 피해. 해골은 면역(피가 없음).',
    overlay_fx: 'fx_death_generic',
  },
  slow: {
    name: '둔화', icon: 'status_slow', color: '#3a78c8',
    element: 'ice', kind: 'debuff',
    duration: 3, tick: 0, tick_damage: '—',
    max_stacks: 3, immune: [], cleansed_by: ['fire'],
    blurb: '점액 또는 얼음이 적의 움직임을 묶는다.',
    tooltip: '이동 속도 -25% / 공격 속도 -20% (최대 3중첩 = 모두 -60%). 화염으로 해제.',
    overlay_fx: 'fx_shield_bubble',
  },
  shield: {
    name: '방벽', icon: 'status_shield', color: '#bfe6f0',
    element: 'holy', kind: 'buff',
    duration: 4, tick: 0, tick_damage: '—',
    max_stacks: 1, immune: [], cleansed_by: [],
    blurb: '신성한 빛이 다음 일격을 막아낸다.',
    tooltip: '플레이어가 받는 다음 한 번의 피해를 완전 무효화. 회복 픽업으로 갱신.',
    overlay_fx: 'fx_shield_bubble',
  },
};

// ──────────────────────────────────────────────────────────────
// SYNERGIES — combos that trigger when 2+ statuses overlap
// ──────────────────────────────────────────────────────────────
window.STATUS_SYNERGIES = [
  { ids: ['burn', 'bleed'],
    name: '출혈 폭발 (Hemorrhage)',
    effect: '화상 DoT가 3배로 증폭, 출혈 지속시간 +2s',
    blurb: '불에 탄 상처는 더 깊게 갈라진다.',
  },
  { ids: ['freeze', 'physical'],
    name: '깨부수기 (Shatter)',
    effect: '빙결 상태 적에게 물리 피해 → 1.8× 피해 + 빙결 즉시 해제',
    blurb: '얼어붙은 적을 둔기로 후려치면 산산조각.',
  },
  { ids: ['shock', 'freeze'],
    name: '도전체 (Conduct)',
    effect: '빙결된 적은 감전의 사슬 도약 거리 +50%, 도약 횟수 +2',
    blurb: '얼음 결정은 전류의 완벽한 도전체.',
  },
  { ids: ['poison', 'slow'],
    name: '시드는 저주 (Wither)',
    effect: '둔화된 적의 독 틱이 2배. 체력 회복 무효 + 흡수',
    blurb: '발이 묶인 채 천천히 시들어간다.',
  },
  { ids: ['stun', 'bleed'],
    name: '절단 (Cripple)',
    effect: '스턴 지속시간 +1s, 출혈 틱 데미지 +50%',
    blurb: '쓰러진 적은 더 깊게 베인다.',
  },
  { ids: ['burn', 'poison'],
    name: '독연기 (Toxic Smoke)',
    effect: '화상이 적에게 닿는 모든 인접 적(40px)에게 독을 전염',
    blurb: '독초가 타면서 사방에 독안개를 흩뿌린다.',
  },
];
