// Run history page — the last 10 completed runs, most-recent first.
// Each entry shows hero / level / time / kills / weapons / arcana / seed.
// Same .page shell as bestiary / stats. Read-only, ESC closes.

import { loadSave } from '../data/save.js';
import { CHARACTERS } from '../content/characters.js';
import { WEAPONS } from '../content/weapons.js';
import { ARCANAS } from '../content/arcanas.js';
import { heroPortraitElement } from './heroPortrait.js';

const ICON_BOX = 48;

function formatTime(s) {
  if (!s) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ':' + String(sec).padStart(2, '0');
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.getMonth() + 1 + '/' + d.getDate() + ' ' +
    String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

export function createHistory(mount) {
  const el = document.createElement('div');
  el.className = 'page hidden';
  mount.appendChild(el);

  let closeCb = null;
  function close() {
    el.classList.add('hidden');
    if (closeCb) closeCb();
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !el.classList.contains('hidden')) close();
  });

  // Shared hero portrait helper — PixelLab PNG → ASCII canvas fallback.
  // (memory: hero-portrait-pixellab-fallback)
  function icon(name) {
    return heroPortraitElement(name, ICON_BOX, 'page-icon');
  }

  function build() {
    const sv = loadSave();
    const history = sv.runHistory || [];
    el.innerHTML = `
      <div class="page-panel">
        <div class="page-head">
          <h2 class="page-title">런 기록 <span class="page-count">${history.length} / 10</span></h2>
          <button class="page-close" id="history-close">닫기</button>
        </div>
        <div class="page-scroll" id="history-scroll"></div>
      </div>`;
    const scroll = el.querySelector('#history-scroll');

    if (history.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'page-cat-name';
      empty.style.opacity = '0.6';
      empty.style.padding = '40px 8px';
      empty.style.textAlign = 'center';
      empty.textContent = '아직 완료된 런이 없습니다.';
      scroll.appendChild(empty);
    } else {
      const grid = document.createElement('div');
      grid.className = 'page-grid';
      for (const r of history) {
        const card = document.createElement('div');
        card.className = 'ach-card';
        card.style.borderLeftColor = r.hell ? '#e0584a' : '#f0d27a';
        // hero portrait
        const hero = CHARACTERS.find((c) => c.id === r.hero);
        card.appendChild(icon(hero ? hero.sprite : null));
        const info = document.createElement('div');
        info.className = 'ach-info';
        const weaponNames = (r.weapons || []).slice(0, 4).map((id) => (WEAPONS[id] || {}).name || id).join(' · ');
        const arcanaDef = r.arcana ? ARCANAS.find((a) => a.id === r.arcana) : null;
        const arcanaName = arcanaDef ? arcanaDef.name : '없음';
        info.innerHTML = `
          <div class="ach-name">
            ${hero ? hero.name : '?'} · Lv ${r.level || 1}
            ${r.hell ? '<span class="page-count" style="color:#e0584a">🔥 지옥</span>' : ''}
          </div>
          <div class="ach-blurb">
            생존 ${formatTime(r.time)} · ${r.kills || 0}처치 · ◆ ${r.gold || 0}
          </div>
          <div class="ach-reward" style="color:#cfc8e0">
            Ch.${r.chapter || '?'} · 아르카나: ${arcanaName} · 시드: <code style="cursor:pointer" data-seed="${r.seed}" title="클릭해 복사">${r.seed}</code>
          </div>
          <div class="ach-blurb" style="opacity:0.55;font-size:10px;margin-top:4px">
            ${weaponNames} · ${formatDate(r.ts)}
          </div>`;
        card.appendChild(info);
        grid.appendChild(card);
      }
      scroll.appendChild(grid);

      // seed copy-to-clipboard handlers
      scroll.querySelectorAll('[data-seed]').forEach((code) => {
        code.addEventListener('click', () => {
          try { navigator.clipboard.writeText(code.dataset.seed); } catch {}
          code.style.color = '#88e0c0';
          setTimeout(() => { code.style.color = ''; }, 800);
        });
      });
    }

    el.querySelector('#history-close').addEventListener('click', close);
  }

  return {
    open(cb) {
      closeCb = cb;
      build(); // re-read each open so the most recent run shows up
      el.classList.remove('hidden');
    },
  };
}
