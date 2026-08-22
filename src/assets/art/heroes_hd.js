// HD hero sprites — 24×24, multi-tone shaded versions of the 16×16 originals.
//
// Design rules per sprite:
//   1. Always include a 1-pixel-thick outline using palette color '1' (deep
//      night blue-black). This separates the figure from any background.
//   2. Each major surface gets 3-4 shading tones:
//        steel: 'k'-dark, 'i'-mid, 'I'-light, 'P'-specular
//        gold:  '8'-dark, '9'-mid, 'Y'-light, 'P'-bright
//        cloth: 'a'-dark, 'b'-mid, 'c'-light
//        flame: 'd'-ember, 'e'-flame, 'f'-flame-hi, 'P'-white spec
//        arcane:'p'-dark, 'm'-mid, 'M'-light, 'q'-bright, 'P'-spec
//        green: 'g'-dark, 'G'-mid, 'h'-light
//        red:   'r'-dark, 'R'-mid, 'P'-bright spec
//   3. Light source from top-left: highlights on top-left of curved surfaces,
//      shadows on bottom-right.
//   4. Walk cycle: 4 frames (idle / left-foot / idle / right-foot). The body
//      stays the same, only the leg row changes — keeps sprite work manageable.

(function () {
  function knightHD(stride) {
    // 24×24 plate knight, front view. Cross-emblazoned surcoat.
    const f = [
      '........................',
      '........................',
      '..........1111..........',
      '.........1kIIIik1.......',  // helm dome
      '........1kIIPIIIk1......',  // top specular
      '........1iIIWWIIik1.....',
      '.......1kIIIIIIIIk1.....',
      '.......1kI100001Ik1.....',  // visor slit (pitch black)
      '.......1kIIPIIIIIk1.....',
      '........1iIIIIIIik1.....',
      '........1kkiiiikk1......',  // jaw
      '.......1IIIIIIIIII1.....',  // collar
      '......1IIYYYYYYYYII1....',  // pauldrons w/ gold trim
      '.....1IIIY99999999III1..',
      '.....1IIYYY9889YYYY1III.',  // chest top
      '.....1IIY98889889Y1III1.',  // cross arms
      '.....1IIY9P888P89Y1II1..',
      '.....1IIY9988P889Y1II1..',
      '.....1IIY9988P889Y1II1..',  // cross center
      '.....1IIYY999999YY1II1..',
      '.....1IIIIIIIIIIIII1....',  // belt line
      '......1aabbbbbbbbaa1....',  // surcoat skirt
      '.......1bbb1..1bbb1.....',
      '.......????..????.......',  // leg row (stride-dependent)
    ];
    if (stride === -1) {
      f[23] = '.......1iIk1..1ki11.....';
    } else if (stride === 1) {
      f[23] = '.......11ik1..1kIi1.....';
    } else {
      f[23] = '.......1iik1..1kii1.....';
    }
    return f;
  }

  function mageHD(stride) {
    // 24×24 hooded mage with pointed hat, robed body, chest gem.
    const f = [
      '........................',
      '..........11............',
      '.........1mP1...........',  // hat point
      '........1mMM1...........',
      '.......1mMMMM1..........',
      '......1mMMMMMM1.........',
      '.....1mMMMMMMpM1........',  // hat brim shading
      '....1mMMMMMMMMMm1.......',
      '....1mppmmmmmppm1.......',  // brim dark line
      '.....1cb7777bc1.........',  // face under hood
      '.....1c711117c1.........',
      '.....1cb7117bc1.........',  // eye line
      '.....1ccbbbbcc1.........',
      '....1mMMMMMMMMm1........',  // shoulders / cape edge
      '...1mMMMqqqqMMMm1.......',
      '...1mMMqqqPqqqMMm1......',
      '..1mMMMqqMPMqqqMMm1.....',  // chest gem center
      '..1mMMMMqqqqqqMMMMm1....',
      '..1mMMMMMqqqMMMMMMm1....',
      '...1mMMMMMMMMMMMMm1.....',
      '....1mMMMMMMMMMMm1......',
      '.....1mMMMMMMMMm1.......',
      '......1bbbbbbbb1........',  // hem
      '.......????..????.......',  // legs row
    ];
    if (stride === -1) f[23] = '.......1ba11..1ab1......';
    else if (stride === 1) f[23] = '.......11ab1..1ba1......';
    else f[23] = '.......1aab1..1baa1.....';
    return f;
  }

  function warriorHD(stride) {
    // 24×24 horned barbarian with fur trim, scar, brass belt.
    const f = [
      '........................',
      '........................',
      '.........6111111166.....',  // horn arches
      '........616666616611....',
      '.......1k6444446k11.....',  // helm top
      '.......1k4cccccc4k1.....',  // face
      '.......1k4c1771c4k1.....',  // eye line
      '.......1k4ccrr5c4k1.....',  // scar
      '.......1k44ccccc44k1....',
      '.......1kkkkkkkkkk1.....',  // helm bottom
      '......1abbbbbbbbbba1....',  // fur trim cape edge
      '.....1abkkkkkkkkkka1....',  // shoulder iron
      '.....1abIIIIIIIIIIab1...',  // chest iron
      '....1IIIIIIYY9YYIIII1...',  // pauldrons
      '....1IIIcccY988YcccII1..',  // chest leather
      '....1IIcc8899889ccIII1..',  // brass belt buckle
      '....1IIcbbb9889bbbcII1..',
      '....1IIIcbbbbbbcbbcII1..',
      '....1IIIIcbbbbcbbcIII1..',
      '....1IIIIIcccccccIIII1..',
      '.....1IIaIIIIIIIIaII1...',  // belt below
      '......1bb111111111bb1...',  // skirt fur
      '.......1bbb1..1bbb1.....',
      '.......????..????.......',
    ];
    if (stride === -1) f[23] = '.......1aIk1..1kIa1.....';
    else if (stride === 1) f[23] = '.......1kIa1..1aIk1.....';
    else f[23] = '.......1aak1..1kaa1.....';
    return f;
  }

  function huntressHD(stride) {
    // 24×24 hooded huntress, green cloak, leather tunic.
    const f = [
      '........................',
      '..........11............',
      '.........1gG1...........',
      '........1gGGG1..........',  // hood tip
      '.......1gGGhGG1.........',
      '......1gGhhhhGG1........',  // hood
      '......1gGhhhhhG1........',
      '......1ggGGGGGg1........',
      '.......1c711117c1.......',  // face
      '......1ccbb11bbcc1......',  // eye line
      '......1ccbbbbbbcc1......',
      '......1cccbbbbcc1.......',
      '.....1gGGGGGGGGGg1......',  // shoulders / cape
      '....1gGhhhGGGGhhhGg1....',  // cape trim
      '....1gGhcccccccccGGg1...',  // chest leather
      '....1gGGcbcRRcbcGGGg1...',  // hunter badge
      '....1gGGcbbRRbbcGGGg1...',
      '....1gGGcbbbbbbcGGGg1...',
      '....1gGGGcbbbbcGGGGg1...',
      '....1gGGGGcccccGGGGg1...',
      '.....1gGGGGGGGGGGGg1....',
      '......1ggbbbbbbbgg1.....',  // hem
      '.......1bbb1..1bbb1.....',
      '.......????..????.......',
    ];
    if (stride === -1) f[23] = '.......1bkk1..1kbb1.....';
    else if (stride === 1) f[23] = '.......1bbk1..1kkb1.....';
    else f[23] = '.......1bkk1..1kkb1.....';
    return f;
  }

  function clericHD(stride) {
    // 24×24 white & gold robed cleric with cross emblem and halo.
    const f = [
      '........................',
      '..........YY............',  // halo top
      '.........1YPPY1.........',  // halo arch
      '........1Y9YY9Y1........',
      '........1Y977779Y1......',  // hood
      '.......1c7777777c1......',  // face
      '......1cc711117cc1......',  // eye line
      '......1ccc77777cc1......',
      '......1cccccccccc1......',  // neck
      '.....177777777777a1.....',  // robe shoulders
      '....17a7777777777a71....',  // shoulders w/ gold border
      '....1a7777YY99YY7777a1..',  // chest cross arm
      '....1a777YY9889YY777a1..',
      '....1a7779988P8997777a1.',  // cross center
      '....1a7779988P8997777a1.',
      '....1a7777Y98889Y7777a1.',  // cross bottom
      '....1a77777Y99Y77777a1..',
      '....1a7777YYYYYY7777a1..',
      '....1a77777777777777a1..',
      '....1a77777777777777a1..',
      '.....1a777777777777a1...',
      '......1aa77777777aa1....',  // hem
      '.......1bbb1..1bbb1.....',
      '.......????..????.......',
    ];
    if (stride === -1) f[23] = '.......1bbb1..1bbB1.....';
    else if (stride === 1) f[23] = '.......1bbB1..1bbb1.....';
    else f[23] = '.......1bbb1..1bbb1.....';
    // Clean up the B placeholder (used to vary stride but should be 'a' for boot)
    f[23] = f[23].replace(/B/g, 'a');
    return f;
  }

  // Register HD heroes as separate sprite keys
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      knight_hd_walk:   [knightHD(0),   knightHD(-1),   knightHD(0),   knightHD(1)],
      mage_hd_walk:     [mageHD(0),     mageHD(-1),     mageHD(0),     mageHD(1)],
      warrior_hd_walk:  [warriorHD(0),  warriorHD(-1),  warriorHD(0),  warriorHD(1)],
      huntress_hd_walk: [huntressHD(0), huntressHD(-1), huntressHD(0), huntressHD(1)],
      cleric_hd_walk:   [clericHD(0),   clericHD(-1),   clericHD(0),   clericHD(1)],
    });
    // Sprite group
    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Heroes · HD (24×24, polished)',
        items: ['knight_hd_walk', 'mage_hd_walk', 'warrior_hd_walk', 'huntress_hd_walk', 'cleric_hd_walk'],
      });
    }
  }
  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      knight_hd_walk: 8, mage_hd_walk: 6, warrior_hd_walk: 7,
      huntress_hd_walk: 9, cleric_hd_walk: 6,
    });
  }
})();
