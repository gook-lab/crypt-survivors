// Evolution overlay — a dedicated "✦ 진화! ✦" moment when a base weapon
// fuses into its legendary. Bigger and longer than a toast, but it auto-
// closes so the run keeps moving.

import { weaponIconElement } from '../util/weaponIcon.js';

const SHOW_MS = 1900; // overlay lifetime (ms)
const ICON_SIZE = 128; // weapon-icon target size (was 4× of 16-px ASCII)

export function createEvolution(mount) {
  const el = document.createElement('div');
  el.className = 'evolution hidden';
  mount.appendChild(el);

  let hideTimer = 0;

  function show(weaponDef) {
    el.innerHTML = `
      <div class="evo-panel">
        <p class="evo-tag">✦ EVOLUTION ✦</p>
        <h2 class="evo-name">${weaponDef.name}</h2>
        <div class="evo-icon-wrap"></div>
        <p class="evo-sub">무기가 전설로 진화했다</p>
      </div>`;
    const wrap = el.querySelector('.evo-icon-wrap');
    // PixelLab PNG chain via shared helper; ASCII fallback automatic.
    // 1.9s overlay — static frame 0 (animate: false) is enough.
    const icon = weaponIconElement(weaponDef, { size: ICON_SIZE, className: 'evo-icon' });
    wrap.appendChild(icon);
    el.classList.remove('hidden');
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => el.classList.add('hidden'), SHOW_MS);
  }

  return { show };
}
