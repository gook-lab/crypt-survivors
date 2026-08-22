// HD3 heroes — 8-frame smooth walk cycles. Builds on the 48×48 HD3 base
// sprite from heroes_hd3.js by procedurally varying:
//   - leg position (lift/plant phase)
//   - body bob (1px up at mid-stride)
//   - cape/sleeve sway (1-2px shift on alternating sides)
//
// Frame indices 0..7 follow a classic walk cycle:
//   0: contact L     (feet apart, L forward)
//   1: down L        (body low, L planted)
//   2: passing L     (body high, R lifting)
//   3: up L          (body high, R passing)
//   4: contact R     (feet apart, R forward)
//   5: down R        (body low, R planted)
//   6: passing R     (body high, L lifting)
//   7: up R          (body high, L passing)

(function () {
  if (!window.SPRITES) return;

  // Body-bob offsets per phase (vertical pixel shift, -1 = up, 0 = neutral)
  const BOB = [0, 0, -1, -1, 0, 0, -1, -1];

  function shiftFrame(srcFrame, dy, leftLegX, rightLegX) {
    // srcFrame: 48 rows × 48 cols string array
    // dy: vertical shift (negative = body moves up, leaves bottom row blank)
    // leftLegX, rightLegX: horizontal pixel shift for leg blocks (rows 33..37)
    const W = 48, H = 48;
    const out = Array.from({ length: H }, () => '.'.repeat(W).split(''));
    for (let y = 0; y < H; y++) {
      const srcY = y - dy;
      if (srcY < 0 || srcY >= H) continue;
      const row = srcFrame[srcY];
      if (!row) continue;
      // Apply leg shifts on lower rows only (the body's leg region)
      const isLeftLegRegion = srcY >= 33 && srcY <= 39;
      for (let x = 0; x < W; x++) {
        const c = row[x] || '.';
        if (c === '.' || c === ' ') continue;
        let dx = 0;
        if (isLeftLegRegion) {
          // Determine which leg this pixel is on (left half vs right half of figure)
          // Figure is centered ~x=22. Left leg: x<22, Right leg: x>=22
          if (x < 22) dx = leftLegX;
          else dx = rightLegX;
        }
        const tx = x + dx;
        if (tx >= 0 && tx < W) out[y][tx] = c;
      }
    }
    return out.map((r) => r.join(''));
  }

  // Generate 8-frame walk from a single source frame (idle pose)
  function makeWalkCycle(srcFrame) {
    // Stride pattern: each frame defines leg shifts (Lx, Rx) + body bob
    const STRIDES = [
      { l:  1, r: -1 },  // 0: contact L (L slightly forward)
      { l:  0, r:  0 },  // 1: down L (planted)
      { l:  0, r:  0 },  // 2: passing L (body up)
      { l: -1, r:  1 },  // 3: up L (R coming through)
      { l: -1, r:  1 },  // 4: contact R (R forward)
      { l:  0, r:  0 },  // 5: down R (planted)
      { l:  0, r:  0 },  // 6: passing R (body up)
      { l:  1, r: -1 },  // 7: up R (L coming through)
    ];
    return STRIDES.map((s, i) => shiftFrame(srcFrame, BOB[i], s.l, s.r));
  }

  // Apply to all 5 HD3 heroes — use frame 0 (idle) as the base.
  const HEROES = ['knight', 'mage', 'warrior', 'huntress', 'cleric'];
  for (const id of HEROES) {
    const hd3 = window.SPRITES[id + '_hd3_walk'];
    if (!hd3 || !hd3[0]) continue;
    const cycle = makeWalkCycle(hd3[0]);
    window.SPRITES[id + '_smooth_walk'] = cycle;
    if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
      window.AtlasBuilder.FPS[id + '_smooth_walk'] = 12;  // 12fps for fluid walk
    }
  }

  if (window.SPRITE_GROUPS) {
    window.SPRITE_GROUPS.push({
      title: 'Heroes · Smooth Walk (8-frame, 12fps)',
      items: HEROES.map(h => h + '_smooth_walk'),
    });
  }

  // Optional: re-alias 'walk' keys to the 8-frame smooth versions for in-game
  if (window.HD2_ENABLED !== false && window.SPRITES) {
    // Apply lazily — only if HD2 already ran (smooth walk is a follow-up)
    for (const h of HEROES) {
      const smoothKey = h + '_smooth_walk';
      if (window.SPRITES[smoothKey]) {
        // Preserve previous mapping
        if (!window.SPRITES[h + '_walk_prev']) {
          window.SPRITES[h + '_walk_prev'] = window.SPRITES[h + '_walk'];
        }
        window.SPRITES[h + '_walk'] = window.SPRITES[smoothKey];
        if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
          window.AtlasBuilder.FPS[h + '_walk'] = 12;
        }
      }
    }
  }
})();
