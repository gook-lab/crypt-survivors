// Spirits page — a browsable catalog of base spirits + fusion recipes.
//
// Mirrors the status page layout: top section lists the 6 base spirits with
// role + cooldown + per-tier effect; bottom section lists the 4 fusion
// recipes (ingredient pair → fused result).

import { SPIRITS, SPIRIT_FUSIONS } from '../content/spirits.js';
import { loadSave } from '../data/save.js';

const ICON_BOX = 48; // target canvas size — sized to fit .page-icon CSS cap

const ROLE_LABEL = { heal: '회복', shield: '보호막', attack: '공격' };
const ROLE_COLOR = { heal: '#7be07a', shield: '#88c8ff', attack: '#f0822a' };

export function createSpiritsPage(mount) {
  const el = document.createElement('div');
  el.className = 'page hidden';
  mount.appendChild(el);

  let built = false;
  let closeCb = null;

  function close() {
    el.classList.add('hidden');
    if (closeCb) closeCb();
  }
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

  function spiritCard(spirit) {
    const card = document.createElement('div');
    card.className = 'ach-card';
    const color = ROLE_COLOR[spirit.role] || '#cfc8e0';
    card.style.borderLeftColor = color;
    if (spirit.fused) card.style.borderColor = '#f0d27a';
    // tier-1 sprite as the headline icon
    card.appendChild(icon((spirit.sprites && spirit.sprites[0]) || null));
    const info = document.createElement('div');
    info.className = 'ach-info';
    const roleTag = ROLE_LABEL[spirit.role] || spirit.role;
    let detail = '';
    if (spirit.role === 'heal') {
      detail = `회복 ${spirit.heal || 0}/tier · ${spirit.cooldown || 0}s`;
      if (spirit.bonusShield) detail += ` · 쉴드 +${spirit.bonusShield}/tier`;
    } else if (spirit.role === 'shield') {
      detail = `보호막 ${spirit.shield || 0}/tier · ${spirit.cooldown || 0}s`;
    } else if (spirit.role === 'attack') {
      detail = `피해 ${spirit.damage || 0}/tier · ${spirit.cooldown || 0}s`;
      if (spirit.chain) detail += ` · 체인 ${spirit.chain}`;
    }
    info.innerHTML = `
      <div class="ach-name">${spirit.name} ${spirit.fused ? '<span class="page-count">FUSED</span>' : `<span class="page-count">${roleTag}</span>`}</div>
      <div class="ach-blurb">${spirit.desc}</div>
      <div class="ach-reward" style="color:${color}">${detail}</div>`;
    card.appendChild(info);
    return card;
  }

  function fusionCard(recipe, discovered) {
    const [aId, bId] = recipe.from;
    const a = SPIRITS[aId];
    const b = SPIRITS[bId];
    const result = SPIRITS[recipe.id];
    // bad recipe — skip rendering instead of appending an empty placeholder
    // that would still occupy a grid cell
    if (!a || !b || !result) return null;
    const card = document.createElement('div');
    card.className = 'ach-card' + (discovered ? ' fusion-found' : ' fusion-locked');
    card.style.borderLeftColor = discovered ? '#f0d27a' : '#3a3052';
    card.style.borderColor = discovered ? '#f0d27a' : '#3a3052';
    // a tiny 2-icon strip showing the ingredients → result line
    const strip = document.createElement('div');
    strip.className = 'fusion-strip';
    strip.appendChild(icon(a.sprites[0]));
    const plus = document.createElement('span');
    plus.className = 'fusion-glyph';
    plus.textContent = '+';
    strip.appendChild(plus);
    strip.appendChild(icon(b.sprites[0]));
    const arrow = document.createElement('span');
    arrow.className = 'fusion-glyph';
    arrow.textContent = '→';
    strip.appendChild(arrow);
    strip.appendChild(icon(result.sprites[0]));
    card.appendChild(strip);
    const info = document.createElement('div');
    info.className = 'ach-info';
    const tag = discovered ? '<span class="page-count fusion-found-tag">✓ 발견</span>' : '<span class="page-count">FUSION</span>';
    info.innerHTML = `
      <div class="ach-name">${result.name} ${tag}</div>
      <div class="ach-blurb">${a.name} + ${b.name}</div>
      <div class="ach-reward" style="color:${discovered ? '#f0d27a' : '#6a6478'}">${result.desc}</div>`;
    card.appendChild(info);
    return card;
  }

  function build() {
    const baseSpirits = Object.values(SPIRITS).filter((s) => !s.fused);
    const fusedSpirits = Object.values(SPIRITS).filter((s) => s.fused);
    const discovered = (loadSave().discoveredFusions) || {};
    el.innerHTML = `
      <div class="page-panel">
        <div class="page-head">
          <h2 class="page-title">정령 · 융합</h2>
          <button class="page-close" id="spirits-close">닫기</button>
        </div>
        <div class="page-scroll" id="spirits-scroll"></div>
      </div>`;
    const scroll = el.querySelector('#spirits-scroll');

    // section 1 — base spirits
    const sec1 = document.createElement('div');
    sec1.className = 'page-cat';
    sec1.innerHTML = `<div class="page-cat-name">기본 정령 · ${baseSpirits.length}</div>`;
    const grid1 = document.createElement('div');
    grid1.className = 'page-grid';
    for (const sp of baseSpirits) grid1.appendChild(spiritCard(sp));
    sec1.appendChild(grid1);
    scroll.appendChild(sec1);

    // section 2 — fusion recipes
    const sec2 = document.createElement('div');
    sec2.className = 'page-cat';
    const foundCount = SPIRIT_FUSIONS.filter((r) => discovered[r.id]).length;
    sec2.innerHTML = `<div class="page-cat-name">융합 레시피 · ${foundCount} / ${SPIRIT_FUSIONS.length}</div>`;
    const grid2 = document.createElement('div');
    grid2.className = 'page-grid';
    for (const r of SPIRIT_FUSIONS) {
      const c = fusionCard(r, !!discovered[r.id]);
      if (c) grid2.appendChild(c);
    }
    sec2.appendChild(grid2);
    scroll.appendChild(sec2);

    // section 3 — fused results (the spirits themselves, in case players
    // want to read the final stats)
    const sec3 = document.createElement('div');
    sec3.className = 'page-cat';
    sec3.innerHTML = `<div class="page-cat-name">융합 정령 · ${fusedSpirits.length}</div>`;
    const grid3 = document.createElement('div');
    grid3.className = 'page-grid';
    for (const sp of fusedSpirits) grid3.appendChild(spiritCard(sp));
    sec3.appendChild(grid3);
    scroll.appendChild(sec3);

    el.querySelector('#spirits-close').addEventListener('click', close);
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
