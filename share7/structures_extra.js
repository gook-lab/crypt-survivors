// Structures expansion — bridge variants, gate variants, altar variants,
// checkerboard floor, interactive breakables. Each registered with HD where
// applicable.

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }

  // ============================================================
  // BRIDGE VARIANTS
  // ============================================================
  // Wooden bridge — 24×16, planked walk over chasm
  const PROP_BRIDGE_WOOD = pad([
    '........................',
    '1bbbbbbbbbbbbbbbbbbbbbbb1',
    '1ccacacacacacacacacacac1',  // planks
    '1cbcbcbcbcbcbcbcbcbcbcb1',
    '1ccacacacacacacacacacac1',
    '1cbcbcbcbcbcbcbcbcbcbcb1',
    '1bbbbbbbbbbbbbbbbbbbbbb1',
    '..1c1.1c1.1c1.1c1.1c1...',  // support beams
    '...1c1.1c1.1c1.1c1......',
    '....1c1.1c1.1c1.........',
    '..0000.0000.0000.0000...',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
  ], 24);
  const PROP_BRIDGE_WOOD_HD = pad([
    '........................',
    '1cccccccccccccccccccccc1',
    '1ccacac7caca7cacacaca7c1',  // highlights on planks
    '1cbcbcbcbcbcbcbcbcbcbcb1',
    '1ccacac7cacacacac7acacc1',
    '1cbcbcbcbcbcbcbcbcbcbcb1',
    '1bbbbbbbbbbbbbbbbbbbbbb1',
    '..1c1.1c1.1c1.1c1.1c1...',
    '...1b1.1b1.1b1.1b1......',
    '....1b1.1b1.1b1.........',
    '..0000.0000.0000.0000...',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
  ], 24);

  // Broken bridge (gap in middle) — 24×16
  const PROP_BRIDGE_BROKEN = pad([
    '........................',
    '14555441........144555541',  // jagged edges
    '14555541..........4555541',
    '14555541..........4555541',
    '14555541..........4555541',
    '14555541..........4555541',
    '13333331..........3333331',
    '13333331..........3333331',
    '0000000............00000.',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
  ], 24);
  const PROP_BRIDGE_BROKEN_HD = pad([
    '........................',
    '14566441........144666541',
    '14555541..........4555541',
    '14545541..........4555541',
    '14555441..........4544541',
    '14555541..........4555541',
    '13333331..........3333331',
    '13333331..........3333331',
    '0000000............00000.',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
    '........................',
  ], 24);

  // Rope bridge — 24×16, swaying suspension type
  const PROP_BRIDGE_ROPE = pad([
    '........................',
    '1c......................',  // upper rope post
    '.1c....................1c',
    '..1c.................1c..',
    '...1ccccccccccccccccc....',  // top guide rope
    '..1bcbcbcbcbcbcbcbcbc1...',  // tied planks
    '..1bcbcbcbcbcbcbcbcbc1...',
    '..1bcbcbcbcbcbcbcbcbc1...',
    '..1bcbcbcbcbcbcbcbcbc1...',
    '...1ccccccccccccccccc....',  // bottom rope
    '..1c.................1c..',
    '.1c....................1c',
    '1c......................',
    '........................',
    '........................',
    '........................',
  ], 24);
  const PROP_BRIDGE_ROPE_HD = pad([
    '........................',
    '1c......................',
    '.1c....................1c',
    '..1c.................1c..',
    '...17ccccccccccccccc7....',
    '..1bbbcbbcbcbbcbcbbcb1...',  // wood grain
    '..1bcbcbcbcbcbcbcbcbc1...',
    '..1bcbcbcbcbcbcbcbcbc1...',
    '..1bbbcbbcbcbbcbcbbcb1...',
    '...17ccccccccccccccc7....',
    '..1c.................1c..',
    '.1c....................1c',
    '1c......................',
    '........................',
    '........................',
    '........................',
  ], 24);

  // ============================================================
  // GATE VARIANTS
  // ============================================================
  // Iron portcullis — 24×24
  const PROP_GATE_IRON = pad([
    '........................',
    '14kkkkkkkkkkkkkkkkkkkk41',  // top bar
    '14kkkkkkkkkkkkkkkkkkkk41',
    '141k1k1k1k1k1k1k1k1k1k41',  // vertical bars
    '14.k.k.k.k.k.k.k.k.k.k.1',
    '14.k.k.k.k.k.k.k.k.k.k.1',
    '141k1k1k1k1k1k1k1k1k1k41',
    '14.k.k.k.k.k.k.k.k.k.k.1',
    '14.k.k.k.k.k.k.k.k.k.k.1',
    '141k1k1k1k1k1k1k1k1k1k41',
    '14.k.k.k.k.k.k.k.k.k.k.1',
    '14.k.k.k.k.k.k.k.k.k.k.1',
    '141k1k1k1k1k1k1k1k1k1k41',
    '14.k.k.k.k.k.k.k.k.k.k.1',
    '14.k.k.k.k.k.k.k.k.k.k.1',
    '141k1k1k1k1k1k1k1k1k1k41',
    '14.k.k.k.k.k.k.k.k.k.k.1',
    '14.k.k.k.k.k.k.k.k.k.k.1',
    '141k1k1k1k1k1k1k1k1k1k41',
    '14kkkkkkkkkkkkkkkkkkkk41',
    '14kkkkkkkkkkkkkkkkkkkk41',
    '14ssvvssvvssvvssvvssvv41',  // spike tips
    '.000000000000000000000.0',
    '........................',
  ], 24);
  const PROP_GATE_IRON_HD = pad([
    '........................',
    '14kkkkkPkkkkkPkkkkPkkk41',
    '14kkkPkkkkPkkkkPkkkkkk41',
    '141k1k1k1k1k1k1k1k1k1k41',
    '14ikikikikikikikikikiki1',  // mid tone
    '14ikikikikikikikikikiki1',
    '141k1k1k1k1k1k1k1k1k1k41',
    '14ikikikikikikikikikiki1',
    '14ikikikikikikikikikiki1',
    '141k1k1k1k1k1k1k1k1k1k41',
    '14ikikikikikikikikikiki1',
    '14ikikikikikikikikikiki1',
    '141k1k1k1k1k1k1k1k1k1k41',
    '14ikikikikikikikikikiki1',
    '14ikikikikikikikikikiki1',
    '141k1k1k1k1k1k1k1k1k1k41',
    '14ikikikikikikikikikiki1',
    '14ikikikikikikikikikiki1',
    '141k1k1k1k1k1k1k1k1k1k41',
    '14kkkkkkkkkkkkkkkkkkkk41',
    '14kkkkkkPkkkkkkkPkkkkk41',
    '14ssvvssvvssvvssvvssvv41',
    '.000000000000000000000.0',
    '........................',
  ], 24);

  // Open gate (raised) — 24×24, wooden gate raised showing entry
  const PROP_GATE_OPEN = pad([
    '........................',
    '14444444444444444444441.',
    '14ababababababababab441.',
    '1abbbbbbbbbbbbbbbbbbb41.',
    '1abkkkkkkkkkkkkkkkkkb41.',  // raised gate (compressed)
    '1abbbbbbbbbbbbbbbbbbb41.',
    '14ababababababababab441.',
    '14444444444444444444441.',
    '14.000000000000000000.41',  // open passage
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '00000000000000000000000.',
  ], 24);
  const PROP_GATE_OPEN_HD = pad([
    '........................',
    '14444454444454444454441.',
    '14ababababababababab441.',
    '1abcbbcbbcbbcbbcbbcbb41.',
    '1abkkkPkkkkkPkkkkkkPkb41',
    '1abbcbcbcbcbcbbcbcbbcb41',
    '14ababababababababab441.',
    '14444454444454444454441.',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '14.000000000000000000.41',
    '00000000000000000000000.',
  ], 24);

  // ============================================================
  // ALTAR VARIANTS
  // ============================================================
  // Holy altar — 16×16 white stone with gold cross
  const PROP_ALTAR_HOLY = pad([
    '................',
    '......1YY1......',
    '.....1Y89Y1.....',  // cross top
    '.....1Y89Y1.....',
    '....1Y9889Y1....',  // cross arms
    '....1Y9PP9Y1....',
    '....1YY99YY1....',
    '....1Y9889Y1....',
    '....1Y9889Y1....',
    '....1Y9889Y1....',
    '..14777777771...',  // pristine top
    '..14555555541...',
    '..14555555541...',
    '..13333333331...',
    '..14444444441...',
    '..00000000000...',
  ], 16);
  const PROP_ALTAR_HOLY_HD = pad([
    '................',
    '......1YY1......',
    '.....1Y89Y1.....',
    '.....1YP9Y1.....',  // spec
    '....1Y9889Y1....',
    '....1YPP99Y1....',
    '....1YY99YY1....',
    '....1Y9889Y1....',
    '....1Y9P89Y1....',
    '....1Y9889Y1....',
    '..147777777741..',
    '..1455555555P41.',  // top corner highlight
    '..14555555555541',
    '..13333333333341',
    '..14444444444441',
    '..00000000000...',
  ], 16);

  // Sacrificial altar — 16×16 bloodstained dark stone
  const PROP_ALTAR_BLOOD = pad([
    '................',
    '.....rrrrrr.....',  // blood pool top
    '....rRRRRRRr....',
    '....rR0PP0Rr....',  // chains/knife
    '....rRRRRRRr....',
    '....rRRRRRRr....',
    '....RrRRRRrR....',
    '...4RRRRRRRR4...',
    '..14RRRRRRRR41..',  // dripping
    '..14R3RRRRR341..',
    '..14333333341r..',  // stone base
    '..14333333341...',
    '..r4444444441..r',
    '..1333333333331.',
    '..r1444444441..r',
    '..r0000000000.r.',
  ], 16);
  const PROP_ALTAR_BLOOD_HD = pad([
    '................',
    '.....rRRrrR.....',
    '....rRPRRRPr....',
    '....rR0PP0Rr....',
    '....rRPRRRPr....',
    '....rRRRPRRr....',
    '....RrRRRrrR....',
    '...4rRRRRRRR4...',
    '..14RRRRPRRRR1..',
    '..14RrRPRRRRr1..',
    '..14333333344r..',
    '..14333343334...',
    '..r4444444441..r',
    '..1333333333331.',
    '..r1444444441..r',
    '..r0000000000.r.',
  ], 16);

  // Arcane altar — 16×16 purple crystal with floating runes
  const PROP_ALTAR_ARCANE_A = pad([
    '................',
    '......1qq1......',
    '.....1qMMq1.....',  // crystal top
    '....1qMMMMq1....',
    '....1MPMMP1.....',  // rune marks
    '....1qMpMMq1....',
    '....1MMpMMM1....',
    '....1qMMMMq1....',
    '....1qMMMMq1....',
    '...144444441....',  // pedestal
    '..14555555541...',
    '..1Mp.MM.pM1....',  // floating runes
    '..14555555541...',
    '..13333333331...',
    '..14444444441...',
    '..00000000000...',
  ], 16);
  const PROP_ALTAR_ARCANE_B = pad([
    '................',
    '.....1qPMq1.....',  // pulse
    '....1qMMMMq1....',
    '....1qMPMMq1....',
    '....1qPMMPMq....',
    '....1qMPMMMq....',
    '....1qMMPMMM....',
    '....1qMMMMq1....',
    '....1qMMMMq1....',
    '...144444441....',
    '..14555555541...',
    '..1pM.qq.Mp1....',  // runes drift
    '..14555555541...',
    '..13333333331...',
    '..14444444441...',
    '..00000000000...',
  ], 16);

  // Nature altar — 16×16 mossy stone with leaves
  const PROP_ALTAR_NATURE = pad([
    '................',
    '......hghh......',
    '.....ghGhhhg....',  // leaves
    '....hGhGGhGhg...',
    '....1hGGhGhh1...',
    '...14hhGhhhh1...',
    '...14hhGhgh541..',
    '..14h5gGhh4541..',
    '..145Gh5hhh5541.',  // mossy stone
    '..145hh555gh541.',
    '..145555hh55541.',
    '..14555555gh541.',
    '..13335hh333341.',  // moss creeps down
    '..14444gh444441.',
    '..133333hh33331.',
    '..0000000000000.',
  ], 16);
  const PROP_ALTAR_NATURE_HD = pad([
    '................',
    '......hghhP.....',
    '.....ghGhhhg....',
    '....hGPGGhGhg...',
    '....1hGGhGhh1...',
    '...14hhGhhhh1...',
    '...14hhGhgh541..',
    '..14h5gGhhP541..',
    '..145Gh5hhh5541.',
    '..145hh555gh541.',
    '..145555hh55541.',
    '..14555555gh541.',
    '..13335hh333341.',
    '..14444gh444441.',
    '..133333hh33331.',
    '..0000000000000.',
  ], 16);

  // ============================================================
  // INTERACTIVE BREAKABLES
  // ============================================================
  // Pottery jar — 14×16, breakable, drops gold
  const PROP_JAR_INTACT = pad([
    '..............',
    '....1cccc1....',
    '....1c11c1....',  // top lip
    '....1cccc1....',
    '...1ccccccc1..',
    '..1cccccccc1..',
    '..1cabbbabc1..',  // pottery body
    '..1cbabbbac1..',
    '..1cabbbbbc1..',
    '..1cbabbbac1..',
    '..1cabbbabc1..',
    '..1cbabbbac1..',
    '..1cbbbbbbc1..',
    '..1ccccccc1...',
    '..1bbbbbbbb1..',  // base
    '..00000000000.',
  ], 14);
  const PROP_JAR_INTACT_HD = pad([
    '..............',
    '....1ccccc1...',
    '....1cP11c1...',  // ceramic spec
    '....1ccccc1...',
    '...1cccPcccc1.',
    '..1ccccccccc1.',
    '..1cabPbbabc1.',
    '..1cbabbbbac1.',
    '..1cabbPbabc1.',
    '..1cbabbbbac1.',
    '..1cabbPbabc1.',
    '..1cbabbbbac1.',
    '..1cbbbbbbbc1.',
    '..1ccccccccc1.',
    '..1bbbbbbbbb1.',
    '..00000000000.',
  ], 14);
  // Broken jar (after hit) — shards + ground
  const PROP_JAR_BROKEN = pad([
    '..............',
    '..............',
    '..............',
    '...1c.........',  // upper shards flying
    '....cc...c....',
    '.....c..1c....',
    '.....cc.cc....',
    '......c.c.....',
    '..............',
    '..1c..........',
    '...c..........',
    '....cc..ccccc.',  // bottom shards on ground
    '..1ccccccccc1.',
    '..1abbb..babc.',
    '..1cccccccc1..',
    '..00000000000.',
  ], 14);

  // Barrel — 14×16, breakable wooden barrel
  const PROP_BARREL_INTACT = pad([
    '..............',
    '..1bbbbbbbb1..',
    '..1cabbbbac1..',
    '..1bababbab1..',
    '..1kkkkkkkk1..',  // metal band
    '..1bababbab1..',
    '..1bababbab1..',
    '..1bababbab1..',
    '..1bababbab1..',
    '..1kkkkkkkk1..',  // band
    '..1bababbab1..',
    '..1bababbab1..',
    '..1bababbab1..',
    '..1cabbbbac1..',
    '..1bbbbbbbb1..',
    '..00000000000.',
  ], 14);
  const PROP_BARREL_INTACT_HD = pad([
    '..............',
    '..1bbcccccbb1.',
    '..1cabbcbbac1.',
    '..1babPbbbab1.',
    '..1kkkPkkkkk1.',
    '..1bababPbab1.',
    '..1bababbab71.',  // wood highlight
    '..1bababbab71.',
    '..1babPbbbab1.',
    '..1kkkkPkkkk1.',
    '..1bababbab71.',
    '..1bababbab71.',
    '..1bababbab71.',
    '..1cabbcbbac1.',
    '..1bbbcccbbb1.',
    '..00000000000.',
  ], 14);
  const PROP_BARREL_BROKEN = pad([
    '..............',
    '..............',
    '....bb...bb...',
    '...1b.....b1..',  // splintered top
    '...kkkkkkkkk..',  // band on ground
    '...1.babba.1..',
    '...1.babba.1..',
    '...kkkkkkkkk..',
    '...1cccccccc1.',
    '..1bbbbbbbbbb.',  // staves scattered
    '..b1c......c1.',
    '..bcabbbabac1.',
    '..1cbabbbbac1.',
    '..1cabbbabbc1.',
    '..1cccccccccc.',
    '..00000000000.',
  ], 14);

  // Wooden crate — 14×14, breakable
  const PROP_CRATE_INTACT = pad([
    '..............',
    '.1bbbbbbbbbb1.',
    '.1cabababab1..',
    '.1cabababab1..',
    '.1cbabababbc1.',
    '.1cbabababbc1.',
    '.1cbabababbc1.',
    '.1cbabababbc1.',
    '.1cbabababbc1.',
    '.1cbabababbc1.',
    '.1cbabababbc1.',
    '.1cabababab1..',
    '.1cabababab1..',
    '.1bbbbbbbbbb1.',
  ], 14);
  const PROP_CRATE_INTACT_HD = pad([
    '..............',
    '.1bbcccccbbb1.',
    '.1cab7abab71..',  // wood grain
    '.1cab7ababP1..',
    '.1cbab7abbbc1.',
    '.1cbabab7abc1.',
    '.1cbababab7c1.',
    '.1cbabPbabbc1.',
    '.1cbabababbc1.',
    '.1cb7abab7bc1.',
    '.1cbabab7bbc1.',
    '.1cab7abab71..',
    '.1cabab7ab71..',
    '.1bbcccccbbb1.',
  ], 14);
  const PROP_CRATE_BROKEN = pad([
    '..............',
    '..............',
    '..............',
    '...c..b.b..b..',  // splintered planks
    '....b..1.bb1..',
    '..............',
    '...bcbab1.....',
    '..1cabaabb1...',
    '...cbbabb1....',
    '...1cabab1c...',
    '..bccbbabb1c..',  // pile on ground
    '..1ccabbabbc1.',
    '..1bbbbbbbb1..',
    '..0000000000..',
  ], 14);

  // ============================================================
  // CHECKERBOARD FLOOR TILE — 16×16, special area
  // ============================================================
  const TILE_CHECKER_A = pad([
    '1111111133333331',
    '1ccccc1133333331',
    '1c777c1133333331',
    '1c7P7c1133333331',
    '1c777c1133333331',
    '1ccccc1133333331',
    '1111111133333331',
    '1111111111111111',
    '3333333111111111',
    '3333333111ccccc1',
    '3333333111c777c1',
    '3333333111c7P7c1',
    '3333333111c777c1',
    '3333333111ccccc1',
    '3333333111111111',
    '1111111111111111',
  ], 16);

  // ============================================================
  // CHURCH ENTRANCE — 32×32, big set-piece structure
  // ============================================================
  const PROP_CHURCH = pad([
    '................................',
    '...............YY...............',  // cross peak
    '..............YPPY..............',
    '..............YPPY..............',
    '...........YYYYPPYYYY...........',
    '..........YYY888889YYYY.........',  // gold cross
    '..........YYY988999YYYY.........',
    '..........YYY889889YYYY.........',
    '..........YYYY9889YYYY..........',
    '..........YYYYY99YYYYY..........',
    '.........14444411114444441......',  // roof line
    '........1455555111111555541.....',
    '.......145555555111155555541....',
    '......1455555555555555555541....',  // building front
    '.....14555555..1...5555555541...',
    '.....14555555..1...5555555541...',
    '.....14555.YY..1..YY..5555541...',  // gold window arches
    '.....14555.YY..1..YY..5555541...',
    '.....14555.YY..1..YY..5555541...',
    '.....14555..0...0...0..5555541..',  // arched door + windows
    '.....14555..0...0...0..5555541..',
    '.....14555..0...0...0..5555541..',
    '.....14555..0...0...0..5555541..',
    '.....14555..0...0...0..5555541..',
    '.....14555..0...0...0..5555541..',
    '.....14555..0...0...0..5555541..',
    '.....14555..0...0...0..5555541..',
    '.....1455550000000000055555541..',  // base
    '.....14444444444444444444444441.',
    '.....13333333333333333333333331.',
    '.....00000000000000000000000000.',
    '................................',
  ], 32);

  // ============================================================
  // Register all
  // ============================================================
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      // Bridges
      prop_bridge_wood:     [PROP_BRIDGE_WOOD],
      prop_bridge_wood_hd:  [PROP_BRIDGE_WOOD_HD],
      prop_bridge_broken:   [PROP_BRIDGE_BROKEN],
      prop_bridge_broken_hd:[PROP_BRIDGE_BROKEN_HD],
      prop_bridge_rope:     [PROP_BRIDGE_ROPE],
      prop_bridge_rope_hd:  [PROP_BRIDGE_ROPE_HD],
      // Gates
      prop_gate_iron:       [PROP_GATE_IRON],
      prop_gate_iron_hd:    [PROP_GATE_IRON_HD],
      prop_gate_open:       [PROP_GATE_OPEN],
      prop_gate_open_hd:    [PROP_GATE_OPEN_HD],
      // Altars
      prop_altar_holy:      [PROP_ALTAR_HOLY],
      prop_altar_holy_hd:   [PROP_ALTAR_HOLY_HD],
      prop_altar_blood:     [PROP_ALTAR_BLOOD],
      prop_altar_blood_hd:  [PROP_ALTAR_BLOOD_HD],
      prop_altar_arcane:    [PROP_ALTAR_ARCANE_A, PROP_ALTAR_ARCANE_B],
      prop_altar_nature:    [PROP_ALTAR_NATURE],
      prop_altar_nature_hd: [PROP_ALTAR_NATURE_HD],
      // Breakables
      prop_jar_intact:      [PROP_JAR_INTACT],
      prop_jar_intact_hd:   [PROP_JAR_INTACT_HD],
      prop_jar_broken:      [PROP_JAR_BROKEN],
      prop_barrel_intact:   [PROP_BARREL_INTACT],
      prop_barrel_intact_hd:[PROP_BARREL_INTACT_HD],
      prop_barrel_broken:   [PROP_BARREL_BROKEN],
      prop_crate_intact:    [PROP_CRATE_INTACT],
      prop_crate_intact_hd: [PROP_CRATE_INTACT_HD],
      prop_crate_broken:    [PROP_CRATE_BROKEN],
      // Floor
      tile_checker:         [TILE_CHECKER_A],
      // Big set-piece
      prop_church:          [PROP_CHURCH],
    });

    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Structures · Bridges',
        items: ['prop_bridge_wood','prop_bridge_broken','prop_bridge_rope'],
      });
      window.SPRITE_GROUPS.push({
        title: 'Structures · Gates',
        items: ['prop_gate_iron','prop_gate_open'],
      });
      window.SPRITE_GROUPS.push({
        title: 'Structures · Altars',
        items: ['prop_altar_holy','prop_altar_blood','prop_altar_arcane','prop_altar_nature'],
      });
      window.SPRITE_GROUPS.push({
        title: 'Structures · Breakables',
        items: ['prop_jar_intact','prop_jar_broken','prop_barrel_intact','prop_barrel_broken','prop_crate_intact','prop_crate_broken'],
      });
      window.SPRITE_GROUPS.push({
        title: 'Structures · Big Set-piece',
        items: ['prop_church','tile_checker'],
      });
    }
  }

  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      prop_altar_arcane: 3,
    });
  }
})();
