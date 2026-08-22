// Legendary weapon picker (HTML/CSS overlay).
//
// Opens when a boss-dropped treasure chest is collected. Shows up to 3
// legendary weapons with a sprite preview; the game is paused (loop gates the
// sim on state). Picking one hands it back through the callback.

// One-line flavour describing how a weapon behaves.
function describe(def) {
  if (def.kind === 'melee') return '근접 · 막대한 일격';
  if (def.pattern === 'orbit') return '회전 · 플레이어를 수호';
  if (def.pattern === 'ring') return '전방위 작렬';
  return '관통 투사체';
}

export function createLegendary(mount) {
  const el = document.createElement('div');
  el.className = 'legendary hidden';
  mount.appendChild(el);

  let choices = [];
  let onPick = null;

  // upscale a sprite frame into a crisp preview canvas
  function preview(spriteName) {
    const src = window.AtlasBuilder.renderFrame(spriteName, 0);
    const cv = document.createElement('canvas');
    cv.className = 'leg-sprite';
    const zoom = 5;
    cv.width = src.width * zoom;
    cv.height = src.height * zoom;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(src, 0, 0, cv.width, cv.height);
    return cv;
  }

  function show(list, cb) {
    choices = list;
    onPick = cb;
    el.innerHTML = `
      <div class="legendary-panel">
        <h2 class="legendary-title">✦ 전설 무기 ✦</h2>
        <p class="legendary-sub">보스의 상자에서 무기가 모습을 드러냈다</p>
        <div class="legendary-cards"></div>
        <p class="levelup-hint">클릭 또는 1·2·3 키</p>
      </div>`;
    const row = el.querySelector('.legendary-cards');
    list.forEach((c, i) => {
      const card = document.createElement('button');
      card.className = 'leg-card';
      card.dataset.i = String(i);
      card.appendChild(preview(c.def.sprite));
      const meta = document.createElement('div');
      meta.className = 'leg-meta';
      meta.innerHTML = `
        <span class="leg-key">${i + 1}</span>
        <span class="leg-name">${c.def.name}</span>
        <span class="leg-desc">${describe(c.def)}</span>`;
      card.appendChild(meta);
      card.addEventListener('click', () => pick(i));
      row.appendChild(card);
    });
    el.classList.remove('hidden');
  }

  function pick(i) {
    if (!onPick || i < 0 || i >= choices.length) return;
    const chosen = choices[i];
    const cb = onPick;
    onPick = null;
    el.classList.add('hidden');
    cb(chosen);
  }

  return { show, pick, isOpen: () => !el.classList.contains('hidden') };
}
