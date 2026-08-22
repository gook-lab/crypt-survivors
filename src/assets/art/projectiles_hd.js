// Projectiles HD — polished weapon projectile sprites with smooth gradients,
// outlines, and proper motion-suggesting tails. Each replaces the procedural
// originals via _hd suffix; original keys preserved.

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }

  // ============================================================
  // WAND BOLT HD — 14×8 · golden bolt with comet tail
  // ============================================================
  const WAND_BOLT_HD_A = pad([
    '..............',
    '........1PPP1.',
    '......1PYYfPP.',
    '.b.bcc1Y9888P1',  // tail trail
    'b9YYY1Y988PfP1',
    '.b.bcc1Y9888P1',
    '......1PYYfPP.',
    '........1PPP1.',
  ], 14);
  const WAND_BOLT_HD_B = pad([
    '..............',
    '.......1PPPP1.',
    '......1PYfPP..',
    '.b.cc11Y8889P1',
    'b9YY1Y988PfPP1',
    '.b.cc11Y8889P1',
    '......1PYfPP..',
    '.......1PPPP1.',
  ], 14);

  // ============================================================
  // NOVA ORB HD — 14×14 · radial gradient with white core
  // ============================================================
  function novaOrbHD(pulse) {
    const W = 14, cx = 6.5, cy = 6.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= 0.8 + pulse * 0.3) g[y][x] = 'P';
      else if (d <= 1.8) g[y][x] = 'q';
      else if (d <= 2.8) g[y][x] = 'M';
      else if (d <= 4) g[y][x] = 'M';
      else if (d <= 5) g[y][x] = 'm';
      else if (d <= 5.8) g[y][x] = 'p';
      else if (d <= 6.3) g[y][x] = '1';
    }
    return g.map((r) => r.join(''));
  }
  const NOVA_HD_A = novaOrbHD(0);
  const NOVA_HD_B = novaOrbHD(0.5);
  const NOVA_HD_C = novaOrbHD(1);
  const NOVA_HD_D = novaOrbHD(0.5);

  // ============================================================
  // PRISM SHARD HD — 14×14 · crystalline ice shard with facets
  // ============================================================
  const PRISM_HD_A = pad([
    '..............',
    '......1P1.....',
    '.....1PWP1....',
    '....1PWIWP1...',  // top facet
    '...1PIWWWIP1..',
    '..1PIWWNWWIP1.',  // mid - N=gem dark
    '.1PWIINNNIIWP1',
    '1PIIINNqqNNIIP',  // core glow
    '.1PWIINNNIIWP1',
    '..1PIWWNWWIP1.',
    '...1PIWWWIP1..',
    '....1PWIWP1...',
    '.....1PWP1....',
    '......1P1.....',
  ], 14);
  const PRISM_HD_B = pad([
    '..............',
    '......1P1.....',
    '.....1PqP1....',
    '....1PqWqP1...',
    '...1PqWWWqP1..',
    '..1PqWWNWWqP1.',
    '.1PqWINNNIWqP1',
    '1PqWINPPPNIWqP',  // brighter spec
    '.1PqWINNNIWqP1',
    '..1PqWWNWWqP1.',
    '...1PqWWWqP1..',
    '....1PqWqP1...',
    '.....1PqP1....',
    '......1P1.....',
  ], 14);

  // ============================================================
  // SPEAR HD — 18×6 · steel-tipped, gold band, dark shaft
  // ============================================================
  const SPEAR_HD_A = pad([
    '..................',
    '.1bbbbbbbbbbb6YP1.',
    '1cbbbbbbbbbbb66YPP',  // shaft + tip
    '.1bbbbbbbbbbb6YP1.',
    '..................',
    '..................',
  ], 18);
  const SPEAR_HD_B = pad([
    '..................',
    '.1bbbbbbbbbbbb6P1.',
    '1cbbbbbbbbbbb6PYP1',
    '.1bbbbbbbbbbbb6P1.',
    '..................',
    '..................',
  ], 18);

  // ============================================================
  // AXE HD — 14×14 · spinning broadaxe with wood haft (4 frames)
  // ============================================================
  function axeHD(rot) {
    const frames = {
      0: pad([
        '..............',
        '....166666....',
        '...16555556...',
        '..1655P5556...',  // blade hi
        '.16555PP5556..',
        '16555PP55556..',  // edge glint
        '.165555556b1..',  // edge
        '..16555556b1..',
        '...1666666b1..',  // haft
        '........bc1...',
        '........bc1...',
        '........bb1...',
        '........bb1...',
        '........bc1...',
      ], 14),
      1: pad([
        '..............',
        '.....c1.......',
        '.....bc1......',
        '......bc1.....',
        '......bbc1....',
        '......bbc1....',
        '.....16bc1....',  // tilted
        '....16566c1...',
        '...165555c1...',
        '..16555556....',
        '..1655P556....',  // blade angle
        '..16555556....',
        '...16555c1....',
        '....16661.....',
      ], 14),
      2: pad([
        '..............',
        '........bc1...',
        '........bb1...',
        '........bb1...',
        '........bc1...',
        '........bc1...',
        '...1666666b1..',
        '..16555556b1..',
        '.165555556b1..',
        '16555PP55556..',
        '.16555PP5556..',
        '..1655P5556...',
        '...16555556...',
        '....166666....',
      ], 14),
      3: pad([
        '..............',
        '......1661....',
        '.....16555c1..',
        '....1655556c1.',
        '...165555P56b1',  // mirror tilt
        '..1655P5556bc1',
        '..165555556bc.',
        '..1655555bc1..',
        '...16666c1....',
        '....1bbc1.....',
        '...1bc1.......',
        '..1c1.........',
        '.1............',
        '..............',
      ], 14),
    };
    return frames[rot];
  }
  const AXE_HD_F1 = axeHD(0);
  const AXE_HD_F2 = axeHD(1);
  const AXE_HD_F3 = axeHD(2);
  const AXE_HD_F4 = axeHD(3);

  // ============================================================
  // MACE / ORBIT WEAPON HD — 12×14 · gold studded ball + haft
  // ============================================================
  const MACE_HD_A = pad([
    '............',
    '...1YYYYY1..',
    '..1YY999YY1.',  // dome top
    '.1Y998PPP89Y',  // spec
    '.1Y98PP9989Y',
    '.1Y9889P889Y',
    '.1Y9988P89Y1',
    '.1Y99988899Y',
    '..1YYY9YYY1.',
    '....1bb1....',
    '....1bb1....',
    '....1cc1....',
    '....1bc1....',
    '....1cb1....',
  ], 12);
  const MACE_HD_B = pad([
    '............',
    '...1YYPYY1..',
    '..1YYPPP9YY.',
    '.1Y998P9889Y',
    '.1Y98PP9989Y',
    '.1Y9889P889Y',
    '.1Y9988P89Y1',
    '.1Y99988899Y',
    '..1YYY9YYY1.',
    '....1bb1....',
    '....1bb1....',
    '....1cc1....',
    '....1bc1....',
    '....1cb1....',
  ], 12);

  // ============================================================
  // HOLY WATER HD — 10×14 · cobalt potion with cork + sloshing liquid
  // ============================================================
  const HOLYWATER_HD_A = pad([
    '..........',
    '...1bb1...',
    '...1cc1...',  // cork
    '..1kkkk1..',
    '.1kkIIkk1.',
    '1kIWIWIIk1',
    '1kIIIIIIk1',  // liquid surface
    '1kIWWIIWIk',
    '1kIIIIIIIk',
    '1kIIIWIIIk',
    '1kIWIIIWIk',
    '.1kIIIIk1.',
    '..1kkkk1..',
    '..........',
  ], 10);
  const HOLYWATER_HD_B = pad([
    '..........',
    '...1bb1...',
    '...1cc1...',
    '..1kkkk1..',
    '.1kkIWkk1.',
    '1kIWIIWIk1',
    '1kIIWIIWIk',  // slosh
    '1kIWPIWIIk',  // bright spec
    '1kIIIWIIIk',
    '1kIWIIIIIk',
    '1kIIWIIWIk',
    '.1kIIIIk1.',
    '..1kkkk1..',
    '..........',
  ], 10);

  // ============================================================
  // ARROW HD — 18×6 · steel tip, gold band, feathered fletching
  // ============================================================
  const ARROW_HD_A = pad([
    '..................',
    '.h.1hcccccccc6YP1.',
    'hh1hccccccccc6Y6P1',  // fletching + tip
    '.h.1hcccccccc6YP1.',
    'h.................',
    '..................',
  ], 18);
  const ARROW_HD_B = pad([
    '..................',
    '..h1hcccccccc6YP1.',
    '.hh1hccccccccc6YPP',
    '..h1hcccccccc6YP1.',
    '.h................',
    '..................',
  ], 18);

  // ============================================================
  // GARLIC HD — 14×14 · pulsing aura around white clove
  // ============================================================
  function garlicHD(pulse) {
    const W = 14, cx = 6.5, cy = 6.5;
    const r = pulse ? 6.2 : 5.7;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (Math.abs(d - r) < 0.7) g[y][x] = pulse ? 'P' : 'q';
      else if (Math.abs(d - r) < 1.4) g[y][x] = pulse ? 'q' : 'h';
      else if (Math.abs(d - r) < 2.0) g[y][x] = pulse ? 'h' : 'G';
    }
    // Garlic clove in center
    const clove = [
      '..7..',
      '.777.',
      '7P7P7',
      '7P7P7',
      '.777.',
      '..7..',
    ];
    for (let y = 0; y < clove.length; y++) for (let x = 0; x < clove[y].length; x++) {
      if (clove[y][x] !== '.') g[3 + y][4 + x] = clove[y][x];
    }
    return g.map((r) => r.join(''));
  }
  const GARLIC_HD_A = garlicHD(false);
  const GARLIC_HD_B = garlicHD(true);

  // ============================================================
  // BIBLE HD — 14×11 · thick tome with gold cross + spine
  // ============================================================
  const BIBLE_HD_A = pad([
    '..............',
    '..1bbbbbbbbb1.',
    '.1bccccccccbb1',  // cover top
    '.1b777777777b1',
    '.1b77Y9889Y7b1',  // gold cross top
    '.1b77Y9P89Y7b1',  // cross center spec
    '.1b777Y89Y77b1',
    '.1b7777Y977bb1',
    '.1bccccccccbb1',  // bottom cover
    '..1bbbbbbbbb1.',
    '..............',
  ], 14);
  const BIBLE_HD_B = pad([
    '..............',
    '..1bbbbbbbbb1.',
    '.1bccccccccbb1',
    '.1b777P77777b1',
    '.1b77YPPPY77b1',  // pulse
    '.1b77P989P77b1',
    '.1b777P89Y77b1',
    '.1b7777Y977bb1',
    '.1bccccccccbb1',
    '..1bbbbbbbbb1.',
    '..............',
  ], 14);

  // ============================================================
  // CROSS HD — 14×14 · rotating gold crucifix
  // ============================================================
  function crossHD(rot) {
    const W = 14;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const cx = 6.5, cy = 6.5;
    const cos = Math.cos(rot), sin = Math.sin(rot);
    function plot(lx, ly, c) {
      const x = Math.round(cx + lx * cos - ly * sin);
      const y = Math.round(cy + lx * sin + ly * cos);
      if (x >= 0 && x < W && y >= 0 && y < W) g[y][x] = c;
    }
    // Vertical arm (long)
    for (let i = -6; i <= 6; i++) {
      const c = i === 0 ? 'P' : (Math.abs(i) < 3 ? 'Y' : (Math.abs(i) < 5 ? '9' : '8'));
      plot(0, i, c);
      if (Math.abs(i) < 6) plot(-1, i, '8');
      if (Math.abs(i) < 6) plot(1, i, '8');
    }
    // Horizontal arm
    for (let i = -4; i <= 4; i++) {
      plot(i, -1, '9');
      plot(i, 0, 'Y');
      plot(i, 1, '8');
    }
    plot(0, 0, 'P');
    return g.map((r) => r.join(''));
  }
  const CROSS_HD_F1 = crossHD(0);
  const CROSS_HD_F2 = crossHD(Math.PI * 0.25);
  const CROSS_HD_F3 = crossHD(Math.PI * 0.5);
  const CROSS_HD_F4 = crossHD(Math.PI * 0.75);

  // ============================================================
  // WHIP HD — 28×8 · chain crack with motion trail
  // ============================================================
  const WHIP_HD_F1 = pad([
    '............................',
    '............................',
    'cb..........................',
    '.cbccc......................',
    '.....cbcccc.................',
    '..........cbcccc............',
    '...............cbccccPP.....',
    '......................cP....',
  ], 28);
  const WHIP_HD_F2 = pad([
    '............................',
    'cb..........................',
    '.cbccc......................',
    '......cccc..................',
    '..........cccc..............',
    '..............cccc..........',
    '..................cccPP.....',
    '......................cPP...',
  ], 28);
  const WHIP_HD_F3 = pad([
    '............................',
    'cbccccc.....................',
    '......cccccc................',
    '............ccccc...........',
    '.................cccc.......',
    '.....................ccc....',
    '........................cPPP',
    '..........................PP',
  ], 28);
  const WHIP_HD_F4 = pad([
    'cbcc........................',
    '...cccc.....................',
    '......cccc..................',
    '.........cccc...............',
    '.............cccc...........',
    '.................cccc.......',
    '.....................ccPP..P',
    '.......................PPPPP',
  ], 28);

  // ============================================================
  // KNIFE THROW HD — 10×10 · sharp dagger, multiple frames spin
  // ============================================================
  const KNIFE_HD_F1 = pad([
    '..........',
    '......PPPP',  // tip
    '.....IIWP.',
    '....IIW1..',
    '...IIW1...',
    '..IIW1....',
    '.bIW1.....',
    'b1W1......',  // hilt
    'cbb1......',
    '..........',
  ], 10);
  const KNIFE_HD_F2 = pad([
    '..........',
    '...PP.....',
    '..PIWP....',
    '.PIWWIP...',
    '.bIWWIIp..',
    '.bIIIIIIb.',  // blade flat
    '.cbbbbbbbc',  // hilt across
    '.bIIIIIIIb',
    '..........',
    '..........',
  ], 10);
  const KNIFE_HD_F3 = pad([
    '..........',
    'cbb1......',
    '.b1W1.....',
    '.bIW1.....',
    '..IIW1....',
    '...IIW1...',
    '....IIW1..',
    '.....IIWP.',
    '......IIPP',
    '..........',
  ], 10);

  // ============================================================
  // SCYTHE HD — 18×16 · curved blade with bone handle (4 frames sweep)
  // ============================================================
  function scytheHD(sweep) {
    if (sweep === 0) {
      return pad([
        '..................',
        '...........WWW....',
        '..........WWIWW...',
        '........WIIWWIIW..',
        '.......WIWWWWWIIW.',
        '......WIWW.....WW.',
        '....WWIWW.........',  // curved blade
        '...WWIWW..........',
        '..WIIWW...........',
        '..IIWW............',
        '..1bbbbb..........',  // bone handle
        '...1bb1...........',
        '....1b1...........',
        '....1b1...........',
        '....1c1...........',
        '....1bc1..........',
      ], 18);
    } else if (sweep === 1) {
      return pad([
        '..................',
        '...........WWWWWW.',
        '.........WWWWIIWW.',
        '.......WIIWWIIWIWP',
        '....WIIWIWWWWWWWWW',  // sweeping right
        '...WIWW...........',
        '..WIWW............',
        '..IWW.............',
        '..1bb.............',
        '..1bbbbb..........',
        '...1bb1...........',
        '....1b1...........',
        '....1b1...........',
        '....1c1...........',
        '....1bc1..........',
        '..................',
      ], 18);
    } else if (sweep === 2) {
      return pad([
        '..................',
        '............WWW...',
        '...........WWIWW..',
        '.........WIWWWWW..',
        '........WIIWWIWP..',
        '......WIWWWWWWWP..',  // mid swing
        '....WWWWWWWWWP....',
        '..WWWWWWWWWP......',
        '.WWWWWWWWP........',
        '.WWWWWWPP.........',
        '..1bbbbb..........',
        '...1bb1...........',
        '....1b1...........',
        '....1b1...........',
        '....1c1...........',
        '....1bc1..........',
      ], 18);
    } else {
      return pad([
        '..................',
        '.....WWW..........',
        '....WIIWW.........',
        '...WWWIIWW........',
        '..WIIWWIIW........',  // fully past
        '..WIWWWWIW........',
        '..WWW.WIIW........',
        '......WIW.........',
        '......WW..........',
        '.......W..........',
        '..1bbbbb..........',
        '...1bb1...........',
        '....1b1...........',
        '....1b1...........',
        '....1c1...........',
        '....1bc1..........',
      ], 18);
    }
  }
  const SCYTHE_HD_F1 = scytheHD(0);
  const SCYTHE_HD_F2 = scytheHD(1);
  const SCYTHE_HD_F3 = scytheHD(2);
  const SCYTHE_HD_F4 = scytheHD(3);

  // ============================================================
  // LEGENDARY BLADE HD — 16×16 · flaming greatsword (2 frames)
  // ============================================================
  const LEG_BLADE_HD_A = pad([
    '................',
    '......1PPPP1....',
    '.....1PYIIIY1...',  // tip
    '....1PYIIWWY1...',
    '...1PYIPPWWYP1..',
    '..1PYIPPWPWWYP1.',
    '..1PYIPPPWPYWPP.',  // blade core
    '..1PYIPPPWPWWY1.',
    '..1PYIPPPWPYWP1.',
    '..1PYIIWWWWYYY1.',
    '..1PYY999889YPP.',  // gold hilt top
    '....1Y98P89Y1...',
    '.....1Y8889Y1...',  // pommel
    '......1cccc1....',  // grip
    '......1bccb1....',
    '......1cccc1....',
  ], 16);
  const LEG_BLADE_HD_B = pad([
    '................',
    '......1PPPP1....',
    '.....1PYIIIY1...',
    '....1PYIIPWY1...',
    '...1PYIWPPWYP1..',
    '..1PYIWWPPPYWP1.',
    '..1PYIIWPPWPYWPP',  // brighter flame core
    '..1PYIIWPPPYWWY.',
    '..1PYIWPPPWPYWP1',
    '..1PYIIWWWWYYY1.',
    '..1PYY999889YPP.',
    '....1Y98P89Y1...',
    '.....1Y8889Y1...',
    '......1cccc1....',
    '......1bccb1....',
    '......1cccc1....',
  ], 16);

  // ============================================================
  // LEGENDARY ARROW HD — 18×6 · silver dragon arrow with glow
  // ============================================================
  const LEG_ARROW_HD_A = pad([
    '..................',
    '.W.1WIIWccccccc6P.',
    'WW1WIIWcccccccc6PP',
    '.W.1WIIWccccccc6P.',
    '..................',
    '..................',
  ], 18);
  const LEG_ARROW_HD_B = pad([
    '..................',
    '..W1IWWIcccccccPP.',
    '.WW1WIIWccccccc6PP',
    '..W1IWWIcccccccPP.',
    '..................',
    '..................',
  ], 18);

  // ============================================================
  // LEGENDARY NOVA HD — 14×14 · golden sun with rays
  // ============================================================
  function legNovaHD(rot) {
    const W = 14, cx = 6.5, cy = 6.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    // Sun core with gradient
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= 1) g[y][x] = 'P';
      else if (d <= 2.2) g[y][x] = 'f';
      else if (d <= 3.4) g[y][x] = 'Y';
      else if (d <= 4.4) g[y][x] = '9';
      else if (d <= 5.2) g[y][x] = '8';
    }
    // 12 sunrays
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6 + rot;
      const long = i % 2 === 0;
      const rEnd = long ? 6.7 : 5.8;
      for (let r = 5.4; r <= rEnd; r += 0.4) {
        const x = Math.round(cx + Math.cos(a) * r);
        const y = Math.round(cy + Math.sin(a) * r);
        if (x >= 0 && x < W && y >= 0 && y < W) {
          if (r < 5.8) g[y][x] = 'Y';
          else if (r < 6.3) g[y][x] = '9';
          else g[y][x] = '8';
        }
      }
    }
    return g.map((r) => r.join(''));
  }
  const LEG_NOVA_HD_1 = legNovaHD(0);
  const LEG_NOVA_HD_2 = legNovaHD(Math.PI / 12);
  const LEG_NOVA_HD_3 = legNovaHD(Math.PI / 6);
  const LEG_NOVA_HD_4 = legNovaHD(Math.PI / 4);

  // ============================================================
  // Register
  // ============================================================
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      proj_wand_hd2:        [WAND_BOLT_HD_A, WAND_BOLT_HD_B],
      proj_nova_hd2:        [NOVA_HD_A, NOVA_HD_B, NOVA_HD_C, NOVA_HD_D],
      proj_prism_hd2:       [PRISM_HD_A, PRISM_HD_B, PRISM_HD_A, PRISM_HD_B],
      proj_spear_hd2:       [SPEAR_HD_A, SPEAR_HD_B],
      proj_axe_hd2:         [AXE_HD_F1, AXE_HD_F2, AXE_HD_F3, AXE_HD_F4],
      proj_mace_hd2:        [MACE_HD_A, MACE_HD_B],
      proj_holywater_hd2:   [HOLYWATER_HD_A, HOLYWATER_HD_B],
      proj_arrow_hd2:       [ARROW_HD_A, ARROW_HD_B],
      proj_garlic_hd2:      [GARLIC_HD_A, GARLIC_HD_B],
      proj_bible_hd2:       [BIBLE_HD_A, BIBLE_HD_B],
      proj_cross_hd2:       [CROSS_HD_F1, CROSS_HD_F2, CROSS_HD_F3, CROSS_HD_F4],
      proj_whip_hd2:        [WHIP_HD_F1, WHIP_HD_F2, WHIP_HD_F3, WHIP_HD_F4],
      proj_knives_hd2:      [KNIFE_HD_F1, KNIFE_HD_F2, KNIFE_HD_F3],
      proj_scythe_hd2:      [SCYTHE_HD_F1, SCYTHE_HD_F2, SCYTHE_HD_F3, SCYTHE_HD_F4],
      proj_leg_blade_hd2:   [LEG_BLADE_HD_A, LEG_BLADE_HD_B],
      proj_leg_arrow_hd2:   [LEG_ARROW_HD_A, LEG_ARROW_HD_B],
      proj_leg_nova_hd2:    [LEG_NOVA_HD_1, LEG_NOVA_HD_2, LEG_NOVA_HD_3, LEG_NOVA_HD_4],
    });
    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Projectiles · HD2 (정교 패스)',
        items: ['proj_wand_hd2','proj_nova_hd2','proj_prism_hd2','proj_spear_hd2',
                'proj_axe_hd2','proj_mace_hd2','proj_holywater_hd2','proj_arrow_hd2',
                'proj_garlic_hd2','proj_bible_hd2','proj_cross_hd2','proj_whip_hd2',
                'proj_knives_hd2','proj_scythe_hd2',
                'proj_leg_blade_hd2','proj_leg_arrow_hd2','proj_leg_nova_hd2'],
      });
    }
  }
  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      proj_wand_hd2: 14, proj_nova_hd2: 8, proj_prism_hd2: 10,
      proj_spear_hd2: 6, proj_axe_hd2: 16, proj_mace_hd2: 6,
      proj_holywater_hd2: 6, proj_arrow_hd2: 16, proj_garlic_hd2: 8,
      proj_bible_hd2: 5, proj_cross_hd2: 18, proj_whip_hd2: 14,
      proj_knives_hd2: 18, proj_scythe_hd2: 10,
      proj_leg_blade_hd2: 8, proj_leg_arrow_hd2: 16, proj_leg_nova_hd2: 10,
    });
  }
})();
