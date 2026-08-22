// Polished skill VFX + void tile set — higher-detail magic effect sprites
// to replace the simpler procedural ones. Each multi-frame with smooth
// gradient cores, outer wisps, and proper outlines.

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }

  // ============================================================
  // VOID TILES — pure black with subtle purple/cyan stars
  // ============================================================
  // Base void: pitch black with sparse dim stars (background for space/limbo)
  const TILE_VOID_BASE = pad([
    '0000000000000000',
    '0000010000000000',
    '0000000000200000',
    '0000000000000000',
    '0010000000000010',
    '0000000200000000',
    '0000000000000000',
    '0000010000000000',
    '0000000000200000',
    '0010000000000000',
    '0000000000000010',
    '0000020000000000',
    '0000000000000000',
    '0010000000000000',
    '0000000000200000',
    '0000000000000000',
  ], 16);

  // Void with bright twinkling star
  const TILE_VOID_STAR = pad([
    '0000000000000000',
    '0000010000000000',
    '0000000000200000',
    '00000P0000000000',
    '0000PqP000000010',
    '00000P0000000000',  // bright star
    '0000000000000000',
    '0000000000200000',
    '0010000000000000',
    '0000000200000000',
    '0000000000000010',
    '0000020000000000',
    '0000000000000000',
    '0010000000000000',
    '0000000000200000',
    '0000000000000000',
  ], 16);

  // Void nebula — purple cloud accent (rare)
  const TILE_VOID_NEBULA = pad([
    '0000000000000000',
    '00000ppmpppp0000',
    '0000pmmmMmmmp000',  // purple cloud
    '0000pmMMMMMMmp00',
    '0000pmMMqqMMmp00',  // cyan core
    '0000pmMqPqMmpp00',
    '0000pmMMqMMmp000',
    '0000ppmMMMmpp000',
    '00000pppmpp00000',
    '0000010000000000',
    '0000000000200000',
    '0000000000000000',
    '0010000000000010',
    '0000000200000000',
    '0000000000000000',
    '0010000000000000',
  ], 16);

  // ============================================================
  // SKILL VFX POLISH — replacements for procedural fx
  // ============================================================

  // ★ EXPLOSION HD — 24×24, 6 frames, smooth gradient
  function explosionHD(r) {
    const W = 24, cx = 11.5, cy = 11.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= r - 4) g[y][x] = 'P';      // white core
      else if (d <= r - 3) g[y][x] = 'f'; // flame highlight
      else if (d <= r - 2) g[y][x] = 'e'; // flame mid
      else if (d <= r - 1) g[y][x] = 'd'; // ember
      else if (d <= r)     g[y][x] = 'a'; // soot edge
      else if (d <= r + 0.6) g[y][x] = '1'; // outline
    }
    return g.map((r) => r.join(''));
  }
  const EXPL_HD = [3, 6, 9, 11, 10, 7].map(explosionHD);

  // ★ ARCANE BURST HD — 20×20, 5 frames, purple→white core w/ rays
  function arcaneBurstHD(t) {
    const W = 20, cx = 9.5, cy = 9.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const coreR = 1 + t * 1.5;
    const outerR = 3 + t * 2;
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= coreR) g[y][x] = 'P';
      else if (d <= coreR + 1) g[y][x] = 'q';
      else if (d <= outerR - 1) g[y][x] = 'M';
      else if (d <= outerR) g[y][x] = 'm';
      else if (d <= outerR + 0.6 && t > 1) g[y][x] = 'p';
    }
    // 8 rays
    if (t > 0.5) {
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 + t * 0.3;
        for (let r = outerR; r < outerR + 2.5 + t; r += 0.5) {
          const x = Math.round(cx + Math.cos(a) * r);
          const y = Math.round(cy + Math.sin(a) * r);
          if (x >= 0 && x < W && y >= 0 && y < W && g[y][x] === '.') {
            g[y][x] = r < outerR + 1.5 ? 'M' : 'p';
          }
        }
      }
    }
    return g.map((r) => r.join(''));
  }
  const ARCANE_HD_1 = arcaneBurstHD(0.3);
  const ARCANE_HD_2 = arcaneBurstHD(0.8);
  const ARCANE_HD_3 = arcaneBurstHD(1.3);
  const ARCANE_HD_4 = arcaneBurstHD(1.8);
  const ARCANE_HD_5 = arcaneBurstHD(2.3);

  // ★ HOLY BEAM HD — 16×24 vertical pillar of light, 4 frames intensify
  function holyBeamHD(intensity) {
    const W = 16, H = 24;
    const g = Array.from({ length: H }, () => Array(W).fill('.'));
    const cx = 7.5;
    for (let y = 0; y < H; y++) {
      const halfW = 0.5 + intensity * 0.8 + (Math.sin(y * 0.5) * 0.3);
      for (let x = 0; x < W; x++) {
        const d = Math.abs(x - cx);
        if (d <= halfW - 0.8) g[y][x] = 'P';
        else if (d <= halfW) g[y][x] = 'Y';
        else if (d <= halfW + 1.5 && intensity > 0.5) g[y][x] = '9';
        else if (d <= halfW + 2.5 && intensity > 1.2) g[y][x] = '8';
      }
    }
    // bright caps
    if (intensity > 0.5) {
      for (let x = 5; x <= 10; x++) g[H - 1][x] = 'P';
      for (let x = 6; x <= 9; x++) g[H - 2][x] = 'Y';
    }
    return g.map((r) => r.join(''));
  }
  const HOLY_BEAM_1 = holyBeamHD(0.4);
  const HOLY_BEAM_2 = holyBeamHD(0.9);
  const HOLY_BEAM_3 = holyBeamHD(1.6);
  const HOLY_BEAM_4 = holyBeamHD(1.2);

  // ★ ICE NOVA HD — 20×20, 5 frames, crystal shards radiating
  function iceNovaHD(t) {
    const W = 20, cx = 9.5, cy = 9.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const coreR = 1 + t * 0.5;
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= coreR) g[y][x] = 'P';
      else if (d <= coreR + 0.8) g[y][x] = 'W';
      else if (d <= coreR + 1.5 && t > 0.4) g[y][x] = 'I';
    }
    // Crystal shards in 6 directions
    if (t > 0.3) {
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3 + t * 0.2;
        const shardLen = 2 + t * 3;
        for (let r = 1.5; r < 1.5 + shardLen; r += 0.5) {
          const x = Math.round(cx + Math.cos(a) * r);
          const y = Math.round(cy + Math.sin(a) * r);
          if (x >= 0 && x < W && y >= 0 && y < W) {
            if (r < 1.5 + shardLen * 0.4) g[y][x] = 'W';
            else if (r < 1.5 + shardLen * 0.7) g[y][x] = 'I';
            else g[y][x] = 'i';
          }
        }
      }
    }
    return g.map((r) => r.join(''));
  }
  const ICE_NOVA_1 = iceNovaHD(0.2);
  const ICE_NOVA_2 = iceNovaHD(0.7);
  const ICE_NOVA_3 = iceNovaHD(1.3);
  const ICE_NOVA_4 = iceNovaHD(1.8);
  const ICE_NOVA_5 = iceNovaHD(2.3);

  // ★ LIGHTNING STRIKE HD — 12×24 jagged bolt, 4 frames flicker
  function lightningHD(rng) {
    const W = 12, H = 24;
    const g = Array.from({ length: H }, () => Array(W).fill('.'));
    let x = W / 2;
    // Use rng seed for jagged path
    for (let y = 0; y < H; y++) {
      const xR = Math.round(x);
      for (let dx = -1; dx <= 1; dx++) {
        const px = xR + dx;
        if (px < 0 || px >= W) continue;
        if (dx === 0) g[y][px] = 'P';
        else g[y][px] = 'W';
      }
      // Outer glow
      if (xR - 2 >= 0) g[y][xR - 2] = 'I';
      if (xR + 2 < W) g[y][xR + 2] = 'I';
      // Random kink
      x += Math.sin(y * 0.7 + rng) * 1.5;
      x = Math.max(2, Math.min(W - 3, x));
    }
    return g.map((r) => r.join(''));
  }
  const LIGHTNING_HD_1 = lightningHD(0);
  const LIGHTNING_HD_2 = lightningHD(1.7);
  const LIGHTNING_HD_3 = lightningHD(3.3);
  const LIGHTNING_HD_4 = lightningHD(5.0);

  // ★ POISON CLOUD HD — 20×20, 4 frames, drifting green sickness
  function poisonCloudHD(t) {
    const W = 20, cx = 9.5, cy = 9.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const r = 5 + t * 1.5;
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const noise = Math.sin(x * 0.8 + t * 2) * 0.6 + Math.cos(y * 0.7 - t) * 0.6;
      const effR = r + noise;
      if (d <= effR - 3) g[y][x] = 'G';
      else if (d <= effR - 1.5) g[y][x] = 'h';
      else if (d <= effR) g[y][x] = 'g';
      else if (d <= effR + 0.8) g[y][x] = 'p';
    }
    // Bubbles
    if (t > 0.4) {
      g[Math.round(cy - 2)][Math.round(cx - 1)] = 'P';
      g[Math.round(cy + 1)][Math.round(cx + 3)] = 'h';
      g[Math.round(cy + 3)][Math.round(cx - 2)] = 'h';
    }
    return g.map((r) => r.join(''));
  }
  const POISON_HD_1 = poisonCloudHD(0.2);
  const POISON_HD_2 = poisonCloudHD(0.8);
  const POISON_HD_3 = poisonCloudHD(1.4);
  const POISON_HD_4 = poisonCloudHD(2.0);

  // ★ SOUL DRAIN HD — 8×16 wisp rising, 4 frames
  const SOUL_DRAIN_1 = pad([
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '...P....',
    '..PWP...',
    '..WMW...',
    '..MmM...',
    '...m....',
    '...p....',
    '........',
    '........',
    '........',
    '........',
  ], 8);
  const SOUL_DRAIN_2 = pad([
    '........',
    '........',
    '........',
    '...P....',
    '..PWP...',
    '..WqW...',
    '..MqM...',
    '..MmM...',
    '..mpm...',
    '..pp....',
    '...p....',
    '........',
    '........',
    '........',
    '........',
    '........',
  ], 8);
  const SOUL_DRAIN_3 = pad([
    '...P....',
    '..PWP...',
    '..WqW...',
    '..qqq...',
    '..MMM...',
    '..MqM...',
    '..mqm...',
    '..pmp...',
    '..pp....',
    '...p....',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
  ], 8);
  const SOUL_DRAIN_4 = pad([
    '..PPP...',
    '..PqP...',
    '..qq....',
    '...M....',
    '...m....',
    '...p....',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
    '........',
  ], 8);

  // ★ SHIELD HEX HD — 18×18 hexagonal magic shield pattern, 3 frames pulse
  function shieldHexHD(pulse) {
    const W = 18, cx = 8.5, cy = 8.5, R = 8;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d > R) continue;
      // Hexagonal pattern based on angle
      const ang = Math.atan2(y - cy, x - cx);
      const sector = Math.floor((ang + Math.PI) / (Math.PI / 3));
      if (Math.abs(d - R) < 0.7) g[y][x] = pulse ? 'P' : 'W';
      else if (Math.abs(d - R + 1) < 0.6) g[y][x] = pulse ? 'W' : 'I';
      // Internal hex lines
      const innerR = R - 2;
      if (Math.abs(d - innerR) < 0.5) g[y][x] = 'I';
      // Hex vertices
      for (let i = 0; i < 6; i++) {
        const va = i * Math.PI / 3;
        const vx = cx + Math.cos(va) * (R - 1);
        const vy = cy + Math.sin(va) * (R - 1);
        if (Math.abs(x - vx) < 1 && Math.abs(y - vy) < 1) g[y][x] = 'P';
      }
    }
    return g.map((r) => r.join(''));
  }
  const SHIELD_HEX_1 = shieldHexHD(false);
  const SHIELD_HEX_2 = shieldHexHD(true);

  // ★ BLACK HOLE HD — 20×20, 4 frames inward spiral
  function blackHoleHD(rot) {
    const W = 20, cx = 9.5, cy = 9.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const dx = x - cx, dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const a = Math.atan2(dy, dx) + rot;
      if (d < 2) g[y][x] = '0';                  // event horizon
      else if (d < 3) g[y][x] = 'p';
      else if (d < 4.5) g[y][x] = 'm';
      else if (d > 7 && d < 9) {                 // accretion ring
        const swirl = Math.sin(a * 3 + d * 0.5);
        if (swirl > 0.6) g[y][x] = 'P';
        else if (swirl > 0.2) g[y][x] = 'q';
        else if (swirl > -0.2) g[y][x] = 'M';
      } else if (d >= 9 && d < 9.7) g[y][x] = '1';
    }
    return g.map((r) => r.join(''));
  }
  const BLACK_HOLE_1 = blackHoleHD(0);
  const BLACK_HOLE_2 = blackHoleHD(1.5);
  const BLACK_HOLE_3 = blackHoleHD(3.0);
  const BLACK_HOLE_4 = blackHoleHD(4.5);

  // Register
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      tile_void:        [TILE_VOID_BASE],
      tile_void_star:   [TILE_VOID_STAR],
      tile_void_nebula: [TILE_VOID_NEBULA],
      fx_explosion_hd:    EXPL_HD,
      fx_arcane_burst_hd: [ARCANE_HD_1, ARCANE_HD_2, ARCANE_HD_3, ARCANE_HD_4, ARCANE_HD_5],
      fx_holy_beam_hd:    [HOLY_BEAM_1, HOLY_BEAM_2, HOLY_BEAM_3, HOLY_BEAM_4],
      fx_ice_nova_hd:     [ICE_NOVA_1, ICE_NOVA_2, ICE_NOVA_3, ICE_NOVA_4, ICE_NOVA_5],
      fx_lightning_hd:    [LIGHTNING_HD_1, LIGHTNING_HD_2, LIGHTNING_HD_3, LIGHTNING_HD_4],
      fx_poison_cloud_hd: [POISON_HD_1, POISON_HD_2, POISON_HD_3, POISON_HD_4],
      fx_soul_drain_hd:   [SOUL_DRAIN_1, SOUL_DRAIN_2, SOUL_DRAIN_3, SOUL_DRAIN_4],
      fx_shield_hex_hd:   [SHIELD_HEX_1, SHIELD_HEX_2],
      fx_black_hole_hd:   [BLACK_HOLE_1, BLACK_HOLE_2, BLACK_HOLE_3, BLACK_HOLE_4],
    });
    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Tileset · Void',
        items: ['tile_void', 'tile_void_star', 'tile_void_nebula'],
      });
      window.SPRITE_GROUPS.push({
        title: 'Skill VFX · HD',
        items: ['fx_explosion_hd','fx_arcane_burst_hd','fx_holy_beam_hd','fx_ice_nova_hd',
                'fx_lightning_hd','fx_poison_cloud_hd','fx_soul_drain_hd',
                'fx_shield_hex_hd','fx_black_hole_hd'],
      });
    }
  }
  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      fx_explosion_hd: 22,
      fx_arcane_burst_hd: 18,
      fx_holy_beam_hd: 16,
      fx_ice_nova_hd: 18,
      fx_lightning_hd: 22,
      fx_poison_cloud_hd: 8,
      fx_soul_drain_hd: 12,
      fx_shield_hex_hd: 6,
      fx_black_hole_hd: 14,
    });
  }
})();
