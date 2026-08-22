// Hero definitions — class skills + level milestones + exclusive weapon.
//
// Each hero unlocks a unique passive ability at fixed level milestones
// (1 / 10 / 20 / 30 / 40 / 50). Level 1 is the class starter. The five
// stages above carve out the hero's identity — a Knight builds toward
// holy resilience, a Mage toward arcane double-cast, etc.
//
// Each hero also owns an EXCLUSIVE weapon (one of its own) that no other
// class can roll in their level-up pool. This is what really separates
// classes in build.
//
// Schema per hero:
//   id, name, role         basic flavor
//   sprite, portrait        16×16 walk clip + 24×24 portrait icon
//   color                   theme color (hex, used for tints/cards)
//   stats                   base hp / speed / magnet / dmg_mult
//   starter_weapon          id of weapon dealt at run start (Lv 1 skill)
//   exclusive_weapon        id of weapon only this hero can roll
//   weapon_pool             ids the hero is *more* likely to be offered
//                           (other heroes can still get them; this is bias)
//   skills                  array of { level, name, blurb, effect, icon }
//                           level: 1 / 10 / 20 / 30 / 40 / 50
//   evolution               recipe to upgrade starter into legendary
//   blurb                   short flavor sentence

window.HEROES = {
  knight: {
    id: 'knight', name: 'Knight', role: 'GUARDIAN · 균형형',
    sprite: 'knight_walk', portrait: 'icon_hero_knight',
    color: '#f0d27a',
    stats: { hp: 120, speed: 100, magnet: 64, dmg_mult: 1.0 },
    starter_weapon: 'wand',
    exclusive_weapon: 'vanguard_sword',
    weapon_pool: ['wand', 'cross', 'holywater', 'bible', 'mace', 'shield_throw', 'divine_hammer', 'holy_lance'],
    evolution: 'leg_blade',
    blurb: '철갑의 수호자. 모든 면에서 균형 잡힌 시작 캐릭터.',
    skills: [
      { level: 1,  name: '신성한 결의',     icon: 'icon_hero_knight',
        blurb: '시작 무기로 매직 완드를 휘둘러 적을 추적한다.',
        effect: '매직 완드 Lv.1 자동 장착' },
      { level: 10, name: '성역',           icon: 'status_shield',
        blurb: '주위 적이 4명 이상일 때 자동으로 짧은 보호막 발동.',
        effect: '8s 쿨다운 · 1s 무적' },
      { level: 20, name: '정의의 일격',     icon: 'icon_might',
        blurb: '모든 일격에 크리티컬 확률 +15%. 크리 시 1.8배 피해.',
        effect: 'CRIT 15% · CRIT ×1.8' },
      { level: 30, name: '빛의 결의',       icon: 'pickup_heart',
        blurb: 'HP 30% 이하일 때 모든 피해 +50%, 받는 피해 -30%.',
        effect: 'LowHP 보너스' },
      { level: 40, name: '신성 광휘',       icon: 'fx_impact_holy',
        blurb: '적을 처치할 때마다 5px 신성 폭발이 인접 적에게 피해.',
        effect: 'On Kill · AOE 5px' },
      { level: 50, name: '천사의 가호',     icon: 'icon_hero_cleric',
        blurb: '사망 시 자동 부활 1회. HP 50% + 3초 무적.',
        effect: 'Revive 1×' },
    ],
  },

  warrior: {
    id: 'warrior', name: 'Warrior', role: 'BERSERKER · 근접형',
    sprite: 'warrior_walk', portrait: 'icon_hero_warrior',
    color: '#c8332a',
    stats: { hp: 160, speed: 88, magnet: 48, dmg_mult: 1.2 },
    starter_weapon: 'axe',
    exclusive_weapon: 'warhammer',
    weapon_pool: ['axe', 'mace', 'whip', 'scythe', 'bone', 'cleaver', 'chain_flail', 'throw_axes'],
    evolution: 'leg_axe',
    blurb: '야수의 혈통. HP 높고 피해도 강하지만 이동이 둔하다.',
    skills: [
      { level: 1,  name: '광전사 모드',     icon: 'icon_hero_warrior',
        blurb: '회전하는 도끼를 던져 모든 적을 베어버리며 시작.',
        effect: '도끼 Lv.1 자동 장착 · 시작 HP +40' },
      { level: 10, name: '전투광',         icon: 'icon_might',
        blurb: '주위 적 1명당 피해량 +2%. 군중 사이에서 가장 강해진다.',
        effect: '+2% dmg/enemy · 최대 +30%' },
      { level: 20, name: '파괴자',         icon: 'fx_impact_smash',
        blurb: '모든 무기의 넉백 거리 2배 + 30% 확률로 스턴.',
        effect: 'Knockback ×2 · Stun 30%' },
      { level: 30, name: '광폭화',         icon: 'icon_haste',
        blurb: 'HP 낮을수록 공격 속도 증가. 50% 이하 +25%, 25% 이하 +50%.',
        effect: 'LowHP AS up' },
      { level: 40, name: '피의 갈증',       icon: 'pickup_heart',
        blurb: '적을 처치할 때마다 1HP 회복. 큰 적은 +5.',
        effect: 'Lifesteal on kill' },
      { level: 50, name: '분노의 폭주',     icon: 'fx_levelup',
        blurb: '60초마다 5초간 모든 공격이 크리티컬 보장.',
        effect: '5s All-Crit · 60s CD' },
    ],
  },

  mage: {
    id: 'mage', name: 'Mage', role: 'ARCANE · 마법형',
    sprite: 'mage_walk', portrait: 'icon_hero_mage',
    color: '#b574d8',
    stats: { hp: 80, speed: 100, magnet: 96, dmg_mult: 1.15 },
    starter_weapon: 'nova',
    exclusive_weapon: 'astral_staff',
    weapon_pool: ['nova', 'wand', 'prism', 'lightning', 'firewall', 'frost_bolt', 'void_sphere', 'arcane_missile'],
    evolution: 'leg_nova',
    blurb: '고대 주문을 다루는 마지막 을어따. HP 낮은 대신 마법 효율 +.',
    skills: [
      { level: 1,  name: '아케인 친화',     icon: 'icon_hero_mage',
        blurb: '8방향 노바로 시작. 마법 무기 회복 시간 -10%.',
        effect: '노바 Lv.1 자동 장착 · Magic CD -10%' },
      { level: 10, name: '마나 흐름',       icon: 'pickup_potion_mana',
        blurb: '모든 마법(arcane) 무기 추가 회복 -15% 누적.',
        effect: 'Arcane CD -15%' },
      { level: 20, name: '원소 친화',       icon: 'pickup_potion_arcane',
        blurb: '모든 원소(fire/ice/arcane/lightning) 피해 +20%.',
        effect: '+20% elemental dmg' },
      { level: 30, name: '시간 왜곡',       icon: 'icon_haste',
        blurb: '5% 확률로 무기가 이중 시전된다.',
        effect: 'Double-cast 5%' },
      { level: 40, name: '마력 폭발',       icon: 'fx_impact_arcane',
        blurb: '처치 시 8px 마법 폭발 — 아군에 피해 없음.',
        effect: 'On Kill · Arcane AOE' },
      { level: 50, name: '차원 균열',       icon: 'icon_leg_blackhole',
        blurb: '30초마다 작은 블랙홀이 자동 소환되어 적을 빨아들인다.',
        effect: '30s · Auto blackhole' },
    ],
  },

  huntress: {
    id: 'huntress', name: 'Huntress', role: 'RANGED · 원거리형',
    sprite: 'huntress_walk', portrait: 'icon_hero_huntress',
    color: '#88b85a',
    stats: { hp: 100, speed: 120, magnet: 56, dmg_mult: 1.05 },
    starter_weapon: 'arrow',
    exclusive_weapon: 'hunters_bow',
    weapon_pool: ['arrow', 'knives', 'spear', 'bone', 'whip', 'crossbow_bolt', 'snare_trap', 'hunting_hawk'],
    evolution: 'leg_arrow',
    blurb: '숨을 죽이고 잠복하는 명사수. 빠르고 정확하지만 HP 낮다.',
    skills: [
      { level: 1,  name: '사냥꾼의 표적',   icon: 'icon_hero_huntress',
        blurb: '직선 화살로 시작. 가장 가까운 적을 자동 조준.',
        effect: '화살 Lv.1 자동 장착 · Speed +20%' },
      { level: 10, name: '매의 눈',         icon: 'cursor_target',
        blurb: '모든 투사체 사거리 +50%, 화면 끝까지 도달한다.',
        effect: 'Range +50%' },
      { level: 20, name: '일제 사격',       icon: 'icon_multi',
        blurb: '모든 투사체 무기에 추가 발사 +1 (보장).',
        effect: '+1 projectile' },
      { level: 30, name: '정밀 타격',       icon: 'icon_boss_lich',
        blurb: '엘리트 / 보스에게 +30% 피해.',
        effect: '+30% vs boss' },
      { level: 40, name: '흔적 추적',       icon: 'status_bleed',
        blurb: '적 처치 후 다음 공격은 무조건 크리. 누적 안됨.',
        effect: 'Next shot CRIT' },
      { level: 50, name: '그림자 발걸음',   icon: 'icon_swift',
        blurb: '15초마다 1초간 무적 + 이동 속도 2배. 충돌 피해 무시.',
        effect: '15s · 1s blink' },
    ],
  },

  cleric: {
    id: 'cleric', name: 'Cleric', role: 'HOLY · 서포터형',
    sprite: 'cleric_walk', portrait: 'icon_hero_cleric',
    color: '#bfe6f0',
    stats: { hp: 110, speed: 96, magnet: 80, dmg_mult: 0.95 },
    starter_weapon: 'holywater',
    exclusive_weapon: 'holy_censer',
    weapon_pool: ['holywater', 'bible', 'cross', 'garlic', 'wand', 'heal_beam', 'smite', 'sanctuary'],
    evolution: 'leg_soul_lantern',
    blurb: '성광으로 전장을 정화한다. 회복 + 정화 + 신성 피해 특화.',
    skills: [
      { level: 1,  name: '신성한 손길',     icon: 'icon_hero_cleric',
        blurb: '성수병을 던져 신성한 웅덩이를 만들며 시작.',
        effect: '성수병 Lv.1 · 회복 효율 +20%' },
      { level: 10, name: '치유의 의식',     icon: 'fx_heal_aura',
        blurb: '20초마다 자동으로 +20HP 회복 + 모든 디버프 해제.',
        effect: '20s · Heal + Cleanse' },
      { level: 20, name: '정화의 의식',     icon: 'status_shield',
        blurb: '받는 디버프 지속시간 -60%. 사실상 면역에 가까움.',
        effect: 'Debuff -60% duration' },
      { level: 30, name: '축복',           icon: 'icon_vigor',
        blurb: '모든 패시브 효과 +10% (누적). 활력은 +30 / 레벨.',
        effect: 'Passive +10%' },
      { level: 40, name: '부활의 기도',     icon: 'pickup_chicken',
        blurb: '5분마다 즉시 풀 회복. 보스전 직전 거의 보장된 회복.',
        effect: '5min · Full heal' },
      { level: 50, name: '천국의 사도',     icon: 'spirit_fairy_3',
        blurb: '사망 시 천사로 부활. 5초간 무적 + 광역 신성 폭발.',
        effect: 'Death · Angel form' },
    ],
  },
};
