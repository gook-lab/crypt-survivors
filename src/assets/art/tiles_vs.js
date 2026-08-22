// PixelLab Wang 4×4 biome tilesets. Each tileset PNG is 64×64 (16 unique
// 16×16 tiles arranged 4×4). We crop two cells per biome:
//   - wang_0  (all-lower corners) at  (32, 16) — the "main" floor tile
//   - wang_15 (all-upper corners) at   (0, 48) — the "variant" tile
// and override the existing tile_nat_* keys so maps.js / renderer logic
// stays untouched.

import cryptUrl from '../heroes_vs/tiles_vs/crypt.png';
import forestUrl from '../heroes_vs/tiles_vs/forest.png';
import swampUrl from '../heroes_vs/tiles_vs/swamp.png';
import volcanoUrl from '../heroes_vs/tiles_vs/volcano.png';
import iceUrl from '../heroes_vs/tiles_vs/ice.png';
import voidUrl from '../heroes_vs/tiles_vs/void.png';

// `mainTarget` = the high-weight existing tile key in maps.js (e.g. 16/20 of crypt floor).
// `accentTarget` = the rare variant key. Cropped bbox is fixed by PixelLab's tileset15_4x4 layout.
const BIOMES = {
  crypt:   { url: cryptUrl,   main: 'tile_nat_crypt_a',       accent: 'tile_nat_crypt_b' },
  forest:  { url: forestUrl,  main: 'tile_nat_forest_a',      accent: 'tile_nat_forest_b' },
  swamp:   { url: swampUrl,   main: 'tile_water_hd',          accent: 'tile_water_hd_shore' },
  volcano: { url: volcanoUrl, main: 'tile_nat_volcano_a',     accent: 'tile_nat_volcano_ember' },
  ice:     { url: iceUrl,     main: 'tile_nat_ice_a',         accent: 'tile_nat_ice_crack' },
  void:    { url: voidUrl,    main: 'tile_void',              accent: 'tile_void_nebula' },
};

// In each 64×64 tileset PNG, the all-upper tile (wang_15) is at (0, 48)
// and the all-lower tile (wang_0) is at (32, 16). Both 16×16.
const UPPER_BBOX = [0, 48, 16, 16];
const LOWER_BBOX = [32, 16, 16, 16];

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('failed to load ' + url));
    img.src = url;
  });
}

function cropFrame(img, bbox) {
  const c = document.createElement('canvas');
  c.width = bbox[2];
  c.height = bbox[3];
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, bbox[0], bbox[1], bbox[2], bbox[3], 0, 0, bbox[2], bbox[3]);
  return c;
}

async function registerBiome(name, def) {
  const img = await loadImage(def.url);
  // main floor = upper terrain (looks like a "carpeted" land tile)
  if (def.main) {
    window.SPRITES[def.main] = { __canvasFrames: true, frames: [cropFrame(img, UPPER_BBOX)] };
  }
  // accent = lower terrain (the contrasting "base" tile)
  if (def.accent) {
    window.SPRITES[def.accent] = { __canvasFrames: true, frames: [cropFrame(img, LOWER_BBOX)] };
  }
}

window.TILES_VS_LOAD = async function loadTilesVS() {
  if (!window.SPRITES) return;
  let n = 0;
  for (const [name, def] of Object.entries(BIOMES)) {
    try {
      await registerBiome(name, def);
      n++;
    } catch (err) {
      console.warn('[tiles_vs] skip ' + name + ': ' + err.message);
    }
  }
  console.info('[tiles_vs] registered ' + n + ' biome tilesets');
};
