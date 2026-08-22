// Sprite definitions — each entry is a frame as an array of strings.
// Characters map to PALETTE in palette.js.  '.' and ' ' are transparent.
// Animations are arrays of frames; statics are single-frame arrays.
//
// Naming convention: <category>_<id>_<state> with frames as siblings.
// Size is inferred from the strings (must be square or rect, all rows same len).

(function () {
  // ---------- helpers ----------
  // Mirror a frame horizontally — used so we don't author the same arm twice.
  function mirror(frame) {
    return frame.map((row) => row.split('').reverse().join(''));
  }

  // ============================================================
  // PLAYER — 16×16 knight, 4-frame walk cycle (idle, L, idle, R)
  // ============================================================
  // Pose: facing camera, helm + surcoat with gold cross, no held weapon
  // (weapons render as separate projectile sprites).
  const KNIGHT_BASE = [
    '................',
    '................',
    '.....34443......',
    '....3555553.....',
    '....3144413.....',
    '....3555553.....',
    '.....34443......',
    '....iIYYIi......',
    '...iIIYYIII.....',
    '...iIIYYII9.....',
    '...iIIYYIIi.....',
    '....bbbbbb......',
    '....kk..kk......',
    '????????????????', // leg row, replaced per frame
    '????????????????',
    '....aa..aa......',
  ];
  function knightFrame(stride) {
    // stride: -1 = left foot fwd, 0 = idle, 1 = right foot fwd
    const f = KNIGHT_BASE.slice();
    if (stride === -1) {
      f[13] = '....kk..kk......';
      f[14] = '....kk...k......';
    } else if (stride === 1) {
      f[13] = '....kk..kk......';
      f[14] = '....k...kk......';
    } else {
      f[13] = '....kk..kk......';
      f[14] = '....kk..kk......';
    }
    return f;
  }

  // ============================================================
  // MAGE — 16×16, pointed hat + arcane robe + chest gem
  // ============================================================
  const MAGE_BASE = [
    '................',
    '......mm........',
    '.....mmmm.......',
    '....mmmmmm......',
    '...mmmpppmmm....',
    '....m7777m......',
    '....m1MM1m......',
    '....mm77mm......',
    '...mMMMMMMm.....',
    '..mMMMqqMMMm....',
    '..mMMqqqqqMMm...',
    '..mMMMMqMMMMm...',
    '..mMMMMMMMMMm...',
    '...mMMMMMMMm....',
    '????????????????',
    '....aa..aa......',
  ];
  function mageFrame(stride) {
    const f = MAGE_BASE.slice();
    if (stride === -1)      f[14] = '....mMMMMMm.....';
    else if (stride === 1)  f[14] = '....mMMMMMm.....';
    else                    f[14] = '....mMMMMm......';
    // robe gently swings — alt boot pattern
    if (stride === -1)      f[15] = '....aa...a......';
    else if (stride === 1)  f[15] = '....a...aa......';
    else                    f[15] = '....aa..aa......';
    return f;
  }

  // ============================================================
  // HUNTRESS — 16×16, green hooded ranger, leather tunic
  // ============================================================
  const HUNTRESS_BASE = [
    '................',
    '.....GGGG.......',
    '....GHHHHG......',
    '...GHHHHHH......',
    '....G7777G......',
    '....G1hh1G......',
    '....G7777G......',
    '....GGHHGG......',
    '...bGGGGGGb.....',
    '...bGcccccGb....',
    '...bGcRRcGGb....',  // small heart/badge on tunic
    '....bccccbb.....',
    '....bbccbb......',
    '????????????????',
    '????????????????',
    '....aa..aa......',
  ];
  function huntressFrame(stride) {
    const f = HUNTRESS_BASE.slice();
    if (stride === -1) {
      f[13] = '....kk..kk......';
      f[14] = '....kk...k......';
    } else if (stride === 1) {
      f[13] = '....kk..kk......';
      f[14] = '....k...kk......';
    } else {
      f[13] = '....kk..kk......';
      f[14] = '....kk..kk......';
    }
    return f;
  }

  // ============================================================
  // CLERIC — 16×16, white & gold robe with cross, holy aura
  // ============================================================
  const CLERIC_BASE = [
    '................',
    '.....7777.......',
    '....77YY77......',  // gold halo crown
    '....7Y77Y7......',
    '....77777Y......',  // hood
    '....7711777.....',  // face shadow + eye line
    '....77777YY.....',
    '....7777777.....',
    '...77Y99Y77.....',  // robe + chest cross top
    '...7Y9889Y77....',  // gold cross center
    '...77Y99Y777....',
    '...7777777YY....',
    '....7777777.....',
    '????????????????',
    '????????????????',
    '....aa..aa......',
  ];
  function clericFrame(stride) {
    const f = CLERIC_BASE.slice();
    if (stride === -1) {
      f[13] = '....77..77......';
      f[14] = '....77...7......';
    } else if (stride === 1) {
      f[13] = '....77..77......';
      f[14] = '....7...77......';
    } else {
      f[13] = '....77..77......';
      f[14] = '....77..77......';
    }
    return f;
  }

  // ============================================================
  // WARRIOR — 16×16 horned-helm barbarian, leather + iron plate
  // ============================================================
  // Heavier silhouette than knight — fur trim, scar across face, iron pauldron.
  const WARRIOR_BASE = [
    '................',
    '......6..6......', // helm horns
    '.....k6446k.....',
    '....kk4444kk....',
    '....k544445k....',
    '....k144441k....', // eye line
    '....k544r45k....', // scar (r)
    '....kkkkkkkk....',
    '...bbabbbabb....', // pauldron + fur
    '...bccccccccb...',
    '...bcc8YY8ccb...', // brass belt buckle
    '....bcccccccb...',
    '....bb..bbb.....',
    '????????????????',
    '????????????????',
    '....aa..aa......',
  ];
  function warriorFrame(stride) {
    const f = WARRIOR_BASE.slice();
    if (stride === -1) {
      f[13] = '....kk..kk......';
      f[14] = '....kk...k......';
    } else if (stride === 1) {
      f[13] = '....kk..kk......';
      f[14] = '....k...kk......';
    } else {
      f[13] = '....kk..kk......';
      f[14] = '....kk..kk......';
    }
    return f;
  }

  // ============================================================
  // WALKER — 16×16 zombie ghoul, 2-frame bob
  // ============================================================
  const WALKER_A = [
    '................',
    '.....ggg........',
    '....gGGGg.......',
    '....g101g.......',
    '....gGRGg.......', // R = blood drip from mouth
    '....bGGGb.......',
    '...bGGGGGb......',
    '..bGgGGGgGb.....',
    '..bGgGGGgGb.....',
    '...bGGGGGb......',
    '...gGG.GGg......',
    '...gG...Gg......',
    '...g.....g......',
    '...g.....g......',
    '...g.....g......',
    '...a.....a......',
  ];
  const WALKER_B = WALKER_A.map((r, i) => (i < 1 || i > 14 ? r : '.' + r.slice(0, -1)));
  // bob: shift body 1px right
  const WALKER_B2 = [
    '................',
    '......ggg.......',
    '.....gGGGg......',
    '.....g101g......',
    '.....gGRGg......',
    '.....bGGGb......',
    '....bGGGGGb.....',
    '...bGgGGGgGb....',
    '...bGgGGGgGb....',
    '....bGGGGGb.....',
    '....gGG.GGg.....',
    '....gG...Gg.....',
    '...g.....g......',
    '...g.....g......',
    '...g.....g......',
    '...a.....a......',
  ];

  // ============================================================
  // RUNNER — 16×16 hellhound, 4-frame gallop (side view)
  // ============================================================
  // Low-slung quadruped with red ember eyes & gaping maw.
  const RUNNER_F1 = [
    '................',
    '................',
    '................',
    '.........gGGG...',
    '........gGGGGg..',
    '........gG110g..', // red ember eyes (R/d)
    '.g......gGddGg..',
    '.Gg....gGGGGGg..',
    '.GGgGGGGGGGGb...', // body + tail wisp
    '..GGGGGGGGGG....',
    '...HGGGGGGH.....', // belly shadow
    '...G.GG.GG......',
    '...G.GG.GG......',
    '...G.GG.GG......',
    '...a..aa.a......',
    '................',
  ];
  const RUNNER_F2 = [
    '................',
    '................',
    '................',
    '.........gGGG...',
    '........gGGGGg..',
    '........gG110g..',
    '.g......gGddGg..',
    '.Gg....gGGGGGg..',
    '.GGgGGGGGGGGb...',
    '..GGGGGGGGGG....',
    '...HGGGGGGH.....',
    '...GG..GG.G.....',
    '..G.G..G.G......',
    '..G.G..G.G......',
    '.a....aa..a.....',
    '................',
  ];
  const RUNNER_F3 = [
    '................',
    '................',
    '................',
    '.........gGGG...',
    '........gGGGGg..',
    '........gG110g..',
    '.g......gGddGg..',
    '.Gg....gGGGGGg..',
    '.GGgGGGGGGGGb...',
    '..GGGGGGGGGG....',
    '...HGGGGGGH.....',
    '..GG..GG..G.....',
    '..G...G...G.....',
    '..G...G...G.....',
    '.a....a...a.....',
    '................',
  ];
  const RUNNER_F4 = RUNNER_F2;

  // ============================================================
  // BRUTE — 24×24 armored ogre, 2-frame bob
  // ============================================================
  const BRUTE_A = [
    '........................',
    '........................',
    '........mmmm............',
    '.......mppppm...........',
    '......mppppppm..........',
    '......mp1mm1pm..........', // glowing arcane eyes
    '......mppMMppm..........',
    '......mppppppm..........',
    '.......mmppmm...........',
    '......mmppppmm..........',
    '.....mmpppppppm.........',
    '....mmpppMMpppm.........', // chest gem
    '....mpppMMMMppm.........',
    '....mpppMMMMppm.........',
    '....mpppppppppm.........',
    '....mmpppppppmm.........',
    '.....mpp.pp.ppm.........',
    '.....mpp.pp.ppm.........',
    '.....mpp.pp.ppm.........',
    '.....app.pp.ppa.........',
    '......a..pp..a..........',
    '.........aa.............',
    '........................',
    '........................',
  ];
  const BRUTE_B = [
    '........................',
    '........................',
    '........................',
    '........mmmm............',
    '.......mppppm...........',
    '......mppppppm..........',
    '......mp1mm1pm..........',
    '......mppMMppm..........',
    '......mppppppm..........',
    '.......mmppmm...........',
    '......mmppppmm..........',
    '.....mmpppppppm.........',
    '....mmpppMMpppm.........',
    '....mpppMMMMppm.........',
    '....mpppMMMMppm.........',
    '....mpppppppppm.........',
    '....mmpppppppmm.........',
    '.....mpp.pp.ppm.........',
    '.....mpp.pp.ppm.........',
    '.....mpp.pp.ppm.........',
    '.....app.pp.ppa.........',
    '......a..pp..a..........',
    '.........aa.............',
    '........................',
  ];

  // ============================================================
  // ELITE — 16×16 armored walker (red-glow eyes), 2-frame
  // ============================================================
  const ELITE_A = [
    '................',
    '....333333......',
    '...34i44i43.....', // horned helm
    '...3iiiiii3.....',
    '...3i1RR1i3.....', // red eyes
    '...3iiiiii3.....',
    '....3ii ii3.....',
    '...IIIIIIII.....',
    '..IIIY99YIIIa...',
    '..IIY9889YIIb...', // gold crest + spike on right (axe hint)
    '..IIY9889YII....',
    '..IIIY99YIII....',
    '...kkk..kkk.....',
    '...kkk..kkk.....',
    '...aaa..aaa.....',
    '................',
  ];
  const ELITE_B = ELITE_A.map((r) => r);

  // ============================================================
  // EXTRA ENEMIES — bat, spider, slime, chimera
  // ============================================================

  // BAT — 16×12, 4-frame flap (small fast aerial enemy)
  const BAT_F1 = [
    '................',
    '...22...22......',
    '..2pp2.2pp2.....',
    '.2pmm2.2mmp2....',
    '2pmm221122mmp2..',  // body center + red eyes
    '.pmRR1RR1RRmp...',
    '..pmRRR.RRmp....',
    '...pmmmmmp......',
    '....pp.pp.......',
    '................',
    '................',
    '................',
  ];
  const BAT_F2 = [
    '................',
    '................',
    '.....22.22......',
    '....2pp2pp2.....',
    '...2pmm22mmp2...',
    '..2pmRR11RRmp2..',
    '...pmRRR.RRmp...',
    '....pmmmmmp.....',
    '.....pp.pp......',
    '................',
    '................',
    '................',
  ];
  const BAT_F3 = [
    '................',
    '................',
    '................',
    '.....2pp2pp2....',
    '....2pmm22mmp2..',
    '...2pmRRRRRmp2..',
    '....pmRR.RRmp...',
    '.....pmmmmp.....',
    '......pp.pp.....',
    '................',
    '................',
    '................',
  ];
  const BAT_F4 = BAT_F2;

  // SPIDER — 16×16, 4-frame leg cycle (medium ground enemy)
  const SPIDER_F1 = [
    '................',
    '.k............k.',
    '..k.........k...',
    '...k.......k....',
    '....kk...kk.....',
    '.....k...k......',
    '.....kkkkk......',
    '....kkRRRkk.....', // red body + black legs
    '....kRRRRRk.....',
    '....kRR1Rk......', // eye spot
    '....kRRRRRk.....',
    '.....kkkkk......',
    '....k.....k.....',
    '...k.......k....',
    '..k.........k...',
    '.k............k.',
  ];
  const SPIDER_F2 = [
    '................',
    '..k..........k..',
    '...k........k...',
    '....k......k....',
    '....k......k....',
    '.....kkkkkk.....',
    '....kkRRRRkk....',
    '....kRRRRRRk....',
    '....kRR1RRRk....',
    '....kRRRRRRk....',
    '....kkRRRRkk....',
    '.....kkkkkk.....',
    '....k......k....',
    '...k........k...',
    '..k..........k..',
    '................',
  ];
  const SPIDER_F3 = SPIDER_F1;
  const SPIDER_F4 = SPIDER_F2;

  // SLIME — 16×12, 4-frame jiggle (green blob)
  const SLIME_F1 = [
    '................',
    '................',
    '.....GGGGG......',
    '....GhhhhhG.....',
    '...GhhhhhhhG....',
    '...GhWh.hWhG....', // shine + eye whites
    '..GhhhhhhhhhG...',
    '..GhRRhhhRRhG...',  // small mouth
    '..GghhhRhhggG...',
    '..GGGGGGGGGGG...',
    '...gg.gg.gg.....',
    '................',
  ];
  const SLIME_F2 = [
    '................',
    '................',
    '......GGG.......',
    '....GGhhhGG.....',
    '...GhhhhhhhG....',
    '..GhhWhhhWhhG...',
    '..GhhhhhhhhhG...',
    '..GghhRRRhhgG...',
    '..GGggghhhggGG..',
    '..ggggggggggg...',
    '...g..gg..g.....',
    '................',
  ];
  const SLIME_F3 = [
    '................',
    '................',
    '................',
    '.....GGGGG......',
    '....GhhhhhG.....',
    '...GhWhhhWhG....',
    '...GhhhhhhhG....',
    '..GhRRhhhRRhG...',
    '..GghhRRRhhgG...',
    '..GGGGGGGGGGG...',
    '...gg.gg.gg.....',
    '................',
  ];
  const SLIME_F4 = SLIME_F2;

  // CHIMERA — 24×20 elite, 2-frame stalk (lion-goat-snake horror)
  const CHIMERA_A = [
    '........................',
    '........................',
    '.......6...6............',
    '......c66.66c...........', // twin curling horns
    '.....cc666666cc.........',
    '....cccccccccccc........',  // mane lion-style
    '....cdc1100110cdc.......',  // red glow eyes (d in mane)
    '....cdcRRRRRRcdc........',
    '....ccccccccccc.........', // muzzle
    '.....ddccccccdd.........',
    '.....cddddddddcc........',
    '....ccbbbbbbbbcc........', // body
    '...ccdbbbbbbbbdcc.......',
    '..cdbbbbbbbbbbbbdc......',
    '.cdbbbbbbbbbbbbbbdc.....',
    '.cdbbbb..bb..bbbdc......', // legs
    '..cdbb...bb...bbdc......',
    '..cc.....bb.....cc......',
    '..aa.....aa.....aa......',
    '........................',
  ];
  // Add a serpent tail on frame B
  const CHIMERA_B = [
    '........................',
    '........................',
    '.......6...6............',
    '......c66.66c...........',
    '.....cc666666cc.........',
    '....cccccccccccc........',
    '....cdc1100110cdc..GG...', // tail blooms
    '....cdcRRRRRRcdc..GhG...',
    '....ccccccccccc..GhhG...',
    '.....ddccccccdd.GhhG....',
    '.....cddddddddccGhG.....',
    '....ccbbbbbbbbcGcG......',
    '...ccdbbbbbbbbdccc......',
    '..cdbbbbbbbbbbbbdc......',
    '.cdbbbbbbbbbbbbbbdc.....',
    '.cdbbbb..bb..bbbdc......',
    '..cdbb...bb...bbdc......',
    '..cc.....bb.....cc......',
    '..aa.....aa.....aa......',
    '........................',
  ];

  // ============================================================
  // SPIRITS — 4 elements × 3 evolution stages (familiar companions)
  // ============================================================
  // Stage 1 (8×8): tiny wisp · Stage 2 (12×12): familiar · Stage 3 (16×16): guardian
  // Roles — Fairy/Water: supporters · Earth/Fire: attackers
  // Each entry has 2 idle frames (gentle pulse/bob).

  // ── FAIRY (Stage 1) — tiny glowing dot with petal wings ──────
  const SP_FAIRY1_A = [
    '..PP.PP.',
    '.PYqYYqP',
    '.PYqqqYP',
    '..YqPqY.',
    '..YqqqY.',
    '...YYY..',
    '..h.h.h.',
    '........',
  ];
  const SP_FAIRY1_B = [
    '..PP.PP.',
    '.PqYYYqP',
    '.PYqPqYP',
    '..YqqqY.',
    '..YYYY..',
    '..h...h.',
    '...h....',
    '........',
  ];
  // ── FAIRY (Stage 2) — winged petal-clad fairy ────────────────
  const SP_FAIRY2_A = [
    '............',
    '..h.....h...',
    '.hPh...hPh..',
    '.hPPYYYYPPh.',
    '..PYYYYYYP..',
    '..hY7117YH..',
    '...YPPPPY...',
    '...YGGGGY...',
    '....hh.h....',
    '............',
    '............',
    '............',
  ];
  const SP_FAIRY2_B = [
    '..h.....h...',
    '..hPh.hPh...',
    '.hPPYYYPPh..',
    '..PYYYYYYP..',
    '..hY7117YH..',
    '...YPPPPY...',
    '...YGGGhY...',
    '...YGGGGY...',
    '....h.hh....',
    '............',
    '............',
    '............',
  ];
  // ── FAIRY (Stage 3) — radiant archfay with halo ──────────────
  const SP_FAIRY3_A = [
    '................',
    '......PYYP......',
    '.....PY99YP.....',
    '....hPYPPYPh....',
    '...hPPYPPYPPh...',
    '..hPPPY77YPPPh..',
    '..hPP7Y11Y7PPh..',
    '..hPPYYPPYYPPh..',
    '.hPPYGGGGGGYPPh.',
    '.hPYYGGhhGGYYPh.',
    '..hYGGGGGGGGYh..',
    '...hYGGhhGGYh...',
    '....hYGGGGYh....',
    '.....hhYYhh.....',
    '......h..h......',
    '................',
  ];
  const SP_FAIRY3_B = [
    '................',
    '......PPPP......',
    '.....PqYYqP.....',
    '....hPYP9YPh....',
    '...hPPY99YPPh...',
    '..hPPPY77YPPPh..',
    '..hPP7Y11Y7PPh..',
    '..hPPYqqqqYPPh..',
    '.hPPYGGGGGGYPPh.',
    '.hPYYGhGGhGYYPh.',
    '..hYGGhGGhGGYh..',
    '...hYGGhhGGYh...',
    '....hYGGGGYh....',
    '.....hhYYhh.....',
    '......h..h......',
    '................',
  ];

  // ── WATER (Stage 1) — droplet wisp ───────────────────────────
  const SP_WATER1_A = [
    '...W....',
    '..WIW...',
    '.WIIIW..',
    '.WIIIIW.',
    'WIIIIIW.',
    'WIIIIW..',
    '.WIIW...',
    '..WW....',
  ];
  const SP_WATER1_B = [
    '...P....',
    '..WIW...',
    '.WPIIW..',
    '.WIIIIW.',
    'WIIWIIW.',
    'WIIIIW..',
    '.WIIW...',
    '..WW....',
  ];
  // ── WATER (Stage 2) — undine sprite ──────────────────────────
  const SP_WATER2_A = [
    '....WWWW....',
    '...WIIIIW...',
    '..WIWPP1IW..',
    '..WIPIIPIIW.',
    '..WI11W11IW.',
    '..WIIIWIIW..',
    '..WIPIIPIW..',
    '...WIIIIW...',
    '....WIIW....',
    '.....WW.....',
    '............',
    '............',
  ];
  const SP_WATER2_B = [
    '............',
    '....WWWW....',
    '...WIPPIIW..',
    '..WIWIIWIIW.',
    '..WI11W11IW.',
    '..WIIIWIIIW.',
    '..WIWIIWIIW.',
    '...WIIIIIW..',
    '....WIIIW...',
    '.....WIW....',
    '......W.....',
    '............',
  ];
  // ── WATER (Stage 3) — ocean guardian ─────────────────────────
  const SP_WATER3_A = [
    '................',
    '.....WWWWWW.....',
    '....WIIIIIIW....',
    '...WIIPPPPIIW...',
    '..WIIPWWWWPIIW..',
    '..WIPWP11PWPIW..',
    '..WIPWIIIIWPIW..',
    '..WIIPWIIWPIIW..',
    '..WIIIPWWPIIIW..',
    '.WIIPWWIIWWPIIW.',
    '.WIPWWWWWWWWPIW.',
    '..WIIIPWWPIIIW..',
    '...WIIIIIIIIW...',
    '....WWWIIWWW....',
    '.....WW..WW.....',
    '................',
  ];
  const SP_WATER3_B = [
    '................',
    '.....WWWWWW.....',
    '....WIPIPIIW....',
    '...WIPIIIIPIW...',
    '..WIIPWWWWPIIW..',
    '..WIPWP11PWPIW..',
    '..WIPWIIWIWPIW..',
    '..WIIPWIIWPIIW..',
    '..WIIIPWWPIIIW..',
    '.WIIPWWWWWWPIIW.',
    '.WIPWWPWWPWWPIW.',
    '..WIIIPPPPIIIW..',
    '...WIIIIIIIIW...',
    '....WWWWWWWW....',
    '.....WWWWWW.....',
    '................',
  ];

  // ── EARTH (Stage 1) — rock chip ──────────────────────────────
  const SP_EARTH1_A = [
    '........',
    '..bcc...',
    '.bcccb..',
    'bcc8c8b.',
    'bc8888b.',
    '.bc888b.',
    '..bbb...',
    '........',
  ];
  const SP_EARTH1_B = [
    '..bcc...',
    '.bcccb..',
    'bcc8c8b.',
    'bc8888b.',
    'bc8h8b..',
    '.bc888b.',
    '..bbb...',
    '........',
  ];
  // ── EARTH (Stage 2) — golem core ─────────────────────────────
  const SP_EARTH2_A = [
    '............',
    '....bbbb....',
    '...bcccbb...',
    '..bccc8ccb..',
    '..bc811118b.',
    '..bc8YPPY8b.',
    '..bcc8888cb.',
    '..bccccccb..',
    '...bcGcGcb..',
    '....bGbGb...',
    '.....bbb....',
    '............',
  ];
  const SP_EARTH2_B = [
    '....bbbb....',
    '...bcccbb...',
    '..bccc8ccb..',
    '..bc811118b.',
    '..bc8YPPY8b.',
    '..bcc8888cb.',
    '..bccccccb..',
    '...bcGhGcb..',
    '...bGcGcGb..',
    '....bGbGb...',
    '.....bbb....',
    '............',
  ];
  // ── EARTH (Stage 3) — ancient golem ──────────────────────────
  const SP_EARTH3_A = [
    '................',
    '....bbbbbbbb....',
    '...bbcccccccb...',
    '..bccccc8cccb...',
    '..bccc88888ccb..',
    '..bc888118888b..',
    '..bc8YPPPPY8b...',
    '..bc88P889888b..',
    '..bccc88888ccb..',
    '..bcccc888ccc...',
    '..bccccccccccb..',
    '..bGcccccccGcb..',
    '..bGGccccccGGb..',
    '..bGGGbbbbGGGb..',
    '..bGGb....bGGb..',
    '....bb....bb....',
  ];
  const SP_EARTH3_B = [
    '................',
    '....bbbbbbbb....',
    '...bbcccccccb...',
    '..bccccc8cccb...',
    '..bccc88888ccb..',
    '..bc888118888b..',
    '..bc8YqPqPY8b...',
    '..bc88P889888b..',
    '..bccc88888ccb..',
    '..bcccc888ccc...',
    '..bcccchccccGb..',
    '..bGccccccGGcb..',
    '..bGGGcccGGGGb..',
    '..bGGGbbbGGGGb..',
    '..bGGb....bGGb..',
    '....bb....bb....',
  ];

  // ── FIRE (Stage 1) — flame wisp ──────────────────────────────
  const SP_FIRE1_A = [
    '...f....',
    '..ffe...',
    '.feeed..',
    '.feddd..',
    '.eddda..',
    '..edda..',
    '...da...',
    '........',
  ];
  const SP_FIRE1_B = [
    '...P....',
    '..fff...',
    '.ffeed..',
    '.feeed..',
    '.feddd..',
    '..eedd..',
    '...da...',
    '........',
  ];
  // ── FIRE (Stage 2) — ifrit imp ───────────────────────────────
  const SP_FIRE2_A = [
    '............',
    '....f.f.....',
    '...feffe....',
    '..feddddef..',
    '..edd11dde..',
    '..edPRRPdde.',
    '..edddRdde..',
    '...edddde...',
    '....dddd....',
    '....dada....',
    '....a..a....',
    '............',
  ];
  const SP_FIRE2_B = [
    '............',
    '....P.P.....',
    '...fefef....',
    '..fffddde...',
    '..edd11dde..',
    '..edPRRPdde.',
    '..eddrRdde..',
    '...edddde...',
    '....dadd....',
    '....adad....',
    '....a..a....',
    '............',
  ];
  // ── FIRE (Stage 3) — phoenix guardian ────────────────────────
  const SP_FIRE3_A = [
    '................',
    '......PfPf......',
    '.....fPfPfP.....',
    '....fefPfPef....',
    '...feedddedef...',
    '..fedRR11RRdef..',
    '..edRR1RR1RRde..',
    '..edRRRRRRRRde..',
    '..edPPddddPPde..',
    '..ed.feddef.de..',
    '..edfeeeedef.de.',
    '.feeddddddeeef..',
    '.feedddddddeef..',
    '..feddaaaaddef..',
    '....daaaaaaad...',
    '.....a....a.....',
  ];
  const SP_FIRE3_B = [
    '................',
    '......PfPfP.....',
    '.....fPfffP.....',
    '....fePPPfef....',
    '...feedddedef...',
    '..fedRR11RRdef..',
    '..edRR1RR1RRde..',
    '..edRRRRRRRRde..',
    '..edPPddddPPde..',
    '.fedfeddddefdef.',
    '.feeddedfeddeeef',
    '.feddddPddddddef',
    '..feddedddddef..',
    '..feddaaaaddef..',
    '....daaaaaaad...',
    '.....a....a.....',
  ];

  // ── Spirit effects (heal aura, shield bubble, attack projectiles) ──
  function healAura(rad) {
    const W = 16, C = 7.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - C) ** 2 + (y - C) ** 2);
      if (Math.abs(d - rad) < 1) g[y][x] = 'h';
      else if (Math.abs(d - rad) < 1.6) g[y][x] = 'G';
    }
    // central plus icon
    [[7,7],[8,8],[7,8],[8,7]].forEach(([y,x]) => g[y][x] = 'h');
    [[6,7],[6,8],[9,7],[9,8],[7,6],[8,6],[7,9],[8,9]].forEach(([y,x]) => g[y][x] = 'P');
    return g.map((r) => r.join(''));
  }
  const HEAL_AURA_FRAMES = [3, 5, 6.5, 7].map(healAura);

  function shieldBubble(shimmerOffset) {
    const W = 16, C = 7.5, R = 7;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - C) ** 2 + (y - C) ** 2);
      if (d > R) continue;
      if (d > R - 0.6) g[y][x] = 'W';
      else if (d > R - 1.4) g[y][x] = 'I';
      const sx = (x + shimmerOffset) % 16;
      if (sx === 4 && d < R - 1 && d > 2) g[y][x] = 'P';
    }
    return g.map((r) => r.join(''));
  }
  const SHIELD_BUBBLE_A = shieldBubble(0);
  const SHIELD_BUBBLE_B = shieldBubble(4);

  // Spirit attack projectiles — 6×6 elemental shots
  const SP_ATK_FAIRY_A = ['......','..PY..','.PYqP.','.PqYP.','..PY..','......'];
  const SP_ATK_FAIRY_B = ['..P...','.PYqP.','PYPPYP','PqYYqP','.PYPP.','..P...'];
  const SP_ATK_WATER_A = ['..W...','.WIW..','WIIIW.','WIWIW.','.WIW..','..W...'];
  const SP_ATK_WATER_B = ['..P...','.WIW..','WIPIW.','WIWIW.','.WIW..','...P..'];
  const SP_ATK_EARTH_A = ['..6...','.b8c..','bc88c.','bc88c.','.bc8..','..b...'];
  const SP_ATK_EARTH_B = ['...6..','..b8c.','.bc88c','.bc88c','..bc8.','...b..'];
  const SP_ATK_FIRE_A  = ['..f...','.fef..','feedd.','feddd.','.eda..','..a...'];
  const SP_ATK_FIRE_B  = ['..P...','.fff..','feeed.','feeed.','.feda.','..a...'];

  // ============================================================
  // BOSS — 32×32 lich, 4-frame hover (skull + cloak + arcane orb)
  // ============================================================
  const BOSS_A = [
    '................................',
    '................................',
    '..............mmmm..............',
    '............mmppppmm............',
    '...........mppppppppm...........',
    '..........mpppppppppm...........',
    '..........mp666666pmm...........', // skull crown
    '.........mp66666666pm...........',
    '.........mp66700766pm...........', // hollow sockets
    '.........mp66RRRR66pm...........', // red glow
    '.........mp66766766pm...........',
    '.........mmp6.66.6pmm...........',
    '..........mppmmmmppm............',
    '.........mppppmmpppm............', // jaw + cloak start
    '........mpppMMmmMMppm...........',
    '.......mppmMMMmmMMMmppm.........',
    '......mppmMMMMmmMMMMmppm........',
    '......mppmMMMM..MMMMmppm........',
    '......mppmMMMM..MMMMmppm........',
    '.......mppmMMMMMMMMmppm.........', // orb hover area
    '........mpp.NNqqNN.ppm..........', // central XP-cyan orb glow
    '........mpp.qNNNNq.ppm..........',
    '........mpp..NqqN..ppm..........',
    '.........mpp.....ppm............',
    '..........mpppppppm.............',
    '...........mpppppm..............',
    '............mpppm...............',
    '.............mmm................',
    '................................',
    '................................',
    '................................',
    '................................',
  ];
  // hover bob (1 px up) + orb pulse
  const BOSS_B = [
    '................................',
    '..............mmmm..............',
    '............mmppppmm............',
    '...........mppppppppm...........',
    '..........mpppppppppm...........',
    '..........mp666666pmm...........',
    '.........mp66666666pm...........',
    '.........mp66700766pm...........',
    '.........mp66RRRR66pm...........',
    '.........mp66766766pm...........',
    '.........mmp6.66.6pmm...........',
    '..........mppmmmmppm............',
    '.........mppppmmpppm............',
    '........mpppMMmmMMppm...........',
    '.......mppmMMMmmMMMmppm.........',
    '......mppmMMMMmmMMMMmppm........',
    '......mppmMMMM..MMMMmppm........',
    '......mppmMMMM..MMMMmppm........',
    '.......mppmMMMMMMMMmppm.........',
    '........ppqNNqqNNqpp............', // orb brighter
    '........pqNqqNNqqNqp............',
    '........ppqNqqqqNqpp............',
    '........mppNqqqqNppm............',
    '.........mpp.qq.ppm.............',
    '..........mppppppm..............',
    '...........mppppm...............',
    '............mppm................',
    '.............mm.................',
    '................................',
    '................................',
    '................................',
    '................................',
  ];

  // ============================================================
  // BOSS · VAMPIRE LORD — 32×32, caped noble with glowing red eyes
  // ============================================================
  // Side-cape silhouette, slicked black hair, red waistcoat with gold trim.
  function vampireFrame(armUp) {
    return [
      '................................',
      '................................',
      '............11111...............',
      '..........1112221111............',
      '.........112233333211...........',
      '........11233444443211..........',
      '........12344555554321..........',
      '........12345PPPP54321..........', // brow + slick hair (P=white-bright)
      '.......1233.7777.33321..........',
      '.......123.7R77R7.3321..........', // red glowing eyes
      '.......123.777777.3321..........',
      '.......1233.7777.33321..........',
      '........1234.77.43321...........',
      '........123aaaaaa321............', // collar/teeth
      '......121244244442421.........',  // pad shorter, will fix
      '......12RRRY9889YRR21...........', // red waistcoat + gold cross
      '.....1RRR2Y9889YRR1.............',
      '....1RRRR2Y9889Y2RRR1...........',
      '...12RRRR2Y9889Y2RRRR1..........',
      '...122RR22Y9889Y22RR21..........',
      '..12.2RRRR2Y99Y2RRRR2.21........',
      '..12.22RRR2YYYY2RRR22.21........',
      '...12.2RR2.2222.2RR2.21.........',
      '....12.2RR.....RR2.21...........',
      '.....122.2RR.RR2.221............',
      '......2.22RRRRR22.2.............',
      '..........22222.................',
      '..........aaaaa.................',
      '..........aaaaa.................',
      '................................',
      '................................',
      '................................',
    ];
  }
  // Fix row 14 length & sub-frame (arms swap)
  const VAMPIRE_A = vampireFrame(false).map((r) => {
    while (r.length < 32) r += '.';
    return r.slice(0, 32);
  });
  const VAMPIRE_B = VAMPIRE_A.map((row, i) => {
    if (i < 14 || i > 22) return row;
    // shift cape 1px right/left alternately for a slow billow
    if (i % 2 === 0) return '.' + row.slice(0, -1);
    return row.slice(1) + '.';
  });

  // ============================================================
  // BOSS · SKELETON KING — 32×32, crowned skull with bone armor
  // ============================================================
  function skeletonKingFrame(crownGlow) {
    const Y = crownGlow ? 'P' : 'Y';
    const G = crownGlow ? 'q' : 'N'; // crown gems pulse
    return [
      '................................',
      '................................',
      '..........8..8..8..8............', // crown spire tips
      '.........8Y88Y88Y88Y8...........',
      '........8YY' + Y + 'YY' + Y + 'YY' + Y + 'YY8..........',
      '........8YY' + G + 'YY' + G + 'YY' + G + 'YY8..........', // crown gems
      '.........888YYYYYYY888..........',
      '..........888YYYYY888...........', // crown band
      '...........8888888..............',
      '............66666...............', // skull top
      '..........66677766..............',
      '.........6677777766.............',
      '.........677777777766...........',
      '........677770077777766.........', // hollow sockets
      '........677R000R077776..........',  // red glow inside
      '........677RRRRR077776..........',
      '........67777707776776..........',
      '........6677770777666...........',
      '.........66.7777.66.............', // nose hole
      '..........66777766..............',
      '.........677.7.776..............', // teeth
      '.........67.7.7.76..............',
      '..........666666................',
      '...........6...6................',
      '..........6.....6...............', // collar / spine
      '.........6.......6..............',
      '.........aaa...aaa..............',
      '........aRRRkRkRRRa.............', // shoulders + red robe
      '........aRRkkkkkRRa.............',
      '.........aRRRkRRRRa.............',
      '..........aaa.aaa...............',
      '................................',
    ].map((r) => { while (r.length < 32) r += '.'; return r.slice(0, 32); });
  }
  const SKELETON_KING_A = skeletonKingFrame(false);
  const SKELETON_KING_B = skeletonKingFrame(true);

  // ============================================================
  // BOSS · DEMON — 32×32, horned crimson colossus with cloven hooves
  // ============================================================
  function demonFrame(eyeColor) {
    const E = eyeColor;
    return [
      '................................',
      '.........6.........6............',
      '........66.........66...........',
      '........R66.......66R...........', // horns curve in
      '........RRR66...66RRR...........',
      '.........RRRRrRRRRR.............',
      '........RRdRdrRdRdRR............', // brow ridges
      '........R11RrrrR11RR............',  // eyes hollows
      '........R1' + E + 'RRRRR' + E + '1R............',  // glowing eyes
      '........RRRdrrrdRRR.............',
      '........RRRR111RRR..............', // mouth shadow
      '.........RRdrdrdRR..............', // teeth
      '.........RR11r11RR..............',
      '..........RRRrRRR...............',
      '.........aRRrrrRRa..............', // shoulders
      '........aRRRrrRRRRa.............',
      '.......aRRRRrrrRRRRa............', // chest
      '.......aRRRR888RRRRa............',  // chest brand
      '.......aRRR89989RRRa............',
      '.......aRRRR888RRRRa............',
      '........aRRRrrrRRRa.............',
      '.........aRRR.RRRa..............',
      '.........aRRR.RRRa..............',
      '.........aRRR.RRRa..............',
      '..........aRR.RRa...............',
      '..........k0k.k0k...............', // cloven hooves
      '..........000.000...............',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
    ].map((r) => { while (r.length < 32) r += '.'; return r.slice(0, 32); });
  }
  const DEMON_A = demonFrame('R');
  const DEMON_B = demonFrame('e'); // eyes flare orange

  // ============================================================
  // BIOME ENEMIES — Forest, Swamp, Volcano, Ice Cavern
  // ============================================================

  // ── FOREST · WOLF — 18×14, 4 frames gallop (side view) ──────
  const WOLF_F1 = [
    '..................',
    '..................',
    '...........4444...',
    '..........344443..',
    '.........34RR443..', // red eyes
    '........34444443..',
    '......34344443....',
    '.....3434444443...',
    '....34344444433...',
    '....333334443.....',
    '....3.3..33.......',
    '....3.3...3.......',
    '....a.a...a.......',
    '..................',
  ];
  const WOLF_F2 = [
    '..................',
    '..................',
    '...........4444...',
    '..........344443..',
    '.........34RR443..',
    '........34444443..',
    '......34344443....',
    '.....3434444443...',
    '....34344444433...',
    '....333334443.....',
    '....33...3.3......',
    '...3.3..3.3.......',
    '..a..a.a..a.......',
    '..................',
  ];
  const WOLF_F3 = WOLF_F1;
  const WOLF_F4 = WOLF_F2;

  // ── FOREST · GOBLIN — 16×16, 2 frames bob ───────────────────
  const GOBLIN_A = [
    '................',
    '......gGGg......',
    '.....gGGGGg.....',
    '....gG1GG1Gg....', // beady eyes
    '....gGRRRGGg....',
    '....gGGGGGGg....',
    '....bGGGGGGb....', // leather hood
    '....bbbbbbb.....',
    '....bccccccb....', // tunic
    '...bcc89YYccb...', // gold belt
    '....bcccccc.....',
    '...b.cc.cc.b....',
    '...b.cc.cc.b....',
    '...b.bb.bb.b....',
    '....a..aa..a....',
    '................',
  ];
  const GOBLIN_B = [
    '................',
    '................',
    '......gGGg......',
    '.....gGGGGg.....',
    '....gG1GG1Gg....',
    '....gGRRRGGg....',
    '....gGGGGGGg....',
    '....bGGGGGGb....',
    '....bbbbbbb.....',
    '....bccccccb....',
    '...bcc89YYccb...',
    '....bcccccc.....',
    '...b.cc.cc.b....',
    '...b.bb.bb.b....',
    '....a..aa..a....',
    '................',
  ];

  // ── FOREST · HORNET — 12×10, 4 frames buzz ──────────────────
  const HORNET_F1 = [
    '............',
    '..2......2..',
    '...22..22...',
    '.....88.....',  // body
    '....YR8R....',  // eyes
    '....88888...',
    '.....888....',
    '.....088....',  // stinger
    '......0.....',
    '............',
  ];
  const HORNET_F2 = [
    '............',
    '.2........2.',
    '..222..222..',
    '...228822...',
    '....YR8R....',
    '....88888...',
    '.....888....',
    '.....088....',
    '......0.....',
    '............',
  ];
  const HORNET_F3 = [
    '............',
    '............',
    '..22....22..',
    '...2.88.2...',
    '....YR8R....',
    '....88888...',
    '.....888....',
    '.....088....',
    '......0.....',
    '............',
  ];
  const HORNET_F4 = HORNET_F2;

  // ── SWAMP · POISON FROG — 14×12, 2 frames blink ─────────────
  const FROG_A = [
    '..............',
    '...gGGgg......',
    '..gGGGGGg.....',
    '..gG1G1Gg.....', // dark eyes
    '..gGYYYGg.....',
    '.gGGGGGGGg....',
    '.gGhhhhhGg....', // light belly
    '.gGhhhhhGg....',
    '..gGGGGGg.....',
    '..g.....g.....',
    '.a.aa.aa.a....', // legs
    '..............',
  ];
  const FROG_B = [
    '..............',
    '..............',
    '..gGGgg.......',
    '.gGGGGGg......',
    '.gGRGRGg......',  // blink (R/R)
    '.gGYYYGg......',
    'gGGGGGGGg.....',
    'gGhhhhhGg.....',
    '.gGGGGGg......',
    '..g...g.......',
    '..a.a.a.a.....',
    '..............',
  ];

  // ── SWAMP · BOG ZOMBIE — 16×16, 2 frames stagger ────────────
  const BOG_ZOMBIE_A = [
    '................',
    '....gGGGGg......',
    '...gGgggGGg.....', // tattered hair
    '...gG1G1Gg......',
    '...gGRRGGg......', // green mouth drool
    '....GhhhG.......',
    '...bccccCb......', // tattered robe
    '..bccgggccb.....',
    '..bccgggccb.....',
    '..bgGgGgGgb.....',
    '..bgcccccgb.....',
    '...b..bb..b.....',
    '...b.bb.b.b.....',
    '...a..a.a.a.....',
    '................',
    '................',
  ];
  const BOG_ZOMBIE_B = [
    '................',
    '....gGGGGg......',
    '...gGgggGGg.....',
    '...gG1G1Gg......',
    '...gGRRGGg......',
    '....GhhhG.......',
    '...bccccCb......',
    '..bccgggccb.....',
    '..bccgggccb.....',
    '..bgGgGgGgb.....',
    '..bgcccccgb.....',
    '....b.bb.b......',
    '....bb.bb.......',
    '....a.a.aa......',
    '................',
    '................',
  ];

  // ── SWAMP · WILL-O-WISP — 10×10, 4 frames pulse ─────────────
  function wisp(intensity) {
    const W = 10, C = 4.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const r = 2 + intensity * 0.5;
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - C) ** 2 + (y - C) ** 2);
      if (d < r - 1.5) g[y][x] = 'P';
      else if (d < r - 0.5) g[y][x] = 'q';
      else if (d < r) g[y][x] = 'N';
      else if (d < r + 0.7) g[y][x] = 'h';
      else if (d < r + 1.4) g[y][x] = 'G';
    }
    return g.map((r) => r.join(''));
  }
  const WISP_F1 = wisp(0);
  const WISP_F2 = wisp(1);
  const WISP_F3 = wisp(2);
  const WISP_F4 = wisp(1);

  // ── VOLCANO · IMP — 14×14, 2 frames flutter ─────────────────
  const IMP_A = [
    '..............',
    '...R......R...',
    '..RR......RR..',  // pointed ears
    '...RdR..RdR...',
    '....RR11RR....',  // red eyes
    '....RRYYRR....',  // grin (gold teeth)
    '....RRdRRR....',
    '...dRRRRRRd...',
    '...dRRRRRRd...',
    '....dRRRRd....',
    '....RR..RR....',
    '....RR..RR....',
    '....aa..aa....',
    '..............',
  ];
  const IMP_B = [
    '..............',
    '..R........R..',
    '..RR......RR..',
    '..RdR....RdR..',
    '....RR11RR....',
    '....RRYYRR....',
    '....RRdRRR....',
    '...dRRRRRRd...',
    '...dRRRRRRd...',
    '....dRRRRd....',
    '....RRRRRR....',
    '.....RRRR.....',
    '.....a..a.....',
    '..............',
  ];

  // ── VOLCANO · LAVA SLUG — 14×8, 2 frames ooze ───────────────
  const LAVA_SLUG_A = [
    '..............',
    '....eeeeee....',
    '...effPPffe...',
    '..efffYYfffe..',
    '..effeeeeffe..',
    '..edddddddde..',
    '...aadddaa....',  // shadow
    '..............',
  ];
  const LAVA_SLUG_B = [
    '..............',
    '....ePePeP....',
    '...effePeffe..',
    '..efffYYfffe..',
    '..effeeeeffe..',
    '..edddddddde..',
    '...aadddaa....',
    '..............',
  ];

  // ── VOLCANO · FIRE BAT — 14×10, 4 frames flap ──────────────
  const FIRE_BAT_1 = [
    '..............',
    '..ee......ee..',
    '..edd....dde..',
    '..edd1RR1dde..',  // red eyes on dark body
    '..ddRRRRRRRdd.',
    '..eddRRRdde...',
    '...edddde.....',
    '....ddde......',
    '....ee.ee.....',
    '..............',
  ];
  const FIRE_BAT_2 = [
    '..............',
    '..............',
    '...ee....ee...',
    '...edd1RR1dde.',
    '...ddRRRRRRdd.',
    '....eddRRdde..',
    '.....edddde...',
    '......ddee....',
    '......ee.e....',
    '..............',
  ];
  const FIRE_BAT_3 = [
    '..............',
    '..............',
    '..............',
    '...edd11dde...',
    '...ddRRRRdd...',
    '....eddRdde...',
    '.....edddde...',
    '......ddee....',
    '......ee.e....',
    '..............',
  ];
  const FIRE_BAT_4 = FIRE_BAT_2;

  // ── ICE · FROST WOLF — 18×14, 4 frames gallop (white wolf) ──
  function frostWolfFrame(stride) {
    const base = [
      '..................',
      '..................',
      '...........WWWW...',
      '..........WIIWWI..', // ice tufts
      '.........WIWWIIW..',
      '........WIIIWWIIP..', // glowing eye
      '......WIWIIWWIIW..',
      '.....WIWWIIIIIWIW.',
      '....WIWIIIIIIIIWIW',
      '....WWWWIIIWIIW...',
      '....W.W..WW.......',
      '....W.W...W.......',
      '....I.I...I.......',
      '..................',
    ];
    if (stride) {
      base[10] = '....WW...W.W......';
      base[11] = '...W.W..W.W.......';
      base[12] = '..I..I.I..I.......';
    }
    // pad rows to 18
    for (let i = 0; i < base.length; i++) {
      if (base[i].length > 18) base[i] = base[i].slice(0, 18);
      while (base[i].length < 18) base[i] += '.';
    }
    return base;
  }
  const FROST_WOLF_F1 = frostWolfFrame(false);
  const FROST_WOLF_F2 = frostWolfFrame(true);
  const FROST_WOLF_F3 = FROST_WOLF_F1;
  const FROST_WOLF_F4 = FROST_WOLF_F2;

  // ── ICE · YETI — 20×20, 2 frames bob ────────────────────────
  const YETI_A = [
    '....................',
    '......WWWWWWW.......',
    '.....WIIIIIIIW......',
    '....WIW1PPPP1WI.....',
    '....WIWPPPPPPWI.....',
    '....WIWPPPPPPWI.....', // wide face
    '....WIIPPPPPPII.....',
    '....WIIPPPPPPPI.....',
    '...WIIIPPPPPPII.....', // shoulders
    '..WIIIIWWWWWWIII....',
    '..WIIPPPPPPPPIIIW...',
    '..WIPPPPPPPPPPPIW...',
    '..WPPPPPPPPPPPPPW...',
    '..WPPPPPPPPPPPPPW...',
    '...WPPPPPPPPPPPW....',
    '....WWWPPPPPWWW.....',
    '......W.WPW.W.......',
    '......W.WPW.W.......',
    '.....II.III.II......', // feet
    '....................',
  ];
  const YETI_B = YETI_A.map((r, i) => {
    if (i < 1 || i > 18) return r;
    return '.' + r.slice(0, -1); // gentle shift
  });

  // ── ICE · ICE WRAITH — 14×16, 2 frames flowing ──────────────
  const ICE_WRAITH_A = [
    '..............',
    '.....WWWW.....',
    '....WIIIIIW...',
    '...WIPPPP1IW..', // pale eyes
    '..WIWPPPPPWI..',
    '..WIWPPPPPWI..',
    '..WIIPPPPPII..',
    '..WIIIIIIIIW..',
    '.WIIIIWWWWIIW.',
    '.WIIIWWIIWIIIW',
    '.WIIWWIIIWWIIW',
    '..WIIIIIIIIIW.',
    '..WWIIIIIIIW..',
    '...WWIIIIWW...',
    '....WWWWWW....',
    '..............',
  ];
  const ICE_WRAITH_B = [
    '..............',
    '....WWWWW.....',
    '...WIIIIIIW...',
    '..WIPPPP1IIW..',
    '..WIWPPPPPWI..',
    '..WIWPPPPPWI..',
    '..WIIPPPPPII..',
    '..WIIIIIIIIIW.',
    '..WIIIIWWWIIW.',
    '.WIIIWWIIWIIIW',
    '.WIIWWIIIWWIIW',
    '..WIIIIIIIIIW.',
    '..WWIIIIIIWW..',
    '...WWIIIIWW...',
    '....WWWWWW....',
    '..............',
  ];

  // ============================================================
  // BIOME BOSSES — one per biome, 32×32 except Werewolf King (24×24)
  // ============================================================

  // ── FOREST · WEREWOLF KING — 24×24, 2 frames ───────────────
  function werewolfKing(roar) {
    const eye = roar ? 'P' : 'R';
    return [
      '........................',
      '........................',
      '....6............6......',  // pointed ears
      '...666..........666.....',
      '...3666........6663.....', // dark fur outline
      '...34466......66433.....',
      '...3446664444666443.....',
      '....34466YY11YY66443....',  // gold-eye glow + dark inner
      '...344666' + eye + eye + eye + eye + '666443...',
      '...3466666RRRR6666443...',  // red mouth
      '....3466666YY6666443....',  // gold fang
      '....34666666666443......',
      '.....3466bbbbbb443......',
      '....34bccccccccb43......',
      '...3bcccc8YY8ccccb3.....',  // gold belt buckle
      '...3bccc88YY88ccc3......',
      '...3bccccccccccc3.......',
      '....3bbbccccbbb3........',
      '.....3.bcc.bcc.3........',
      '.....3.bcc.bcc.3........',
      '.....3.bcc.bcc.3........',
      '......3.aaa..aaa........',
      '........................',
      '........................',
    ].map((r) => { while (r.length < 24) r += '.'; return r.slice(0, 24); });
  }
  const WEREWOLF_KING_A = werewolfKing(false);
  const WEREWOLF_KING_B = werewolfKing(true);

  // ── SWAMP · BOG WITCH — 32×32 with pointy hat + cauldron ────
  function bogWitch(brew) {
    return [
      '................................',
      '..............ggg...............',
      '.............ggggg..............',  // pointy hat tip
      '............ggGggg..............',
      '...........gggggGgg.............',
      '..........ggggggggGg............',
      '.........ggggggggggGg...........',
      '........ggggggGgggggGg..........',
      '........ggggGgggggggGg..........',
      '.........gggggggggggg...........',
      '..........ggggggggggg...........',
      '...........g77777777g...........',  // face
      '...........g7G77G77g............',  // green eyes
      '...........g777RR77g............',  // red lips
      '............g77777g.............',
      '............ggGGGgg.............',
      '...........aGGggGGGa............',  // dark robe drape
      '..........aGGGggggGGa...........',
      '.........aGGggggGgggGa..........',
      '.........aGggggggggggGa.........',
      '........aGgg' + (brew ? 'qqqqq' : 'GGGGGG') + 'gggGa.......',  // cauldron contents
      '........aGg' + (brew ? 'GqqPqqG' : 'GGGGGGGG') + 'gggGa......',
      '........akkkkkkkkkkkkka.........',  // cauldron rim
      '........akppppppppppkka.........',
      '........akppppppppppkka.........',
      '.........akkkkkkkkkkka..........',
      '..........aaaaaaaaaaa...........',
      '...........3..a..a.3............',  // staff
      '...........3..a..a.3............',
      '................................',
      '................................',
      '................................',
    ].map((r) => { while (r.length < 32) r += '.'; return r.slice(0, 32); });
  }
  const BOG_WITCH_A = bogWitch(false);
  const BOG_WITCH_B = bogWitch(true);

  // ── VOLCANO · MAGMA DRAKE — 32×24, 2 frames roar ────────────
  function magmaDrake(jaw) {
    return [
      '................................',
      '................................',
      '..............eeeee.............',  // head crest
      '.............eddddde............',
      '............eddRRRdde...........',  // red eye
      '............eddddddee...........',
      '.............eddddde............',
      '.............dddddd.............',
      '...d........dddddddd........d...',  // body + wings
      '..dd........dddRRRdd........dd..',  // glowing belly
      '.ddd.......ddddddddd.......ddd..',
      '.ddd......deeeeeeeeed......ddd..',  // wing membranes
      '.ddd.....deedddddddeed.....ddd..',
      '..dd....deeddddddddeed....dd....',  // arch
      '..d....deedddddddddeed....d.....',
      jaw ? '...ddRRRR.......RRRRdd..........' :
            '...ddddd.........ddddd..........',  // jaw open vs closed
      '....dd...........dd.............',
      '.....edddddddddeee..............',  // tail trail
      '......eeeeeeeeeeee..............',
      '.......dddddddddd...............',
      '........aaaaaaaa................',
      '................................',
      '................................',
      '................................',
    ].map((r) => { while (r.length < 32) r += '.'; return r.slice(0, 32); });
  }
  const MAGMA_DRAKE_A = magmaDrake(false);
  const MAGMA_DRAKE_B = magmaDrake(true);

  // ── ICE · ICE QUEEN — 32×32 with crown + frost cape ────────
  function iceQueen(magic) {
    const aura = magic ? 'q' : 'W';
    return [
      '................................',
      '..............WWWW..............',  // crown spikes
      '.............WWIIWW.............',
      '............WIIIIIIW............',  // crown
      '...........WIIIqIIIIW...........',  // crown gems
      '............WWWWWWWW............',  // crown band
      '.............WIIIIW.............',
      '............WIIIIIIW............',  // hair top
      '...........WIIPPPPIIW...........',
      '..........WIWP7PP7PWIW..........',  // face
      '..........WIWPPPPPPWIW..........',
      '..........WIWP11P11PWI..........',  // blue eyes
      '..........WIWPPPPPPWIW..........',
      '..........WIWPPRPPPWIW..........',  // pink lips
      '...........WIWPPPPPWIW..........',
      '...........' + aura + 'WIIIIIWIW' + aura + '..........', // shoulder magic
      '..........' + aura + 'WIWWWWWWWIW' + aura + '.........',
      '.........WIWIPPPPPPPIWIW........',  // dress
      '........WIWIIWWPPWWIIWIW........',
      '........WIIIIIWWWWIIIIIW........',
      '........WIIIPPPPPPPPIIIW........',
      '.........WIIIPP' + aura + aura + 'PPIIIW.........',  // chest gem
      '.........WIIIIPPPPIIIIW.........',
      '..........WIIIIWWIIIIW..........',
      '...........WWWIWWIWWW...........',
      '............W.WWWW.W............',  // legs
      '............W.WWWW.W............',
      '............I.IIII.I............',
      '...........aa.aaaa.aa...........',
      '................................',
      '................................',
      '................................',
    ].map((r) => { while (r.length < 32) r += '.'; return r.slice(0, 32); });
  }
  const ICE_QUEEN_A = iceQueen(false);
  const ICE_QUEEN_B = iceQueen(true);

  // ── FOREST · FOREST TREANT — 32×32 ──────────────────────────
  function forestTreant(eyes) {
    const E = eyes ? 'P' : 'G';
    return [
      '................................',
      '.........G.....G..G.............',  // leafy canopy
      '........GGGGGGGGGGGGGG..........',
      '.......GGGGGGGGGGGGGGGG.........',
      '......GGGGhhGGGGhhGGGGGG........',
      '.....GGhGGGGGGGGGGGGhhGGG.......',
      '....GGGGGGGGGGGGGGGGGGGGGG......',
      '...GGhhGGGGhGGGGGhGGGGhhGGG.....',
      '....GGGGGGGGGGGGGGGGGGGGG.......',
      '.....GGGGGGGGGGGGGGGGGGG........',
      '.......GGGGGGbbbbGGGGGG.........',  // trunk start
      '........bbbbbbbbbbbb............',  // tree face area
      '.......bccccccccccccb...........',
      '.......bcc' + E + 'bb' + E + 'cccccb...........',  // glowing eyes
      '.......bccbbbbbcccccb...........',  // dark mouth
      '.......bccbbbbbcccccb...........',
      '.......bcccccccccccb............',
      '.......abbcccccccbba............',  // arm stubs
      '......abbbcccccccbbba...........',
      '.....abbbbcccccccbbbba..........',
      '....abbbcccccccccccbbba.........',
      '....abbbcccccccccccbbba.........',
      '....abbbbbbbbbbbbbbbbba.........',
      '....abbbbcccccccccbbbba.........',
      '....abbbbbbbbbbbbbbbbba.........',
      '....abccccccccccccccccba........',  // roots
      '...abccbbbcccccccbbbccba........',
      '..abbccbbbbcccccbbbbccbba.......',
      '.abbbbbb..bbbbbb..bbbbbba.......',
      'abbbbb....bbbb....bbbbbbba......',
      '................................',
      '................................',
    ].map((r) => { while (r.length < 32) r += '.'; return r.slice(0, 32); });
  }
  const TREANT_A = forestTreant(false);
  const TREANT_B = forestTreant(true);

  // ============================================================
  // PROJECTILES — 8×8 base
  // ============================================================
  // proj_wand: a glowing bolt with a trailing tail, 4 frames
  const WAND_BOLT_A = [
    '........',
    '........',
    '....YY..',
    '...YfYY.',
    '..YYf9Y.',
    '.b9Y9...',
    'b.b.....',
    '........',
  ];
  const WAND_BOLT_B = [
    '........',
    '....YY..',
    '...YfYY.',
    '..YYfYY.',
    '.bYf9Y..',
    'b9Y9....',
    'b.b.....',
    '........',
  ];
  // Nova orb — pulsing arcane sphere, 4 frames
  const NOVA_A = [
    '..mMM...',
    '.mMMMm..',
    'mMMqMMm.',
    'MMqqqMM.',
    'MMqqqMM.',
    'mMMqMMm.',
    '.mMMMm..',
    '..mmm...',
  ];
  const NOVA_B = [
    '...MM...',
    '..MqqM..',
    '.MqqqqM.',
    'MqqPqqM.',
    'MqqPqqM.',
    '.MqqqqM.',
    '..MqqM..',
    '...MM...',
  ];
  // Prism shard — cyan/white evolved projectile, 12×12, 4 frames spin
  const PRISM_A = [
    '............',
    '....qq......',
    '...qIIq.....',
    '..qIPPIq....',
    '.qIPWWPIq...',
    'qIPWNWPIq...',
    '.qIPWWPIq...',
    '..qIPPIq....',
    '...qIIq.....',
    '....qq......',
    '............',
    '............',
  ];
  const PRISM_B = [
    '............',
    '......qq....',
    '.....qIIq...',
    '....qIPPIq..',
    '..qqIPWWPIq.',
    '.qIPWNWPIq..',
    'qIPWWPIqq...',
    '.qIPPIq.....',
    '..qIIq......',
    '...qq.......',
    '............',
    '............',
  ];

  // ============================================================
  // NEW WEAPONS — characters' signature projectiles
  // ============================================================

  // Spear — long-shaft jab, 12×6, two frames (idle / thrust glint)
  const SPEAR_A = [
    '............',
    '..bbbbbbb6PP',
    '.cbbbbbbbb6P',
    'cbbbbbbbb6PP',
    '..bbbbbbb6P.',
    '............',
  ];
  const SPEAR_B = [
    '............',
    '..bbbbbbbPPP',
    '.cbbbbbbbb6P',
    'cbbbbbbbbPPP',
    '..bbbbbbb6P.',
    '............',
  ];

  // Axe — spinning thrown axe, 12×12, 4 frames (90° increments)
  const AXE_F1 = [
    '............',
    '....666.....',
    '...66566....',
    '..66.5.66...',
    '.665...566..',
    '6655...5566.',
    '.55..b..55..',
    '.....b......',
    '.....b......',
    '.....b......',
    '.....c......',
    '............',
  ];
  const AXE_F2 = [
    '............',
    '.......6....',
    '......665...',
    '.b...6655...',
    '.b..66556...',
    '.b.665566...',
    '.b66566.....',
    '.bb55.......',
    'cb..........',
    '............',
    '............',
    '............',
  ];
  const AXE_F3 = [
    '............',
    '.....c......',
    '.....b......',
    '.....b......',
    '.....b......',
    '.....b......',
    '.55..b..55..',
    '6655...5566.',
    '.665...566..',
    '..66.5.66...',
    '...66566....',
    '....666.....',
  ];
  const AXE_F4 = [
    '............',
    '............',
    '............',
    '..........bc',
    '.......55bb.',
    '......6655b.',
    '.....665566b',
    '.....66556.b',
    '.....66556.b',
    '......665...',
    '.......6....',
    '............',
  ];

  // Holy Mace — gold-headed orbiting club, 8×10, 2 frames
  const MACE_A = [
    '........',
    '..YYYY..',
    '.YY99YY.',
    'YY9889YY',
    'YY9889YY',
    '.YY99YY.',
    '..YYbY..',
    '...bb...',
    '...bb...',
    '...bb...',
  ];
  const MACE_B = [
    '........',
    '..YYPY..',
    '.YY99YY.',
    'YY9889YY',
    'YYP889YY',
    '.YY99YY.',
    '..YYbY..',
    '...bb...',
    '...bbb..',
    '...bb...',
  ];

  // Holy Water — bottle in flight, 8×10, 2 frames (rotating cork glint)
  const HOLYWATER_A = [
    '...kk...',
    '..kIIk..',
    '..kIIk..',
    '.kIWIIk.',
    '.kIWWIk.',
    '.kIIIIk.',
    '.kIWIIk.',
    '.kIIIIk.',
    '..kkkk..',
    '...bb...',
  ];
  const HOLYWATER_B = [
    '...kk...',
    '..kIWk..',
    '..kIIk..',
    '.kIIWIk.',
    '.kIWIIk.',
    '.kIIWIk.',
    '.kIIIIk.',
    '.kIWIIk.',
    '..kkkk..',
    '...bb...',
  ];
  // Holy water splash — 16×16, 3 frames, cyan puddle expanding then fading
  const HOLYWATER_SPLASH_1 = [
    '................',
    '................',
    '................',
    '................',
    '................',
    '......W.........',
    '.....WIW........',
    '....WIWIW.......',
    '.....WIW........',
    '......W.........',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ];
  const HOLYWATER_SPLASH_2 = [
    '................',
    '................',
    '................',
    '................',
    '...W.........W..',
    '....WW.WWW.WW...',
    '...WIWWWIWWWIW..',
    '...WIWIWIWIWIW..',
    '..WIWIWIWIWIWIW.',
    '...WIWWWIWWWIW..',
    '...WIWWWIWWWIW..',
    '....WW.WWW.WW...',
    '...W.........W..',
    '................',
    '................',
    '................',
  ];
  const HOLYWATER_SPLASH_3 = [
    '................',
    '....W.......W...',
    '...W.........W..',
    '..W...........W.',
    '..W.IIWWWII...W.',
    '.W.IIWWIWWII...W',
    '.W.WIIWWIWIW.W..',
    '.WWWIWWIWIWWWW..',
    '.WWWIWIWWIWIWW..',
    '.W.WIIWIWWIIW.W.',
    '..W.IIWWIWII..W.',
    '..W..IIWWII...W.',
    '..W..........W..',
    '...W........W...',
    '....W......W....',
    '................',
  ];

  // Arrow — feathered shaft, 12×6, 2 frames
  const ARROW_A = [
    '............',
    '..hhcccc6Y..',
    '.hcccccc66YP',
    '..hhcccc6Y..',
    '............',
    '............',
  ];
  const ARROW_B = [
    '............',
    '..hcccccc6Y.',
    '.hccccccc66P',
    '..hcccccc6Y.',
    '............',
    '............',
  ];

  // Garlic — pulsing white aura ring, 16×16, 4 frames (radii 3/5/6/4)
  function garlicRing(rOuter, rInner) {
    const W = 16, C = 7.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - C) ** 2 + (y - C) ** 2);
      if (d <= rInner) continue;
      if (d <= rInner + 0.7) g[y][x] = 'q';
      else if (d <= rOuter - 0.7) g[y][x] = 'P';
      else if (d <= rOuter) g[y][x] = 'q';
    }
    // garlic clove at center
    const clove = [
      '..7..',
      '.777.',
      '777P7',
      '.7P7.',
      '..7..',
    ];
    for (let y = 0; y < clove.length; y++) for (let x = 0; x < clove[y].length; x++) {
      const c = clove[y][x];
      if (c !== '.') g[5 + y][5 + x] = c;
    }
    return g.map((r) => r.join(''));
  }
  const GARLIC_FRAMES = [
    garlicRing(5, 3),
    garlicRing(7, 5),
    garlicRing(8, 6),
    garlicRing(7, 5),
  ];

  // Bible — orbiting book, 10×8, 4-frame open/close cycle
  const BIBLE_F1 = [
    '..........',
    '..bbbbbb..',
    '.b777777b.',
    '.b7Y99Y7b.',  // gold cross
    '.b7989897b.',
    '.b7Y99Y7b.',
    '..bbbbbb..',
    '..........',
  ];
  const BIBLE_F2 = [
    '..........',
    '...bbbb...',
    '..b7777b..',
    '..b7YY7b..',
    '..b7997b..',
    '..b7YY7b..',
    '...bbbb...',
    '..........',
  ];
  const BIBLE_F3 = [
    '..........',
    '...bbbb...',
    '..b7bb7b..',
    '..b77bb7b.',
    '..b7bb77b.',
    '..b7bb7b..',
    '...bbbb...',
    '..........',
  ];
  const BIBLE_F4 = BIBLE_F2;

  // Cross / cruzifix boomerang — 10×10, 4 frames spin
  const CROSS_F1 = [
    '..........',
    '....YY....',
    '...Y99Y...',
    '...Y89Y...',
    '..YYYYY...',
    'YY999889YY',
    '.Y99889Y..',
    '...Y89Y...',
    '...Y99Y...',
    '....YY....',
  ];
  const CROSS_F2 = [
    '..........',
    '.........Y',
    '.......YY9',
    '.....YY99Y',
    '....Y9889Y',
    '..YY9889Y.',
    '.Y9889YY..',
    'Y9889Y....',
    'Y998Y.....',
    'YY9.......',
  ];
  const CROSS_F3 = [
    '..........',
    'YYYYYYYY..',
    '..YY888YY.',
    '....Y89YY.',
    '....YYYY..',
    '...YYYY...',
    '..YY98Y...',
    '.YY889YY..',
    '..YY8YYYY.',
    '..........',
  ];
  const CROSS_F4 = [
    '..........',
    'Y.........',
    '9YY.......',
    'Y99YY.....',
    'Y9889YY...',
    '.Y9889YY..',
    '..YY9889Y.',
    '....Y9889Y',
    '.....YY99Y',
    '.......YY.',
  ];

  // ============================================================
  // NEW WEAPONS — whip, lightning, firewall, knives, scythe, bone
  // ============================================================

  // Whip — long leather strand, 24×8, 4-frame crack
  const WHIP_F1 = [
    '........................',
    '........................',
    '.aabbbcc................',
    'aabbbccccbb.............',
    '.aabbcccbbcc............',
    '......bbccbbcc..........',
    '........................',
    '........................',
  ];
  const WHIP_F2 = [
    '........................',
    '.aabbbb.................',
    'aabbbcccbb..............',
    '.abbbccccbbb............',
    '......bccccbbb..........',
    '........bccbbbb.........',
    '...........bbbcc........',
    '........................',
  ];
  const WHIP_F3 = [
    '........................',
    'aabbcc..................',
    '.aabbcccbb..............',
    '..aabbcccbbb............',
    '....abbbccccbb..........',
    '......bbbccccbb.........',
    '.........bbcccPP........',
    '............bccP........',
  ];
  const WHIP_F4 = [
    '..aabbcc................',
    '...aabbcc...............',
    '....aabbccc.............',
    '......abbccc............',
    '........bbcc............',
    '..........bccc..........',
    '............bccPP.......',
    '..............bccP......',
  ];

  // Lightning ring — 16×16, 4-frame jagged ring
  function lightningRing(angle) {
    const W = 16, C = 7.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let i = 0; i < 360; i += 6) {
      const r = 6 + Math.sin((i + angle) * 0.6) * 0.7;
      const x = Math.round(C + Math.cos(i * Math.PI / 180) * r);
      const y = Math.round(C + Math.sin(i * Math.PI / 180) * r);
      if (x >= 0 && x < W && y >= 0 && y < W) g[y][x] = i % 30 < 6 ? 'P' : 'I';
    }
    // central bolt
    g[7][7] = 'P'; g[8][8] = 'W'; g[6][6] = 'W';
    return g.map((r) => r.join(''));
  }
  const LIGHTNING_FRAMES = [0, 90, 180, 270].map(lightningRing);

  // Fire wall — 24×16, 4-frame flickering wall
  function firewallFrame(seed) {
    const W = 24, H = 16;
    const g = Array.from({ length: H }, () => Array(W).fill('.'));
    for (let x = 0; x < W; x++) {
      // pseudo-noise column height
      const h = 8 + Math.round(Math.sin((x + seed) * 0.7) * 2 + Math.cos((x * 0.5 + seed * 1.3)) * 2);
      for (let y = H - 1; y >= H - h; y--) {
        const depth = H - 1 - y;
        let c;
        if (depth < 1) c = 'a';
        else if (depth < 3) c = 'd';
        else if (depth < h - 3) c = 'e';
        else if (depth < h - 1) c = 'f';
        else c = 'P';
        g[y][x] = c;
      }
    }
    return g.map((r) => r.join(''));
  }
  const FIREWALL_FRAMES = [0, 1.7, 3.3, 4.9].map(firewallFrame);

  // Throwing knives — 8×8, 3 frames spin (per knife, fan pattern in game)
  const KNIFE_F1 = [
    '........',
    '......PP',
    '.....II.',
    '....II..',
    '...II...',
    '..II....',
    '.bII....',
    'b.......',
  ];
  const KNIFE_F2 = [
    '........',
    '..PP....',
    '...II...',
    '..bII...',
    '.bbII...',
    '..bII...',
    '...II...',
    '..PP....',
  ];
  const KNIFE_F3 = [
    'PP......',
    '.II.....',
    '..II....',
    '...II...',
    '....II..',
    '.....II.',
    '....IIb.',
    '.......b',
  ];

  // Scythe — 16×16, 4 frames sweep (curved blade)
  const SCYTHE_F1 = [
    '................',
    '...........IIII.',
    '..........IIWWII',
    '.........IIWIIIW',
    '........IIWII...',
    '.......IIWII....',
    '......IIWII.....',
    '.....IIWII......',
    '....bbbbb.......',
    '....bbb.........',
    '....bb..........',
    '....bb..........',
    '....bb..........',
    '....cc..........',
    '....cc..........',
    '................',
  ];
  const SCYTHE_F2 = [
    '................',
    '................',
    '.........IIIIII.',
    '........IIWWWIII',
    '.......IIWWIIIWI',
    '......IIWII.....',
    '....IIIWII......',
    '...IIWWII.......',
    '...IIII.........',
    '....bb..........',
    '....bb..........',
    '....bb..........',
    '....bb..........',
    '....cc..........',
    '................',
    '................',
  ];
  const SCYTHE_F3 = [
    '................',
    '................',
    '................',
    '....IIIIIII.....',
    '...IIWWWWWII....',
    '...IIWIIIWII....',
    '....IIIWIIII....',
    '......IWI.......',
    '....bbbbb.......',
    '....bb..........',
    '....bb..........',
    '....bb..........',
    '....cc..........',
    '................',
    '................',
    '................',
  ];
  const SCYTHE_F4 = SCYTHE_F2;

  // Bone shard — 8×8, 2 frames spin (necromancer projectile)
  const BONE_A = [
    '........',
    '..66....',
    '.6776...',
    '.6776...',
    '..6776..',
    '...6776.',
    '....666.',
    '........',
  ];
  const BONE_B = [
    '........',
    '.....66.',
    '....6776',
    '...6776.',
    '..6776..',
    '.6776...',
    '.666....',
    '........',
  ];

  // ============================================================
  // TRAILS — projectile wakes & sword arcs
  // ============================================================

  // Arrow trail — 16×6, 3 frames fading streak (cyan-white tail)
  const ARROW_TRAIL_1 = [
    '................',
    '................',
    'P77666..........',
    'PW77666.........',
    'P77666..........',
    '................',
  ];
  const ARROW_TRAIL_2 = [
    '................',
    '................',
    '....666.........',
    '....W66.........',
    '....666.........',
    '................',
  ];
  const ARROW_TRAIL_3 = [
    '................',
    '................',
    '........7.......',
    '........7.......',
    '........7.......',
    '................',
  ];

  // Sword slash arc — 24×24, 4 frames (curved cyan crescent sweep)
  function slashArc(phase) {
    const W = 24, C = 11.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let a = -Math.PI * 0.4; a < Math.PI * 0.4; a += 0.04) {
      const r = 10 + phase;
      const x = Math.round(C + Math.cos(a + phase) * r);
      const y = Math.round(C + Math.sin(a + phase) * r);
      if (x < 0 || x >= W || y < 0 || y >= W) continue;
      const intensity = 1 - Math.abs(a) / 0.4;
      g[y][x] = intensity > 0.7 ? 'P' : intensity > 0.4 ? 'W' : 'I';
      // inner glow
      const x2 = Math.round(C + Math.cos(a + phase) * (r - 1));
      const y2 = Math.round(C + Math.sin(a + phase) * (r - 1));
      if (x2 >= 0 && x2 < W && y2 >= 0 && y2 < W && g[y2][x2] === '.') g[y2][x2] = 'W';
    }
    return g.map((r) => r.join(''));
  }
  const SLASH_ARC_1 = slashArc(0);
  const SLASH_ARC_2 = slashArc(0.4);
  const SLASH_ARC_3 = slashArc(0.8);
  const SLASH_ARC_4 = slashArc(1.2);

  // Generic projectile glow trail — 8×8, 3 frames (gold-to-dark)
  const PROJ_TRAIL_1 = [
    '........',
    '..f.....',
    '.fef....',
    '.eee....',
    '.fef....',
    '..f.....',
    '........',
    '........',
  ];
  const PROJ_TRAIL_2 = [
    '........',
    '........',
    '..d.....',
    '..dd....',
    '..d.....',
    '........',
    '........',
    '........',
  ];
  const PROJ_TRAIL_3 = [
    '........',
    '........',
    '........',
    '...a....',
    '........',
    '........',
    '........',
    '........',
  ];

  // ============================================================
  // LEGENDARY WEAPONS — evolved variants, one per archetype
  // ============================================================
  // Each is bigger/glowier than its base — drops or evolutions.

  // Legendary Blade — flaming greatsword (replaces wand/melee), 12×12, 2f
  const LEG_BLADE_A = [
    '....PPPP....',
    '...IIIIII...',
    '..IIWWWWII..',
    '..IWIIIIWI..',
    '..IWIIIIWI..',
    '..IWIIIIWI..',
    '..IWIIIIWI..',
    '..IWIIIIWI..',
    '...YYIIYY...',
    '....cYYc....',
    '....bbbb....',
    '....bbbb....',
  ];
  const LEG_BLADE_B = [
    '....PPPP....',
    '...IPPPPI...',
    '..IPWWWWPI..',
    '..IWPIIPWI..',
    '..IWIPPIWI..',
    '..IWPIIPWI..',
    '..IWIPPIWI..',
    '..IWPIIPWI..',
    '...YPIIPY...',
    '....cYYc....',
    '....bbbb....',
    '....bbbb....',
  ];

  // Legendary Axe — lightning-charged broadaxe, 16×16, 4 frames spin
  function legAxeFrame(rot) {
    const frames = [
      [
        '................',
        '.....66666......',
        '....6655556.....',
        '...66555W556....',
        '..665555WW556...',
        '..665555555W6...',
        '...66555556PP...',
        '....66555.6P....',
        '......b.PP......',
        '......b.........',
        '......b.........',
        '......b.........',
        '......b.........',
        '......c.........',
        '................',
        '................',
      ],
      [
        '................',
        '...........P....',
        '..........PP....',
        '.b.......PP66...',
        '.b......PP666...',
        '.b....PP55666...',
        '.b...P555666....',
        '.b..555W666.....',
        '.b.55WW66.......',
        '.b55556.........',
        'cb556...........',
        '................',
        '................',
        '................',
        '................',
        '................',
      ],
      [
        '................',
        '......c.........',
        '......b.........',
        '......b.........',
        '......b.........',
        '......b.........',
        '......b.PP......',
        '....66555.6P....',
        '...66555556PP...',
        '..665555555W6...',
        '..665555WW556...',
        '...66555W556....',
        '....6655556.....',
        '.....66666......',
        '................',
        '................',
      ],
      [
        '................',
        '................',
        '................',
        '................',
        '...........555bc',
        '..........55556b',
        '.........5W66.b.',
        '......555W66..b.',
        '.....P555666..b.',
        '....PP55666...b.',
        '...PP55666....b.',
        '..PP66666.......',
        '..PP666.........',
        '..P.............',
        '................',
        '................',
      ],
    ];
    return frames[rot];
  }
  const LEG_AXE_1 = legAxeFrame(0);
  const LEG_AXE_2 = legAxeFrame(1);
  const LEG_AXE_3 = legAxeFrame(2);
  const LEG_AXE_4 = legAxeFrame(3);

  // Legendary Spear — mythril halberd, 16×6, 2 frames
  const LEG_SPEAR_A = [
    '................',
    '...bbbbbbbb6WPPI',
    '.cbbbbbbbb6WWPPP',
    '..bbbbbbbb6WPPII',
    'Y...............',
    '................',
  ];
  const LEG_SPEAR_B = [
    '................',
    '...bbbbbbbb6PIWP',
    '.cbbbbbbbb6PWPPW',
    '..bbbbbbbb6PIWP.',
    '.Y..............',
    '................',
  ];

  // Legendary Bow Arrow — silver dragon arrow, 16×6, 2 frames
  const LEG_ARROW_A = [
    '................',
    '..WIIWcccccccI..',
    '.WIIWccccccccIIP',
    '..WIIWcccccccI..',
    '................',
    '................',
  ];
  const LEG_ARROW_B = [
    '................',
    '..IWWIcccccccIP.',
    '.IWWIccccccccIPP',
    '..IWWIcccccccIP.',
    '................',
    '................',
  ];

  // Legendary Whip — steel chain whip, 24×8, 4-frame crack
  const LEG_WHIP_F1 = [
    '........................',
    '........................',
    'kIkIkIkIkIkIkPP.........',
    'IkIkIkIkIkIkIPP.........',
    'kIkIkIkIkIkIkPP.........',
    '........................',
    '........................',
    '........................',
  ];
  const LEG_WHIP_F2 = [
    '........................',
    '.kIkIkIkIkII............',
    'IkIkIkIkIkIkIIP.........',
    '..kIkIkIkIkIkIIP........',
    '.....kIkIkIkIIPP........',
    '..........kIkIIP........',
    '........................',
    '........................',
  ];
  const LEG_WHIP_F3 = [
    'kIkII...................',
    '.IkIkII.................',
    '..kIkIkII...............',
    '...IkIkIkII.............',
    '....kIkIkIkII...........',
    '......IkIkIkIIPP........',
    '.........IkIkIIPPP......',
    '...........IkIIP........',
  ];
  const LEG_WHIP_F4 = [
    '..kIkII.................',
    '...IkIkII...............',
    '....kIkIkII.............',
    '......IkIkII............',
    '........kIkII...........',
    '..........IkIIPP........',
    '...........IkIPPP.......',
    '............IIPP........',
  ];

  // Legendary Cross — blazing rotating crucifix, 12×12, 4 frames
  function legCross(rot) {
    const W = 12, C = 5.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const cos = Math.cos(rot), sin = Math.sin(rot);
    function plot(lx, ly, c) {
      const x = Math.round(C + lx * cos - ly * sin);
      const y = Math.round(C + lx * sin + ly * cos);
      if (x >= 0 && x < W && y >= 0 && y < W) g[y][x] = c;
    }
    // vertical arm
    for (let i = -5; i <= 5; i++) plot(0, i, 'Y');
    // horizontal arm
    for (let i = -3; i <= 3; i++) plot(i, 0, 'Y');
    // gold mid + flame
    plot(0, 0, '9'); plot(0, -1, '9'); plot(0, 1, '9');
    plot(-1, 0, '9'); plot(1, 0, '9');
    // flame trail tips
    plot(0, 5, 'e'); plot(0, 4, 'f');
    plot(0, -5, 'e'); plot(0, -4, 'f');
    plot(3, 0, 'e'); plot(-3, 0, 'e');
    return g.map((r) => r.join(''));
  }
  const LEG_CROSS_1 = legCross(0);
  const LEG_CROSS_2 = legCross(Math.PI * 0.25);
  const LEG_CROSS_3 = legCross(Math.PI * 0.5);
  const LEG_CROSS_4 = legCross(Math.PI * 0.75);

  // Legendary Bible — radiant tome with rays, 14×12, 3 frames
  const LEG_BIBLE_A = [
    '..............',
    '..f..f..f..f..',
    '.f....bb....f.',
    '..bbbb77bbbb..',
    '.b777777777b..',
    '.b777Y99Y777b.',
    '.b77Y9889Y77b.',
    '.b777Y99Y777b.',
    '.b777777777b..',
    '..bbbbbbbbbb..',
    'f....f..f....f',
    '..............',
  ];
  const LEG_BIBLE_B = [
    'f.............',
    '..ef..ef..ef..',
    '.fff..bb..fff.',
    'f.bbbb77bbbb.f',
    '.b777Y77Y777b.',
    '.b7Y9P889P9Y7b',
    '.b7Y9P889P9Y7b',
    '.b7Y9P889P9Y7b',
    '.b777Y77Y777b.',
    '.fbbbbbbbbbbf.',
    'fff..fe..fe.ff',
    'f.............',
  ];
  const LEG_BIBLE_C = LEG_BIBLE_A;

  // Legendary Scythe — purple death scythe, 16×16, 4 frames sweep
  function legScythe(phase) {
    return SCYTHE_F1.map((r) => r); // placeholder; tinted via palette swap at use
  }
  // Use existing SCYTHE frames but recolor: replace 'W' (ice highlight) with 'q' for arcane
  function tintFrame(frame, map) {
    return frame.map((row) =>
      row.split('').map((c) => map[c] || c).join('')
    );
  }
  const SCYTHE_TINT = { 'W': 'q', 'I': 'M', 'b': 'p', 'c': 'm' };
  const LEG_SCYTHE_1 = tintFrame(SCYTHE_F1, SCYTHE_TINT);
  const LEG_SCYTHE_2 = tintFrame(SCYTHE_F2, SCYTHE_TINT);
  const LEG_SCYTHE_3 = tintFrame(SCYTHE_F3, SCYTHE_TINT);
  const LEG_SCYTHE_4 = tintFrame(SCYTHE_F4, SCYTHE_TINT);

  // Legendary Nova — golden sunburst orb, 12×12, 4 frames
  function legNova(phase) {
    const W = 12, C = 5.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) {
      for (let x = 0; x < W; x++) {
        const d = Math.sqrt((x - C) ** 2 + (y - C) ** 2);
        if (d < 2) g[y][x] = 'P';
        else if (d < 3) g[y][x] = 'f';
        else if (d < 4 + Math.sin(phase) * 0.5) g[y][x] = 'e';
        else if (d < 5 + Math.cos(phase) * 0.5) g[y][x] = 'd';
      }
    }
    // 8 sun-rays
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4 + phase;
      for (let r = 5; r < 6.5; r += 0.5) {
        const x = Math.round(C + Math.cos(a) * r);
        const y = Math.round(C + Math.sin(a) * r);
        if (x >= 0 && x < W && y >= 0 && y < W) g[y][x] = 'Y';
      }
    }
    return g.map((r) => r.join(''));
  }
  const LEG_NOVA_1 = legNova(0);
  const LEG_NOVA_2 = legNova(Math.PI * 0.25);
  const LEG_NOVA_3 = legNova(Math.PI * 0.5);
  const LEG_NOVA_4 = legNova(Math.PI * 0.75);

  // ============================================================
  // EFFECTS
  // ============================================================
  // Hit spark — 16×16, 4 frames cross-flash
  const HIT_1 = [
    '................',
    '................',
    '................',
    '................',
    '.......P........',
    '.......P........',
    '.....PPPPP......',
    '....PPfPfPP.....',
    '....PfPfPfP.....',
    '.....PPPPP......',
    '.......P........',
    '.......P........',
    '................',
    '................',
    '................',
    '................',
  ];
  const HIT_2 = [
    '................',
    '................',
    '.......e........',
    '......eee.......',
    '......ePe.......',
    '....e..f..e.....',
    '...ee.fff.ee....',
    '...efffPfffe....',
    '...ee.fff.ee....',
    '....e..f..e.....',
    '......ePe.......',
    '......eee.......',
    '.......e........',
    '................',
    '................',
    '................',
  ];
  const HIT_3 = [
    '................',
    '......d.d.......',
    '.....d...d......',
    '....d.e.e.d.....',
    '....d.e.e.d.....',
    '...d..eee..d....',
    '....d.eee.d.....',
    '....d.eee.d.....',
    '...d..eee..d....',
    '....d.e.e.d.....',
    '....d.e.e.d.....',
    '.....d...d......',
    '......d.d.......',
    '................',
    '................',
    '................',
  ];
  const HIT_4 = [
    '................',
    '......a.a.......',
    '.....a...a......',
    '................',
    '....a..d..a.....',
    '................',
    '.....d.d.d......',
    '.....d.d.d......',
    '.....d.d.d......',
    '................',
    '....a..d..a.....',
    '................',
    '.....a...a......',
    '......a.a.......',
    '................',
    '................',
  ];

  // Explosion — 24×24, 6 frames
  function explosionFrame(r) {
    // procedurally fill a circle of radius r with rings
    const W = 24;
    const grid = Array.from({ length: W }, () => Array(W).fill('.'));
    const cx = 11.5, cy = 11.5;
    for (let y = 0; y < W; y++) {
      for (let x = 0; x < W; x++) {
        const dx = x - cx, dy = y - cy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= r - 3) grid[y][x] = 'f';
        else if (d <= r - 2) grid[y][x] = 'e';
        else if (d <= r - 1) grid[y][x] = 'd';
        else if (d <= r) grid[y][x] = 'a';
      }
    }
    return grid.map((row) => row.join(''));
  }
  const EXPL_FRAMES = [3, 6, 9, 11, 10, 7].map(explosionFrame);

  // Slash arc — 16×16, 3 frames, sword swing trail
  const SLASH_1 = [
    '................',
    '................',
    '................',
    '..........WWW...',
    '.........WIIIW..',
    '........WIIIII..',
    '.......WIIIIIW..',
    '.......IIIIIW...',
    '......IIIIW.....',
    '......IIIW......',
    '......IIW.......',
    '......IW........',
    '......W.........',
    '................',
    '................',
    '................',
  ];
  const SLASH_2 = mirror(SLASH_1);
  const SLASH_3 = [
    '................',
    '................',
    '..............W.',
    '.............WI.',
    '............WII.',
    '...........WIIW.',
    '..........WIIIW.',
    '.........WIIIIW.',
    '.........IIIIW..',
    '........IIIIW...',
    '........IIIW....',
    '........IIW.....',
    '........IW......',
    '........W.......',
    '................',
    '................',
  ];

  // ============================================================
  // PICKUPS
  // ============================================================
  // XP gem (cyan) — 8×8, 4 frames sparkle
  const XPGEM_A = [
    '........',
    '...qN...',
    '..qNNN..',
    '.qNNNNN.',
    '.qNNNNn.',
    '.NNNnnn.',
    '..Nnnn..',
    '...nn...',
  ];
  const XPGEM_B = [
    '........',
    '...PN...',
    '..PqNN..',
    '.qNNNNN.',
    '.qNNNNn.',
    '.NNNnnn.',
    '..Nnnn..',
    '...nn...',
  ];
  const XPGEM_C = [
    '........',
    '...qN...',
    '..qNNN..',
    '.qNNNNN.',
    '.PNNNNn.',
    '.NPNnnn.',
    '..Pnnn..',
    '...nn...',
  ];
  const XPGEM_D = XPGEM_A;

  // XP gem green (rarer, 5 xp)
  const XPGEM_GREEN = [
    '........',
    '...hG...',
    '..hGGG..',
    '.hGGGGG.',
    '.hGGGGg.',
    '.GGGggg.',
    '..Gggg..',
    '...gg...',
  ];

  // XP gem red (rarest, 25 xp)
  const XPGEM_RED = [
    '........',
    '...fR...',
    '..fRRR..',
    '.fRRRRR.',
    '.fRRRRr.',
    '.RRRrrr.',
    '..Rrrr..',
    '...rr...',
  ];

  // Gold coin — 8×8, 4 frames spin
  const GOLD_1 = [
    '........',
    '..YYYY..',
    '.Y9999Y.',
    '.Y9889Y.',
    '.Y9889Y.',
    '.Y9999Y.',
    '..YYYY..',
    '........',
  ];
  const GOLD_2 = [
    '........',
    '..YYYY..',
    '..Y99Y..',
    '..Y88Y..',
    '..Y88Y..',
    '..Y99Y..',
    '..YYYY..',
    '........',
  ];
  const GOLD_3 = [
    '........',
    '...YY...',
    '...88...',
    '...88...',
    '...88...',
    '...88...',
    '...YY...',
    '........',
  ];
  const GOLD_4 = GOLD_2;

  // Heart pickup — 10×10, 2 frames pulse
  const HEART_A = [
    '..........',
    '..RR..RR..',
    '.RPRRRPRR.',
    '.RPRRRRRR.',
    '.RRRRRRRR.',
    '..RRRRRR..',
    '...RRRR...',
    '....RR....',
    '..........',
    '..........',
  ];
  const HEART_B = [
    '..........',
    '..rR..Rr..',
    '..RPRRPR..',
    '..RRRRRR..',
    '..RRRRRR..',
    '...RRRR...',
    '....RR....',
    '..........',
    '..........',
    '..........',
  ];

  // Magnet pickup — 10×10
  const MAGNET = [
    '..........',
    '.RRR..RRR.',
    '.RPR..RPR.',
    '.RPR..RPR.',
    '.kkk..kkk.',
    '.kkkkkkkk.',
    '.kkkkkkkk.',
    '..kkkkkk..',
    '..........',
    '..........',
  ];

  // Bomb pickup — 10×10, 2 frames fuse
  const BOMB_A = [
    '......e...',
    '.....fY...',
    '......eY..',
    '..111111..',
    '.10110011.',
    '.10011001.',
    '.11001111.',
    '.11111111.',
    '..111111..',
    '..........',
  ];
  const BOMB_B = [
    '....f.....',
    '...feY....',
    '....fY....',
    '..111111..',
    '.10110011.',
    '.10011001.',
    '.11001111.',
    '.11111111.',
    '..111111..',
    '..........',
  ];

  // Chicken / food — 10×10
  const CHICKEN = [
    '..........',
    '...ccc....',
    '..cbbbc...',
    '..cbbbc...',
    '..cbbbc...',
    '..cbbbc...',
    '...777....',
    '...777....',
    '....7.....',
    '..........',
  ];

  // ── POTIONS — 10×10, 2-frame liquid shimmer ──────────────────
  // Cork + bottle silhouette + colored liquid + white highlight glint.
  function potion(liquid, dark, hi) {
    return [
      '...bb.....',
      '..bcccb...',  // cork
      '..b...b...',
      '.b' + dark + dark + dark + dark + 'b..',
      'b' + dark + liquid + liquid + liquid + liquid + dark + 'b.',
      'b' + dark + liquid + hi + liquid + liquid + dark + 'b.',
      'b' + dark + liquid + liquid + liquid + liquid + dark + 'b.',
      'b' + dark + liquid + liquid + liquid + liquid + dark + 'b.',
      '.b' + dark + dark + dark + dark + 'b..',
      '..bbbbbb..',
    ];
  }
  function potionShimmer(liquid, dark, hi) {
    return [
      '...bb.....',
      '..bcccb...',
      '..b...b...',
      '.b' + dark + dark + dark + dark + 'b..',
      'b' + dark + liquid + hi + liquid + liquid + dark + 'b.',
      'b' + dark + liquid + liquid + liquid + hi + dark + 'b.',
      'b' + dark + hi + liquid + liquid + liquid + dark + 'b.',
      'b' + dark + liquid + liquid + hi + liquid + dark + 'b.',
      '.b' + dark + dark + dark + dark + 'b..',
      '..bbbbbb..',
    ];
  }
  const POTION_HP_A = potion('R', 'r', 'P');         // red — health
  const POTION_HP_B = potionShimmer('R', 'r', 'P');
  const POTION_MIGHT_A = potion('e', 'd', 'f');      // orange — strength/might
  const POTION_MIGHT_B = potionShimmer('e', 'd', 'f');
  const POTION_MANA_A = potion('i', 'k', 'W');       // blue — mana/cd
  const POTION_MANA_B = potionShimmer('i', 'k', 'W');
  const POTION_SWIFT_A = potion('G', 'g', 'h');      // green — speed
  const POTION_SWIFT_B = potionShimmer('G', 'g', 'h');
  const POTION_ARCANE_A = potion('M', 'p', 'q');     // purple — arcane
  const POTION_ARCANE_B = potionShimmer('M', 'p', 'q');

  // ── CHEST + SCROLL + KEY ─────────────────────────────────────
  // Wooden chest, closed (2 frames glint) and open (gold spill).
  const CHEST_CLOSED_A = [
    '............',
    '...bbbbbb...',
    '..bccccccb..',
    '.bcaaaaaacb.',
    '.bcaaYYaacb.',  // gold lock plate
    '.bcaa88aacb.',
    '.bcaaaaaacb.',
    '.bcbbbbbbcb.',
    '.bcccccccb..',
    '..bbbbbbb...',
    '............',
    '............',
  ];
  const CHEST_CLOSED_B = [
    '............',
    '...bbbbbb...',
    '..bccccccb..',
    '.bcaaaaaacb.',
    '.bcaPYYPaacb',
    '.bcaa88aacb.',
    '.bcaaaaaacb.',
    '.bcbbbbbbcb.',
    '.bcccccccb..',
    '..bbbbbbb...',
    '............',
    '............',
  ];
  const CHEST_OPEN = [
    '...YYYYYY...',
    '..YfeeeeYY..', // golden glow rising
    '.YYYYY9999Y.',
    'bccccccccccb',
    'bcaaaa9889acb',  // overshoot trimmed below
    'bcaaaaaaaacb',
    'bcaaaaaaaacb',
    'bcbbbbbbbbcb',
    'bcccccccccb.',
    'bbbbbbbbbb..',
    '............',
    '............',
  ];
  for (let i = 0; i < CHEST_OPEN.length; i++) {
    if (CHEST_OPEN[i].length > 12) CHEST_OPEN[i] = CHEST_OPEN[i].slice(0, 12);
    while (CHEST_OPEN[i].length < 12) CHEST_OPEN[i] += '.';
  }

  // Rare gold chest — same shape, brassier
  const CHEST_GOLD_A = [
    '............',
    '...YYYYYY...',
    '..Y9999999Y.',
    '.Y988888889Y',
    '.Y98PYY8889Y',
    '.Y9888888889',
    '.Y998888889Y',
    '.YY99999998Y',
    '.YY999999YY.',
    '..YY8888YY..',
    '............',
    '............',
  ];
  const CHEST_GOLD_B = CHEST_GOLD_A.map((r) => r); // single frame for now

  // Scroll — rolled parchment, 10×10
  const SCROLL = [
    '..........',
    '..888888..',
    '.87777778.',
    '88r777r788',  // red wax seal
    '87rRrRr78.',
    '887777788.',
    '.87rrrr78.',
    '.87777778.',
    '..888888..',
    '..........',
  ];

  // Key — gold antique key, 10×10
  const KEY = [
    '..........',
    '...YYY....',
    '..Y9Y9Y...',
    '..Y888Y...',
    '...Y9Y....',
    '....Y.....',
    '....Y.....',
    '....YYY...',
    '....Y.....',
    '....YYY...',
  ];

  // Rune stone — purple glowing rune, 10×10
  const RUNE_A = [
    '...4444...',
    '..454M54..',
    '.45MMMM54.',
    '.4M.MM.M4.',
    '.4M.MM.M4.',
    '.4MMMMMM4.',
    '.4M.MM.M4.',
    '.45MMMM54.',
    '..454M54..',
    '...4444...',
  ];
  const RUNE_B = [
    '...4444...',
    '..454q54..',
    '.45qqqq54.',
    '.4q.qq.q4.',
    '.4q.qq.q4.',
    '.4qqqqqq4.',
    '.4q.qq.q4.',
    '.45qqqq54.',
    '..454q54..',
    '...4444...',
  ];

  // ============================================================
  // NEW DROP ITEMS + WEAPONS + LEGENDARIES (v3)
  // ============================================================

  // Vacuum / Item Magnet Bomb — sucks ALL nearby pickups to player
  const VACUUM_A = [
    '..........',
    '...IPI....',
    '..IkkkI...',
    '.IkPPPkII.',
    '.IkPNPkII.',
    '.IkPPPkII.',
    '..IkkkI...',
    '...IPI....',
    '..........',
    '..........',
  ];
  const VACUUM_B = [
    '...P......',
    '..PIP.....',
    '.PIkIkP...',
    'PIkPNPkIP.',
    'PIPNPNPIP.',
    'PIkPNPkIP.',
    '.PIkIkP...',
    '..PIP.....',
    '...P......',
    '..........',
  ];

  // Hourglass / Time Stop — freezes time briefly
  const HOURGLASS_A = [
    '..........',
    '..888888..',
    '..YYYYYY..',
    '..fffffff.',
    '...ffff...',
    '....ff....',
    '....ff....',
    '...ffff...',
    '..f.fff.f.',
    '..YYYYYY..',
    '..888888..',
    '..........',
  ];
  const HOURGLASS_B = [
    '..........',
    '..888888..',
    '..YYYYYY..',
    '..ff.fff..',
    '...f.ff...',
    '....ff....',
    '....ff....',
    '...ffff...',
    '..fffffff.',
    '..YYYYYY..',
    '..888888..',
    '..........',
  ];

  // Star Power — invincibility + damage boost, 4 frames spin
  function starItem(rot) {
    const W = 10, C = 4.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + i * (Math.PI * 2 / 5) + rot;
      for (let r = 0; r < 4.5; r += 0.5) {
        const x = Math.round(C + Math.cos(a) * r);
        const y = Math.round(C + Math.sin(a) * r);
        if (x >= 0 && x < W && y >= 0 && y < W) {
          g[y][x] = r < 2 ? 'P' : r < 3 ? 'Y' : '9';
        }
      }
    }
    if (rot > 0) { g[1][8] = 'P'; g[8][1] = 'P'; }
    return g.map((r) => r.join(''));
  }
  const STAR_POWER_1 = starItem(0);
  const STAR_POWER_2 = starItem(0.3);
  const STAR_POWER_3 = starItem(0.6);
  const STAR_POWER_4 = starItem(0.9);

  // Lucky Coin — doubles gold drops
  const LUCKY_COIN_1 = [
    '..........',
    '..PPPP....',
    '.PYY99YYP.',
    '.PY9889YP.',
    '.PY9hG9YP.',
    '.PY9Gh9YP.',
    '.PYY99YYP.',
    '..PPPP....',
    '..........',
    '..........',
  ];
  const LUCKY_COIN_2 = [
    '..........',
    '..YYYY....',
    '..Y99Y....',
    '..Y88Y....',
    '..Y8h8Y...',
    '..Y88Y....',
    '..Y99Y....',
    '..YYYY....',
    '..........',
    '..........',
  ];
  const LUCKY_COIN_3 = [
    '..........',
    '...YY.....',
    '...88.....',
    '...88.....',
    '...8h.....',
    '...88.....',
    '...88.....',
    '...YY.....',
    '..........',
    '..........',
  ];
  const LUCKY_COIN_4 = LUCKY_COIN_2;

  // Soul Crystal — extra life
  const SOUL_CRYSTAL_A = [
    '..........',
    '...rRRr...',
    '..rRRRRr..',
    '.rRRPPRRr.',
    '.rRRPRRRr.',
    'rRRRPRRRRr',
    'rRRRRRRRRr',
    'rRRRRRRRRr',
    '.rRRRRRRR.',
    '..rRRRRr..',
    '...rRRr...',
    '....rr....',
  ];
  const SOUL_CRYSTAL_B = [
    '...PPP....',
    '...rRRr...',
    '..rRPPRr..',
    '.rRPPPRRr.',
    '.rRRPPRRr.',
    'rRRRPPRRRr',
    'rRRRRRRRRr',
    'rRRRRRRRRr',
    '.rRRRRRRR.',
    '..rRRRRr..',
    '...rRRr...',
    '....rr....',
  ];

  // Tome of Knowledge — XP boost
  const TOME_A = [
    '..........',
    '..bbbbbb..',
    '.b777777b.',
    '.b7Y99Y7b.',
    '.b7Y889Y7b',
    '.b7Y89Y7b.',
    '.b7Y99Y7b.',
    '.b777777b.',
    '.b777777b.',
    '..bbbbbb..',
    '..........',
    '..........',
  ];
  const TOME_B = [
    '..........',
    '..bbbbbb..',
    '.b777777b.',
    '.b7YPP997b',
    '.b7YP889Yb',
    '.b7Y89Y7b.',
    '.b7Y99Y7b.',
    '.b777777b.',
    '.b777777b.',
    '..bbbbbb..',
    '..........',
    '..........',
  ];

  // Talisman / Random Amulet — random buff
  const TALISMAN_A = [
    '..........',
    '....88....',
    '..88YY88..',
    '.8YYMMYY8.',
    '.8YMqMMY8.',
    '.8YYMMYY8.',
    '..8YYY8...',
    '...8Y8....',
    '....8.....',
    '..........',
  ];
  const TALISMAN_B = [
    '..........',
    '....88....',
    '..88YY88..',
    '.8YYqqMY8.',
    '.8YMPqMY8.',
    '.8YYqqYY8.',
    '..8YYY8...',
    '...8Y8....',
    '....8.....',
    '..........',
  ];

  // Skull Key — unlocks any chest
  const SKULL_KEY_A = [
    '..........',
    '...666....',
    '..67776...',
    '.67100776.',
    '.67700776.',
    '..67766...',
    '....66....',
    '....66....',
    '....66YY..',
    '....66.Y..',
  ];
  const SKULL_KEY_B = SKULL_KEY_A;

  // Mystic Orb — random buff drop
  function mysticOrb(phase) {
    const W = 10, C = 4.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const palettes = [
      { outer: 'M', mid: 'm', inner: 'q', glow: 'p' },
      { outer: 'R', mid: 'r', inner: 'f', glow: 'r' },
      { outer: 'N', mid: 'n', inner: 'q', glow: 'n' },
      { outer: 'h', mid: 'G', inner: 'P', glow: 'g' },
    ];
    const p = palettes[phase];
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - C) ** 2 + (y - C) ** 2);
      if (d < 1.5) g[y][x] = p.inner;
      else if (d < 2.5) g[y][x] = p.mid;
      else if (d < 3.5) g[y][x] = p.outer;
      else if (d < 4) g[y][x] = p.glow;
    }
    g[3][3] = 'P';
    return g.map((r) => r.join(''));
  }
  const MYSTIC_ORB_1 = mysticOrb(0);
  const MYSTIC_ORB_2 = mysticOrb(1);
  const MYSTIC_ORB_3 = mysticOrb(2);
  const MYSTIC_ORB_4 = mysticOrb(3);

  // ── NEW BASIC WEAPONS ────────────────────────────────────────

  // Boomerang
  const BOOMERANG_F1 = [
    '............',
    '..bbb.......',
    '..bccbb.....',
    '..bccccbb...',
    '...bccccbb..',
    '....bccccbb.',
    '......bccbb.',
    '........bb..',
  ];
  const BOOMERANG_F2 = [
    '............',
    '......bbb...',
    '....bbccb...',
    '..bbccccb...',
    '..bccccb....',
    '..bccccbb...',
    '..bccb......',
    '..bb........',
  ];
  const BOOMERANG_F3 = [
    '........bb..',
    '......bccbb.',
    '....bccccbb.',
    '...bccccbb..',
    '..bccccbb...',
    '..bccbb.....',
    '..bbb.......',
    '............',
  ];
  const BOOMERANG_F4 = [
    '..bb........',
    '..bccb......',
    '..bccccbb...',
    '..bccccb....',
    '..bbccccb...',
    '....bbccb...',
    '......bbb...',
    '............',
  ];

  // Crystal Shard
  const CRYSTAL_SHARD_A = [
    '...PP...',
    '..PqqP..',
    '.PqMMqP.',
    'PqMNMqMP',
    'PqMNMqMP',
    '.PqMMqP.',
    '..PqqP..',
    '...PP...',
  ];
  const CRYSTAL_SHARD_B = [
    '...PP...',
    '..PqPP..',
    '.PqMMPP.',
    'PqPNPqMP',
    'PqMPMqMP',
    '.PPMMqP.',
    '..PPqP..',
    '...PP...',
  ];

  // Sun Bow Arrow
  const SUN_ARROW_A = [
    '..............',
    'P............P',
    '.YYYYYYYYYYYYY',
    '.f9999999999fP',
    '.YYYYYYYYYYYYY',
    'P............P',
  ];
  const SUN_ARROW_B = [
    'P............P',
    '..PPPPPPPPPPP.',
    'YYYYYYYYYYYYYP',
    'f9999999999fPP',
    'YYYYYYYYYYYYYP',
    '..PPPPPPPPPPP.',
  ];

  // Frostblade
  const FROSTBLADE_A = [
    '....WW....',
    '....IW....',
    '....IW....',
    '....IW....',
    '....IW....',
    '....IW....',
    '....IW....',
    '....IW....',
    '...PIWP...',
    '..PIIIIWP.',
    '..PIIIIWP.',
    '...bbcb...',
    '...bbcb...',
    '....cc....',
  ];
  const FROSTBLADE_B = [
    '....WW....',
    '....PW....',
    '....IW....',
    '...PIWP...',
    '....IW....',
    '....IW....',
    '....IW....',
    '....IW....',
    '...WIWW...',
    '..PIIIIWP.',
    '..PIIIIWP.',
    '...bbcb...',
    '...bbcb...',
    '....cc....',
  ];

  // Plague Dart
  const PLAGUE_DART_A = [
    '..........',
    '.GhhhhhhPP',
    'hGGGGGGGGP',
    'hGGGGGGGGP',
    '.GhhhhhhPP',
    '..........',
  ];
  const PLAGUE_DART_B = [
    '...g......',
    '.GhhhhhhPP',
    'hGGGgGGGGP',
    'hGGGgGGGGP',
    '.GhhhhhhPP',
    '...g......',
  ];

  // ── NEW LEGENDARY WEAPONS ────────────────────────────────────

  // Sun Phoenix Bow — flame-wreathed bow
  const SUN_PHOENIX_BOW_A = [
    '....e..e......',
    '...feffefe....',
    '..fePPPPPefe..',
    '.fePPYYYYPef.',
    '.eP9YYYYYYP9.',
    '.fY99YYYY99Yf',
    '.feYY9YY9YYef',
    '.fefYYYYYYef.',
    '..efeYYYYef..',
    '...feeYYef...',
    '....feef.....',
    '.....fe......',
  ];
  const SUN_PHOENIX_BOW_B = [
    '...e...e......',
    '..feff.feffe..',
    '..fePPPPPefe..',
    '.fePPYYYYPef.',
    '.eP9YYYYYYP9.',
    '.fY99YYYY99Yf',
    '.feYY9YY9YYef',
    '.fefYYYYYYef.',
    '..efeYYYYef..',
    '...feeYYef...',
    '....feef.....',
    '.....fe......',
  ];

  // Eternal Frost (sword)
  const ETERNAL_FROST_A = [
    '....WP....',
    '...PIWI...',
    '...IIWI...',
    '...IIWI...',
    '...IIWI...',
    '...IIWI...',
    '...IIWI...',
    '...IIWI...',
    '...IIWI...',
    '..PIIIIP..',
    '.PWIIIIWP.',
    '..PIIIIP..',
    '....cc....',
    '....bc....',
    '....bc....',
    '....cc....',
  ];
  const ETERNAL_FROST_B = [
    '....WP....',
    '..P.IWI.P.',
    '...IIWI...',
    '...IIWI...',
    '..PIIWI...',
    '...IIWIP..',
    '...IIWI...',
    '...IIWI...',
    '...IIWI...',
    '..PIIIIP..',
    '.PWIIIIWP.',
    '..PIIIIP..',
    '....cc....',
    '....bc....',
    '....bc....',
    '....cc....',
  ];

  // Demon Heart — pulsing orb
  function demonHeart(pulse) {
    const W = 10, C = 4.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - C) ** 2 + (y - C) ** 2);
      if (d < 1.5 + pulse * 0.3) g[y][x] = 'P';
      else if (d < 2.5 + pulse * 0.3) g[y][x] = 'R';
      else if (d < 3.5 + pulse * 0.3) g[y][x] = 'r';
      else if (d < 4.5) g[y][x] = '0';
    }
    return g.map((r) => r.join(''));
  }
  const DEMON_HEART_1 = demonHeart(0);
  const DEMON_HEART_2 = demonHeart(1);
  const DEMON_HEART_3 = demonHeart(2);
  const DEMON_HEART_4 = demonHeart(1);

  // Storm Caller — staff with cloud + lightning bolt
  function stormCaller(bolt) {
    return [
      '..........',
      '.II..II...',
      'IIIIIIII..',
      'IIIIIIIII.',
      '.IIIIIIII.',
      bolt === 0 ? '...P......' : bolt === 1 ? '...PP.....' : bolt === 2 ? '....PP....' : '.....P....',
      bolt === 0 ? '....P.....' : bolt === 1 ? '...PP.....' : bolt === 2 ? '....P.....' : '....PP....',
      bolt === 0 ? '....I.....' : bolt === 1 ? '....IPI...' : bolt === 2 ? '...IIPP...' : '...IIPP...',
      '....b.....',
      '....b.....',
      '....b.....',
      '....b.....',
      '....b.....',
      '....b.....',
      '....c.....',
      '....c.....',
    ];
  }
  const STORM_CALLER_1 = stormCaller(0);
  const STORM_CALLER_2 = stormCaller(1);
  const STORM_CALLER_3 = stormCaller(2);
  const STORM_CALLER_4 = stormCaller(3);

  // World Tree Staff
  const WORLD_TREE_A = [
    '...GhG....',
    '..hGhGGh..',
    '..GGhGhGh.',
    '.GhGhhGGGh',
    '..GhGhGhG.',
    '...GhhG...',
    '....bb....',
    '....bc....',
    '....bb....',
    '....bc....',
    '....bb....',
    '....bc....',
    '....bb....',
    '....bc....',
    '...cccc...',
    '..ccaacc..',
  ];
  const WORLD_TREE_B = [
    '..PGhGP...',
    '..hGhGGh..',
    'PGGhGhGhP.',
    '.GhGhhGGGh',
    '..GhGhGhG.',
    '...GhhG...',
    '....bb....',
    '....bc....',
    '....bb....',
    '....bc....',
    '....bb....',
    '....bc....',
    '....bb....',
    '....bc....',
    '...cccc...',
    '..ccaacc..',
  ];

  // ============================================================
  // TILESET — 16×16 dungeon stone floor variants
  // ============================================================
  const TILE_STONE_1 = [
    '4445544445544455',
    '4555544555444445',
    '4555555555544444',
    '4455554455544455',
    '4445554445544555',
    '5555555555555555', // mortar seam
    '4444555444554445',
    '4445544455554455',
    '4555544444555544',
    '4555554455555555',
    '4444554455554445',
    '5555555555555555',
    '4445554445554445',
    '4555544555444555',
    '4555555555544455',
    '4455544455544445',
  ];
  const TILE_STONE_2 = [
    '5555555555555555',
    '4555444555544555',
    '4444554455444555',
    '4455554455544455',
    '4445554445554555',
    '4445544445544455',
    '4555544555444445',
    '4555555555544444',
    '5555555555555555',
    '4555544455554455',
    '4555544555544455',
    '4555555555544444',
    '4455554455544455',
    '4445554445544555',
    '4555544455554455',
    '4555544555544455',
  ];
  const TILE_STONE_CRACK = [
    '5555555555555555',
    '4555444555544555',
    '4444554455444555',
    '4455550455544455',
    '4445550445554555',
    '4445500445544455',
    '4555500555444445',
    '4555005555544444',
    '5555055555555555',
    '4500544455554455',
    '4555544555544455',
    '4555555555544444',
    '4455554455544455',
    '4445554445544555',
    '4555544455554455',
    '4555544555544455',
  ];
  const TILE_GRASS_TUFT = [
    '4445544445544455',
    '4555.G..555.4445',
    '4555hGh4555hG44',
    '4455.G.4555.G55',
    '4445554445544555',
    '5555555555555555',
    '4444555..G54445',
    '4445544hGh4455',  // shorter to fit; pad to 16
    '4555544.G.44555',
    '4555554455555555',
    '4444554455554445',
    '5555555555555555',
    '4445554..G.4445',
    '4555544hGh4555',
    '4555555.G.55555',
    '4455544455544445',
  ];
  // Fix grass tuft rows that are too short
  for (let i = 0; i < TILE_GRASS_TUFT.length; i++) {
    while (TILE_GRASS_TUFT[i].length < 16) TILE_GRASS_TUFT[i] += '4';
    if (TILE_GRASS_TUFT[i].length > 16) TILE_GRASS_TUFT[i] = TILE_GRASS_TUFT[i].slice(0, 16);
  }

  const TILE_BONES = [
    '4445544445544455',
    '4555544555444445',
    '4555.6666.444444',
    '4455666666444455',
    '4445.6666.444555',
    '5556..66..555555',
    '4444555444554445',
    '4445544455554455',
    '4555544444555544',
    '4555554..6.55555',
    '444.6666666.4445',
    '5555.66666.55555',
    '4445.66666.54445',
    '4555..666..54555',
    '4555555.6.555555',
    '4455544455544445',
  ];
  for (let i = 0; i < TILE_BONES.length; i++) {
    while (TILE_BONES[i].length < 16) TILE_BONES[i] += '4';
    if (TILE_BONES[i].length > 16) TILE_BONES[i] = TILE_BONES[i].slice(0, 16);
  }

  const TILE_BLOOD = [
    '4445544445544455',
    '4555544555444445',
    '4555555555544444',
    '4455554455544455',
    '4445554445rrr555',
    '5555555555rRRr55',
    '4444555444Rrrrr5',
    '444554445rRRrRr5',
    '4555544444rRRrrr',
    '4555554455rrrRR5',
    '4444554455554rr5',
    '5555555555555555',
    '4445554445554445',
    '4555544555444555',
    '4555555555544455',
    '4455544455544445',
  ];

  // ── NEW BIOME TILES ──────────────────────────────────────────
  // Lush green grass — bright meadow, no stone
  const TILE_GRASS_FULL = [
    'GGhGGGGhGGGhGGGG',
    'GhGGGhGGGhGGGhGG',
    'GGGhGGGhGGGhGGGh',
    'hGGGhGGGhGGGhGGG',
    'GGhGGGGhGGGhGGGG',
    'GhGGGhGGGhGGGhGG',
    'GGGhGGGhGGGhGGGh',
    'hGGGhGGGhGGGhGGG',
    'GGhGGGGhGGGhGGGG',
    'GhGGGhGGGhGGGhGG',
    'GGGhGGGhGGGhGGGh',
    'hGGGhGGGhGGGhGGG',
    'GGhGGGGhGGGhGGGG',
    'GhGGGhGGGhGGGhGG',
    'GGGhGGGhGGGhGGGh',
    'hGGGhGGGhGGGhGGG',
  ];

  // Darker grass — under tree shade
  const TILE_GRASS_DARK = [
    'gggGgggGgggGggGg',
    'ggGgggGgggGgggGg',
    'gGggGgggGgggGgGg',
    'ggGgggGgggGgggGg',
    'gggGgggGgggGggGg',
    'ggGgggGgggGgggGg',
    'gGggGgggGgggGgGg',
    'ggGgggGgggGgggGg',
    'gggGgggGgggGggGg',
    'ggGgggGgggGgggGg',
    'gGggGgggGgggGgGg',
    'ggGgggGgggGgggGg',
    'gggGgggGgggGggGg',
    'ggGgggGgggGgggGg',
    'gGggGgggGgggGgGg',
    'ggGgggGgggGgggGg',
  ];

  // Dirt path — brown earth with pebbles
  const TILE_DIRT = [
    'bbbcbbcbbbcbbbcb',
    'bcbbbbcbbcbbbcbb',
    'bbbcbbbbcbbbcbbb',
    'cbbbcbbcbbbcbbbc',
    'bbcbbbbbcbbbbcbb',
    'bbb6bbcbbcbbbcbb',
    'bcbbbbcb6bbcbbbb',
    'bbbcbbcbbbcbbbcb',
    'cbbbcbbcbbbcbbbc',
    'bbcbbbcbbbcbbcbb',
    'bbbcbbbbcbbbcbbb',
    'bcbbbcbbcbbb6bcb',
    'bbcbbbbbcbbbbcbb',
    'bbbcbbcbbbcbbbcb',
    'cbbbcbbcbbbcbbbc',
    'bbcbbbcbbbcbbcbb',
  ];

  // Water / swamp — dark blue ripples
  const TILE_WATER = [
    'kkikkkikkkikkkik',
    'kikkkikkkikkkikk',
    'kkikkkikkkikkkik',
    'kIkkkIkkkIkkkIkk', // brighter ripples
    'kkikkkikkkikkkik',
    'kikkkikkkikkkikk',
    'kkikkkikkkikkkik',
    'kIkkkIkkkIkkkIkk',
    'kkikkkikkkikkkik',
    'kikkkikkkikkkikk',
    'kkikkkikkkikkkik',
    'kIkkkIkkkIkkkIkk',
    'kkikkkikkkikkkik',
    'kikkkikkkikkkikk',
    'kkikkkikkkikkkik',
    'kIkkkIkkkIkkkIkk',
  ];

  // Mossy stone — stone tile with green moss patches
  const TILE_MOSS = [
    '5555555555555555',
    '4555gGg555444555',
    '444GhGG54455GgG5',
    '4455gGg5554gGhGG',
    '4445554445GGgg45',
    '5555555555555555',
    '44gGg55444554445',
    '4hGGGh4455554455',
    '4GGgg444GgG55554',
    '45Gg5455gGhGG555',
    '4444554gGGgg44455',
    '5555555555555555',
    '4445554445554445',
    '4555544555gGg4555',
    '455555555GhGGg455',
    '44555444554Ggg455',
  ];
  // Trim long rows on TILE_MOSS
  for (let i = 0; i < TILE_MOSS.length; i++) {
    if (TILE_MOSS[i].length > 16) TILE_MOSS[i] = TILE_MOSS[i].slice(0, 16);
    while (TILE_MOSS[i].length < 16) TILE_MOSS[i] += '4';
  }

  // ============================================================
  // UI ICONS — 24×24 with parchment circle background
  // ============================================================
  // Each icon shares the same circular frame so they read as a set.
  function iconBase() {
    return [
      '........................',
      '........................',
      '.......888888888........',
      '.....88aaaaaaaa88.......',
      '....8aa77777777aa8......',
      '...8a77777777777a8......',
      '...8a77777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '...8a77777777777a8......',
      '...8a77777777777a8......',
      '....8aa77777777aa8......',
      '.....88aaaaaaaa88.......',
      '.......888888888........',
      '........................',
    ];
  }
  function paint(base, overlay, ox, oy) {
    const out = base.map((r) => r.split(''));
    for (let y = 0; y < overlay.length; y++) {
      for (let x = 0; x < overlay[y].length; x++) {
        const c = overlay[y][x];
        if (c !== '.' && c !== ' ') out[oy + y][ox + x] = c;
      }
    }
    return out.map((r) => r.join(''));
  }

  // wand icon — small wand with star
  const ICON_WAND = paint(iconBase(), [
    '..........YY',
    '.........YfY',
    '........YY..',
    '.......bb...',
    '......bb....',
    '.....bb.....',
    '....bb......',
    '...bb.......',
    '..bb........',
    '.bb.........',
    '8b..........',
    '8...........',
  ], 6, 6);

  // nova icon — purple orb radiating
  const ICON_NOVA = paint(iconBase(), [
    '....M.......',
    '.M..M..M....',
    '..M.M.M.....',
    '...mMm......',
    'MMMMqMMMM...',
    '...mMm......',
    '..M.M.M.....',
    '.M..M..M....',
    '....M.......',
  ], 6, 8);

  // prism wand icon — evolved cyan
  const ICON_PRISM = paint(iconBase(), [
    '..........qq',
    '.........qNq',
    '........qNN.',
    '.......qNq..',
    '......qNq...',
    '.....qNq....',
    '....qNq.....',
    '...qNq......',
    '..qNq.......',
    '.qNq........',
    'kNq.........',
    'k...........',
  ], 6, 6);

  // might icon — fist
  const ICON_MIGHT = paint(iconBase(), [
    '...cccc.....',
    '..cbbbbc....',
    '..cbcbcbc...',
    '..cbcbcbc...',
    '..cbbbbbc...',
    '..cbcbcbc...',
    '.cbbbbbbc...',
    '.cbbbbbbc...',
    '..cccccc....',
    '...aaaa.....',
  ], 6, 7);

  // haste icon — winged boot
  const ICON_HASTE = paint(iconBase(), [
    '.....I.I....',
    '....IIIII...',
    '...IIaaaII..',
    '..IIaaaaaII.',
    '...aaaaaaa..',
    '...abbbbba..',
    '...abbbbbba.',
    '....bbbbbb..',
    '....aaaaaa..',
  ], 5, 8);

  // multi icon — three arrows
  const ICON_MULTI = paint(iconBase(), [
    '.YY.........',
    '.YYY........',
    '.YYYY.YY....',
    'YYYYYYYY....',
    'YYYYYYYYY...',
    'YYYYYYYY....',
    '.YYYY.YY....',
    '.YYY........',
    '.YY.........',
  ], 7, 8);

  // swift icon — feather
  const ICON_SWIFT = paint(iconBase(), [
    '.........II.',
    '........III.',
    '.......IIII.',
    '......IIIWI.',
    '.....IIIWIW.',
    '....IIWIWI..',
    '...IWIWII...',
    '..WIWII.....',
    '.WIII.......',
    'III.........',
    'bb..........',
  ], 6, 6);

  // vigor icon — heart on shield
  const ICON_VIGOR = paint(iconBase(), [
    '..IIIIIIII..',
    '..IkIIIIkI..',
    '..IkRR.RRkI.',
    '..IRPRRPRRI.',
    '..IRRRRRRRI.',
    '..IkRRRRRkI.',
    '..IkkRRRkkI.',
    '..IIkRRRkII.',
    '...IkkRkkI..',
    '....IkRkI...',
    '.....IkI....',
  ], 6, 6);

  // lodestone icon — horseshoe magnet
  const ICON_LODESTONE = paint(iconBase(), [
    '.RRR....RRR.',
    'RRPR....RPRR',
    'RRPR....RPRR',
    'RRkR....RkRR',
    'RRkR....RkRR',
    'RRkRRRRRRkRR',
    'RRkkkkkkkkRR',
    '.RkkkkkkkkR.',
    '..kkkkkkkk..',
    '...kkkkkk...',
  ], 6, 7);

  // ── New weapon icons ─────────────────────────────────────────
  // spear icon — long diagonal shaft + tip
  const ICON_SPEAR = paint(iconBase(), [
    '..........YP',
    '.........YYP',
    '........YYY.',
    '.......bbY..',
    '......bbb...',
    '.....bbb....',
    '....bbb.....',
    '...bbb......',
    '..bbb.......',
    '.bbb........',
    'ccc.........',
    '8...........',
  ], 6, 6);

  // axe icon — battleaxe head + shaft
  const ICON_AXE = paint(iconBase(), [
    '..6666......',
    '.665566.....',
    '666.566.....',
    '66...566....',
    '.5...56b....',
    '......b.....',
    '......b.....',
    '......b.....',
    '......b.....',
    '......c.....',
  ], 7, 7);

  // mace icon — round gold mace head
  const ICON_MACE = paint(iconBase(), [
    '...YYYY.....',
    '..YY99YY....',
    '..Y9889Y....',
    '..Y9889Y....',
    '..YY99YY....',
    '....bb......',
    '....bb......',
    '....bb......',
    '....cc......',
  ], 7, 8);

  // holy-water icon — bottle with cyan liquid
  const ICON_HOLYWATER = paint(iconBase(), [
    '....kk......',
    '...kIIk.....',
    '...kIIk.....',
    '..kIIIIk....',
    '..kIWIIk....',
    '..kIIIWk....',
    '..kIWIIk....',
    '..kIIIIk....',
    '...kkkk.....',
  ], 7, 8);

  // arrow icon — feathered shaft
  const ICON_ARROW = paint(iconBase(), [
    '..........YP',
    '.h.......YYP',
    '.hh...cccYY.',
    'hhcccccccc..',
    '.hh...cccYY.',
    '.h.......YYP',
    '..........YP',
  ], 5, 9);

  // garlic icon — white clove
  const ICON_GARLIC = paint(iconBase(), [
    '....7.......',
    '...777......',
    '..7777.7....',
    '.77P777.7...',
    '77P7P7777...',
    '.7P7777P7...',
    '.77P77P77...',
    '..7777P7....',
    '...7777.....',
  ], 6, 7);

  // bible icon — closed book with cross
  const ICON_BIBLE = paint(iconBase(), [
    'bbbbbbbbbbbb',
    'b77777777777',
    'b7777Y77777b',
    'b777Y9Y7777b',
    'b77Y989Y77b.',
    'b7777Y77777b',
    'b77777777777',
    'b77777777777',
    'bbbbbbbbbbbb',
  ], 6, 7);

  // cross icon — golden crucifix
  const ICON_CROSS = paint(iconBase(), [
    '....YY......',
    '...Y99Y.....',
    '...Y89Y.....',
    '..YYYYY.....',
    '.Y998899Y...',
    '.Y998899Y...',
    '..YYYYY.....',
    '...Y89Y.....',
    '...Y99Y.....',
    '....YY......',
  ], 6, 7);

  // ── Character portrait icons (24×24 framed circle) ────────────
  // Pull the walking sprite's first frame and stamp it scaled into the
  // parchment frame so the player-pick screen has matching art.
  function heroPortrait(baseFrame, accent) {
    const out = iconBase().map((r) => r.split(''));
    // accent ring colour
    for (let y = 4; y < 20; y++) for (let x = 4; x < 20; x++) {
      if (out[y][x] === 'a' || out[y][x] === '8') out[y][x] = accent;
    }
    // stamp baseFrame (16x16) at (4,4)
    for (let y = 0; y < baseFrame.length; y++) {
      for (let x = 0; x < baseFrame[y].length; x++) {
        const c = baseFrame[y][x];
        if (c === '.' || c === ' ') continue;
        out[4 + y][4 + x] = c;
      }
    }
    return out.map((r) => r.join(''));
  }

  const ICON_HERO_KNIGHT = heroPortrait(KNIGHT_BASE, '8');
  const ICON_HERO_MAGE = heroPortrait(MAGE_BASE, 'p');
  const ICON_HERO_HUNTRESS = heroPortrait(HUNTRESS_BASE, 'g');
  const ICON_HERO_CLERIC = heroPortrait(CLERIC_BASE, '9');
  const ICON_HERO_WARRIOR = heroPortrait(WARRIOR_BASE, 'r');

  // ── New weapon icons (whip / lightning / firewall / knives / scythe / bone)
  const ICON_WHIP = paint(iconBase(), [
    '............',
    '.aabbb......',
    '..bccbbb....',
    '....bccbb...',
    '......bccbb.',
    '........bccb',
    '..........bP',
  ], 6, 9);

  const ICON_LIGHTNING = paint(iconBase(), [
    '....PP......',
    '...PWP......',
    '...IWP......',
    '..IWWP......',
    '..IWP.......',
    '.IWWPP......',
    '.IWP........',
    'IWPP........',
    'IWP.........',
    'IPP.........',
  ], 6, 7);

  const ICON_FIREWALL = paint(iconBase(), [
    '..f.f...f.f.',
    '.fef.fef.fef',
    'feedffeeddef',
    'feddeeddeede',
    'edddeedddded',
    'addddddadddd',
    'aaaaaaaaaaaa',
  ], 5, 10);

  const ICON_KNIVES = paint(iconBase(), [
    '..PP........',
    '...II....PP.',
    '....II..II..',
    '.....II.II..',
    '.PP...IIII..',
    '..II...II...',
    '...II..II...',
    '....II.II...',
    '.....IIII...',
    '......II....',
  ], 6, 7);

  const ICON_SCYTHE = paint(iconBase(), [
    '....IIIII...',
    '...IIWWWII..',
    '..IIWIIIWI..',
    '..IIWII.....',
    '...IIWI.....',
    '....bb......',
    '....bb......',
    '....bb......',
    '....bb......',
    '....cc......',
  ], 6, 7);

  const ICON_BONE = paint(iconBase(), [
    '...66.......',
    '..6776..6...',
    '.677776666..',
    '..6776776...',
    '...6776.....',
    '....6776....',
    '...6776.....',
    '..6776......',
    '.6776...66..',
    '.666...6776.',
  ], 6, 7);

  // Boss portraits — match hero portrait style
  function bossPortrait(big32frame, accent) {
    const out = iconBase().map((r) => r.split(''));
    for (let y = 4; y < 20; y++) for (let x = 4; x < 20; x++) {
      if (out[y][x] === 'a' || out[y][x] === '8') out[y][x] = accent;
    }
    // sample 32→16: pick every other pixel
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const c = big32frame[y * 2][x * 2];
        if (c === '.' || c === ' ') continue;
        out[4 + y][4 + x] = c;
      }
    }
    return out.map((r) => r.join(''));
  }
  const ICON_BOSS_LICH     = bossPortrait(BOSS_A, 'm');
  const ICON_BOSS_VAMPIRE  = bossPortrait(VAMPIRE_A, 'R');
  const ICON_BOSS_SKELETON = bossPortrait(SKELETON_KING_A, '6');
  const ICON_BOSS_DEMON    = bossPortrait(DEMON_A, 'r');

  // Legendary weapon icons — golden frame variant
  function legendaryIconBase() {
    const b = iconBase().map((r) => r.split(''));
    // brighten frame ring with gold
    for (let y = 2; y < 22; y++) for (let x = 2; x < 22; x++) {
      if (b[y][x] === '8') b[y][x] = '9';
      if (b[y][x] === 'a') b[y][x] = '8';
    }
    return b.map((r) => r.join(''));
  }
  function legPaint(overlay, ox, oy) {
    return paint(legendaryIconBase(), overlay, ox, oy);
  }

  const ICON_LEG_BLADE = legPaint([
    '..PPPP..',
    '.IIIIII.',
    'IIWWWWII',
    'IWIIIIWI',
    'IWIIIIWI',
    'IWIIIIWI',
    '.YYIIYY.',
    '..cYYc..',
    '..bbbb..',
    '..bbbb..',
  ], 8, 7);

  const ICON_LEG_AXE = legPaint([
    '..PPPP....',
    '.PP6666P..',
    'PP665566PP',
    'P665566P.P',
    '.665566P..',
    '..666b....',
    '....b.....',
    '....b.....',
    '....c.....',
  ], 7, 7);

  const ICON_LEG_SPEAR = legPaint([
    '...........P',
    '..........PI',
    '.........PWP',
    'bbbbbbbbbWWP',
    '.........PWP',
    '..........PI',
    '...........P',
  ], 6, 9);

  const ICON_LEG_ARROW = legPaint([
    '............',
    'WI.........P',
    'IIcccccccWPP',
    'WIccccccccWP',
    'IIcccccccWPP',
    'WI.........P',
    '............',
  ], 6, 9);

  const ICON_LEG_WHIP = legPaint([
    '............',
    'kIkIkIk.....',
    'IkIkIkII....',
    '..kIkIkII...',
    '...IkIkIPP..',
    '....kIkIP...',
    '............',
  ], 6, 9);

  const ICON_LEG_CROSS = legPaint([
    '....e......',
    '....f......',
    '....Y......',
    '....9......',
    '..fY999Yf..',
    '..f99899f..',
    '..fY999Yf..',
    '....9......',
    '....Y......',
    '....f......',
    '....e......',
  ], 7, 6);

  const ICON_LEG_BIBLE = legPaint([
    '.f..f..f...',
    'f.bbbbbbb.f',
    '.b7777777b.',
    '.b7Y888Y7b.',
    '.b7Y888Y7b.',
    '.b7Y888Y7b.',
    '.b7777777b.',
    'f.bbbbbbb.f',
    '.f..f..f...',
  ], 6, 7);

  const ICON_LEG_NOVA = paint(legendaryIconBase(), legNova(0), 6, 7);
  // overlay golden rays — already in the sprite

  // ============================================================
  // EXPANSION PACK · v2 — weapon impacts, muzzle, status, death,
  //   levelup, footdust, HUD, biomes, cursors
  // ============================================================

  // ── 1. WEAPON IMPACTS — 8 archetypes ─────────────────────────
  // Each is 12×12, 3 frames (peak / mid / dissipate)

  // pierce — spear/arrow: vertical spike + short feather trails
  function pierceImpact(phase) {
    const W = 12;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const len = [6, 4, 2][phase];
    const col = phase === 0 ? 'P' : phase === 1 ? 'W' : '7';
    for (let y = 6 - len; y < 6 + len; y++) g[y][6] = col;
    if (phase === 0) {
      g[5][5] = 'W'; g[5][7] = 'W';
      g[7][5] = 'W'; g[7][7] = 'W';
      g[4][6] = 'P'; g[8][6] = 'P';
    }
    if (phase < 2) {
      g[6][5] = phase === 0 ? 'P' : 'W';
      g[6][7] = phase === 0 ? 'P' : 'W';
    }
    return g.map((r) => r.join(''));
  }
  const FX_PIERCE_1 = pierceImpact(0);
  const FX_PIERCE_2 = pierceImpact(1);
  const FX_PIERCE_3 = pierceImpact(2);

  // smash — mace/hammer: radial shockwave from center
  function smashImpact(rad) {
    const W = 16, C = 7.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - C) ** 2 + (y - C) ** 2);
      if (Math.abs(d - rad) < 0.6) g[y][x] = 'P';
      else if (Math.abs(d - rad) < 1.2) g[y][x] = '7';
      else if (Math.abs(d - rad) < 1.8) g[y][x] = '6';
    }
    // central dust
    if (rad < 5) g[7][7] = 'P';
    return g.map((r) => r.join(''));
  }
  const FX_SMASH_1 = smashImpact(2);
  const FX_SMASH_2 = smashImpact(5);
  const FX_SMASH_3 = smashImpact(7);

  // slash — sword/axe: diagonal cleave line + sparks
  const FX_SLASH_HIT_1 = [
    '................',
    '................',
    '...........P....',
    '..........PWP...',
    '.........PWIW...',
    '........PWIWP...',
    '.......PWIWP....',
    '......PWIWP.....',
    '.....PWIWP......',
    '....PWIWP.......',
    '...PWIWP........',
    '...PWP..........',
    '....P...........',
    '................',
    '................',
    '................',
  ];
  const FX_SLASH_HIT_2 = [
    '................',
    '................',
    '...........7....',
    '..........7W7...',
    '.........7W7....',
    '........7W7.....',
    '.......7W7......',
    '......7W7.......',
    '.....7W7........',
    '....7W7.........',
    '...7W7..........',
    '...77...........',
    '................',
    '................',
    '................',
    '................',
  ];
  const FX_SLASH_HIT_3 = [
    '................',
    '................',
    '................',
    '..........3.....',
    '.........3......',
    '........3.......',
    '.......3........',
    '......3.........',
    '.....3..........',
    '....3...........',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ];

  // lash — whip: short crackle with bright star burst
  const FX_LASH_1 = [
    '............',
    '.....P......',
    '....PWP.....',
    '...PWPWP....',
    '.P.WPPPW..P.',
    'PWPPPWPPPWPW',
    '.P.WPPPW..P.',
    '...PWPWP....',
    '....PWP.....',
    '.....P......',
    '............',
    '............',
  ];
  const FX_LASH_2 = [
    '............',
    '.....7......',
    '.....7......',
    '...7.7.7....',
    '....777.....',
    '.7.77P77.7..',
    '....777.....',
    '...7.7.7....',
    '.....7......',
    '.....7......',
    '............',
    '............',
  ];
  const FX_LASH_3 = [
    '............',
    '............',
    '.....3......',
    '............',
    '...3.....3..',
    '............',
    '......3.....',
    '............',
    '....3.......',
    '............',
    '............',
    '............',
  ];

  // arcane — magic/nova/prism: purple-cyan sparkle burst
  function arcaneImpact(phase) {
    const W = 12, C = 5.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const rays = 8;
    const r = [3, 4.5, 5.5][phase];
    const colors = ['M', 'q', 'p'];
    for (let i = 0; i < rays; i++) {
      const a = i * Math.PI * 2 / rays + phase * 0.2;
      for (let d = 1; d < r; d++) {
        const x = Math.round(C + Math.cos(a) * d);
        const y = Math.round(C + Math.sin(a) * d);
        if (x < 0 || x >= W || y < 0 || y >= W) continue;
        g[y][x] = d > r - 1 ? colors[phase] : 'q';
      }
    }
    if (phase < 2) {
      g[Math.round(C)][Math.round(C)] = 'P';
    }
    return g.map((r) => r.join(''));
  }
  const FX_ARCANE_1 = arcaneImpact(0);
  const FX_ARCANE_2 = arcaneImpact(1);
  const FX_ARCANE_3 = arcaneImpact(2);

  // scorch — fire: ember smear with rising flames
  const FX_SCORCH_1 = [
    '................',
    '......PPP.......',
    '.....fPPPf......',
    '....fefffef.....',
    '...feddddddef...',
    '..feddRRRRddef..',
    '..edaaaaaaade...',
    '...edaa..aade...',
    '....aa....aa....',
    '....aa....aa....',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ];
  const FX_SCORCH_2 = [
    '................',
    '................',
    '......f.f.......',
    '.....fef.f......',
    '....fedfddf.....',
    '...edddddddee...',
    '..edaadddaaee...',
    '..eaaaa..aaae...',
    '...aaa....aa....',
    '....aa....a.....',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ];
  const FX_SCORCH_3 = [
    '................',
    '................',
    '................',
    '.......e........',
    '......eea.......',
    '......eda.......',
    '....edaaade.....',
    '...edaa..aade...',
    '...aa.....aa....',
    '...a.......a....',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ];

  // splash — water: concentric droplet ring
  function splashImpact(rad) {
    const W = 16, C = 7.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - C) ** 2 + (y - C) ** 2);
      if (Math.abs(d - rad) < 0.8) g[y][x] = 'W';
      else if (Math.abs(d - rad) < 1.5) g[y][x] = 'I';
    }
    // central core
    if (rad < 4) {
      g[7][7] = 'P'; g[8][8] = 'W';
    }
    // small droplets flying outward
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 + rad * 0.5;
      const dx = Math.round(C + Math.cos(a) * (rad + 1.5));
      const dy = Math.round(C + Math.sin(a) * (rad + 1.5));
      if (dx >= 0 && dx < W && dy >= 0 && dy < W && g[dy][dx] === '.') g[dy][dx] = 'W';
    }
    return g.map((r) => r.join(''));
  }
  const FX_SPLASH_1 = splashImpact(2);
  const FX_SPLASH_2 = splashImpact(5);
  const FX_SPLASH_3 = splashImpact(7);

  // holy — cross/bible: blazing gold cross flash
  const FX_HOLY_1 = [
    '............',
    '.....YY.....',
    '....Y99Y....',
    '....Y89Y....',
    '..YY999YY...',
    '.Y99889Y9Y..',
    '.YY99989YY..',
    '..YY999YY...',
    '....Y89Y....',
    '....Y99Y....',
    '.....YY.....',
    '............',
  ];
  const FX_HOLY_2 = [
    'P..........P',
    '.PP..YY..PP.',
    '..P.Y99Y.P..',
    '....Y89Y....',
    '.PYYY999YYP.',
    'PY998888899Y',
    'PY999988889Y',
    '.PYYY999YYP.',
    '....Y89Y....',
    '..P.Y99Y.P..',
    '.PP..YY..PP.',
    'P..........P',
  ];
  const FX_HOLY_3 = [
    '............',
    '............',
    '.....77.....',
    '....7997....',
    '....7997....',
    '..7799999..',
    '..7799999..',
    '....7997....',
    '....7997....',
    '.....77.....',
    '............',
    '............',
  ];

  // ── 2. MUZZLE / CAST EFFECTS ─────────────────────────────────
  // Spawn point flashes — 10×10, 2-3 frames each
  const FX_MUZZLE_ARCANE = [
    '...PP.....',
    '..PMPP....',
    '.PMqPMP...',
    'PMqqMqMP..',
    'PMqMPqMP..',
    '.PMqqqMP..',
    '..PMqMP...',
    '...PPP....',
    '..........',
    '..........',
  ];
  const FX_MUZZLE_FIRE = [
    '....P.....',
    '...fff....',
    '..fefef...',
    '.fedfdef..',
    'fedeeedef.',
    '.feddddef.',
    '..fddde...',
    '...add....',
    '....a.....',
    '..........',
  ];
  const FX_MUZZLE_HOLY = [
    '....Y.....',
    '...PYP....',
    '..YYPYY...',
    '.PYYYYP...',
    'YYY999YYY.',
    '.PYYYYP...',
    '..YYPYY...',
    '...PYP....',
    '....Y.....',
    '..........',
  ];
  // Runic floor cast circle — 16×16, 4 frames rotation
  function castCircle(angle) {
    const W = 16, C = 7.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const R1 = 6, R2 = 4;
    // outer ring
    for (let i = 0; i < 360; i += 8) {
      const a = i * Math.PI / 180;
      const x = Math.round(C + Math.cos(a) * R1);
      const y = Math.round(C + Math.sin(a) * R1);
      const dx = Math.round(C + Math.cos(a) * R2);
      const dy = Math.round(C + Math.sin(a) * R2);
      if (x >= 0 && x < W && y >= 0 && y < W) g[y][x] = 'M';
      if (dx >= 0 && dx < W && dy >= 0 && dy < W) g[dy][dx] = 'm';
    }
    // 4 runes equidistant, rotated by `angle`
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + angle;
      const x = Math.round(C + Math.cos(a) * 5);
      const y = Math.round(C + Math.sin(a) * 5);
      if (x >= 0 && x < W && y >= 0 && y < W) g[y][x] = 'q';
    }
    return g.map((r) => r.join(''));
  }
  const FX_CAST_CIRCLE_1 = castCircle(0);
  const FX_CAST_CIRCLE_2 = castCircle(Math.PI * 0.5);
  const FX_CAST_CIRCLE_3 = castCircle(Math.PI);
  const FX_CAST_CIRCLE_4 = castCircle(Math.PI * 1.5);

  // ── 3. STATUS ICONS — 8×8 small head-of-enemy icons ──────────
  const STATUS_BURN = [
    '...f....',
    '..fef...',
    '.fefef..',
    '.feddf..',
    '.feadf..',
    '..fdf...',
    '...a....',
    '........',
  ];
  const STATUS_FREEZE = [
    '...W....',
    'W..W..W.',
    '.WIWIW..',
    '..WWW...',
    'WIWWIWI.',
    '..WWW...',
    '.WIWIW..',
    'W..W..W.',
  ];
  const STATUS_POISON = [
    '...g....',
    '..gGg...',
    '.gGhGg..',
    'gGhPhGg.',
    '.gGhGg..',
    '..gGg...',
    '...G....',
    '...g....',
  ];
  const STATUS_SHOCK = [
    '..PP....',
    '..WP....',
    '..WP....',
    '.WPP....',
    'WPP.....',
    'WP..PP..',
    '....WP..',
    '....WW..',
  ];
  const STATUS_STUN = [
    '........',
    '..PPP...',
    '.P...P..',
    'PP...PP.',
    'P..P..P.',
    'PP...PP.',
    '.P...P..',
    '..PPP...',
  ];
  const STATUS_BLEED = [
    '...r....',
    '..rRr...',
    '.rRRRr..',
    'rRRPRRr.',
    '.rRRRr..',
    '..rrr...',
    '...r....',
    '..r.r...',
  ];
  const STATUS_SLOW = [
    '..WWW...',
    '.W...W..',
    'W..P..W.',
    'W.P.W.W.',
    'W..W..W.',
    'W..W..W.',
    '.W.W.W..',
    '..WWW...',
  ];
  const STATUS_SHIELD = [
    '.IIIIII.',
    '.IIIIIIi',
    '.IkIIkIi',
    '.IkIIkIi',
    '.IIIIIIi',
    '..IIIIi.',
    '...IIi..',
    '....i...',
  ];

  // ── 4. ENEMY DEATH EFFECTS — 16×16, 3 frames each ────────────
  // zombie melt — green goo splash
  const FX_DEATH_ZOMBIE_1 = [
    '................',
    '................',
    '......g..g......',
    '.....gGgGGg.....',
    '....gGhGGhGg....',
    '...gGhGRGGhGg...',
    '..gGGRGGGGGGgg..',
    '..gGGRGGRGGGGg..',
    '...gGGRGGGGGg...',
    '....gGGGGGGg....',
    '.....gggggg.....',
    '................',
    '................',
    '................',
    '................',
    '................',
  ];
  const FX_DEATH_ZOMBIE_2 = [
    '................',
    '................',
    '..g..........g..',
    '...g........g...',
    '......gGgg......',
    '.....gGRGg......',
    '....gGRRGGg.....',
    '....gGRGGGg.....',
    '.....gGGGg......',
    '....g.gg.gg.....',
    '...g..........g.',
    '.g.............g',
    '................',
    '................',
    '................',
    '................',
  ];
  const FX_DEATH_ZOMBIE_3 = [
    '................',
    '..g......g......',
    '............g...',
    '......g.........',
    '...........g....',
    '......g.........',
    '...gg...........',
    '...........gg...',
    '.....g..........',
    '.........g......',
    'g..........g....',
    '................',
    '....g...........',
    '................',
    '.........g......',
    '................',
  ];

  // skeleton crumble — bone shards scattering
  const FX_DEATH_SKELETON_1 = [
    '................',
    '......6666......',
    '.....677776.....',
    '....66.66.66....',
    '....6.6776.6....',
    '....66.66.66....',
    '.....677776.....',
    '......6.6.......',
    '......6.6.......',
    '......6.6.......',
    '......aaa.......',
    '................',
    '................',
    '................',
    '................',
    '................',
  ];
  const FX_DEATH_SKELETON_2 = [
    '...6..........6.',
    '......66...6....',
    '...666......6...',
    '..6.......66....',
    '.....6.66.......',
    '.....6.6........',
    '....66...........',
    '...6.6...6......',
    '....6...6.......',
    '...6.....6......',
    '..6........6....',
    '.6...........6..',
    '......6.........',
    '.6...........6..',
    '...6.......6....',
    '................',
  ];
  const FX_DEATH_SKELETON_3 = [
    '6.......6.......',
    '...6.........6..',
    '..............6.',
    '.....6..........',
    '..........6.....',
    '6...............',
    '..6........6....',
    '...........6....',
    '.6.........6....',
    '.....6..........',
    '............6...',
    '.6..............',
    '..........6.....',
    '....6...........',
    '...6.........6..',
    '6...............',
  ];

  // slime splat — green puddle
  const FX_DEATH_SLIME_1 = [
    '................',
    '................',
    '.....GGGG.......',
    '....GhhhhG......',
    '...GhhhhhG......',
    '..GGhhhhhGG.....',
    '..GhhhhhhhG.....',
    '...GGhhhGG......',
    '.....GGGG.......',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ];
  const FX_DEATH_SLIME_2 = [
    '................',
    '................',
    '................',
    '...GGGGGG.......',
    '..GhhhhhhG......',
    '.GhhhhhhhhG.....',
    '.GhhhhhhhhG.....',
    '..GhhhhhhG......',
    '...GGGGGG.......',
    '..g..g.g..g.....',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ];
  const FX_DEATH_SLIME_3 = [
    '................',
    '................',
    '..GGGGGGGGGG....',
    '.GhhhhhhhhhhG...',
    '.GhhhhhhhhhhG...',
    '..GGGGGGGGGG....',
    '.g..g.g.g..g.g..',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ];

  // bat puff — feathers + dust
  const FX_DEATH_BAT_1 = [
    '................',
    '................',
    '......222.......',
    '....2pmmm2......',
    '...2pmmRm2......',
    '....2pmm2.......',
    '....pp..pp......',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ];
  const FX_DEATH_BAT_2 = [
    '................',
    '..2..........2..',
    '....p.....p.....',
    '....p..2..p.....',
    '....pp.p.pp.....',
    '...p.....p......',
    '..p..........p..',
    '................',
    '..2.........2...',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ];
  const FX_DEATH_BAT_3 = [
    '2..........2....',
    '.....p..........',
    '............p...',
    '..p.............',
    '.........p......',
    '..2..........2..',
    '......p.........',
    '....2...........',
    '.............2..',
    '..p..........p..',
    '................',
    '..2..........2..',
    '................',
    '................',
    '................',
    '................',
  ];

  // generic red mist (default)
  const FX_DEATH_GENERIC_1 = [
    '................',
    '................',
    '......rrr.......',
    '....rRRRRr......',
    '...rRRRRRRr.....',
    '..rRRRRRRRRr....',
    '..rRRRRRRRRr....',
    '...rRRRRRRr.....',
    '....rRRRRr......',
    '......rrr.......',
    '................',
    '................',
    '................',
    '................',
    '................',
    '................',
  ];
  const FX_DEATH_GENERIC_2 = [
    '................',
    '....r.....r.....',
    '...r.......r....',
    '..r..rRRr..r....',
    '.r..rRRRRr..r...',
    '....rRRRRr......',
    '....rRRRRr......',
    '.r..rRRRRr..r...',
    '..r..rRRr..r....',
    '...r.......r....',
    '....r.....r.....',
    '................',
    '................',
    '................',
    '................',
    '................',
  ];
  const FX_DEATH_GENERIC_3 = [
    '...r......r.....',
    '.r..........r...',
    '................',
    'r...r......r....',
    '......rr........',
    '.....r..r..r....',
    '....r....r......',
    '.....r..r..r....',
    '......rr........',
    'r...r......r....',
    '................',
    '.r..........r...',
    '...r......r.....',
    '................',
    '................',
    '................',
  ];

  // ── 5. LEVEL UP — 24×24, 6 frames golden starburst ───────────
  function levelupFrame(r) {
    const W = 24, C = 11.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - C) ** 2 + (y - C) ** 2);
      if (d > r) continue;
      if (d > r - 1) g[y][x] = 'P';
      else if (d > r - 2.4) g[y][x] = 'Y';
      else if (d > r - 4) g[y][x] = 'f';
      else g[y][x] = 'e';
    }
    // 8 rays
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      for (let dr = r; dr < r + 4; dr++) {
        const x = Math.round(C + Math.cos(a) * dr);
        const y = Math.round(C + Math.sin(a) * dr);
        if (x >= 0 && x < W && y >= 0 && y < W) g[y][x] = dr < r + 2 ? 'Y' : 'f';
      }
    }
    return g.map((r) => r.join(''));
  }
  const FX_LEVELUP_FRAMES = [2, 4, 6, 8, 10, 12].map(levelupFrame);

  // ── 6. FOOTSTEP DUST — 8×4, 3 frames ─────────────────────────
  const FX_FOOTDUST_1 = [
    '........',
    '..7777..',
    '.776677.',
    '..7777..',
  ];
  const FX_FOOTDUST_2 = [
    '........',
    '...77...',
    '.7....7.',
    '........',
  ];
  const FX_FOOTDUST_3 = [
    '........',
    '...3....',
    '.3.....3',
    '........',
  ];

  // ── 7. CRITICAL FONT — extra glyphs ──────────────────────────
  // Added directly to FONT below
  const FONT_EXTRAS = {
    'C': ['.PPP', 'PP..', 'PP..', 'PP..', 'PP..', '.PPP'],
    'R': ['PPP.', 'PPPP', 'PPP.', 'PPP.', 'PPPP', 'PP.P'],
    'I': ['PPPP', '.PP.', '.PP.', '.PP.', '.PP.', 'PPPP'],
    'T': ['PPPP', '.PP.', '.PP.', '.PP.', '.PP.', '.PP.'],
    '!': ['.PP.', '.PP.', '.PP.', '.PP.', '....', '.PP.'],
  };

  // ── 8. HUD FRAMES ────────────────────────────────────────────
  // HP/XP bar frame — 64×8, single static (overlay full/empty bar at runtime)
  const HUD_BAR_FRAME_HP = [
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'a' + 'r'.repeat(62) + 'a',
    'a' + 'R'.repeat(62) + 'a',
    'a' + 'R'.repeat(62) + 'a',
    'a' + 'R'.repeat(62) + 'a',
    'a' + 'R'.repeat(62) + 'a',
    'a' + 'r'.repeat(62) + 'a',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  ];
  const HUD_BAR_FRAME_XP = [
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    'a' + 'n'.repeat(62) + 'a',
    'a' + 'N'.repeat(62) + 'a',
    'a' + 'q'.repeat(62) + 'a',
    'a' + 'q'.repeat(62) + 'a',
    'a' + 'N'.repeat(62) + 'a',
    'a' + 'n'.repeat(62) + 'a',
    'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  ];
  // Weapon slot — 22×22 inner-bevel parchment slot
  const HUD_WEAPON_SLOT = [
    '888888888888888888888.',
    '8aaaaaaaaaaaaaaaaaaa8.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8a777777777777777777a.',
    '8aaaaaaaaaaaaaaaaaaa8.',
    '888888888888888888888.',
  ];
  // Corner ornament — 8×8 decorative scroll
  const HUD_CORNER_ORNAMENT = [
    '8YY.....',
    'Y8Y.....',
    'YY8.....',
    'Y8Y9....',
    '8Y.9....',
    '...9....',
    '...9....',
    '...9....',
  ];

  // ── 9. BIOME TILES — 3 new biomes × 3 tiles ──────────────────
  // SWAMP — vile green/blue murk
  const TILE_SWAMP_GRASS = [
    'GgGhgGGggGgGhgGg',
    'gGgggGhgggGgggGh',
    'GgGhGggGgGhgGgGg',
    'gGgggGhgggGgggGh',
    'GgGhgGGggGgGhgGg',
    'gGgggGhgggGgggGh',
    'GgGhGggGgGhgGgGg',
    'gGgggGhgggGgggGh',
    'GgGhgGGggGgGhgGg',
    'gGgggGhgggGgggGh',
    'GgGhGggGgGhgGgGg',
    'gGgggGhgggGgggGh',
    'GgGhgGGggGgGhgGg',
    'gGgggGhgggGgggGh',
    'GgGhGggGgGhgGgGg',
    'gGgggGhgggGgggGh',
  ];
  const TILE_SWAMP_MUD = [
    'gbbgbgbbgbgbbgbg',
    'bgbggbgbggbgbggb',
    'ggbbgbggbbgbggbb',
    'bgbggbgbggbgbggb',
    'gbbgbgbbgbgbbgbg',
    'bgbggbgbggbgbggb',
    'ggbbgbggbbgbggbb',
    'bgbggbgbggbgbggb',
    'gbbgbgbbgbgbbgbg',
    'bgbggbgbggbgbggb',
    'ggbbgbggbbgbggbb',
    'bgbggbgbggbgbggb',
    'gbbgbgbbgbgbbgbg',
    'bgbggbgbggbgbggb',
    'ggbbgbggbbgbggbb',
    'bgbggbgbggbgbggb',
  ];
  const TILE_SWAMP_WATER = [
    'gkkgkgkkgkgkkgkg',
    'kgkgggkgggkgggkg',
    'kgggkgggkgggkggg',
    'gkgggkgggkgggkgg',
    'kggGkggkggGkggkg',
    'gkggkgggkggkggGk',
    'kgggkggGkgggkggg',
    'gkggGkggkggGkggk',
    'kggkggGkggGkggGk',
    'gkggkggkggkggkgg',
    'kggGkggkggGkggkg',
    'gkggkgggkggkggGk',
    'kgggkggGkgggkggg',
    'gkggGkggkggGkggk',
    'kggkggGkggGkggGk',
    'gkggkggkggkggkgg',
  ];

  // VOLCANO — molten lava + ash + cracked rock
  const TILE_VOLCANO_LAVA = [
    'edddeeedddeeeded',
    'deeddedeedeedede',
    'eeefeedededdeede',
    'deefeddedeeefdde',
    'edddeeedddeeeded',
    'deeddedeedeedede',
    'eeefeedededdeede',
    'deefeddedeeefdde',
    'edddeeedddeeeded',
    'deeddedeedeedede',
    'eeefeedededdeede',
    'deefeddedeeefdde',
    'edddeeedddeeeded',
    'deeddedeedeedede',
    'eeefeedededdeede',
    'deefeddedeeefdde',
  ];
  const TILE_VOLCANO_ASH = [
    '4434444334444443',
    '4344434443344443',
    '3444433444443344',
    '4434444334444443',
    '4344434443344443',
    '3444433444443344',
    '4434444334444443',
    '4344434443344443',
    '3444433444443344',
    '4434444334444443',
    '4344434443344443',
    '3444433444443344',
    '4434444334444443',
    '4344434443344443',
    '3444433444443344',
    '4434444334444443',
  ];
  const TILE_VOLCANO_ROCK = [
    '3334333343334333',
    '3344334434333443',
    '3333d33333d33333',
    '3433333334333343',
    '3334333334333443',
    '4344e33334d33433',
    '3344334434333443',
    '3334333334333443',
    '3433333334333343',
    '3334333334333443',
    '4344e33334d33433',
    '3344334434333443',
    '3334333343334333',
    '3344334434333443',
    '3333d33333d33333',
    '3433333334333343',
  ];

  // ICE — pale blue snow + cracked ice + frozen tile
  const TILE_ICE_FLOOR = [
    'WIWIWWIWWIWIWWIW',
    'IWWIWIWWIWWIWIWW',
    'WIWIWWIWWIWIWWIW',
    'IWWIWIWWIWWIWIWW',
    'WIWIWWIWWIWIWWIW',
    'IWWIWIWWIWWIWIWW',
    'WIWIWWIWWIWIWWIW',
    'IWWIWIWWIWWIWIWW',
    'WIWIWWIWWIWIWWIW',
    'IWWIWIWWIWWIWIWW',
    'WIWIWWIWWIWIWWIW',
    'IWWIWIWWIWWIWIWW',
    'WIWIWWIWWIWIWWIW',
    'IWWIWIWWIWWIWIWW',
    'WIWIWWIWWIWIWWIW',
    'IWWIWIWWIWWIWIWW',
  ];
  const TILE_ICE_CRACK = [
    'WIWIWWIWWIWIWWIW',
    'IWWIkkWWIWWIWIWW',
    'WIWk0WWIWIWIWWIW',
    'IWWkWIWWIWWIWIWW',
    'WIWkWWIWWIWIWWIW',
    'IWk0IWWIWWIWIWWk',
    'WIkIWWIWWIWIW0kW',
    'IWWIWIWWIWWk0IWW',
    'WIWIWWIWWIkIWWIW',
    'IWWIWIWWIWWIWIWW',
    'WIWIWWIWWIWIWWIW',
    'IWWIWIWWIWWIWIWW',
    'WIWIWWIWWIWIWWIW',
    'IWWIWIWWIWWIWIWW',
    'WIWIWWIWWIWIWWIW',
    'IWWIWIWWIWWIWIWW',
  ];
  const TILE_ICE_SNOW = [
    'PWPWPPWPPWPWPPWP',
    'WPPWPWPPWPPWPWPP',
    'PWPWPPWPPWPWPPWP',
    'WPPWPWPPWPPWPWPP',
    'PWPWPPWPPWPWPPWP',
    'WPPWPWPPWPPWPWPP',
    'PWPWPPWPPWPWPPWP',
    'WPPWPWPPWPPWPWPP',
    'PWPWPPWPPWPWPPWP',
    'WPPWPWPPWPPWPWPP',
    'PWPWPPWPPWPWPPWP',
    'WPPWPWPPWPPWPWPP',
    'PWPWPPWPPWPWPPWP',
    'WPPWPWPPWPPWPWPP',
    'PWPWPPWPPWPWPPWP',
    'WPPWPWPPWPPWPWPP',
  ];

  // ── 10. CURSORS / AIM INDICATORS ─────────────────────────────
  const CURSOR_AIM = [
    '....P....',
    '....P....',
    '....P....',
    '....1....',
    'PPP1.1PPP',
    '....1....',
    '....P....',
    '....P....',
    '....P....',
  ];
  // Target circle rotating, 16×16, 4 frames
  function targetCircle(angle) {
    const W = 16, C = 7.5, R = 6;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    // 4 brackets
    for (let i = 0; i < 4; i++) {
      const a0 = i * Math.PI / 2 + angle;
      for (let da = -0.3; da <= 0.3; da += 0.1) {
        const a = a0 + da;
        const x = Math.round(C + Math.cos(a) * R);
        const y = Math.round(C + Math.sin(a) * R);
        if (x >= 0 && x < W && y >= 0 && y < W) g[y][x] = 'P';
      }
    }
    // crosshair center
    g[7][7] = 'P'; g[8][7] = 'P';
    return g.map((r) => r.join(''));
  }
  const CURSOR_TARGET_1 = targetCircle(0);
  const CURSOR_TARGET_2 = targetCircle(Math.PI * 0.25);
  const CURSOR_TARGET_3 = targetCircle(Math.PI * 0.5);
  const CURSOR_TARGET_4 = targetCircle(Math.PI * 0.75);
  // Aim chevron — small arrow shape, 12×8, 2 frames pulse
  const AIM_INDICATOR_A = [
    '............',
    '....Y9......',
    '...YY99.....',
    '..YY9988....',
    '..YY9988....',
    '...YY99.....',
    '....Y9......',
    '............',
  ];
  const AIM_INDICATOR_B = [
    '............',
    '....P9......',
    '...PY99.....',
    '..PYY988....',
    '..PYY988....',
    '...PY99.....',
    '....P9......',
    '............',
  ];

  // ============================================================
  // TITLE ILLUSTRATION — 240×135 panorama (16:9)
  // ============================================================
  // Layered procedural scene: night sky with moon + stars · distant castle
  // silhouette · dead tree · tombstones · foreground hero looking up.
  function buildTitleScene() {
    const W = 240, H = 135;
    const g = Array.from({ length: H }, () => Array(W).fill('.'));

    function put(x, y, c) {
      if (x < 0 || x >= W || y < 0 || y >= H) return;
      g[y][x] = c;
    }
    function fillRect(x0, y0, w, h, c) {
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) put(x, y, c);
    }
    function line(x0, y0, x1, y1, c) {
      x0 = Math.round(x0); y0 = Math.round(y0);
      x1 = Math.round(x1); y1 = Math.round(y1);
      const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
      const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
      let err = dx - dy, x = x0, y = y0;
      let safety = 1000;
      while (safety-- > 0) {
        put(x, y, c);
        if (x === x1 && y === y1) break;
        const e2 = 2 * err;
        if (e2 > -dy) { err -= dy; x += sx; }
        if (e2 < dx)  { err += dx; y += sy; }
      }
    }
    function disc(cx, cy, r, c) {
      for (let y = cy - r; y <= cy + r; y++)
        for (let x = cx - r; x <= cx + r; x++)
          if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) put(x, y, c);
    }

    // ── Sky gradient ────────────────────────────────────────
    for (let y = 0; y < 90; y++) {
      const t = y / 90;
      let c;
      if (t < 0.25) c = '0';      // pitch
      else if (t < 0.55) c = '1'; // deep night
      else if (t < 0.8)  c = '2'; // shadow purple
      else c = '3';               // stone shadow (horizon haze)
      fillRect(0, y, W, 1, c);
    }
    // Ground gradient
    for (let y = 90; y < H; y++) {
      const t = (y - 90) / (H - 90);
      let c;
      if (t < 0.3) c = '1';
      else if (t < 0.6) c = '2';
      else c = '3';
      fillRect(0, y, W, 1, c);
    }

    // ── Stars (pseudo-random but stable) ──────────────────────
    for (let i = 0; i < 70; i++) {
      const x = (i * 73) % W;
      const y = (i * 41) % 70;
      const c = i % 5 === 0 ? 'P' : i % 3 === 0 ? '7' : '6';
      put(x, y, c);
      if (i % 7 === 0) {
        put(x + 1, y, '6'); put(x - 1, y, '6');
        put(x, y + 1, '6'); put(x, y - 1, '6');
      }
    }

    // ── Crescent moon (top right) ─────────────────────────────
    const mx = 195, my = 25, mr = 14;
    disc(mx, my, mr, '7');
    disc(mx - 5, my - 3, mr - 2, '1'); // bite out left side
    // Soft glow
    for (let i = 0; i < 360; i += 6) {
      const a = i * Math.PI / 180;
      const r = mr + 2;
      put(Math.round(mx + Math.cos(a) * r), Math.round(my + Math.sin(a) * r), '2');
    }

    // ── Distant mountain ridge ────────────────────────────────
    for (let x = 0; x < W; x++) {
      const h = 12 + Math.sin(x * 0.04) * 6 + Math.cos(x * 0.11) * 3;
      for (let y = 90 - Math.round(h); y < 90; y++) put(x, y, '2');
    }

    // ── Castle silhouette (center-back) ───────────────────────
    // Main keep
    fillRect(95, 50, 50, 40, '1');
    // Battlements
    for (let i = 0; i < 6; i++) {
      fillRect(95 + i * 9, 47, 5, 3, '1');
    }
    // Towers
    fillRect(85, 40, 12, 50, '1');
    fillRect(143, 40, 12, 50, '1');
    fillRect(110, 30, 18, 60, '1');  // central tall tower
    // Tower battlements
    for (let i = 0; i < 3; i++) fillRect(85 + i * 4, 37, 3, 3, '1');
    for (let i = 0; i < 3; i++) fillRect(143 + i * 4, 37, 3, 3, '1');
    for (let i = 0; i < 4; i++) fillRect(110 + i * 4, 27, 3, 3, '1');
    // Spires (triangles)
    for (let y = 0; y < 8; y++) {
      const w = 8 - y;
      fillRect(115 - Math.floor(w / 2), 19 + y, w, 1, '1');
    }
    for (let y = 0; y < 6; y++) {
      const w = 6 - y;
      fillRect(89 - Math.floor(w / 2), 31 + y, w, 1, '1');
    }
    for (let y = 0; y < 6; y++) {
      const w = 6 - y;
      fillRect(147 - Math.floor(w / 2), 31 + y, w, 1, '1');
    }
    // Lit windows in central tower (warm gold)
    fillRect(116, 45, 2, 3, '9');
    fillRect(120, 55, 2, 3, '9');
    fillRect(116, 65, 2, 3, '9');
    // Lit windows in keep
    fillRect(105, 70, 2, 2, 'e');
    fillRect(133, 70, 2, 2, 'e');
    // Castle gate (arch)
    fillRect(117, 78, 6, 10, '0');
    put(118, 77, '0'); put(121, 77, '0');
    put(119, 76, '0'); put(120, 76, '0');

    // ── Dead tree (left foreground) ───────────────────────────
    // Trunk
    fillRect(25, 65, 4, 35, '0');
    // Branches
    for (let i = 0; i < 12; i++) {
      const yy = 70 + i * 2;
      const arm = Math.sin(i * 1.3) * 12;
      line(27, yy, Math.round(27 + arm), yy - 8 - Math.abs(arm) / 3, '0');
    }
    // Crow on tree
    put(15, 60, '0'); put(16, 60, '0'); put(14, 59, '0');
    put(15, 59, '0'); put(16, 61, '0'); put(17, 59, '0');

    // ── Tombstones (foreground row) ───────────────────────────
    const tombs = [50, 75, 165, 195, 215];
    for (const tx of tombs) {
      fillRect(tx, 105, 10, 18, '4');
      fillRect(tx + 1, 102, 8, 3, '4');
      fillRect(tx + 4, 100, 2, 2, '4');
      // shadow
      fillRect(tx - 2, 122, 14, 2, '0');
      // engraving
      fillRect(tx + 4, 109, 2, 1, '3');
      fillRect(tx + 3, 112, 4, 1, '3');
    }

    // ── Ground tufts + cobblestones ───────────────────────────
    for (let i = 0; i < 35; i++) {
      const x = (i * 23 + 5) % W;
      const y = 118 + (i % 4) * 3;
      put(x, y, 'g'); put(x + 1, y, 'g'); put(x, y - 1, 'h');
    }
    // path stones
    for (let i = 0; i < 12; i++) {
      const x = 100 + i * 4;
      put(x, 130, '4'); put(x + 1, 130, '4'); put(x, 131, '5');
    }

    // ── Hero silhouette (center foreground) ───────────────────
    // Knight back-view, looking up at castle
    const hx = 122, hy = 100;
    // helm/head
    fillRect(hx - 3, hy, 6, 5, '3');
    fillRect(hx - 2, hy + 1, 4, 3, '4');
    // cape (flowing back from shoulders)
    fillRect(hx - 6, hy + 5, 12, 15, '2');
    fillRect(hx - 7, hy + 7, 14, 12, '2');
    fillRect(hx - 8, hy + 9, 16, 10, '2');
    // body/armor
    fillRect(hx - 4, hy + 5, 8, 8, 'i');
    fillRect(hx - 3, hy + 6, 6, 6, 'I');
    // sword planted in ground (small triangle)
    fillRect(hx + 6, hy + 8, 1, 12, '6'); // blade
    fillRect(hx + 5, hy + 7, 3, 1, '6');
    fillRect(hx + 5, hy + 20, 3, 1, 'Y'); // pommel
    fillRect(hx + 4, hy + 19, 5, 1, 'Y');
    // legs
    fillRect(hx - 3, hy + 13, 2, 6, '3');
    fillRect(hx + 1, hy + 13, 2, 6, '3');

    // ── Bats (silhouettes) ────────────────────────────────────
    function bat(x, y) {
      put(x, y, '0'); put(x + 1, y, '0'); put(x + 2, y - 1, '0');
      put(x - 1, y - 1, '0'); put(x - 2, y, '0'); put(x + 3, y, '0');
    }
    bat(60, 35); bat(155, 22); bat(175, 50); bat(210, 60);

    // ── Subtle fog band over horizon ──────────────────────────
    for (let x = 0; x < W; x++) {
      if (Math.random() < 0.4) continue; // sparse
      const y = 88 + Math.floor(Math.sin(x * 0.1) * 2);
      if (g[y][x] === '2' || g[y][x] === '1') g[y][x] = '3';
    }

    return g.map((r) => r.join(''));
  }
  const TITLE_SCENE = buildTitleScene();

  // ============================================================
  // WEAPON ACTION FX — how each weapon FEELS in motion
  // ============================================================
  // These play during cast/swing (not on hit), e.g. a horizontal arc that
  // travels with a sword swing or a fanning multishot pattern.

  // ── Sword Swing — 24×24, 6 frames, full overhead-to-side arc ──
  function swingArc(t) {
    const W = 24, C = 11.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    // arc from -pi/2 + t to -pi/2 + t + 1.6
    const radius = 9;
    const start = -Math.PI / 2 + t;
    for (let a = start; a < start + 1.6; a += 0.05) {
      const trailFade = (a - start) / 1.6; // 0 at head, 1 at tail
      const r = radius - trailFade * 1.5;
      const x = Math.round(C + Math.cos(a) * r);
      const y = Math.round(C + Math.sin(a) * r);
      if (x < 0 || x >= W || y < 0 || y >= W) continue;
      g[y][x] = trailFade < 0.2 ? 'P' : trailFade < 0.5 ? 'W' : 'I';
      // outer glow
      const x2 = Math.round(C + Math.cos(a) * (r + 1));
      const y2 = Math.round(C + Math.sin(a) * (r + 1));
      if (x2 >= 0 && x2 < W && y2 >= 0 && y2 < W && g[y2][x2] === '.') g[y2][x2] = 'W';
    }
    return g.map((r) => r.join(''));
  }
  const FX_SWING_1 = swingArc(0);
  const FX_SWING_2 = swingArc(0.5);
  const FX_SWING_3 = swingArc(1.0);
  const FX_SWING_4 = swingArc(1.5);
  const FX_SWING_5 = swingArc(2.0);
  const FX_SWING_6 = swingArc(2.5);

  // ── Boomerang Arc — 24×24, 8 frames closed-loop trail ──
  function boomerangTrail(phase) {
    const W = 24, C = 11.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const r = 8;
    for (let i = 0; i < 16; i++) {
      const a = phase + i * 0.4;
      const fade = i / 16;
      const x = Math.round(C + Math.cos(a) * r);
      const y = Math.round(C + Math.sin(a) * r * 0.6);
      if (x < 0 || x >= W || y < 0 || y >= W) continue;
      g[y][x] = fade < 0.25 ? 'Y' : fade < 0.5 ? '9' : fade < 0.75 ? '8' : 'a';
    }
    return g.map((r) => r.join(''));
  }
  const FX_BOOMERANG_1 = boomerangTrail(0);
  const FX_BOOMERANG_2 = boomerangTrail(0.8);
  const FX_BOOMERANG_3 = boomerangTrail(1.6);
  const FX_BOOMERANG_4 = boomerangTrail(2.4);

  // ── Pierce Beam — 32×8 horizontal piercing beam, 3 frames ──
  const FX_BEAM_1 = [
    '................................',
    '...PPPPPPPPPPPPPPPPPPPPPPPPPPP..',
    '..PWWWWWWWWWWWWWWWWWWWWWWWWWWWP.',
    'PIWWWPPPPPPPPPPPPPPPPPPPPPPPWWIP',
    'PIWWWPPPPPPPPPPPPPPPPPPPPPPPWWIP',
    '..PWWWWWWWWWWWWWWWWWWWWWWWWWWWP.',
    '...PPPPPPPPPPPPPPPPPPPPPPPPPPP..',
    '................................',
  ];
  const FX_BEAM_2 = [
    '................................',
    '....WWWWWWWWWWWWWWWWWWWWWWWWWWW.',
    '...WIIIIIIIIIIIIIIIIIIIIIIIIIIIW',
    '..WIPPPPPPPPPPPPPPPPPPPPPPPPPPIW',
    '..WIPPPPPPPPPPPPPPPPPPPPPPPPPPIW',
    '...WIIIIIIIIIIIIIIIIIIIIIIIIIIIW',
    '....WWWWWWWWWWWWWWWWWWWWWWWWWWW.',
    '................................',
  ];
  const FX_BEAM_3 = [
    '................................',
    '.....IIIIIIIIIIIIIIIIIIIIIIIII..',
    '....IWWWWWWWWWWWWWWWWWWWWWWWWWI.',
    '...IWPPPPPPPPPPPPPPPPPPPPPPPPWI.',
    '...IWPPPPPPPPPPPPPPPPPPPPPPPPWI.',
    '....IWWWWWWWWWWWWWWWWWWWWWWWWWI.',
    '.....IIIIIIIIIIIIIIIIIIIIIIIII..',
    '................................',
  ];

  // ── Chain Lightning — 32×16, 4 frames zigzag between targets ──
  function chainLightning(seed) {
    const W = 32, H = 16;
    const g = Array.from({ length: H }, () => Array(W).fill('.'));
    let x = 2, y = 8;
    for (let i = 0; i < 28; i++) {
      g[y][x] = 'P';
      if (y - 1 >= 0) g[y - 1][x] = 'I';
      if (y + 1 < H) g[y + 1][x] = 'I';
      x += 1;
      // jagged step
      const step = Math.sin((i + seed) * 1.7) > 0 ? -2 : 2;
      y = Math.max(2, Math.min(H - 3, y + step));
    }
    return g.map((r) => r.join(''));
  }
  const FX_CHAIN_1 = chainLightning(0);
  const FX_CHAIN_2 = chainLightning(1.3);
  const FX_CHAIN_3 = chainLightning(2.6);
  const FX_CHAIN_4 = chainLightning(3.9);

  // ── Vortex / Black Hole — 16×16, 4 frames spiral inwards ──
  function vortex(phase) {
    const W = 16, C = 7.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    // dark core
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - C) ** 2 + (y - C) ** 2);
      if (d < 2) g[y][x] = '0';
      else if (d < 3) g[y][x] = 'p';
    }
    // 3 spiral arms
    for (let arm = 0; arm < 3; arm++) {
      for (let t = 0; t < Math.PI * 2; t += 0.15) {
        const r = t * 1.0 + 2;
        if (r > 7) break;
        const a = t * 2 + phase + arm * (Math.PI * 2 / 3);
        const x = Math.round(C + Math.cos(a) * r);
        const y = Math.round(C + Math.sin(a) * r);
        if (x < 0 || x >= W || y < 0 || y >= W) continue;
        if (g[y][x] === '.') g[y][x] = r < 4 ? 'M' : r < 6 ? 'm' : 'p';
      }
    }
    return g.map((r) => r.join(''));
  }
  const FX_VORTEX_1 = vortex(0);
  const FX_VORTEX_2 = vortex(Math.PI / 2);
  const FX_VORTEX_3 = vortex(Math.PI);
  const FX_VORTEX_4 = vortex(Math.PI * 1.5);

  // ── Summon Circle — 16×16, 4 frames pentagram glyph appearing ──
  function summonCircle(intensity) {
    const W = 16, C = 7.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const r = 6;
    // outer ring
    for (let a = 0; a < Math.PI * 2; a += 0.1) {
      const x = Math.round(C + Math.cos(a) * r);
      const y = Math.round(C + Math.sin(a) * r);
      if (x >= 0 && x < W && y >= 0 && y < W) g[y][x] = intensity > 1 ? 'M' : 'p';
    }
    // inner ring
    if (intensity > 1) {
      for (let a = 0; a < Math.PI * 2; a += 0.15) {
        const x = Math.round(C + Math.cos(a) * (r - 2));
        const y = Math.round(C + Math.sin(a) * (r - 2));
        if (x >= 0 && x < W && y >= 0 && y < W && g[y][x] === '.') g[y][x] = 'm';
      }
    }
    // pentagram lines
    if (intensity > 2) {
      const pts = [];
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
        pts.push([C + Math.cos(a) * (r - 1), C + Math.sin(a) * (r - 1)]);
      }
      function line(x0, y0, x1, y1, c) {
        x0 = Math.round(x0); y0 = Math.round(y0);
        x1 = Math.round(x1); y1 = Math.round(y1);
        const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
        let err = dx - dy, x = x0, y = y0, safety = 200;
        while (safety-- > 0) {
          if (x >= 0 && x < W && y >= 0 && y < W && g[y][x] === '.') g[y][x] = c;
          if (x === x1 && y === y1) break;
          const e2 = 2 * err;
          if (e2 > -dy) { err -= dy; x += sx; }
          if (e2 < dx)  { err += dx; y += sy; }
        }
      }
      for (let i = 0; i < 5; i++) {
        const [a, b] = pts[i];
        const [c, d] = pts[(i + 2) % 5];
        line(a, b, c, d, 'M');
      }
    }
    // center glyph
    if (intensity > 2) {
      g[7][7] = 'q'; g[8][8] = 'q'; g[7][8] = 'P'; g[8][7] = 'P';
    }
    return g.map((r) => r.join(''));
  }
  const FX_SUMMON_1 = summonCircle(1);
  const FX_SUMMON_2 = summonCircle(2);
  const FX_SUMMON_3 = summonCircle(3);
  const FX_SUMMON_4 = summonCircle(3);

  // ── Multishot Fan — 16×16, single frame 3-arrow burst from origin ──
  const FX_FAN_BURST = [
    '................',
    '............WI..',
    '...........WIWI.',
    '..........WIWIW.',
    '.........WIWIW..',
    '....WIWIWWIWIW..',
    '...WIWIWIWIWIW..',
    '..WIWIWIWIWIWIW.',
    '..WIWIWIWIWIWIW.',
    '...WIWIWIWIWIW..',
    '....WIWIWWIWIW..',
    '.........WIWIW..',
    '..........WIWIW.',
    '...........WIWI.',
    '............WI..',
    '................',
  ];

  // ── Ground Spike — earth eruption, 12×16, 4 frames rising spikes ──
  function groundSpike(phase) {
    const W = 12, H = 16;
    const g = Array.from({ length: H }, () => Array(W).fill('.'));
    const heights = phase === 0 ? [0,1,2,3,4,5,4,3,2,1,0] :
                    phase === 1 ? [0,2,4,6,8,9,8,6,4,2,0] :
                    phase === 2 ? [0,3,6,8,10,11,10,8,6,3,0] :
                                  [0,2,4,5,6,7,6,5,4,2,0];
    for (let x = 0; x < 11; x++) {
      const h = heights[x];
      for (let y = H - 1; y >= H - h; y--) {
        const depth = H - 1 - y;
        let c = 'b';
        if (depth >= h - 1) c = '7'; // tip is bone-bright
        else if (depth >= h - 2) c = 'c';
        else c = depth % 2 ? 'b' : 'a';
        g[y][x + 1] = c;
      }
    }
    // dust at base
    if (phase < 3) {
      for (let x = 0; x < W; x++) if (Math.random() < 0.4) g[H - 1][x] = '4';
    }
    return g.map((r) => r.join(''));
  }
  const FX_GROUND_SPIKE_1 = groundSpike(0);
  const FX_GROUND_SPIKE_2 = groundSpike(1);
  const FX_GROUND_SPIKE_3 = groundSpike(2);
  const FX_GROUND_SPIKE_4 = groundSpike(3);

  // ── Whirlwind — 16×16, 4 frames rotating disc ──
  function whirlwind(rot) {
    const W = 16, C = 7.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let a = 0; a < Math.PI * 2; a += 0.18) {
      for (let r = 3; r < 7; r += 0.7) {
        const x = Math.round(C + Math.cos(a + rot) * r);
        const y = Math.round(C + Math.sin(a + rot) * r);
        if (x < 0 || x >= W || y < 0 || y >= W) continue;
        g[y][x] = r < 4 ? 'P' : r < 5.5 ? 'W' : 'I';
      }
    }
    g[7][7] = 'P'; g[8][8] = 'P';
    return g.map((r) => r.join(''));
  }
  const FX_WHIRLWIND_1 = whirlwind(0);
  const FX_WHIRLWIND_2 = whirlwind(Math.PI / 4);
  const FX_WHIRLWIND_3 = whirlwind(Math.PI / 2);
  const FX_WHIRLWIND_4 = whirlwind(Math.PI * 3 / 4);

  // ============================================================
  // MORE LEGENDARY WEAPONS — 5 new with unique actions
  // ============================================================

  // Spectral Bow — ghostly translucent bow, 14×8, 2 frames pulse
  const LEG_SPECTRAL_BOW_A = [
    '..............',
    '....WWPPWW....',
    '...WIIIIIIW...',
    '..WI......IW..',
    '...WI....IW...',
    '....WIIIIW....',
    '.....WIIW.....',
    '..............',
  ];
  const LEG_SPECTRAL_BOW_B = [
    '..............',
    '....WWPPWW....',
    '...WIPPPPIW...',
    '..WIPP..PPIW..',
    '...WIPP.PIW...',
    '....WIIPIW....',
    '.....WIIW.....',
    '..............',
  ];

  // Tempest Hammer — golden hammer wreathed in lightning, 12×16, 4 frames
  function tempestHammer(spark) {
    const g = Array.from({ length: 16 }, () => Array(12).fill('.'));
    // head
    const head = [
      '...YYYY....',
      '..Y9999Y...',
      '..Y9889Y...',
      '..Y9889Y...',
      '..Y9999Y...',
      '...YYYY....',
    ];
    for (let y = 0; y < head.length; y++) {
      for (let x = 0; x < head[y].length; x++) {
        if (head[y][x] !== '.') g[1 + y][x] = head[y][x];
      }
    }
    // shaft
    for (let y = 7; y < 13; y++) { g[y][5] = 'b'; g[y][6] = 'c'; }
    // pommel
    g[14][5] = 'Y'; g[14][6] = 'Y'; g[15][5] = '9'; g[15][6] = '9';
    // lightning sparks around head
    if (spark === 1) { g[1][1] = 'P'; g[3][10] = 'P'; g[5][0] = 'I'; }
    else if (spark === 2) { g[0][6] = 'P'; g[4][1] = 'I'; g[2][11] = 'W'; }
    else if (spark === 3) { g[2][0] = 'W'; g[5][11] = 'P'; g[0][5] = 'I'; }
    return g.map((r) => r.join(''));
  }
  const LEG_TEMPEST_1 = tempestHammer(0);
  const LEG_TEMPEST_2 = tempestHammer(1);
  const LEG_TEMPEST_3 = tempestHammer(2);
  const LEG_TEMPEST_4 = tempestHammer(3);

  // Necrotic Skull — purple homing skull projectile, 10×10, 4 frames
  function necroSkull(eye) {
    const E = eye ? 'P' : 'q';
    return [
      '..pppppp..',
      '.pMMMMMMp.',
      '.pM6666Mp.',
      '.pM6776Mp.',
      'pMM6' + E + E + '6MMp',  // glowing eyes
      'pMM6776MMp',
      '.pM666666p',
      '.pM6.6.6Mp',
      '..ppmmmpp.',
      '...mmmm...',
    ];
  }
  const LEG_NECRO_SKULL_A = necroSkull(false);
  const LEG_NECRO_SKULL_B = necroSkull(true);

  // Black Hole — gravity orb, 12×12, 4 frames (uses vortex generator)
  function blackHoleFrame(phase) {
    const W = 12, C = 5.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - C) ** 2 + (y - C) ** 2);
      if (d < 1.5) g[y][x] = '0';
      else if (d < 2.5) g[y][x] = 'p';
    }
    for (let i = 0; i < 16; i++) {
      const a = phase + i * 0.4;
      const r = 2.5 + (i % 5) * 0.6;
      const x = Math.round(C + Math.cos(a) * r);
      const y = Math.round(C + Math.sin(a) * r);
      if (x < 0 || x >= W || y < 0 || y >= W) continue;
      if (g[y][x] === '.') g[y][x] = r < 3.5 ? 'M' : r < 4.5 ? 'm' : 'p';
    }
    return g.map((r) => r.join(''));
  }
  const LEG_BLACK_HOLE_1 = blackHoleFrame(0);
  const LEG_BLACK_HOLE_2 = blackHoleFrame(Math.PI / 2);
  const LEG_BLACK_HOLE_3 = blackHoleFrame(Math.PI);
  const LEG_BLACK_HOLE_4 = blackHoleFrame(Math.PI * 1.5);

  // Soul Lantern — orbiting golden lantern that drains souls, 10×12, 2 frames
  const LEG_SOUL_LANTERN_A = [
    '....YY....',
    '...Y88Y...',
    '..888888..',
    '.8Y8888Y8.',
    '.8YfeefY8.', // flame core
    '.8YfPPfY8.',
    '.8YfeefY8.',
    '.8Y8888Y8.',
    '..8YYYY8..',
    '..a8889a..',
    '...8889...',
    '....88....',
  ];
  const LEG_SOUL_LANTERN_B = [
    '....YY....',
    '...Y88Y...',
    '..888888..',
    '.8YPPPPY8.',
    '.8YfPPfY8.', // brighter
    '.8YPffPY8.',
    '.8YfPPfY8.',
    '.8YPPPPY8.',
    '..8YYYY8..',
    '..a8889a..',
    '...8889...',
    '....88....',
  ];

  // ── Soul wisp — Soul Lantern's drain projectile, 6×8, 2 frames ──
  const FX_SOUL_WISP_A = [
    '..fY..',
    '.YPYf.',
    'YPPPYY',
    'YPPPfY',
    '.YYYf.',
    '..YY..',
    '...e..',
    '....a.',
  ];
  const FX_SOUL_WISP_B = [
    '..PY..',
    '.YPPY.',
    'PPPPYY',
    'YPPPPY',
    '.YYYP.',
    '..fY..',
    '..e...',
    '.a....',
  ];

  // Legendary weapon icons (gold parchment frame)
  function legendaryIconBaseTwo() {
    return [
      '........................',
      '........................',
      '.......999999999........',
      '.....99YYYYYYYY99.......',
      '....9YY77777777YY9......',
      '...9Y77777777777Y9......',
      '...9Y77777777777Y9......',
      '..9Y777777777777Y9......',
      '..9Y777777777777Y9......',
      '..9Y777777777777Y9......',
      '..9Y777777777777Y9......',
      '..9Y777777777777Y9......',
      '..9Y777777777777Y9......',
      '..9Y777777777777Y9......',
      '..9Y777777777777Y9......',
      '..9Y777777777777Y9......',
      '..9Y777777777777Y9......',
      '..9Y777777777777Y9......',
      '...9Y77777777777Y9......',
      '...9Y77777777777Y9......',
      '....9YY77777777YY9......',
      '.....99YYYYYYYY99.......',
      '.......999999999........',
      '........................',
    ];
  }
  function legPaint2(overlay, ox, oy) {
    const base = legendaryIconBaseTwo();
    const out = base.map((r) => r.split(''));
    for (let y = 0; y < overlay.length; y++) {
      for (let x = 0; x < overlay[y].length; x++) {
        const c = overlay[y][x];
        if (c !== '.' && c !== ' ') out[oy + y][ox + x] = c;
      }
    }
    return out.map((r) => r.join(''));
  }

  const ICON_LEG_SPECTRAL_BOW = legPaint2([
    '..............',
    '....WWPPWW....',
    '...WIIIIIIW...',
    '..WI......IW..',
    '...WI....IW...',
    '....WIIIIW....',
    '.....WIIW.....',
    '..............',
  ], 5, 8);

  const ICON_LEG_TEMPEST = legPaint2([
    '..PYYYYP..',
    '.PY9999YP.',
    '.PY9889YP.',
    '.PY9999YP.',
    '..PYYYYP..',
    '...Pbb....',
    '....b.....',
    '....b.....',
    '....b.....',
    '....cc....',
  ], 7, 7);

  const ICON_LEG_NECRO = legPaint2([
    'pppppppppp',
    'pMMMMMMMMp',
    'pM6666666p',
    'pM6PP6PP6p',
    'pM666666Mp',
    'pM6766776p',
    'pMM6666MMp',
    '.pmmmmmmp.',
    '..pmmmmp..',
    '..ppmmpp..',
  ], 7, 7);

  const ICON_LEG_BLACKHOLE = legPaint2([
    '.MMMMMMMM.',
    'MMmppmpmMM',
    'MmpppppMMM',
    'Mppp00ppMM',
    'Mppp00ppMM',
    'MMpppppmMM',
    'MMmppmpMMM',
    '.MMMMMMMM.',
  ], 7, 8);

  const ICON_LEG_SOUL_LANTERN = legPaint2([
    '....YY....',
    '...Y88Y...',
    '..888888..',
    '.8YfeefY8.',
    '.8YfPPfY8.',
    '.8YfeefY8.',
    '..8YYYY8..',
    '..a8889a..',
    '....88....',
  ], 7, 8);

  // ============================================================
  // BITMAP FONT — 4×6, digits + a few symbols, parchment-cream
  // ============================================================
  // Used for damage numbers / HUD counters at integer scales.
  const FONT = {
    '0': ['.PP.', 'PPPP', 'PPPP', 'PPPP', 'PPPP', '.PP.'],
    '1': ['.PP.', 'PPP.', '.PP.', '.PP.', '.PP.', 'PPPP'],
    '2': ['PPP.', '.PPP', '..PP', '.PP.', 'PPP.', 'PPPP'],
    '3': ['PPP.', '.PPP', '.PPP', '..PP', 'PPPP', 'PPP.'],
    '4': ['P..P', 'P..P', 'PPPP', '..PP', '..PP', '..PP'],
    '5': ['PPPP', 'PP..', 'PPP.', '..PP', 'PPPP', 'PPP.'],
    '6': ['.PPP', 'PP..', 'PPPP', 'PP.P', 'PPPP', '.PPP'],
    '7': ['PPPP', '..PP', '.PP.', '.PP.', 'PP..', 'PP..'],
    '8': ['.PP.', 'PPPP', '.PP.', 'PPPP', 'PPPP', '.PP.'],
    '9': ['PPP.', 'PPPP', 'PPPP', '.PPP', '..PP', 'PPP.'],
    '+': ['....', '.PP.', 'PPPP', 'PPPP', '.PP.', '....'],
    '-': ['....', '....', 'PPPP', 'PPPP', '....', '....'],
    'x': ['....', 'P..P', '.PP.', '.PP.', 'P..P', '....'],
  };

  // ============================================================
  // ASSEMBLE the sprite table consumed by the renderer/atlas
  // ============================================================
  window.SPRITES = {
    // Player characters (anim arrays) — each is a 4-frame walk cycle.
    knight_walk:   [knightFrame(0),   knightFrame(-1),   knightFrame(0),   knightFrame(1)],
    warrior_walk:  [warriorFrame(0),  warriorFrame(-1),  warriorFrame(0),  warriorFrame(1)],
    mage_walk:     [mageFrame(0),     mageFrame(-1),     mageFrame(0),     mageFrame(1)],
    huntress_walk: [huntressFrame(0), huntressFrame(-1), huntressFrame(0), huntressFrame(1)],
    cleric_walk:   [clericFrame(0),   clericFrame(-1),   clericFrame(0),   clericFrame(1)],
    // alias kept so existing demo code & game wiring still resolves
    player_walk:   [knightFrame(0),   knightFrame(-1),   knightFrame(0),   knightFrame(1)],
    walker_walk: [WALKER_A, WALKER_B2],
    runner_walk: [RUNNER_F1, RUNNER_F2, RUNNER_F3, RUNNER_F4],
    brute_walk: [BRUTE_A, BRUTE_B],
    elite_walk: [ELITE_A, ELITE_B],
    bat_fly: [BAT_F1, BAT_F2, BAT_F3, BAT_F4],
    spider_walk: [SPIDER_F1, SPIDER_F2, SPIDER_F3, SPIDER_F4],
    slime_idle: [SLIME_F1, SLIME_F2, SLIME_F3, SLIME_F4],
    chimera_walk: [CHIMERA_A, CHIMERA_B],
    // Biome enemies
    wolf_run: [WOLF_F1, WOLF_F2, WOLF_F3, WOLF_F4],
    goblin_walk: [GOBLIN_A, GOBLIN_B],
    hornet_fly: [HORNET_F1, HORNET_F2, HORNET_F3, HORNET_F4],
    frog_idle: [FROG_A, FROG_B],
    bog_zombie_walk: [BOG_ZOMBIE_A, BOG_ZOMBIE_B],
    wisp_float: [WISP_F1, WISP_F2, WISP_F3, WISP_F4],
    imp_walk: [IMP_A, IMP_B],
    lava_slug_idle: [LAVA_SLUG_A, LAVA_SLUG_B],
    fire_bat_fly: [FIRE_BAT_1, FIRE_BAT_2, FIRE_BAT_3, FIRE_BAT_4],
    frost_wolf_run: [FROST_WOLF_F1, FROST_WOLF_F2, FROST_WOLF_F3, FROST_WOLF_F4],
    yeti_walk: [YETI_A, YETI_B],
    ice_wraith_float: [ICE_WRAITH_A, ICE_WRAITH_B],
    // ── new monsters — ASCII fallback aliases. The enemies_vs.js loader
    // overwrites these with PixelLab art when ready (async). Reusing nearby
    // sprite frames keeps the renderer alive during the brief load window.
    giant_spider_walk:      [SPIDER_F1, SPIDER_F2, SPIDER_F3, SPIDER_F4],
    carrion_crow_fly:       [BAT_F1, BAT_F2, BAT_F3, BAT_F4],
    bog_leech_walk:         [SLIME_F1, SLIME_F2, SLIME_F3, SLIME_F4],
    carnivore_plant_idle:   [SLIME_F1, SLIME_F2, SLIME_F3, SLIME_F4],
    magma_golem_walk:       [BRUTE_A, BRUTE_B],
    ice_golem_walk:         [BRUTE_A, BRUTE_B],
    void_walker_walk:       [WISP_F1, WISP_F2, WISP_F3, WISP_F4],
    void_drifter_float:     [WISP_F1, WISP_F2, WISP_F3, WISP_F4],
    boss_idle: [BOSS_A, BOSS_B, BOSS_A, BOSS_B],
    boss_vampire: [VAMPIRE_A, VAMPIRE_B, VAMPIRE_A, VAMPIRE_B],
    boss_skeleton_king: [SKELETON_KING_A, SKELETON_KING_B],
    boss_demon: [DEMON_A, DEMON_B],
    // Biome bosses
    boss_werewolf_king: [WEREWOLF_KING_A, WEREWOLF_KING_B],
    boss_bog_witch: [BOG_WITCH_A, BOG_WITCH_B],
    boss_magma_drake: [MAGMA_DRAKE_A, MAGMA_DRAKE_B],
    boss_ice_queen: [ICE_QUEEN_A, ICE_QUEEN_B],
    boss_treant: [TREANT_A, TREANT_B],

    // Spirits — elemental companions, 3 evolution stages each
    spirit_fairy_1: [SP_FAIRY1_A, SP_FAIRY1_B],
    spirit_fairy_2: [SP_FAIRY2_A, SP_FAIRY2_B],
    spirit_fairy_3: [SP_FAIRY3_A, SP_FAIRY3_B],
    spirit_water_1: [SP_WATER1_A, SP_WATER1_B],
    spirit_water_2: [SP_WATER2_A, SP_WATER2_B],
    spirit_water_3: [SP_WATER3_A, SP_WATER3_B],
    spirit_earth_1: [SP_EARTH1_A, SP_EARTH1_B],
    spirit_earth_2: [SP_EARTH2_A, SP_EARTH2_B],
    spirit_earth_3: [SP_EARTH3_A, SP_EARTH3_B],
    spirit_fire_1: [SP_FIRE1_A, SP_FIRE1_B],
    spirit_fire_2: [SP_FIRE2_A, SP_FIRE2_B],
    spirit_fire_3: [SP_FIRE3_A, SP_FIRE3_B],

    // Spirit effects
    fx_heal_aura: HEAL_AURA_FRAMES,
    fx_shield_bubble: [SHIELD_BUBBLE_A, SHIELD_BUBBLE_B],
    spirit_atk_fairy: [SP_ATK_FAIRY_A, SP_ATK_FAIRY_B],
    spirit_atk_water: [SP_ATK_WATER_A, SP_ATK_WATER_B],
    spirit_atk_earth: [SP_ATK_EARTH_A, SP_ATK_EARTH_B],
    spirit_atk_fire: [SP_ATK_FIRE_A, SP_ATK_FIRE_B],

    // Projectiles
    proj_wand: [WAND_BOLT_A, WAND_BOLT_B],
    proj_nova: [NOVA_A, NOVA_B, NOVA_A, NOVA_B],
    proj_prism: [PRISM_A, PRISM_B, PRISM_A, PRISM_B],
    proj_spear: [SPEAR_A, SPEAR_B],
    proj_axe: [AXE_F1, AXE_F2, AXE_F3, AXE_F4],
    proj_mace: [MACE_A, MACE_B],
    proj_holywater: [HOLYWATER_A, HOLYWATER_B],
    fx_holywater_splash: [HOLYWATER_SPLASH_1, HOLYWATER_SPLASH_2, HOLYWATER_SPLASH_3],
    proj_arrow: [ARROW_A, ARROW_B],
    proj_garlic: GARLIC_FRAMES,
    proj_bible: [BIBLE_F1, BIBLE_F2, BIBLE_F3, BIBLE_F4],
    proj_cross: [CROSS_F1, CROSS_F2, CROSS_F3, CROSS_F4],
    proj_whip: [WHIP_F1, WHIP_F2, WHIP_F3, WHIP_F4],
    proj_lightning: LIGHTNING_FRAMES,
    proj_firewall: FIREWALL_FRAMES,
    proj_knives: [KNIFE_F1, KNIFE_F2, KNIFE_F3],
    proj_scythe: [SCYTHE_F1, SCYTHE_F2, SCYTHE_F3, SCYTHE_F4],
    proj_bone: [BONE_A, BONE_B],

    // Legendary weapons (evolved / rare drops)
    proj_leg_blade: [LEG_BLADE_A, LEG_BLADE_B],
    proj_leg_axe: [LEG_AXE_1, LEG_AXE_2, LEG_AXE_3, LEG_AXE_4],
    proj_leg_spear: [LEG_SPEAR_A, LEG_SPEAR_B],
    proj_leg_arrow: [LEG_ARROW_A, LEG_ARROW_B],
    proj_leg_whip: [LEG_WHIP_F1, LEG_WHIP_F2, LEG_WHIP_F3, LEG_WHIP_F4],
    proj_leg_cross: [LEG_CROSS_1, LEG_CROSS_2, LEG_CROSS_3, LEG_CROSS_4],
    proj_leg_bible: [LEG_BIBLE_A, LEG_BIBLE_B, LEG_BIBLE_C],
    proj_leg_scythe: [LEG_SCYTHE_1, LEG_SCYTHE_2, LEG_SCYTHE_3, LEG_SCYTHE_4],
    proj_leg_nova: [LEG_NOVA_1, LEG_NOVA_2, LEG_NOVA_3, LEG_NOVA_4],

    // Trails
    trail_arrow: [ARROW_TRAIL_1, ARROW_TRAIL_2, ARROW_TRAIL_3],
    trail_slash_arc: [SLASH_ARC_1, SLASH_ARC_2, SLASH_ARC_3, SLASH_ARC_4],
    trail_proj: [PROJ_TRAIL_1, PROJ_TRAIL_2, PROJ_TRAIL_3],

    // ─ Weapon impact effects (one per archetype) ─
    fx_impact_pierce: [FX_PIERCE_1, FX_PIERCE_2, FX_PIERCE_3],
    fx_impact_smash:  [FX_SMASH_1, FX_SMASH_2, FX_SMASH_3],
    fx_impact_slash:  [FX_SLASH_HIT_1, FX_SLASH_HIT_2, FX_SLASH_HIT_3],
    fx_impact_lash:   [FX_LASH_1, FX_LASH_2, FX_LASH_3],
    fx_impact_arcane: [FX_ARCANE_1, FX_ARCANE_2, FX_ARCANE_3],
    fx_impact_scorch: [FX_SCORCH_1, FX_SCORCH_2, FX_SCORCH_3],
    fx_impact_splash: [FX_SPLASH_1, FX_SPLASH_2, FX_SPLASH_3],
    fx_impact_holy:   [FX_HOLY_1, FX_HOLY_2, FX_HOLY_3],

    // ─ Muzzle / cast effects ─
    fx_muzzle_arcane: [FX_MUZZLE_ARCANE],
    fx_muzzle_fire:   [FX_MUZZLE_FIRE],
    fx_muzzle_holy:   [FX_MUZZLE_HOLY],
    fx_cast_circle:   [FX_CAST_CIRCLE_1, FX_CAST_CIRCLE_2, FX_CAST_CIRCLE_3, FX_CAST_CIRCLE_4],

    // ─ Status icons (overlaid on enemies) ─
    status_burn: [STATUS_BURN],
    status_freeze: [STATUS_FREEZE],
    status_poison: [STATUS_POISON],
    status_shock: [STATUS_SHOCK],
    status_stun: [STATUS_STUN],
    status_bleed: [STATUS_BLEED],
    status_slow: [STATUS_SLOW],
    status_shield: [STATUS_SHIELD],

    // ─ Enemy death effects ─
    fx_death_zombie:   [FX_DEATH_ZOMBIE_1, FX_DEATH_ZOMBIE_2, FX_DEATH_ZOMBIE_3],
    fx_death_skeleton: [FX_DEATH_SKELETON_1, FX_DEATH_SKELETON_2, FX_DEATH_SKELETON_3],
    fx_death_slime:    [FX_DEATH_SLIME_1, FX_DEATH_SLIME_2, FX_DEATH_SLIME_3],
    fx_death_bat:      [FX_DEATH_BAT_1, FX_DEATH_BAT_2, FX_DEATH_BAT_3],
    fx_death_generic:  [FX_DEATH_GENERIC_1, FX_DEATH_GENERIC_2, FX_DEATH_GENERIC_3],

    // ─ Level up + footstep dust ─
    fx_levelup: FX_LEVELUP_FRAMES,
    fx_footdust: [FX_FOOTDUST_1, FX_FOOTDUST_2, FX_FOOTDUST_3],

    // ─ HUD frames ─
    hud_bar_hp: [HUD_BAR_FRAME_HP],
    hud_bar_xp: [HUD_BAR_FRAME_XP],
    hud_weapon_slot: [HUD_WEAPON_SLOT],
    hud_corner: [HUD_CORNER_ORNAMENT],

    // ─ Biome tiles ─
    tile_swamp_grass: [TILE_SWAMP_GRASS],
    tile_swamp_mud:   [TILE_SWAMP_MUD],
    tile_swamp_water: [TILE_SWAMP_WATER],
    tile_volcano_lava: [TILE_VOLCANO_LAVA],
    tile_volcano_ash:  [TILE_VOLCANO_ASH],
    tile_volcano_rock: [TILE_VOLCANO_ROCK],
    tile_ice_floor: [TILE_ICE_FLOOR],
    tile_ice_crack: [TILE_ICE_CRACK],
    tile_ice_snow:  [TILE_ICE_SNOW],

    // ─ Cursors / aim ─
    cursor_aim:    [CURSOR_AIM],
    cursor_target: [CURSOR_TARGET_1, CURSOR_TARGET_2, CURSOR_TARGET_3, CURSOR_TARGET_4],
    aim_indicator: [AIM_INDICATOR_A, AIM_INDICATOR_B],

    // Effects
    fx_hit: [HIT_1, HIT_2, HIT_3, HIT_4],
    fx_explosion: EXPL_FRAMES,
    fx_slash: [SLASH_1, SLASH_2, SLASH_3],

    // Pickups
    pickup_xp_blue: [XPGEM_A, XPGEM_B, XPGEM_C, XPGEM_D],
    pickup_xp_green: [XPGEM_GREEN],
    pickup_xp_red: [XPGEM_RED],
    pickup_gold: [GOLD_1, GOLD_2, GOLD_3, GOLD_4],
    pickup_heart: [HEART_A, HEART_B],
    pickup_magnet: [MAGNET],
    pickup_bomb: [BOMB_A, BOMB_B],
    pickup_chicken: [CHICKEN],
    pickup_potion_hp: [POTION_HP_A, POTION_HP_B],
    pickup_potion_might: [POTION_MIGHT_A, POTION_MIGHT_B],
    pickup_potion_mana: [POTION_MANA_A, POTION_MANA_B],
    pickup_potion_swift: [POTION_SWIFT_A, POTION_SWIFT_B],
    pickup_potion_arcane: [POTION_ARCANE_A, POTION_ARCANE_B],
    pickup_chest: [CHEST_CLOSED_A, CHEST_CLOSED_B],
    pickup_chest_open: [CHEST_OPEN],
    pickup_chest_gold: [CHEST_GOLD_A, CHEST_GOLD_B],
    pickup_scroll: [SCROLL],
    pickup_key: [KEY],
    pickup_rune: [RUNE_A, RUNE_B],
    // New v3 drops — utility / power-ups
    pickup_vacuum: [VACUUM_A, VACUUM_B],
    pickup_hourglass: [HOURGLASS_A, HOURGLASS_B],
    pickup_star_power: [STAR_POWER_1, STAR_POWER_2, STAR_POWER_3, STAR_POWER_4],
    pickup_lucky_coin: [LUCKY_COIN_1, LUCKY_COIN_2, LUCKY_COIN_3, LUCKY_COIN_4],
    pickup_soul_crystal: [SOUL_CRYSTAL_A, SOUL_CRYSTAL_B],
    pickup_tome: [TOME_A, TOME_B],
    pickup_talisman: [TALISMAN_A, TALISMAN_B],
    pickup_skull_key: [SKULL_KEY_A, SKULL_KEY_B],
    pickup_mystic_orb: [MYSTIC_ORB_1, MYSTIC_ORB_2, MYSTIC_ORB_3, MYSTIC_ORB_4],

    // New v3 basic weapons
    proj_boomerang: [BOOMERANG_F1, BOOMERANG_F2, BOOMERANG_F3, BOOMERANG_F4],
    proj_crystal_shard: [CRYSTAL_SHARD_A, CRYSTAL_SHARD_B],
    proj_sun_arrow: [SUN_ARROW_A, SUN_ARROW_B],
    proj_frostblade: [FROSTBLADE_A, FROSTBLADE_B],
    proj_plague_dart: [PLAGUE_DART_A, PLAGUE_DART_B],

    // New v3 legendary weapons
    proj_leg_sun_phoenix: [SUN_PHOENIX_BOW_A, SUN_PHOENIX_BOW_B],
    proj_leg_eternal_frost: [ETERNAL_FROST_A, ETERNAL_FROST_B],
    proj_leg_demon_heart: [DEMON_HEART_1, DEMON_HEART_2, DEMON_HEART_3, DEMON_HEART_4],
    proj_leg_storm_caller: [STORM_CALLER_1, STORM_CALLER_2, STORM_CALLER_3, STORM_CALLER_4],
    proj_leg_world_tree: [WORLD_TREE_A, WORLD_TREE_B],

    // Tileset
    tile_stone_1: [TILE_STONE_1],
    tile_stone_2: [TILE_STONE_2],
    tile_stone_crack: [TILE_STONE_CRACK],
    tile_grass: [TILE_GRASS_TUFT],
    tile_bones: [TILE_BONES],
    tile_blood: [TILE_BLOOD],
    tile_grass_full: [TILE_GRASS_FULL],
    tile_grass_dark: [TILE_GRASS_DARK],
    tile_dirt: [TILE_DIRT],
    tile_water: [TILE_WATER],
    tile_moss: [TILE_MOSS],

    // UI icons
    icon_hero_knight: [ICON_HERO_KNIGHT],
    icon_hero_warrior: [ICON_HERO_WARRIOR],
    icon_hero_mage: [ICON_HERO_MAGE],
    icon_hero_huntress: [ICON_HERO_HUNTRESS],
    icon_hero_cleric: [ICON_HERO_CLERIC],
    icon_boss_lich: [ICON_BOSS_LICH],
    icon_boss_vampire: [ICON_BOSS_VAMPIRE],
    icon_boss_skeleton: [ICON_BOSS_SKELETON],
    icon_boss_demon: [ICON_BOSS_DEMON],
    icon_wand: [ICON_WAND],
    icon_nova: [ICON_NOVA],
    icon_prism: [ICON_PRISM],
    icon_spear: [ICON_SPEAR],
    icon_axe: [ICON_AXE],
    icon_mace: [ICON_MACE],
    icon_holywater: [ICON_HOLYWATER],
    icon_arrow: [ICON_ARROW],
    icon_garlic: [ICON_GARLIC],
    icon_bible: [ICON_BIBLE],
    icon_cross: [ICON_CROSS],
    icon_whip: [ICON_WHIP],
    icon_lightning: [ICON_LIGHTNING],
    icon_firewall: [ICON_FIREWALL],
    icon_knives: [ICON_KNIVES],
    icon_scythe: [ICON_SCYTHE],
    icon_bone: [ICON_BONE],

    // Legendary weapon icons (gold-trim frame)
    icon_leg_blade: [ICON_LEG_BLADE],
    icon_leg_axe: [ICON_LEG_AXE],
    icon_leg_spear: [ICON_LEG_SPEAR],
    icon_leg_arrow: [ICON_LEG_ARROW],
    icon_leg_whip: [ICON_LEG_WHIP],
    icon_leg_cross: [ICON_LEG_CROSS],
    icon_leg_bible: [ICON_LEG_BIBLE],
    icon_leg_nova: [ICON_LEG_NOVA],
    icon_might: [ICON_MIGHT],
    icon_haste: [ICON_HASTE],
    icon_multi: [ICON_MULTI],
    icon_swift: [ICON_SWIFT],
    icon_vigor: [ICON_VIGOR],
    icon_lodestone: [ICON_LODESTONE],

    // Title screen illustration (240×135 panorama)
    scene_title: [TITLE_SCENE],

    // Weapon action FX (cast/swing animations)
    fx_swing: [FX_SWING_1, FX_SWING_2, FX_SWING_3, FX_SWING_4, FX_SWING_5, FX_SWING_6],
    fx_boomerang_arc: [FX_BOOMERANG_1, FX_BOOMERANG_2, FX_BOOMERANG_3, FX_BOOMERANG_4],
    fx_beam: [FX_BEAM_1, FX_BEAM_2, FX_BEAM_3],
    fx_chain_lightning: [FX_CHAIN_1, FX_CHAIN_2, FX_CHAIN_3, FX_CHAIN_4],
    fx_vortex: [FX_VORTEX_1, FX_VORTEX_2, FX_VORTEX_3, FX_VORTEX_4],
    fx_summon_circle: [FX_SUMMON_1, FX_SUMMON_2, FX_SUMMON_3, FX_SUMMON_4],
    fx_fan_burst: [FX_FAN_BURST],
    fx_ground_spike: [FX_GROUND_SPIKE_1, FX_GROUND_SPIKE_2, FX_GROUND_SPIKE_3, FX_GROUND_SPIKE_4],
    fx_whirlwind: [FX_WHIRLWIND_1, FX_WHIRLWIND_2, FX_WHIRLWIND_3, FX_WHIRLWIND_4],
    fx_soul_wisp: [FX_SOUL_WISP_A, FX_SOUL_WISP_B],

    // More legendary weapons (5 unique-action drops)
    proj_leg_spectral_bow: [LEG_SPECTRAL_BOW_A, LEG_SPECTRAL_BOW_B],
    proj_leg_tempest: [LEG_TEMPEST_1, LEG_TEMPEST_2, LEG_TEMPEST_3, LEG_TEMPEST_4],
    proj_leg_necro_skull: [LEG_NECRO_SKULL_A, LEG_NECRO_SKULL_B],
    proj_leg_black_hole: [LEG_BLACK_HOLE_1, LEG_BLACK_HOLE_2, LEG_BLACK_HOLE_3, LEG_BLACK_HOLE_4],
    proj_leg_soul_lantern: [LEG_SOUL_LANTERN_A, LEG_SOUL_LANTERN_B],

    // Icons for new legendaries
    icon_leg_spectral_bow: [ICON_LEG_SPECTRAL_BOW],
    icon_leg_tempest: [ICON_LEG_TEMPEST],
    icon_leg_necro: [ICON_LEG_NECRO],
    icon_leg_blackhole: [ICON_LEG_BLACKHOLE],
    icon_leg_soul_lantern: [ICON_LEG_SOUL_LANTERN],
  };

  // Critical font extras (CRIT! glyphs) merged into FONT
  Object.assign(FONT, FONT_EXTRAS);

  window.FONT = FONT;

  // Categorise so the preview UI can group cards.
  window.SPRITE_GROUPS = [
    { title: 'Heroes', items: ['knight_walk', 'warrior_walk', 'mage_walk', 'huntress_walk', 'cleric_walk'] },
    { title: 'Enemies', items: ['walker_walk', 'runner_walk', 'elite_walk', 'brute_walk', 'bat_fly', 'spider_walk', 'slime_idle', 'chimera_walk'] },
    { title: 'Enemies · Forest', items: ['wolf_run', 'goblin_walk', 'hornet_fly'] },
    { title: 'Enemies · Swamp', items: ['frog_idle', 'bog_zombie_walk', 'wisp_float'] },
    { title: 'Enemies · Volcano', items: ['imp_walk', 'lava_slug_idle', 'fire_bat_fly'] },
    { title: 'Enemies · Ice Cavern', items: ['frost_wolf_run', 'yeti_walk', 'ice_wraith_float'] },
    { title: 'Bosses', items: ['boss_idle', 'boss_vampire', 'boss_skeleton_king', 'boss_demon', 'boss_werewolf_king', 'boss_bog_witch', 'boss_magma_drake', 'boss_ice_queen', 'boss_treant'] },
    { title: 'Spirits · Fairy — supporter / heal', items: ['spirit_fairy_1', 'spirit_fairy_2', 'spirit_fairy_3'] },
    { title: 'Spirits · Water — supporter / shield', items: ['spirit_water_1', 'spirit_water_2', 'spirit_water_3'] },
    { title: 'Spirits · Earth — attacker / boulder', items: ['spirit_earth_1', 'spirit_earth_2', 'spirit_earth_3'] },
    { title: 'Spirits · Fire — attacker / burn', items: ['spirit_fire_1', 'spirit_fire_2', 'spirit_fire_3'] },
    { title: 'Spirit Effects', items: ['fx_heal_aura', 'fx_shield_bubble', 'spirit_atk_fairy', 'spirit_atk_water', 'spirit_atk_earth', 'spirit_atk_fire'] },
    { title: 'Projectiles · Basic', items: ['proj_wand', 'proj_nova', 'proj_prism', 'proj_spear', 'proj_axe', 'proj_mace', 'proj_holywater', 'proj_arrow', 'proj_garlic', 'proj_bible', 'proj_cross', 'proj_boomerang', 'proj_crystal_shard', 'proj_sun_arrow', 'proj_frostblade', 'proj_plague_dart'] },
    { title: 'Projectiles · Extra', items: ['proj_whip', 'proj_lightning', 'proj_firewall', 'proj_knives', 'proj_scythe', 'proj_bone'] },
    { title: 'Projectiles · Legendary', items: ['proj_leg_blade', 'proj_leg_axe', 'proj_leg_spear', 'proj_leg_arrow', 'proj_leg_whip', 'proj_leg_cross', 'proj_leg_bible', 'proj_leg_scythe', 'proj_leg_nova', 'proj_leg_spectral_bow', 'proj_leg_tempest', 'proj_leg_necro_skull', 'proj_leg_black_hole', 'proj_leg_soul_lantern', 'proj_leg_sun_phoenix', 'proj_leg_eternal_frost', 'proj_leg_demon_heart', 'proj_leg_storm_caller', 'proj_leg_world_tree'] },
    { title: 'Weapon Actions (cast / swing)', items: ['fx_swing', 'fx_boomerang_arc', 'fx_beam', 'fx_chain_lightning', 'fx_vortex', 'fx_summon_circle', 'fx_fan_burst', 'fx_ground_spike', 'fx_whirlwind', 'fx_soul_wisp'] },
    { title: 'Effects & Trails', items: ['fx_hit', 'fx_explosion', 'fx_slash', 'fx_holywater_splash', 'trail_arrow', 'trail_slash_arc', 'trail_proj'] },
    { title: 'Impact FX (per weapon)', items: ['fx_impact_pierce', 'fx_impact_smash', 'fx_impact_slash', 'fx_impact_lash', 'fx_impact_arcane', 'fx_impact_scorch', 'fx_impact_splash', 'fx_impact_holy'] },
    { title: 'Muzzle & Cast', items: ['fx_muzzle_arcane', 'fx_muzzle_fire', 'fx_muzzle_holy', 'fx_cast_circle'] },
    { title: 'Enemy Deaths', items: ['fx_death_zombie', 'fx_death_skeleton', 'fx_death_slime', 'fx_death_bat', 'fx_death_generic'] },
    { title: 'Misc FX', items: ['fx_levelup', 'fx_footdust'] },
    { title: 'HUD Frames', items: ['hud_bar_hp', 'hud_bar_xp', 'hud_weapon_slot', 'hud_corner'] },
    { title: 'Cursors / Aim', items: ['cursor_aim', 'cursor_target', 'aim_indicator'] },
    { title: 'Status Icons', items: ['status_burn', 'status_freeze', 'status_poison', 'status_shock', 'status_stun', 'status_bleed', 'status_slow', 'status_shield'] },
    { title: 'Pickups · Gems', items: ['pickup_xp_blue', 'pickup_xp_green', 'pickup_xp_red', 'pickup_gold'] },
    { title: 'Pickups · Items', items: ['pickup_heart', 'pickup_magnet', 'pickup_bomb', 'pickup_chicken', 'pickup_scroll', 'pickup_key', 'pickup_rune', 'pickup_chest', 'pickup_chest_open', 'pickup_chest_gold'] },
    { title: 'Pickups · Power-ups', items: ['pickup_vacuum', 'pickup_hourglass', 'pickup_star_power', 'pickup_lucky_coin', 'pickup_soul_crystal', 'pickup_tome', 'pickup_talisman', 'pickup_skull_key', 'pickup_mystic_orb'] },
    { title: 'Pickups · Potions', items: ['pickup_potion_hp', 'pickup_potion_might', 'pickup_potion_mana', 'pickup_potion_swift', 'pickup_potion_arcane'] },
    { title: 'Tileset · Dungeon', items: ['tile_stone_1', 'tile_stone_2', 'tile_stone_crack', 'tile_bones', 'tile_blood', 'tile_moss'] },
    { title: 'Tileset · Outdoor', items: ['tile_grass', 'tile_grass_full', 'tile_grass_dark', 'tile_dirt', 'tile_water'] },
    { title: 'Tileset · Swamp', items: ['tile_swamp_grass', 'tile_swamp_mud', 'tile_swamp_water'] },
    { title: 'Tileset · Volcano', items: ['tile_volcano_lava', 'tile_volcano_ash', 'tile_volcano_rock'] },
    { title: 'Tileset · Ice Cavern', items: ['tile_ice_floor', 'tile_ice_crack', 'tile_ice_snow'] },
    { title: 'UI Icons · Heroes', items: ['icon_hero_knight', 'icon_hero_warrior', 'icon_hero_mage', 'icon_hero_huntress', 'icon_hero_cleric'] },
    { title: 'UI Icons · Bosses', items: ['icon_boss_lich', 'icon_boss_vampire', 'icon_boss_skeleton', 'icon_boss_demon'] },
    { title: 'UI Icons · Weapons', items: ['icon_wand', 'icon_nova', 'icon_prism', 'icon_spear', 'icon_axe', 'icon_mace', 'icon_holywater', 'icon_arrow', 'icon_garlic', 'icon_bible', 'icon_cross', 'icon_whip', 'icon_lightning', 'icon_firewall', 'icon_knives', 'icon_scythe', 'icon_bone'] },
    { title: 'UI Icons · Legendary', items: ['icon_leg_blade', 'icon_leg_axe', 'icon_leg_spear', 'icon_leg_arrow', 'icon_leg_whip', 'icon_leg_cross', 'icon_leg_bible', 'icon_leg_nova', 'icon_leg_spectral_bow', 'icon_leg_tempest', 'icon_leg_necro', 'icon_leg_blackhole', 'icon_leg_soul_lantern'] },
    { title: 'UI Icons · Passives', items: ['icon_might', 'icon_haste', 'icon_multi', 'icon_swift', 'icon_vigor', 'icon_lodestone'] },
  ];

  // ============================================================
  // CHARACTER-EXCLUSIVE WEAPONS — one per hero (5)
  // ============================================================
  // Knight · Vanguard Sword — wide cyan blade with gold cross-guard
  const VANGUARD_A = [
    '............',
    '...WWWW.....',
    '..WIIIIW....',
    '..WIIIIW....',
    '..WIIIIW....',
    '..WIIIIW....',
    'YYY9889YYY..',
    '...Y99Y.....',
    '....bb......',
    '....bb......',
    '....bb......',
    '....cc......',
  ];
  const VANGUARD_B = [
    '............',
    '...PPPP.....',
    '..PWWWWP....',
    '..WIWWIW....',
    '..WIWWIW....',
    '..WIIIIW....',
    'YYY9889YYY..',
    '...Y99Y.....',
    '....bb......',
    '....bb......',
    '....bb......',
    '....cc......',
  ];

  // Warrior · Warhammer — chunky stone head, brass band
  const WARHAMMER_A = [
    '............',
    '.444444444..',
    '.494999994..',
    '.499YY99994.',
    '.499YPPY994.',
    '.499YY99994.',
    '.494999994..',
    '.444444444..',
    '....bb......',
    '....bb......',
    '....bb......',
    '....cc......',
  ];
  const WARHAMMER_B = [
    '............',
    '.554444555..',
    '.494999994..',
    '.499PPP9994.',
    '.499PPPP994.',
    '.499PPP9994.',
    '.494999994..',
    '.554444555..',
    '....bb......',
    '....bb......',
    '....bb......',
    '....cc......',
  ];

  // Mage · Astral Staff — purple sphere on twisted shaft
  const ASTRAL_STAFF_A = [
    '............',
    '....mMM.....',
    '...mMqqMm...',
    '..mMqPPqMm..',
    '..MqPWWPqM..',
    '..mMqPPqMm..',
    '...mMqqMm...',
    '....mMM.....',
    '.....bp.....',
    '....pb......',
    '....bp......',
    '...pb.......',
  ];
  const ASTRAL_STAFF_B = [
    '....MMM.....',
    '...MqqqM....',
    '..MqPPPqM...',
    '.MqPWWWPqM..',
    '.MqPWqWPqM..',
    '.MqPWWWPqM..',
    '..MqPPPqM...',
    '...MqqqM....',
    '....bp......',
    '...pb.......',
    '....bp......',
    '...pb.......',
  ];

  // Huntress · Hunter's Bow — short recurve bow with notched arrow
  const HUNTERS_BOW_A = [
    '..............',
    '..c..........h',
    '.c.c.........h',
    'c...c.......hh',
    'c....c..hccc88',
    'c....c..hccc88',
    'c...c.......hh',
    '.c.c.........h',
    '..c..........h',
    '..............',
    '..............',
    '..............',
  ];
  for (let i = 0; i < HUNTERS_BOW_A.length; i++) {
    while (HUNTERS_BOW_A[i].length < 14) HUNTERS_BOW_A[i] += '.';
  }
  const HUNTERS_BOW_B = [
    '..............',
    '..c...........',
    '.c.c..........',
    'c...c.........',
    'c....cYPPPPPPP',
    'c....cYPPPPPPP',
    'c...c.........',
    '.c.c..........',
    '..c...........',
    '..............',
    '..............',
    '..............',
  ];
  for (let i = 0; i < HUNTERS_BOW_B.length; i++) {
    while (HUNTERS_BOW_B[i].length < 14) HUNTERS_BOW_B[i] += '.';
  }

  // Cleric · Holy Censer — swinging incense burner with smoke
  const HOLY_CENSER_A = [
    '............',
    '....b.......',
    '....b.......',
    '....b.......',
    '....b.......',
    '.YYYYYYYY...',
    '.Y999999Y...',
    '.Y988889Y...',
    '.YY9889YY...',
    '..YYYYY77...',
    '...77.77....',
    '....7.......',
  ];
  const HOLY_CENSER_B = [
    '............',
    '.......b....',
    '......b.....',
    '.....b......',
    '....b.......',
    '.YYYYYYYY...',
    '.Y999999Y...',
    '.Y988889Y...',
    '.YY9889YY...',
    '..YYYYY7....',
    '...7.7.7....',
    '....7..7....',
  ];

  // Icons — 24×24 same parchment frame style
  function iconFrame() {
    const f = [
      '........................',
      '........................',
      '.......888888888........',
      '.....88aaaaaaaa88.......',
      '....8aa77777777aa8......',
      '...8a77777777777a8......',
      '...8a77777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '...8a77777777777a8......',
      '...8a77777777777a8......',
      '....8aa77777777aa8......',
      '.....88aaaaaaaa88.......',
      '.......888888888........',
      '........................',
    ];
    return f.map((r) => r.split(''));
  }
  function paintIcon(over, ox, oy) {
    const out = iconFrame();
    for (let y = 0; y < over.length; y++) {
      for (let x = 0; x < over[y].length; x++) {
        const c = over[y][x];
        if (c === '.' || c === ' ') continue;
        out[oy + y][ox + x] = c;
      }
    }
    return out.map((r) => r.join(''));
  }
  const ICON_VANGUARD = paintIcon([
    '...WWWW..',
    '..WIIIIW.',
    '..WIIIIW.',
    '..WIIIIW.',
    'YYY9889YY',
    '...Y99Y..',
    '....bb...',
    '....bb...',
    '....cc...',
  ], 7, 7);
  const ICON_WARHAMMER = paintIcon([
    '444444444',
    '494999994',
    '499YY9999',
    '499YPPY99',
    '494999994',
    '444444444',
    '...bb....',
    '...bb....',
    '...cc....',
  ], 7, 7);
  const ICON_ASTRAL_STAFF = paintIcon([
    '...mMM...',
    '..mMqqMm.',
    '.mMqPPqMm',
    '.MqPWWPqM',
    '.mMqPPqMm',
    '..mMqqMm.',
    '...pb....',
    '..pb.....',
    '...pb....',
  ], 7, 7);
  const ICON_HUNTERS_BOW = paintIcon([
    '..c.......',
    '.c.c......',
    'c...c.....',
    'c....cYPPP',
    'c....cYPPP',
    'c...c.....',
    '.c.c......',
    '..c.......',
  ], 6, 8);
  const ICON_HOLY_CENSER = paintIcon([
    '....b....',
    '....b....',
    '....b....',
    'YYYYYYYY.',
    'Y988889Y.',
    'YY9889YY.',
    '.YYYYY77.',
    '..77.77..',
  ], 7, 8);

  // Register all the new sprites
  Object.assign(window.SPRITES, {
    proj_vanguard_sword: [VANGUARD_A, VANGUARD_B],
    proj_warhammer:      [WARHAMMER_A, WARHAMMER_B],
    proj_astral_staff:   [ASTRAL_STAFF_A, ASTRAL_STAFF_B],
    proj_hunters_bow:    [HUNTERS_BOW_A, HUNTERS_BOW_B],
    proj_holy_censer:    [HOLY_CENSER_A, HOLY_CENSER_B],
    icon_vanguard:       [ICON_VANGUARD],
    icon_warhammer:      [ICON_WARHAMMER],
    icon_astral_staff:   [ICON_ASTRAL_STAFF],
    icon_hunters_bow:    [ICON_HUNTERS_BOW],
    icon_holy_censer:    [ICON_HOLY_CENSER],
  });

  // ============================================================
  // HERO-THEMED WEAPONS — 3 extra weapons per hero (15 total)
  // ============================================================
  // Knight · Shield Throw — gold-rimmed shield boomerang, 12×12
  const SHIELD_THROW_A = [
    '...PPPP.....',
    '..PYYYYP....',
    '.PY9889YP...',
    '.Y9PIIPP9...',
    '.Y9PIIPP9...',
    '.PY9889YP...',
    '..PYYYYP....',
    '...PPPP.....',
    '............',
    '............',
    '............',
    '............',
  ];
  const SHIELD_THROW_B = [
    '....PPPP....',
    '...PYYYYP...',
    '..PY9889YP..',
    '..Y9PWWPP9..',
    '..Y9PWWPP9..',
    '..PY9889YP..',
    '...PYYYYP...',
    '....PPPP....',
    '............',
    '............',
    '............',
    '............',
  ];

  // Knight · Divine Hammer — gold hammer with cross, 12×12
  const DIVINE_HAMMER_A = [
    '..YYYYYY....',
    '.Y9P889PY...',
    '.Y98YY89Y...',
    '.Y9YPPY9Y...',
    '.Y98YY89Y...',
    '.Y9P889PY...',
    '..YYYYYY....',
    '....bb......',
    '....bb......',
    '....bb......',
    '....bb......',
    '....cc......',
  ];
  const DIVINE_HAMMER_B = [
    '..YYYYYY....',
    '.YP9889PY...',
    '.Y9PYYP9Y...',
    '.Y9YPPPYY...',
    '.Y9PYYP9Y...',
    '.YP9889PY...',
    '..YYYYYY....',
    '....bb......',
    '....bb......',
    '....bb......',
    '....bb......',
    '....cc......',
  ];

  // Knight · Holy Lance — bright lance, 16×6
  const HOLY_LANCE_A = [
    '................',
    '..bbbbbbbbb6YYPP',
    '.cbbbbbbbbb6YYPP',
    '..bbbbbbbbb6YYPP',
    '................',
    '................',
  ];
  const HOLY_LANCE_B = [
    '................',
    '..bbbbbbbbb6PPPP',
    '.cbbbbbbbbb6PYYP',
    '..bbbbbbbbb6PPPP',
    '................',
    '................',
  ];

  // Warrior · Cleaver — heavy meat cleaver, 12×12
  const CLEAVER_A = [
    '............',
    '..6666666...',
    '.66555555c..',
    '.65555555c..',
    '.65555555c..',
    '.66555555c..',
    '..6666666...',
    '......bbc...',
    '......bb....',
    '......bb....',
    '......cc....',
    '............',
  ];
  const CLEAVER_B = [
    '............',
    '..6666666...',
    '.66P5555Pc..',
    '.65PP55PPc..',
    '.65P55PP5c..',
    '.66555555c..',
    '..6666666...',
    '......bbc...',
    '......bb....',
    '......bb....',
    '......cc....',
    '............',
  ];

  // Warrior · Chain Flail — spiked ball on chain, 12×12
  const CHAIN_FLAIL_A = [
    '............',
    '...kkkk.....',
    '..kRkkkRk...',
    '..kkRkRkk...',
    '..kkkkkkk...',
    '..kRkkkRk...',
    '...kkkk.....',
    '....k.......',
    '...k........',
    '..k.........',
    '.k..........',
    'b...........',
  ];
  const CHAIN_FLAIL_B = [
    '............',
    '....kkkk....',
    '...kRkkkRk..',
    '...kkRkRkk..',
    '...kkkkkkk..',
    '...kRkkkRk..',
    '....kkkk....',
    '....k.......',
    '...k........',
    '..k.........',
    '.k..........',
    'b...........',
  ];

  // Warrior · Throwing Axes — 3 axes flying, 12×12
  const THROW_AXES_A = [
    '............',
    '....666.....',
    '...66c66....',
    '...c.c..6...',
    '....c..666..',
    '..66c..c66..',
    '..66c66.c...',
    '...c..6.....',
    '..c..66c66..',
    '.....66c66..',
    '......666...',
    '............',
  ];
  const THROW_AXES_B = [
    '....666.....',
    '...66c66....',
    '...c.c......',
    '....c.......',
    '............',
    '..66c66.....',
    '..c..c..66c.',
    '...c..6.66c.',
    '......6..c..',
    '.....66.....',
    '....666.....',
    '...66c66....',
  ];

  // Mage · Frost Bolt — sharp ice shard, 10×6
  const FROST_BOLT_A = [
    '..........',
    '..WWPPPP..',
    '.WIIIWWPPP',
    '.WIIIIWWWP',
    '.WIIIWWPPP',
    '..WWPPPP..',
  ];
  const FROST_BOLT_B = [
    '...WWPPPP.',
    '..WIIIWWPP',
    '.WIIIIWWPP',
    '.WIIIIWWPP',
    '..WIIWPPP.',
    '...WWPPP..',
  ];

  // Mage · Void Sphere — purple gravity orb, 12×12
  const VOID_SPHERE_A = [
    '............',
    '...ppmmpp...',
    '..pmMMMMmp..',
    '.pmMpMMpMmp.',
    '.mMMM00MMMm.',
    '.mMMM00MMMm.',
    '.pmMpMMpMmp.',
    '..pmMMMMmp..',
    '...ppmmpp...',
    '............',
    '............',
    '............',
  ];
  const VOID_SPHERE_B = [
    '............',
    '...mmppmm...',
    '..mMpppppMm.',
    '.mMp00pp0pMm',
    '.MpMM00MMpM.',
    '.MpMM00MMpM.',
    '.mMp0pp00pMm',
    '..mMpppppMm.',
    '...mmppmm...',
    '............',
    '............',
    '............',
  ];
  for (let i = 0; i < VOID_SPHERE_B.length; i++) {
    while (VOID_SPHERE_B[i].length < 12) VOID_SPHERE_B[i] += '.';
    if (VOID_SPHERE_B[i].length > 12) VOID_SPHERE_B[i] = VOID_SPHERE_B[i].slice(0, 12);
  }

  // Mage · Arcane Missile — small homing star, 8×8
  const ARCANE_MISSILE_A = [
    '...P....',
    '..PMP...',
    '.PMqMP..',
    'PMqPqMP.',
    '.PMqMP..',
    '..PMP...',
    '...P....',
    '........',
  ];
  const ARCANE_MISSILE_B = [
    '...P....',
    '...M....',
    '..MqM...',
    '.MqPqM..',
    '..MqM...',
    '...M....',
    '...P....',
    '........',
  ];

  // Huntress · Crossbow Bolt — heavy bolt, 14×6
  const CROSSBOW_BOLT_A = [
    '..............',
    '..hhhcccccccPP',
    '.hcccccccccPPP',
    '..hhhcccccccPP',
    '..............',
    '..............',
  ];
  const CROSSBOW_BOLT_B = [
    '..............',
    '.hhcccccccccPP',
    'hcccccccccccPP',
    '.hhcccccccccPP',
    '..............',
    '..............',
  ];

  // Huntress · Snare Trap — circular trap, 12×12
  const SNARE_TRAP_A = [
    '....cccc....',
    '..cccbbccc..',
    '.ccb6666bcc.',
    '.cb6P66P6bc.',
    'ccb6PccP6bcc',
    'ccb6cccc6bcc',
    'ccb6PccP6bcc',
    '.cb6P66P6bc.',
    '.ccb6666bcc.',
    '..cccbbccc..',
    '....cccc....',
    '............',
  ];
  const SNARE_TRAP_B = [
    '....cccc....',
    '..ccc66ccc..',
    '.ccb6666bcc.',
    '.cb6c66c6bc.',
    'ccb6cPPc6bcc',
    'ccb6PccP6bcc',
    'ccb6cPPc6bcc',
    '.cb6c66c6bc.',
    '.ccb6666bcc.',
    '..ccc66ccc..',
    '....cccc....',
    '............',
  ];

  // Huntress · Hunting Hawk — companion bird, 12×8
  const HUNTING_HAWK_A = [
    '............',
    '...bbbb.....',
    '..b6bbbb....',
    '.b777RR7bb..',
    '.b7710017bb.',
    '..b77777b...',
    '...b9b9b....',
    '............',
  ];
  const HUNTING_HAWK_B = [
    '....bb......',
    '...bbbbb....',
    '..bbbbbbbb..',
    'bbb77RR77bb.',
    '.b771001b...',
    '.b777777b...',
    '..b9.b.9b...',
    '............',
  ];

  // Cleric · Heal Beam — green-gold connection line, 16×4
  const HEAL_BEAM_A = [
    'YGhGhGhGhGhGhGYY',
    'YhGhGhGhGhGhGhYP',
    'YGhGhGhGhGhGhGYY',
    '................',
  ];
  const HEAL_BEAM_B = [
    'GhGhGhGhGhGhGhPP',
    'YhYhYhYhYhYhYhPP',
    'GhGhGhGhGhGhGhPP',
    '................',
  ];
  for (let i = 0; i < 3; i++) {
    while (HEAL_BEAM_A[i].length < 16) HEAL_BEAM_A[i] += '.';
    while (HEAL_BEAM_B[i].length < 16) HEAL_BEAM_B[i] += '.';
  }

  // Cleric · Smite — vertical lightning bolt of light, 8×16
  const SMITE_A = [
    '....P...',
    '...PPP..',
    '...PYP..',
    '..PYYYP.',
    '..PY9YP.',
    '..PY9YP.',
    '..PY9YP.',
    '..PY9YP.',
    '..PY9YP.',
    '..PY9YP.',
    '..PY9YP.',
    '..PYYYP.',
    '...PYP..',
    '...PPP..',
    '....P...',
    '........',
  ];
  const SMITE_B = [
    '....P...',
    '...PYP..',
    '..PYYYP.',
    '..PY9YP.',
    '.PY999YP',
    '.PY888YP',
    '.PY8P8YP',
    '.PYP8PYP',
    '.PY8P8YP',
    '.PY888YP',
    '.PY999YP',
    '..PY9YP.',
    '..PYYYP.',
    '...PYP..',
    '....P...',
    '........',
  ];

  // Cleric · Sanctuary — circular protective field, 16×16
  const SANCTUARY_A = [
    '................',
    '......YYY.......',
    '....YYPPPYY.....',
    '...YPPhhhPPY....',
    '..YPhhGGGhhPY...',
    '..YPhGGhGGhPY...',
    '.YPhGGGGGGGhPY..',
    '.YPhGhhYhhGhPY..',
    '.YPhGGGYGGGhPY..',
    '.YPhGGGGGGGhPY..',
    '..YPhGGhGGhPY...',
    '..YPhhGGGhhPY...',
    '...YPPhhhPPY....',
    '....YYPPPYY.....',
    '......YYY.......',
    '................',
  ];
  const SANCTUARY_B = [
    '................',
    '......PPP.......',
    '....PPYYYPP.....',
    '...PYYhGhYYP....',
    '..PYhGGGGGhYP...',
    '..PYhGhYhGhYP...',
    '.PYhGGYYYGGhYP..',
    '.PYGGYYYYYGGYP..',
    '.PYhGGYYYGGhYP..',
    '.PYhGGGGGGGhYP..',
    '..PYhGhYhGhYP...',
    '..PYhGGGGGhYP...',
    '...PYYhGhYYP....',
    '....PPYYYPP.....',
    '......PPP.......',
    '................',
  ];

  // ── Icons for 15 new weapons (24×24 parchment frame) ────────
  function iconF() {
    return [
      '........................',
      '........................',
      '.......888888888........',
      '.....88aaaaaaaa88.......',
      '....8aa77777777aa8......',
      '...8a77777777777a8......',
      '...8a77777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '..8a777777777777a8......',
      '...8a77777777777a8......',
      '...8a77777777777a8......',
      '....8aa77777777aa8......',
      '.....88aaaaaaaa88.......',
      '.......888888888........',
      '........................',
    ].map((r) => r.split(''));
  }
  function paintI(over, ox, oy) {
    const out = iconF();
    for (let y = 0; y < over.length; y++) {
      for (let x = 0; x < over[y].length; x++) {
        const c = over[y][x];
        if (c === '.' || c === ' ') continue;
        out[oy + y][ox + x] = c;
      }
    }
    return out.map((r) => r.join(''));
  }
  const ICON_SHIELD_THROW = paintI([
    '.PPPP.','PYYYYP','Y9889Y','Y9PP9Y','PY99YP','.PPPP.',
  ], 8, 9);
  const ICON_DIVINE_HAMMER = paintI([
    '.YYYYYY.','Y9P88P9Y','Y98YY89Y','Y9YPPY9Y','Y98YY89Y','Y9P88P9Y','.YYYYYY.','...bb...','...cc...',
  ], 8, 7);
  const ICON_HOLY_LANCE = paintI([
    'bbbbbbbb6YYP','bbbbbbbbb6YY','bbbbbbbb6YYP',
  ], 6, 10);
  const ICON_CLEAVER = paintI([
    '666666c.','65555Pc.','65PP5Pc.','65555Pc.','666666c.','....bb..','....cc..',
  ], 8, 8);
  const ICON_CHAIN_FLAIL = paintI([
    '...kkkk.','..kRkkRk','..kkRRkk','..kRkkRk','...kkkk.','....k...','...k....','..k.....','.b......',
  ], 8, 7);
  const ICON_THROW_AXES = paintI([
    '.666.66.','66c6cc66','c.c.cc.c','c..cc..c','66c66c66','.666666.',
  ], 8, 9);
  const ICON_FROST_BOLT = paintI([
    'WWPPPP....','WIIIWWPPP.','WIIIIWWWPP','WIIIWWPPPP','WWPPPP....',
  ], 7, 9);
  const ICON_VOID_SPHERE = paintI([
    '..ppmmpp..','.pmMMMMmp.','pmMpMMpMmp','mMM00MMMM.','mMM00MMMM.','pmMpMMpMmp','.pmMMMMmp.','..ppmmpp..',
  ], 7, 8);
  const ICON_ARCANE_MISSILE = paintI([
    '...P...','..PMP..','.PMqMP.','PMqPqMP','.PMqMP.','..PMP..','...P...',
  ], 8, 8);
  const ICON_CROSSBOW_BOLT = paintI([
    'hhccccccccPP','hcccccccccPP','hhccccccccPP',
  ], 6, 10);
  const ICON_SNARE_TRAP = paintI([
    '...cccc..','.cccbbccc','ccb6666bc','cb6P66P6b','cb6cccP6b','cb6P66P6b','ccb6666bc','.cccbbccc',
  ], 7, 8);
  const ICON_HUNTING_HAWK = paintI([
    '.bbbb...','b6bbbb..','b7RR7bb.','b71017b.','b7777b..','b9b9b...',
  ], 8, 9);
  const ICON_HEAL_BEAM = paintI([
    'YGhGhGhGhGhYY','YhGhGhGhGhGYP','YGhGhGhGhGhYY',
  ], 6, 10);
  const ICON_SMITE = paintI([
    '..P..','..PYP','.PYYP','.PY9P','.PY9P','.PY9P','.PYYP','..PYP','...P.',
  ], 9, 7);
  const ICON_SANCTUARY = paintI([
    '..YYY..','.PPPYPPP','PhhGhhP.','PhGYGhP.','PGYYYGP.','PhGYGhP.','PhhGhhP.','.PPYPPP.','..YYY...',
  ], 7, 7);

  Object.assign(window.SPRITES, {
    // Knight themed
    proj_shield_throw:    [SHIELD_THROW_A, SHIELD_THROW_B],
    proj_divine_hammer:   [DIVINE_HAMMER_A, DIVINE_HAMMER_B],
    proj_holy_lance:      [HOLY_LANCE_A, HOLY_LANCE_B],
    icon_shield_throw:    [ICON_SHIELD_THROW],
    icon_divine_hammer:   [ICON_DIVINE_HAMMER],
    icon_holy_lance:      [ICON_HOLY_LANCE],
    // Warrior themed
    proj_cleaver:         [CLEAVER_A, CLEAVER_B],
    proj_chain_flail:     [CHAIN_FLAIL_A, CHAIN_FLAIL_B],
    proj_throw_axes:      [THROW_AXES_A, THROW_AXES_B],
    icon_cleaver:         [ICON_CLEAVER],
    icon_chain_flail:     [ICON_CHAIN_FLAIL],
    icon_throw_axes:      [ICON_THROW_AXES],
    // Mage themed
    proj_frost_bolt:      [FROST_BOLT_A, FROST_BOLT_B],
    proj_void_sphere:     [VOID_SPHERE_A, VOID_SPHERE_B],
    proj_arcane_missile:  [ARCANE_MISSILE_A, ARCANE_MISSILE_B],
    icon_frost_bolt:      [ICON_FROST_BOLT],
    icon_void_sphere:     [ICON_VOID_SPHERE],
    icon_arcane_missile:  [ICON_ARCANE_MISSILE],
    // Huntress themed
    proj_crossbow_bolt:   [CROSSBOW_BOLT_A, CROSSBOW_BOLT_B],
    proj_snare_trap:      [SNARE_TRAP_A, SNARE_TRAP_B],
    proj_hunting_hawk:    [HUNTING_HAWK_A, HUNTING_HAWK_B],
    icon_crossbow_bolt:   [ICON_CROSSBOW_BOLT],
    icon_snare_trap:      [ICON_SNARE_TRAP],
    icon_hunting_hawk:    [ICON_HUNTING_HAWK],
    // Cleric themed
    proj_heal_beam:       [HEAL_BEAM_A, HEAL_BEAM_B],
    proj_smite:           [SMITE_A, SMITE_B],
    proj_sanctuary:       [SANCTUARY_A, SANCTUARY_B],
    icon_heal_beam:       [ICON_HEAL_BEAM],
    icon_smite:           [ICON_SMITE],
    icon_sanctuary:       [ICON_SANCTUARY],
  });

  // ============================================================
  // NEW EFFECTS — 5 new action visuals
  // ============================================================
  // 1. fx_smite_strike — vertical pillar of light, 12×24, 3 frames
  function smiteCol(intensity) {
    const W = 12, H = 24;
    const g = Array.from({ length: H }, () => Array(W).fill('.'));
    for (let y = 0; y < H; y++) {
      for (let x = 4; x <= 7; x++) {
        const d = Math.abs(x - 5.5);
        const t = y / H;
        if (intensity === 0) {
          if (d < 0.7 && t > 0.2) g[y][x] = 'P';
          else if (d < 1.7 && t > 0.3) g[y][x] = 'Y';
        } else if (intensity === 1) {
          if (d < 1.2) g[y][x] = 'P';
          else if (d < 2.2) g[y][x] = 'Y';
          else if (d < 3.2) g[y][x] = '9';
        } else {
          if (d < 0.7) g[y][x] = 'P';
          else if (d < 1.5) g[y][x] = 'Y';
        }
      }
    }
    // Impact circle at bottom
    if (intensity >= 1) {
      const cy = H - 3, cx = 5.5;
      for (let y = cy - 2; y <= cy + 1; y++) for (let x = 0; x < W; x++) {
        const dx = x - cx;
        const dr = Math.sqrt(dx * dx + (y - cy) * (y - cy) * 2);
        if (dr < 3.5) g[y][x] = intensity === 1 ? 'Y' : '9';
        else if (dr < 5) g[y][x] = '8';
      }
    }
    return g.map((r) => r.join(''));
  }
  const FX_SMITE_1 = smiteCol(0);
  const FX_SMITE_2 = smiteCol(1);
  const FX_SMITE_3 = smiteCol(2);

  // 2. fx_void_pull — collapsing purple swirl, 16×16, 4 frames
  function voidPull(phase) {
    const W = 16, C = 7.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const dx = x - C, dy = y - C;
      const d = Math.sqrt(dx * dx + dy * dy);
      const ang = Math.atan2(dy, dx) + phase;
      if (d < 1.5) g[y][x] = '0';
      else if (d < 3) g[y][x] = 'p';
      else if (d > 6 && d < 7.5) {
        // swirl band
        const s = Math.sin(ang * 3 + d * 0.5);
        if (s > 0.5) g[y][x] = 'M';
        else if (s > 0) g[y][x] = 'm';
      }
    }
    return g.map((r) => r.join(''));
  }
  const FX_VOID_PULL_1 = voidPull(0);
  const FX_VOID_PULL_2 = voidPull(1.6);
  const FX_VOID_PULL_3 = voidPull(3.2);
  const FX_VOID_PULL_4 = voidPull(4.8);

  // 3. fx_snare_zone — pulsing circular trap mark, 16×16, 4 frames
  function snareZone(pulse) {
    const W = 16, C = 7.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - C) ** 2 + (y - C) ** 2);
      if (d > 6.5) continue;
      if (Math.abs(d - 6) < 0.6) g[y][x] = pulse % 2 ? 'P' : 'h';
      else if (Math.abs(d - 4) < 0.6) g[y][x] = pulse % 2 ? 'h' : 'G';
      else if (d < 2) g[y][x] = 'G';
    }
    return g.map((r) => r.join(''));
  }
  const FX_SNARE_ZONE_1 = snareZone(0);
  const FX_SNARE_ZONE_2 = snareZone(1);
  const FX_SNARE_ZONE_3 = snareZone(2);
  const FX_SNARE_ZONE_4 = snareZone(3);

  // 4. fx_heal_zone — green sanctuary cross with pulses, 16×16
  function healZone(phase) {
    const W = 16, C = 7.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - C) ** 2 + (y - C) ** 2);
      const r = 6 + Math.sin(phase) * 0.6;
      if (Math.abs(d - r) < 0.7) g[y][x] = 'h';
      else if (d < r - 1 && d > r - 2) g[y][x] = 'G';
    }
    // Central plus
    for (let i = -2; i <= 2; i++) {
      g[7 + i][7] = 'h'; g[7 + i][8] = 'h';
      g[7][7 + i] = 'h'; g[8][7 + i] = 'h';
    }
    g[7][7] = 'P'; g[8][8] = 'P'; g[7][8] = 'P'; g[8][7] = 'P';
    return g.map((r) => r.join(''));
  }
  const FX_HEAL_ZONE_1 = healZone(0);
  const FX_HEAL_ZONE_2 = healZone(1.5);
  const FX_HEAL_ZONE_3 = healZone(3.0);
  const FX_HEAL_ZONE_4 = healZone(4.5);

  // 5. fx_war_drum — radial knockback shockwave, 16×16, 3 frames
  function warDrum(rad) {
    const W = 16, C = 7.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - C) ** 2 + (y - C) ** 2);
      if (Math.abs(d - rad) < 0.6) g[y][x] = 'R';
      else if (Math.abs(d - rad) < 1.2) g[y][x] = 'r';
    }
    return g.map((r) => r.join(''));
  }
  const FX_WAR_DRUM_1 = warDrum(2);
  const FX_WAR_DRUM_2 = warDrum(4.5);
  const FX_WAR_DRUM_3 = warDrum(7);

  Object.assign(window.SPRITES, {
    fx_smite_strike:  [FX_SMITE_1, FX_SMITE_2, FX_SMITE_3],
    fx_void_pull:     [FX_VOID_PULL_1, FX_VOID_PULL_2, FX_VOID_PULL_3, FX_VOID_PULL_4],
    fx_snare_zone:    [FX_SNARE_ZONE_1, FX_SNARE_ZONE_2, FX_SNARE_ZONE_3, FX_SNARE_ZONE_4],
    fx_heal_zone:     [FX_HEAL_ZONE_1, FX_HEAL_ZONE_2, FX_HEAL_ZONE_3, FX_HEAL_ZONE_4],
    fx_war_drum:      [FX_WAR_DRUM_1, FX_WAR_DRUM_2, FX_WAR_DRUM_3],
  });

  // Sprite groups
  window.SPRITE_GROUPS.push({
    title: 'Hero-Themed Weapons',
    items: ['proj_shield_throw','proj_divine_hammer','proj_holy_lance',
            'proj_cleaver','proj_chain_flail','proj_throw_axes',
            'proj_frost_bolt','proj_void_sphere','proj_arcane_missile',
            'proj_crossbow_bolt','proj_snare_trap','proj_hunting_hawk',
            'proj_heal_beam','proj_smite','proj_sanctuary'],
  });
  window.SPRITE_GROUPS.push({
    title: 'UI Icons · Hero Themed',
    items: ['icon_shield_throw','icon_divine_hammer','icon_holy_lance',
            'icon_cleaver','icon_chain_flail','icon_throw_axes',
            'icon_frost_bolt','icon_void_sphere','icon_arcane_missile',
            'icon_crossbow_bolt','icon_snare_trap','icon_hunting_hawk',
            'icon_heal_beam','icon_smite','icon_sanctuary'],
  });
  window.SPRITE_GROUPS.push({
    title: 'New Action FX',
    items: ['fx_smite_strike', 'fx_void_pull', 'fx_snare_zone', 'fx_heal_zone', 'fx_war_drum'],
  });

  // Add to sprite groups
  window.SPRITE_GROUPS.push({
    title: 'Character-Exclusive Weapons',
    items: ['proj_vanguard_sword', 'proj_warhammer', 'proj_astral_staff', 'proj_hunters_bow', 'proj_holy_censer'],
  });
  window.SPRITE_GROUPS.push({
    title: 'UI Icons · Exclusive',
    items: ['icon_vanguard', 'icon_warhammer', 'icon_astral_staff', 'icon_hunters_bow', 'icon_holy_censer'],
  });
})();

