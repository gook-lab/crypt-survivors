// Bestiary page — a browsable monster index (HTML overlay).
// Monsters grouped by chapter (the stage map they appear on); each chapter
// lists its common + elite enemies and its boss, with the combat skill noted.

import { MAPS } from '../content/maps.js';
import { BESTIARY, ABILITY_INFO } from '../content/bestiary.js';

const ICON_BOX = 48;

const ROLE_KO = { basic: '일반', elite: '정예', boss: '보스' };

export function createBestiary(mount) {
  const el = document.createElement('div');
  el.className = 'page hidden';
  mount.appendChild(el);

  let built = false;
  let closeCb = null;

  function close() {
    el.classList.add('hidden');
    if (closeCb) closeCb();
  }
  // ESC closes the page back to the main menu
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !el.classList.contains('hidden')) close();
  });

  function icon(name) {
    const cv = document.createElement('canvas');
    cv.className = 'page-icon';
    const SPRITES = window.SPRITES || {};
    if (name && SPRITES[name]) {
      const src = window.AtlasBuilder.renderFrame(name, 0);
      const z = Math.max(1, Math.floor(ICON_BOX / Math.max(src.width, src.height)));
      cv.width = src.width * z;
      cv.height = src.height * z;
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0, cv.width, cv.height);
    } else {
      cv.width = ICON_BOX;
      cv.height = ICON_BOX;
    }
    return cv;
  }

  function card(entry) {
    const c = document.createElement('div');
    c.className = 'ach-card role-' + (entry.role || 'basic');
    c.appendChild(icon(entry.sprite));
    const info = document.createElement('div');
    info.className = 'ach-info';
    const abil = entry.ability ? ABILITY_INFO[entry.ability] : null;
    info.innerHTML = `
      <div class="ach-name">${entry.name} <span class="page-count">${ROLE_KO[entry.role] || ''}</span></div>
      <div class="ach-blurb">${entry.blurb}</div>
      <div class="ach-reward" style="color:${abil ? '#f0b840' : '#6a6478'}">${
        abil ? '✦ ' + abil.name + ' — ' + abil.desc : '특수 능력 없음'
      }</div>`;
    c.appendChild(info);
    return c;
  }

  function build() {
    const total = Object.keys(BESTIARY).length;
    el.innerHTML = `
      <div class="page-panel">
        <div class="page-head">
          <h2 class="page-title">몬스터 도감 <span class="page-count">${total}</span></h2>
          <button class="page-close" id="best-close">닫기</button>
        </div>
        <div class="page-scroll" id="best-scroll"></div>
      </div>`;
    const scroll = el.querySelector('#best-scroll');

    for (const map of MAPS) {
      const sec = document.createElement('div');
      sec.className = 'page-cat';
      const head = document.createElement('div');
      head.className = 'page-cat-name';
      head.textContent = `Ch.${map.chapter} ${map.name}`;
      sec.appendChild(head);
      const grid = document.createElement('div');
      grid.className = 'page-grid';

      // common + elite enemies of this map, de-duplicated
      const seen = new Set();
      for (const id of [...(map.enemies || []), ...(map.elites || [])]) {
        if (seen.has(id) || !BESTIARY[id]) continue;
        seen.add(id);
        grid.appendChild(card(BESTIARY[id]));
      }
      // the chapter boss
      if (map.boss && BESTIARY[map.boss.sprite]) {
        grid.appendChild(card(BESTIARY[map.boss.sprite]));
      }
      sec.appendChild(grid);
      scroll.appendChild(sec);
    }

    // bosses not tied to a stage map (boss roster / hidden encounters)
    const shown = new Set(MAPS.map((m) => m.boss && m.boss.sprite));
    const extra = Object.keys(BESTIARY).filter(
      (k) => BESTIARY[k].role === 'boss' && !shown.has(k),
    );
    if (extra.length > 0) {
      const sec = document.createElement('div');
      sec.className = 'page-cat';
      const head = document.createElement('div');
      head.className = 'page-cat-name';
      head.textContent = '그 외의 보스';
      sec.appendChild(head);
      const grid = document.createElement('div');
      grid.className = 'page-grid';
      for (const k of extra) grid.appendChild(card(BESTIARY[k]));
      sec.appendChild(grid);
      scroll.appendChild(sec);
    }

    // special encounters — non-boss monsters that aren't in any chapter pool
    // (time-gated / scripted spawns like the 사신 reaper). Without this they'd
    // never appear in the codex despite being in BESTIARY.
    const pooled = new Set();
    for (const m of MAPS) {
      for (const id of [...(m.enemies || []), ...(m.elites || [])]) pooled.add(id);
    }
    const special = Object.keys(BESTIARY).filter(
      (k) => BESTIARY[k].role !== 'boss' && !pooled.has(k),
    );
    if (special.length > 0) {
      const sec = document.createElement('div');
      sec.className = 'page-cat';
      const head = document.createElement('div');
      head.className = 'page-cat-name';
      head.textContent = '특수 출현';
      sec.appendChild(head);
      const grid = document.createElement('div');
      grid.className = 'page-grid';
      for (const k of special) grid.appendChild(card(BESTIARY[k]));
      sec.appendChild(grid);
      scroll.appendChild(sec);
    }

    el.querySelector('#best-close').addEventListener('click', close);
    built = true;
  }

  return {
    open(cb) {
      closeCb = cb;
      if (!built) build();
      el.classList.remove('hidden');
    },
  };
}
