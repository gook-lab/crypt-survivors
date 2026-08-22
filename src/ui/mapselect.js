// Map / chapter select — pick the stage before the character pick.
// Stages are a chapter progression: a chapter unlocks when the previous one
// has been played (save.unlockedChapters). Locked chapters are shown greyed.

import { MAPS } from '../content/maps.js';
import { loadSave } from '../data/save.js';

const PREVIEW_CELLS = 3; // preview is a 3x3 tile patch
const PREVIEW_ZOOM = 4; // screen px per source pixel
const TILE_PX = 16;

export function createMapSelect(mount) {
  const el = document.createElement('div');
  el.className = 'mapselect hidden';
  mount.appendChild(el);

  let onPick = null;

  // a small floor patch rendered straight from the map's tile bag
  function preview(map) {
    const cv = document.createElement('canvas');
    cv.className = 'ms-preview';
    const cell = TILE_PX * PREVIEW_ZOOM;
    cv.width = PREVIEW_CELLS * cell;
    cv.height = PREVIEW_CELLS * cell;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    for (let r = 0; r < PREVIEW_CELLS; r++) {
      for (let c = 0; c < PREVIEW_CELLS; c++) {
        const h = ((c * 73856093) ^ (r * 19349663)) >>> 0;
        const src = window.AtlasBuilder.renderFrame(map.tiles[h % map.tiles.length], 0);
        ctx.drawImage(src, 0, 0, src.width, src.height, c * cell, r * cell, cell, cell);
      }
    }
    return cv;
  }

  function build() {
    el.innerHTML = '';
    const unlocked = loadSave().unlockedChapters;

    const head = document.createElement('div');
    head.className = 'ms-head';
    head.innerHTML = `
      <h2 class="ms-title">스테이지 선택</h2>
      <p class="ms-sub">Lv 20에서 Ch.4, Lv 30에서 Ch.5가 열린다</p>`;
    el.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'ms-grid';
    for (const map of MAPS) {
      const locked = map.chapter > unlocked;
      const card = document.createElement('button');
      card.className = 'ms-card' + (locked ? ' locked' : '');
      if (locked) card.disabled = true;
      card.appendChild(preview(map));
      const meta = document.createElement('div');
      meta.className = 'ms-meta';
      meta.innerHTML = `
        <div class="ms-chapter">CHAPTER ${map.chapter}</div>
        <div class="ms-name">${map.name}</div>
        <div class="ms-desc">${locked ? '🔒 Lv ' + (map.chapter === 4 ? 20 : map.chapter === 5 ? 30 : 40) + ' 도달 시 해금' : map.desc}</div>`;
      card.appendChild(meta);
      if (!locked) {
        card.addEventListener('click', () => {
          el.classList.add('hidden');
          if (onPick) onPick(map);
        });
      }
      grid.appendChild(card);
    }
    el.appendChild(grid);
  }

  return {
    show(cb) {
      onPick = cb;
      build(); // rebuilt each time so newly-unlocked chapters appear
      el.classList.remove('hidden');
    },
  };
}
