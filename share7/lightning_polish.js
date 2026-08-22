// Lightning / storm projectile polish — replaces the simpler procedural
// lightning sprites with detailed multi-tone jagged bolts, storm cloud
// projectiles, and chain-lightning arcs.

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }

  // ── proj_lightning HD2 — 16×20 vertical jagged bolt with branches ──
  function lightningBoltHD2(seed) {
    const W = 16, H = 20;
    const g = Array.from({ length: H }, () => Array(W).fill('.'));
    let x = W / 2;
    for (let y = 0; y < H; y++) {
      const xR = Math.round(x);
      // Core white
      if (xR >= 0 && xR < W) g[y][xR] = 'P';
      // Light I-tone shell
      for (const off of [-1, 1]) {
        const px = xR + off;
        if (px >= 0 && px < W) g[y][px] = 'W';
      }
      // Outer glow
      for (const off of [-2, 2]) {
        const px = xR + off;
        if (px >= 0 && px < W) g[y][px] = 'I';
      }
      // Outline
      for (const off of [-3, 3]) {
        const px = xR + off;
        if (px >= 0 && px < W && g[y][px] === '.') g[y][px] = '1';
      }
      // Random kink
      x += Math.sin(y * 0.9 + seed) * 1.4 + (seed % 2 === 0 ? 0.3 : -0.3);
      x = Math.max(2, Math.min(W - 3, x));
    }
    // Branches at y=8 and y=14
    if (seed % 2 === 0) {
      for (let i = 0; i < 4; i++) {
        const x2 = W / 2 + i + 2;
        if (x2 < W) g[8 + i][Math.round(x2)] = 'P';
      }
    }
    return g.map((r) => r.join(''));
  }
  const LIGHTNING_HD2_1 = lightningBoltHD2(0);
  const LIGHTNING_HD2_2 = lightningBoltHD2(1.7);
  const LIGHTNING_HD2_3 = lightningBoltHD2(3.3);
  const LIGHTNING_HD2_4 = lightningBoltHD2(5);

  // ── proj_leg_storm_caller HD2 — 16×16 storm cloud with bolt below ──
  const STORM_CLOUD_HD2_A = pad([
    '................',
    '...1kkkkkkkk1...',  // cloud top dark
    '..1kkkkkkkkkk1..',
    '.1kkk6666666kk1.',  // mid cloud
    '1kkk67777777666k',  // bottom bright
    '1k66777777777666',
    '.166677777766661',
    '..1666666666661.',
    '...1666666661...',
    '......1WP1......',  // bolt starts
    '......1PWI1.....',
    '.....1IIIWI1....',
    '....1IIIPIII1...',  // jagged
    '....1.PIIIII1...',
    '.....1IIWI1.....',
    '......1PI1......',
  ], 16);
  const STORM_CLOUD_HD2_B = pad([
    '................',
    '...1kkkkkkkk1...',
    '..1kkkkkkkkkk1..',
    '.1kkk6666666kk1.',
    '1kkk67777777666k',
    '1k66777777777666',
    '.166677777766661',
    '..1666666666661.',
    '...1666666661...',
    '......1WPW1.....',  // flicker
    '......1PPWI1....',
    '.....1IIPIWI1...',
    '....1IIPPIIII1..',
    '....1PPIIIII1...',
    '.....1IWWI1.....',
    '......1PI1......',
  ], 16);

  // ── fx_chain_lightning HD — 24×8 horizontal chain arc ──
  function chainArcHD(seed) {
    const W = 24, H = 8;
    const g = Array.from({ length: H }, () => Array(W).fill('.'));
    let y = H / 2;
    for (let x = 0; x < W; x++) {
      const yR = Math.round(y);
      if (yR >= 0 && yR < H) g[yR][x] = 'P';
      if (yR - 1 >= 0 && g[yR - 1][x] === '.') g[yR - 1][x] = 'W';
      if (yR + 1 < H && g[yR + 1][x] === '.') g[yR + 1][x] = 'W';
      if (yR - 2 >= 0 && g[yR - 2][x] === '.') g[yR - 2][x] = 'I';
      if (yR + 2 < H && g[yR + 2][x] === '.') g[yR + 2][x] = 'I';
      // Kink
      y += Math.sin(x * 0.6 + seed) * 0.9;
      y = Math.max(2, Math.min(H - 3, y));
    }
    return g.map((r) => r.join(''));
  }
  const CHAIN_LIGHTNING_HD_1 = chainArcHD(0);
  const CHAIN_LIGHTNING_HD_2 = chainArcHD(1.3);
  const CHAIN_LIGHTNING_HD_3 = chainArcHD(2.6);
  const CHAIN_LIGHTNING_HD_4 = chainArcHD(3.9);

  // ── fx_impact_shock HD2 — 16×16 electric burst on hit ──
  const IMPACT_SHOCK_HD2_1 = pad([
    '.......P........',
    '.....PWWP.......',
    '....WIIP1.......',
    '...PIWP.........',  // jagged spokes
    '..PIIWP.P.......',
    '.PI11WPP.P......',
    'PIIIIIWPP1P.....',
    'WIWPWWWPPI1.....',  // core
    'PIIIIIPP1.......',
    '.PIIWP.P........',
    '..PIWP.P........',
    '...PIP.P........',
    '...PP.P.........',
    '...P.P..........',
    '..P.............',
    '................',
  ], 16);
  const IMPACT_SHOCK_HD2_2 = pad([
    '...P...P.P......',
    '....PP.PP.......',
    '.....PWPWP......',
    '.....PWWP.......',
    '.....WIIW.......',
    '...PWWIWWPP.....',
    '..PWIIPIIWWP....',  // ring expanding
    '.PWIWPWPIWWPP...',
    '..PWIIPIIWP.....',
    '...PWWIWWPP.....',
    '.....WIIW.......',
    '.....PWWP.......',
    '.....PWPWP......',
    '....PP.PP.......',
    '...P...P.P......',
    '................',
  ], 16);
  const IMPACT_SHOCK_HD2_3 = pad([
    'P..............P',
    '.P............P.',
    '..P..........P..',
    '...P........P...',
    '....P......P....',
    '.....P....P.....',
    '......P..P......',
    '.......PP.......',
    '......P..P......',
    '.....P....P.....',
    '....P......P....',
    '...P........P...',
    '..P..........P..',
    '.P............P.',
    'P..............P',
    '................',
  ], 16);

  // Register
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      proj_lightning_hd2:  [LIGHTNING_HD2_1, LIGHTNING_HD2_2, LIGHTNING_HD2_3, LIGHTNING_HD2_4],
      proj_leg_storm_caller_hd2: [STORM_CLOUD_HD2_A, STORM_CLOUD_HD2_B],
      fx_chain_lightning_hd: [CHAIN_LIGHTNING_HD_1, CHAIN_LIGHTNING_HD_2, CHAIN_LIGHTNING_HD_3, CHAIN_LIGHTNING_HD_4],
      fx_impact_shock_hd2: [IMPACT_SHOCK_HD2_1, IMPACT_SHOCK_HD2_2, IMPACT_SHOCK_HD2_3],
    });
    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Lightning Polish · HD2',
        items: ['proj_lightning_hd2', 'proj_leg_storm_caller_hd2', 'fx_chain_lightning_hd', 'fx_impact_shock_hd2'],
      });
    }
  }
  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      proj_lightning_hd2: 18,
      proj_leg_storm_caller_hd2: 6,
      fx_chain_lightning_hd: 22,
      fx_impact_shock_hd2: 18,
    });
  }

  // Auto-alias originals so Arsenal page picks them up
  if (window.HD2_ENABLED !== false && window.SPRITES) {
    const A = {
      proj_lightning: 'proj_lightning_hd2',
      proj_leg_storm_caller: 'proj_leg_storm_caller_hd2',
      fx_chain_lightning: 'fx_chain_lightning_hd',
      fx_impact_shock: 'fx_impact_shock_hd2',
    };
    for (const k in A) {
      if (window.SPRITES[A[k]] && window.SPRITES[k]) {
        if (!window.SPRITES[k + '_original']) window.SPRITES[k + '_original'] = window.SPRITES[k];
        window.SPRITES[k] = window.SPRITES[A[k]];
      }
    }
  }
})();
