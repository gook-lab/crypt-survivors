// Treasure-chest gacha modal (HTML/CSS overlay).
//
// A collected chest opens here and reveals 1-3 loot items, the cards popping
// in one after another. The game is paused while it is up (the loop gates the
// sim on state). 확인 hands control back so main.js can apply each effect.

import { CHEST_TYPES } from '../content/loot.js';
import { pickupAssetUrl } from '../util/pickupAssets.js';
import { weaponAssetUrl } from '../util/weaponAssets.js';

const TIER_COLOR = { common: '#9a93ad', rare: '#5fa8e0', epic: '#f0b840' };

export function createGacha(mount) {
  const el = document.createElement('div');
  el.className = 'legendary hidden';
  mount.appendChild(el);

  let onDone = null;

  // target box — the card is 180px wide with 14px side-padding, so a 128px
  // sprite leaves ~12px of breathing room on each side. Earlier we passed a
  // fixed zoom (e.g. 4×) which made 48-px HD pickups blow out to 192px and
  // overflow the card — that's where the "empty colored strip" on top/bottom
  // of the card came from (the gold-border showing through the overflow).
  const ICON_BOX = 128;
  function icon(name) {
    const cv = document.createElement('canvas');
    cv.className = 'leg-sprite';
    const SPRITES = window.SPRITES || {};
    if (name && SPRITES[name]) {
      const src = window.AtlasBuilder.renderFrame(name, 0);
      // largest integer zoom that fits the source into ICON_BOX. Integer
      // multipliers preserve pixel-perfect art (no fractional anti-aliasing).
      const z = Math.max(1, Math.floor(ICON_BOX / Math.max(src.width, src.height)));
      cv.width = src.width * z;
      cv.height = src.height * z;
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0, cv.width, cv.height);
    } else {
      cv.width = 64;
      cv.height = 64;
    }
    return cv;
  }

  function show(result, cb) {
    onDone = cb;
    const chest = CHEST_TYPES[result.type] || CHEST_TYPES.wood;
    el.innerHTML = `
      <div class="legendary-panel">
        <h2 class="legendary-title">✦ ${chest.name} ✦</h2>
        <p class="legendary-sub">${
          result.isJackpot ? '잭팟! 3개의 보상이 쏟아진다' : '상자에서 보상이 나타났다'
        }</p>
        <div class="gacha-cards"></div>
        <button class="result-btn result-btn-go" id="gacha-ok">확인</button>
      </div>`;
    const row = el.querySelector('.gacha-cards');
    result.items.forEach((it, i) => {
      const card = document.createElement('div');
      card.className = 'leg-card gacha-card';
      card.style.borderColor = TIER_COLOR[it.tier] || '#000';
      card.style.animationDelay = i * 0.14 + 's';
      // PixelLab PNG path: pickup keys map directly; weapon icons (icon_leg_*)
      // remap to proj_leg_* in weaponAssets. Falls back to ASCII canvas.
      let pixUrl = pickupAssetUrl(it.icon);
      if (!pixUrl && typeof it.icon === 'string' && it.icon.indexOf('icon_') === 0) {
        pixUrl = weaponAssetUrl('proj_' + it.icon.slice(5));
      }
      if (pixUrl) {
        const img = document.createElement('img');
        img.src = pixUrl;
        img.className = 'leg-sprite';
        img.style.cssText = 'image-rendering: pixelated; width: ' + ICON_BOX + 'px; height: ' + ICON_BOX + 'px; object-fit: contain;';
        card.appendChild(img);
      } else {
        card.appendChild(icon(it.icon));
      }
      const meta = document.createElement('div');
      meta.className = 'leg-meta';
      meta.innerHTML = `
        <span class="leg-name" style="color:${TIER_COLOR[it.tier]}">${it.name}</span>
        <span class="leg-desc">${it.blurb}</span>`;
      card.appendChild(meta);
      row.appendChild(card);
    });
    el.querySelector('#gacha-ok').addEventListener('click', done);
    el.classList.remove('hidden');
  }

  function done() {
    if (!onDone) return;
    const cb = onDone;
    onDone = null;
    el.classList.add('hidden');
    cb();
  }

  return { show, done, isOpen: () => !el.classList.contains('hidden') };
}
