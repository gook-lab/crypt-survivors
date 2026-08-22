// Map room layouts — procedural blueprint patterns per chapter.
// Each room is a 30×17 logical grid (matches 480×270 viewport at 16px tiles).
//
// Schema:
//   id            unique
//   chapter       1-4 (matches biome)
//   name          human label
//   floor         tile pool for ground (sprite names from sprites.js)
//   structures    array of { name, x, y, anchor } — placed once at room load
//   spawn_zones   areas where enemies can spawn (rect [x, y, w, h])
//   player_start  { x, y } default player position
//   exit_points   { north, south, east, west } — connections to next room
//   description   what makes this room interesting

window.ROOM_LAYOUTS = [
  // ─────────────────────────────────────────────────────────────
  // CRYPT (Chapter 1)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'crypt_graveyard', chapter: 1, name: '묘지 입구',
    floor: ['tile_crypt_base', 'tile_crypt_base', 'tile_crypt_base', 'tile_crypt_var', 'tile_crypt_acc_skull'],
    structures: [
      { name: 'prop_castle_tower', x: 240, y: 110, anchor: 'bottom' },
      { name: 'prop_tombstone', x: 60, y: 200, anchor: 'bottom' },
      { name: 'prop_tombstone', x: 100, y: 220, anchor: 'bottom' },
      { name: 'prop_tombstone', x: 140, y: 200, anchor: 'bottom' },
      { name: 'prop_tombstone', x: 380, y: 200, anchor: 'bottom' },
      { name: 'prop_tombstone', x: 420, y: 220, anchor: 'bottom' },
      { name: 'prop_gargoyle', x: 40, y: 240, anchor: 'bottom' },
      { name: 'prop_gargoyle', x: 440, y: 240, anchor: 'bottom' },
      { name: 'prop_candelabra', x: 240, y: 180, anchor: 'bottom' },
      { name: 'prop_pillar_broken', x: 180, y: 240, anchor: 'bottom' },
      { name: 'prop_pillar_broken', x: 300, y: 240, anchor: 'bottom' },
    ],
    spawn_zones: [[0, 30, 480, 100], [0, 200, 100, 70], [380, 200, 100, 70]],
    player_start: { x: 240, y: 200 },
    exit_points: { north: true, south: true, east: false, west: false },
    description: '오래된 묘지. 묘비 사이에서 적이 솟구쳐 오른다.',
  },
  {
    id: 'crypt_sanctum', chapter: 1, name: '내부 성소',
    floor: ['tile_crypt_base', 'tile_crypt_var', 'tile_crypt_var'],
    structures: [
      { name: 'prop_altar_holy', x: 240, y: 80, anchor: 'bottom' },
      { name: 'prop_sarcophagus', x: 120, y: 180, anchor: 'bottom' },
      { name: 'prop_sarcophagus', x: 360, y: 180, anchor: 'bottom' },
      { name: 'prop_candelabra', x: 100, y: 80, anchor: 'bottom' },
      { name: 'prop_candelabra', x: 380, y: 80, anchor: 'bottom' },
      { name: 'prop_pillar_broken', x: 60, y: 250, anchor: 'bottom' },
      { name: 'prop_pillar_broken', x: 420, y: 250, anchor: 'bottom' },
      { name: 'prop_jar_intact', x: 200, y: 230, anchor: 'bottom' },
      { name: 'prop_jar_intact', x: 280, y: 230, anchor: 'bottom' },
    ],
    spawn_zones: [[0, 0, 480, 50], [0, 200, 480, 70]],
    player_start: { x: 240, y: 200 },
    exit_points: { north: false, south: true, east: true, west: true },
    description: '성소 안. 신성한 제단이 회복 효과를 줄 수 있다.',
  },
  {
    id: 'crypt_boss_arena', chapter: 1, name: '왕의 옥좌',
    floor: ['tile_crypt_carpet', 'tile_crypt_carpet', 'tile_crypt_carpet'],
    structures: [
      { name: 'prop_altar_blood', x: 240, y: 80, anchor: 'bottom' },
      { name: 'prop_pillar_broken', x: 80, y: 250, anchor: 'bottom' },
      { name: 'prop_pillar_broken', x: 160, y: 250, anchor: 'bottom' },
      { name: 'prop_pillar_broken', x: 320, y: 250, anchor: 'bottom' },
      { name: 'prop_pillar_broken', x: 400, y: 250, anchor: 'bottom' },
      { name: 'prop_gate_iron', x: 240, y: 268, anchor: 'bottom' },
      { name: 'prop_banner', x: 100, y: 60, anchor: 'top' },
      { name: 'prop_banner', x: 380, y: 60, anchor: 'top' },
      { name: 'prop_bone_pile', x: 200, y: 180, anchor: 'bottom' },
      { name: 'prop_bone_pile', x: 280, y: 180, anchor: 'bottom' },
    ],
    spawn_zones: [],  // boss only
    boss_spawn: { name: 'boss_skeleton_king', x: 240, y: 80 },
    player_start: { x: 240, y: 230 },
    exit_points: { north: false, south: false, east: false, west: false },
    description: '해골 왕의 옥좌. 보스전 전용 룸.',
  },

  // ─────────────────────────────────────────────────────────────
  // FOREST (Chapter 2)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'forest_clearing', chapter: 2, name: '숲 개간지',
    floor: ['tile_forest_base', 'tile_forest_base', 'tile_forest_moss', 'tile_forest_leaves'],
    structures: [
      { name: 'prop_dead_tree', x: 60, y: 230, anchor: 'bottom' },
      { name: 'prop_dead_tree', x: 420, y: 230, anchor: 'bottom' },
      { name: 'prop_mushroom', x: 120, y: 220, anchor: 'bottom' },
      { name: 'prop_mushroom', x: 180, y: 240, anchor: 'bottom' },
      { name: 'prop_mushroom', x: 320, y: 240, anchor: 'bottom' },
      { name: 'prop_stone_wall', x: 240, y: 250, anchor: 'bottom' },
    ],
    spawn_zones: [[0, 0, 480, 270]],  // forest enemies appear from all sides
    player_start: { x: 240, y: 135 },
    exit_points: { north: true, south: true, east: true, west: true },
    description: '안개 자욱한 숲의 빈터. 모든 방향에서 적이 다가온다.',
  },
  {
    id: 'forest_shrine_room', chapter: 2, name: '버려진 사당',
    floor: ['tile_forest_base', 'tile_forest_moss', 'tile_forest_base'],
    structures: [
      { name: 'prop_forest_shrine', x: 240, y: 130, anchor: 'bottom' },
      { name: 'prop_altar_nature', x: 120, y: 200, anchor: 'bottom' },
      { name: 'prop_altar_nature', x: 360, y: 200, anchor: 'bottom' },
      { name: 'prop_dead_tree', x: 80, y: 270, anchor: 'bottom' },
      { name: 'prop_dead_tree', x: 400, y: 270, anchor: 'bottom' },
      { name: 'prop_stone_wall', x: 60, y: 60, anchor: 'top' },
      { name: 'prop_stone_wall', x: 420, y: 60, anchor: 'top' },
      { name: 'prop_jar_intact', x: 200, y: 210, anchor: 'bottom' },
      { name: 'prop_jar_intact', x: 280, y: 210, anchor: 'bottom' },
    ],
    spawn_zones: [[0, 0, 480, 50], [0, 220, 480, 50]],
    player_start: { x: 240, y: 150 },
    exit_points: { north: true, south: false, east: true, west: true },
    description: '고대 자연 신을 모시는 사당. 자연 제단이 강력한 효과를 준다.',
  },

  // ─────────────────────────────────────────────────────────────
  // VOLCANO (Chapter 3)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'volcano_caldera', chapter: 3, name: '용암 분지',
    floor: ['tile_volcano_base', 'tile_volcano_base', 'tile_volcano_crack'],
    structures: [
      { name: 'prop_lava_crack', x: 120, y: 80, anchor: 'center' },
      { name: 'prop_lava_crack', x: 360, y: 80, anchor: 'center' },
      { name: 'prop_lava_crack', x: 240, y: 200, anchor: 'center' },
      { name: 'prop_obsidian_pillar', x: 60, y: 250, anchor: 'bottom' },
      { name: 'prop_obsidian_pillar', x: 420, y: 250, anchor: 'bottom' },
      { name: 'prop_fire_altar', x: 240, y: 130, anchor: 'bottom' },
      { name: 'prop_brazier', x: 120, y: 250, anchor: 'bottom' },
      { name: 'prop_brazier', x: 360, y: 250, anchor: 'bottom' },
      { name: 'prop_bone_pile', x: 80, y: 130, anchor: 'bottom' },
      { name: 'prop_barrel_intact', x: 180, y: 220, anchor: 'bottom' },
      { name: 'prop_barrel_intact', x: 300, y: 220, anchor: 'bottom' },
    ],
    spawn_zones: [[0, 0, 480, 30], [0, 240, 480, 30]],
    hazards: [
      { type: 'lava', x: 120, y: 80, r: 12, dps: 5 },
      { type: 'lava', x: 360, y: 80, r: 12, dps: 5 },
      { type: 'lava', x: 240, y: 200, r: 12, dps: 5 },
    ],
    player_start: { x: 240, y: 135 },
    exit_points: { north: true, south: true, east: false, west: false },
    description: '용암 균열이 화면에 흩어져 있다. 밟으면 화상.',
  },
  {
    id: 'volcano_forge', chapter: 3, name: '대장간 유적',
    floor: ['tile_volcano_base', 'tile_volcano_crack'],
    structures: [
      { name: 'prop_obsidian_pillar', x: 100, y: 100, anchor: 'top' },
      { name: 'prop_obsidian_pillar', x: 380, y: 100, anchor: 'top' },
      { name: 'prop_fire_altar', x: 240, y: 180, anchor: 'bottom' },
      { name: 'prop_brazier', x: 80, y: 230, anchor: 'bottom' },
      { name: 'prop_brazier', x: 200, y: 230, anchor: 'bottom' },
      { name: 'prop_brazier', x: 280, y: 230, anchor: 'bottom' },
      { name: 'prop_brazier', x: 400, y: 230, anchor: 'bottom' },
      { name: 'prop_barrel_intact', x: 60, y: 80, anchor: 'bottom' },
      { name: 'prop_barrel_intact', x: 420, y: 80, anchor: 'bottom' },
      { name: 'prop_crate_intact', x: 60, y: 150, anchor: 'bottom' },
      { name: 'prop_crate_intact', x: 420, y: 150, anchor: 'bottom' },
    ],
    spawn_zones: [[40, 40, 400, 200]],
    player_start: { x: 240, y: 135 },
    exit_points: { north: true, south: true, east: true, west: true },
    description: '잊혀진 화염 대장간. 깨뜨릴 수 있는 통/상자가 가득.',
  },

  // ─────────────────────────────────────────────────────────────
  // ICE (Chapter 4)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'ice_cavern', chapter: 4, name: '빙결 동굴',
    floor: ['tile_ice_base', 'tile_ice_base', 'tile_ice_crack_new', 'tile_ice_snow_drift'],
    structures: [
      { name: 'prop_ice_spike', x: 60, y: 240, anchor: 'bottom' },
      { name: 'prop_ice_spike', x: 420, y: 240, anchor: 'bottom' },
      { name: 'prop_ice_spike', x: 120, y: 260, anchor: 'bottom' },
      { name: 'prop_ice_spike', x: 360, y: 260, anchor: 'bottom' },
      { name: 'prop_frozen_statue', x: 240, y: 130, anchor: 'bottom' },
      { name: 'prop_ice_crystal', x: 80, y: 130, anchor: 'bottom' },
      { name: 'prop_ice_crystal', x: 180, y: 100, anchor: 'bottom' },
      { name: 'prop_ice_crystal', x: 300, y: 100, anchor: 'bottom' },
      { name: 'prop_ice_crystal', x: 400, y: 130, anchor: 'bottom' },
    ],
    spawn_zones: [[0, 0, 480, 60], [0, 200, 480, 70]],
    player_start: { x: 240, y: 200 },
    exit_points: { north: true, south: true, east: true, west: true },
    description: '얼음 결정 군집. 결정을 파괴하면 빙결 폭발.',
  },
  {
    id: 'ice_throne', chapter: 4, name: '얼음 옥좌',
    floor: ['tile_ice_base', 'tile_ice_snow_drift', 'tile_sanctuary_inlay'],
    structures: [
      { name: 'prop_frozen_statue', x: 100, y: 250, anchor: 'bottom' },
      { name: 'prop_frozen_statue', x: 380, y: 250, anchor: 'bottom' },
      { name: 'prop_ice_spike', x: 60, y: 80, anchor: 'top' },
      { name: 'prop_ice_spike', x: 420, y: 80, anchor: 'top' },
      { name: 'prop_ice_crystal', x: 240, y: 60, anchor: 'top' },
      { name: 'prop_altar_arcane', x: 240, y: 200, anchor: 'bottom' },
    ],
    boss_spawn: { name: 'boss_frost_dragon', x: 240, y: 100 },
    spawn_zones: [],
    player_start: { x: 240, y: 230 },
    exit_points: { north: false, south: false, east: false, west: false },
    description: '얼음 여왕의 옥좌. 보스 빙룡과 결판.',
  },

  // ─────────────────────────────────────────────────────────────
  // SPECIAL ROOMS (treasure / shop / shrine)
  // ─────────────────────────────────────────────────────────────
  {
    id: 'treasure_room', chapter: 0, name: '보물 방',
    floor: ['tile_sanctuary_inlay', 'tile_sanctuary_base'],
    structures: [
      { name: 'prop_castle_tower', x: 240, y: 80, anchor: 'bottom' },
      { name: 'pickup_chest_gold', x: 200, y: 150, anchor: 'bottom' },
      { name: 'pickup_chest', x: 160, y: 200, anchor: 'bottom' },
      { name: 'pickup_chest', x: 280, y: 200, anchor: 'bottom' },
      { name: 'prop_jar_intact', x: 80, y: 220, anchor: 'bottom' },
      { name: 'prop_jar_intact', x: 120, y: 220, anchor: 'bottom' },
      { name: 'prop_jar_intact', x: 360, y: 220, anchor: 'bottom' },
      { name: 'prop_jar_intact', x: 400, y: 220, anchor: 'bottom' },
      { name: 'prop_barrel_intact', x: 60, y: 150, anchor: 'bottom' },
      { name: 'prop_barrel_intact', x: 420, y: 150, anchor: 'bottom' },
      { name: 'prop_candelabra', x: 240, y: 150, anchor: 'bottom' },
    ],
    spawn_zones: [],
    player_start: { x: 240, y: 230 },
    exit_points: { north: false, south: true, east: false, west: false },
    description: '비밀 보물 방. 적이 없고 보상만 가득.',
  },
  {
    id: 'shrine_room', chapter: 0, name: '신성 사당',
    floor: ['tile_sanctuary_base', 'tile_sanctuary_inlay', 'tile_sanctuary_base'],
    structures: [
      { name: 'prop_altar_holy', x: 240, y: 130, anchor: 'bottom' },
      { name: 'prop_candelabra', x: 180, y: 130, anchor: 'bottom' },
      { name: 'prop_candelabra', x: 300, y: 130, anchor: 'bottom' },
      { name: 'prop_banner', x: 80, y: 60, anchor: 'top' },
      { name: 'prop_banner', x: 400, y: 60, anchor: 'top' },
      { name: 'prop_fountain', x: 240, y: 230, anchor: 'bottom' },
      { name: 'prop_well', x: 100, y: 230, anchor: 'bottom' },
      { name: 'prop_well', x: 380, y: 230, anchor: 'bottom' },
    ],
    spawn_zones: [],
    player_start: { x: 240, y: 200 },
    exit_points: { north: false, south: true, east: false, west: false },
    description: '평화로운 성소. 풀 회복 + 무료 상점 NPC가 있다.',
  },
];

// Chapter progression — what rooms can follow what
window.ROOM_GRAPH = {
  1: { // crypt chapter
    start: 'crypt_graveyard',
    rooms: ['crypt_graveyard', 'crypt_sanctum'],
    boss: 'crypt_boss_arena',
    secret: ['treasure_room', 'shrine_room'],
    secret_chance: 0.15,
  },
  2: { // forest
    start: 'forest_clearing',
    rooms: ['forest_clearing', 'forest_shrine_room'],
    secret: ['treasure_room', 'shrine_room'],
    secret_chance: 0.20,
  },
  3: { // volcano
    start: 'volcano_caldera',
    rooms: ['volcano_caldera', 'volcano_forge'],
    secret: ['treasure_room', 'shrine_room'],
    secret_chance: 0.18,
  },
  4: { // ice
    start: 'ice_cavern',
    rooms: ['ice_cavern'],
    boss: 'ice_throne',
    secret: ['treasure_room', 'shrine_room'],
    secret_chance: 0.25,
  },
};
