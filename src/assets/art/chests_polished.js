// Polished chest sprites — overrides the small CHEST_* with proper
// chest silhouettes (curved lid, iron straps, gold lock plate).
// 16×14 px each. Original sprite keys are reassigned so existing code that
// references pickup_chest / pickup_chest_open / pickup_chest_gold still
// works — they just get the better art.

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }

  // ── Wood chest, closed (frame A — base) ────────────────────
  // Layout:
  //   row 0-1: dome lid (curved highlights)
  //   row 2-3: lid front
  //   row 4:   thin iron strap divider
  //   row 5-9: body with two iron vertical straps + gold lock plate
  //   row 10-12: base trim
  //   row 13: ground shadow
  const CHEST_WOOD_A = pad([
    '................',
    '....1aaaaaaa1...',  // curved dome top
    '...1abbbbbbba1..',  // dome body
    '..1abcbcbcbcba1.',  // dome wood grain
    '..1aaaaaaaaaaa1.',
    '..1kkkk1kkkkkk1.',  // iron strap divider
    '..1abcbcbcbcba1.',
    '..1abcb1YY1bcba1',  // lock plate top
    '..1abcb1Y91bcba1',  // gold lock
    '..1abcb1881bcba1',
    '..1abcbcbcbcba1.',
    '..1aaaaaaaaaaa1.',  // base
    '..1aakkkkkkkka1.',  // bottom iron band
    '..0000000000000.',  // shadow
  ], 16);

  // Frame B — same with subtle highlight glint on lid (idle anim)
  const CHEST_WOOD_B = pad([
    '................',
    '....1aaaaaaa1...',
    '...1abbbcPbba1..',  // small spec glint
    '..1abcbcbcbcba1.',
    '..1aaaaaaaaaaa1.',
    '..1kkkkkPkkkkk1.',  // strap spec
    '..1abcbcbcbcba1.',
    '..1abcb1YY1bcba1',
    '..1abcb1PP1bcba1',  // lock plate glints
    '..1abcb1981bcba1',
    '..1abcbcbcbcba1.',
    '..1aaaaaaaaaaa1.',
    '..1aakkkkkkkka1.',
    '..0000000000000.',
  ], 16);

  // ── Wood chest, open — lid up + gold spill out ─────────────
  const CHEST_WOOD_OPEN = pad([
    '....1aaaaaaa1...',  // lid raised up
    '...1abcbcbcba1..',
    '...1aaaaaaaaa1..',
    '...1kkkkkkkkk1..',  // lid strap (now top-edge)
    '....fefefefef...',  // gold sparkles / glow rising
    '...feYYYYYYYef..',
    '..1aaaaaaaaaaa1.',  // body opening
    '..1aYYY9889YYa1.',  // gold pile inside top
    '..1a999P88P99a1.',  // bright gold spec
    '..1abcbcbcbcba1.',  // body sides
    '..1abcbcbcbcba1.',
    '..1aaaaaaaaaaa1.',
    '..1aakkkkkkkka1.',
    '..0000000000000.',
  ], 16);

  // ── Gold chest (rare) — brassy dome + gem on lid ───────────
  const CHEST_GOLD_A = pad([
    '................',
    '....1YYYYYYY1...',
    '...1Y999999Y1...',
    '..1Y98P9889Y1...',  // dome with spec
    '..1Y999988899Y1.',
    '..1888888889Y91.',  // dome shading
    '..1Y9988N89999Y1',  // mid band + gem
    '..1Y9888NN8889Y1',  // gem center (cyan)
    '..1Y99888889999Y',  // body
    '..1Y8898988889Y1',
    '..1Y998998998YY1',
    '..1Y9888888889Y1',  // base
    '..1Y88kkkkkk88Y1',  // ornate bottom band
    '..0000000000000.',
  ], 16);
  const CHEST_GOLD_B = pad([
    '................',
    '....1YYYYYYY1...',
    '...1YP9999PY1...',  // glints
    '..1Y98P9889Y1...',
    '..1Y999988899Y1.',
    '..1888888889YP1.',
    '..1Y9988P89999Y1',  // gem pulse
    '..1Y9888qq8889Y1',  // cyan gem brighter
    '..1Y9988P889999Y',
    '..1Y8898988889Y1',
    '..1Y998998998YY1',
    '..1Y9888888889Y1',
    '..1Y88kkkkkk88Y1',
    '..0000000000000.',
  ], 16);

  // ── Cursed chest — purple/black with red ember eyes ────────
  const CHEST_CURSED_A = pad([
    '................',
    '....1ppmmppp1...',
    '...1pmMMMMpp1...',  // arcane dome
    '..1pmMMmMMmmp1..',
    '..1pmmmmMmmmpp1.',
    '..1kkkkk1kkkkk1.',  // iron strap
    '..1pmRR1pp1RRmp1',  // red ember eyes left/right of lock
    '..1pmRR1pp1RRmp1',
    '..1pmmm1881mmmp1',  // dark lock
    '..1pmmmmmmmmmmp1',
    '..1pmppmppmppmp1',  // body cracked
    '..1pppppppppppp1',
    '..1ppkkkkkkkkpp1',
    '..0000000000000.',
  ], 16);
  const CHEST_CURSED_B = pad([
    '................',
    '....1ppmMppp1...',
    '...1pmMqMMpp1...',  // pulse (q)
    '..1pmMMmMMmmp1..',
    '..1pmmmmMmmmpp1.',
    '..1kkkkk1kkkkk1.',
    '..1pmRP1pp1PRmp1',  // brighter eye glow
    '..1pmPR1pp1RPmp1',
    '..1pmmm1881mmmp1',
    '..1pmmmmmmmmmmp1',
    '..1pmppmppmppmp1',
    '..1pppppppppppp1',
    '..1ppkkkkkkkkpp1',
    '..0000000000000.',
  ], 16);

  // ── Boss chest — gold + multiple gems + crown engraving ────
  const CHEST_BOSS_A = pad([
    '................',
    '...YY1YYYYY1YY..',  // crown spires on lid
    '..1YY8YYYYY8YY1.',
    '..1Y998PPP899Y1.',  // crown gem row top
    '..1Y9N889889N9Y1',  // cyan gems either side
    '..1Y9988N98899Y1',  // big arcane gem center
    '..1Y998MMMM899Y1',  // arcane glow
    '..1Y9999MM9999Y1',  // body line
    '..1Y888988889Y91',
    '..1Y998998998YY1',
    '..1Y888998888Y91',
    '..1Y998888889YY1',
    '..1Y88kkkkkk88Y1',
    '..0000000000000.',
  ], 16);
  const CHEST_BOSS_B = pad([
    '................',
    '...YP1YYYYY1PY..',  // crown spires gleam
    '..1YY8YYYYY8YY1.',
    '..1Y998PPP899Y1.',
    '..1Y9q889889q9Y1',  // gems pulse cyan-bright
    '..1Y9988q98899Y1',
    '..1Y998MqqM899Y1',
    '..1Y9999Mq9999Y1',
    '..1Y888P88889Y91',  // body spec
    '..1Y998998998YY1',
    '..1Y888998888Y91',
    '..1Y998888889YY1',
    '..1Y88kkkkkk88Y1',
    '..0000000000000.',
  ], 16);

  // ── Re-register: existing keys get the new art ─────────────
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      // Original key — wooden chest (used everywhere existing)
      pickup_chest: [CHEST_WOOD_A, CHEST_WOOD_B],
      pickup_chest_open: [CHEST_WOOD_OPEN],
      // Gold chest gets the brassy variant
      pickup_chest_gold: [CHEST_GOLD_A, CHEST_GOLD_B],
      // New keys for cursed and boss variants used by gacha
      pickup_chest_cursed: [CHEST_CURSED_A, CHEST_CURSED_B],
      pickup_chest_boss: [CHEST_BOSS_A, CHEST_BOSS_B],
    });

    if (window.SPRITE_GROUPS) {
      // Add to existing pickup section
      window.SPRITE_GROUPS.push({
        title: 'Treasure Chests · Polished',
        items: ['pickup_chest', 'pickup_chest_open', 'pickup_chest_gold',
                'pickup_chest_cursed', 'pickup_chest_boss'],
      });
    }
  }

  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      pickup_chest: 2,
      pickup_chest_gold: 2,
      pickup_chest_cursed: 3,
      pickup_chest_boss: 4,
    });
  }
})();
