// Extra PixelLab uniform stone variants — single 32x32 PNGs generated via
// create_object (directions=1, n_frames=4). They sit alongside tiles_vs.js's
// wang_0/wang_15 crops and feed the same SPRITES['tile_nat_crypt_*'] slots.
//
// PixelLab create_object's minimum size is 32, so each PNG arrives at 32×32
// and is downsampled (nearest-neighbour) to a 16×16 canvas to match the
// floor's TILE_PX=16. The result is a uniform stone with no transition
// edges — perfect for the VS-style "균일 베이스" approach we landed on
// after the Wang sheet's 16px grid pattern proved too zig-zag-loud.

// Vite resolves `/tilesets/*` from the project's public/ directory.
const TILE_VARIANTS = {
  tile_nat_crypt_a2: '/tilesets/crypt_a2.png', // organic stone noise
  tile_nat_crypt_a3: '/tilesets/crypt_a3.png', // tight pebble pack
  tile_nat_crypt_a4: '/tilesets/crypt_a4.png', // dark cobblestone
  // swamp / void floor variants + inlaid-band tiles (full-package 보강).
  // 192px PixelLab objects downsampled to 16px (uniform — no Wang transition).
  tile_nat_swamp_mud: '/tilesets/swamp_mud.png',     // murky mud (variety)
  tile_nat_swamp_moss: '/tilesets/swamp_moss.png',   // mossy bog stone (variety)
  tile_nat_swamp_planks: '/tilesets/swamp_planks.png', // boardwalk (band)
  tile_void_nebula: '/tilesets/void_nebula.png',     // nebula (variety)
  tile_void_rune: '/tilesets/void_rune.png',         // rune inlay (band)
};

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('failed to load ' + url));
    img.src = url;
  });
}

function downsampleTo16(img) {
  const c = document.createElement('canvas');
  c.width = 16;
  c.height = 16;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false; // pixel art — nearest-neighbour
  ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 16, 16);
  return c;
}

window.TILES_VS_EXTRA_LOAD = async function loadTilesVSExtra() {
  if (!window.SPRITES) return;
  let n = 0;
  for (const [key, url] of Object.entries(TILE_VARIANTS)) {
    try {
      const img = await loadImage(url);
      window.SPRITES[key] = { __canvasFrames: true, frames: [downsampleTo16(img)] };
      n++;
    } catch (err) {
      console.warn('[tiles_vs_extra] skip ' + key + ': ' + err.message);
    }
  }
  console.info('[tiles_vs_extra] registered ' + n + ' uniform stone variants');
};
