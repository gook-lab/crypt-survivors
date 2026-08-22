// Per-enemy data: name, role (basic|elite|boss), HP/SPD baseline, blurb.
// Sprite key === window.SPRITES key. Stats are baseline at chapter 1 — engine
// scales them up by chapter difficulty.

window.BESTIARY = {
  // ── Crypt (망자의 묘소) ─────────────────────────────────
  crypt_archer:   { name: '해골 궁수',   role: 'basic',  hp: 20,  spd: 70,  blurb: '낡은 활을 든 해골. 멀리서 화살을 쏜다.' },
  crypt_wraith:   { name: '망령',       role: 'basic',  hp: 30,  spd: 90,  blurb: '벽을 통과하며 다가오는 영혼. 접촉 시 잠시 둔화.' },
  crypt_bone_pile:{ name: '뼈 더미',     role: 'basic',  hp: 40,  spd: 30,  blurb: '느리지만 단단하다. 처치 시 뼈가 흩어진다.' },
  crypt_keeper:   { name: '묘소 수호자', role: 'elite',  hp: 180, spd: 60,  blurb: '두 손에 큰 곡괭이를 든 거인. 광역 내리치기.' },

  // ── Forest (저주받은 숲) ──────────────────────────────
  forest_wolf:    { name: '저주받은 늑대', role: 'basic', hp: 28, spd: 130, blurb: '안개 속에서 튀어나오는 사냥꾼.' },
  forest_vine:    { name: '덩굴 공포',     role: 'basic', hp: 35, spd: 50,  blurb: '땅에서 솟아 플레이어를 휘감으려 한다.' },
  forest_owl:     { name: '저주받은 부엉이', role: 'basic', hp: 18, spd: 110, blurb: '공중에서 급강하해 발톱으로 공격.' },
  forest_treant:  { name: '고대 트렌트',    role: 'elite', hp: 220, spd: 40,  blurb: '걸어다니는 나무. 가지를 휘둘러 광역 피해.' },

  // ── Volcano (화산 분지) ───────────────────────────────
  volcano_imp:    { name: '화염 임프',    role: 'basic',  hp: 22, spd: 120, blurb: '날개 달린 작은 악마. 불씨를 던진다.' },
  volcano_slug:   { name: '마그마 슬러그', role: 'basic',  hp: 50, spd: 30,  blurb: '뜨거운 마그마 덩어리. 닿으면 화상.' },
  volcano_ash:    { name: '재 보행자',    role: 'basic',  hp: 32, spd: 75,  blurb: '재로 된 그림자. 죽으면 잿더미 폭발.' },
  volcano_brute:  { name: '용암 거인',    role: 'elite',  hp: 260, spd: 55, blurb: '몸에 균열이 가 있어 용암이 흐른다. 내리치기 + 화상.' },

  // ── Ice (얼음 동굴) ─────────────────────────────────────
  ice_wisp:       { name: '빙결 위스프', role: 'basic', hp: 14, spd: 140, blurb: '얼음 결정 영혼. 통과 시 둔화.' },
  ice_spider:     { name: '서리 거미',   role: 'basic', hp: 32, spd: 95,  blurb: '빙결액을 뿌리는 거미. 적중 시 잠시 동결.' },
  ice_golem:      { name: '얼음 골렘',   role: 'elite', hp: 240, spd: 50, blurb: '거대 결정 인간. 휘두르면 빙결 충격파.' },
  ice_frost_lich: { name: '서리 리치',   role: 'elite', hp: 200, spd: 70, blurb: '얼음 결정 위에 떠 있는 리치. 빙결 화살.' },

  // ── Bosses (각 챕터 보스) ───────────────────────────────
  boss_skeleton_king: { name: '해골 왕', role: 'boss', hp: 4800, spd: 65, blurb: '왕관을 쓴 거대한 해골. 광역 뼈 폭풍 + 부활.' },
  boss_orc_king:      { name: '오크 왕', role: 'boss', hp: 5600, spd: 75, blurb: '두 손에 거대 도끼. 광폭화 + 일제 사격 소환.' },
  boss_vampire:       { name: '뱀파이어 로드', role: 'boss', hp: 5200, spd: 80, blurb: '망토 두른 귀족. 박쥐 분신 + 흡혈 베기.' },
  boss_treant_lord:   { name: '트렌트 군주', role: 'boss', hp: 6400, spd: 45, blurb: '거대한 고대 나무. 가시 덩굴 + 회복.' },
  boss_pyrolord:      { name: '불의 군주', role: 'boss', hp: 6000, spd: 60, blurb: '화염을 두른 악마. 화염 회오리 + 화염벽.' },
  boss_demon:         { name: '데몬', role: 'boss', hp: 5800, spd: 70, blurb: '뿔 달린 진홍의 거인. 광역 충격파 + 자손 소환.' },
  boss_frost_dragon:  { name: '빙룡', role: 'boss', hp: 7200, spd: 55, blurb: '거대한 얼음 용. 빙결 브레스 + 공중 폭격.' },
  boss_ice_queen:     { name: '얼음 여왕', role: 'boss', hp: 5400, spd: 75, blurb: '얼음 왕좌의 지배자. 빙결 가시 + 동결 영역.' },
  boss_idle:          { name: '리치 로드', role: 'boss', hp: 5000, spd: 65, blurb: '아케인 구체 위에 앉은 리치. 보라 미사일 + 텔레포트.' },

  // 추가 보스(상자/숨겨진 룸 드랍)
  boss_werewolf_king: { name: '늑대인간 왕', role: 'boss', hp: 4200, spd: 110, blurb: '달빛 아래의 광기. 충돌 돌진 + 다발 소환.' },
  boss_bog_witch:     { name: '늪의 마녀',   role: 'boss', hp: 3800, spd: 60,  blurb: '독을 다루는 마녀. 독 안개 + 분신.' },
  boss_magma_drake:   { name: '마그마 드레이크', role: 'boss', hp: 6200, spd: 70, blurb: '거대 도마뱀. 마그마 호흡 + 도약.' },
  boss_treant:        { name: '고대 트렌트', role: 'boss', hp: 5500, spd: 40, blurb: '오래된 숲의 지배자. 식물 군중 + 회복 진동.' },
};

// Map each biome to its enemy pool. The director picks weighted random
// based on chapter difficulty time curve.
window.BIOME_POOLS = {
  crypt:   { basic: ['crypt_archer','crypt_wraith','crypt_bone_pile'], elite: ['crypt_keeper'],     bosses: ['boss_skeleton_king', 'boss_orc_king'] },
  forest:  { basic: ['forest_wolf','forest_vine','forest_owl'],         elite: ['forest_treant'],   bosses: ['boss_vampire', 'boss_treant_lord'] },
  volcano: { basic: ['volcano_imp','volcano_slug','volcano_ash'],       elite: ['volcano_brute'],   bosses: ['boss_pyrolord', 'boss_demon'] },
  ice:     { basic: ['ice_wisp','ice_spider'],                          elite: ['ice_golem','ice_frost_lich'], bosses: ['boss_frost_dragon', 'boss_ice_queen'] },
};
