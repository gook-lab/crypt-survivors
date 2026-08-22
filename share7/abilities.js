// Enemy & boss abilities — what each one does in combat.
// Used by bestiary.html to display behavior notes. Game engine can read this
// as the AI / attack policy lookup table.

window.ABILITIES = {
  // ── Crypt ─────────────────────────────────────────────
  crypt_archer:    { name: '뼈 화살', notes: '직선 화살 발사 (사거리 200px), 3초마다.' },
  crypt_wraith:    { name: '둔화 통과', notes: '접촉 시 0.5초 둔화. 벽 무시.' },
  crypt_bone_pile: { name: '죽음의 메아리', notes: '처치 시 8방향 뼈 파편 폭발.' },
  crypt_keeper:    { name: '광역 내리치기', notes: '근접 시 1.2초 차징 후 광역 360° 일격.' },

  // ── Forest ────────────────────────────────────────────
  forest_wolf:    { name: '도약 공격', notes: '거리 80px 내에서 빠른 돌진.' },
  forest_vine:    { name: '뿌리 잡기', notes: '접촉 시 1초 정지(스턴 + 출혈).' },
  forest_owl:     { name: '급강하', notes: '공중에서 직선 강하 공격. 회피 어렵다.' },
  forest_treant:  { name: '가지 휘두르기', notes: '180° 호 광역 일격 + 넉백.' },

  // ── Volcano ───────────────────────────────────────────
  volcano_imp:   { name: '불씨 투척', notes: '소형 화염구 던지기. 적중 시 1초 화상.' },
  volcano_slug:  { name: '화상 오라', notes: '접촉 시 매초 화상 데미지.' },
  volcano_ash:   { name: '재의 폭발', notes: '죽으면 6px 잿더미 폭발 (광역 약한 화상).' },
  volcano_brute: { name: '용암 망치', notes: '거대 망치 내리치기 + 8px 광역 + 화상.' },

  // ── Ice ───────────────────────────────────────────────
  ice_wisp:       { name: '통과 둔화', notes: '접촉 시 1초 둔화.' },
  ice_spider:     { name: '빙결 침', notes: '곡선 침 발사. 적중 시 25% 동결.' },
  ice_golem:      { name: '빙결 충격파', notes: '내리치면 12px 광역 빙결 + 넉백.' },
  ice_frost_lich: { name: '빙결 미사일', notes: '추적하는 빙결 화살 (호밍). 적중 시 100% 동결.' },

  // ── Bosses (페이즈) ─────────────────────────────────────
  boss_skeleton_king: {
    phases: 3,
    abilities: [
      { name: '뼈 폭풍', notes: '12 방향 뼈 화살 - 70% HP 이상.' },
      { name: '군세 소환', notes: '근처에 미니 해골 4기 소환 - 70% 이하.' },
      { name: '왕의 분노', notes: '광역 360° 강한 일격 - 30% 이하.' },
    ],
  },
  boss_orc_king: {
    phases: 2,
    abilities: [
      { name: '광폭 돌진', notes: '플레이어 향해 일자 충돌 돌진 (8px 사거리).' },
      { name: '도끼 일제 사격', notes: '6 방향 부메랑 도끼 던지기 - 50% 이하.' },
    ],
  },
  boss_vampire: {
    phases: 3,
    abilities: [
      { name: '박쥐 분신', notes: '4기 박쥐 분신 소환 - 90% 이상.' },
      { name: '흡혈 베기', notes: '근접 공격 시 받은 피해의 30% 회복 - 60% 이하.' },
      { name: '핏빛 폭발', notes: '죽음 직전 광역 핏빛 폭발 - 20% 이하.' },
    ],
  },
  boss_treant_lord: {
    phases: 2,
    abilities: [
      { name: '뿌리 가시', notes: '8 방향 땅속 뿌리 솟구침 (3초 차징).' },
      { name: '회복의 진동', notes: '15초마다 자가 HP 5% 회복 + 적 회복 - 50% 이하.' },
    ],
  },
  boss_pyrolord: {
    phases: 3,
    abilities: [
      { name: '화염 회오리', notes: '4기 회오리가 플레이어 추적 - 80% 이상.' },
      { name: '화염벽 격자', notes: '맵을 4분할하는 화염벽 - 50% 이하.' },
      { name: '불사조 강림', notes: '죽기 직전 분신 1회 부활 - 1% HP.' },
    ],
  },
  boss_demon: {
    phases: 3,
    abilities: [
      { name: '충격파', notes: '발 굴림 광역 360°, 2초 차징.' },
      { name: '자손 소환', notes: '데몬 임프 3기 소환 - 60% 이하.' },
      { name: '지옥 강하', notes: '하늘에서 불기둥 - 30% 이하.' },
    ],
  },
  boss_frost_dragon: {
    phases: 3,
    abilities: [
      { name: '빙결 브레스', notes: '전방 부채꼴 빙결 브레스 (3초 지속).' },
      { name: '공중 폭격', notes: '하늘로 솟구쳐 8개 얼음 조각 떨어뜨림 - 60% 이하.' },
      { name: '동결 폭풍', notes: '광역 동결 후 모든 적 폭발 - 25% 이하.' },
    ],
  },
  boss_ice_queen: {
    phases: 2,
    abilities: [
      { name: '빙결 가시 솟구침', notes: '플레이어 근처에 4기 가시 솟구침.' },
      { name: '동결 영역', notes: '맵 중앙에 동결 원 - 50% 이하.' },
    ],
  },
  boss_idle: {
    phases: 2,
    abilities: [
      { name: '아케인 미사일', notes: '6 방향 자동 추적 미사일.' },
      { name: '텔레포트', notes: '체력 30% 이하부터 빈번 사용.' },
    ],
  },
  boss_werewolf_king: {
    phases: 2,
    abilities: [
      { name: '월광 광폭화', notes: '받는 피해의 30%만큼 공격 속도 증가.' },
      { name: '늑대 군단', notes: '늑대 6기 소환 - 40% 이하.' },
    ],
  },
  boss_bog_witch: {
    phases: 2,
    abilities: [
      { name: '독 안개', notes: '맵에 독 영역 3개 생성.' },
      { name: '분신', notes: '5초간 무적 분신 1기 소환 - 60% 이하.' },
    ],
  },
  boss_magma_drake: {
    phases: 2,
    abilities: [
      { name: '마그마 호흡', notes: '전방 광역 마그마 호흡.' },
      { name: '돌진 도약', notes: '플레이어 위에 떨어지는 도약 (낙하 시 광역).' },
    ],
  },
  boss_treant: {
    phases: 2,
    abilities: [
      { name: '식물 군중', notes: '광역 식물 군중 + 적 군중 강화.' },
      { name: '회복 진동', notes: '맵의 적 모두 HP 회복 - 50% 이하.' },
    ],
  },
};
