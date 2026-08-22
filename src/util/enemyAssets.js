// PixelLab enemy / boss sprite registry. Mirrors heroAssets but for the
// codebase's enemy sprite keys (from content/bestiary.js — `sprite` field).
// Renderer's applySprite checks enemyAssetUrl before the ASCII path.
//
// Static east/west PNGs only for Phase 1 — walking animation can be added
// later via the same idle/walk/fps shape used in heroAssets.js. Even static
// pixel art is a major visual upgrade over ASCII for enemies that fill
// the screen during a typical run.
//
// Source assets live in public/enemies/<key>_<dir>.png.

const enemyDir = (key) => ({
  east: `/enemies/${key}_east.png`,
  west: `/enemies/${key}_west.png`,
});

export const ENEMY_ASSETS = {
  // Ch.1 dungeon
  walker_walk: enemyDir('walker'),
  runner_walk: enemyDir('runner'),
  bat_fly: enemyDir('bat'),
  spider_walk: enemyDir('spider'),
  carrion_crow_fly: enemyDir('carrion_crow'),
  brute_walk: enemyDir('brute'),
  bone_archer_walk: enemyDir('bone_archer'),   // Phase D — 해골 궁수
  grave_hound_run: enemyDir('grave_hound'),    // Phase D — 망자의 사냥개
  // Ch.2 forest
  wolf_run: enemyDir('wolf'),
  goblin_walk: enemyDir('goblin'),
  chimera_walk: enemyDir('chimera'),
  // Ch.3 swamp
  frog_idle: enemyDir('frog'),
  carnivore_plant_idle: enemyDir('carnivore_plant'),
  // Ch.4 lava
  imp_walk: enemyDir('imp'),
  magma_golem_walk: enemyDir('magma_golem'),
  // Ch.5 ice
  yeti_walk: enemyDir('yeti'),
  ice_golem_walk: enemyDir('ice_golem'),
  // Ch.6 void
  void_walker_walk: enemyDir('void_walker'),
  void_drifter_float: enemyDir('void_drifter'),
  // Cross-biome
  wisp_float: enemyDir('wisp'),
  // Flyers re-arted as proper flying creatures (2026-05-29)
  hornet_fly: enemyDir('hornet'),
  fire_bat_fly: enemyDir('fire_bat'),
  // 행동 아키타입 확장 (2026-05-29) — 전용 스프라이트
  medusa_head_float: enemyDir('medusa_head'),
  powder_skeleton_walk: enemyDir('powder_skeleton'),
  brood_mother_walk: enemyDir('brood_mother'),
  necromancer_walk: enemyDir('necromancer'),
  war_drummer_walk: enemyDir('war_drummer'),
  rune_guardian_walk: enemyDir('rune_guardian'),
  revenant_float: enemyDir('revenant'),
  reaper_walk: enemyDir('reaper'),
  // Bosses (sprite names from content/maps.js boss.sprite)
  boss_skeleton_king: enemyDir('boss_skeleton_king'),
  boss_werewolf_king: enemyDir('boss_werewolf_king'),
  boss_bog_witch: enemyDir('boss_bog_witch'),
  // remaining bosses (2026-05-29) — completes the 8-boss art set
  boss_magma_drake: enemyDir('boss_magma_drake'),
  boss_ice_queen: enemyDir('boss_ice_queen'),
  boss_vampire: enemyDir('boss_vampire'),
  boss_demon: enemyDir('boss_demon'),
  boss_idle: enemyDir('boss_idle'),
};

// Resolve an enemy sprite name + direction to a PNG URL, or null when the
// enemy is not PixelLab-registered (renderer falls back to ASCII).
export function enemyAssetUrl(name, dir) {
  const set = ENEMY_ASSETS[name];
  if (!set) return null;
  return set[dir] || set.east || null;
}
