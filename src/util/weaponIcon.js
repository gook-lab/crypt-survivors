// Shared weapon icon resolver for HTML UI surfaces (arsenal, levelup, evolution,
// result, hud). Mirrors the priority chain arsenal.js established:
//
//   1. effectAsset + SIG_ASSETS[key]       → PixelLab N-frame animation (frame 0 static, or cycle if animate)
//   2. weaponAssetUrl(weapon.sprite)       → static PNG from weaponAssets.js
//   3. AtlasBuilder.renderFrame(name, 0)   → ASCII canvas fallback
//
// Returns an HTMLElement (img OR canvas) sized to the requested size. Caller
// appends it. Animation timers self-clean when the element leaves the DOM.

import { SIG_ASSETS } from './sigAssets.js';
import { weaponAssetUrl } from './weaponAssets.js';

// Animate a PNG element through frames at the given fps. Auto-clears the
// interval when the element is removed from the DOM (parentNode check).
function animateFrames(img, frames, fps) {
  if (!frames || frames.length <= 1) return;
  let i = 0;
  const interval = 1000 / (fps || 12);
  const handle = setInterval(() => {
    if (!img.isConnected) { clearInterval(handle); return; }
    i = (i + 1) % frames.length;
    img.src = frames[i];
  }, interval);
}

function asciiCanvas(name, size) {
  const cv = document.createElement('canvas');
  const SPRITES = window.SPRITES || {};
  if (name && SPRITES[name] && window.AtlasBuilder) {
    const src = window.AtlasBuilder.renderFrame(name, 0);
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

// Build a DOM element for a weapon icon. Returns img (PNG path) or canvas
// (ASCII fallback). Caller is responsible for layout/positioning.
//
// opts:
//   size      — target pixel size (default 48)
//   animate   — if true and effectAsset has multi-frame, cycle frames
//   className — CSS class applied to the returned element (default 'page-icon')
export function weaponIconElement(weapon, opts = {}) {
  const size = opts.size || 48;
  const animate = !!opts.animate;
  const className = opts.className || 'page-icon';

  // 1. effectAsset (animated PixelLab sigAsset)
  if (weapon && weapon.effectAsset && SIG_ASSETS[weapon.effectAsset]) {
    const a = SIG_ASSETS[weapon.effectAsset];
    const frames = a.frames || (a.url ? [a.url] : null);
    if (frames && frames.length) {
      const img = document.createElement('img');
      img.src = frames[0];
      img.className = className;
      img.style.cssText = `image-rendering: pixelated; width: ${size}px; height: ${size}px; object-fit: contain;`;
      if (animate) animateFrames(img, frames, a.fps);
      return img;
    }
  }

  // 2. weaponAssets.js static PNG
  const wpnUrl = weapon ? weaponAssetUrl(weapon.sprite) : null;
  if (wpnUrl) {
    const img = document.createElement('img');
    img.src = wpnUrl;
    img.className = className;
    img.style.cssText = `image-rendering: pixelated; width: ${size}px; height: ${size}px; object-fit: contain;`;
    return img;
  }

  // 3. ASCII canvas fallback — prefer .icon key over .sprite (icon is a
  //    pre-rendered inventory glyph; sprite is the in-flight projectile art)
  const SPRITES = window.SPRITES || {};
  const clip = (weapon && SPRITES[weapon.icon]) ? weapon.icon : (weapon && weapon.sprite);
  const cv = asciiCanvas(clip, size);
  cv.className = className;
  return cv;
}

// Preload a weapon PNG into the browser's image cache + return the cached
// HTMLImageElement when ready. Used by canvas surfaces (hud.js) that need to
// compose the PNG onto an existing canvas via drawImage. Returns the Image
// immediately if cached + loaded; otherwise returns null and invokes the
// optional onReady callback when the PNG finishes loading.
const _pngCache = new Map(); // cacheKey -> { img, ready }
export function preloadWeaponPng(weapon, onReady) {
  if (!weapon) return null;
  // effectAsset has higher priority — return its frame 0 if registered
  if (weapon.effectAsset && SIG_ASSETS[weapon.effectAsset]) {
    const a = SIG_ASSETS[weapon.effectAsset];
    const url = (a.frames && a.frames[0]) || a.url;
    if (url) return _loadOrFetch('eff:' + weapon.effectAsset, url, onReady);
  }
  const wpnUrl = weaponAssetUrl(weapon.sprite);
  if (wpnUrl) return _loadOrFetch('wpn:' + weapon.sprite, wpnUrl, onReady);
  return null;
}

function _loadOrFetch(key, url, onReady) {
  const cached = _pngCache.get(key);
  if (cached) {
    if (cached.ready) return cached.img;
    // Already in-flight — chain another listener so the late caller can repaint
    if (onReady) cached.img.addEventListener('load', () => onReady(cached.img), { once: true });
    return null;
  }
  const img = new Image();
  const entry = { img, ready: false };
  _pngCache.set(key, entry);
  img.onload = () => {
    entry.ready = true;
    if (onReady) onReady(img);
  };
  img.src = url;
  return null;
}
