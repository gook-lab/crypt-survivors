// PixelLab-generated weapon impact / explosion effects — single-direction
// multi-frame animations. Same canvas-frame shape as heroes_vs.js, but no
// east/west variants (effects don't face a direction). The base sprite key
// (fx_explosion, fx_slash, ...) is overridden so existing call sites just work.

const PNG_URLS = import.meta.glob('../fx_vs/*/frame_*.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

// fx slug -> the existing SPRITES key the renderer uses + frame count + fps.
// Frame count must match the number of PNGs in the folder.
const EFFECTS = {
  explosion:     { key: 'fx_explosion',       frames: 8, fps: 18 },
  slash:         { key: 'fx_slash',           frames: 8, fps: 24 },
  lightning:     { key: 'fx_chain_lightning', frames: 8, fps: 18 },
  fire_burst:    { key: 'fx_impact_burn',     frames: 8, fps: 14 },
  holy_burst:    { key: 'fx_impact_holy',     frames: 8, fps: 14 },
  levelup:       { key: 'fx_levelup',         frames: 8, fps: 10 },
  // Wide sword arc — bigger crescent slash, overrides fx_swing (used by melee weapons)
  wide_slash:    { key: 'fx_swing',           frames: 8, fps: 20 },
  // AoE starfield — magical area damage zone (holywater / firewall / divine_hammer)
  aoe_starfield: { key: 'fx_holywater_splash', frames: 8, fps: 12 },
  // ── v2 rebuild — class signature impact FX ────────────────────────────
  // 4 frames pulled from a 16-candidate review pack; picker.html lets the
  // user swap which 4 candidates land in fx_vs/class_<slug>/ later.
  class_knight:   { key: 'fx_class_knight',   frames: 4, fps: 12 },
  class_warrior:  { key: 'fx_class_warrior',  frames: 4, fps: 12 },
  class_huntress: { key: 'fx_class_huntress', frames: 4, fps: 12 },
  class_mage:     { key: 'fx_class_mage',     frames: 4, fps: 12 },
};

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('failed to load ' + url));
    img.src = url;
  });
}

async function loadFx(slug, frameCount) {
  const urls = [];
  for (let i = 0; i < frameCount; i++) {
    const path = `../fx_vs/${slug}/frame_00${i}.png`;
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

window.FX_VS_LOAD = async function loadFxVS() {
  if (!window.SPRITES) return;
  let n = 0;
  for (const [slug, def] of Object.entries(EFFECTS)) {
    const frames = await loadFx(slug, def.frames);
    if (!frames) continue;
    window.SPRITES[def.key] = { __canvasFrames: true, frames, fps: def.fps };
    if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
      window.AtlasBuilder.FPS[def.key] = def.fps;
    }
    n++;
  }
  console.info('[fx_vs] registered ' + n + ' VS-style effects');
};
