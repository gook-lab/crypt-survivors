// Stats page — lifetime totals across every run.
//
// Reads save.stats (kills/bosses/crits/damage/runs/maxLevel/longestSurvival)
// plus gold totals and renders a grid of large-number cards. Read-only, ESC
// to close. Same .page shell as bestiary / arsenal / status pages.

import { loadSave } from '../data/save.js';
import { ACHIEVEMENTS } from '../content/achievements.js';

function formatTime(s) {
  if (s <= 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m + ':' + String(sec).padStart(2, '0');
}

function formatNum(n) {
  return (n || 0).toLocaleString();
}

export function createStats(mount) {
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

  function statCard(label, value, color, animateTo) {
    const c = document.createElement('div');
    c.className = 'stats-card';
    c.style.borderLeftColor = color;
    c.innerHTML = `
      <div class="stats-card-label">${label}</div>
      <div class="stats-card-value" style="color:${color}">${value}</div>`;
    // optional count-up on numeric cards — small flourish so the page reads
    // as "fresh data" rather than a static dump
    if (typeof animateTo === 'number' && animateTo > 0) {
      const valEl = c.querySelector('.stats-card-value');
      const start = performance.now();
      const duration = 700;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const ease = 1 - Math.pow(1 - p, 3);
        valEl.textContent = Math.floor(animateTo * ease).toLocaleString();
        if (p < 1) requestAnimationFrame(tick);
        else valEl.textContent = animateTo.toLocaleString();
      };
      requestAnimationFrame(tick);
    }
    return c;
  }

  function build() {
    const save = loadSave();
    const s = save.stats || {};
    el.innerHTML = `
      <div class="page-panel">
        <div class="page-head">
          <h2 class="page-title">통계</h2>
          <button class="page-close" id="stats-close">닫기</button>
        </div>
        <div class="page-scroll">
          <div class="page-cat">
            <div class="page-cat-name">진행도</div>
            <div class="stats-grid" id="stats-progress"></div>
          </div>
          <div class="page-cat">
            <div class="page-cat-name">전투</div>
            <div class="stats-grid" id="stats-combat"></div>
          </div>
          <div class="page-cat">
            <div class="page-cat-name">자원</div>
            <div class="stats-grid" id="stats-economy"></div>
          </div>
        </div>
      </div>`;

    const prog = el.querySelector('#stats-progress');
    prog.appendChild(statCard('총 런', formatNum(s.runs || 0), '#f0d27a', s.runs || 0));
    prog.appendChild(statCard('최장 생존', formatTime(s.longestSurvival || 0), '#88e0c0'));
    prog.appendChild(statCard('최고 도달 레벨', 'Lv ' + (s.maxLevel || 1), '#6fb4dc'));
    prog.appendChild(statCard('해금한 챕터', (save.unlockedChapters || 3) + ' / 6', '#c894ff'));
    // achievement totals — a tier-counted progress card driven by save.achievements
    const ach = save.achievements || {};
    let achDone = 0;
    for (const k in ach) if (ach[k]) achDone++;
    const achTotal = ACHIEVEMENTS.length;
    prog.appendChild(statCard('도전 과제', `${achDone} / ${achTotal}`, '#ffd700', achDone));

    const combat = el.querySelector('#stats-combat');
    combat.appendChild(statCard('누적 처치', formatNum(s.kills || 0), '#e0584a', s.kills || 0));
    combat.appendChild(statCard('누적 보스', formatNum(s.bosses || 0), '#c8332a', s.bosses || 0));
    combat.appendChild(statCard('누적 치명타', formatNum(s.crits || 0), '#ff7a36', s.crits || 0));
    combat.appendChild(statCard('누적 데미지', formatNum(Math.floor(s.damage || 0)), '#f0d27a', Math.floor(s.damage || 0)));

    const econ = el.querySelector('#stats-economy');
    econ.appendChild(statCard('보유 골드', formatNum(save.gold || 0), '#ffd700', save.gold || 0));
    econ.appendChild(statCard('누적 골드', formatNum(save.goldLifetime || 0), '#ffd700', save.goldLifetime || 0));
    let upgradeTotal = 0;
    for (const k in save.upgrades) upgradeTotal += save.upgrades[k] || 0;
    econ.appendChild(statCard('대장간 강화', upgradeTotal + ' Lv', '#88e0c0'));
    // (per-hero 영웅 강화 stat removed — progression is global via the forge.)

    el.querySelector('#stats-close').addEventListener('click', close);
  }

  return {
    open(cb) {
      closeCb = cb;
      build(); // re-read every time so the page reflects the latest run
      el.classList.remove('hidden');
    },
  };
}
