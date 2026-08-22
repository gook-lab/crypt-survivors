// World structures — props placed on tiles to give maps personality.
// 16×16 (small), 24×24 (medium), 32×32 (large). Each has HD version with
// multi-tone shading + outline.
//
// Categories:
//   crypt: tombstone, broken pillar, sarcophagus, gargoyle statue, candelabra
//   forest: dead tree, mushroom, fallen log, shrine, stone wall
//   volcano: lava crack, obsidian pillar, bone pile, fire altar
//   ice: ice spike, frozen statue, snow pile, crystal cluster
//   shared: bridge segment, fountain, brazier, banner, well, gate
//
// All structures are static (1 frame) except brazier/fountain/torch which
// have 2-3 frame animations.

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }

  // ============================================================
  // CRYPT BIOME PROPS
  // ============================================================

  // Tombstone — 16×16 weathered stone marker with cross
  const PROP_TOMBSTONE = pad([
    '................',
    '....14444441....',
    '...1455555541...',
    '..145555555541..',
    '.14555555555541.',
    '.14555Y8Y555541.',  // gold cross top
    '.14555888Y55541.',
    '.14555Y9Y855541.',  // cross center
    '.14555Y9Y555541.',
    '.14555555555541.',
    '.14555.0.555541.',  // crack
    '.14555..0.55541.',
    '.14555.0..55541.',
    '.14555555555541.',
    '.1333333333331..',  // base shadow
    '.0000000000000..',
  ], 16);
  const PROP_TOMBSTONE_HD = pad([
    '................',
    '...1444454441...',
    '..145555Y555541.',
    '.14555Y8Y8Y5541.',
    '.1455Y88988Y541.',  // bigger cross
    '.1455P98989P541.',  // spec
    '.1455Y89989Y541.',
    '.1455Y88988Y541.',
    '.14555Y8Y8Y5541.',
    '.14555555555541.',
    '.14555.0..55541.',
    '.14555..00.5541.',  // deeper crack
    '.14555.00..5541.',
    '.14555....5.541.',
    '.13333333333331.',
    '..00000000000...',
  ], 16);

  // Stone pillar (broken) — 16×24 with top cap shattered
  const PROP_PILLAR_BROKEN = pad([
    '................',
    '................',
    '...1455.0.541...',  // jagged top
    '..14554..05541..',
    '.145554..055541.',
    '.145555..555541.',
    '.145555..555541.',  // shaft
    '.145555..555541.',
    '.145555..555541.',
    '.145555..555541.',
    '.145555..555541.',
    '.145555..555541.',
    '.145555..555541.',
    '.145555..555541.',
    '.145555..555541.',
    '.1455555555541..',
    '.14555555555541.',
    '.14333333333331.',  // base
    '.1333333333333..',
    '.0000000000000..',
    '................',
    '................',
    '................',
    '................',
  ], 16);
  const PROP_PILLAR_BROKEN_HD = pad([
    '................',
    '................',
    '...1455605541...',
    '..14556..065541.',
    '.145566..065541.',
    '.145556..555541.',
    '.146565..555641.',  // detail
    '.145556..655541.',
    '.145555..555541.',
    '.145556..566541.',
    '.146555..555541.',
    '.145556..565541.',
    '.145555..555541.',
    '.146555..555641.',
    '.145566..665541.',
    '.1455666666541..',
    '.14566555665541.',
    '.14333333333331.',
    '.13333333333331.',
    '..0000000000000.',
    '................',
    '................',
    '................',
    '................',
  ], 16);

  // Sarcophagus — 24×16 stone coffin
  const PROP_SARCOPHAGUS = pad([
    '........................',
    '.1444444444444444444441..',  // lid
    '14555555555555555555554.1',
    '14555Y8988Y888988Y555541',  // cross detail
    '14555555555555555555554.1',
    '.1444444444444444444441..',
    '14333333333333333333334.1',  // base side
    '14333333333333333333334.1',
    '14333333333333333333334.1',
    '14333333333333333333334.1',
    '14333333333333333333334.1',
    '14333333333333333333334.1',
    '14333333333333333333334.1',
    '14333333333333333333334.1',
    '.1333333333333333333331..',
    '..0000000000000000000....',
  ], 24);
  const PROP_SARCOPHAGUS_HD = pad([
    '........................',
    '.1444444444444444444441..',
    '14555555555555555555554.1',
    '14555Y89889Y8989YY555541',
    '14555Y9988YP988889Y55541',  // bright spec
    '14555555555555555555554.1',
    '.1444444444444444444441..',
    '143333555555555555533331.',  // top edge highlight
    '143333344444433344333331.',
    '143333344rr444334434333.1',  // bloodstain
    '143333344rrr44344334331..',
    '143333333344443343433331.',
    '143333343334443334333331.',
    '143333334344433443333331.',
    '.1333333333333333333331..',
    '..0000000000000000000....',
  ], 24);

  // Gargoyle statue — 24×24 winged stone demon
  const PROP_GARGOYLE = pad([
    '........................',
    '........................',
    '.........1445544.........',
    '........144555441........',
    '.......14555..5541.......',  // horns
    '......145555..55541......',
    '.....1455555..555541.....',
    '.....1455510..015541.....',  // eyes pitch
    '.....14555000005541......',
    '.....14555kkkkkk541......',  // teeth
    '....1454555555554541.....',
    '...1454.4555555.4.541....',
    '.144544..55555..44541....',  // wings spread
    '.1454544..555..4454541...',
    '14545454.44444.4454541...',
    '14545554.44.44.4454541...',
    '.1455554..4..44.45541....',
    '..14554...4...4.45441....',  // body
    '...1454...4...4.4541.....',
    '....144...4...4.441......',  // legs
    '....144...4...4.441......',
    '.....14...4...4.41.......',
    '.....14...4...4.41.......',
    '..0000.....0000..........',
  ], 24);
  const PROP_GARGOYLE_HD = pad([
    '........................',
    '........................',
    '.........144554441.......',
    '........14555555541......',
    '.......1456555..5541.....',
    '......14555555..6554.....',
    '.....14555655..655541....',
    '.....1455510..015541.....',
    '.....14555000005541......',
    '.....14555kkkkkk6541.....',
    '....14566555556665541....',
    '...145446555665.46541....',
    '.144544..655556..44541...',
    '.1455444..555..44455541..',
    '14555544.44544.44555541..',
    '14555654.444444.5555541..',
    '.1455554..454..555541....',
    '..14555...4...555441.....',
    '...1455...4...5541.......',
    '....144...4...441........',
    '....144...4...441........',
    '.....14...4...41.........',
    '.....14...4...41.........',
    '..0000.....0000..........',
  ], 24);

  // Candelabra — 8×16 with flame, 2 frames
  const PROP_CANDELABRA_A = pad([
    '........',
    '...f....',
    '..fef...',
    '..feP...',  // flame top
    '..fed...',
    '...da...',  // ember
    '..1881..',  // gold candle
    '..1991..',
    '..1991..',
    '..1991..',
    '..1881..',
    '..1881..',
    '..1aa1..',  // dark stem
    '.144441.',  // base
    '.144441.',
    '13333331',
  ], 8);
  const PROP_CANDELABRA_B = pad([
    '........',
    '....f...',
    '..feff..',  // flame leans
    '..fePf..',
    '..feef..',
    '...dde..',
    '..1881..',
    '..1991..',
    '..1981..',
    '..1991..',
    '..1881..',
    '..1881..',
    '..1aa1..',
    '.144441.',
    '.144441.',
    '13333331',
  ], 8);

  // ============================================================
  // FOREST BIOME PROPS
  // ============================================================

  // Dead tree — 24×32 gnarled trunk + bare branches
  const PROP_DEAD_TREE = pad([
    '........................',
    '...........bb...........',  // top branch
    '...........bb...........',
    '.....bb...1bb1...bb.....',
    '....bbb1.1bbb1.1bbb.....',
    '...bbb..1bbbb1..bbb.....',
    '...bb..11bbbb11..bb.....',
    '....b.1bbbbbbbb1.b......',
    '....1bbbcccccbbbb1......',  // trunk top
    '....1bcccaaaccbbb1......',
    '....1bcccaaaccbbb1......',
    '....1bcccaaaccbbb1......',
    '....1bbccaaacccbb1......',
    '....1bbccaaacccbb1......',
    '....1bbcaaaaaccbb1......',  // dark heartwood
    '....1bbcaaaaccccb1......',
    '....1bbccaaacccbb1......',
    '....1bbccaaacccbb1......',
    '....1bbcccccccbbb1......',
    '....1bbbcccccbbbb1......',
    '....1bbbbbbcbbbbb1......',
    '....1bbbbbbbbbbbb1......',
    '.....1bbbbbbbbbb1.......',
    '.....1bbbbbbbbbb1.......',
    '....1bbbbbbbbbbbb1......',  // roots
    '....b....bbbb....b......',
    '...b.....bbbb.....b.....',
    '..b......bbbb......b....',
    '.0000000000000000000....',
    '........................',
    '........................',
    '........................',
  ], 24);
  const PROP_DEAD_TREE_HD = pad([
    '........................',
    '...........bc...........',
    '...........bb...........',
    '.....bc...1bc1...cb.....',
    '....bcc1.1bcb1.1ccb.....',
    '...bcb..1bccb1..bcb.....',
    '...bb..11bbcb11..bb.....',
    '....b.1bbccbbbbb1.b.....',
    '....1bccccccccbbb1......',  // brighter top
    '....1bcccaaaccbbb1......',
    '....1bcccaaaaccbb1......',
    '....1bcccaPaaccbb1......',  // spec dot
    '....1bbccaaaaccbb1......',
    '....1bbcaaaaaccbb1......',
    '....1bbcaaaaaccbb1......',
    '....1bbcaaaaccccb1......',
    '....1bbccaaaccccb1......',
    '....1bbccaaccccbb1......',
    '....1bbccccccbbbb1......',
    '....1bbbcccccbbbb1......',
    '....1bbbbbccbbbbb1......',
    '....1bbbbbbbbbbbb1......',
    '.....1bbbbbbbbbb1.......',
    '.....1bbbbbbbbbb1.......',
    '....1cbbbbbbbbbbb1......',
    '....c....bbbb....c......',
    '...c.....bbbb.....c.....',
    '..c......bbbb......c....',
    '.0000000000000000000....',
    '........................',
    '........................',
    '........................',
  ], 24);

  // Mushroom (red) — 12×12 toadstool
  const PROP_MUSHROOM = pad([
    '............',
    '....1RR1....',
    '...1RRRRR1..',
    '..1RRPRRPRR1',  // white spots
    '..1RRRRRRRR1',
    '..1RRPRRRPR1',
    '...1RRRRRRR.',
    '...1RrrrrR1.',  // gills
    '....1ccc1...',  // stem
    '....1ccc1...',
    '....1ccc1...',
    '...11111111.',
  ], 12);
  const PROP_MUSHROOM_HD = pad([
    '............',
    '....1RRP1...',
    '...1RRPRRP1.',
    '..1RPPRRPRR1',
    '..1RPRPRRRR1',
    '..1RRPRRPPR1',
    '...1RRRRRRR.',
    '...1RrrrrR1.',
    '....1c7c1...',  // stem highlight
    '....1cc7c1..',
    '....1ccc1...',
    '...111111h1.',  // moss touch
  ], 12);

  // Forest shrine — 24×24 stone arch with offering bowl
  const PROP_FOREST_SHRINE = pad([
    '........................',
    '..........................',
    '....1455555555555541....',  // arch top
    '...145555555555555541...',
    '..1455555555555555541...',
    '.14555555..5555..5541...',
    '14555555....55..555541..',
    '1455555..55..55...55541.',  // arch opening
    '14555555..555..5..55541.',
    '14555555.555.55..555541.',
    '14555555..55..55..55541.',
    '14555..55..55.555.55541.',
    '14555....55..5555.55541.',
    '14555.555.555..55.55541.',
    '14555555.555555.5555541.',
    '14555..5555..555555541..',
    '14555...g.h.h.g...5541..',  // mossy step
    '1455...888YY8888..5541..',  // gold bowl
    '14555..98889988...5541..',  // glow
    '14555..Y99Y89Y8...5541..',
    '14555...8989Y9....5541..',
    '14555....8YY......5541..',
    '.14333333333333333331...',
    '..00000000000000000000..',
  ], 24);
  const PROP_FOREST_SHRINE_HD = pad([
    '........................',
    '..........................',
    '....1455666555665541....',
    '...14556555555556541....',
    '..14556665555556665541..',
    '.14555555..5555..5541...',
    '14555655....55..655541..',
    '1455555..55..55...55541.',
    '14555655..555..5..55541.',
    '14555555.555.55..555541.',
    '14555655..55..55..55541.',
    '14555..55..55.555.55541.',
    '14555....55..5555.55541.',
    '14555.555.555..55.55541.',
    '14555655.555555.5555541.',
    '14555..5556..555556541..',
    '14556..ghhghhg..555541..',
    '1456.8888YYYY8888.5541..',
    '14555.98889P98899.5541..',  // gold spec
    '14555.YPP9889YP89.5541..',
    '14555..89Y9Y8989..5541..',
    '14555...8YPPY8....5541..',
    '.14333333333333333331...',
    '..00000000000000000000..',
  ], 24);

  // Stone wall segment — 24×16 ruined wall
  const PROP_STONE_WALL = pad([
    '........................',
    '..1444411114444..........',
    '14555554455554.1.........',
    '14554554455554.1.........',  // brick pattern
    '14544444555554441........',
    '14555555555555541........',
    '14545454454555541........',  // mortar lines
    '14454544555554541........',
    '14555555555555541........',
    '14555444444555541........',
    '14555544544555541........',
    '14555555555555541........',
    '14333333333333331........',  // base
    '14333333333333331........',
    '1.444333333333.31........',
    '0000000000000000.........',
  ], 24);
  const PROP_STONE_WALL_HD = pad([
    '........................',
    '..1444411114444..........',
    '14566554455556541........',
    '14554554455554541........',
    '14564444555556441........',
    '14555h55555555541........',  // moss patch
    '14545454454555541........',
    '14454544555554541........',
    '14555555555555541........',
    '14555444444555541........',
    '14555544544555541........',
    '14555555555555541........',
    '14333333333333331........',
    '14333343333343331........',
    '13443333333334.31........',
    '0000000000000000.........',
  ], 24);

  // ============================================================
  // VOLCANO BIOME PROPS
  // ============================================================

  // Lava crack — 16×8 ground fissure
  const PROP_LAVA_CRACK = pad([
    '................',
    '..04..04..04....',
    '.044.044.044....',
    '04eefe4ed4ef....',  // glowing lava
    '0eeeeeeeeede....',
    '04ddedeedee4....',
    '.044.0440044....',
    '..04..04.04.....',
  ], 16);
  const PROP_LAVA_CRACK_HD = pad([
    '................',
    '..04..04..04....',
    '.044.044.044....',
    '04PfPfPePfPf....',  // bright lava
    '0fefefPfPfee....',
    '04eedfPedee4....',
    '.0444044f044....',
    '..04..04.04.....',
  ], 16);

  // Obsidian pillar — 16×24 dark crystal pillar
  const PROP_OBSIDIAN_PILLAR = pad([
    '................',
    '....1110001.....',
    '...1k00000k1....',
    '..1k0000000k1...',  // top facet
    '..1k00r000k1....',  // ember pulse inside
    '.1kk000000kk1...',
    '.1k000000000k1..',
    '.1k000000000k1..',
    '.1k0000r0000k1..',
    '.1k000000000k1..',
    '.1k000000000k1..',
    '.1k000000000k1..',
    '.1k000000000k1..',
    '.1k00r0000r0k1..',
    '.1k000000000k1..',
    '.1k000000000k1..',
    '.1k000000000k1..',
    '.1kk0000000kk1..',
    '.1.kkkkkkkkk.1..',
    '.144444444441...',  // base
    '13333333333331..',
    '0000000000000...',
    '................',
    '................',
  ], 16);
  const PROP_OBSIDIAN_PILLAR_HD = pad([
    '................',
    '....1110001.....',
    '...1k0P000k1....',
    '..1k00P0000k1...',  // bright facet
    '..1k00r000Pk1...',
    '.1kkP00000kk1...',
    '.1k000P00000k1..',
    '.1k0P000000k01..',
    '.1k0000r0000k1..',
    '.1k0000P0000k1..',
    '.1k00000P000k1..',
    '.1k000000000k1..',
    '.1k0P00r0000k1..',
    '.1k00R0000r0k1..',  // brighter ember
    '.1k000000P00k1..',
    '.1k0000P0000k1..',
    '.1k000000000k1..',
    '.1kk0000000kk1..',
    '.1.kkkkkkkkk.1..',
    '.144444444441...',
    '13333333333331..',
    '0000000000000...',
    '................',
    '................',
  ], 16);

  // Fire altar — 16×16 with flame, 2 frames
  const PROP_FIRE_ALTAR_A = pad([
    '................',
    '......1f1.......',
    '.....1fff1......',
    '....1feeef1.....',  // flame
    '....1fePef1.....',
    '....1feeef1.....',
    '....1fddef1.....',
    '.....1ddd1......',
    '.1444444444441..',  // altar top
    '143333333333331.',
    '143YY999999YY31.',  // gold trim
    '143333333333331.',
    '14444444444441..',
    '143333333333331.',
    '14444444444441..',
    '.0000000000000..',
  ], 16);
  const PROP_FIRE_ALTAR_B = pad([
    '................',
    '......1f1.......',
    '.....1fef1......',
    '....1feefP1.....',
    '....1fePeef1....',  // bigger flame
    '....1fdeeed1....',
    '....1ddeedd1....',
    '.....1ddd1......',
    '.1444444444441..',
    '143333333333331.',
    '143YPY9P9PYP931.',  // animated trim
    '143333333333331.',
    '14444444444441..',
    '143333333333331.',
    '14444444444441..',
    '.0000000000000..',
  ], 16);

  // Bone pile — 16×12 stacked skeletal remains
  const PROP_BONE_PILE = pad([
    '................',
    '......1666.16.6.',  // skull
    '.....16770661...',
    '.....167700661..',  // eye sockets
    '.....1677776617.',
    '.6.6116771166.16',
    '67.66.166...6.6.',
    '6766..666...666.',
    '67667.67767.6..6',
    '6.7666666666666.',
    '6.6.6.6.6.6.6.6.',  // scattered ribs
    '0000000000000000',
  ], 16);
  const PROP_BONE_PILE_HD = pad([
    '................',
    '......1666.16.6.',
    '.....167770661..',
    '.....177700771..',
    '.....1677776671.',
    '.6.6116771166.16',
    '67.66.166...6.6.',
    '67667.66666.666.',
    '67767.677767.6.6',
    '6.7666P66666666.',  // spec dot
    '6.6.6.6.6.6.6.6.',
    '0000000000000000',
  ], 16);

  // ============================================================
  // ICE BIOME PROPS
  // ============================================================

  // Ice spike — 12×20 jagged frozen blade
  const PROP_ICE_SPIKE = pad([
    '............',
    '......1.....',
    '.....1W1....',
    '....1WIW1...',
    '....1IWI1...',
    '....1WIIW1..',  // tapered tip
    '...1WIIWWI1.',
    '...1IWWIIW1.',
    '...1WIIWWII1',
    '...1IWWPIWI1',  // bright facet
    '...1WIIWIIW1',
    '...1IWWIWWI1',
    '...1WIIWWII1',
    '...1IWWIIWI1',
    '...1WIIWWIWI',
    '...1IWWIIWWI',
    '...1WIIWWIWI',
    '...1IIWWIWWI',
    '...1WWIIWWWI',
    '...kkkkkkkk1',  // dark base
  ], 12);
  const PROP_ICE_SPIKE_HD = pad([
    '............',
    '......P.....',
    '.....1WP....',
    '....1WIWP...',
    '....1IWIP...',
    '....1WIIWP..',
    '...1WIIWWIP.',
    '...1IPWIIWP.',
    '...1WIIPWII1',
    '...1IWWPWWI1',
    '...1WIIWIIW1',
    '...1IWWPWWI1',
    '...1WIIPIWII',
    '...1IWWIIWI1',
    '...1WIIWWIWI',
    '...1IWWIIWWI',
    '...1WIIWWPWI',
    '...1IIWPIWWI',
    '...1WWIIWPWI',
    '...kkkkkkkk1',
  ], 12);

  // Frozen statue (knight encased) — 16×24
  const PROP_FROZEN_STATUE = pad([
    '................',
    '.....1IIII1.....',  // ice shell top
    '....1IWWWWI1....',
    '...1IW3333WI1...',
    '...1IW3553WI1...',  // helmet inside
    '...1IW3113WI1...',  // pitch eye slit
    '...1IW3553WI1...',
    '...1IW3333WI1....',
    '..1IWW3333WWI1...',
    '..1IW33449333WI1.',  // shoulder + gold
    '..1IW3494444933W.',
    '..1IW39494P494W1.',  // cross
    '..1IW34444444W1..',
    '..1IW33333333WI1.',
    '..1IWW333333WWI1.',  // body
    '..1IW333333333WI.',
    '..1IW333333333WI.',
    '..1IW33333333WI1.',
    '..1IW333..333WI1.',
    '..1IW33....3WW1..',
    '..1IW33....333W1.',  // legs
    '..1IW33....333W1.',
    '...kkkk....kkkk1.',
    '0000000000000000.',
  ], 16);
  const PROP_FROZEN_STATUE_HD = pad([
    '................',
    '.....1IIPPI1....',
    '....1IWWPWWI1...',
    '...1IW3333WI1...',
    '...1IPP3333WPI..',
    '...1IW3113WI1...',
    '...1IW3553WI1...',
    '...1IW3333WPI1..',
    '..1IWW3333WWI1..',
    '..1IPW33449333WI',
    '..1IW3494P494W3W',
    '..1IW39494P494W1',
    '..1IW34444444W1.',
    '..1IW333P3333WI1',
    '..1IWW333333WWI1',
    '..1IW333P33333WI',
    '..1IW333333P33WI',
    '..1IW3333333P3WI',
    '..1IW33333333WI1',
    '..1IW33....3WW1.',
    '..1IW33....333W1',
    '..1IW33....333W1',
    '...kkkk....kkkk1',
    '0000000000000000',
  ], 16);

  // Crystal cluster — 16×16 cyan ice gems
  const PROP_ICE_CRYSTAL = pad([
    '................',
    '......1WW1......',
    '......1IWI1.....',
    '.....1IWWWI1....',
    '....1WI1IWIW1...',  // small offshoots
    '.1W1IWIWIIWIW1..',
    '.1WIWIIWIIIIWI1.',
    '.1IIWWIIWIWWII1.',
    '.1WIIIWIIWIIIW1.',
    '.1IWIIIIWIWWIW1.',
    '.1IWIWPIIIWIIW1.',  // spec
    '.1IIWWIIIIWWII1.',
    '.1IWIWIIIWIIIW1.',
    '..1WIWWIIWIIIW1.',
    '..kk1WIIWWIWWk1.',
    '0000kkkkkkkkkk00',
  ], 16);
  const PROP_ICE_CRYSTAL_HD = pad([
    '................',
    '......1WP1......',
    '......1IWI1.....',
    '.....1IWPWI1....',
    '....1WI1IWPW1...',
    '.1W1IWIWIIWIW1..',
    '.1WIWIIWPIIIWI1.',
    '.1IIWWIIWIWWPI1.',
    '.1WIIPWIIWIIIW1.',
    '.1IWIIIIWIWWPW1.',
    '.1IWIWPIIIWIIW1.',
    '.1IIWWIIIPWWII1.',
    '.1IWIWIIIWIIIW1.',
    '..1WIWWIPWIIIW1.',
    '..kk1WIPWWIWWk1.',
    '0000kkkkkkkkkk00',
  ], 16);

  // ============================================================
  // SHARED PROPS — castle/bridge/fountain/banner
  // ============================================================

  // Castle tower silhouette — 32×48 distant background prop
  function castleTower(litWindows) {
    const W = 'Y';     // lit window
    const D = '1';     // dark window
    const win = (lit) => lit ? W : D;
    return pad([
      '................................',
      '................................',
      '...........4444444..............',  // crenellations
      '..........144.44.44..............',
      '..........4445544454.............',
      '..........4555555554.............',
      '..........4455554455.............',  // tower top
      '..........1444444441.............',
      '.........144455554441............',
      '.........145555555541............',  // tower wall
      '.........145.555.5541............',  // window slits
      '.........145' + win(litWindows) + '555' + win(litWindows) + '541............',
      '.........145.555.5541............',
      '.........145555555541............',
      '.........145555555541............',
      '.........145.555.5541............',
      '.........145' + win(litWindows) + '555' + win(litWindows) + '541............',
      '.........145.555.5541............',
      '.........145555555541............',
      '.........144454545441............',  // arrow slit
      '.........144444444441............',
      '.........144333333441............',
      '........14443333344441...........',  // base widens
      '........14333333333441...........',
      '........14333555333441...........',
      '........14333555333441...........',  // gate top
      '........14333000333441...........',  // gate
      '........14333000333441...........',
      '........14333000333441...........',
      '........14333000333441...........',
      '........14333333333441...........',
      '........13333333333331...........',
      '........0000000000000............',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
    ], 32);
  }
  const PROP_CASTLE_TOWER_A = castleTower(true);
  const PROP_CASTLE_TOWER_B = castleTower(false);

  // Bridge segment — 24×16 stone arch over water
  const PROP_BRIDGE = pad([
    '........................',
    '141111111111111111111141',  // rail top
    '141155555555555555551141',
    '141155544444444445551141',  // walkway
    '141111111111111111111141',
    '14444444444444444444441.',
    '1455555555555555555554.1',  // stone arch
    '14455555555555555555441.',
    '.144555555555555555441..',  // arch curve
    '..1445555555555554441...',
    '...144555555555544441...',
    '....14455555555544441...',
    '.....144555555544441....',
    '......1444555544441.....',
    '........14444444........',
    'iiiiiiiiiiiiiiiiiiiiiiii',  // water below
  ], 24);
  const PROP_BRIDGE_HD = pad([
    '........................',
    '141111111111111111111141',
    '141155555555555555551141',
    '141155544454544445551141',
    '141111111111111111111141',
    '14444444444444444444441.',
    '14555655556555556555541.',
    '14455565555555556555441.',
    '.144555555655555555441..',
    '..14455555555555554441..',
    '...14455555555555544441.',
    '....144555555555554441..',
    '.....14455565555444441..',
    '......1444555544441.....',
    '........14444444........',
    'iIiIiIIiIiIiIiIIIiIIiIiI',  // animated water
  ], 24);

  // Fountain — 16×16 with bubbling water, 3 frames
  function fountain(splashLevel) {
    const splashRow = splashLevel === 0 ? '......WWW.......'
                    : splashLevel === 1 ? '.....WWPWW......'
                    : '.....WPWWPW.....';
    const sprayRow = splashLevel === 2 ? '....P.W.W.P.....' : '................';
    return pad([
      '................',
      sprayRow,
      splashRow,
      '....1WWWWWW1....',  // water surface
      '....1IIIIII1....',
      '....1IWWWWI1....',
      '....1IIWWII1....',
      '...144444444....',  // basin rim
      '..14555555554...',
      '..14333333334...',  // basin side
      '..14333333334...',
      '..14333333334...',
      '..14333333334...',
      '..14333333334...',
      '..133333333331..',
      '..0000000000000.',
    ], 16);
  }
  const PROP_FOUNTAIN_A = fountain(0);
  const PROP_FOUNTAIN_B = fountain(1);
  const PROP_FOUNTAIN_C = fountain(2);

  // Banner — 12×16 cloth banner with gold trim
  const PROP_BANNER_A = pad([
    '............',
    '.1bbbbbbbb1.',  // top rod
    '.1RRRRRRRR1.',
    '.1RRRRRRRR1.',
    '.1RYY889YR1.',  // gold emblem
    '.1RY99889R1.',
    '.1RY99989R1.',
    '.1RRRRRRRR1.',
    '.1RRRRRRRR1.',
    '.1RRRRRRRR1.',
    '.1RRRRRRRR1.',
    '..1RR.RR.R..',  // tattered bottom
    '..1RR..R....',
    '...1RR......',
    '............',
    '............',
  ], 12);
  const PROP_BANNER_B = pad([
    '............',
    '.1bbbbbbbb1.',
    '..1RRRRRRR1.',  // slight sway
    '..1RRRRRRR1.',
    '..1YY889YR1.',
    '..1Y99889R1.',
    '..1Y99989R1.',
    '..1RRRRRRR1.',
    '..1RRRRRRR1.',
    '..1RRRRRRR1.',
    '..1RRRRRRR1.',
    '...1R.RR.R..',
    '...1R..R....',
    '....1RR.....',
    '............',
    '............',
  ], 12);

  // Well — 16×16 stone well with rope
  const PROP_WELL = pad([
    '................',
    '......bb........',  // pulley pillar
    '....1Pb1Pb1.....',
    '....1bcccb1.....',
    '....1bb_bb1.....',  // pulley
    '......c.........',  // rope
    '......c.........',
    '......c.........',
    '...144444441....',  // well top
    '...14333333341..',
    '..1455333334541.',  // well lip
    '..1453333333541.',
    '..1453ikIIIIWk51',  // water inside
    '..1453IkWWIIWk51',
    '..14333333333341',  // base
    '..0000000000000.',
  ], 16);
  const PROP_WELL_HD = pad([
    '................',
    '......bb........',
    '....1Pcb1cb1....',
    '....1bcccbb1....',
    '....1bb_bbb1....',
    '......c.........',
    '......c.........',
    '......c.........',
    '...144444444....',
    '...14333333341..',
    '..1455333334541.',
    '..14533333335Y1.',  // spec on lip
    '..1453IkWPIWWk51',  // bright water
    '..1453IkWWPIWk51',
    '..14333333333341',
    '..0000000000000.',
  ], 16);

  // Brazier — 10×16 metal bowl with flame, 3 frames
  function brazier(flameHeight) {
    return pad([
      '..........',
      '....f.....',
      flameHeight === 0 ? '...fef....' : '...fff....',
      flameHeight === 1 ? '..feeef...' : '...fef....',
      '...fdef...',
      '....de....',
      '..14kkkk41',  // metal bowl
      '.144kkkk441',
      '.143333341.',
      '.143YY9Y341',
      '.143333341.',
      '..1411411..',  // stand
      '..14444441.',
      '..14411441.',
      '..13333331.',
      '..00000000.',
    ], 10);
  }
  const PROP_BRAZIER_A = brazier(0);
  const PROP_BRAZIER_B = brazier(1);

  // Gate (closed) — 24×24 wooden gate with iron straps
  const PROP_GATE = pad([
    '........................',
    '14444444444444444444441.',  // arch top
    '14ababababababababab441.',
    '1abbbbbbbbbbbbbbbbbbb41.',
    '1abbbbbbabbbbabbbbbbb41.',
    '1abkkkkkkbbabkkkkkkbb41.',  // iron straps
    '1abbbbbbabbabbbbbbbbb41.',
    '1abbbbbabbabbabbbbbbb41.',
    '1abbbbabbabbabbabbbbb41.',
    '1abbabbabbabbabbbabbb41.',
    '1abbbabbbbb..bbbabbab41.',  // gap (slightly open)
    '1abbbabbbbb..bbbabbab41.',
    '1abkkkkkkbb..bbkkkkkk41.',  // lower straps
    '1abbbabbbbb..bbbabbab41.',
    '1abbbabbbbbabbbabbbab41.',
    '1abbabbabbabbabbabbab41.',
    '1abbabbabbabbabbabbab41.',
    '1abbbbabbabbabbabbbbb41.',
    '1abbbbbbabbabbbbbbbbb41.',
    '1abkkkkkkbabkkkkkkkbb41.',
    '1abbbbbbabbabbbbbbbbb41.',
    '14ababababababababab441.',
    '14444444444444444444441.',
    '0000000000000000000000..',
  ], 24);
  const PROP_GATE_HD = pad([
    '........................',
    '14444454444454444454441.',
    '14ababababababababab441.',
    '1abcbbcbbcbbcbbcbbcbb41.',  // wood grain highlights
    '1abbcbbabbcbbabcbbbcb41.',
    '1abkkkPkkkbbabkkkPkkkb41',
    '1abbcbbabbabbcbbcbbbb41.',
    '1abbcbabbabbabbabcbbb41.',
    '1abbcbabbabbabbabbbbb41.',
    '1abbabbabbabbabbbabbb41.',
    '1abbbabbcbb..bbbabbab41.',
    '1abbbabbcbb..bbbabbab41.',
    '1abkkkPkkkb..bbkkkPkk41',
    '1abbbabbbbb..bbbabbab41.',
    '1abbcabbbbbabbbabbbab41.',
    '1abbabbcbbabbabbabbab41.',
    '1abbabbabbabbabbabcab41.',
    '1abbcbabbabbabbabbbbb41.',
    '1abbbcbbabbabbabcbbbb41.',
    '1abkkPkkkbabkkkPkkkkb41.',
    '1abbcbcbabbabbcbcbbbb41.',
    '14ababababababababab441.',
    '14444454444454444454441.',
    '0000000000000000000000..',
  ], 24);

  // ============================================================
  // Register all structures
  // ============================================================
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      // Crypt
      prop_tombstone: [PROP_TOMBSTONE],
      prop_tombstone_hd: [PROP_TOMBSTONE_HD],
      prop_pillar_broken: [PROP_PILLAR_BROKEN],
      prop_pillar_broken_hd: [PROP_PILLAR_BROKEN_HD],
      prop_sarcophagus: [PROP_SARCOPHAGUS],
      prop_sarcophagus_hd: [PROP_SARCOPHAGUS_HD],
      prop_gargoyle: [PROP_GARGOYLE],
      prop_gargoyle_hd: [PROP_GARGOYLE_HD],
      prop_candelabra: [PROP_CANDELABRA_A, PROP_CANDELABRA_B],

      // Forest
      prop_dead_tree: [PROP_DEAD_TREE],
      prop_dead_tree_hd: [PROP_DEAD_TREE_HD],
      prop_mushroom: [PROP_MUSHROOM],
      prop_mushroom_hd: [PROP_MUSHROOM_HD],
      prop_forest_shrine: [PROP_FOREST_SHRINE],
      prop_forest_shrine_hd: [PROP_FOREST_SHRINE_HD],
      prop_stone_wall: [PROP_STONE_WALL],
      prop_stone_wall_hd: [PROP_STONE_WALL_HD],

      // Volcano
      prop_lava_crack: [PROP_LAVA_CRACK],
      prop_lava_crack_hd: [PROP_LAVA_CRACK_HD],
      prop_obsidian_pillar: [PROP_OBSIDIAN_PILLAR],
      prop_obsidian_pillar_hd: [PROP_OBSIDIAN_PILLAR_HD],
      prop_fire_altar: [PROP_FIRE_ALTAR_A, PROP_FIRE_ALTAR_B],
      prop_bone_pile: [PROP_BONE_PILE],
      prop_bone_pile_hd: [PROP_BONE_PILE_HD],

      // Ice
      prop_ice_spike: [PROP_ICE_SPIKE],
      prop_ice_spike_hd: [PROP_ICE_SPIKE_HD],
      prop_frozen_statue: [PROP_FROZEN_STATUE],
      prop_frozen_statue_hd: [PROP_FROZEN_STATUE_HD],
      prop_ice_crystal: [PROP_ICE_CRYSTAL],
      prop_ice_crystal_hd: [PROP_ICE_CRYSTAL_HD],

      // Shared
      prop_castle_tower: [PROP_CASTLE_TOWER_A, PROP_CASTLE_TOWER_B],
      prop_bridge: [PROP_BRIDGE],
      prop_bridge_hd: [PROP_BRIDGE_HD],
      prop_fountain: [PROP_FOUNTAIN_A, PROP_FOUNTAIN_B, PROP_FOUNTAIN_C, PROP_FOUNTAIN_B],
      prop_banner: [PROP_BANNER_A, PROP_BANNER_B],
      prop_well: [PROP_WELL],
      prop_well_hd: [PROP_WELL_HD],
      prop_brazier: [PROP_BRAZIER_A, PROP_BRAZIER_B],
      prop_gate: [PROP_GATE],
      prop_gate_hd: [PROP_GATE_HD],
    });

    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Structures · Crypt',
        items: ['prop_tombstone','prop_pillar_broken','prop_sarcophagus','prop_gargoyle','prop_candelabra'],
      });
      window.SPRITE_GROUPS.push({
        title: 'Structures · Forest',
        items: ['prop_dead_tree','prop_mushroom','prop_forest_shrine','prop_stone_wall'],
      });
      window.SPRITE_GROUPS.push({
        title: 'Structures · Volcano',
        items: ['prop_lava_crack','prop_obsidian_pillar','prop_fire_altar','prop_bone_pile'],
      });
      window.SPRITE_GROUPS.push({
        title: 'Structures · Ice',
        items: ['prop_ice_spike','prop_frozen_statue','prop_ice_crystal'],
      });
      window.SPRITE_GROUPS.push({
        title: 'Structures · Shared',
        items: ['prop_castle_tower','prop_bridge','prop_fountain','prop_banner','prop_well','prop_brazier','prop_gate'],
      });
    }
  }

  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      prop_candelabra: 4,
      prop_fire_altar: 5,
      prop_castle_tower: 2,
      prop_fountain: 6,
      prop_banner: 3,
      prop_brazier: 5,
    });
  }
})();
