// Hero portrait element factory — single source of truth for PixelLab PNG
// hero rendering across result/history/charselect/shop/levelup/arcanaselect.
//
// Pattern (memory: hero-portrait-pixellab-fallback):
//   1. Try heroAssetUrl() → PixelLab PNG (east-facing idle)
//   2. If URL exists, return <img> with pixelated rendering
//   3. Otherwise return ASCII canvas via window.AtlasBuilder.renderFrame
//
// The canvas fallback uses integer zoom that fits within `size` and the canvas
// is forced to exact `size × size` via CSS, so visual size is consistent
// regardless of source sprite width.

import { heroAssetUrl } from '../util/heroAssets.js';

/**
 * Create a hero portrait DOM element (img or canvas).
 *
 * @param {string} spriteName base hero sprite key (e.g. 'huntress_walk')
 * @param {number} size desired pixel size (width = height)
 * @param {string} className CSS class to apply
 * @returns {HTMLImageElement|HTMLCanvasElement}
 */
export function heroPortraitElement(spriteName, size = 44, className = '') {
  const heroUrl = spriteName ? heroAssetUrl(spriteName, 'east', 0, false, false) : null;
  if (heroUrl) {
    const img = document.createElement('img');
    img.src = heroUrl;
    if (className) img.className = className;
    img.width = size;
    img.height = size;
    img.style.imageRendering = 'pixelated';
    return img;
  }
  // ASCII fallback — integer zoom to fit `size`, centered.
  const cv = document.createElement('canvas');
  if (className) cv.className = className;
  const SPRITES = window.SPRITES || {};
  if (spriteName && SPRITES[spriteName] && window.AtlasBuilder) {
    const src = window.AtlasBuilder.renderFrame(spriteName, 0);
    const z = Math.max(1, Math.floor(size / Math.max(src.width, src.height)));
    cv.width = src.width * z;
    cv.height = src.height * z;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, 0, 0, cv.width, cv.height);
  } else {
    cv.width = size;
    cv.height = size;
  }
  return cv;
}
