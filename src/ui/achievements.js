// Achievements page — a browsable showcase of every trophy (HTML overlay).
// Read-only: lists all achievements grouped by category with tier colours.
// Progress tracking is Phase 2.

import {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_TIERS,
} from '../content/achievements.js';
import { loadSave } from '../data/save.js';

const ICON_BOX = 48; // target canvas size — sized to fit .page-icon CSS cap

export function createAchievements(mount) {
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
      // pick the largest integer zoom that fits the source into ICON_BOX —
      // keeps the pixel-art look crisp (no fractional anti-aliasing) and
      // never overflows the CSS-capped icon cell.
      const z = Math.max(1, Math.floor(ICON_BOX / Math.max(src.width, src.height)));
      cv.width = src.width * z;
      cv.height = src.height * z;
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0, cv.width, cv.height);
    } else {
      cv.width = ICON_BOX;
      cv.height = ICON_BOX;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = 'rgba(80, 70, 110, 0.35)';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.strokeStyle = 'rgba(192, 167, 110, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cv.width / 2, 6);
      ctx.lineTo(cv.width - 6, cv.height / 2);
      ctx.lineTo(cv.width / 2, cv.height - 6);
      ctx.lineTo(6, cv.height / 2);
      ctx.closePath();
      ctx.stroke();
    }
    return cv;
  }

  let activeTab = 'all';

  function renderTabContent(scroll, unlocked) {
    scroll.innerHTML = '';
    let shown = 0;

    for (const cat of ACHIEVEMENT_CATEGORIES) {
      const list = ACHIEVEMENTS.filter((a) => a.category === cat.id);
      if (list.length === 0) continue;

      if (activeTab !== 'all' && activeTab !== cat.id) continue;

      const sec = document.createElement('div');
      sec.className = 'page-cat';
      const head = document.createElement('div');
      head.className = 'page-cat-name';
      head.textContent = `${cat.name} · ${list.length}`;
      sec.appendChild(head);
      const grid = document.createElement('div');
      grid.className = 'page-grid';
      for (const a of list) {
        const tier = ACHIEVEMENT_TIERS[a.tier] || {};
        const card = document.createElement('div');
        card.className = 'ach-card' + (unlocked[a.id] ? ' ach-done' : ' ach-locked');
        card.style.setProperty('--tier-color', unlocked[a.id] ? (tier.color || '#2a2535') : '#2a2535');
        card.appendChild(icon(a.icon));
        const info = document.createElement('div');
        info.className = 'ach-info';
        info.innerHTML = `
          <div class="ach-name">${a.name}</div>
          <div class="ach-blurb">${a.blurb}</div>
          <div class="ach-reward" style="color:${tier.color || '#cfc8e0'}">${a.reward || ''}</div>`;
        card.appendChild(info);
        grid.appendChild(card);
      }
      sec.appendChild(grid);
      scroll.appendChild(sec);
      shown++;
    }
  }

  function build() {
    const unlocked = loadSave().achievements || {};
    const done = ACHIEVEMENTS.filter((a) => unlocked[a.id]).length;
    el.innerHTML = `
      <div class="page-panel">
        <div class="page-head">
          <div style="flex: 1;">
            <h2 class="page-title">도전 과제 <span class="page-count">${done} / ${ACHIEVEMENTS.length}</span></h2>
            <div class="ach-progress"><div class="ach-progress-fill" style="width: ${(done/ACHIEVEMENTS.length)*100}%"></div></div>
          </div>
          <button class="page-close" id="ach-close">닫기</button>
        </div>
        <div class="page-tabs" id="ach-tabs"></div>
        <div class="page-scroll" id="ach-scroll"></div>
      </div>`;

    const tabs = el.querySelector('#ach-tabs');
    const scroll = el.querySelector('#ach-scroll');

    // Create tab buttons — each label carries a "done / total" mini counter
    // so the player can see which category they're behind on at a glance.
    const unlockedAch = loadSave().achievements || {};
    const doneAll = ACHIEVEMENTS.filter((a) => unlockedAch[a.id]).length;
    const allBtn = document.createElement('button');
    allBtn.className = 'page-tab active';
    allBtn.innerHTML = `전체 <span class="page-tab-count">${doneAll}/${ACHIEVEMENTS.length}</span>`;
    allBtn.id = 'tab-all';
    tabs.appendChild(allBtn);

    for (const cat of ACHIEVEMENT_CATEGORIES) {
      const list = ACHIEVEMENTS.filter((a) => a.category === cat.id);
      const done = list.filter((a) => unlockedAch[a.id]).length;
      const btn = document.createElement('button');
      btn.className = 'page-tab';
      btn.innerHTML = `${cat.name} <span class="page-tab-count">${done}/${list.length}</span>`;
      btn.id = `tab-${cat.id}`;
      tabs.appendChild(btn);
    }

    // Tab click handlers
    const tabButtons = tabs.querySelectorAll('.page-tab');
    for (const btn of tabButtons) {
      btn.addEventListener('click', () => {
        activeTab = btn.id === 'tab-all' ? 'all' : btn.id.replace('tab-', '');

        // Update active styling
        for (const b of tabButtons) b.classList.remove('active');
        btn.classList.add('active');

        // Re-render content
        renderTabContent(scroll, unlocked);
      });
    }

    // Keyboard navigation (Left/Right arrows cycle tabs)
    const handleTabKeyboard = (e) => {
      if (el.classList.contains('hidden')) return;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const buttons = Array.from(tabButtons);
        const current = buttons.findIndex((b) => b.classList.contains('active'));
        const next = e.key === 'ArrowLeft' ? current - 1 : current + 1;
        if (next >= 0 && next < buttons.length) {
          buttons[next].click();
        }
      }
    };
    window.addEventListener('keydown', handleTabKeyboard);

    // Initial render
    renderTabContent(scroll, unlocked);

    el.querySelector('#ach-close').addEventListener('click', close);
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
