// Pickups + Potions HD2 — polished 10×10 / 12×12 sprites with multi-tone
// shading, outlines, and clear silhouettes. Replaces simpler originals via
// _hd2 suffix.

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }

  // ============================================================
  // XP GEMS HD2 — 10×10 with facets + sparkle
  // ============================================================
  function gemHD2(color1, color2, color3, spec) {
    // Diamond cut crystal — 4 facets converging at a center
    return pad([
      '..........',
      '....1P1...',  // top spec
      '...1' + color3 + 'P1..',
      '..1' + color3 + color3 + spec + color3 + '1.',  // upper facets
      '.1' + color3 + color2 + color2 + color3 + color3 + '1',
      '1' + color3 + color2 + color1 + color2 + color3 + color3 + '1',
      '.1' + color3 + color1 + color2 + color3 + '1.',
      '..1' + color3 + color1 + color3 + '1..',
      '...1' + color3 + '1...',  // bottom point
      '....1.....',
    ], 10);
  }
  function gemSparkleHD2(color1, color2, color3) {
    // Alternate frame with brighter spec
    return pad([
      '....1.....',
      '....1P1...',
      '...1PP1...',
      '..1' + color3 + 'P' + 'P' + color3 + '1.',
      '.1' + color3 + color2 + 'P' + color2 + color3 + color3 + '1',
      '1' + color3 + color2 + color1 + 'P' + color2 + color3 + color3 + '1',
      '.1' + color3 + color1 + color2 + color3 + '1.',
      '..1' + color3 + color1 + color3 + '1..',
      '...1' + color3 + '1...',
      '....1.....',
    ], 10);
  }
  const XP_BLUE_HD2_A = gemHD2('N', 'q', 'I', 'P');
  const XP_BLUE_HD2_B = gemSparkleHD2('N', 'q', 'I');
  const XP_GREEN_HD2_A = gemHD2('G', 'h', 'g', 'P');
  const XP_GREEN_HD2_B = gemSparkleHD2('G', 'h', 'g');
  const XP_RED_HD2_A = gemHD2('R', 'f', 'r', 'P');
  const XP_RED_HD2_B = gemSparkleHD2('R', 'f', 'r');

  // ============================================================
  // GOLD COIN HD2 — 10×10 with 4-frame spin
  // ============================================================
  function goldSpinHD2(width) {
    if (width === 4) {
      // Full face
      return pad([
        '..........',
        '...1YPY1..',
        '..1YYYYY1.',
        '.1YY988YY1',
        '1Y9889889Y',  // detailed face
        '1Y9888889Y',
        '.1YY999YY1',
        '..1YYYYY1.',
        '...1YYY1..',
        '..........',
      ], 10);
    } else if (width === 3) {
      // 3/4 view
      return pad([
        '..........',
        '...1YPY1..',
        '..1YYYYY1.',
        '.1Y9889Y1.',
        '1Y98889Y1.',
        '1Y9888YYY1',
        '.1YY99YY1.',
        '..1YYYY1..',
        '...1YY1...',
        '..........',
      ], 10);
    } else if (width === 2) {
      // edge-on partial
      return pad([
        '..........',
        '....1YY...',
        '...1YYY1..',
        '...1Y8Y1..',
        '...1Y88Y1.',
        '...1Y88Y1.',
        '...1Y8Y1..',
        '...1YYY1..',
        '....1YY1..',
        '..........',
      ], 10);
    } else {
      // edge
      return pad([
        '..........',
        '.....1....',
        '.....Y1...',
        '.....8Y...',
        '.....8Y...',
        '.....8Y...',
        '.....8Y...',
        '.....Y1...',
        '.....1....',
        '..........',
      ], 10);
    }
  }
  const GOLD_HD2_F1 = goldSpinHD2(4);
  const GOLD_HD2_F2 = goldSpinHD2(3);
  const GOLD_HD2_F3 = goldSpinHD2(2);
  const GOLD_HD2_F4 = goldSpinHD2(1);

  // ============================================================
  // HEART HD2 — 12×10 with bright shine
  // ============================================================
  const HEART_HD2_A = pad([
    '............',
    '..1RrR1.1RrR',
    '.1rPRRR1RrR1',  // bright shine
    '1RPPRRRRRRrR',
    '1RRRRRRRRRRR',
    '1rRRRRRRRRRr',
    '.1rRRRRRRRr1',
    '..1rRRRRRr1.',
    '...1rRRRr1..',
    '....1rRr1...',
  ], 12);
  const HEART_HD2_B = pad([
    '............',
    '..1Rr1...1Rr',
    '.1rPRR1.1RRR',  // pulse beat
    '1RRRRRRR1RrR',
    '1RRRRRRRRRRR',
    '1rRRRRRRRRRr',
    '.1rRRRRRRRr1',
    '..1rRRRRRr1.',
    '...1rRRRr1..',
    '....1rRr1...',
  ], 12);

  // ============================================================
  // MAGNET HD2 — 12×12 horseshoe magnet
  // ============================================================
  const MAGNET_HD2_A = pad([
    '............',
    '.1RPRR1.1RPR',
    '.1RPRR1.1RPR',  // red poles
    '.1RPRR1.1RPR',
    '.1RPRR1.1RPR',
    '.1RPRR1.1RPR',
    '.1RPRR1.1RPR',
    '.1kkkk1.1kkk',  // black band
    '.1kkkkkkkkkk',
    '.1kkkkkkkkkk',  // curve
    '..1kkkkkkkk1',
    '...1kkkkkk1.',
  ], 12);
  const MAGNET_HD2_B = pad([
    '............',
    '.1RPRR1.1RPR',
    '.1RPPR1.1RPP',  // glow at poles
    '.1RPRR1.1RPR',
    '.1RPRR1.1RPR',
    '.1RPRR1.1RPR',
    '.1RPRR1.1RPR',
    '.1kkkk1.1kkk',
    '.1kkkkkkkkkk',
    '.1kkkkkkkkkk',
    '..1kkkkkkkk1',
    '...1kkkkkk1.',
  ], 12);

  // ============================================================
  // BOMB HD2 — 12×12 with lit fuse, 2 frames
  // ============================================================
  const BOMB_HD2_A = pad([
    '............',
    '.......1e1..',  // fuse top
    '......1fef1.',  // spark
    '......1ed1..',
    '.....1d1....',  // fuse body
    '....1d1.....',
    '...1kkkkkk1.',  // bomb top
    '..1kkkkkkkk1',
    '..1kPkkkkkk1',  // shine
    '..1kkkkkkkk1',
    '..1kkkkkkkk1',
    '...1kkkkkk1.',
  ], 12);
  const BOMB_HD2_B = pad([
    '............',
    '......1ef1..',  // fuse bigger flame
    '....1feefe1.',
    '....1feee1..',
    '.....1de1...',
    '......1d1...',
    '...1kkkkkk1.',
    '..1kkkkkkkk1',
    '..1kPPkkkkk1',  // bigger shine
    '..1kkkkkkkk1',
    '..1kkkkkkkk1',
    '...1kkkkkk1.',
  ], 12);

  // ============================================================
  // CHICKEN HD2 — 12×10 cooked drumstick
  // ============================================================
  const CHICKEN_HD2 = pad([
    '............',
    '.....1cc1...',
    '....1c77c1..',  // white bone end
    '....1c77c1..',
    '....1c77c1..',
    '...1cbbbbc1.',  // meat
    '..1bcccccbc1',
    '..1bcabaacb1',  // grill marks (a=dark)
    '..1bccababc1',
    '...1bcccbc1.',
  ], 12);

  // ============================================================
  // POTIONS HD2 — 10×12 glass flask with liquid
  // ============================================================
  function potionHD2(liquid, dark, hi, glow) {
    return pad([
      '..........',
      '...1bb1...',  // cork top
      '..1bccb1..',
      '..1b..b1..',  // neck
      '.1b.' + hi + '.b1.',  // bottle highlight
      '1k' + dark + liquid + liquid + liquid + liquid + dark + 'k1',
      '1k' + dark + liquid + hi + glow + liquid + dark + 'k1',  // bright spec on liquid
      '1k' + dark + liquid + liquid + liquid + liquid + dark + 'k1',
      '1k' + dark + liquid + liquid + liquid + liquid + dark + 'k1',
      '1k' + dark + liquid + liquid + liquid + liquid + dark + 'k1',
      '.1' + dark + dark + dark + dark + dark + dark + '1.',
      '..1' + dark + dark + dark + dark + '1..',
    ], 10);
  }
  function potionShimmerHD2(liquid, dark, hi, glow) {
    return pad([
      '..........',
      '...1bb1...',
      '..1bccb1..',
      '..1b..b1..',
      '.1bP' + hi + '.b1.',
      '1k' + dark + hi + liquid + liquid + liquid + dark + 'k1',
      '1k' + dark + liquid + liquid + glow + hi + dark + 'k1',
      '1k' + dark + hi + liquid + liquid + liquid + dark + 'k1',
      '1k' + dark + liquid + glow + liquid + liquid + dark + 'k1',
      '1k' + dark + liquid + liquid + hi + liquid + dark + 'k1',
      '.1' + dark + dark + dark + dark + dark + dark + '1.',
      '..1' + dark + dark + dark + dark + '1..',
    ], 10);
  }
  const POTION_HP_HD2_A = potionHD2('R', 'r', 'P', 'P');
  const POTION_HP_HD2_B = potionShimmerHD2('R', 'r', 'P', 'P');
  const POTION_MIGHT_HD2_A = potionHD2('e', 'd', 'f', 'f');
  const POTION_MIGHT_HD2_B = potionShimmerHD2('e', 'd', 'f', 'f');
  const POTION_MANA_HD2_A = potionHD2('i', 'k', 'W', 'P');
  const POTION_MANA_HD2_B = potionShimmerHD2('i', 'k', 'W', 'P');
  const POTION_SWIFT_HD2_A = potionHD2('G', 'g', 'h', 'P');
  const POTION_SWIFT_HD2_B = potionShimmerHD2('G', 'g', 'h', 'P');
  const POTION_ARCANE_HD2_A = potionHD2('M', 'p', 'q', 'P');
  const POTION_ARCANE_HD2_B = potionShimmerHD2('M', 'p', 'q', 'P');

  // ============================================================
  // SCROLL HD2 — 12×10 rolled parchment with red seal
  // ============================================================
  const SCROLL_HD2 = pad([
    '............',
    '..1888881...',  // top roll
    '.18777777b1.',
    '187cccccc7b1',  // parchment
    '187cabaccc7b',  // hand-drawn text
    '187caaaaccc7',
    '187cabbaccc7',  // red wax seal
    '187cRRRRccc7',
    '187cPRPRccc7',  // seal shine
    '.18777777b1.',
  ], 12);

  // ============================================================
  // KEY HD2 — 10×12 antique key with bow + bit
  // ============================================================
  const KEY_HD2 = pad([
    '..........',
    '...1YYY1..',  // bow (loop top)
    '..1Y9Y9Y1.',
    '..1Y9Y9Y1.',
    '..1Y9Y9Y1.',
    '...1YYY1..',  // bow bottom
    '.....Y....',  // shaft
    '.....Y....',
    '....1Y....',
    '....1YY...',  // teeth (bit)
    '....1Y....',
    '....1YY...',
  ], 10);

  // ============================================================
  // RUNE STONE HD2 — 12×12 dark purple stone with glowing rune
  // ============================================================
  function runeHD2(glow) {
    const G = glow ? 'P' : 'q';
    return pad([
      '............',
      '...1444441..',
      '..1444444441',  // stone outline
      '.144555554441',
      '14455555554441',  // stone
      '1445' + G + '5' + G + '5' + G + '4441',
      '14545' + G + G + G + '54441',  // rune pattern
      '1445' + G + '5' + G + '5' + G + '4441',
      '14455555554441',
      '.144455555441',
      '..1444444441',
      '...1444441..',
    ], 12);
  }
  const RUNE_HD2_A = runeHD2(false);
  const RUNE_HD2_B = runeHD2(true);

  // ============================================================
  // POWER-UP TOKENS HD2 — small special pickups
  // ============================================================
  // Hourglass — 10×12 freeze time pickup
  const HOURGLASS_HD2 = pad([
    '..........',
    '.1YYYYY1..',
    '.1Y8888Y1.',  // top frame
    '..1WIIW1..',
    '...1WI1...',  // sand top
    '....1W....',
    '....1W....',  // narrow waist
    '...1II1...',
    '..1WIIW1..',  // sand bottom
    '.1WIIIIW1.',
    '.1Y8888Y1.',
    '.1YYYYY1..',
  ], 10);

  // Star (power-up) — 10×10
  const STAR_HD2 = pad([
    '..........',
    '....1Y1...',  // top point
    '...1YPY1..',
    '1YYY9P9YYY',  // horizontal arms
    '1Y998P899Y',
    '..1Y9P9Y1.',
    '..1Y8Y8Y1.',  // diagonal points
    '.1Y1.1Y1.1',
    '1Y...Y...Y',
    '1.........',
  ], 10);

  // Soul orb — 10×10 with floating wisp inside
  function soulOrbHD2(rot) {
    const W = 10, cx = 4.5, cy = 4.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= 1) g[y][x] = 'P';
      else if (d <= 2.2) g[y][x] = 'q';
      else if (d <= 3.2) g[y][x] = 'M';
      else if (d <= 4) g[y][x] = 'm';
      else if (d <= 4.5) g[y][x] = '1';
    }
    // Wisp shape inside
    const wx = Math.round(cx + Math.cos(rot) * 1.2);
    const wy = Math.round(cy + Math.sin(rot) * 1.2);
    if (wx >= 0 && wx < W && wy >= 0 && wy < W) g[wy][wx] = 'P';
    return g.map((r) => r.join(''));
  }
  const SOUL_ORB_HD2_A = soulOrbHD2(0);
  const SOUL_ORB_HD2_B = soulOrbHD2(Math.PI / 2);
  const SOUL_ORB_HD2_C = soulOrbHD2(Math.PI);
  const SOUL_ORB_HD2_D = soulOrbHD2(Math.PI * 1.5);

  // Register all
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      pickup_xp_blue_hd2:  [XP_BLUE_HD2_A, XP_BLUE_HD2_B, XP_BLUE_HD2_A, XP_BLUE_HD2_B],
      pickup_xp_green_hd2: [XP_GREEN_HD2_A, XP_GREEN_HD2_B],
      pickup_xp_red_hd2:   [XP_RED_HD2_A, XP_RED_HD2_B],
      pickup_gold_hd2:     [GOLD_HD2_F1, GOLD_HD2_F2, GOLD_HD2_F3, GOLD_HD2_F4],
      pickup_heart_hd2:    [HEART_HD2_A, HEART_HD2_B],
      pickup_magnet_hd2:   [MAGNET_HD2_A, MAGNET_HD2_B],
      pickup_bomb_hd2:     [BOMB_HD2_A, BOMB_HD2_B],
      pickup_chicken_hd2:  [CHICKEN_HD2],
      pickup_potion_hp_hd2:     [POTION_HP_HD2_A, POTION_HP_HD2_B],
      pickup_potion_might_hd2:  [POTION_MIGHT_HD2_A, POTION_MIGHT_HD2_B],
      pickup_potion_mana_hd2:   [POTION_MANA_HD2_A, POTION_MANA_HD2_B],
      pickup_potion_swift_hd2:  [POTION_SWIFT_HD2_A, POTION_SWIFT_HD2_B],
      pickup_potion_arcane_hd2: [POTION_ARCANE_HD2_A, POTION_ARCANE_HD2_B],
      pickup_scroll_hd2:   [SCROLL_HD2],
      pickup_key_hd2:      [KEY_HD2],
      pickup_rune_hd2:     [RUNE_HD2_A, RUNE_HD2_B],
      pickup_hourglass_hd2:[HOURGLASS_HD2],
      pickup_star_hd2:     [STAR_HD2],
      pickup_soul_orb_hd2: [SOUL_ORB_HD2_A, SOUL_ORB_HD2_B, SOUL_ORB_HD2_C, SOUL_ORB_HD2_D],
    });
    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Pickups + Potions · HD2 (정교 패스)',
        items: ['pickup_xp_blue_hd2','pickup_xp_green_hd2','pickup_xp_red_hd2',
                'pickup_gold_hd2','pickup_heart_hd2','pickup_magnet_hd2',
                'pickup_bomb_hd2','pickup_chicken_hd2',
                'pickup_potion_hp_hd2','pickup_potion_might_hd2','pickup_potion_mana_hd2',
                'pickup_potion_swift_hd2','pickup_potion_arcane_hd2',
                'pickup_scroll_hd2','pickup_key_hd2','pickup_rune_hd2',
                'pickup_hourglass_hd2','pickup_star_hd2','pickup_soul_orb_hd2'],
      });
    }
  }
  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      pickup_xp_blue_hd2: 4, pickup_xp_green_hd2: 3, pickup_xp_red_hd2: 3,
      pickup_gold_hd2: 8, pickup_heart_hd2: 3,
      pickup_magnet_hd2: 4, pickup_bomb_hd2: 4,
      pickup_potion_hp_hd2: 4, pickup_potion_might_hd2: 4,
      pickup_potion_mana_hd2: 4, pickup_potion_swift_hd2: 4, pickup_potion_arcane_hd2: 4,
      pickup_rune_hd2: 3, pickup_soul_orb_hd2: 6,
    });
  }
})();
