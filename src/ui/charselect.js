// Character select — the hero pick (HTML/CSS overlay).
//
// Each card previews a hero's walk sprite + its starting-weapon perk. Heroes
// unlock with stage chapters (save.unlockedChapters) — locked ones are greyed.
// Picking an unlocked hero hands it back to main.

import { CHARACTERS } from '../content/characters.js';
import { loadSave } from '../data/save.js';
import { heroPortraitElement } from './heroPortrait.js';

const PORTRAIT_PX = 96; // target portrait size — zoom derives from sprite size

export function createCharSelect(mount) {
  const el = document.createElement('div');
  el.className = 'charselect hidden';
  mount.appendChild(el);

  let onPick = null;
  let onBack = null;
  let context = { chapter: '?', mapName: '?' }; // default for defensive calls

  // Shared hero portrait helper — PixelLab PNG → ASCII canvas fallback.
  // (memory: hero-portrait-pixellab-fallback)
  function portrait(spriteName) {
    return heroPortraitElement(spriteName, PORTRAIT_PX, 'cs-portrait');
  }

  function build() {
    el.innerHTML = '';
    const save = loadSave();
    const unlocked = save.unlockedChapters;

    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'cs-breadcrumb';
    if (onBack) {
      const back = document.createElement('button');
      back.type = 'button';
      back.className = 'cs-crumb-link';
      back.textContent = `‹ 챕터 ${context.chapter}: ${context.mapName}`;
      back.addEventListener('click', () => {
        const cb = onBack;
        onBack = null;
        onPick = null;
        el.classList.add('hidden');
        cb();
      });
      breadcrumb.appendChild(back);
      const sep = document.createElement('span');
      sep.className = 'cs-crumb-sep';
      sep.textContent = ' · ';
      breadcrumb.appendChild(sep);
      const step = document.createElement('span');
      step.className = 'cs-crumb-step';
      step.textContent = '2/3 단계 · 영웅 선택';
      breadcrumb.appendChild(step);
    } else {
      breadcrumb.innerHTML = `<p>2/3 단계 · 챕터 ${context.chapter}: ${context.mapName}</p>`;
    }
    el.appendChild(breadcrumb);

    const head = document.createElement('div');
    head.className = 'cs-head';
    head.innerHTML = `
      <h2 class="cs-title">영웅 선택</h2>
      <p class="cs-sub">영웅마다 다른 무기·스킬로 모험을 시작한다 · 영구 강화는 대장간에서</p>
      <p class="cs-gold">보유 골드 <b>${save.gold}</b></p>`;
    el.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'cs-grid';
    for (const c of CHARACTERS) {
      const locked = (c.unlockChapter || 1) > unlocked;
      const card = document.createElement('div');
      card.className = 'cs-card' + (locked ? ' locked' : '');
      card.appendChild(portrait(c.sprite));
      const meta = document.createElement('div');
      meta.className = 'cs-meta';
      meta.innerHTML = `
        <div class="cs-name">${c.name}</div>
        <div class="cs-blurb">${locked ? '🔒 Lv ' + (c.unlockChapter === 4 ? 20 : c.unlockChapter === 5 ? 30 : 40) + ' 도달 필요' : c.blurb}</div>
        <div class="cs-perk">${locked ? '' : c.perk}</div>`;
      card.appendChild(meta);
      if (!locked) {
        // Per-hero gold upgrade removed — all permanent progression is global
        // now (대장간 forge). The card is just preview + 선택.
        const pick = document.createElement('button');
        pick.className = 'cs-pick';
        pick.textContent = '선택';
        pick.addEventListener('click', () => {
          el.classList.add('hidden');
          if (onPick) onPick(c);
        });
        card.appendChild(pick);
      }
      grid.appendChild(card);
    }
    el.appendChild(grid);
  }

  return {
    show(cb, map, backCb) {
      onPick = cb;
      onBack = backCb || null;
      if (map) {
        context = { chapter: map.chapter || '?', mapName: map.name || '?' };
      }
      build(); // rebuilt each time so newly-unlocked heroes appear
      el.classList.remove('hidden');
    },
  };
}
