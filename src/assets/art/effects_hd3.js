// Effects HD3 — 24-32px high-detail FX for Arsenal-tier polish.
// Replaces simpler procedural FX (fx_hit, fx_explosion, fx_slash, etc.) and
// weapon impact effects with rich multi-tone, outlined, smooth-gradient art.

(function () {
  function pad(arr, n) {
    return arr.map((r) => { while (r.length < n) r += '.'; return r.slice(0, n); });
  }

  // ── HIT SPARK HD3 — 24×24, 4 frames cross-flash with crystal shards
  function hitSparkHD3(t) {
    const W = 24, cx = 11.5, cy = 11.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const coreR = 0.5 + t * 1.5;
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= coreR) g[y][x] = 'P';
      else if (d <= coreR + 1) g[y][x] = 'f';
      else if (d <= coreR + 2 && t > 0.4) g[y][x] = 'e';
      else if (d <= coreR + 3 && t > 0.8) g[y][x] = 'd';
    }
    // 4 cardinal shards
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + t * 0.3;
      const len = 4 + t * 4;
      for (let r = coreR + 1; r < coreR + 1 + len; r += 0.5) {
        const x = Math.round(cx + Math.cos(a) * r);
        const y = Math.round(cy + Math.sin(a) * r);
        if (x >= 0 && x < W && y >= 0 && y < W) {
          if (r < coreR + 2) g[y][x] = 'P';
          else if (r < coreR + len * 0.6) g[y][x] = 'f';
          else g[y][x] = 'e';
        }
      }
    }
    // 4 diagonal smaller shards
    if (t > 0.4) {
      for (let i = 0; i < 4; i++) {
        const a = i * Math.PI / 2 + Math.PI / 4 + t * 0.3;
        const len = 2 + t * 2;
        for (let r = coreR + 1; r < coreR + 1 + len; r += 0.5) {
          const x = Math.round(cx + Math.cos(a) * r);
          const y = Math.round(cy + Math.sin(a) * r);
          if (x >= 0 && x < W && y >= 0 && y < W && g[y][x] === '.') {
            g[y][x] = r < coreR + 2 ? 'f' : 'd';
          }
        }
      }
    }
    return g.map((r) => r.join(''));
  }

  // ── EXPLOSION HD3 — 32×32, 6 frames, smooth fireball
  function explosionHD3(r) {
    const W = 32, cx = 15.5, cy = 15.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      // Noise-perturbed boundaries
      const noise = Math.sin(x * 0.5 + r) * 0.4 + Math.cos(y * 0.6 - r * 0.3) * 0.4;
      const er = r + noise;
      if (d <= er - 5) g[y][x] = 'P';
      else if (d <= er - 4) g[y][x] = 'f';
      else if (d <= er - 3) g[y][x] = 'e';
      else if (d <= er - 1.5) g[y][x] = 'd';
      else if (d <= er - 0.5) g[y][x] = 'a';
      else if (d <= er + 0.4) g[y][x] = '1';
    }
    // Inner sparkles
    if (r > 6) {
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 + r * 0.2;
        const sx = Math.round(cx + Math.cos(a) * (r * 0.6));
        const sy = Math.round(cy + Math.sin(a) * (r * 0.6));
        if (sx >= 0 && sx < W && sy >= 0 && sy < W) g[sy][sx] = 'P';
      }
    }
    return g.map((r) => r.join(''));
  }

  // ── SLASH ARC HD3 — 32×32, 4 frames sweeping crescent
  function slashArcHD3(phase) {
    const W = 32, cx = 15.5, cy = 15.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const r = 12;
    for (let a = -Math.PI * 0.55 + phase * 0.3; a < Math.PI * 0.55 + phase * 0.3; a += 0.025) {
      // Inner edge (bright)
      for (let dr = -1; dr <= 1; dr += 0.5) {
        const cur = r + dr - phase * 0.5;
        const x = Math.round(cx + Math.cos(a) * cur);
        const y = Math.round(cy + Math.sin(a) * cur);
        if (x >= 0 && x < W && y >= 0 && y < W) {
          if (Math.abs(dr) < 0.5) g[y][x] = 'P';
          else if (Math.abs(dr) < 1) g[y][x] = 'W';
          else g[y][x] = 'I';
        }
      }
      // Outline outer
      for (let dr = 1.5; dr <= 2.5; dr += 0.5) {
        const cur = r + dr - phase * 0.5;
        const x = Math.round(cx + Math.cos(a) * cur);
        const y = Math.round(cy + Math.sin(a) * cur);
        if (x >= 0 && x < W && y >= 0 && y < W && g[y][x] === '.') {
          g[y][x] = '1';
        }
      }
    }
    return g.map((r) => r.join(''));
  }

  // ── IMPACT PIERCE HD3 — 24×24 spear pierce w/ blood streak
  function piercedHD3(t) {
    const W = 24, cx = 11.5, cy = 11.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    // Pierce hole core
    const r = 1 + t * 0.5;
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= r) g[y][x] = '0';
      else if (d <= r + 0.7) g[y][x] = 'R';
      else if (d <= r + 1.5) g[y][x] = 'r';
    }
    // 2 directional shock lines
    for (let dx = -W; dx < W; dx++) {
      const x = Math.round(cx + dx);
      if (x < 0 || x >= W) continue;
      const dist = Math.abs(dx);
      if (dist < 2 || dist > 8 + t * 3) continue;
      const px = x, py = Math.round(cy);
      if (g[py][px] === '.') g[py][px] = dist < 5 ? 'P' : 'W';
    }
    // Blood drips (downward)
    if (t > 0.4) {
      for (let yy = Math.round(cy + r); yy < W; yy++) {
        if (Math.abs(yy - cy) < 2 + t * 3) {
          if (g[yy][Math.round(cx)] === '.') g[yy][Math.round(cx)] = 'r';
          if (yy % 2 === 0 && g[yy][Math.round(cx + 1)] === '.') g[yy][Math.round(cx + 1)] = 'R';
        }
      }
    }
    return g.map((r) => r.join(''));
  }

  // ── IMPACT BASH HD3 — 24×24 mace bash w/ shock waves
  function bashHD3(rad) {
    const W = 24, cx = 11.5, cy = 11.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    // Concentric rings
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (Math.abs(d - rad) < 0.5) g[y][x] = 'P';
      else if (Math.abs(d - rad) < 1.2) g[y][x] = 'Y';
      else if (Math.abs(d - rad) < 1.9) g[y][x] = '9';
      else if (Math.abs(d - rad) < 2.5) g[y][x] = '8';
      // Inner ring (smaller, fading)
      if (rad > 6) {
        const inner = rad - 4;
        if (Math.abs(d - inner) < 0.7) g[y][x] = 'f';
        else if (Math.abs(d - inner) < 1.5) g[y][x] = 'd';
      }
    }
    return g.map((r) => r.join(''));
  }

  // ── IMPACT MAGIC HD3 — 24×24 arcane crackle
  function magicHD3(t) {
    const W = 24, cx = 11.5, cy = 11.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const coreR = 1 + t * 1.5;
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= coreR) g[y][x] = 'P';
      else if (d <= coreR + 1) g[y][x] = 'q';
      else if (d <= coreR + 2) g[y][x] = 'M';
      else if (d <= coreR + 3 && t > 0.5) g[y][x] = 'm';
      else if (d <= coreR + 4 && t > 1) g[y][x] = 'p';
    }
    // 6 lightning-like arcs radiating
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3 + t * 0.4;
      let len = 4 + t * 5;
      for (let r = coreR + 1; r < coreR + 1 + len; r += 0.5) {
        // Wobbly arc
        const wobble = Math.sin(r * 0.8 + i) * 0.6;
        const x = Math.round(cx + Math.cos(a + wobble * 0.15) * r);
        const y = Math.round(cy + Math.sin(a + wobble * 0.15) * r);
        if (x >= 0 && x < W && y >= 0 && y < W) {
          if (r < coreR + 2) g[y][x] = 'P';
          else if (r < coreR + len * 0.5) g[y][x] = 'q';
          else g[y][x] = 'M';
        }
      }
    }
    return g.map((r) => r.join(''));
  }

  // ── IMPACT HOLY HD3 — 24×24 blazing gold cross
  function holyHD3(t) {
    const W = 24, cx = 11.5, cy = 11.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const armLen = 4 + t * 6;
    const armW = 0.8 + t * 0.5;
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const dx = Math.abs(x - cx), dy = Math.abs(y - cy);
      // vertical arm
      if (dx <= armW && dy <= armLen) {
        if (dx < 0.6 && dy < armLen - 2) g[y][x] = 'P';
        else if (dx < armW - 0.4) g[y][x] = 'Y';
        else g[y][x] = '9';
      }
      // horizontal arm
      if (dy <= armW && dx <= armLen) {
        if (dy < 0.6 && dx < armLen - 2) g[y][x] = 'P';
        else if (dy < armW - 0.4) g[y][x] = 'Y';
        else g[y][x] = '9';
      }
      // Center spec
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 1.2) g[y][x] = 'P';
    }
    // Halo rays at peak
    if (t > 1.2) {
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 + t * 0.2;
        const r = armLen + 2;
        const x = Math.round(cx + Math.cos(a) * r);
        const y = Math.round(cy + Math.sin(a) * r);
        if (x >= 0 && x < W && y >= 0 && y < W) g[y][x] = 'Y';
      }
    }
    return g.map((r) => r.join(''));
  }

  // ── IMPACT FIRE HD3 — 24×24 flaming burst
  function fireHD3(t) {
    const W = 24, cx = 11.5, cy = 11.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    // Core fireball
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      const noise = Math.sin(x * 0.6) * 0.5 + Math.cos(y * 0.7) * 0.5;
      const r = 3 + t * 2 + noise;
      if (d <= r - 2) g[y][x] = 'P';
      else if (d <= r - 1.2) g[y][x] = 'f';
      else if (d <= r - 0.5) g[y][x] = 'e';
      else if (d <= r) g[y][x] = 'd';
      else if (d <= r + 0.7) g[y][x] = 'a';
    }
    // Tongues of fire
    if (t > 0.4) {
      for (let i = 0; i < 5; i++) {
        const a = i * (Math.PI * 2 / 5) + t * 0.3 - Math.PI / 2;
        const len = 3 + t * 3;
        for (let r = 3; r < 3 + len; r += 0.5) {
          const x = Math.round(cx + Math.cos(a) * r);
          const y = Math.round(cy + Math.sin(a) * r - 0.5); // bias upward
          if (x >= 0 && x < W && y >= 0 && y < W) {
            if (r < 4) g[y][x] = 'f';
            else if (r < 4 + len * 0.5) g[y][x] = 'e';
            else g[y][x] = 'd';
          }
        }
      }
    }
    return g.map((r) => r.join(''));
  }

  // ── IMPACT ICE HD3 — 24×24 frozen crystal burst
  function iceHD3(t) {
    const W = 24, cx = 11.5, cy = 11.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const coreR = 1 + t * 0.8;
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= coreR) g[y][x] = 'P';
      else if (d <= coreR + 1) g[y][x] = 'W';
      else if (d <= coreR + 1.8 && t > 0.4) g[y][x] = 'I';
    }
    // 8-pointed crystal star
    if (t > 0.3) {
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4 + t * 0.1;
        const shardLen = i % 2 === 0 ? 5 + t * 4 : 3 + t * 2;
        for (let r = coreR + 1; r < coreR + 1 + shardLen; r += 0.4) {
          const x = Math.round(cx + Math.cos(a) * r);
          const y = Math.round(cy + Math.sin(a) * r);
          if (x >= 0 && x < W && y >= 0 && y < W) {
            const closeness = (r - coreR - 1) / shardLen;
            if (closeness < 0.3) g[y][x] = 'P';
            else if (closeness < 0.6) g[y][x] = 'W';
            else if (closeness < 0.9) g[y][x] = 'I';
            else g[y][x] = 'i';
          }
        }
      }
    }
    return g.map((r) => r.join(''));
  }

  // ── IMPACT SHOCK HD3 — 24×24 electric blast
  function shockHD3(t) {
    const W = 24, cx = 11.5, cy = 11.5;
    const g = Array.from({ length: W }, () => Array(W).fill('.'));
    const coreR = 1 + t * 0.5;
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
      const d = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (d <= coreR) g[y][x] = 'P';
      else if (d <= coreR + 0.8) g[y][x] = 'W';
      else if (d <= coreR + 1.5 && t > 0.3) g[y][x] = 'I';
    }
    // Jagged lightning bolts in 4 directions
    for (let i = 0; i < 4; i++) {
      const a0 = i * Math.PI / 2 + t * 0.4;
      const len = 6 + t * 4;
      let r = coreR + 1;
      let ang = a0;
      while (r < coreR + len) {
        const x = Math.round(cx + Math.cos(ang) * r);
        const y = Math.round(cy + Math.sin(ang) * r);
        if (x >= 0 && x < W && y >= 0 && y < W) {
          if (r < coreR + 2) g[y][x] = 'P';
          else if (r < coreR + len * 0.5) g[y][x] = 'W';
          else g[y][x] = 'I';
        }
        ang += (Math.sin(r * 2) * 0.4 + (Math.random() - 0.5) * 0.3);
        r += 0.7;
      }
    }
    return g.map((r) => r.join(''));
  }

  // ── PROJECTILE TRAIL HD3 — 16×8 motion blur tail
  function trailHD3(intensity, color) {
    const W = 16, H = 8;
    const g = Array.from({ length: H }, () => Array(W).fill('.'));
    const cy = H / 2;
    for (let x = 0; x < W; x++) {
      const t = 1 - x / W;
      const halfH = 0.5 + t * 2 * intensity;
      for (let dy = -halfH; dy <= halfH; dy += 0.5) {
        const y = Math.round(cy + dy);
        if (y < 0 || y >= H) continue;
        const dist = Math.abs(dy) / halfH;
        if (dist < 0.3) g[y][x] = color.core;
        else if (dist < 0.6) g[y][x] = color.mid;
        else if (dist < 0.9) g[y][x] = color.outer;
        else if (g[y][x] === '.') g[y][x] = '1';
      }
    }
    return g.map((r) => r.join(''));
  }
  const TRAIL_FIRE = trailHD3(1, { core: 'P', mid: 'f', outer: 'd' });
  const TRAIL_ICE = trailHD3(1, { core: 'P', mid: 'W', outer: 'i' });
  const TRAIL_ARCANE = trailHD3(1, { core: 'P', mid: 'q', outer: 'm' });
  const TRAIL_HOLY = trailHD3(1, { core: 'P', mid: 'Y', outer: '8' });
  const TRAIL_GOLD = trailHD3(1, { core: 'P', mid: 'Y', outer: 'd' });

  // Register all HD3 effects
  if (window.SPRITES) {
    Object.assign(window.SPRITES, {
      fx_hit_hd3:           [0,0.4,0.8,1.2].map(hitSparkHD3),
      fx_explosion_hd3:     [4,7,10,12,11,8].map(explosionHD3),
      fx_slash_hd3:         [0,0.5,1.0,1.5].map(slashArcHD3),
      fx_impact_pierce_hd3: [0.3,0.8,1.3].map(piercedHD3),
      fx_impact_bash_hd3:   [3,6,9,11].map(bashHD3),
      fx_impact_magic_hd3:  [0.4,0.9,1.4,1.9].map(magicHD3),
      fx_impact_holy_hd3:   [0.3,0.8,1.3,1.6].map(holyHD3),
      fx_impact_fire_hd3:   [0.3,0.7,1.1,1.5].map(fireHD3),
      fx_impact_ice_hd3:    [0.3,0.7,1.1,1.5].map(iceHD3),
      fx_impact_shock_hd3:  [0.2,0.6,1.0,1.4].map(shockHD3),
      trail_fire_hd3:   [TRAIL_FIRE],
      trail_ice_hd3:    [TRAIL_ICE],
      trail_arcane_hd3: [TRAIL_ARCANE],
      trail_holy_hd3:   [TRAIL_HOLY],
      trail_gold_hd3:   [TRAIL_GOLD],
    });
    if (window.SPRITE_GROUPS) {
      window.SPRITE_GROUPS.push({
        title: 'Effects · HD3 (24-32px 정교 패스)',
        items: ['fx_hit_hd3','fx_explosion_hd3','fx_slash_hd3',
                'fx_impact_pierce_hd3','fx_impact_bash_hd3','fx_impact_magic_hd3',
                'fx_impact_holy_hd3','fx_impact_fire_hd3','fx_impact_ice_hd3','fx_impact_shock_hd3',
                'trail_fire_hd3','trail_ice_hd3','trail_arcane_hd3','trail_holy_hd3','trail_gold_hd3'],
      });
    }
    // Auto-alias originals
    if (window.HD2_ENABLED !== false) {
      const A = {
        fx_hit: 'fx_hit_hd3',
        fx_explosion: 'fx_explosion_hd3',
        fx_slash: 'fx_slash_hd3',
        fx_impact_pierce: 'fx_impact_pierce_hd3',
        fx_impact_bash: 'fx_impact_bash_hd3',
        fx_impact_smash: 'fx_impact_bash_hd3',
        fx_impact_magic: 'fx_impact_magic_hd3',
        fx_impact_arcane: 'fx_impact_magic_hd3',
        fx_impact_holy: 'fx_impact_holy_hd3',
        fx_impact_fire: 'fx_impact_fire_hd3',
        fx_impact_burn: 'fx_impact_fire_hd3',
        fx_impact_scorch: 'fx_impact_fire_hd3',
        fx_impact_ice: 'fx_impact_ice_hd3',
        fx_impact_shock: 'fx_impact_shock_hd3',
      };
      for (const k in A) {
        if (window.SPRITES[A[k]] && window.SPRITES[k]) {
          if (!window.SPRITES[k + '_original']) window.SPRITES[k + '_original'] = window.SPRITES[k];
          window.SPRITES[k] = window.SPRITES[A[k]];
        }
      }
    }
  }
  if (window.AtlasBuilder && window.AtlasBuilder.FPS) {
    Object.assign(window.AtlasBuilder.FPS, {
      fx_hit_hd3: 24, fx_explosion_hd3: 20, fx_slash_hd3: 22,
      fx_impact_pierce_hd3: 18, fx_impact_bash_hd3: 16,
      fx_impact_magic_hd3: 16, fx_impact_holy_hd3: 14,
      fx_impact_fire_hd3: 14, fx_impact_ice_hd3: 14, fx_impact_shock_hd3: 20,
    });
  }
})();
