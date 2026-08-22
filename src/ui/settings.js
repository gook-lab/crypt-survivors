// Settings panel — opened from the title screen (⚙).
//
// Sliders + toggles for volume, screen shake, damage numbers, and FX
// intensity. Saves on change via setSetting; other systems observe through
// onSettingsChange and react live. ESC closes back to the title.

import { getSettings, setSetting } from '../data/settings.js';
import { loadSave, writeSave } from '../data/save.js';

export function createSettings(mount) {
  const el = document.createElement('div');
  el.className = 'settings hidden';
  mount.appendChild(el);

  let closeCb = null;
  function close() {
    el.classList.add('hidden');
    if (closeCb) closeCb();
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !el.classList.contains('hidden')) close();
  });

  function build() {
    const s = getSettings();
    el.innerHTML = `
      <div class="settings-panel">
        <h2 class="settings-title">설정</h2>
        <div class="set-row">
          <span class="set-label">음량</span>
          <div class="set-control">
            <input type="range" id="set-volume" min="0" max="1" step="0.05" value="${s.volume}">
            <span class="set-value" id="set-volume-val">${Math.round(s.volume * 100)}%</span>
          </div>
        </div>
        <div class="set-row">
          <span class="set-label">화면 흔들림</span>
          <div class="set-control">
            <input type="checkbox" id="set-shake" ${s.shake ? 'checked' : ''}>
          </div>
        </div>
        <div class="set-row">
          <span class="set-label">데미지 숫자</span>
          <div class="set-control">
            <input type="checkbox" id="set-dmg" ${s.dmgNumbers ? 'checked' : ''}>
          </div>
        </div>
        <div class="set-row">
          <span class="set-label">이펙트 강도</span>
          <div class="set-control">
            <select id="set-fx">
              <option value="low" ${s.fxIntensity === 'low' ? 'selected' : ''}>낮음</option>
              <option value="normal" ${s.fxIntensity === 'normal' ? 'selected' : ''}>보통</option>
              <option value="high" ${s.fxIntensity === 'high' ? 'selected' : ''}>높음</option>
            </select>
          </div>
        </div>
        <div class="set-row">
          <span class="set-label">보스 윈드업 표시</span>
          <div class="set-control">
            <input type="checkbox" id="set-telegraph" ${s.bossTelegraph ? 'checked' : ''}>
          </div>
        </div>
        ${loadSave().hellModeUnlocked ? `
        <div class="set-row">
          <span class="set-label" style="color:#e0584a">지옥 모드</span>
          <div class="set-control">
            <input type="checkbox" id="set-hell" ${loadSave().hellModeEnabled ? 'checked' : ''}>
            <span class="set-value" style="color:#e0584a">적 ×2 / 골드 ×3</span>
          </div>
        </div>` : ''}
        <div class="set-row">
          <span class="set-label">진행 데이터</span>
          <div class="set-control">
            <button class="set-mini-btn" id="set-export">내보내기</button>
            <button class="set-mini-btn" id="set-import">불러오기</button>
          </div>
        </div>
        <div class="settings-actions">
          <button class="set-close" id="set-close-btn">닫기</button>
        </div>
      </div>`;

    const vol = el.querySelector('#set-volume');
    const volVal = el.querySelector('#set-volume-val');
    vol.addEventListener('input', () => {
      const v = parseFloat(vol.value);
      volVal.textContent = Math.round(v * 100) + '%';
      setSetting('volume', v);
    });
    el.querySelector('#set-shake').addEventListener('change', (e) => setSetting('shake', e.target.checked));
    el.querySelector('#set-dmg').addEventListener('change', (e) => setSetting('dmgNumbers', e.target.checked));
    el.querySelector('#set-fx').addEventListener('change', (e) => setSetting('fxIntensity', e.target.value));
    el.querySelector('#set-telegraph').addEventListener('change', (e) => setSetting('bossTelegraph', e.target.checked));
    const hellEl = el.querySelector('#set-hell');
    if (hellEl) {
      hellEl.addEventListener('change', (e) => {
        const sv = loadSave();
        sv.hellModeEnabled = e.target.checked;
        writeSave(sv);
      });
    }
    el.querySelector('#set-close-btn').addEventListener('click', close);
    // Save export — copy JSON to clipboard + offer a download
    el.querySelector('#set-export').addEventListener('click', () => {
      const sv = loadSave();
      const blob = new Blob([JSON.stringify(sv, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'crypt-survivors-save.json';
      a.click();
      URL.revokeObjectURL(url);
    });
    // Save import — open a file picker, validate JSON, write
    el.querySelector('#set-import').addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/json';
      input.onchange = () => {
        const file = input.files && input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const parsed = JSON.parse(reader.result);
            if (!parsed || typeof parsed !== 'object') return;
            writeSave(parsed);
            build(); // re-render with the new values
          } catch {
            // ignore corrupt files
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });
  }

  return {
    open(cb) {
      closeCb = cb;
      build();
      el.classList.remove('hidden');
    },
  };
}
