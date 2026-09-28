// Title screen — the run entry point (HTML/CSS overlay).
// Shows the menu key-art illustration and the entry buttons: start a run,
// open the shop, browse achievements, the weapon arsenal, the bestiary.

export function createTitle(mount) {
  const el = document.createElement('div');
  el.className = 'title';
  el.innerHTML = `
    <div class="title-box">
      <button class="title-gear" id="title-settings" aria-label="설정" title="설정">⚙</button>
      <p class="title-tag">A BULLET-HEAVEN</p>
      <h1 class="title-name">CRYPT SURVIVORS</h1>
      <p class="title-sub">던전의 무리를 베고 살아남아라 · 화살표 / WASD 이동</p>
      <button class="title-btn title-btn-go" id="title-start">모험 시작</button>
      <button class="title-btn" id="title-weekly">주간 도전</button>
      <button class="title-btn" id="title-shop">대장간</button>

      <div class="title-sections">
        <div class="title-section">
          <h3 class="title-section-head">게임 정보</h3>
          <div class="title-btn-row">
            <button class="title-btn title-btn-sm" id="title-bestiary">도감</button>
            <button class="title-btn title-btn-sm" id="title-arsenal">무기고</button>
            <button class="title-btn title-btn-sm" id="title-spirits">정령</button>
            <button class="title-btn title-btn-sm" id="title-status">상태 효과</button>
          </div>
        </div>

        <div class="title-section">
          <h3 class="title-section-head">나의 기록</h3>
          <div class="title-btn-row">
            <button class="title-btn title-btn-sm" id="title-ach">도전 과제</button>
            <button class="title-btn title-btn-sm" id="title-stats">통계</button>
            <button class="title-btn title-btn-sm" id="title-history">기록</button>
          </div>
        </div>
      </div>
    </div>
  `;
  mount.appendChild(el);

  // parallax layers — drifting mist + twinkling stars + a bat silhouette
  // crossing on a slow loop. Pure CSS, sits between the key-art and the menu.
  ['title-fog', 'title-twinkle', 'title-bat'].forEach((cls) => {
    const layer = document.createElement('div');
    layer.className = cls;
    el.appendChild(layer);
  });

  // Title Scene — the key-art illustration rendered as a full-bleed crisp
  // background behind the menu (the 240×135 16:9 art upscaled to fill).
  const SPRITES = window.SPRITES;
  if (window.AtlasBuilder && SPRITES && SPRITES.scene_title) {
    const src = window.AtlasBuilder.renderFrame('scene_title', 0);
    const zoom = 6;
    const art = document.createElement('canvas');
    art.className = 'title-scene';
    art.width = src.width * zoom;
    art.height = src.height * zoom;
    const ctx = art.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, 0, 0, art.width, art.height);
    el.insertBefore(art, el.firstChild);
  }

  const cbs = {};
  el.querySelector('#title-start').addEventListener('click', () => {
    el.classList.add('hidden');
    if (cbs.start) cbs.start(false);
  });
  el.querySelector('#title-weekly').addEventListener('click', () => {
    el.classList.add('hidden');
    if (cbs.start) cbs.start(true);
  });
  el.querySelector('#title-shop').addEventListener('click', () => {
    if (cbs.shop) cbs.shop();
  });
  el.querySelector('#title-ach').addEventListener('click', () => {
    if (cbs.ach) cbs.ach();
  });
  el.querySelector('#title-arsenal').addEventListener('click', () => {
    if (cbs.arsenal) cbs.arsenal();
  });
  el.querySelector('#title-bestiary').addEventListener('click', () => {
    if (cbs.bestiary) cbs.bestiary();
  });
  el.querySelector('#title-status').addEventListener('click', () => {
    if (cbs.status) cbs.status();
  });
  el.querySelector('#title-spirits').addEventListener('click', () => {
    if (cbs.spirits) cbs.spirits();
  });
  el.querySelector('#title-settings').addEventListener('click', () => {
    if (cbs.settings) cbs.settings();
  });

  // Hell-mode corner badge — visible only after hellModeUnlocked. Clickable
  // shortcut: toggles the run-time hellModeEnabled save flag with a flash.
  function refreshHellBadge() {
    const existing = el.querySelector('.title-hell-badge');
    if (existing) existing.remove();
    let save;
    try { save = JSON.parse(localStorage.getItem('vs-clone-save') || '{}'); } catch { save = {}; }
    if (!save.hellModeUnlocked) return;
    const badge = document.createElement('div');
    badge.className = 'title-hell-badge toggleable';
    badge.textContent = save.hellModeEnabled ? '🔥 지옥 ON' : '🔥 지옥 OFF';
    badge.addEventListener('click', (ev) => {
      ev.stopPropagation();
      try {
        const sv = JSON.parse(localStorage.getItem('vs-clone-save') || '{}');
        sv.hellModeEnabled = !sv.hellModeEnabled;
        localStorage.setItem('vs-clone-save', JSON.stringify(sv));
        refreshHellBadge();
      } catch {}
    });
    el.appendChild(badge);
  }
  refreshHellBadge();
  el.querySelector('#title-stats').addEventListener('click', () => {
    if (cbs.stats) cbs.stats();
  });
  el.querySelector('#title-history').addEventListener('click', () => {
    if (cbs.history) cbs.history();
  });

  return {
    onStart: (cb) => { cbs.start = cb; },
    onShop: (cb) => { cbs.shop = cb; },
    onAchievements: (cb) => { cbs.ach = cb; },
    onArsenal: (cb) => { cbs.arsenal = cb; },
    onBestiary: (cb) => { cbs.bestiary = cb; },
    onStatus: (cb) => { cbs.status = cb; },
    onSpirits: (cb) => { cbs.spirits = cb; },
    onSettings: (cb) => { cbs.settings = cb; },
    onStats: (cb) => { cbs.stats = cb; },
    onHistory: (cb) => { cbs.history = cb; },
    show: () => el.classList.remove('hidden'),
    hide: () => el.classList.add('hidden'),
  };
}
