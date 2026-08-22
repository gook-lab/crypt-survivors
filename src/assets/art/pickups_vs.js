// PixelLab-generated pickup icons — single-frame static items (XP gems, gold,
// hearts, potions, chests, runes, etc.). Same canvas-frame shape as fx_vs.js
// but only 1 frame each. Renderer treats single-frame entries as static
// sprites (no animation playback).

const PNG_URLS = import.meta.glob('../pickups_vs/*/frame_000.png', {
  eager: true,
  query: '?url',
  import: 'default',
});

const PICKUPS = {
  // XP gems intentionally NOT migrated — the existing ASCII art reads cleaner
  // at the small in-game size; PixelLab 48px versions overwhelm the screen.
  // xp_blue / xp_green / xp_red stay on the legacy sprites.
  gold:         'pickup_gold',
  heart:        'pickup_heart',
  bomb:         'pickup_bomb',
  chest:        'pickup_chest',
  chest_gold:   'pickup_chest_gold',
  potion_hp:    'pickup_potion_hp',
  potion_mana:  'pickup_potion_mana',
  potion_might: 'pickup_potion_might',
  magnet:       'pickup_magnet',
  rune:         'pickup_rune',
  scroll:       'pickup_scroll',
};

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('failed to load ' + url));
    img.src = url;
  });
}

async function loadPickup(slug) {
  const path = `../pickups_vs/${slug}/frame_000.png`;
  const u = PNG_URLS[path];
  if (!u) return null;
  const img = await loadImage(u);
  const c = document.createElement('canvas');
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0);
  return c;
}

window.PICKUPS_VS_LOAD = async function loadPickupsVS() {
  if (!window.SPRITES) return;
  let n = 0;
  for (const [slug, key] of Object.entries(PICKUPS)) {
    const canvas = await loadPickup(slug);
    if (!canvas) continue;
    window.SPRITES[key] = { __canvasFrames: true, frames: [canvas], fps: 0 };
    n++;
  }
  console.info('[pickups_vs] registered ' + n + ' VS-style pickups');
};
