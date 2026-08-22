// PixelLab-generated enemy sprites — east/west 2-direction walk cycles.
// Same shape as heroes_vs.js: each enemy registers under `${enemyKey}_east` /
// `${enemyKey}_west`, the renderer's pickDirectional() picks one based on the
// enemy's velocity. The base key (e.g. 'walker_walk') is aliased to east so
// non-directional contexts (bestiary portrait, etc.) still show new art.

const DIRECTIONS = ['east', 'west'];
// enemy slug -> the existing SPRITES key the renderer/ENEMY_SPRITE table looks up.
// Adding more enemies is a one-line entry here; missing PNGs are silently
// skipped (so partial rollout works without breaking).
const ENEMIES = {
  // common enemies
  walker:  'walker_walk',
  runner:  'runner_walk',
  brute:   'brute_walk',
  elite:   'elite_walk',
  spider:  'spider_walk',
  chimera: 'chimera_walk',
  bat:     'bat_fly',
  slime:   'slime_idle',
  // biome enemies — chapter 2/3/4/5/6
  wolf:        'wolf_run',
  goblin:      'goblin_walk',
  hornet:      'hornet_fly',
  frog:        'frog_idle',
  bog_zombie:  'bog_zombie_walk',
  wisp:        'wisp_float',
  imp:         'imp_walk',
  lava_slug:   'lava_slug_idle',
  fire_bat:    'fire_bat_fly',
  frost_wolf:  'frost_wolf_run',
  yeti:        'yeti_walk',
  ice_wraith:  'ice_wraith_float',
  // ── new monsters (PixelLab pack) — folders populated when art finishes
  // generating. The loader silently skips missing PNGs, so this map can be
  // wired before the art lands.
  giant_spider:    'giant_spider_walk',
  carrion_crow:    'carrion_crow_fly',
  bog_leech:       'bog_leech_walk',
  carnivore_plant: 'carnivore_plant_idle',
  magma_golem:     'magma_golem_walk',
  ice_golem:       'ice_golem_walk',
  void_walker:     'void_walker_walk',
  void_drifter:    'void_drifter_float',
  // bosses
  boss_skeleton_king: 'boss_skeleton_king',
  boss_vampire:       'boss_vampire',
  boss_demon:         'boss_demon',
  boss_lich:          'boss_idle',
  boss_werewolf_king: 'boss_werewolf_king',
  boss_bog_witch:     'boss_bog_witch',
  boss_magma_drake:   'boss_magma_drake',
  boss_ice_queen:     'boss_ice_queen',
  boss_treant:        'boss_treant',
};

const PNG_URLS = import.meta.glob('../enemies_vs/*/*/frame_*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('failed to load ' + url));
    img.src = url;
  });
}

async function loadFrames(slug, dir) {
  const urls = [];
  for (let i = 0; i < 8; i++) {
    const path = `../enemies_vs/${slug}/${dir}/frame_00${i}.png`;
    const u = PNG_URLS[path];
    if (!u) return null;
    urls.push(u);
  }
  const imgs = await Promise.all(urls.map(loadImage));
  const W = imgs[0].naturalWidth;
  const H = imgs[0].naturalHeight;
  return imgs.map((img) => {
    const c = document.createElement('canvas');
    c.width = W;
    c.height = H;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, 0, 0);
    return c;
  });
}

window.ENEMIES_VS_LOAD = async function loadEnemiesVS() {
  if (!window.SPRITES) return;
  let registered = 0;
  let promoted = 0;
  for (const [slug, baseKey] of Object.entries(ENEMIES)) {
    const variants = {};
    for (const dir of DIRECTIONS) {
      const frames = await loadFrames(slug, dir);
      if (!frames) continue;
      const key = baseKey + '_' + dir;
      window.SPRITES[key] = { __canvasFrames: true, frames, fps: 8 };
      if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
        window.AtlasBuilder.FPS[key] = 8;
      }
      variants[dir] = key;
      registered++;
    }
    const canon = variants.east || variants.west;
    if (canon) {
      window.SPRITES[baseKey] = window.SPRITES[canon];
      if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
        window.AtlasBuilder.FPS[baseKey] = window.AtlasBuilder.FPS[canon];
      }
      promoted++;
    }
  }
  console.info('[enemies_vs] registered ' + registered + ' clips, promoted ' + promoted + ' base keys');
};
