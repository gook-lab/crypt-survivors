// Shared helpers used by every showcase page.
// Expects palette.js + sprites.js + atlas.js to have loaded already.

window.Showcase = (function () {
  const PALETTE = window.PALETTE;
  const SPRITES = window.SPRITES;
  const AB = window.AtlasBuilder;

  // animState entries: { canvas, name, elapsed }
  const animState = [];

  // Build a sprite card and register it for animation.
  function makeCard(name, opts = {}) {
    const card = document.createElement('div');
    card.className = 'card';
    const stage = document.createElement('div');
    stage.className = 'stage';
    const c = document.createElement('canvas');
    const f0 = SPRITES[name][0];
    const w = f0[0].length, h = f0.length;
    const scale = opts.scale || (w >= 32 ? 3 : w >= 24 ? 4 : w >= 16 ? 5 : 6);
    c.width = w * scale;
    c.height = h * scale;
    stage.appendChild(c);
    card.appendChild(stage);
    const label = document.createElement('div');
    label.className = 'label';
    label.innerHTML = name + '<small>' + w + '×' + h + ' · ' +
                      SPRITES[name].length + 'f · ' +
                      (AB.FPS[name] || 0) + 'fps</small>';
    card.appendChild(label);

    // Eager paint frame 0 so the card has content immediately.
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(AB.renderFrame(name, 0), 0, 0, c.width, c.height);
    animState.push({ canvas: c, name, elapsed: 0 });
    return card;
  }

  // Render a list of [{ title, items }] groups under a host element.
  function renderGroups(host, groups) {
    for (const g of groups) {
      const head = document.createElement('div');
      head.className = 'group-title';
      head.innerHTML = g.title + ' <small>' + g.items.length + ' clips</small>';
      host.appendChild(head);
      const grid = document.createElement('div');
      grid.className = 'card-grid';
      for (const name of g.items) grid.appendChild(makeCard(name));
      host.appendChild(grid);
    }
  }

  // Build the colour palette grid.
  const NAMES = {
    '0': 'pitch', '1': 'night', '2': 'shadow', '3': 'stone-3', '4': 'stone-4',
    '5': 'stone-5', '6': 'bone', '7': 'parchment', 'P': 'white',
    '8': 'gold-dk', '9': 'gold', 'Y': 'gold-hi',
    'a': 'leather-d', 'b': 'leather', 'c': 'leather-l',
    'd': 'ember', 'e': 'flame', 'f': 'flame-hi',
    'r': 'blood-d', 'R': 'blood',
    'g': 'vile-d', 'G': 'vile', 'h': 'vile-l',
    'k': 'steel-d', 'i': 'steel', 'I': 'steel-l', 'W': 'ice-hi',
    'p': 'arcane-d', 'm': 'arcane', 'M': 'arcane-l',
    'n': 'gem-d', 'N': 'gem', 'q': 'gem-hi',
  };
  function renderPalette(host) {
    for (const key in PALETTE) {
      if (PALETTE[key] == null) continue;
      const el = document.createElement('div');
      el.className = 'swatch';
      el.innerHTML = '<div class="chip" style="background:' + PALETTE[key] + '"></div>' +
                     '<div class="meta">' +
                       '<span class="key">' + key + '</span>' +
                       '<span class="hex">' + PALETTE[key] + '</span>' +
                       '<span class="hex" style="color:#5b536e">' + (NAMES[key] || '') + '</span>' +
                     '</div>';
      host.appendChild(el);
    }
  }

  // Toast helper (small bottom-right pop).
  function toast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t.__hideTimer);
    t.__hideTimer = setTimeout(() => t.classList.remove('show'), 1600);
  }

  // Common downloads wiring (sheet PNG / 4× / json / zip / source).
  // Pass a host element to append the row of buttons to.
  function renderDownloads(host) {
    const { canvas: sheet, atlasJson } = AB.buildAtlas();
    const row = document.createElement('div');
    row.className = 'download-row';
    function btn(label, sub, primary, fn) {
      const b = document.createElement('button');
      b.className = 'btn' + (primary ? ' primary' : '');
      b.innerHTML = label + '<span class="sub">' + sub + '</span>';
      b.onclick = fn;
      row.appendChild(b);
      return b;
    }
    function dlBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.click();
      URL.revokeObjectURL(url);
    }
    btn('Sprite Sheet PNG', 'spritesheet.png · 1× 픽셀', true, () => {
      sheet.toBlob((b) => dlBlob(b, 'spritesheet.png'), 'image/png');
      toast('spritesheet.png · 다운로드');
    });
    btn('Sheet 4×', 'spritesheet@4x.png · 미리보기용', true, () => {
      const c = document.createElement('canvas');
      c.width = sheet.width * 4; c.height = sheet.height * 4;
      const x = c.getContext('2d');
      x.imageSmoothingEnabled = false;
      x.drawImage(sheet, 0, 0, c.width, c.height);
      c.toBlob((b) => dlBlob(b, 'spritesheet@4x.png'), 'image/png');
      toast('spritesheet@4x.png · 다운로드');
    });
    btn('atlas.json', '클립 좌표 + fps', false, () => {
      dlBlob(new Blob([JSON.stringify(atlasJson, null, 2)], { type: 'application/json' }), 'atlas.json');
      toast('atlas.json · 다운로드');
    });
    btn('Individual PNGs (ZIP)', '클립별·프레임별 분리', false, async () => {
      if (!window.JSZip) { toast('JSZip 로딩 중…'); return; }
      const zip = new JSZip();
      zip.file('spritesheet.png', await new Promise((r) => sheet.toBlob(r, 'image/png')));
      zip.file('atlas.json', JSON.stringify(atlasJson, null, 2));
      for (const name in SPRITES) {
        const frames = SPRITES[name];
        for (let i = 0; i < frames.length; i++) {
          const c = AB.renderFrame(name, i);
          const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
          zip.file('frames/' + name + '/' + String(i).padStart(2, '0') + '.png', blob);
        }
      }
      dlBlob(await zip.generateAsync({ type: 'blob' }), 'gothic-survivors-art.zip');
      toast('ZIP 다운로드');
    });
    btn('sprites.js + palette.js', '게임 코드용 모듈', false, async () => {
      if (!window.JSZip) { toast('JSZip 로딩 중…'); return; }
      const palText = await fetch('art/palette.js').then((r) => r.text()).catch(() => '');
      const sprText = await fetch('art/sprites.js').then((r) => r.text()).catch(() => '');
      const atlText = await fetch('art/atlas.js').then((r) => r.text()).catch(() => '');
      const zip = new JSZip();
      zip.file('palette.js', palText);
      zip.file('sprites.js', sprText);
      zip.file('atlas.js', atlText);
      zip.file('README.txt',
`Gothic Survivors — Pixel Art Pack

palette.js  — window.PALETTE
sprites.js  — window.SPRITES / FONT / SPRITE_GROUPS
atlas.js    — window.AtlasBuilder.buildAtlas() / renderFrame(name, i)
`);
      dlBlob(await zip.generateAsync({ type: 'blob' }), 'gothic-survivors-art-source.zip');
      toast('소스 모듈 다운로드');
    });
    host.appendChild(row);
    return { sheet, atlasJson };
  }

  // Single animation loop drives every registered card.
  let last = performance.now();
  function tick(now) {
    const dt = (now - last) / 1000;
    last = now;
    for (const s of animState) {
      if (!SPRITES[s.name]) continue;  // skip missing sprite refs
      const fps = AB.FPS[s.name] || 0;
      s.elapsed += dt;
      const fc = SPRITES[s.name].length;
      const idx = fps > 0 && fc > 1 ? Math.floor(s.elapsed * fps) % fc : 0;
      const sub = AB.renderFrame(s.name, idx);
      const ctx = s.canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, s.canvas.width, s.canvas.height);
      ctx.drawImage(sub, 0, 0, s.canvas.width, s.canvas.height);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // Inject the shared site nav at the top of <body>. Pass `active`
  // to highlight the current page.
  function renderNav(active) {
    const pages = [
      { id: 'index', href: 'Crypt Asset Workbench.html', label: 'Hub' },
      { id: 'characters', href: 'art/showcase/characters.html', label: 'Characters' },
      { id: 'heroes_xhd', href: 'art/showcase/heroes_xhd.html', label: '★ Heroes XHD' },
      { id: 'skills_hd', href: 'art/showcase/skills_hd.html', label: '★ Skill VFX' },
      { id: 'projectiles_hd', href: 'art/showcase/projectiles_hd.html', label: '★ Projectiles' },
      { id: 'effects_hd3', href: 'art/showcase/effects_hd3.html', label: '★ Effects HD3' },
      { id: 'enemies_hd2', href: 'art/showcase/enemies_hd2.html', label: '★ Enemies' },
      { id: 'pickups_hd2', href: 'art/showcase/pickups_hd2.html', label: '★ Pickups' },
      { id: 'bestiary', href: 'art/showcase/bestiary.html', label: 'Bestiary' },
      { id: 'arsenal', href: 'art/showcase/arsenal.html', label: 'Arsenal' },
      { id: 'actions', href: 'art/showcase/actions.html', label: 'Actions' },
      { id: 'status', href: 'art/showcase/status.html', label: 'Status' },
      { id: 'evolutions', href: 'art/showcase/evolutions.html', label: 'Evolutions' },
      { id: 'levelup', href: 'art/showcase/levelup.html', label: 'Level-Up' },
      { id: 'skills', href: 'art/showcase/skills.html', label: 'Skills' },
      { id: 'loadouts', href: 'art/showcase/loadouts.html', label: 'Loadouts' },
      { id: 'identity', href: 'art/showcase/identity.html', label: 'Identity' },
      { id: 'hit_react', href: 'art/showcase/hit_react.html', label: 'Hit FX' },
      { id: 'polish', href: 'art/showcase/polish.html', label: '★ Polish' },
      { id: 'shop', href: 'art/showcase/shop.html', label: 'Shop' },
      { id: 'stages', href: 'art/showcase/stages.html', label: 'Stages' },
      { id: 'result', href: 'art/showcase/result.html', label: 'Result' },
      { id: 'achievements', href: 'art/showcase/achievements.html', label: 'Trophies' },
      { id: 'impacts', href: 'art/showcase/impacts.html', label: 'Impacts' },
      { id: 'world', href: 'art/showcase/world.html', label: 'World' },
      { id: 'tiles_unified', href: 'art/showcase/tiles_unified.html', label: '★ Tiles' },
      { id: 'minimap', href: 'art/showcase/minimap.html', label: 'Minimap' },
      { id: 'natural_map', href: 'art/showcase/natural_map.html', label: '★ Natural Map' },
      { id: 'structures', href: 'art/showcase/structures.html', label: 'Structures' },
      { id: 'structures_extra', href: 'art/showcase/structures_extra.html', label: 'Structures+' },
      { id: 'rooms', href: 'art/showcase/rooms.html', label: 'Rooms' },
      { id: 'ingame', href: 'art/showcase/ingame.html', label: 'In-Game UI' },
      { id: 'fx', href: 'art/showcase/fx.html', label: 'FX · HUD' },
      { id: 'ui', href: 'art/showcase/ui.html', label: 'UI · Demo' },
    ];
    const nav = document.createElement('nav');
    nav.className = 'sitenav';
    nav.innerHTML = '<span class="brand">Crypt · Asset Pack</span>';
    // The href is relative to the current document. Re-base for sub-pages.
    const isSubPage = location.pathname.includes('/showcase/') || active !== 'index';
    for (const p of pages) {
      const a = document.createElement('a');
      let href = p.href;
      if (isSubPage) {
        // sub-pages live in art/showcase/, so step back two dirs for Hub
        if (p.id === 'index') href = '../../' + p.href;
        else href = '../../' + p.href; // siblings — back to root then into folder
      }
      a.href = href;
      a.textContent = p.label;
      if (p.id === active) a.classList.add('active');
      nav.appendChild(a);
    }
    document.body.insertBefore(nav, document.body.firstChild);
  }

  return { renderGroups, renderPalette, renderDownloads, renderNav, makeCard, animState, toast };
})();
