// Enemies HD2 — hand-drawn 24×24 polish for the most common enemies.
// Replaces the simpler procedural enemies_hd.js versions with proper
// multi-tone shading, outlines, and recognizable silhouettes.

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }

  // ── WALKER HD2 — 24×24 hunched zombie ghoul ──
  function walkerHD2(bob) {
    return pad([
      '........................',
      '........................',
      '........1ggGggg1........',
      '.......1gGGhhhGGg1......',  // skull cap
      '......1gGhhPPPhhhGg1....',  // top highlights
      '......1gGh100011hGg1....',  // sunken eyes (pitch)
      '......1gGh1RRrR1hGg1....',  // bloody eyes
      '......1gGhhRRRhhhGg1....',
      '......1gGhh1Rr1hhGg1....',  // mouth dark
      '.......1ggGhhGGGgg1.....',
      '......1bbGGGGGGGbb1.....',  // shoulders + tattered cloth
      '....1bbGhhhGGGhhhGbb1...',
      '....1bGhhPGGGhPhhhGbb1..',  // chest highlights
      '....1bGhPGGGGGGhPhGb1...',
      '....1bGGGgGGGGGgGGGb1...',
      '....1bGGGgGGGGGgGGGb1...',
      '.....1bGGgggGgggGGb1....',
      '......1gG..GG..Gg1......',  // hip cutout
      '......1g....g....g1.....',
      '......1g....g....g1.....',
      '......1aa..1aa..aa1.....',  // knees
      '......1a1...1a1.........',
      '......1aa...1aa.........',  // boots
      '........................',
    ], 24);
  }
  const WALKER_HD2_A = walkerHD2(0);
  const WALKER_HD2_B = walkerHD2(1);

  // ── RUNNER HD2 — 24×24 skeletal hellhound (side view) ──
  function runnerHD2(legPhase) {
    const base = [
      '........................',
      '........................',
      '..............1666661...',  // head
      '............16666777611.',
      '...........166677776611.',  // skull
      '..........1667710017661.',  // eye sockets pitch
      '.........166777ee0ee776.',  // red ember inside
      '.........166777RRRR776..',  // glow
      '.166.....1667777777766..',
      '16GG6...1666777777666...',  // body + spine
      '1GGGGG661...166666661...',
      '1GGgGGGGGgGGGGGGGGGG6...',  // ribcage
      '.1aaGGGGGgGGGGGGGGgGg...',
      '..1aGGGGGgGgGGGGgGGg1...',
      '...1ggGggggGGgggGggg1...',
      '....1g..gg..g.gg..g1....',  // 4 leg tops
      '....1k1.1k1.1k1.1k1.....',
      '....1k1.1k1.1k1.1k1.....',
      '....1k1.1k1.1k1.1k1.....',
      '....1k1.1k1.1k1.1k1.....',
      '....1a1.1a1.1a1.1a1.....',  // hooves
      '....1aa.1aa.1aa.1aa.....',
      '........................',
      '........................',
    ];
    if (legPhase === 1) {
      // Cycle: alternate legs lift
      base[15] = '....1...gg..g.gg....1...';
      base[16] = '....1k1.....1k1.........';
      base[17] = '....1k1.....1k1.........';
      base[18] = '....1k1.....1k1...1k1...';
      base[19] = '..............1k1.1k1...';
      base[20] = '..............1a1.1a1...';
      base[21] = '..............1aa.1aa...';
    }
    return pad(base, 24);
  }
  const RUNNER_HD2_F1 = runnerHD2(0);
  const RUNNER_HD2_F2 = runnerHD2(1);
  const RUNNER_HD2_F3 = runnerHD2(0);
  const RUNNER_HD2_F4 = runnerHD2(1);

  // ── BRUTE HD2 — 24×24 armored ogre with arcane chest gem ──
  function bruteHD2(pulse) {
    const G = pulse ? 'q' : 'M';
    return pad([
      '........................',
      '........................',
      '.........11mmmmm11......',
      '........1mppppppppm1....',  // helm top
      '.......1mpppMMMMMpppm1..',  // armor highlights
      '.......1mppMMMpMMMMppm..',
      '.......1mppM110010Mppm..',  // eye holes
      '.......1mppM11RR11Mppm..',  // red glow
      '.......1mppMM1MM1MMppm..',
      '.......1mppMMMMMMMMppm..',
      '........1mpppMMMpppm1...',
      '.......1mmpppppppppmm1..',  // shoulders
      '......1mppMM' + G + G + G + 'MMMppm1.',  // chest gem (arcane)
      '.....1mppMM' + G + G + 'P' + G + G + 'MMppm1',  // gem with spec
      '.....1mppMM' + G + G + G + G + G + 'MMppm1',
      '.....1mppMMM' + G + G + G + 'MMMppm1.',
      '.....1mppMMMMMMMMMMppm1.',
      '......1mppppMMMMpppm1...',
      '.......1mppppMMpppm1....',  // belt
      '........1mpp...pppm1....',
      '........1mp1...1pm1.....',  // legs split
      '........1ap1...1pa1.....',
      '........1aa1...1aa1.....',
      '........................',
    ], 24);
  }
  const BRUTE_HD2_A = bruteHD2(false);
  const BRUTE_HD2_B = bruteHD2(true);

  // ── ELITE HD2 — 24×24 horned knight enemy ──
  function eliteHD2(stride) {
    return pad([
      '........................',
      '........................',
      '......611111111166......',  // horned helm
      '.....61kkkkkkkk1166.....',
      '....61kkkIIIIIIIk16.....',
      '....1kIIIIIIIIIIk1......',  // helm top
      '....1kIIII1RR1IIIk1.....',  // red eye glow
      '....1kIIII1RR1IIIk1.....',
      '....1kIIIIIIIIIIk1......',
      '....1kkkkkIIIkkkkk1.....',
      '...1IIIIIIIIIIIIIIIIa1..',  // pauldrons
      '...1IIYYYYYY9999YYYYIc1.',  // gold crest
      '...1IIY99999999999Y9IIc1',  // chest gold
      '...1IIY988P88888P889YIc1',  // spec on chest
      '...1IIY988rrrrrr889YIIc1',  // spike row
      '...1IIY9888888888899YIIc',
      '...1IIYY99999999999YYIIc',
      '....1IIIYYYYYYYYYYIIIIc1',
      '.....1IIIIIIIIIIIIIc1...',  // belt
      '......1kkk1..1kkk1......',
      '......1kkk1..1kkk1......',  // legs
      '......1kkk1..1kkk1......',
      '......1aaa1..1aaa1......',  // boots
      '........................',
    ], 24);
  }
  const ELITE_HD2_A = eliteHD2(0);
  const ELITE_HD2_B = eliteHD2(1);

  // ── BAT HD2 — 24×16 with 4-frame flap ──
  function batHD2(wing) {
    if (wing === 0) {
      return pad([
        '........................',
        '.22..................22.',
        '2pp2................2pp2',
        '2pmm2..1pmmp1......2mmp2',  // wings up
        '2pmMm22pMMp22pmmp22mMmp2',
        '.2pMm22pmMmp22mMmp2mMp2.',
        '..2pMmMmRR0011RRMmMp2...',  // red eyes + pitch
        '...2pMMM00RRRR00MMMp2...',  // face
        '....2pMM1MMMMMM1MMp2....',
        '.....2pMmmmmmmmmMp2.....',  // body
        '......2pMMMMMMMp2.......',
        '.......2ppmmpp2.........',  // belly
        '........2pppp2..........',
        '.........2pp2...........',
        '..........22............',
        '........................',
      ], 24);
    } else if (wing === 1) {
      return pad([
        '........................',
        '........................',
        '....2pp2........2pp2....',
        '...2pmmp2......2pmmp2...',
        '..2pmMMmp2....2pmMMmp2..',
        '.2pmMMMmpmpmpmpmMMMmp2..',  // wings horizontal
        '2pmMMMmp.1pmmp1.pmMMMmp.',
        '.2pmMMmp2pmMMmp2pmMMmp2.',
        '..2pMmRR0011RR0011RRMp2.',
        '..2pMMM00RRRR00RRRR0Mp2.',
        '...2pMM1MMMMMMMMMMM1p2..',
        '....2pMmmmmmmmmmmmmp2...',
        '.....2pMMMMMMMMMMp2.....',
        '......2ppmmmmmmpp2......',
        '........2ppppp2.........',
        '..........2pp2..........',
      ], 24);
    } else if (wing === 2) {
      return pad([
        '........................',
        '..........2pp2..........',
        '.........2pmmp2.........',
        '........2pMmMmp2........',
        '........2pMMMmp2........',
        '.......2pmMRR0Mmp2......',  // wings down
        '......2pMMMRRMMMmp2.....',
        '.....2pMMMMM00MMMMmp2...',
        '....2pMMMMmmMMMMMMmp2...',
        '...2pMMMmpmpmpMMMMmp2...',
        '..2pmMMmp2..2pmMMMmp2...',
        '.2pmMMmp2....2pmMMMmp2..',
        '2pmMMmp2......2pmMMMmp2.',
        '.2pMmp2........2pmMMmp2.',
        '..2mp2..........2pMmp2..',
        '...2............2pm2....',
      ], 24);
    } else {
      return pad([
        '........................',
        '..2..................22.',
        '..2p2..............2pp2.',
        '..2pp2............2pmm2.',  // wings rising
        '..2pmm2..1pmmp1.2pmMm2..',
        '...2pMm22pMMp22pmMmp2...',
        '....2pMm0pMmMmp2pMmp2...',
        '.....2pMmMmRR0011RRMm2..',
        '......2pMM00RRRR00Mp2...',
        '.......2pMmMMMMMmMp2....',
        '........2pMmmmmmmp2.....',
        '.........2pMMMMMp2......',
        '..........2ppppp2.......',
        '...........2pp2.........',
        '............22..........',
        '........................',
      ], 24);
    }
  }
  const BAT_HD2_F1 = batHD2(0);
  const BAT_HD2_F2 = batHD2(1);
  const BAT_HD2_F3 = batHD2(2);
  const BAT_HD2_F4 = batHD2(3);

  // ── SLIME HD2 — 24×16 glossy green blob ──
  function slimeHD2(phase) {
    if (phase === 0) {
      return pad([
        '........................',
        '........................',
        '.......1ggGGGGgg1.......',
        '.....1gGGhhhhhhhhGg1....',  // top curve
        '....1gGhhhhhhhhhhhhGg1..',
        '....1gGhPPPP1hhhhhhhGg1.',  // top highlight
        '....1gGhPP11hhPPPhhhGg1.',  // second shine
        '...1gGhhhhhhhhhhhhhhhGg.',
        '...1gGhhhhhhhhhhhhhhhGg.',
        '...1gGhhRRhhhhRRhhhhhGg.',  // eyes
        '...1gGhh11hhhh11hhhhhGg.',
        '...1gGhhhhhh11hhhhhhhGg.',  // mouth subtle
        '....1gGGhhhhhhhhhhhhGg1.',
        '.....1ggGgGgggggggggg1..',
        '......1g..g..g..g..g1...',  // drips
        '........................',
      ], 24);
    } else {
      return pad([
        '........................',
        '........................',
        '.........1ggGgg1........',
        '.......1gGGhhhhGGg1.....',
        '......1gGhhhhhhhhGg1....',
        '....1gGhhhhPPP1hhhhGg1..',  // shifted highlight
        '....1gGhhhPP111hhhhGg1..',
        '....1gGhhhhhhhhhhhhhGg1.',
        '...1gGhhhhhhhhhhhhhhhGg.',
        '...1gGhhRRhhhhRRhhhhhGg.',
        '...1gGhh11hhhh11hhhhhGg.',
        '...1gGhhhhhhRhhhhhhhhGg.',  // squint mouth
        '....1gGGhhhhhhhhhhhhGg1.',
        '....1ggGgGgGGggGggGgg1..',  // squat
        '......1g.g..g..g.g.g1...',
        '........................',
      ], 24);
    }
  }
  const SLIME_HD2_F1 = slimeHD2(0);
  const SLIME_HD2_F2 = slimeHD2(1);
  const SLIME_HD2_F3 = slimeHD2(0);
  const SLIME_HD2_F4 = slimeHD2(1);

  // ── SPIDER HD2 — 24×24 menacing arachnid ──
  function spiderHD2(legs) {
    const base = [
      '........................',
      '...1k1...........1k1....',
      '....1kk1.........1kk1...',
      '.....1kk1.......1kk1....',
      '......1kk1.....1kk1.....',
      '.......1kk1...1kk1......',  // legs upper
      '.......1kkkkRRkkkk1.....',
      '........1kkRRRRkk1......',  // body top
      '........1kRRRRRRk1......',
      '........1RRRRRRRR1......',
      '........1RRPRRPRR1......',  // eye spots
      '........1RRRRRRRR1......',  // abdomen
      '........1RRrrrRRR1......',
      '........1RRRRRRRR1......',
      '........1RRRRRRRR1......',
      '........1kRRRRRRk1......',  // belly
      '........1kkrrrrrk1......',
      '.......1kkkkrkkkkk1.....',
      '......1kk1.....1kk1.....',  // legs lower
      '.....1kk1.......1kk1....',
      '....1kk1.........1kk1...',
      '...1kk1...........1kk1..',
      '...1a1.............1a1..',
      '........................',
    ];
    if (legs === 1) {
      // tilt legs slightly
      base[1] = '..1k1.............1k1...';
      base[2] = '...1kk1...........1kk1..';
      base[3] = '....1kk1.........1kk1...';
      base[4] = '.....1kk1.......1kk1....';
      base[5] = '......1kk1.....1kk1.....';
      base[18] = '.......1kk1...1kk1......';
      base[19] = '......1kk1.....1kk1.....';
      base[20] = '.....1kk1.......1kk1....';
      base[21] = '....1kk1.........1kk1...';
      base[22] = '...1a1.............1a1..';
    }
    return pad(base, 24);
  }
  const SPIDER_HD2_F1 = spiderHD2(0);
  const SPIDER_HD2_F2 = spiderHD2(1);
  const SPIDER_HD2_F3 = spiderHD2(0);
  const SPIDER_HD2_F4 = spiderHD2(1);

  // ── CRYPT ARCHER HD2 — 24×24 skeleton with bow ──
  function cryptArcherHD2(draw) {
    return pad([
      '........................',
      '........................',
      '........17777771........',  // skull
      '.......177ccccc771......',
      '......17cc11001cc71.....',  // sockets pitch
      '......17c1RRRR1c71......',  // red glow
      '......17ccccccccc1......',
      '......17777777771.......',  // jaw
      '......1bbbbbbbb1........',
      '.....1abbcccccbba1......',  // shoulders
      '....1abccccc.cccba1.....',
      '..6.1abccccc.ccccba1....',  // bow arm
      '.66.1bbcccc..ccccbb1.66.',  // arrow nock
      '666.1abcccc..ccccba1.66.',  // bow string
      '.66.1abccccc.cccba1..66.',
      '..6.1aabccccccccba1.66..',
      '.....1aabbbcbcbba1.6....',
      '......1aabbbbbba1.......',  // belt
      '.......1abbbba1.........',
      '.......1bb1bbba1........',
      '.......1bb1.bba1........',  // legs
      '.......1bb1.bba1........',
      '......1abba.abba1.......',  // bone feet
      '........................',
    ], 24);
  }
  const CRYPT_ARCHER_HD2_A = cryptArcherHD2(0);
  const CRYPT_ARCHER_HD2_B = cryptArcherHD2(1);

  // ── FOREST WOLF HD2 — 24×16 cursed wolf, side view ──
  function forestWolfHD2(phase) {
    return pad([
      '........................',
      '..............1666666...',  // head + ears
      '............166777777611',
      '...........16677710017761',
      '..........166777RRRR7766',  // red eyes
      '..........1667777777766.',
      '....1Gh...166777eRRe776.',  // green mouth/teeth
      '...1Ghhh..1667777777766.',  // body
      '..1GhhhhGgGGGGGGGGGG66..',
      '..1aaGhhhGGGGGgGGGGgGGg.',  // back
      '...1aaGGgGgGgGgGGgGgGGg.',
      '....1gggGggGggGggGggGgg.',  // belly
      phase === 0 ?
      '.....1g.g..g..g..g..g1..' :
      '.....1gg..g..g..g..gg1..',  // legs (phased)
      '.....1k1..1k1.1k1..1k1..',
      '.....1a1..1a1.1a1..1a1..',  // paws
      '........................',
    ], 24);
  }
  const FOREST_WOLF_HD2_A = forestWolfHD2(0);
  const FOREST_WOLF_HD2_B = forestWolfHD2(1);

  // ── ICE WISP HD2 — 24×24 floating ice spirit ──
  function iceWispHD2(pulse) {
    const W = 24, cx = 11.5, cy = 11.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    // Glow ring
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= 2) g[y][x] = 'P';                        // white core
      else if (d <= 3.5) g[y][x] = pulse ? 'P' : 'W';
      else if (d <= 5) g[y][x] = 'W';
      else if (d <= 6.5) g[y][x] = 'I';
      else if (d <= 8) g[y][x] = pulse ? 'I' : 'i';
      else if (d <= 9.5) g[y][x] = 'i';
      else if (d <= 10.5) g[y][x] = 'k';
      else if (d <= 11 && pulse) g[y][x] = '1';
    }
    // Crystal shards radiating
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 + (pulse ? 0.3 : 0);
      for (let r = 8; r <= 11; r += 0.5) {
        const x = Math.round(cx + Math.cos(a) * r);
        const y = Math.round(cy + Math.sin(a) * r);
        if (x >= 0 && x < W && y >= 0 && y < W) g[y][x] = 'W';
      }
    }
    return g.map((r) => r.join(''));
  }
  const ICE_WISP_HD2_A = iceWispHD2(false);
  const ICE_WISP_HD2_B = iceWispHD2(true);

  // ── VOLCANO IMP HD2 — 24×24 small red devil w/ wings ──
  function volcanoImpHD2(wing) {
    return pad([
      '........................',
      '........................',
      '........166661..........',
      '.......16RRRR61.........',  // head
      '......16RRdRdR61........',
      '......16R6010R61........',  // pitch eyes
      '.6....16RRRRRR61....6...',
      '.66...1666RRR661...66...',  // mouth + tiny horns
      '6dd6.....66RR66....6dd6.',  // wings + body
      '6ddd6...16RRR61...6ddd6.',
      '.6ddd6.1abRRRRba1.6ddd6.',  // arms
      '..6dd6.1abRRRRba1.6dd6..',
      wing === 0 ?
      '.66dd6.1aRRRRRRa1.6dd66.' :
      '6dddd6.1aRRRRRRa1.6dddd6',
      '6ddddd61aRrrRrRa16ddddd6',  // flame trail
      '.6dddd61aRRRRRRa16dddd6.',
      '..66dd61aRRRRRRa16dd66..',
      '....66.1aRRRRRRa1.66....',
      '.......1aRRRRRRa1.......',
      '.......1abRRRRba1.......',  // belt
      '........1aa1aa1.........',
      '........1k1.1k1.........',  // legs
      '........1k1.1k1.........',  // hooves
      '........1a1.1a1.........',
      '........................',
    ], 24);
  }
  const VOLCANO_IMP_HD2_A = volcanoImpHD2(0);
  const VOLCANO_IMP_HD2_B = volcanoImpHD2(1);

  // Register
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      walker_hd2_walk:    [WALKER_HD2_A, WALKER_HD2_B],
      runner_hd2_walk:    [RUNNER_HD2_F1, RUNNER_HD2_F2, RUNNER_HD2_F3, RUNNER_HD2_F4],
      brute_hd2_walk:     [BRUTE_HD2_A, BRUTE_HD2_B],
      elite_hd2_walk:     [ELITE_HD2_A, ELITE_HD2_B],
      bat_hd2_fly:        [BAT_HD2_F1, BAT_HD2_F2, BAT_HD2_F3, BAT_HD2_F4],
      slime_hd2_idle:     [SLIME_HD2_F1, SLIME_HD2_F2, SLIME_HD2_F3, SLIME_HD2_F4],
      spider_hd2_walk:    [SPIDER_HD2_F1, SPIDER_HD2_F2, SPIDER_HD2_F3, SPIDER_HD2_F4],
      crypt_archer_hd2:   [CRYPT_ARCHER_HD2_A, CRYPT_ARCHER_HD2_B],
      forest_wolf_hd2:    [FOREST_WOLF_HD2_A, FOREST_WOLF_HD2_B],
      ice_wisp_hd2:       [ICE_WISP_HD2_A, ICE_WISP_HD2_B],
      volcano_imp_hd2:    [VOLCANO_IMP_HD2_A, VOLCANO_IMP_HD2_B],
    });
    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Enemies · HD2 (24×24, 정교 패스)',
        items: ['walker_hd2_walk','runner_hd2_walk','brute_hd2_walk','elite_hd2_walk',
                'bat_hd2_fly','slime_hd2_idle','spider_hd2_walk',
                'crypt_archer_hd2','forest_wolf_hd2','ice_wisp_hd2','volcano_imp_hd2'],
      });
    }
  }
  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      walker_hd2_walk: 3, runner_hd2_walk: 10, brute_hd2_walk: 3,
      elite_hd2_walk: 3, bat_hd2_fly: 12, slime_hd2_idle: 4,
      spider_hd2_walk: 6, crypt_archer_hd2: 4, forest_wolf_hd2: 8,
      ice_wisp_hd2: 5, volcano_imp_hd2: 8,
    });
  }
})();
