// In-game status panel — opened with ESC during a run (the loop freezes the
// sim while a non-playing state is set).
//
// A designed panel: 생존 (HP/XP bars + level), 전투 (damage / crit / speed),
// 자원 (gold / kills) and the 무기·패시브 loadout grid — then resume / quit.

import { WEAPONS } from '../content/weapons.js';
import { PLAYER } from '../config.js';

export function createPauseMenu(mount) {
  const el = document.createElement('div');
  el.className = 'pause hidden';
  mount.appendChild(el);

  let onResume = null;

  function fmtTime(t) {
    const s = Math.floor(t);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  // a crisp upscaled icon canvas from a sprite clip
  function icon(name, px) {
    const cv = document.createElement('canvas');
    cv.className = 'pause-icon';
    const SPR = window.SPRITES || {};
    if (name && SPR[name] && window.AtlasBuilder) {
      const src = window.AtlasBuilder.renderFrame(name, 0);
      const z = Math.max(1, Math.round(px / src.width));
      cv.width = src.width * z;
      cv.height = src.height * z;
      const ctx = cv.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0, cv.width, cv.height);
    } else {
      cv.width = px;
      cv.height = px;
    }
    return cv;
  }

  let settingsCb = null;
  function open(stats, level, player, loadout, resumeCb, quitCb, openSettingsCb) {
    onResume = resumeCb;
    settingsCb = openSettingsCb;
    const hpPct = Math.max(0, Math.round((player.hp / player.maxHp) * 100));
    const dmg = (loadout.damageMult || 1).toFixed(2);
    const crit = Math.round((loadout.critChance || 0) * 100);
    const spd = Math.round((loadout.moveSpeed / PLAYER.speed - 1) * 100);
    const hero = loadout.hero ? loadout.hero.name : '영웅';

    el.innerHTML = `
      <div class="pause-panel">
        <div class="pause-head">
          <span class="pause-hero">${hero}</span>
          <span class="pause-time">${fmtTime(stats.time)}</span>
        </div>
        <div class="pause-sec">
          <div class="pause-sec-name">생존</div>
          <div class="pause-bar-row">
            <span class="pause-bar-lbl">HP</span>
            <div class="pause-bar"><div class="pause-bar-fill pause-hp" style="width:${hpPct}%"></div></div>
            <span class="pause-bar-val">${hpPct}%</span>
          </div>
          <div class="pause-row"><span>레벨</span><span>${level}</span></div>
        </div>
        <div class="pause-sec">
          <div class="pause-sec-name">전투</div>
          <div class="pause-row"><span>피해</span><span>×${dmg}</span></div>
          <div class="pause-row"><span>크리</span><span>${crit}%</span></div>
          <div class="pause-row"><span>이동 속도</span><span>${spd >= 0 ? '+' : ''}${spd}%</span></div>
        </div>
        <div class="pause-sec">
          <div class="pause-sec-name">자원</div>
          <div class="pause-row"><span>골드</span><span class="pause-gold">${stats.gold}</span></div>
          <div class="pause-row"><span>처치</span><span>${stats.kills}</span></div>
          <div class="pause-row"><span>보스 처치</span><span>${stats.bosses}</span></div>
        </div>
        <div class="pause-sec">
          <div class="pause-sec-name">무기 · 패시브</div>
          <div class="pause-grid" id="pause-grid"></div>
        </div>
        <div class="pause-actions">
          <button class="result-btn result-btn-go" id="pause-resume">계속하기 (ESC)</button>
          <button class="result-btn" id="pause-settings">설정</button>
          <button class="result-btn" id="pause-quit">나가기</button>
        </div>
      </div>`;

    const grid = el.querySelector('#pause-grid');
    for (const id in loadout.weapons) {
      const w = WEAPONS[id];
      if (!w) continue;
      const cell = document.createElement('div');
      cell.className = 'pause-slot';
      cell.setAttribute('data-tip', `${w.name} Lv ${loadout.weapons[id]}\n피해 ${w.damage || 0} · ${w.cooldown || 0}s`);
      const SPR = window.SPRITES || {};
      cell.appendChild(icon(SPR[w.icon] ? w.icon : w.sprite, 34));
      const lv = document.createElement('span');
      lv.className = 'pause-slot-lv';
      lv.textContent = loadout.weapons[id];
      cell.appendChild(lv);
      grid.appendChild(cell);
    }
    for (const id in loadout.passives) {
      const cell = document.createElement('div');
      cell.className = 'pause-slot pause-slot-passive';
      cell.setAttribute('data-tip', `${id} 패시브 · Lv ${loadout.passives[id]}`);
      cell.appendChild(icon('icon_' + id, 34));
      const lv = document.createElement('span');
      lv.className = 'pause-slot-lv';
      lv.textContent = loadout.passives[id];
      cell.appendChild(lv);
      grid.appendChild(cell);
    }

    el.querySelector('#pause-resume').addEventListener('click', () => close());
    el.querySelector('#pause-quit').addEventListener('click', () => {
      close();
      if (quitCb) quitCb();
    });
    el.querySelector('#pause-settings').addEventListener('click', () => {
      close();
      if (settingsCb) settingsCb();
    });
    el.classList.remove('hidden');
  }

  function close() {
    if (!onResume) return;
    el.classList.add('hidden');
    const cb = onResume;
    onResume = null;
    cb();
  }

  return { open, close, isOpen: () => !el.classList.contains('hidden') };
}
