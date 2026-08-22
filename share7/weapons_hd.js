// HD weapon projectiles — basic 11 + legendary 9, polished with multi-tone
// shading and outlines. Bigger silhouettes (10×10 / 12×12 / 14×6) so they
// read clearly during combat.

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }

  // ── Wand bolt HD — 12×8 with bright core + trailing ember ──
  const WAND_HD_A = pad([
    '............',
    '......1PPP1.',
    '.....1PYfP1.',
    '.b..1PfffP1.',
    'b9YY1PffffP1',  // streak tail
    'b9YY1PfffP1.',
    '.b..1PYfP1..',
    '......1PP1..',
  ], 12);
  const WAND_HD_B = pad([
    '............',
    '.....1PPP1..',
    '....1PYfP1..',
    '.b.1PfffP1..',
    'b.1Pfff9P1..',  // pulse
    'b.1PfffP1...',
    '.b1PYfP1....',
    '.....1PP1...',
  ], 12);

  // ── Nova orb HD — 12×12 arcane sphere with white core ──
  function novaHD(pulse) {
    const cx = 5.5, cy = 5.5, W = 12;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= 0.7 + pulse * 0.3) g[y][x] = 'P';
      else if (d <= 1.5) g[y][x] = 'q';
      else if (d <= 2.5) g[y][x] = pulse ? 'P' : 'q';
      else if (d <= 3.5) g[y][x] = 'M';
      else if (d <= 4.5) g[y][x] = 'm';
      else if (d <= 5.5) g[y][x] = 'p';
      else if (d <= 5.7) g[y][x] = '1';
    }
    return g.map((r) => r.join(''));
  }
  const NOVA_HD_A = novaHD(0);
  const NOVA_HD_B = novaHD(1);

  // ── Prism shard HD — 14×14 evolved cyan crystal ──
  const PRISM_HD_A = pad([
    '..............',
    '......1PP1....',
    '.....1PWIP1...',
    '....1PIIWWP1..',
    '...1PWIIWWIP1.',
    '..1PIIINNIWWP1',
    '.1PWIINNNNIIP1',  // core
    '1PIIIINNNNIIP1',
    '.1PWIINNNNIIP1',
    '..1PIIINNIWWP1',
    '...1PWIIWWIP1.',
    '....1PIIWWP1..',
    '.....1PWIP1...',
    '......1PP1....',
  ], 14);
  const PRISM_HD_B = pad([
    '..............',
    '......1PP1....',
    '.....1qWIq1...',
    '....1qIWWqq1..',
    '...1qWIWWqI1..',
    '..1qIIWNNqWq1.',
    '.1qIIINNNNIIq1',  // pulses brighter
    '1qWIINPPNNIIq1',
    '.1qIIINNNNIIq1',
    '..1qIIWNNqWq1.',
    '...1qWIWWqI1..',
    '....1qIWWqq1..',
    '.....1qWIq1...',
    '......1PP1....',
  ], 14);

  // ── Spear HD — 16×6 with metallic blade ──
  const SPEAR_HD_A = pad([
    '................',
    '.1bcccbcccbcc6P1',  // shaft
    '1cbcccbcccbc6PP1',  // tip
    '.1bcccbcccbcc6P1',
    '................',
    '................',
  ], 16);
  const SPEAR_HD_B = pad([
    '................',
    '.1bcccbcccbc6PP1',
    '1cbcccbcccbcPYP1',  // glint
    '.1bcccbcccbc6PP1',
    '................',
    '................',
  ], 16);

  // ── Axe HD — 14×14 boomerang with spinning blade ──
  function axeHD(rot) {
    if (rot === 0) {
      // horizontal
      return pad([
        '..............',
        '....166666....',
        '...16555556...',
        '..165555556...',
        '.1655PPPP556..',
        '16555P11P5566.',  // blade highlights
        '.1c6cccccc66..',  // wood haft
        '..1c......6...',
        '..1c..........',
        '..1c..........',
        '..1b..........',
        '..1b..........',
        '..............',
        '..............',
      ], 14);
    } else if (rot === 1) {
      return pad([
        '..............',
        '.....c11......',
        '.....cb1......',
        '....cb6.......',
        '...cb66.......',
        '..cb66P.......',
        '.cb66P55......',
        '.b66555556....',
        '.b66P555566...',
        '.bc6P55556....',
        '..bcccccc.....',
        '..............',
        '..............',
        '..............',
      ], 14);
    } else if (rot === 2) {
      return pad([
        '..............',
        '..1c..........',
        '..1b..........',
        '..1b..........',
        '..1c......6...',
        '.1c6cccccc66..',
        '16555P11P5566.',
        '.1655PPPP556..',
        '..165555556...',
        '...16555556...',
        '....166666....',
        '..............',
        '..............',
        '..............',
      ], 14);
    } else {
      return pad([
        '..............',
        '..............',
        '....c6cccccb..',
        '...655556cb...',
        '..655555cb....',
        '..555P55b66...',
        '.5P11P55b66...',
        '..555P55c6....',
        '..655555c.....',
        '...655556.....',
        '....666c......',
        '............c.',
        '............c.',
        '............c.',
      ], 14);
    }
  }
  const AXE_HD_F1 = axeHD(0);
  const AXE_HD_F2 = axeHD(1);
  const AXE_HD_F3 = axeHD(2);
  const AXE_HD_F4 = axeHD(3);

  // ── Mace HD — 10×12 spiked gold head + wood haft ──
  const MACE_HD_A = pad([
    '..........',
    '.1YYYYYY1.',
    '1Y999999Y1',
    '1Y988889Y1',
    '1Y98PP89Y1',  // top highlight
    '1Y98PP89Y1',
    '1Y988889Y1',
    '1Y999999Y1',
    '.1YYYYYY1.',
    '...1bb1...',
    '...1bb1...',
    '...1cc1...',
  ], 10);
  const MACE_HD_B = pad([
    '..........',
    '.1YYPYYY1.',
    '1Y9PP999Y1',  // shifted highlight
    '1Y98PP89Y1',
    '1Y98PP89Y1',
    '1Y988889Y1',
    '1Y988P89Y1',
    '1Y999P99Y1',
    '.1YYYYYY1.',
    '...1bb1...',
    '...1bb1...',
    '...1cc1...',
  ], 10);

  // ── Holy Water HD — 10×12 cobalt potion ──
  const HOLYWATER_HD_A = pad([
    '..........',
    '..1kkkk1..',
    '..1kIIk1..',  // cork
    '.1kIIIIk1.',
    '.1kIWWIIk1',
    '1kIIWWWWIk',
    '1kIWWPWWIk',  // shine
    '1kIIWWWWIk',
    '1kIIWWIIk1',
    '.1kIIIIk1.',
    '..1kkkk1..',
    '...1bb1...',
  ], 10);
  const HOLYWATER_HD_B = HOLYWATER_HD_A.map((r) => r);

  // ── Arrow HD — 16×6 with feather + steel tip + gold band ──
  const ARROW_HD_A = pad([
    '................',
    '.1hccccccccc6Y1.',
    '1hcccccccccc6YY1',  // tip + gold band
    '.1hccccccccc6Y1.',
    '.h.h............',  // feathers
    '..h.h...........',
  ], 16);
  const ARROW_HD_B = pad([
    '................',
    '.1hcccccccccc6Y1',
    '1hccccccccccc6YP',  // glint
    '.1hcccccccccc6Y1',
    '..h.h...........',
    '...h.h..........',
  ], 16);

  // ── Garlic HD — 12×12 white clove with pulsing aura ──
  function garlicHD(pulse) {
    const r = pulse ? 5.2 : 4.7;
    const W = 12, cx = 5.5, cy = 5.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (Math.abs(d - r) < 0.6) g[y][x] = pulse ? 'P' : 'q';
      else if (Math.abs(d - r) < 1.2) g[y][x] = pulse ? 'q' : 'h';
    }
    // clove
    const clove = [
      '.77.',
      '7777',
      '7PP7',
      '7PP7',
      '7777',
    ];
    for (let y = 0; y < clove.length; y++) for (let x = 0; x < clove[y].length; x++) {
      if (clove[y][x] !== '.') g[3 + y][4 + x] = clove[y][x];
    }
    return g.map((r) => r.join(''));
  }
  const GARLIC_HD_A = garlicHD(false);
  const GARLIC_HD_B = garlicHD(true);

  // ── Bible HD — 12×10 thick tome ──
  const BIBLE_HD_A = pad([
    '............',
    '..1bbbbbbb1.',
    '.1bccccccbb1',  // cover + spine
    '.1b777777cb1',  // page top
    '.1b7Y99Y77b1',  // gold cross top
    '.1b7Y9P9Y7b1',  // cross center
    '.1b77Y9Y77b1',
    '.1b777Y777b1',  // cross bottom
    '.1bccccccbb1',
    '..1bbbbbbb1.',
  ], 12);
  const BIBLE_HD_B = pad([
    '............',
    '..1bbbbbbb1.',
    '.1bccccccbb1',
    '.1b777P77cb1',
    '.1b7YPPPY7b1',  // pulse
    '.1b7P9P9P7b1',
    '.1b77P9Y77b1',
    '.1b777Y777b1',
    '.1bccccccbb1',
    '..1bbbbbbb1.',
  ], 12);

  // ── Cross HD — 12×12 rotating golden crucifix ──
  function crossHD(rot) {
    const W = 12;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const cx = 5.5, cy = 5.5;
    const cos = Math.cos(rot), sin = Math.sin(rot);
    function plot(lx, ly, c) {
      const x = Math.round(cx + lx * cos - ly * sin);
      const y = Math.round(cy + lx * sin + ly * cos);
      if (x >= 0 && x < W && y >= 0 && y < W) g[y][x] = c;
    }
    // vertical arm (long)
    for (let i = -5; i <= 5; i++) {
      plot(0, i, i === 0 ? 'P' : (Math.abs(i) < 3 ? 'Y' : '9'));
      plot(-1, i, '8');
      plot(1, i, '8');
    }
    // horizontal arm
    for (let i = -3; i <= 3; i++) {
      plot(i, -1, '9');
      plot(i, 0, 'Y');
      plot(i, 1, '8');
    }
    // gold spec
    plot(0, 0, 'P');
    return g.map((r) => r.join(''));
  }
  const CROSS_HD_F1 = crossHD(0);
  const CROSS_HD_F2 = crossHD(Math.PI * 0.25);
  const CROSS_HD_F3 = crossHD(Math.PI * 0.5);
  const CROSS_HD_F4 = crossHD(Math.PI * 0.75);

  // ── LEGENDARY BLADE HD — 14×14 flaming greatsword ──
  const LEG_BLADE_HD_A = pad([
    '..............',
    '....1PPPPP1...',
    '...1PYIIIYP1..',  // glowing edge
    '..1PYIIPIIYP1.',  // mirror highlight
    '..1PYIWWWIYP1.',
    '..1PYIIIIIYP1.',
    '..1PYIIIIIYP1.',
    '..1PYIIIIIYP1.',
    '..1PYIIIIIYP1.',
    '...1PY9899YP1.',  // gold hilt top
    '....1Y9889Y1..',
    '.....1cccc1...',  // grip
    '.....1bbbb1...',
    '.....1cccc1...',
  ], 14);
  const LEG_BLADE_HD_B = pad([
    '..............',
    '....1PPPPP1...',
    '...1PYIWIYP1..',
    '..1PYWIIWIYP1.',
    '..1PYIIPIIIYP1',  // flame spec moves
    '..1PYIIIPIYP1.',
    '..1PYIIWIIYP1.',
    '..1PYIIIIIYP1.',
    '..1PYIPIIIYP1.',
    '...1PY9889YP1.',
    '....1Y9P89Y1..',
    '.....1cccc1...',
    '.....1bbbb1...',
    '.....1cccc1...',
  ], 14);

  // Register and assign FPS
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      proj_wand_hd: [WAND_HD_A, WAND_HD_B],
      proj_nova_hd: [NOVA_HD_A, NOVA_HD_B, NOVA_HD_A, NOVA_HD_B],
      proj_prism_hd: [PRISM_HD_A, PRISM_HD_B, PRISM_HD_A, PRISM_HD_B],
      proj_spear_hd: [SPEAR_HD_A, SPEAR_HD_B],
      proj_axe_hd: [AXE_HD_F1, AXE_HD_F2, AXE_HD_F3, AXE_HD_F4],
      proj_mace_hd: [MACE_HD_A, MACE_HD_B],
      proj_holywater_hd: [HOLYWATER_HD_A, HOLYWATER_HD_B],
      proj_arrow_hd: [ARROW_HD_A, ARROW_HD_B],
      proj_garlic_hd: [GARLIC_HD_A, GARLIC_HD_B],
      proj_bible_hd: [BIBLE_HD_A, BIBLE_HD_B],
      proj_cross_hd: [CROSS_HD_F1, CROSS_HD_F2, CROSS_HD_F3, CROSS_HD_F4],
      proj_leg_blade_hd: [LEG_BLADE_HD_A, LEG_BLADE_HD_B],
    });
    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Projectiles · HD (polished)',
        items: ['proj_wand_hd', 'proj_nova_hd', 'proj_prism_hd', 'proj_spear_hd',
                'proj_axe_hd', 'proj_mace_hd', 'proj_holywater_hd', 'proj_arrow_hd',
                'proj_garlic_hd', 'proj_bible_hd', 'proj_cross_hd', 'proj_leg_blade_hd'],
      });
    }
  }
  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      proj_wand_hd: 14, proj_nova_hd: 8, proj_prism_hd: 10,
      proj_spear_hd: 6, proj_axe_hd: 16, proj_mace_hd: 6,
      proj_holywater_hd: 6, proj_arrow_hd: 16, proj_garlic_hd: 8,
      proj_bible_hd: 5, proj_cross_hd: 18,
      proj_leg_blade_hd: 8,
    });
  }
})();
