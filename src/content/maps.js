// Stage maps — DATA. Each map carries a floor-tile bag, a biome decoration
// prop pool, a biome enemy pool (`enemies` common + `elites` tougher, the
// spawn director picks from these), and the biome boss.
//
// Floor tiles use the unified tile sets (assets/art/tiles_unified.js): a
// cohesive base / variant / accent trio per biome instead of a noisy 6-tile
// mix. `props` are biome scenery (assets/art/structures*.js) the renderer
// scatters as static decoration. `bag` expands a weighted tile spec into the
// flat array the renderer hashes each cell into.

import { roomsForBiome } from './rooms.js';

const bag = (spec) => spec.flatMap(([tile, n]) => Array(n).fill(tile));

export const MAPS = [
  {
    id: 'dungeon', chapter: 1,
    name: '고대 던전',
    desc: '돌과 균열로 뒤덮인 지하 — 이끼 정원이 잠식한 폐허',
    // forest(구 ch.2)를 흡수: wolf/goblin 포함 + overgrown zone(이끼 정원).
    // Phase D 신규: grave_hound(basic 돌진), bone_archer(elite 원거리).
    enemies: ['walker', 'runner', 'bat', 'spider', 'carrion_crow', 'wolf', 'goblin', 'grave_hound', 'medusa_head', 'powder_skeleton'],
    // chimera(150hp 원거리 elite)는 ch.2/3 티어라 스타터 챕터엔 과함 — 제외.
    // bone_archer(58hp)는 ch.1용 신규 elite로 적정.
    // 행동 확장: brood_mother(분열), necromancer(소환), war_drummer(버프).
    elites: ['brute', 'elite', 'giant_spider', 'bone_archer', 'brood_mother', 'necromancer', 'war_drummer'],
    boss: { sprite: 'boss_skeleton_king', name: '해골 군주' },
    // VS-style 균일 베이스: tiles_vs.js가 PixelLab crypt.png의 wang_0/wang_15
    // 두 균일 sub-tile만 crop해 a/b로 등록함 — 둘 다 transition 없는 단일
    // stone 텍스처라 hash 픽해도 지그재그가 안 생긴다. tile_nat_crypt_*
    // variant들은 PixelLab create_object로 균일 stone variant 더 만들어 섞음
    // (tiles_vs.js의 TILES_VS_LOAD에서 등록 — load 실패 시 ASCII fallback).
    // ch.1 = Inlaid-Library 수직 슬라이스 (Workstream B). 단일 베이스 대신
    // PixelLab uniform stone variants(tiles_vs_extra.js: a2 organic noise /
    // a4 dark cobblestone)를 섞어 지그재그 없는 텍스처 다양성. 셋 다 transition
    // 없는 균일 타일이라 hash 픽해도 Wang grid 패턴이 안 생긴다(메모리
    // wang-tileset-weighting-pitfall은 Wang 인덱스 가중에만 해당 — 균일 타일
    // 가중은 안전). tile_nat_crypt_b(어두운 stone)는 graveyard tint 곱 시 검은
    // block 인상이라 bag에서 제외.
    tiles: bag([
      ['tile_nat_crypt_a', 6],
      ['tile_nat_crypt_a2', 4],
      ['tile_nat_crypt_a4', 3],
    ]),
    // VS Inlaid-Library 장식 바닥 띠 — rowInterval행마다 ornate medallion
    // 타일을 한 줄 깔아 단조로운 바닥에 건축적 리듬을 준다. zone tint가 그대로
    // 곱해져 graveyard(녹)/colonnade(아이보리)/sanctum(보라) 띠가 각각 다른
    // 색으로 읽힌다. renderer.js updateFloor ASCII 분기에서 cy % rowInterval로
    // 적용 (PNG Wang 경로는 미적용 — 현재 챕터는 전부 ASCII 경로).
    inlaidBand: { tile: 'tile_nat_crypt_medallion', rowInterval: 6 },
    rooms: roomsForBiome('crypt'),
    // VS-like 동네 정체성 — 4×4 region cluster마다 다른 zone이 깔리고,
    // PNG sub-tile 인덱스 가중 + tint로 시각 분기. graveyard는 풀끼(녹색),
    // colonnade는 매끄러운 marble(약간 밝음), inner-sanctum은 어두운 보랏빛.
    // overgrown = 구 forest를 던전에 흡수한 4번째 zone (이끼 정원). 녹색 mossy
    // tint + 고목/버섯/이끼 사당 prop nook(rooms.js에서 zone:'overgrown'로
    // 재태깅) + wolf/goblin이 이 구역에 어울린다.
    zones: ['graveyard', 'colonnade', 'inner-sanctum', 'overgrown'],
    // Zone 차이를 시각적으로 더 명확하게 — 사용자 평가 "이질감이 약함" 반영.
    // graveyard는 풀끼 도는 mossy stone (green-leaning), colonnade는 따뜻한
    // marble (warm ivory), sanctum은 어두운 보랏빛, overgrown은 깊은 이끼 녹색.
    zoneTints: {
      default: { tint: 0xd8d4dc },
      graveyard: { tint: 0x88c290 },
      colonnade: { tint: 0xf2e6c8 },
      'inner-sanctum': { tint: 0x5a4a78 },
      overgrown: { tint: 0x6ea862 },        // deep mossy green (구 old-grove)
    },
    ambient: { vignette: 0.35, fog: 'light' },
  },
  {
    id: 'swamp', chapter: 2,
    name: '독무 늪지',
    desc: '진흙과 썩은 물이 고인 늪',
    enemies: ['frog', 'bog_zombie', 'wisp', 'bog_leech'],
    elites: ['chimera', 'brute', 'carnivore_plant', 'war_drummer'],
    boss: { sprite: 'boss_bog_witch', name: '늪의 마녀' },
    // PixelLab uniform variants(mud/moss) + 기존 water 베이스 섞어 다양성.
    tiles: bag([['tile_water_hd', 4], ['tile_nat_swamp_mud', 4], ['tile_nat_swamp_moss', 3]]),
    // 가라앉은 널빤지 보드워크 띠 — 늪 위 건축 리듬.
    inlaidBand: { tile: 'tile_nat_swamp_planks', rowInterval: 7 },
    rooms: roomsForBiome('swamp'),
    zones: ['mire', 'rot-pool', 'witch-grove'],
    zoneTints: {
      default: { tint: 0xd8d4dc },
      mire: { tint: 0x5a7050 },            // dark muddy green
      'rot-pool': { tint: 0x8aa888 },      // sickly pale green
      'witch-grove': { tint: 0x70688c },   // dim violet-grey
    },
    zoneClusterSize: 4,   // 표준
    ambient: { vignette: 0.4, fog: 'light' },
  },
  {
    id: 'volcano', chapter: 3,
    name: '용암 분지',
    desc: '재가 흩날리는 화산 암반',
    enemies: ['imp', 'fire_bat', 'lava_slug', 'powder_skeleton'],
    elites: ['chimera', 'elite', 'magma_golem', 'necromancer'],
    boss: { sprite: 'boss_magma_drake', name: '마그마 드레이크' },
    // 기존 ASCII variant(ember) 활용 — 잿빛 암반에 불씨 specks 섞어 다양성.
    tiles: bag([['tile_nat_volcano_a', 8], ['tile_nat_volcano_ember', 1]]),
    // 용암 맥 띠 — ember 타일을 넓은 간격(8)으로 깔아 갈라진 마그마 벨트.
    inlaidBand: { tile: 'tile_nat_volcano_ember', rowInterval: 8 },
    rooms: roomsForBiome('volcano'),
    zones: ['lava-flow', 'ash-plain', 'forge-ruin'],
    zoneTints: {
      default: { tint: 0xd8d4dc },
      'lava-flow': { tint: 0xd47a4a },     // warm orange-red
      'ash-plain': { tint: 0x807870 },     // ash grey
      'forge-ruin': { tint: 0xa8784a },    // copper warm
    },
    zoneClusterSize: 4,
    ambient: { vignette: 0.38, fog: 'light' },
  },
  {
    id: 'ice', chapter: 4,
    name: '서리 동굴',
    desc: '갈라진 얼음과 눈이 덮인 동굴',
    enemies: ['frost_wolf', 'ice_wraith', 'yeti'],
    elites: ['yeti', 'chimera', 'ice_golem', 'rune_guardian'],
    boss: { sprite: 'boss_ice_queen', name: '얼음 여왕' },
    // 기존 ASCII variant(crack) 활용 — 균일 얼음에 갈라짐 섞어 다양성.
    tiles: bag([['tile_nat_ice_a', 8], ['tile_nat_ice_crack', 2]]),
    // 얼어붙은 사당 인레이 띠 — 미사용 sanctuary_inlay(장식 marble inlay)를
    // 재활용해 빙결 신전 바닥 리듬.
    inlaidBand: { tile: 'tile_nat_sanctuary_inlay', rowInterval: 7 },
    rooms: roomsForBiome('ice'),
    zones: ['frost-cavern', 'glacier', 'frozen-shrine'],
    zoneTints: {
      default: { tint: 0xd8d4dc },
      'frost-cavern': { tint: 0xa8c0d8 },  // pale ice blue
      glacier: { tint: 0x6890b0 },         // deep blue
      'frozen-shrine': { tint: 0xc8c0e0 },  // pale lavender
    },
    zoneClusterSize: 5,   // ice: 좁은 동굴 느낌이지만 빙하 zone은 광활
    ambient: { vignette: 0.36, fog: 'light' },
  },
  {
    id: 'void', chapter: 5,
    name: '공허의 균열',
    desc: '별과 성운이 흐르는 차원의 끝 — 최종 도전',
    enemies: ['void_walker', 'void_drifter', 'ice_wraith', 'wisp', 'medusa_head'],
    elites: ['chimera', 'yeti', 'magma_golem', 'ice_golem', 'revenant', 'rune_guardian'],
    boss: { sprite: 'boss_idle', name: '망령 리치' },
    // PixelLab nebula variant + 기존 void 베이스 — 우주 다양성. (stars 타일은
    // 투명+어두운 점으로 나와 floor용으로 부적합해 제외.)
    tiles: bag([['tile_void', 5], ['tile_void_nebula', 3]]),
    // 빛나는 아케인 룬 인레이 띠 — 차원 신전 바닥 리듬.
    inlaidBand: { tile: 'tile_void_rune', rowInterval: 7 },
    rooms: roomsForBiome('void'),
    zones: ['rift', 'nebula', 'singularity'],
    zoneTints: {
      default: { tint: 0xd8d4dc },
      rift: { tint: 0x8060b0 },            // bright purple
      nebula: { tint: 0x6068a8 },          // cosmic blue
      singularity: { tint: 0x303048 },     // near-black violet
    },
    zoneClusterSize: 6,   // void: 광활한 우주 — zone 하나 안에서 한참 머묾
    ambient: { vignette: 0.5, fog: 'light' },
  },
];
