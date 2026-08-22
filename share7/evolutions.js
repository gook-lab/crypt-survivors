// Passive item definitions + evolution recipes — DATA only.
//
// PASSIVES — Items the player levels up alongside weapons.
//   id            unique key
//   name          human label
//   icon          sprite name (24×24 icon)
//   max_level     levels 1..max
//   stat          gameplay stat the level grants
//   per_level     amount/step per level
//   blurb         short flavor
//
// EVOLUTIONS — Recipes that fuse a max-level base weapon with a passive
// (or another condition) to spawn a legendary.
//   from          base weapon id (must be MAX level)
//   with          passive id required (level 1+ enough; null = drop only)
//   to            resulting legendary weapon id
//   note          short hint shown in the level-up popup ("ready to evolve!")
//   condition     optional human-readable extra requirement
//
// Some legendaries don't have an evolution path — they're chest drops only.
// Those entries have `drop_only: true` and no `from`/`with`.

window.PASSIVES = {
  might: {
    name: '힘', icon: 'icon_might', max_level: 5,
    stat: '피해량', per_level: '+10%',
    blurb: '근본적인 위력을 강화한다.',
  },
  haste: {
    name: '신속', icon: 'icon_haste', max_level: 5,
    stat: '공격 속도', per_level: '+8%',
    blurb: '쿨다운과 회복 시간을 단축.',
  },
  multi: {
    name: '증식', icon: 'icon_multi', max_level: 3,
    stat: '투사체 수', per_level: '+1',
    blurb: '발사·소환되는 투사체가 추가된다.',
  },
  swift: {
    name: '바람', icon: 'icon_swift', max_level: 5,
    stat: '이동 속도', per_level: '+12%',
    blurb: '발걸음이 가볍고 빨라진다.',
  },
  vigor: {
    name: '활력', icon: 'icon_vigor', max_level: 5,
    stat: '최대 HP', per_level: '+20',
    blurb: '체력 한계가 늘어난다.',
  },
  lodestone: {
    name: '자석', icon: 'icon_lodestone', max_level: 5,
    stat: '획득 범위', per_level: '+25%',
    blurb: '드랍 아이템을 끌어당기는 범위.',
  },
};

window.EVOLUTIONS = [
  // Basic weapon evolutions
  { from: 'wand',       with: 'might',     to: 'leg_blade',
    note: '마법 탄환이 검기로 진화. 빠른 회복 + 무한 관통.',
  },
  { from: 'nova',       with: 'multi',     to: 'leg_nova',
    note: '4방향 노바가 12방향 황금 태양으로 확장.',
  },
  { from: 'prism',      with: 'haste',     to: 'leg_eternal_frost',
    note: '얼음 결정이 빙결 검기로 응집. 100% 빙결.',
  },
  { from: 'spear',      with: 'might',     to: 'leg_spear',
    note: '미스릴 할버드가 라인 위 모든 적을 한 번에 꿰뚫는다.',
  },
  { from: 'axe',        with: 'multi',     to: 'leg_axe',
    note: '뇌격 도끼 3자루가 회전 부메랑으로 휘몰아친다.',
  },
  { from: 'mace',       with: 'haste',     to: 'leg_tempest',
    note: '거대 해머가 광역 연쇄 번개와 강한 넉백을 발생.',
  },
  { from: 'holywater',  with: 'vigor',     to: 'leg_soul_lantern',
    note: '성수가 영혼의 등불로 변모. 처치한 적의 영혼이 회복.',
  },
  { from: 'arrow',      with: 'swift',     to: 'leg_arrow',
    note: '은룡 화살이 추적 + 폭발 화살로 진화.',
  },
  { from: 'garlic',     with: 'lodestone', to: 'leg_world_tree',
    note: '신성 오라가 세계수 뿌리로 변해 가시를 솟구친다.',
  },
  { from: 'bible',      with: 'might',     to: 'leg_bible',
    note: '4권의 성서가 두 겹의 궤도로 호위.',
  },
  { from: 'cross',      with: 'haste',     to: 'leg_cross',
    note: '3개의 작열 십자가가 부메랑처럼 돌아온다.',
  },
  { from: 'whip',       with: 'might',     to: 'leg_whip',
    note: '강철 사슬 채찍 — 적을 끌어당긴다.',
  },
  { from: 'lightning',  with: 'swift',     to: 'leg_storm_caller',
    note: '하늘에서 번개 6대를 무작위로 떨어뜨린다.',
  },
  { from: 'firewall',   with: 'might',     to: 'leg_sun_phoenix',
    note: '봉황 화살이 일직선 관통 + 화염 깃털을 떨군다.',
  },
  { from: 'knives',     with: 'multi',     to: 'leg_spectral_bow',
    note: '8발의 유령 화살이 적을 추적.',
  },
  { from: 'scythe',     with: 'vigor',     to: 'leg_scythe',
    note: '사신 낫 — 처치한 적의 영혼을 흡수해 회복.',
  },
  { from: 'bone',       with: 'might',     to: 'leg_necro_skull',
    note: '두개골 2개를 소환해 자동 공격하게 만든다.',
  },

  // Drop-only legendaries (no evolution, found in chests)
  { drop_only: true, to: 'leg_black_hole',
    note: '황금 상자 또는 보스 처치 보상에서만 등장.',
    condition: '챕터 3 이상 상자',
  },
  { drop_only: true, to: 'leg_demon_heart',
    note: '데몬 보스를 처치해야 드랍.',
    condition: '데몬 보스 처치',
  },
];
