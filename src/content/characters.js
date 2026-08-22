// Heroes — DATA (the share3 hero model).
//
// Each hero has: a starting weapon, an EXCLUSIVE weapon only this hero can
// roll, a stat lean (`bonus` folds into loadout.meta), and a `skills` list
// unlocked at level milestones 1/10/20/30/40/50. A skill's `effect` is a set
// of modifiers: every stat key folds into loadout.meta (so recompute() keeps
// it), and `onKill` registers a hero on-kill effect (main.js triggers it —
// 'ignite' / 'lifesteal' / 'blast'). Lv1 is the class starter (no effect).

export const CHARACTERS = [
  {
    id: 'knight', unlockChapter: 1, name: '기사', role: '성기사 · 신성/방어형',
    sprite: 'knight_walk', starter: 'sword', exclusive: 'vanguard_sword',
    blurb: '신성한 갑주의 성기사 · holy 광역', perk: '최대 체력 140 · 신성 광역 +15%',
    // paladin lean: bigger HP buffer, holy-tag damage scales (recompute folds
    // m.damage; per-tag scaling lives in loadout.js — see Wave A note).
    bonus: (m) => { m.maxHp += 40; m.damage += 0.05; },
    skills: [
      { level: 1, name: '성기사의 검기', blurb: '신성한 검을 휘두르며 시작.', effect: {} },
      { level: 10, name: '성역의 가호', blurb: '신성한 보호막. 방어 강화.', effect: { armor: 0.15 } },
      { level: 20, name: '심판의 일격', blurb: '크리티컬 확률·피해 상승.', effect: { critChance: 0.15, critMult: 0.35 } },
      { level: 30, name: '빛의 결의', blurb: '역경에 강해진다 — 피해·방어 상승.', effect: { damage: 0.15, armor: 0.12 } },
      { level: 40, name: '신성 광휘', blurb: '처치한 적 주변을 신성한 불길로 태운다.', effect: { onKill: 'ignite' } },
      { level: 50, name: '천사의 가호', blurb: '쓰러져도 한 번 다시 일어선다.', effect: { revive: 1 } },
    ],
  },
  {
    id: 'warrior', unlockChapter: 4, name: '전사', role: '광전사 · 근접형',
    sprite: 'warrior_walk', starter: 'sword', exclusive: 'warhammer',
    blurb: '야수의 혈통 · 근접형', perk: '최대 체력 160 · 피해 +20%',
    bonus: (m) => { m.maxHp += 60; m.moveSpeed -= 0.1; m.damage += 0.2; },
    skills: [
      { level: 1, name: '광전사의 검기', blurb: '검을 휘두르며 시작.', effect: {} },
      { level: 10, name: '전투광', blurb: '군중 속에서 더 강해진다.', effect: { damage: 0.18 } },
      { level: 20, name: '파괴자', blurb: '둔기의 충격이 적을 짓뭉갠다.', effect: { damage: 0.12 } },
      { level: 30, name: '광폭화', blurb: '위기일수록 공격이 빨라진다.', effect: { cooldown: 0.12 } },
      { level: 40, name: '피의 갈증', blurb: '적을 처치할 때마다 생명력을 흡수한다.', effect: { onKill: 'lifesteal' } },
      { level: 50, name: '분노의 폭주', blurb: '폭주 시 모든 일격이 치명타.', effect: { critChance: 0.2, critMult: 0.3 } },
    ],
  },
  {
    id: 'mage', unlockChapter: 1, name: '마법사', role: '비전 · 마법형',
    sprite: 'mage_walk', starter: 'wand', exclusive: 'astral_staff',
    blurb: '고대 주문의 계승자 · 마법형', perk: '최대 체력 80 · 피해 +15%',
    bonus: (m) => { m.maxHp -= 20; m.damage += 0.15; m.magnet += 40; },
    skills: [
      { level: 1, name: '아케인 친화', blurb: '추적 아케인 회오리를 시전하며 시작.', effect: {} },
      { level: 10, name: '마나 흐름', blurb: '마법 무기의 회복 시간 단축.', effect: { cooldown: 0.12 } },
      { level: 20, name: '원소 친화', blurb: '모든 원소 피해 상승.', effect: { damage: 0.2 } },
      { level: 30, name: '시간 왜곡', blurb: '주문이 더 빠르게 시전된다.', effect: { cooldown: 0.1 } },
      { level: 40, name: '마력 폭발', blurb: '처치한 적이 마법 폭발을 일으켜 주변을 휩쓴다.', effect: { onKill: 'blast' } },
      { level: 50, name: '차원 균열', blurb: '차원이 적을 집어삼킨다.', effect: { damage: 0.15 } },
    ],
  },
  {
    id: 'huntress', unlockChapter: 1, name: '사냥꾼', role: '명사수 · 원거리형',
    sprite: 'huntress_walk', starter: 'black_pigeon', exclusive: 'hunters_bow',
    blurb: '잠복하는 명사수 · 원거리형', perk: '이동 +20% · 빠르고 정확',
    bonus: (m) => { m.moveSpeed += 0.2; m.damage += 0.05; },
    skills: [
      { level: 1, name: '사냥꾼의 표적', blurb: '직선 화살로 시작.', effect: {} },
      { level: 10, name: '매의 눈', blurb: '투사체 사거리가 늘어난다.', effect: { projLife: 0.5 } },
      { level: 20, name: '일제 사격', blurb: '모든 무기에 추가 발사 +1.', effect: { projectiles: 1 } },
      { level: 30, name: '정밀 타격', blurb: '강한 적에게 더 큰 피해.', effect: { damage: 0.15 } },
      { level: 40, name: '흔적 추적', blurb: '처치 직후 잠시 모든 일격이 치명타.', effect: { onKill: 'critwindow' } },
      { level: 50, name: '그림자 발걸음', blurb: '그림자처럼 빠르게 움직인다.', effect: { moveSpeed: 0.15, armor: 0.08 } },
    ],
  },
  {
    id: 'pasqualina', unlockChapter: 3, name: '파스콸리나 벨파에제', role: '룬의 추적자 · 반사형',
    sprite: 'pasqualina_walk', starter: 'runetracer', exclusive: 'nox_runica',
    blurb: '룬을 추적하는 자 · 벽을 튕기는 마법', perk: '체력 100 · 투사체 속도 +20%',
    bonus: (m) => { m.damage += 0.05; m.cooldown += 0.05; },
    skills: [
      { level: 1, name: '룬의 추적자', blurb: '벽을 튕기는 룬 투사체를 시전.', effect: {} },
      { level: 10, name: '빠른 룬', blurb: '투사체가 더 빨라진다.', effect: { cooldown: 0.08 } },
      { level: 20, name: '강화된 반사', blurb: '룬이 더 오래 유지된다.', effect: { projLife: 0.3 } },
      { level: 30, name: '관통의 룬', blurb: '룬의 크기가 커진다.', effect: { projSize: 0.25 } },
      { level: 40, name: '연쇄 룬', blurb: '처치 시 작은 폭발이 주변을 휩쓴다.', effect: { onKill: 'blast' } },
      { level: 50, name: '룬의 군주', blurb: '피해 + 투사체 +1.', effect: { damage: 0.2, projectiles: 1 } },
    ],
  },
  {
    id: 'gennaro', unlockChapter: 2, name: '제나로 벨파에제', role: '단검의 명수 · 다중 투사형',
    sprite: 'gennaro_walk', starter: 'dagger_fan', exclusive: 'dagger_storm',
    blurb: '단검의 폭풍 · 일제 투사', perk: '체력 120 · 투사체 +1',
    bonus: (m) => { m.maxHp += 20; m.projectiles += 1; },
    skills: [
      { level: 1, name: '단검의 명수', blurb: '부채꼴 3연속 단검을 던지며 시작.', effect: {} },
      { level: 10, name: '날카로운 칼날', blurb: '단검 피해 +15%.', effect: { damage: 0.15 } },
      { level: 20, name: '관통 단검', blurb: '단검이 적을 관통한다.', effect: { pierce: 1 } },
      { level: 30, name: '연발 사격', blurb: '모든 무기 투사체 +1.', effect: { projectiles: 1 } },
      { level: 40, name: '치명적 일격', blurb: '치명타 확률·피해 상승.', effect: { critChance: 0.12, critMult: 0.3 } },
      { level: 50, name: '단검의 폭풍', blurb: '쿨다운 감소 + 투사체 +1.', effect: { cooldown: 0.1, projectiles: 1 } },
    ],
  },
  {
    id: 'porta', unlockChapter: 2, name: '포르타 라도나', role: '폭풍의 술사 · 체인형',
    sprite: 'porta_walk', starter: 'tesla_ring', exclusive: 'storm_crown',
    blurb: '번개를 묶는 자 · 자동 체인 라이트닝', perk: '체력 100 · 공격범위 +30% · 쿨다운 -5%',
    bonus: (m) => { m.projSize += 0.3; m.cooldown += 0.05; },
    skills: [
      { level: 1, name: '폭풍의 인장', blurb: '뇌격 반지가 가장 가까운 적을 자동 추적해 연쇄 감전.', effect: {} },
      { level: 10, name: '대지의 분노', blurb: '번개 피해가 강해진다.', effect: { damage: 0.15 } },
      { level: 20, name: '폭풍의 사정', blurb: '번개가 더 멀리 도약한다.', effect: { projLife: 0.35 } },
      { level: 30, name: '뇌격의 가속', blurb: '주문의 회복 시간 단축.', effect: { cooldown: 0.12 } },
      { level: 40, name: '감전의 잔재', blurb: '처치 시 주변에 짧은 감전 폭발.', effect: { onKill: 'shock' } },
      { level: 50, name: '뇌제의 왕관', blurb: '치명타 + 큰 치명 피해.', effect: { critChance: 0.12, critMult: 0.3 } },
    ],
  },
  // cleric was folded into knight (paladin theme) — see
  // .claude/handoff/weapon-rebuild-v2-2026-05-20.md. Holy weapons
  // (holywater, sanctuary, heal_beam, smite, holy_censer) live in the
  // knight roll pool now. cleric_walk sprite is kept on disk but unused.
];

// Apply the chosen hero at run start: starting weapon, sprite, stat lean.
// Also records the hero so the skill system + exclusive-weapon pool can use
// it. (The old per-hero permanent damage upgrade was removed — all permanent
// progression is now GLOBAL via the 대장간 forge, applied in applyMetaUpgrades.)
export function applyCharacter(char, loadout, player) {
  loadout.weapons = { [char.starter]: 1 };
  loadout.hero = char;
  loadout.exclusiveWeapon = char.exclusive;
  char.bonus(loadout.meta);
  player.sprite = char.sprite;
}

// Apply one unlocked skill's effect. Every stat key folds into loadout.meta
// — recompute() derives the live modifiers from meta, so a skill written onto
// loadout directly (e.g. critChance) would be clobbered on the next recompute.
// `onKill` is not a stat: it registers a hero on-kill effect main.js triggers.
export function applySkill(skill, loadout) {
  const e = skill.effect || {};
  for (const k in e) {
    if (k === 'onKill') loadout.onKill.push(e[k]);
    else if (k in loadout.meta) loadout.meta[k] += e[k];
  }
}
