// HUD — heads-up display (HTML/CSS overlay, design-review CQ2).
//
// The HP and XP bars are reskinned with the art-pack frame sprites
// (hud_bar_hp / hud_bar_xp): a darkened copy is the empty track, the bright
// copy is the fill, clipped by width so the frame reads complete at any
// level. Equipped-weapon slots sit bottom-left (hud_weapon_slot frames), a
// boss bar drops in along the lower edge, and hud_corner brackets frame the
// four screen corners.

import { WEAPONS } from '../content/weapons.js';
import { preloadWeaponPng } from '../util/weaponIcon.js';

const SLOT_ZOOM = 3;

export function createHud(mount) {
  const root = document.createElement('div');
  root.className = 'hud hidden'; // hidden until startRun → hud.show()
  root.innerHTML = `
    <div class="hud-corner hud-corner-tl"></div>
    <div class="hud-corner hud-corner-tr"></div>
    <div class="hud-corner hud-corner-bl"></div>
    <div class="hud-corner hud-corner-br"></div>
    <div class="hud-lvl" id="hud-lvl">Lv 1</div>
    <div class="hud-bar hud-hp" id="hud-hp"><div class="hud-bar-fill" id="hud-hp-fill"></div><div class="hud-shield-overlay" id="hud-shield"></div></div>
    <div class="hud-bar hud-xp" id="hud-xp"><div class="hud-bar-fill" id="hud-xp-fill"></div></div>
    <div class="hud-time" id="hud-time">0:00</div>
    <div class="hud-kills" id="hud-kills">0 kills</div>
    <div class="hud-arcana hidden" id="hud-arcana"><span class="hud-arcana-icon"></span><span class="hud-arcana-name"></span></div>
    <div class="hud-hell hidden" id="hud-hell">🔥 지옥</div>
    <div class="hud-next hidden" id="hud-next"><span class="hud-next-tag">다음</span><span class="hud-next-label" id="hud-next-label"></span><span class="hud-next-time" id="hud-next-time"></span></div>
    <div class="hud-weapons" id="hud-weapons"></div>
    <div class="hud-spirits" id="hud-spirits"></div>
    <div class="hud-active hidden" id="hud-active" title="시그니처 액티브 (Space)">
      <canvas class="hud-active-icon" id="hud-active-icon" width="48" height="48"></canvas>
      <canvas class="hud-active-cd" id="hud-active-cd" width="48" height="48"></canvas>
      <div class="hud-active-key">SPACE</div>
      <div class="hud-active-cd-text" id="hud-active-cd-text"></div>
    </div>
    <div class="hud-boss hidden" id="hud-boss">
      <div class="hud-boss-name" id="hud-boss-name">보스</div>
      <div class="hud-boss-sig" id="hud-boss-sig"></div>
      <div class="hud-bar hud-boss-bar" id="hud-boss-bar">
        <div class="hud-bar-fill" id="hud-boss-fill"></div>
      </div>
    </div>
  `;
  mount.appendChild(root);

  const lvlEl = root.querySelector('#hud-lvl');
  const hpFill = root.querySelector('#hud-hp-fill');
  const shieldEl = root.querySelector('#hud-shield');
  const xpFill = root.querySelector('#hud-xp-fill');
  const timeEl = root.querySelector('#hud-time');
  const killsEl = root.querySelector('#hud-kills');
  const arcanaEl = root.querySelector('#hud-arcana');
  const arcanaIconEl = root.querySelector('.hud-arcana-icon');
  const arcanaNameEl = root.querySelector('.hud-arcana-name');
  const weaponsEl = root.querySelector('#hud-weapons');
  const spiritsEl = root.querySelector('#hud-spirits');
  const activeEl = root.querySelector('#hud-active');
  const activeIconCv = root.querySelector('#hud-active-icon');
  const activeCdCv = root.querySelector('#hud-active-cd');
  const activeCdText = root.querySelector('#hud-active-cd-text');
  let activeIconDrawn = false;
  let activeReadyPulseT = 0;
  let activeLastReady = false;
  const bossEl = root.querySelector('#hud-boss');
  const bossNameEl = root.querySelector('#hud-boss-name');
  const bossFill = root.querySelector('#hud-boss-fill');
  const bossSig = root.querySelector('#hud-boss-sig');
  const hellEl = root.querySelector('#hud-hell');
  const nextEl = root.querySelector('#hud-next');
  const nextLabel = root.querySelector('#hud-next-label');
  const nextTime = root.querySelector('#hud-next-time');

  const AB = window.AtlasBuilder;
  const SPRITES = window.SPRITES || {};

  let bossExitTimeout = null;

  // a bar frame sprite as a data URL; `darken` dims it for the empty track
  function barURL(name, darken) {
    const src = AB.renderFrame(name, 0);
    const cv = document.createElement('canvas');
    cv.width = src.width;
    cv.height = src.height;
    const ctx = cv.getContext('2d');
    ctx.drawImage(src, 0, 0);
    if (darken) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(0,0,0,0.62)';
      ctx.fillRect(0, 0, cv.width, cv.height);
    }
    return `url(${cv.toDataURL()})`;
  }

  // dress a .hud-bar / .hud-bar-fill pair with a frame sprite
  function skinBar(barId, fillId, sprite) {
    if (!SPRITES[sprite]) return;
    const bar = root.querySelector('#' + barId);
    const fill = root.querySelector('#' + fillId);
    bar.style.backgroundImage = barURL(sprite, true);
    fill.style.backgroundImage = barURL(sprite, false);
  }
  skinBar('hud-hp', 'hud-hp-fill', 'hud_bar_hp');
  skinBar('hud-xp', 'hud-xp-fill', 'hud_bar_xp');
  skinBar('hud-boss-bar', 'hud-boss-fill', 'hud_bar_hp');

  // corner brackets
  if (SPRITES.hud_corner) {
    const url = barURL('hud_corner', false);
    for (const c of root.querySelectorAll('.hud-corner')) c.style.backgroundImage = url;
  }

  // a framed slot canvas: the hud_weapon_slot frame with the weapon icon on top
  function slotCanvas(weaponId) {
    const def = WEAPONS[weaponId];
    const cv = document.createElement('canvas');
    cv.className = 'hud-weapon';
    cv.width = 24 * SLOT_ZOOM;
    cv.height = 24 * SLOT_ZOOM;
    // tooltip on hover — name + brief stats so the player can recall what
    // each slot does mid-run without opening the pause menu
    if (def) {
      const dmg = def.damage || 0;
      const cd = def.cooldown || 0;
      cv.setAttribute('data-tip', `${def.name}\n피해 ${dmg} · 쿨다운 ${cd}s`);
    }
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    // Frame background (always — even if no icon resolves)
    if (SPRITES.hud_weapon_slot) {
      const f = AB.renderFrame('hud_weapon_slot', 0);
      ctx.drawImage(f, 0, 0, f.width, f.height, 0, 0, cv.width, cv.height);
    }
    // Icon overlay at 66% of slot, centered. PixelLab PNG when cached;
    // ASCII fallback otherwise. Async PNG triggers a redraw on load so the
    // slot ends up consistent with arsenal/levelup once the asset arrives.
    const w = cv.width * 0.66;
    const h = cv.height * 0.66;
    const ox = (cv.width - w) / 2;
    const oy = (cv.height - h) / 2;
    function drawAscii() {
      const iconName = SPRITES['icon_' + weaponId] ? 'icon_' + weaponId : (def && def.sprite);
      if (iconName && SPRITES[iconName]) {
        const ic = AB.renderFrame(iconName, 0);
        ctx.drawImage(ic, 0, 0, ic.width, ic.height, ox, oy, w, h);
      }
    }
    function drawPng(img) {
      // Re-stamp the frame first so we don't double-up the old icon underneath
      if (!cv.isConnected) return; // slot was removed before PNG finished loading
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (SPRITES.hud_weapon_slot) {
        const f = AB.renderFrame('hud_weapon_slot', 0);
        ctx.drawImage(f, 0, 0, f.width, f.height, 0, 0, cv.width, cv.height);
      }
      ctx.drawImage(img, 0, 0, img.width || img.naturalWidth, img.height || img.naturalHeight, ox, oy, w, h);
    }
    const cachedImg = preloadWeaponPng(def, drawPng);
    if (cachedImg) drawPng(cachedImg);
    else drawAscii();
    return cv;
  }

  let weaponKey = ''; // rebuild the slot row only when the weapon set changes
  let spiritKey = ''; // same idea for the spirit slot row

  // a spirit slot — small framed icon with a tier pip in the corner. Reuses
  // hud_weapon_slot frame so the weapon and spirit rows share a visual style.
  function spiritSlotCanvas(spiritId, tier) {
    const cv = document.createElement('canvas');
    cv.className = 'hud-spirit';
    cv.width = 24 * SLOT_ZOOM;
    cv.height = 24 * SLOT_ZOOM;
    cv.setAttribute('data-tip', `${spiritId} · 단계 ${tier}`);
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    if (SPRITES.hud_weapon_slot) {
      const f = AB.renderFrame('hud_weapon_slot', 0);
      ctx.drawImage(f, 0, 0, f.width, f.height, 0, 0, cv.width, cv.height);
    }
    // try the per-tier sprite name (e.g., spirit_fire_2) — falls back to tier 1
    const candidate = 'spirit_' + spiritId + '_' + tier;
    const iconName = SPRITES[candidate] ? candidate
      : SPRITES['spirit_' + spiritId + '_1'] ? 'spirit_' + spiritId + '_1'
      : null;
    if (iconName) {
      const ic = AB.renderFrame(iconName, 0);
      const w = cv.width * 0.7;
      const h = cv.height * 0.7;
      ctx.drawImage(ic, 0, 0, ic.width, ic.height, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
    }
    return cv;
  }

  // Next-event countdown — main.js feeds an object { label, secs } with the
  // soonest upcoming threat (boss / mini-boss / blood moon) so the player
  // can pace their build. Hidden during a boss fight to avoid noise.
  function updateNext(next, isBossActive) {
    if (isBossActive || !next || next.secs == null || next.secs <= 0) {
      nextEl.classList.add('hidden');
      return;
    }
    nextEl.classList.remove('hidden');
    nextLabel.textContent = next.label;
    const s = Math.ceil(next.secs);
    nextTime.textContent = s >= 60
      ? Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0')
      : s + '초';
  }

  // Render the active signature icon once per change. Currently a hand-drawn
  // arcane meteor — small body + trail — using the gothic palette indices so
  // it harmonises with the rest of the HUD.
  function drawActiveIcon(sigId) {
    const ctx = activeIconCv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 48, 48);
    if (sigId !== 'meteor_storm') return;
    // ember core
    ctx.fillStyle = '#f08a2a';
    ctx.beginPath(); ctx.arc(28, 22, 10, 0, Math.PI * 2); ctx.fill();
    // bright spec hot spot
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(28, 22, 4, 0, Math.PI * 2); ctx.fill();
    // arcane trail
    ctx.fillStyle = '#6e3a8a';
    ctx.globalAlpha = 0.7;
    ctx.beginPath(); ctx.arc(20, 30, 5, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.arc(14, 36, 4, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.arc(9, 42, 3, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Radial cooldown swipe: a dark fan that covers the icon, shrinking from
  // 360° to 0° as the cooldown completes. When ready, a soft gold pulse.
  function drawActiveCooldown(info, dt) {
    const ctx = activeCdCv.getContext('2d');
    ctx.clearRect(0, 0, 48, 48);
    if (!info) return;
    if (info.cooldown > 0 && info.total > 0) {
      const remaining = info.cooldown / info.total; // 1 at start, 0 at ready
      const cx = 24, cy = 24, r = 22;
      ctx.fillStyle = 'rgba(7, 6, 12, 0.7)';
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + remaining * Math.PI * 2);
      ctx.closePath();
      ctx.fill();
      activeCdText.textContent = Math.ceil(info.cooldown) + 's';
      activeCdText.style.opacity = '1';
    } else {
      activeCdText.style.opacity = '0';
      // ready pulse — 0.3s gold glow on the moment we tipped to ready, then idle
      if (activeReadyPulseT > 0) {
        activeReadyPulseT = Math.max(0, activeReadyPulseT - dt);
        const a = activeReadyPulseT / 0.3;
        const cx = 24, cy = 24;
        ctx.strokeStyle = `rgba(240, 210, 122, ${0.85 * a})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(cx, cy, 22 - (1 - a) * 4, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // Track ready-edge to fire the gold pulse only when it just became ready.
  let lastHudUpdateMs = performance.now();

  function update(player, stats, progression, boss, loadout, next, hellActive, activeInfo) {
    updateNext(next, !!boss);
    // hell-mode chip — small red label in the top-right while the run-time
    // hell flag is on. Same z-band as the arcana badge.
    if (hellActive) hellEl.classList.remove('hidden');
    else hellEl.classList.add('hidden');
    hpFill.style.width = Math.max(0, (player.hp / player.maxHp) * 100) + '%';
    // shield overlay — relative to the same maxHp so it stacks visually above
    // the HP fill rather than re-scaling to its own 0..1 range
    const shieldPctOfMax = Math.max(0, Math.min(1, (player.shield || 0) / player.maxHp));
    shieldEl.style.width = (shieldPctOfMax * 100) + '%';
    xpFill.style.width = (progression.xp / progression.xpToNext) * 100 + '%';
    lvlEl.textContent = 'Lv ' + progression.level;
    const t = Math.floor(stats.time);
    timeEl.textContent = Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0');
    killsEl.textContent = stats.kills + ' kills';

    // arcana badge
    if (loadout && loadout.arcana) {
      const a = loadout.arcana;
      arcanaEl.style.borderColor = a.color;
      arcanaEl.style.background = `rgba(240, 210, 122, 0.08)`;
      arcanaNameEl.textContent = a.name;
      arcanaNameEl.style.color = a.color;
      // render icon canvas
      const cv = document.createElement('canvas');
      cv.className = 'hud-arcana-icon';
      cv.width = 24;
      cv.height = 24;
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      if (a.icon && SPRITES[a.icon]) {
        const src = AB.renderFrame(a.icon, 0);
        ctx.drawImage(src, 0, 0, src.width, src.height, 0, 0, 24, 24);
      }
      arcanaIconEl.replaceWith(cv);
      arcanaEl.classList.remove('hidden');
    } else {
      arcanaEl.classList.add('hidden');
    }

    if (loadout) {
      const ids = Object.keys(loadout.weapons);
      const key = ids.join(',');
      if (key !== weaponKey) {
        weaponKey = key;
        weaponsEl.innerHTML = '';
        for (const id of ids) weaponsEl.appendChild(slotCanvas(id));
      }
      // spirit slot row — sits next to weapons; rebuilt only when the spirit
      // set changes (fusion / pickup) so per-frame cost is just a hash check
      const spIds = Object.keys(loadout.spirits || {});
      const spKey = spIds.join(',');
      if (spKey !== spiritKey) {
        spiritKey = spKey;
        spiritsEl.innerHTML = '';
        for (const id of spIds) spiritsEl.appendChild(spiritSlotCanvas(id, loadout.spirits[id]));
      }
    }

    // Active signature slot — drawn only when the hero actually has one
    // (Phase 1: mage only). Other heroes see no slot at all so the HUD
    // doesn't pollute with a permanently-greyed-out placeholder.
    const nowMs = performance.now();
    const hudDt = Math.min(0.1, (nowMs - lastHudUpdateMs) / 1000);
    lastHudUpdateMs = nowMs;
    if (activeInfo && activeInfo.sigId) {
      activeEl.classList.remove('hidden');
      if (!activeIconDrawn || activeIconDrawn !== activeInfo.sigId) {
        drawActiveIcon(activeInfo.sigId);
        activeIconDrawn = activeInfo.sigId;
      }
      // detect ready edge — fires the gold pulse exactly once per ready
      if (activeInfo.ready && !activeLastReady) activeReadyPulseT = 0.3;
      activeLastReady = activeInfo.ready;
      drawActiveCooldown(activeInfo, hudDt);
    } else {
      activeEl.classList.add('hidden');
      activeIconDrawn = false;
      activeLastReady = false;
    }

    if (boss) {
      if (bossExitTimeout) clearTimeout(bossExitTimeout);
      bossEl.classList.remove('hidden');
      bossEl.classList.remove('boss-exit');
      bossEl.classList.add('boss-enter');
      bossNameEl.textContent = boss.bossName || '보스';
      // signature caption — main.js feeds boss.signature when the boss appears
      bossSig.textContent = boss.signature ? '✦ ' + boss.signature : '';
      bossFill.style.width = Math.max(0, (boss.hp / boss.maxHp) * 100) + '%';
    } else {
      bossEl.classList.remove('boss-enter');
      bossEl.classList.add('boss-exit');
      if (bossExitTimeout) clearTimeout(bossExitTimeout);
      bossExitTimeout = setTimeout(() => {
        bossEl.classList.add('hidden');
        bossExitTimeout = null;
      }, 800);
    }
  }

  return {
    update,
    hide: () => root.classList.add('hidden'),
    show: () => root.classList.remove('hidden'),
  };
}
