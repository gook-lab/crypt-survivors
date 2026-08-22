// Spirits/Pets HD2 — 4 elemental pets × 3 stages, polished 16-24px with
// multi-tone shading, outlines, and animated cores.

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }

  // ── FAIRY HD ── Stage 1 (12×12), Stage 2 (16×16), Stage 3 (24×24)
  function fairy1HD(pulse) {
    const W = 12, cx = 5.5, cy = 5.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= 1) g[y][x] = 'P';
      else if (d <= 2) g[y][x] = pulse ? 'P' : 'q';
      else if (d <= 3) g[y][x] = 'Y';
      else if (d <= 4) g[y][x] = '9';
      else if (d <= 4.7) g[y][x] = '1';
    }
    // Wing dots
    for (const [px, py] of [[1,3],[10,3],[1,8],[10,8]]) g[py][px] = pulse ? 'P' : 'h';
    return g.map((r) => r.join(''));
  }
  function fairy2HD(pulse) {
    return pad([
      '................',
      '...h.h....h.h...',  // wings
      '..hPPh....hPPh..',
      '.hPYYPh..hPYYPh.',
      '.hPYYYPhhPYYYPh.',  // wing tips
      '..hPYYYYYYYYPh..',
      '...1cc777cc1....',  // face
      '...c711117c1....',  // eyes
      '...cccccccc1....',
      '...1YGGGGGY1....',  // green dress
      '...1YGGGGGY1....',
      '...1YGGGGGY1....',
      '....1GGGG1......',
      '.....hh.hh......',  // tiny feet
      '................',
      '................',
    ], 16);
  }
  function fairy3HD(pulse) {
    return pad([
      '........................',
      '..........YYYY..........',
      '.........Y9889Y.........',  // gold crown
      '........Y998889Y........',
      '.......hYYYYYYYYh.......',
      '......h1PPPPPPPP1h......',  // wings
      '.....h1PYYYYYYYYY1h.....',
      '....h1PYYY7777YYYYP1h...',  // face
      '....h1PYY771117YYYP1h...',
      '....h1PYYY77777YYYP1h...',  // eyes
      '....h1PYYYYYYYYYYYP1h...',
      '....h1PYYYGGGGGYYYP1h...',  // dress top
      '....h1PYYGGGhGGGYYP1h...',
      '....h1PYYGGGGGGGYYP1h...',  // green dress
      '....h1YGGhhGGhhGGGY1h...',
      '.....hYGGGhGGhGGGGYh....',
      '......hGGGGGGGGGGh......',
      '.......hGGGGGGGGh.......',
      '........hGGGGGGh........',
      '.........hhYYhh.........',
      '..........hhhh..........',
      '...........hh...........',  // feet wisps
      '........................',
      '........................',
    ], 24);
  }

  // ── WATER HD ──
  function water1HD(pulse) {
    const W = 12, cx = 5.5, cy = 5.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      // Teardrop shape
      const dx = x - cx, dy = (y - cy) * 0.75;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d <= 1.5) g[y][x] = 'P';
      else if (d <= 2.5) g[y][x] = pulse ? 'P' : 'W';
      else if (d <= 3.5) g[y][x] = 'I';
      else if (d <= 4.3) g[y][x] = 'i';
      else if (d <= 4.8) g[y][x] = '1';
    }
    // Drip on top
    g[1][Math.round(cx)] = 'W';
    g[0][Math.round(cx)] = 'P';
    return g.map((r) => r.join(''));
  }
  function water2HD(pulse) {
    return pad([
      '................',
      '.......W........',  // drop top
      '......WIW.......',
      '.....WIIIW......',
      '....WIWWWIW.....',
      '...WIWPPPWIW....',  // face
      '...WIWP11PWIW...',  // eyes
      '...WIIWWWWIIW...',
      '...WIIIIIIWW....',  // body
      '...WIIIIIIWW....',
      '....WIIIIIIW....',
      '....WIIIIIIW....',
      '.....WIIIIW.....',
      '......WIIW......',
      '.......WW.......',
      '................',
    ], 16);
  }
  function water3HD(pulse) {
    return pad([
      '........................',
      '..........WWWW..........',  // crown drop
      '.........WIIIIW.........',
      '........WIIPPIIW........',
      '.......WIPPPPPPIW.......',
      '......WIIPWWWWPIIW......',  // mask
      '......WIPWP11PWPIW......',  // eyes
      '......WIPWIIIIWPIW......',
      '......WIIPWIIWPIIW......',
      '......WIIPWWWWPIIW......',
      '......WIIIPPPPIIIW......',
      '.....WIIPPWWWWPPIIW.....',
      '.....WIPWWWPPWWWWPIW....',  // flowing arms
      '......WIIIIPPPPIIIW.....',
      '......WIIIIIIIIIIW......',  // body
      '.......WIIIIIIIIW.......',
      '........WIIIIIIW........',
      '.........WIIIIW.........',
      '..........WIIW..........',
      '...........WW...........',
      '........................',
      '........................',
      '........................',
      '........................',
    ], 24);
  }

  // ── EARTH HD ──
  function earth1HD(pulse) {
    return pad([
      '............',
      '...1bccb1...',
      '..1bcc8cb1..',  // rock chunk
      '.1bcc888cb1.',
      '.1bc88P88cb.',  // gold flecks
      '.1bcc888cb1.',
      '.1bcc8c8bb1.',
      '..1bbbcbb1..',
      '...1bbbb1...',
      '....1bb1....',
      '............',
      '............',
    ], 12);
  }
  function earth2HD(pulse) {
    return pad([
      '................',
      '.....1ccccb1....',  // golem core
      '....1ccccccb1...',
      '...1bccc8ccccb1.',
      '...1cc8111118cb.',
      '...1cc88P9P88cb.',  // glow core
      '...1cc8YYYYY8cb.',
      '...1cc888888cb1.',
      '...1ccccc8cccb..',
      '....1bcccccb1...',  // body
      '....1bcGGcGcb...',  // moss
      '....1bcGGcGcb...',
      '.....1bcGcb1....',
      '......1bb1......',
      '................',
      '................',
    ], 16);
  }
  function earth3HD(pulse) {
    return pad([
      '........................',
      '.......1bcccccb1........',
      '......1bcccccccb1.......',
      '.....1bcccccccccb1......',  // golem head
      '....1bccc8888888ccb1....',
      '....1bc888111118888cb...',
      '....1bc8881PqP1888cbb...',  // glow eyes
      '....1bc888YPPPY888cbb...',
      '....1bc88YY999YY888cb...',
      '....1bcc888888888cccb...',
      '....1bcccccccccccccb....',
      '....1bccGGGcccGGGGcb....',  // moss on shoulders
      '....1bcGGhhGcGhhGGcb....',
      '....1bccGGcccGGGcccb....',
      '....1bccccccccccccb1....',
      '....1bccccccccccccb1....',  // body
      '....1bbccccccccccbb1....',
      '....1bbbccccccccbbb1....',
      '....1bbbbbbbbbbbbbb1....',
      '....1bbb..bbbb..bbb1....',
      '....1bb1..bbbb..1bb1....',
      '....1bb1..bbbb..1bb1....',  // legs
      '.....bb....bb....bb.....',
      '.....bb....bb....bb.....',
    ], 24);
  }

  // ── FIRE HD ──
  function fire1HD(pulse) {
    const W = 12, cx = 5.5, cy = 6;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    // Flame teardrop pointing up
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const r = 2.5 + Math.max(0, -dy * 0.3);
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d > r) continue;
      const intensity = 1 - d / r;
      if (intensity > 0.85) g[y][x] = 'P';
      else if (intensity > 0.65) g[y][x] = 'f';
      else if (intensity > 0.4) g[y][x] = 'e';
      else if (intensity > 0.2) g[y][x] = 'd';
      else g[y][x] = 'a';
    }
    // Tip
    if (pulse) {
      g[0][Math.round(cx)] = 'P';
      g[1][Math.round(cx)] = 'f';
    } else {
      g[1][Math.round(cx)] = 'f';
    }
    return g.map((r) => r.join(''));
  }
  function fire2HD(pulse) {
    return pad([
      '................',
      '.......f........',
      '......ffP.......',
      '.....fefef......',  // flame top
      '....feefef......',
      '....fffedef.....',
      '...fefddddef....',
      '...fed1111dde...',  // ifrit face + eyes
      '...fedRRRRRde...',
      '...feedRRRdde...',  // mouth
      '....fedddddef...',
      '....fdddddddf...',
      '....fddaaaadf...',
      '.....adddddad...',
      '.....aaa..aaa...',  // legs
      '................',
    ], 16);
  }
  function fire3HD(pulse) {
    return pad([
      '........................',
      '.........fPfP...........',  // crown flames
      '........fPfPfP..........',
      '.......fePfPfPf.........',
      '......feeefffPef........',
      '.....fefefefefeef.......',
      '....fefdedefedefef......',  // flame mane
      '...fefedddddedefef......',
      '...feddRR111RRddef......',
      '...feddRR11111RRdef.....',  // mask + eyes
      '...feedRR1RR1RRdde......',
      '...feddRRRRRRRRdde......',
      '...feddPPPPPPPdde.......',  // body band
      '...feddrrrrrrrde........',  // chest mark
      '...feedddddddde.........',
      '....feddedddedef........',
      '....fedfeededfef........',
      '....fedeeeedede.........',  // arms/wings
      '.....fffeeefff..........',
      '......aaaaaa............',
      '......a....a............',
      '......a....a............',  // legs
      '........................',
      '........................',
    ], 24);
  }

  // ── Spirit attack projectiles HD2 (10×10) ──
  function petProjHD(core, mid, outer) {
    return pad([
      '..........',
      '...1pp1...',
      '..1pcpcp1.',
      '.1pcmcmcp1',
      '.pcm' + core + core + 'mcp',  // glowing core
      '.pcm' + core + core + 'mcp',
      '.1pcmcmcp1',
      '..1pcpcp1.',
      '...1pp1...',
      '..........',
    ].map(r => r.replace(/c/g, outer).replace(/m/g, mid).replace(/p/g, '1')), 10);
  }
  const ATK_FAIRY_HD = petProjHD('P', 'Y', '9');
  const ATK_WATER_HD = petProjHD('P', 'W', 'I');
  const ATK_EARTH_HD = petProjHD('P', '8', 'c');
  const ATK_FIRE_HD  = petProjHD('P', 'f', 'e');

  // ── Heal aura HD ──
  function healAuraHD(rad) {
    const W = 24, cx = 11.5, cy = 11.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (Math.abs(d - rad) < 0.5) g[y][x] = 'P';
      else if (Math.abs(d - rad) < 1.2) g[y][x] = 'h';
      else if (Math.abs(d - rad) < 2) g[y][x] = 'G';
      else if (Math.abs(d - rad) < 2.6) g[y][x] = 'g';
    }
    // Central cross
    for (let i = -2; i <= 2; i++) {
      g[Math.round(cy) + i][Math.round(cx)] = 'h';
      g[Math.round(cy)][Math.round(cx) + i] = 'h';
    }
    g[Math.round(cy)][Math.round(cx)] = 'P';
    return g.map((r) => r.join(''));
  }

  // ── Shield bubble HD ──
  function shieldHD(shimmer) {
    const W = 24, cx = 11.5, cy = 11.5, R = 10;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d > R + 0.5) continue;
      if (d > R - 0.4) g[y][x] = 'P';
      else if (d > R - 1) g[y][x] = 'W';
      else if (d > R - 1.7) g[y][x] = 'I';
      // Shimmer band
      const sx = (x + shimmer) % W;
      if (sx === 4 && d < R - 1.5 && d > 2) g[y][x] = 'P';
      if (sx === 8 && d < R - 1.5 && d > 3) g[y][x] = 'W';
    }
    return g.map((r) => r.join(''));
  }

  // Register
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      spirit_fairy_1_hd: [fairy1HD(false), fairy1HD(true)],
      spirit_fairy_2_hd: [fairy2HD(false), fairy2HD(true)],
      spirit_fairy_3_hd: [fairy3HD(false), fairy3HD(true)],
      spirit_water_1_hd: [water1HD(false), water1HD(true)],
      spirit_water_2_hd: [water2HD(false), water2HD(true)],
      spirit_water_3_hd: [water3HD(false), water3HD(true)],
      spirit_earth_1_hd: [earth1HD(false), earth1HD(true)],
      spirit_earth_2_hd: [earth2HD(false), earth2HD(true)],
      spirit_earth_3_hd: [earth3HD(false), earth3HD(true)],
      spirit_fire_1_hd:  [fire1HD(false), fire1HD(true)],
      spirit_fire_2_hd:  [fire2HD(false), fire2HD(true)],
      spirit_fire_3_hd:  [fire3HD(false), fire3HD(true)],
      spirit_atk_fairy_hd: [ATK_FAIRY_HD],
      spirit_atk_water_hd: [ATK_WATER_HD],
      spirit_atk_earth_hd: [ATK_EARTH_HD],
      spirit_atk_fire_hd:  [ATK_FIRE_HD],
      fx_heal_aura_hd:     [3,5,7,9].map(healAuraHD),
      fx_shield_bubble_hd: [shieldHD(0), shieldHD(4), shieldHD(8), shieldHD(12)],
    });
    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Spirits/Pets · HD (정교 패스)',
        items: ['spirit_fairy_1_hd','spirit_fairy_2_hd','spirit_fairy_3_hd',
                'spirit_water_1_hd','spirit_water_2_hd','spirit_water_3_hd',
                'spirit_earth_1_hd','spirit_earth_2_hd','spirit_earth_3_hd',
                'spirit_fire_1_hd','spirit_fire_2_hd','spirit_fire_3_hd',
                'spirit_atk_fairy_hd','spirit_atk_water_hd','spirit_atk_earth_hd','spirit_atk_fire_hd',
                'fx_heal_aura_hd','fx_shield_bubble_hd'],
      });
    }
    if (window.HD2_ENABLED !== false) {
      const KEYS = ['fairy_1','fairy_2','fairy_3','water_1','water_2','water_3',
                    'earth_1','earth_2','earth_3','fire_1','fire_2','fire_3'];
      for (const k of KEYS) {
        const src = 'spirit_' + k;
        const dst = src + '_hd';
        if (window.SPRITES[dst] && window.SPRITES[src]) {
          if (!window.SPRITES[src + '_original']) window.SPRITES[src + '_original'] = window.SPRITES[src];
          window.SPRITES[src] = window.SPRITES[dst];
        }
      }
      const FX = ['fairy', 'water', 'earth', 'fire'];
      for (const f of FX) {
        const src = 'spirit_atk_' + f;
        const dst = src + '_hd';
        if (window.SPRITES[dst] && window.SPRITES[src]) {
          if (!window.SPRITES[src + '_original']) window.SPRITES[src + '_original'] = window.SPRITES[src];
          window.SPRITES[src] = window.SPRITES[dst];
        }
      }
      ['fx_heal_aura', 'fx_shield_bubble'].forEach(k => {
        const dst = k + '_hd';
        if (window.SPRITES[dst] && window.SPRITES[k]) {
          if (!window.SPRITES[k + '_original']) window.SPRITES[k + '_original'] = window.SPRITES[k];
          window.SPRITES[k] = window.SPRITES[dst];
        }
      });
    }
  }
  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      spirit_fairy_1_hd: 5, spirit_fairy_2_hd: 5, spirit_fairy_3_hd: 5,
      spirit_water_1_hd: 4, spirit_water_2_hd: 4, spirit_water_3_hd: 4,
      spirit_earth_1_hd: 3, spirit_earth_2_hd: 3, spirit_earth_3_hd: 3,
      spirit_fire_1_hd: 8, spirit_fire_2_hd: 8, spirit_fire_3_hd: 8,
      fx_heal_aura_hd: 10,
      fx_shield_bubble_hd: 8,
    });
  }
})();
