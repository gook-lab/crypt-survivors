// Passive item definitions — DATA.
//
// Passives level 1..maxLevel like weapons. Their combined levels derive the
// loadout's global modifiers (see loadout.js recompute). A passive is also a
// prerequisite for an evolution (content/evolutions.js).

export const PASSIVES = {
  might: { id: 'might', name: '힘', maxLevel: 5, desc: '피해 +12% / 레벨' },
  haste: { id: 'haste', name: '신속', maxLevel: 5, desc: '발사 속도 +8% / 레벨' },
  multi: { id: 'multi', name: '증폭', maxLevel: 3, desc: '투사체 +1 / 레벨' },
  swift: { id: 'swift', name: '바람', maxLevel: 5, desc: '이동 속도 +9% / 레벨' },
  vigor: { id: 'vigor', name: '활력', maxLevel: 5, desc: '최대 체력 +22 / 레벨' },
  lodestone: { id: 'lodestone', name: '자석', maxLevel: 5, desc: '획득 범위 +38 / 레벨' },
  aura: { id: 'aura', name: '범위', maxLevel: 3, desc: '스킬 범위 +22% / 레벨' },
  endure: { id: 'endure', name: '지속', maxLevel: 3, desc: '스킬 유지 시간 +30% / 레벨' },
  // — extension passives —
  lifesteal: { id: 'lifesteal', name: '흡혈', maxLevel: 3, desc: '처치 시 체력 +2 / 레벨' },
  reflect: { id: 'reflect', name: '반사', maxLevel: 3, desc: '피격 시 데미지 반사 8 / 레벨' },
  storm: { id: 'storm', name: '폭풍', maxLevel: 3, desc: '이동 중 잔상에 닿은 적 피해 5 / 레벨' },
  // — build-freedom expansion (eng-review 1A: recompute-only passives) —
  fortune: { id: 'fortune', name: '행운', maxLevel: 5, desc: '드롭 확률 +12% / 레벨' },
  wisdom: { id: 'wisdom', name: '지혜', maxLevel: 3, desc: 'XP 획득 +10% / 레벨' },
  regen2: { id: 'regen2', name: '재생', maxLevel: 3, desc: '체력 회복 +0.3 / 초 / 레벨' },
  pierce_passive: { id: 'pierce_passive', name: '관통', maxLevel: 3, desc: '투사체 관통 +1 / 레벨' },
};
