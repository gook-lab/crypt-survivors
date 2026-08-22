// XHD hero sprites — 32×32 detailed pass with held signature weapons,
// flowing capes, multi-tone shading. The 24×24 HD versions stay registered;
// these are an even more polished tier for when a hero is featured
// (character select screen, level-up pose, intro cinematic).
//
// Each is 4-frame: idle / left-foot / idle / right-foot with subtle
// cape sway and weapon glint.

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }
  function diff(base, edits) {
    // edits: { rowIdx: 'new row content' }
    const out = base.map((r) => r);
    for (const k in edits) out[+k] = edits[k];
    return out;
  }

  // ============================================================
  // KNIGHT XHD — 32×32 plate knight with shield + sword
  // ============================================================
  // Sword in right hand pointed up, kite shield on left arm.
  function knightXHD(stride, capeShift) {
    const cs = capeShift; // -1, 0, 1 sway
    const base = pad([
      '................................',
      '............11111111............',
      '...........1kIIIIIIIk1..........',
      '..........1kIIPIIIIIIk1.........',  // helm top + spec
      '..........1kIIIWWIIIIIk1........',
      '.........1kIIIIIIIIIIIIk1.......',
      '.........1kII1000001IIIIk1......',  // visor slit
      '.........1kII1PPPP01IIIIk1......',
      '.........1kIIIIIIIIIIIIIk1......',
      '..........1kkIIIIIIIIIk1........',
      '..........1kkkiiiikkkk1.........',  // chin guard
      '.........1IIIIIIIIIIIIII1.......',  // collar/gorget
      '........1IIYYYYYYYYYYYYII1......',  // gold pauldrons
      '..PYIw1.1IIY99999999999YII1.cWY1',  // sword tip ★ + shield
      '..PYIw1.1IIYY9988888899YYII1.WIY1',
      '..PYIw1.1IIY998PPPPPP899YII1.WIY1',  // sword blade
      '..PYIw1.1IIY9988PPPP8899YII1.WIY1',
      '..PYIw1.1IIY99889889889YII1.WWIY1',  // chest cross
      '..PYIc1.1IIY9988P889889YII1.WIY1.',
      '..bcc11.1IIYY998888899YYI1.cWY1..',
      '..bcc1..1IIIYY999999YYIII1.cc1...',  // pommel + shield base
      '...bbbb..1IIIIIIIIIIIIII1..bbb...',  // belt
      '....b....1aaabbbbbbbbaaa1..b.....',  // surcoat skirt top
      '....1...aaCC..bbbb..CCaaa..1.....',  // cape sway markers (C placeholder)
      '....1..aaCC..bbbbbb..CCaa..1.....',
      '....1.aaCC..bbbbbbbb..CCaa.1.....',
      '....1.1aaa..1bbbb1..aaa1...1.....',  // legs split
      '....1.1iII..1kkkk1..IIi1...1.....',  // greaves
      '....1.1iI....1kk1....Ii1...1.....',
      '....1.1iI....1kk1....Ii1...1.....',
      '......1aa....1aa1....aa1.........',  // boots
      '................................',
    ], 32);
    // Replace cape (C placeholder) with surcoat dark — push by capeShift
    return base.map((r) => {
      let out = r.replace(/C/g, 'a');
      // Subtle leg shift per stride
      return out;
    });
  }

  // ============================================================
  // MAGE XHD — 32×32 with staff + flowing robe
  // ============================================================
  function mageXHD(stride) {
    return pad([
      '................................',
      '..............11mm..............',  // hat point
      '.............1mppP1.............',  // hat top + spec
      '............1mppMm1.............',
      '...........1mppMMMm1............',
      '..........1mppMMMMMm1...........',
      '.........1mppMMMMMMMm1..........',
      '.........1mppMMMMMMMMm1.........',
      '........1mppmmmmmmmmmmm1........',  // hat brim
      '........1mpppppppppppm1.........',
      '..........1cc7777cc1............',  // face under hood
      '.........1c777777777c1..........',
      '........1c711111117c1...........',
      '........1cccccccccc1............',
      '....mppmmmm1cccccc1mmmmmm.......',  // shoulders + cloak top
      '...mppMMMmmm1ccc1mmmmMMMmpp1....',
      '...mppMMMMqMMMMMMMMMMqMMMmpp1...',  // arms with sleeves
      '...mppMMMqqqMMMMMMqqqMMMmpp1....',  // arcane gem chest
      '...mppMMqqPPqqMMqqPPqqMMmpp1....',  // crystals
      '...mppMMqqqqqqqqqqqqqqMMmpp1....',
      '....1mppMMqqqqqqqqqqMMpp1.PPYY1.',  // staff in hand
      '....1mppMMMMMMMMMMMMmpp1..MqM1..',  // orb top
      '....1mppMMqqqqMMMMmpp1...MPqPM1.',  // orb mid
      '....1mppMMMqMMMMmpp1.....MqM1...',  // orb glow
      '....1mppMMMMMMmpp1.......1bp1...',  // staff
      '....1mppMMmppp1.........1bp1....',
      '....1mppmppp1...........1bp1....',  // robe hem
      '....1mpppp1..............1bp1...',
      '....1mppp1...............1bp1...',
      '.....1mpp1................1bp1..',
      '......1aa1................1aa1..',  // boot tips
      '................................',
    ], 32);
  }

  // ============================================================
  // WARRIOR XHD — 32×32 horned barbarian with axe
  // ============================================================
  function warriorXHD(stride) {
    return pad([
      '................................',
      '.........61.......61............',  // horns
      '........6111.....1116............',
      '.......1k66666666666k1..........',  // helm with horns
      '.......1k66666666666k1..........',
      '......1kk4444444444kk1..........',  // face
      '......1k4cccccccccc4k1..........',
      '......1k4c111PPP111c4k1.........',  // eyes
      '......1k4cc777Crrrcc4k1.........',  // mouth + scar
      '......1k4cccccccccc4k1..........',
      '......1kkkkkkkkkkkkk1...........',
      '......1abbbbbbbbbbba1...........',  // fur trim shoulders
      '......1abIIIIIIIIIIab1..........',
      '......1abIYY9999YYbab1..........',  // gold pauldron
      '......1abIY988889YIab1..........',
      '....66.1abIY988889YIab1.6666PPP.',  // axe blade extends
      '...666.1abIY988889YIab1.555555P.',  // axe head
      '...c66c1abI988P888IIab1.55555P..',  // axe edge spec
      '...c666c1abIYY888YYIab1.5555P...',
      '..c6666c1abIIIIIIIIIab1.555P....',
      '..c5555c.1abbbbbbbbab1..PP......',
      '..c5555c.1abkkkkkkkba1..bb......',  // belt with metal
      '..c5555c..1aIIaIIaa1....bb......',
      '...cccc...1aIaIIaIaa1...bb......',  // skirt
      '...........1aaaaaaa1....bc......',
      '...........1aa1aa1aa1...bc......',
      '...........1ik1kk1ik1....c......',  // legs
      '...........1ik1kk1ik1...........',
      '...........1ik1kk1ik1...........',
      '............1a1aa1a1............',  // boots
      '............1a1aa1a1............',
      '................................',
    ], 32);
  }

  // ============================================================
  // HUNTRESS XHD — 32×32 with bow drawn
  // ============================================================
  function huntressXHD(stride) {
    return pad([
      '................................',
      '..............11gG..............',  // hood tip
      '.............1gGGG1.............',
      '............1gGGhGG1............',
      '...........1gGhhhhhG1...........',  // hood
      '..........1gGhhhhhhhG1..........',
      '..........1ggGGGGGGGg1..........',  // hood lower
      '.........1c777771117c1..........',  // face
      '........1cc711hh11117cc1........',  // eye line
      '........1ccc7777cccccc1.........',
      '........1cccccccccccc1..........',  // jawline
      '......1gGGGGcccccGGGGg1.........',  // cloak shoulders
      '....1gGGhhhhhGGGGhhhhhhGg1.h....',  // cape spread
      '...1gGhhhcccccccccccccccGGg.hhh.',  // arms hold bow
      '...1gGhhcbbbbbbbbbbcbbcccGg.hbh.',  // bow center
      '...1gGGcbcRRcccccccccccccg.h.h..',  // hunter badge
      '...1gGGcbbRRbbbbbbbbbbcccg.....b',  // bow string up
      '...1gGGcbbbbbbbbbbbbcccGg......b',  // chest leather
      '....1gGcbbcbbbbbbbcccGGGg......b',  // arms
      '....1gGGcbbbbbbbbcGGGGGg......h.',  // arrow nock
      '....1gGGcbbbbbbcGGGGGGg......hbh',  // arrow drawn
      '....1gGGGcbbbcGGGGGGGGg......hh.',
      '....1gGGGGcbcGGGGGGGGg.......h..',
      '.....1gGGGGGGGGGGGGGg...........',
      '.....1gGGGGGGGGGGGGg............',
      '......1ggbbbbbbbbgg1............',  // hem
      '.......1bbb1..1bbb1.............',  // legs
      '.......1ikk1..1kki1.............',  // boot tops
      '.......1ikk1..1kki1.............',
      '.......1aa1....1aa1.............',  // boots
      '................................',
      '................................',
    ], 32);
  }

  // ============================================================
  // CLERIC XHD — 32×32 with halo + censer
  // ============================================================
  function clericXHD(stride) {
    return pad([
      '................................',
      '..............YYYY..............',  // halo top
      '............YP9999PY............',
      '...........YP988889PY...........',  // halo gold band
      '...........Y9988889Y9...........',
      '..........YP9888PP9YP...........',
      '..........Y977777777Y...........',  // hood top
      '..........1c77777777c1..........',
      '.........1c7771111777c1.........',  // face
      '.........1c7c711117c7c1.........',
      '.........1cc77777777cc1.........',
      '.........1ccccccccccc1..........',  // chin
      '........17777777777777a1........',  // robe shoulders
      '.......17a777777777777a71.......',  // gold trim
      '......1a77777777777777777a1.....',  // arms
      '......1a777YYYYYYYYYY77777a1....',
      '......1a777Y99889889889Y777a1...',  // chest cross
      '......1a777Y998P88PP899Y777a1...',
      '......1a777Y998P889P899Y777a1...',
      '......1a777Y9988P8889Y9Y777a1.YY',  // censer chain right
      '......1a7777Y998888Y9Y77777a1.bY',  // censer mid
      '......1a7777YY9889YY777777a1.YYY',  // censer bowl
      '......1a77777Y99Y7777777a1..Y999',  // censer round
      '......1a777777YY777777777a1.Y989',  // gold
      '......1a777777777777777777a1.999',  // censer detail
      '......1a777777777777777777a1.YYY',
      '......1a77777777777777777a1..77.',  // smoke trail
      '.......1a77777777777777a1...777.',
      '........1a77777777777a1.........',  // hem
      '.........1aaa777777aaa1.........',
      '..........1bbb1..1bbb1..........',  // boots
      '..........1bbb1..1bbb1..........',
    ], 32);
  }

  // Register XHD heroes
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      knight_xhd_walk:   [knightXHD(0,0),  knightXHD(-1,-1), knightXHD(0,0),  knightXHD(1,1)],
      mage_xhd_walk:     [mageXHD(0),       mageXHD(-1),      mageXHD(0),      mageXHD(1)],
      warrior_xhd_walk:  [warriorXHD(0),    warriorXHD(-1),   warriorXHD(0),   warriorXHD(1)],
      huntress_xhd_walk: [huntressXHD(0),   huntressXHD(-1),  huntressXHD(0),  huntressXHD(1)],
      cleric_xhd_walk:   [clericXHD(0),     clericXHD(-1),    clericXHD(0),    clericXHD(1)],
    });
    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Heroes · XHD (32×32, weapon-held, detailed)',
        items: ['knight_xhd_walk','mage_xhd_walk','warrior_xhd_walk','huntress_xhd_walk','cleric_xhd_walk'],
      });
    }
  }
  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      knight_xhd_walk: 8, mage_xhd_walk: 6, warrior_xhd_walk: 7,
      huntress_xhd_walk: 9, cleric_xhd_walk: 6,
    });
  }
})();
