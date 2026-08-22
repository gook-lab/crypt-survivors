// HD boss sprites — 48×48 polished with 4-tone shading per surface.
// Bigger silhouettes, more detail, deep night '1' outlines, lit top-left.

(function () {
  // Helper to pad rows to width N
  function pad(arr, n) {
    return arr.map((r) => {
      while (r.length < n) r += '.';
      return r.slice(0, n);
    });
  }

  // ============================================================
  // SKELETON KING HD — 48×48
  // ============================================================
  // Crowned skull with spires, ribcage armor, draping red robe.
  function skeletonKingHD(crownPulse) {
    const C = crownPulse ? 'q' : 'N';        // crown gems pulse cyan
    const G = crownPulse ? 'P' : 'Y';        // crown rim glow
    const eye = crownPulse ? 'P' : 'R';      // socket glow
    return pad([
      '................................................',
      '................................................',
      '...........1118181811181811118..................',
      '..........18Y888Y88Y88Y88Y88Y81.................',  // 5 crown spires
      '.........18Y' + G + G + 'Y' + G + G + 'Y' + G + G + 'Y' + G + G + 'Y' + G + G + 'Y81................',  // spire glow
      '.........18Y' + C + C + 'Y' + C + C + 'Y' + C + C + 'Y' + C + C + 'Y' + C + C + 'Y81................',  // crown band gems
      '..........18Y88888888888888Y81..................',
      '...........188Y8888888888Y881...................',  // crown bottom
      '............18888888888881......................',
      '.............166666666661.......................',  // skull top
      '............166777777776661.....................',
      '...........1677777777777771.....................',
      '...........17777777777777771....................',
      '...........17777' + eye + eye + '0' + eye + eye + '77777777771...................',  // sockets
      '...........17' + eye + eye + eye + 'r0r' + eye + eye + eye + '7777771...................',  // red glow inside
      '...........17' + eye + eye + 'rrrrr' + eye + eye + '7777771...................',
      '...........17777' + eye + eye + '0' + eye + eye + '77777771....................',
      '............16777777777777761...................',
      '.............17777777777777761..................',
      '..............1666666666666661..................',  // nose hole
      '...............16666777777661...................',  // teeth row
      '................1667.7.7.766661.................',  // tooth gaps
      '................166.6.6.6.6.661.................',
      '.................16........661..................',  // jaw bottom
      '..................166......661..................',  // collar gap
      '...................1aaaaaaaa1...................',
      '...................1arrrrrra1...................',  // robe top dark
      '.................11aaRRRRRRaa11.................',
      '................1aRRRRkRkRRRRa1.................',  // shoulders + bone spines
      '...............1aaRRRkkkkkRRRaa1................',
      '..............1aRRRRkkrkkRRRRRRa1...............',
      '..............1aRRRRkkrkkRRRRRRa1...............',
      '..............1aRRRRkrrrkRRRRRRa1...............',
      '..............1aRRRRkrrrkRRRRRRa1...............',
      '..............1aRRRRRRrRRRRRRRRa1...............',  // robe central rib
      '...............1aRRRRRRRRRRRRRa1................',
      '................1aRRRRRRRRRRRa1.................',
      '.................1aRRRRrRRRRRa1.................',
      '..................1aaaaraaaaaa1.................',
      '...................1aaaaaaaaa1..................',
      '...................1aaa..aaa1...................',  // legs splay
      '....................1aa1.1aa1...................',
      '....................1aa1.1aa1...................',
      '....................1aa1.1aa1...................',
      '....................1aaa.1aa1...................',
      '....................1aaa.1aaa1..................',
      '................................................',
      '................................................',
    ], 48);
  }
  const SKELETON_KING_HD_A = skeletonKingHD(false);
  const SKELETON_KING_HD_B = skeletonKingHD(true);

  // ============================================================
  // VAMPIRE LORD HD — 48×48
  // ============================================================
  // Caped noble with widow's peak, crimson eyes, gold-trim waistcoat.
  function vampireHD(armRaise) {
    return pad([
      '................................................',
      '................................................',
      '................11111111........................',
      '.............1112222222222111....................',  // hair top
      '............1222233333333322221..................',
      '...........122223334444433333321.................',  // hair shading
      '..........122233344455555444433221...............',
      '.........12233344556777777655443322...............',
      '.........12333344566777777766544322...............',
      '..........13334455667770007765443321..............',  // brow + widow peak
      '..........13334456677700000776643321..............',
      '..........1333456677ePeePePe776643321.............',  // glowing red eyes  (R/P alt)
      '..........13345566677RRRRRRR776543321.............',
      '..........1335566667777777777666543321.............',
      '...........1666677777777777777766543321............',  // cheekbones
      '............16777777.6677.6777776666431............',  // bridge of nose
      '............17777777.6666.7777777663321............',
      '............1777777.7aaaa.77777776633321...........',  // mouth + teeth area
      '.............17777aaaaaaaa77777733321.............',  // collar
      '............1Pa1aaaaaaaaa1aP11.aaaaaP1............',  // bowtie + cape arms
      '..........1PaPa1RRRRRRRRR1aPaaP1.........1aP1.....',
      '.........1PaaPa1RYYYRYYYR1aPaaaP1.......1aaaP1....',  // gold waistcoat trim
      '........1PaaaPa1RY9889Y9R1aPaaaaP1.....1aaaaaP1...',
      '........1PaaaaPaR98P99P89RaPaaaaaaP1..1aaaaaaaP1..',  // gold cross detail
      '........1PaaaaaaR9PPP8PP9RaaaaaaaaP1.1aaaaaaaaP1..',
      '........1PaaaaaaR98P99P89RaaaaaaaaP1.1aaaaaaaaP1..',
      '........1PaaaaaaaY99889Y9aaaaaaaaaP1.1aaaaaaaaP1..',
      '.........1PaaaaaaYY9999YYaaaaaaaaP1...1aaaaaaP1...',
      '..........1PaaaaaaYYYYYYaaaaaaaaP1.....1aaaaP1....',
      '...........1PaaaaaaRRRRRaaaaaaaP1.......1aaP1.....',
      '............1PaaaaaaaaaaaaaaaaP1.........1P1......',  // cape narrowing
      '.............1PPaaaaaaaaaaaaPP1...................',
      '..............1PPaaRRRRRRaaPP1....................',  // belt across
      '...............1PPaa....aaPP1.....................',
      '................1PPaa..aaPP1......................',  // hem opening
      '................1PPaa..aaPP1......................',
      '.................1aa1..1aa1.......................',
      '.................1aa1..1aa1.......................',
      '..................11....11........................',
      '................................................',
      '................................................',
      '................................................',
      '................................................',
      '................................................',
      '................................................',
      '................................................',
      '................................................',
    ], 48);
  }
  const VAMPIRE_HD_A = vampireHD(false);
  const VAMPIRE_HD_B = vampireHD(true).map((r, i) => {
    // Subtle cape sway on frame B
    if (i >= 21 && i <= 30) return ('.' + r).slice(0, 48);
    return r;
  });

  // ============================================================
  // DEMON / PYROLORD HD — 48×48
  // ============================================================
  // Horned crimson colossus, glowing chest brand, cloven hooves.
  function demonHD(eyeColor) {
    return pad([
      '................................................',
      '..............16................16..............',  // horn tips
      '.............166...............661..............',
      '............16d6..............6d61..............',
      '...........16dd6.............66dd1..............',  // horn arch
      '...........16ddd66.........66ddd61..............',
      '...........16dddd66.......66dddd61..............',
      '...........16ddddd66.....66ddddd61..............',
      '............166ddddrrrrrrrrddddd61...............',
      '.............166rrrrrrrrrrrrrr661................',
      '.............16rdddrrrrrrdddrrrr61...............',  // brow ridge
      '............16RR111rrrrrrr111RRR61...............',
      '............16RR' + eyeColor + 'RRRRRRRRR' + eyeColor + 'RR61...............',  // eye glow
      '............16RRR' + eyeColor + eyeColor + 'rrrrrrr' + eyeColor + eyeColor + 'RR61...............',
      '............16RRrrrrrrrrrrrrrRRR61...............',
      '............16RRRRddrrrrrddRRRRR61...............',  // cheekbones
      '.............16RRRdrdrrrdrdRRRRR61...............',
      '.............16RRRdrrrdrrrdrRRRR61...............',
      '..............16RRRdrrrrdrrrRRR61................',  // teeth
      '..............16RRRRrrrdrrrRRRRR61...............',
      '...............16RRRRdRRRdRRRR661................',
      '................16RRRRRRrRRRRR61.................',  // chin
      '................1aaRRRRrrRRRRaa1.................',
      '...............1aRRRRRRRdRRRRRRa1................',  // shoulders
      '..............1aRRRRRRddrddRRRRa1................',
      '.............1aRRRRRRRdrrrdRRRRa1................',
      '............1aRRRRRRddrrrdrdRRRRa1...............',
      '............1aRRRRRRddYY8YYddRRRa1...............',  // chest brand top
      '............1aRRRRRdY9988889YdRRa1...............',
      '............1aRRRRdY9988P88989YRRa1..............',  // brand glow
      '............1aRRRRdY988PPP889YRRRa1..............',
      '............1aRRRRdY9988P88989YRRa1..............',
      '............1aRRRRRdY988888YdRRRa1...............',
      '............1aRRRRRRdYY888YdRRRRa1...............',  // brand bottom
      '.............1aRRRRRRRdrrrdRRRRa1................',
      '..............1aRRRRRRRdrrRRRRa1.................',
      '...............1aaRRRRRRrRRRRaa1.................',
      '.................1aaRRRRrRRRaa1..................',
      '...................1aRRRrRRR1....................',  // hip
      '...................1aRR.rRR1.....................',
      '...................1aRR.RRRa1....................',
      '...................1aRR.RRa1.....................',  // legs split
      '....................1kk.kk1......................',  // hooves
      '....................1k0.0k1......................',
      '....................1000001......................',
      '................................................',
      '................................................',
      '................................................',
    ], 48);
  }
  const DEMON_HD_A = demonHD('1');  // pitch eyes
  const DEMON_HD_B = demonHD('R');  // red glowing

  // ============================================================
  // LICH / BOSS_IDLE HD — 48×48
  // ============================================================
  // Floating skull mage with arcane orb between hands.
  function lichHD(orbPulse) {
    const O = orbPulse ? 'q' : 'N';
    const OO = orbPulse ? 'P' : 'q';
    return pad([
      '................................................',
      '..............11mmmmmm11........................',  // hood top
      '............11mppppppppmm11......................',
      '...........1mpppMMMMpppppmm1.....................',  // hood shading
      '..........1mppMMMMMMMMpppppm1....................',
      '.........1mpMMMMMMMMMMMMpppm1....................',
      '.........1mpMMM666666MMMMppm1....................',  // skull edge
      '........1mpMMMM67777776MMMMpm1...................',
      '........1mpMMM67777777776MMMpm1..................',  // skull
      '........1mpMMM6770000770776MMpm1.................',  // eye holes
      '........1mpMMM6770RRRR077076MMpm1................',  // red glow
      '........1mpMMM67770RRRR0770076Mpm1...............',
      '........1mpMMMM67770000770076MMpm1...............',
      '........1mpMMMM6777777777776MMMpm1...............',
      '.........1mppMMM67.7.7.7.7766MMpm1...............',  // teeth
      '..........1mppMMM66666666MMMppm1.................',
      '...........1mpppMMMMMMMMMMppppm1.................',  // jaw / robe top
      '...........1mppppMMMMMMMpppppppm1................',
      '..........1mppMMMMMMMMMMMMpppppppm1..............',  // robe widens
      '..........1mpMMpppppMMpppMpppppppm1..............',
      '.........1mpMMpppppppppMMpppppppppm1.............',
      '........1mpMMMpppMMMMMMpppMpppppppm1.............',  // arms
      '.......1mpMMMpppM........MMpppppppm1.............',
      '......1mppMMpppM.NqqqqqqN.MpppppppM1.............',  // orb top
      '......1pMMMpppM.qN' + O + O + O + O + O + O + 'Nq.MpppppM1..............',
      '......1pMMMpppM.qN' + O + OO + OO + O + O + O + 'Nq.MpppppM1..............',  // orb glow
      '......1pMMMpppM.qN' + O + OO + 'P' + OO + O + O + 'Nq.MpppppM1..............',  // orb spec
      '......1pMMMpppM.qN' + O + O + O + O + O + O + 'Nq.MpppppM1..............',
      '......1pMMMpppM.NqqqqqqN.MpppppM1................',  // orb bottom
      '.......1mpMMMpppM........MMpppppm1...............',
      '........1mpMMMpppMMMMMMpppMpppm1.................',
      '.........1mpMMMpppppppppMMppppm1.................',  // robe narrowing
      '..........1mpMMMpppppppMMpppppm1.................',
      '...........1mpMMMpppppMMpppppm1..................',
      '............1mpMMMMMMpMpppppm1...................',
      '.............1mpMMMMMpppppm1.....................',  // hem
      '..............1mpMMMMpppppm1.....................',
      '...............1mmppppppppm1.....................',
      '................1mmmpppppmm1.....................',
      '.................1mmmpppmmm1.....................',
      '..................1mmmmm1mm1.....................',
      '...................1mmm1.1mm1....................',
      '....................11....11.....................',
      '................................................',
      '................................................',
      '................................................',
      '................................................',
      '................................................',
    ], 48);
  }
  const LICH_HD_A = lichHD(false);
  const LICH_HD_B = lichHD(true);

  // Register all HD bosses
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      boss_skeleton_king_hd: [SKELETON_KING_HD_A, SKELETON_KING_HD_B],
      boss_vampire_hd:       [VAMPIRE_HD_A, VAMPIRE_HD_B],
      boss_pyrolord_hd:      [DEMON_HD_A, DEMON_HD_B],
      boss_demon_hd:         [DEMON_HD_A, DEMON_HD_B],
      boss_frost_dragon_hd:  [LICH_HD_A, LICH_HD_B],
      boss_lich_hd:          [LICH_HD_A, LICH_HD_B],
    });
    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Bosses · HD (48×48, polished)',
        items: ['boss_skeleton_king_hd', 'boss_vampire_hd', 'boss_demon_hd', 'boss_pyrolord_hd', 'boss_lich_hd', 'boss_frost_dragon_hd'],
      });
    }
  }
  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      boss_skeleton_king_hd: 2,
      boss_vampire_hd: 3,
      boss_demon_hd: 4,
      boss_pyrolord_hd: 4,
      boss_lich_hd: 4,
      boss_frost_dragon_hd: 4,
    });
  }
})();
