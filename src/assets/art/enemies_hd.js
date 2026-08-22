// HD enemy sprites — common foes upscaled with multi-tone shading.
// 16×16 → 24×24 (most), 24×24 → 32×32 (chimera/treant).
// Outlines + 3-4 tones per surface.

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }

  // ── WALKER HD — 24×24 zombie ghoul ──
  function walkerHD(bobOffset) {
    const x = bobOffset;
    return pad([
      '........................',
      '........................',
      '........1ggggg1.........',
      '.......1gGGGGGGg1.......',  // head
      '......1gGGGGGGGGg1......',
      '......1gG110011Gg1......',  // sunken eyes
      '......1gGG1RR1GGg1......',  // bloodshot
      '......1gGGGRRGGGg1......',
      '......1gGGGGGGGGg1......',
      '.......1ggGGGGgg1.......',
      '......1bbGGGGGGbb1......',  // shoulders w/ tattered cloth
      '.....1bbgGGGGGGGgbb1....',  // body
      '....1bbgGGGGGGGGGGgbb1..',
      '....1bgGgGGGGGGGgGGgb1..',
      '....1bgGgGGGGGGGgGGgb1..',
      '.....1bgGGGGGGGGGGGb1...',  // ribs
      '......1gGGG..GGGGG1.....',
      '......1gGG....GGGg1.....',
      '......1ggGG..GGgg1......',
      '......1g......g1........',
      '......1g......g1........',
      '......1a1....1a1........',
      '......1a1....1a1........',
      '......1aa1..1aa1........',
    ], 24);
  }
  const WALKER_HD_A = walkerHD(0);
  const WALKER_HD_B = walkerHD(1);

  // ── RUNNER HD — 24×24 skeletal hellhound ──
  function runnerHD(legPhase) {
    const base = [
      '........................',
      '........................',
      '..............11........',
      '.............1666611....',
      '............16677776611.',  // head
      '...........166777777761.',
      '.........166677e00e7761.',  // red ember eyes
      '........1666777RRRR7761.',
      '.166...16766777777e771..',  // body + tail
      '1aGGg166766777777771....',
      '1aaGGGGgGGGG666666661...',  // ribs
      '.1aGGGGGGGGGGGgg1666....',
      '..1GGGGGGGGGGGGGg1......',
      '..1ggGGgggGGGgggg1......',
      '...111...111............',
      '...1k1...1k1...1k1......',
      '...1k1...1k1...1k1......',
      '...1k1...1k1...1k1......',
      '...1k1...1k1...1k1......',
      '...1a1...1a1...1a1......',
      '..1aa1..1aa1..1aa1......',
      '........................',
      '........................',
      '........................',
    ];
    // leg cycling
    if (legPhase === 1) {
      base[14] = '...1.1...1.1...1.1......';
      base[15] = '...1k1...1k1...1k1......';
      base[16] = '...1k1...1k1...1k1......';
      base[17] = '..1k.....1k1.....k1.....';
      base[18] = '..1k1.....1.....1k1.....';
      base[19] = '..1a1...........1a1.....';
      base[20] = '.1aa1...........1aa1....';
    }
    return pad(base, 24);
  }
  const RUNNER_HD_F1 = runnerHD(0);
  const RUNNER_HD_F2 = runnerHD(1);
  const RUNNER_HD_F3 = runnerHD(0);
  const RUNNER_HD_F4 = runnerHD(1);

  // ── BRUTE HD — 32×32 armored ogre ──
  function bruteHD(bob) {
    return pad([
      '................................',
      '................................',
      '..........11mmmmmm11............',
      '.........1mmppppppmmm1..........',  // armor top
      '........1mpppMMMMMMMMpm1........',
      '........1mppMMMpppppMMMpm1......',
      '........1mppMMpppppppMMpm1......',
      '........1mppMpp110011pMpm1......',  // glowing eyes
      '........1mppMpp1MMMM1pMpm1......',
      '........1mppMppMMMMpMpm1........',
      '........1mppMpppppppMpm1........',
      '.........1mppMpppMpMpm1.........',
      '.........1mppmppMMpmmm1.........',
      '........1mmppMMMMpppmmm1........',
      '.......1mmpppMMMqqMMMpppmm1.....',  // chest gem (arcane)
      '......1mppppMMMqPPqMMMppppm1....',  // gem spec
      '......1mppppMqqqMMqqqMpppppm1...',
      '......1mppppMqMMMMMMqMpppppm1...',  // gem highlight
      '......1mppppMqMMMMMMqMpppppm1...',
      '......1mppppMMqqqqqqMMpppppm1...',
      '......1mppppMMMqqqqMMMpppppm1...',
      '.......1mppppMMMMMMMMMppppm1....',
      '........1mpppppMMMMMpppppm1.....',
      '.........1mpppppppppppppm1......',  // belt
      '..........1mpp....pppm1.........',
      '..........1mp1....1pm1..........',  // legs split
      '..........1mp1....1pm1..........',
      '..........1mp1....1pm1..........',
      '..........1ap1....1pa1..........',
      '..........1aaa1..1aaa1..........',
      '................................',
      '................................',
    ], 32);
  }
  const BRUTE_HD_A = bruteHD(0);
  const BRUTE_HD_B = bruteHD(1);

  // ── ELITE HD — 24×24 armored knight enemy ──
  function eliteHD(stride) {
    return pad([
      '........................',
      '........................',
      '......6111111166........',  // horned helm
      '......6kkkkkk16611......',
      '.....1kIIIIIIIk1........',  // helm top
      '.....1kIII11IIIk1.......',
      '.....1kII1RR1IIk1.......',  // red glow eyes
      '.....1kII1RR1IIk1.......',
      '.....1kIIIIIIIIk1.......',
      '.....1kkkkkkkkkk1.......',  // helm bottom
      '....1IIIIIIIIIIIII1.....',  // pauldrons
      '....1IIYYYYYYYYYYIIc1...',
      '....1IIY999999999YIIc1..',  // gold crest
      '....1IIY988888889YIIc1..',
      '....1IIY988rrrr89YIIc1..',  // spiked center
      '....1IIY988888889YIIc1..',
      '....1IIYY9999999YYIIc1..',
      '....1IIIYYYYYYYYIIIIc1..',
      '.....1IIIIIIIIIIIc1.....',  // belt
      '......1kkk1..1kkk1......',  // legs
      '......1kkk1..1kkk1......',
      '......1aaa1..1aaa1......',
      '........................',
      '........................',
    ], 24);
  }
  const ELITE_HD_A = eliteHD(0);
  const ELITE_HD_B = eliteHD(1);

  // ── BAT HD — 24×16 fluttering ──
  function batHD(wingPhase) {
    const w = wingPhase;
    if (w === 0) {
      // wings up
      return pad([
        '........................',
        '...22..............22...',
        '..2pp2..1pmmp1...2pp2...',
        '.2pmm2..2pMMp2..2pmm2...',
        '2pmMM2..2pMMp2..2MMmp2..',
        '.2pmmM21pMmmMp12MmmpP...',
        '..2pMMp1MmRRmM1pMMp2....',  // red eyes
        '...2pMMMmm0000mmMMp2....',
        '....2pMM1MMMMMM1MMp2....',
        '.....2pMmmmmmmmmmMp2....',  // body
        '......2pMMMMMMMMMp2.....',
        '.......2pMMMMMMMp2......',
        '........2ppmmpp2........',  // belly
        '.........2pppp2.........',
        '..........2pp2..........',
        '........................',
      ], 24);
    } else if (w === 1) {
      // wings horizontal
      return pad([
        '........................',
        '........................',
        '....2pp2........2pp2....',
        '...2pmmp2......2pmmp2...',
        '..2pmMMmp22..22pmMMmp2..',
        '.2pmMMMMmpmppmpMMMMMmp2.',
        '2pmMMMMmp1MmRRmM1pmMMMmp',
        '.2pMMMmm111MM0011mmMMMp2',
        '..2pMMMM1MMMMMMMM1MMMp2.',
        '...2pMmmmmmmmmmmmmmMp2..',
        '....2pMMMMMMMMMMMMp2....',
        '.....2ppMMMMMMMMpp2.....',
        '......2ppmmmmmmpp2......',
        '........2ppppp2.........',
        '..........2pp2..........',
        '........................',
      ], 24);
    } else {
      // wings down
      return pad([
        '........................',
        '..........2pp2..........',
        '.........2pmmp2.........',
        '........2pMMmmp2........',
        '.......2pMMMMmp2........',
        '......2pmMRRmMmp2.......',  // red eyes
        '.....2pMMM00MMMmp2......',
        '....2pMMMMmmMMMMmp2.....',
        '...2pMMMMM..MMMMmp2.....',
        '..2pMMMMmpmpmMMMMmp2....',
        '.2pmMMMmpmpmpmMMMMmp2...',
        '2pmMMMmp2....2pmMMMmp2..',
        '2pMMmp2........2pmMMmp2.',
        '.2mp2............2pmp2..',
        '........................',
        '........................',
      ], 24);
    }
  }
  const BAT_HD_F1 = batHD(0);
  const BAT_HD_F2 = batHD(1);
  const BAT_HD_F3 = batHD(2);
  const BAT_HD_F4 = batHD(1);

  // ── SLIME HD — 24×16, wobbling green blob ──
  function slimeHD(phase) {
    const w = phase;
    if (w === 0) {
      return pad([
        '........................',
        '........................',
        '........11gggg11........',
        '......1ggGGGGGGgg1......',
        '.....1gGGhhhhhhGGg1.....',
        '....1gGhhhPPPhhhhGg1....',  // top highlight
        '....1gGhPP111PPhhGg1....',  // white shine
        '....1GGhhPPPhhhhhhg1....',
        '...1gGhhhhhhhhhhhhGg1...',
        '...1gGhhRRhhhRRhhhhGg1..',  // eyes
        '...1gGhhRRhhhRRhhhhGg1..',
        '...1gGhhhhhhhhhhhhhGg1..',
        '....1gGGhhhhhhhhhGGg1...',
        '.....1ggggggggggg1......',  // bottom curve
        '......1g..g..g..g1......',  // drips
        '........................',
      ], 24);
    } else {
      return pad([
        '........................',
        '........................',
        '..........1ggg11........',
        '........1gGGGGGgg1......',
        '......1gGGhhhhhGGg1.....',
        '.....1GGhhPPPhhhhGg1....',
        '....1gGhhPP111PPhhgg1...',
        '....1gGhPPP111hhhhgg1...',
        '...1gGhhhhhhhhhhhhgg1...',
        '...1gGhhRRhhhRRhhhhgg1..',
        '...1gGhhRRhhhRRhhhhgg1..',
        '...1gGhhhhhhhhhhhhhgg1..',
        '...1gGGGhhhhhhhhhGGg1...',
        '....1ggggggggggggg1.....',
        '......1g.g.g.g.g1.......',
        '........................',
      ], 24);
    }
  }
  const SLIME_HD_F1 = slimeHD(0);
  const SLIME_HD_F2 = slimeHD(1);
  const SLIME_HD_F3 = slimeHD(0);
  const SLIME_HD_F4 = slimeHD(1);

  // ── SPIDER HD — 24×24 menacing arachnid ──
  function spiderHD(legPhase) {
    const base = [
      '........................',
      '....1.................1.',
      '.....1...............1..',
      '......1.............1...',
      '.......11.........11....',
      '........1k1.....1k1.....',  // legs upper
      '........1kk1...1kk1.....',
      '........1kkk1.1kkk1.....',
      '........1kkkRRRkkk1.....',  // body top
      '........1kRRRRRRRk1.....',
      '........1RRRRRRRRR1.....',  // abdomen
      '........1RR1RR1RR1......',  // pattern
      '........1RRPRRRPRR1.....',  // eye spots
      '........1RRRRRRRRR1.....',
      '........1RRrrrrRRR1.....',  // belly
      '........1RRRRRRRRR1.....',
      '........1kkkkkkkk1......',
      '......11kkk1.1kkk11.....',  // legs lower
      '.....1k1.k1...1k.1k1....',
      '....1k1.................',
      '...1k1..................',
      '..1k1...................',
      '..k1....................',
      '........................',
    ];
    if (legPhase === 1) {
      // flex legs differently
      base[1] = '......1.............1...';
      base[2] = '.....1...............1..';
      base[3] = '......1.............1...';
      base[19] = '...1k1.................';
      base[20] = '..1k1..................';
      base[21] = '..k1...................';
    }
    return pad(base, 24);
  }
  const SPIDER_HD_F1 = spiderHD(0);
  const SPIDER_HD_F2 = spiderHD(1);
  const SPIDER_HD_F3 = spiderHD(0);
  const SPIDER_HD_F4 = spiderHD(1);

  // ── CHIMERA HD — 32×24 elite multi-form ──
  function chimeraHD(stage) {
    return pad([
      '................................',
      '..........6111....1116..........',  // horn tips
      '.........166......661...........',
      '........1ccc6666666cc6..........',
      '.......1cccc6666666cccc.........',  // mane
      '.......1ccddd6e0e6e0eddcc.......',  // glowing eyes
      '.......1cdddd6RRRRRRR6ddc.......',
      '.......1cdddcc66666cccddc.......',
      '.......1cccccc66666cccccc.......',
      '........1ddccccccccccddd........',  // jaw
      '........1cdddddddddddccd........',
      '.......1cccbbbbbbbbbcccc........',
      '......1cdcbbbbbbbbbbbcccc.......',  // body
      '....1cdbbbbbbbbbbbbbbbbbdc......',
      '..1cdbbbbbbbbbbbbbbbbbbbbdc.....',
      '.1cdbbbbbb..bb..bbbbb..bbdc.....',  // belly
      '..1cdbb.....bb.....bb...bdc.....',
      '...1cc.....bb.....bb....c.......',  // legs
      '...1aa.....aa.....aa....a.......',
      '................................',
      '................................',
      '................................',
      '................................',
      '................................',
    ], 32);
  }
  const CHIMERA_HD_A = chimeraHD(0);
  const CHIMERA_HD_B = chimeraHD(1);

  // Register
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      walker_hd_walk:  [WALKER_HD_A, WALKER_HD_B],
      runner_hd_walk:  [RUNNER_HD_F1, RUNNER_HD_F2, RUNNER_HD_F3, RUNNER_HD_F4],
      brute_hd_walk:   [BRUTE_HD_A, BRUTE_HD_B],
      elite_hd_walk:   [ELITE_HD_A, ELITE_HD_B],
      bat_hd_fly:      [BAT_HD_F1, BAT_HD_F2, BAT_HD_F3, BAT_HD_F4],
      slime_hd_idle:   [SLIME_HD_F1, SLIME_HD_F2, SLIME_HD_F3, SLIME_HD_F4],
      spider_hd_walk:  [SPIDER_HD_F1, SPIDER_HD_F2, SPIDER_HD_F3, SPIDER_HD_F4],
      chimera_hd_walk: [CHIMERA_HD_A, CHIMERA_HD_B],
    });
    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Common Enemies · HD (polished)',
        items: ['walker_hd_walk', 'runner_hd_walk', 'brute_hd_walk', 'elite_hd_walk',
                'bat_hd_fly', 'slime_hd_idle', 'spider_hd_walk', 'chimera_hd_walk'],
      });
    }
  }
  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      walker_hd_walk: 3,
      runner_hd_walk: 10,
      brute_hd_walk: 3,
      elite_hd_walk: 3,
      bat_hd_fly: 12,
      slime_hd_idle: 4,
      spider_hd_walk: 6,
      chimera_hd_walk: 3,
    });
  }
})();
