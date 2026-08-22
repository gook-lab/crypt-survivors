// Bestiary — DATA. One row per enemy/boss: display name, role, the sprite
// clip, the engine ability key, and flavour. The bestiary UI page reads this;
// spawn.js stamps `ability` onto the entity so the enemy-ability system can
// act on it. Adding a monster is a pure data edit here + a config.js stat row.
//
//   role     'basic' | 'elite' | 'boss'
//   ability  engine key — null | 'charge' | 'ranged' | 'burst' | 'bosscast'
//            (see systems/enemyAbilities.js)

export const BESTIARY = {
  // ── 고대 던전 (ch.1) ───────────────────────────────────
  walker: { name: '해골', role: 'basic', sprite: 'walker_walk', ability: null,
    blurb: '느릿하게 다가오는 망자. 수가 많다.' },
  runner: { name: '좀비 추격자', role: 'basic', sprite: 'runner_walk', ability: 'charge',
    blurb: '먹잇감을 보면 갑자기 속도를 올려 달려든다.' },
  bat: { name: '동굴 박쥐', role: 'basic', sprite: 'bat_fly', ability: null,
    blurb: '빠르고 불규칙하게 날아드는 작은 박쥐.' },
  spider: { name: '독거미', role: 'basic', sprite: 'spider_walk', ability: null,
    blurb: '바닥을 빠르게 기어 다니는 거미.' },
  carrion_crow: { name: '시체까마귀', role: 'basic', sprite: 'carrion_crow_fly', ability: null,
    blurb: '죽음의 냄새를 좇는 까마귀 무리. 빠르게 급강하한다.' },
  brute: { name: '오우거', role: 'elite', sprite: 'brute_walk', ability: null,
    blurb: '느리지만 단단하고 일격이 묵직하다.' },
  elite: { name: '정예 술사', role: 'elite', sprite: 'elite_walk', ability: 'ranged',
    blurb: '거리를 두고 마력탄을 쏘아대는 술사.' },
  giant_spider: { name: '거대 거미', role: 'elite', sprite: 'giant_spider_walk', ability: 'charge',
    blurb: '튼튼한 키틴질 갑각. 거미줄을 끊고 도약해 덮친다.' },
  bone_archer: { name: '해골 궁수', role: 'elite', sprite: 'bone_archer_walk', ability: 'ranged',
    blurb: '낡은 활을 든 해골. 거리를 두고 뼈 화살을 쏘아댄다.' },
  grave_hound: { name: '망자의 사냥개', role: 'basic', sprite: 'grave_hound_run', ability: 'charge',
    blurb: '뼈만 남은 사냥개. 무리에서 튀어나와 도약해 문다.' },

  // ── 저주받은 숲 (ch.2) ─────────────────────────────────
  wolf: { name: '숲늑대', role: 'basic', sprite: 'wolf_run', ability: 'charge',
    blurb: '안개 속에서 튀어나와 도약 공격을 한다.' },
  goblin: { name: '고블린', role: 'basic', sprite: 'goblin_walk', ability: null,
    blurb: '무리 지어 몰려드는 약삭빠른 약탈자.' },
  hornet: { name: '말벌', role: 'basic', sprite: 'hornet_fly', ability: null,
    blurb: '맹렬한 속도로 직선으로 날아든다.' },
  slime: { name: '슬라임', role: 'basic', sprite: 'slime_idle', ability: 'burst',
    blurb: '느린 점액 덩어리. 터지면 사방으로 점액이 튄다.' },
  chimera: { name: '키메라', role: 'elite', sprite: 'chimera_walk', ability: 'ranged',
    blurb: '여러 짐승이 뒤섞인 괴수. 원거리 화염을 뱉는다.' },

  // ── 독무 늪지 (ch.3) ───────────────────────────────────
  frog: { name: '독두꺼비', role: 'basic', sprite: 'frog_idle', ability: 'charge',
    blurb: '웅크렸다가 한 번에 길게 도약한다.' },
  bog_zombie: { name: '늪 좀비', role: 'basic', sprite: 'bog_zombie_walk', ability: 'burst',
    blurb: '썩은 시체. 쓰러질 때 독성 점액을 흩뿌린다.' },
  wisp: { name: '도깨비불', role: 'basic', sprite: 'wisp_float', ability: 'charge',
    blurb: '떠다니다 갑자기 솟구쳐 덮친다.' },
  bog_leech: { name: '늪 거머리', role: 'basic', sprite: 'bog_leech_walk', ability: 'burst',
    blurb: '검녹색 점액 덩어리. 터지면 산성 점액이 튀어 오른다.' },
  carnivore_plant: { name: '식인꽃', role: 'elite', sprite: 'carnivore_plant_idle', ability: 'ranged',
    blurb: '뿌리내린 채 가시 씨앗을 사출한다. 천천히 움직이지만 단단하다.' },

  // ── 용암 분지 (ch.4) ───────────────────────────────────
  imp: { name: '화염 임프', role: 'basic', sprite: 'imp_walk', ability: 'charge',
    blurb: '낮게 활공하다 갑자기 가속해 들이박는다.' },
  fire_bat: { name: '화염 박쥐', role: 'basic', sprite: 'fire_bat_fly', ability: null,
    blurb: '불타는 날개로 맹렬히 날아드는 박쥐.' },
  lava_slug: { name: '용암 민달팽이', role: 'basic', sprite: 'lava_slug_idle', ability: 'burst',
    blurb: '뜨거운 마그마 덩어리. 터지면 불씨가 튄다.' },
  magma_golem: { name: '마그마 골렘', role: 'elite', sprite: 'magma_golem_walk', ability: null,
    blurb: '화산암 거인. 균열 사이로 용암이 흐른다. 일격이 묵직하다.' },

  // ── 서리 동굴 (ch.5) ───────────────────────────────────
  frost_wolf: { name: '서리 늑대', role: 'basic', sprite: 'frost_wolf_run', ability: 'charge',
    blurb: '눈보라 속에서 도약해 덮친다.' },
  ice_wraith: { name: '얼음 망령', role: 'basic', sprite: 'ice_wraith_float', ability: 'charge',
    blurb: '한기를 머금고 차갑게 미끄러져 덮친다.' },
  yeti: { name: '예티', role: 'elite', sprite: 'yeti_walk', ability: null,
    blurb: '거대하고 단단한 설인. 일격이 무겁다.' },
  ice_golem: { name: '얼음 골렘', role: 'elite', sprite: 'ice_golem_walk', ability: null,
    blurb: '결정 거인. 부서지지 않는 한기를 두른 거대 정령.' },

  // ── 공허의 균열 (ch.6) ─────────────────────────────────
  void_walker: { name: '공허 워커', role: 'basic', sprite: 'void_walker_walk', ability: 'charge',
    blurb: '소용돌이치는 어둠의 형체. 차원 사이를 미끄러져 다가온다.' },
  void_drifter: { name: '공허 정찰자', role: 'basic', sprite: 'void_drifter_float', ability: 'charge',
    blurb: '차원을 가르며 순간이동하듯 접근해 부딪힌다.' },

  // ── 행동 아키타입 확장 (2026-05-29) ─────────────────────────────────────
  // sprite는 기존 클립 재사용(아트 후속) — 행동/이동 패턴이 정체성을 만든다.
  // `movePattern`: 'weave' | 'orbit_strafe' (systems/movement.js)
  // `summonType`: summoner가 불러내는 enemyType (systems/enemyAbilities.js)
  medusa_head: { name: '메두사 머리', role: 'basic', sprite: 'medusa_head_float', movePattern: 'weave',
    blurb: '좌우로 일렁이며 미끄러져 온다. 직선으로 정렬시킬 수 없다.' },
  powder_skeleton: { name: '화약 해골', role: 'basic', sprite: 'powder_skeleton_walk', ability: 'kamikaze',
    blurb: '짧게 노린 뒤 달려들어 자폭한다. 파편이 사방으로 튄다.' },
  brood_mother: { name: '어미 거미', role: 'elite', sprite: 'brood_mother_walk', ability: 'summoner', summonType: 'spider',
    blurb: '단단한 갑각. 주기적으로 새끼 거미를 낳아 떼로 풀어놓는다.' },
  necromancer: { name: '강령술사', role: 'elite', sprite: 'necromancer_walk', ability: 'summoner', summonType: 'walker',
    blurb: '주기적으로 해골을 일으킨다. 방치하면 끝없이 불어난다.' },
  war_drummer: { name: '전쟁 고수', role: 'elite', sprite: 'war_drummer_walk', ability: 'buffer',
    blurb: '북을 울려 주변 아군을 가속한다. 먼저 끊어야 할 표적.' },
  rune_guardian: { name: '룬 가디언', role: 'elite', sprite: 'rune_guardian_walk', ability: 'shielded',
    blurb: '룬 보호막을 주기적으로 둘러 피해를 흘린다. 막이 걷힐 때를 노려라.' },
  revenant: { name: '원귀', role: 'elite', sprite: 'revenant_float', ability: 'ranged', movePattern: 'orbit_strafe',
    blurb: '거리를 두고 맴돌며 저주탄을 쏜다. 쫓거나 광역으로 끌어내야 한다.' },
  reaper: { name: '사신', role: 'elite', sprite: 'reaper_walk', ability: null,
    blurb: '후반에 나타나는 죽음의 추적자. 거의 죽지 않고 집요하게 따라붙는다. 맞서지 말고 도망쳐라.' },

  // ── 보스 ───────────────────────────────────────────────
  boss_skeleton_king: { name: '해골 군주', role: 'boss', sprite: 'boss_skeleton_king', ability: 'bosscast',
    blurb: 'ch.1 — 왕관을 쓴 거대한 해골. 전방위 뼈 폭풍을 일으킨다.' },
  boss_werewolf_king: { name: '늑대 왕', role: 'boss', sprite: 'boss_werewolf_king', ability: 'bosscast',
    blurb: 'ch.2 — 달빛 아래의 광기. 탄막과 늑대 무리를 부른다.' },
  boss_bog_witch: { name: '늪의 마녀', role: 'boss', sprite: 'boss_bog_witch', ability: 'bosscast',
    blurb: 'ch.3 — 독을 다루는 마녀. 독안개 탄막과 분신을 소환한다.' },
  boss_magma_drake: { name: '마그마 드레이크', role: 'boss', sprite: 'boss_magma_drake', ability: 'bosscast',
    blurb: 'ch.4 — 거대 도마뱀. 마그마 호흡과 화염탄을 퍼붓는다.' },
  boss_ice_queen: { name: '얼음 여왕', role: 'boss', sprite: 'boss_ice_queen', ability: 'bosscast',
    blurb: 'ch.5 — 얼음 왕좌의 지배자. 빙결 가시 탄막을 펼친다.' },
  boss_vampire: { name: '흡혈 백작', role: 'boss', sprite: 'boss_vampire', ability: 'bosscast',
    blurb: '망토 두른 귀족. 박쥐 분신과 핏빛 탄막을 다룬다.' },
  boss_demon: { name: '심연 마룡', role: 'boss', sprite: 'boss_demon', ability: 'bosscast',
    blurb: '뿔 달린 진홍의 거인. 광역 충격파와 자손을 소환한다.' },
  boss_idle: { name: '망령 리치', role: 'boss', sprite: 'boss_idle', ability: 'bosscast',
    blurb: '아케인 구체 위의 리치. 추적 미사일을 난사한다.' },
};

// engine ability key -> player-facing label + description (bestiary UI)
export const ABILITY_INFO = {
  charge: { name: '돌진', desc: '플레이어가 가까우면 잠시 폭발적으로 가속해 달려든다.' },
  ranged: { name: '원거리 공격', desc: '일정 간격으로 플레이어를 향해 탄을 발사한다.' },
  burst: { name: '사망 폭발', desc: '쓰러질 때 사방으로 탄을 터뜨린다.' },
  bosscast: { name: '보스 탄막', desc: '전방위 탄막을 펼치고 이따금 부하를 소환한다.' },
  summoner: { name: '소환', desc: '주기적으로 부하를 불러낸다. 먼저 처치하지 않으면 수가 불어난다.' },
  shielded: { name: '주기 보호막', desc: '이따금 보호막을 둘러 피해 대부분을 막는다. 막이 걷힐 때를 노려라.' },
  kamikaze: { name: '자폭 돌진', desc: '짧게 노린 뒤 달려들어 자폭하며 파편을 흩뿌린다.' },
  buffer: { name: '전열 고무', desc: '주변 아군의 이동 속도를 끌어올린다. 우선 처치 대상.' },
};
