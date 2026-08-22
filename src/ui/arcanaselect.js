// Arcana select — picked after the hero, before the run starts.
//
// The player gets 3 random arcanas + a 건너뛰기 option. An arcana is a
// run-only modifier that folds into loadout.meta + onKill at startRun.
// Same card pattern as levelup.js — keyboard 1/2/3/S supported.

import { rollArcanas, ARCANAS } from '../content/arcanas.js';
import { loadSave } from '../data/save.js';
import { pickupAssetUrl } from '../util/pickupAssets.js';

export function createArcanaSelect(mount, rng) {
  const el = document.createElement('div');
  el.className = 'arcana hidden';
  mount.appendChild(el);

  let onPick = null;
  let choices = [];
  let context = { chapter: '?', mapName: '?', heroName: '?' };
  let onBackMap = null;
  let onBackHero = null;

  // 1/2/3 picks the card at that position; S = skip. Same convention as
  // levelup.js. Ignored when the picker is hidden so it doesn't intercept
  // gameplay keys.
  window.addEventListener('keydown', (e) => {
    if (el.classList.contains('hidden')) return;
    if (e.key >= '1' && e.key <= '3') pick(parseInt(e.key, 10) - 1);
    else if (e.key === 's' || e.key === 'S') pick(-1);
  });

  // Arcana icons may reference: ASCII atlas (`icon_lifesteal` etc), PixelLab
  // pickup PNG (`pickup_chest_gold`), or status icons. PNG path wins when
  // registered — CSS forces .arc-icon to 56×56 so the <img> renders crisply
  // with pixelated CSS scaling regardless of source size.
  function iconCanvas(name, color) {
    const pngUrl = name ? pickupAssetUrl(name) : null;
    if (pngUrl) {
      const img = document.createElement('img');
      img.src = pngUrl;
      img.className = 'arc-icon';
      img.style.imageRendering = 'pixelated';
      return img;
    }
    const cv = document.createElement('canvas');
    cv.className = 'arc-icon';
    const SPR = window.SPRITES || {};
    if (name && SPR[name] && window.AtlasBuilder) {
      const src = window.AtlasBuilder.renderFrame(name, 0);
      const z = Math.max(1, Math.round(56 / src.width));
      cv.width = src.width * z;
      cv.height = src.height * z;
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0, cv.width, cv.height);
    } else {
      // No sprite for this icon key (several arcana icons — icon_crit /
      // icon_fire / icon_lifesteal / icon_revive — have no art). Draw a
      // tier-colored rune glyph so the card reads as intentional instead of
      // an empty box. Far better than the old blank canvas.
      cv.width = 56;
      cv.height = 56;
      const ctx = cv.getContext('2d');
      const col = color || '#b08bdc';
      ctx.translate(28, 28);
      ctx.rotate(Math.PI / 4);
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = col;
      ctx.fillRect(-15, -15, 30, 30); // soft diamond fill
      ctx.globalAlpha = 0.95;
      ctx.lineWidth = 3;
      ctx.strokeStyle = col;
      ctx.strokeRect(-14, -14, 28, 28); // diamond outline
      ctx.rotate(-Math.PI / 4);
      ctx.beginPath(); // inner focus dot
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
    return cv;
  }

  function build() {
    const save = loadSave();
    const stats = save.stats || {};
    choices = rollArcanas(rng, 3, stats);
    const unlocked = ARCANAS.filter((a) => !a.unlock || a.unlock.check(stats)).length;
    const crumbBack = (onBackMap || onBackHero)
      ? `<div class="arcana-breadcrumb">
          ${onBackMap ? `<button type="button" class="arc-crumb-link" data-back="map">‹ 챕터 ${context.chapter}: ${context.mapName}</button>` : ''}
          ${onBackMap && onBackHero ? `<span class="arc-crumb-sep"> · </span>` : ''}
          ${onBackHero ? `<button type="button" class="arc-crumb-link" data-back="hero">‹ 영웅: ${context.heroName}</button>` : ''}
          <span class="arc-crumb-sep"> · </span>
          <span class="arc-crumb-step">3/3 단계 · 아르카나</span>
        </div>` : '';
    el.innerHTML = `
      <div class="arcana-panel">
        ${crumbBack}
        <h2 class="arcana-title">아르카나 선택</h2>
        <p class="arcana-sub">이번 모험에만 적용되는 특수 효과를 선택하라 · ${unlocked} / ${ARCANAS.length} 해금</p>
        <div class="arcana-cards"></div>
        <div class="arcana-actions">
          <button class="arc-action" id="arc-skip">건너뛰기 (S)</button>
        </div>
        <p class="arcana-hint">클릭 또는 1·2·3 키 · S 건너뛰기</p>
      </div>`;
    el.querySelectorAll('.arc-crumb-link').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.back;
        const mapBack = onBackMap;
        const heroBack = onBackHero;
        onPick = null;
        onBackMap = null;
        onBackHero = null;
        el.classList.add('hidden');
        if (target === 'map' && mapBack) mapBack();
        else if (target === 'hero' && heroBack) heroBack();
      });
    });
    const row = el.querySelector('.arcana-cards');
    choices.forEach((a, i) => {
      const card = document.createElement('button');
      card.className = 'arc-card';
      card.style.borderColor = a.color;
      card.innerHTML = `
        <span class="arc-key">${i + 1}</span>
        <span class="arc-band" style="background:${a.color}"></span>`;
      card.appendChild(iconCanvas(a.icon, a.color));
      const nm = document.createElement('span');
      nm.className = 'arc-name';
      nm.style.color = a.color;
      nm.textContent = a.name;
      const ds = document.createElement('span');
      ds.className = 'arc-desc';
      ds.textContent = a.blurb;
      card.appendChild(nm);
      card.appendChild(ds);
      card.addEventListener('click', () => pick(i));
      row.appendChild(card);
    });
    el.querySelector('#arc-skip').addEventListener('click', () => pick(-1));
  }

  function pick(i) {
    if (!onPick) return;
    const chosen = i >= 0 && i < choices.length ? choices[i] : null;
    const cb = onPick;
    onPick = null;
    el.classList.add('hidden');
    cb(chosen);
  }

  return {
    show(cb, ctx, callbacks) {
      onPick = cb;
      if (ctx) {
        context = {
          chapter: ctx.chapter || '?',
          mapName: ctx.mapName || '?',
          heroName: ctx.heroName || '?',
        };
      }
      onBackMap = callbacks?.onBackMap || null;
      onBackHero = callbacks?.onBackHero || null;
      build();
      el.classList.remove('hidden');
    },
    pick,
    isOpen: () => !el.classList.contains('hidden'),
  };
}
