// Gold shop — the meta-progression screen (대장간). HTML/CSS overlay.
//
// Vampire Survivors PowerUps model: every upgrade is GLOBAL (applies to all
// heroes) and ALL categories are shown on one page as a card grid (no
// per-tab horizontal scrolling, no per-character upgrades). A "초기화" button
// refunds all spent gold and clears upgrades (VS-style respec). Buying spends
// saved gold and persists immediately.

import { META_UPGRADES, SHOP_TABS } from '../content/metaUpgrades.js';
import { loadSave, writeSave } from '../data/save.js';
import { costFor } from '../meta.js';

export function createShop(mount) {
  const el = document.createElement('div');
  el.className = 'shop hidden';
  mount.appendChild(el);
  let onClose = null;

  function iconCanvas(name) {
    const cv = document.createElement('canvas');
    cv.className = 'shop-icon';
    const SPRITES = window.SPRITES || {};
    if (name && SPRITES[name] && window.AtlasBuilder) {
      const src = window.AtlasBuilder.renderFrame(name, 0);
      cv.width = src.width * 2;
      cv.height = src.height * 2;
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, cv.width, cv.height);
    } else {
      // Fallback rune glyph (sprite key has no art) — a gold diamond so the
      // tile never shows an empty box. Same approach as arcanaselect.
      cv.width = 48;
      cv.height = 48;
      const ctx = cv.getContext('2d');
      ctx.translate(24, 24);
      ctx.rotate(Math.PI / 4);
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#e7c66a';
      ctx.fillRect(-13, -13, 26, 26);
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#e7c66a';
      ctx.strokeRect(-12, -12, 24, 24);
      ctx.rotate(-Math.PI / 4);
      ctx.beginPath();
      ctx.arc(0, 0, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    return cv;
  }

  // Total gold sinkable into the current catalog (used to show a refund hint).
  function totalSpent(save) {
    let spent = 0;
    for (const u of META_UPGRADES) {
      const lvl = save.upgrades[u.id] || 0;
      for (let i = 0; i < lvl; i++) spent += costFor(u, i);
    }
    return spent;
  }

  function render() {
    const save = loadSave();
    el.innerHTML = `
      <div class="shop-panel">
        <div class="shop-head">
          <h2 class="shop-title">대장간</h2>
          <div class="shop-head-right">
            <button class="shop-reset" id="shop-reset">↺ 초기화 (골드 환급)</button>
            <div class="shop-gold">◆ ${save.gold}</div>
          </div>
        </div>
        <p class="shop-sub">영구 강화 · 모든 영웅에 공통 적용</p>
        <div class="shop-cats" id="shop-cats"></div>
        <button class="shop-close" id="shop-close">닫기</button>
      </div>`;

    const cats = el.querySelector('#shop-cats');
    for (const t of SHOP_TABS) {
      const section = document.createElement('div');
      section.className = 'shop-cat';
      const head = document.createElement('h3');
      head.className = 'shop-cat-head';
      head.textContent = t.name;
      section.appendChild(head);
      const grid = document.createElement('div');
      grid.className = 'shop-grid';
      for (const u of META_UPGRADES) {
        if (u.tab !== t.id) continue;
        grid.appendChild(buildTile(u, save));
      }
      section.appendChild(grid);
      cats.appendChild(section);
    }

    el.querySelector('#shop-close').addEventListener('click', () => {
      el.classList.add('hidden');
      if (onClose) onClose();
    });
    const resetBtn = el.querySelector('#shop-reset');
    const spent = totalSpent(save);
    resetBtn.disabled = spent <= 0;
    resetBtn.addEventListener('click', () => refundAll());
  }

  function buildTile(u, save) {
    const level = save.upgrades[u.id] ?? 0;
    const maxed = level >= u.max;
    const cost = maxed ? 0 : costFor(u, level);
    const afford = !maxed && save.gold >= cost;
    const tile = document.createElement('button');
    tile.className = 'shop-tile ' + (maxed ? 'maxed' : afford ? 'afford' : 'locked');
    if (maxed || !afford) tile.disabled = true;
    tile.appendChild(iconCanvas(u.icon));
    const info = document.createElement('div');
    info.className = 'shop-tile-info';
    const pips = Array.from(
      { length: u.max },
      (_, i) => `<span class="pip ${i < level ? 'on' : ''}"></span>`,
    ).join('');
    info.innerHTML = `
      <div class="tile-name">${u.name}</div>
      <div class="tile-pips">${pips}</div>
      <div class="tile-desc">${u.blurb}</div>
      <div class="tile-cost">${maxed ? 'MAX' : '◆ ' + cost}</div>`;
    tile.appendChild(info);
    tile.addEventListener('click', () => buy(u.id));
    return tile;
  }

  function buy(id) {
    const u = META_UPGRADES.find((x) => x.id === id);
    const save = loadSave();
    const level = save.upgrades[id] ?? 0;
    if (level >= u.max) return;
    const cost = costFor(u, level);
    if (save.gold < cost) return;
    save.gold -= cost;
    save.upgrades[id] = level + 1;
    writeSave(save);
    render();
  }

  // VS-style respec: refund every gold spent on the current catalog, wipe all
  // upgrade levels (incl. any stale ids from an older catalog). Lets players
  // re-spec after a balance/catalog change without losing their gold.
  function refundAll() {
    const save = loadSave();
    save.gold += totalSpent(save);
    save.upgrades = {};
    writeSave(save);
    render();
  }

  function open(closeCb) {
    onClose = closeCb;
    render();
    el.classList.remove('hidden');
  }

  // dismiss without firing the onClose callback — for ESC shortcuts where
  // main owns the post-close transition
  function close() {
    el.classList.add('hidden');
  }

  return { open, close };
}
