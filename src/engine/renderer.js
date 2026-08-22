// Renderer — the ONLY module that imports PixiJS (premise #3).
//
// The simulation hands over plain entity data; the renderer owns the
// entity -> sprite mapping (eng-review D2) and diff-syncs it each frame.
// It draws entities as pixel-art sprites from the Crypt art pack (loaded as
// window.PALETTE / window.SPRITES / window.AtlasBuilder), a varied dungeon
// tilemap floor, and the cosmetic effects layer (damage numbers, hit flash,
// screen shake) fed by the hit-event channel (D11). None of this enters the sim.

import { Application, Container, Sprite, Graphics, Text, Texture, Rectangle } from 'pixi.js';
import { VIEW } from '../config.js';
import { MAPS } from '../content/maps.js';
import { structuresNear, zoneAt, ROOM_WORLD_W, ROOM_WORLD_H } from '../util/structureField.js';
import { structureAssetUrl } from '../util/structureAssets.js';
import { spriteBaseAngleFor } from '../util/spriteAngles.js';
import { assetFrameUrl } from '../util/sigAssets.js';
import { TILESETS, TILESET_GRID, TILESET_TILE_PX } from '../util/tilesets.js';
import { heroAssetUrl, HERO_ASSETS } from '../util/heroAssets.js';
import { weaponAssetUrl } from '../util/weaponAssets.js';
import { buffAssetUrl } from '../util/buffAssets.js';
import { enemyAssetUrl } from '../util/enemyAssets.js';

const DMG_RISE = 42; // px/sec a damage number floats up
const DMG_LIFE = 0.65; // seconds before it fades out
const FLASH_TIME = 0.16; // seconds an enemy "pops" + shakes when hit
const SHAKE_MAX = 16; // px — clamp on accumulated screen shake
const TILE_SCALE = 3; // floor tile zoom
const TILE_PX = 16; // source tile size in pixels
const FX_LIFE = 0.4; // default seconds a one-shot effect plays

// Display names for zone keys (content/maps.js `zones`) — used by the
// expanded map legend so the player can navigate to a named "동네" (e.g.
// 회랑·서고 for the colonnade bookshelf nooks). Falls back to the raw key.
const ZONE_LABELS = {
  graveyard: '묘지', colonnade: '회랑·서고', 'inner-sanctum': '성소',
  'old-grove': '고목림', 'mossy-ruins': '이끼 폐허', 'wolf-den': '늑대굴',
  mire: '진흙늪', 'rot-pool': '썩은 웅덩이', 'witch-grove': '마녀숲',
  'lava-flow': '용암류', 'ash-plain': '잿벌', 'forge-ruin': '대장간 폐허',
  'frost-cavern': '서리굴', glacier: '빙하', 'frozen-shrine': '얼음 사당',
  rift: '균열', nebula: '성운', singularity: '특이점',
};

// Weapons whose PixelLab animate_object call kept failing (orbs / textured
// objects PixelLab struggles to interpolate). They render with a sinusoidal
// scale pulse so the projectile reads as "alive" rather than a frozen icon.
// See task #33 / #35 — fallback for AoE zones that wouldn't animate.
const PULSE_WEAPONS = new Set([
  // task #33 fallback (orbit/pull/aoe that failed PixelLab anim)
  'plasma_orb', 'leg_frozen_throne', 'leg_galaxy_orb', 'barbed_net',
  // task #35 fallback (static AoEs still awaiting PixelLab anim — give
  // them life immediately while real animations queue in the background)
  'sanctuary', 'garlic', 'warhammer', 'bear_trap', 'warcry_pulse',
  'leg_demon_heart', 'leg_tempest', 'leg_black_hole', 'leg_void_collapse',
  'leg_judgement_hammer',
  // divine_hammer's animate_object also failed (PixelLab struggles with
  // crisp hard-edge metal objects) — add to fallback so the slam zone wobbles
  'divine_hammer',
]);
const PULSE_HZ = 2.0;   // beats per second
const PULSE_AMP = 0.18; // ±18% scale wobble

// entity -> sprite clip. The player, bosses and spirits carry their own clip;
// ordinary enemies key off enemyType; an unmapped entity falls back to a circle.
const ENEMY_SPRITE = {
  walker: 'walker_walk', runner: 'runner_walk', brute: 'brute_walk',
  elite: 'elite_walk', bat: 'bat_fly', spider: 'spider_walk',
  slime: 'slime_idle', chimera: 'chimera_walk',
  // biome enemies
  wolf: 'wolf_run', goblin: 'goblin_walk', hornet: 'hornet_fly',
  frog: 'frog_idle', bog_zombie: 'bog_zombie_walk', wisp: 'wisp_float',
  imp: 'imp_walk', lava_slug: 'lava_slug_idle', fire_bat: 'fire_bat_fly',
  frost_wolf: 'frost_wolf_run', yeti: 'yeti_walk', ice_wraith: 'ice_wraith_float',
  // new monsters (PixelLab pack)
  giant_spider: 'giant_spider_walk', carrion_crow: 'carrion_crow_fly',
  bog_leech: 'bog_leech_walk', carnivore_plant: 'carnivore_plant_idle',
  magma_golem: 'magma_golem_walk', ice_golem: 'ice_golem_walk',
  void_walker: 'void_walker_walk', void_drifter: 'void_drifter_float',
  // behaviour-pass monsters (2026-05-29) — dedicated PixelLab art (enemyAssets).
  // clip keys match ENEMY_ASSETS + bestiary sprite fields + public/enemies PNGs.
  medusa_head: 'medusa_head_float', powder_skeleton: 'powder_skeleton_walk',
  brood_mother: 'brood_mother_walk',
  necromancer: 'necromancer_walk', war_drummer: 'war_drummer_walk',
  rune_guardian: 'rune_guardian_walk', revenant: 'revenant_float',
  reaper: 'reaper_walk',
};
function spriteNameFor(e) {
  if (e.type === 'player') return e.sprite || 'player_walk';
  if (e.type === 'spirit') return e.sprite || null;
  if (e.type === 'gem') return e.sprite || 'pickup_xp_blue';
  if (e.type === 'drop') return e.sprite || null;
  if (e.type === 'enemy') return e.sprite || ENEMY_SPRITE[e.enemyType] || null;
  if (e.type === 'projectile') return e.sprite || null;
  if (e.type === 'minion') return e.sprite || null;
  return null;
}

// Left/right sprite picker — VS-style flat 2D, the hero is always shown in
// profile. The sprite has east + west variants; vertical movement keeps the
// last horizontal facing so up/down doesn't snap the silhouette around. We
// still tolerate _south/_north keys when present, but treat _east/_west as
// the canonical pair.
function pickDirectional(SPRITES, name, e) {
  if (!name || !SPRITES) return name;
  if (e.type !== 'player' && e.type !== 'enemy' && e.type !== 'minion') return name;
  if (!SPRITES[name + '_east'] && !SPRITES[name + '_west']) return name;
  const vx = e.vx || 0;
  let dir = e.facing || 'east';
  if (Math.abs(vx) > 0.05) {
    dir = vx > 0 ? 'east' : 'west';
    e.facing = dir;
  }
  // fall back to the other side if only one direction is registered
  if (!SPRITES[name + '_' + dir]) {
    dir = dir === 'east' ? 'west' : 'east';
  }
  return name + '_' + dir;
}

export async function createRenderer(mount) {
  const app = new Application();
  await app.init({
    width: VIEW.width,
    height: VIEW.height,
    background: 0x0a0814,
    antialias: false, // pixel-perfect retro look (design-review D3)
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  mount.appendChild(app.canvas);

  const AB = window.AtlasBuilder;
  const SPRITES = window.SPRITES || {};
  const FPS = (AB && AB.FPS) || {};

  // --- texture caches ---
  // sprite frame: "name:frame" -> Texture rendered from the ASCII art.
  const spriteTex = new Map();
  function spriteTexture(name, frame) {
    const key = name + ':' + frame;
    let tex = spriteTex.get(key);
    if (!tex) {
      const src = AB.renderFrame(name, frame);
      tex = Texture.from(src);
      tex.source.scaleMode = 'nearest'; // crisp pixels
      spriteTex.set(key, tex);
    }
    return tex;
  }
  // fallback circle for entities without a sprite
  const circleTex = new Map();
  function circleTexture(color, radius) {
    const k = color + ':' + radius;
    let tex = circleTex.get(k);
    if (!tex) {
      const g = new Graphics().circle(0, 0, radius).fill(color);
      tex = app.renderer.generateTexture(g);
      g.destroy();
      circleTex.set(k, tex);
    }
    return tex;
  }

  // enemy-shot marker — a bright pale halo + ring around the coloured core so
  // incoming danger reads instantly against the dark floor
  const dangerTex = new Map();
  function dangerTexture(color, radius) {
    const k = color + ':' + radius;
    let tex = dangerTex.get(k);
    if (!tex) {
      const g = new Graphics()
        .circle(0, 0, radius + 4).fill({ color: 0xfff2a0, alpha: 0.4 })
        .circle(0, 0, radius).fill(color)
        .circle(0, 0, radius).stroke({ width: 2.5, color: 0xfff6c0 });
      tex = app.renderer.generateTexture(g);
      g.destroy();
      dangerTex.set(k, tex);
    }
    return tex;
  }

  // Composite sprite texture — layers two sprite frames (base + accent)
  // into a single Texture, cached by 'base:accent:frame'. Used by fused
  // spirits so 증기/오베론/빙결/초록 look distinct from any single source.
  const compositeTex = new Map();
  function compositeTexture(baseName, accentName, frame) {
    const key = baseName + '+' + accentName + ':' + frame;
    let tex = compositeTex.get(key);
    if (tex) return tex;
    const baseSrc = AB.renderFrame(baseName, frame);
    const accentSrc = AB.renderFrame(accentName, frame);
    const w = Math.max(baseSrc.width, accentSrc.width);
    const h = Math.max(baseSrc.height, accentSrc.height);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    // base full, accent at 65% alpha + 'screen' blend so colours add rather
    // than occlude — produces an "energy halo" look (water + fire = teal
    // bubble with a fire glow inside)
    ctx.drawImage(baseSrc, (w - baseSrc.width) / 2, (h - baseSrc.height) / 2);
    ctx.globalAlpha = 0.65;
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(accentSrc, (w - accentSrc.width) / 2, (h - accentSrc.height) / 2);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    tex = Texture.from(c);
    tex.source.scaleMode = 'nearest';
    compositeTex.set(key, tex);
    return tex;
  }

  // friend-or-foe ID: a coloured silhouette around a sprite frame (8-stamp).
  // Only the player + bosses get one — outlining a 400-enemy swarm is wasteful.
  const outlineTex = new Map();
  const OUTLINE_DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]];
  function outlinedTexture(name, frame, color) {
    const key = name + ':' + frame + ':' + color;
    let tex = outlineTex.get(key);
    if (!tex) {
      const src = AB.renderFrame(name, frame);
      const c = document.createElement('canvas');
      c.width = src.width + 2;
      c.height = src.height + 2;
      const ctx = c.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      for (let i = 0; i < OUTLINE_DIRS.length; i++) {
        ctx.drawImage(src, OUTLINE_DIRS[i][0] + 1, OUTLINE_DIRS[i][1] + 1);
      }
      ctx.globalCompositeOperation = 'source-in'; // recolour the silhouette
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(src, 1, 1); // original sprite on top
      tex = Texture.from(c);
      tex.source.scaleMode = 'nearest';
      outlineTex.set(key, tex);
    }
    return tex;
  }

  // a soft drop shadow blob (placed under the player + bosses)
  const shadowG = new Graphics().ellipse(0, 0, 16, 5).fill({ color: 0x000000, alpha: 0.42 });
  const shadowTex = app.renderer.generateTexture(shadowG);
  shadowG.destroy();

  // everything in here moves with the camera
  const world = new Container();
  app.stage.addChild(world);

  // blood-moon overlay — a translucent red full-screen tint pulsing softly
  // while the event is active. Sits above the world but below the HUD-DOM,
  // so it tints the playfield without obscuring the menus.
  const bloodMoonOverlay = new Graphics()
    .rect(0, 0, VIEW.width, VIEW.height)
    .fill({ color: 0xc8332a, alpha: 0.16 });
  bloodMoonOverlay.visible = false;
  app.stage.addChild(bloodMoonOverlay);
  function setBloodMoon(on) {
    bloodMoonOverlay.visible = !!on;
  }

  // --- minimap: a screen-space radar pinned to the bottom-right corner ---
  const MMAP = { size: 176, pad: 16, range: 940 };
  const minimap = new Container();
  minimap.x = VIEW.width - MMAP.size - MMAP.pad;
  minimap.y = VIEW.height - MMAP.size - MMAP.pad;
  app.stage.addChild(minimap);
  // a framed panel: dark fill, a gold inner edge, range rings + crosshair
  const mc = MMAP.size / 2;
  const minimapFrame = new Graphics()
    .roundRect(0, 0, MMAP.size, MMAP.size, 8)
    .fill({ color: 0x0a0813, alpha: 0.74 })
    .roundRect(2, 2, MMAP.size - 4, MMAP.size - 4, 6)
    .stroke({ width: 2, color: 0x6b5a86 })
    .roundRect(0, 0, MMAP.size, MMAP.size, 8)
    .stroke({ width: 2, color: 0x000000 });
  minimapFrame
    .circle(mc, mc, mc - 16).stroke({ width: 1, color: 0x3d3050, alpha: 0.7 })
    .circle(mc, mc, (mc - 16) / 2).stroke({ width: 1, color: 0x3d3050, alpha: 0.5 })
    .moveTo(mc, 14).lineTo(mc, MMAP.size - 14)
    .moveTo(14, mc).lineTo(MMAP.size - 14, mc)
    .stroke({ width: 1, color: 0x2a2238, alpha: 0.8 });
  minimap.addChild(minimapFrame);
  // zone-tint terrain behind the radar dots — paints each region's zone colour
  // so the player can read "어느 동네에 있는지" at a glance (graveyard green vs
  // colonnade ivory vs sanctum violet). Below the dots, above the frame fill.
  const minimapZones = new Graphics();
  minimap.addChild(minimapZones);
  const minimapDots = new Graphics();
  minimap.addChild(minimapDots);

  // Redraw the radar — throttled to every MMAP_EVERY frames. The radar reads
  // dots; 15fps on the radar is indistinguishable from 60fps and saves a hot
  // Graphics clear+redraw each frame.
  const MMAP_EVERY = 4;
  let mmTick = 0;
  function drawMinimap(enemies, players) {
    if ((mmTick++ % MMAP_EVERY) !== 0) return;
    const g = minimapDots;
    g.clear();
    const sc = (mc - 16) / MMAP.range;
    const rr = (mc - 16) * (mc - 16);
    // zone terrain — low-res grid sampled by world→region→zone, tinted to each
    // zone's floor colour so the radar reads the surrounding "동네" layout.
    const mz = minimapZones;
    mz.clear();
    if (activeZoneTints) {
      const r0 = mc - 16;
      const NZ = 11;            // grid resolution across the radar
      const cellPx = (r0 * 2) / NZ;
      for (let gy = 0; gy < NZ; gy++) {
        for (let gx = 0; gx < NZ; gx++) {
          const px = -r0 + (gx + 0.5) * cellPx;
          const py = -r0 + (gy + 0.5) * cellPx;
          if (px * px + py * py > r0 * r0) continue; // clip to radar circle
          const wx = camera.x + px / sc;
          const wy = camera.y + py / sc;
          const rx = Math.floor(wx / ROOM_WORLD_W);
          const ry = Math.floor(wy / ROOM_WORLD_H);
          const zone = zoneAt(rx, ry, activeZones, activeClusterSize);
          const spec = activeZoneTints[zone] || activeZoneTints.default;
          const tint = spec ? spec.tint : 0x444048;
          mz.rect(mc + px - cellPx / 2, mc + py - cellPx / 2, cellPx + 0.6, cellPx + 0.6)
            .fill({ color: tint, alpha: 0.5 });
        }
      }
    }
    // structures — faint marks so the room layout reads on the radar
    const st = structuresNear(activeRooms, camera.x, camera.y, MMAP.range, activeZones, activeClusterSize);
    for (let i = 0; i < st.length; i++) {
      const dx = (st[i].x - camera.x) * sc;
      const dy = (st[i].y - camera.y) * sc;
      if (dx * dx + dy * dy < rr) {
        g.rect(mc + dx - 1, mc + dy - 1, 2, 2).fill({ color: 0x5a4a6d, alpha: 0.8 });
      }
    }
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      const dx = (e.x - camera.x) * sc;
      const dy = (e.y - camera.y) * sc;
      if (dx * dx + dy * dy >= rr) continue;
      if (e.boss) {
        // bigger, brighter blip + double ring so the boss is unmistakable
        // on the radar even when commons crowd around it
        g.circle(mc + dx, mc + dy, 6).fill({ color: 0xff8a3a });
        g.circle(mc + dx, mc + dy, 9).stroke({ width: 2, color: 0xffd27a });
        g.circle(mc + dx, mc + dy, 12).stroke({ width: 1, color: 0xff5a3a, alpha: 0.6 });
      } else if (e.miniBoss) {
        g.circle(mc + dx, mc + dy, 3.2).fill({ color: 0xf0c040 });
      } else {
        g.circle(mc + dx, mc + dy, 1.9).fill({ color: 0xe0584a });
      }
    }
    const hasPlayer = players.length > 0;
    minimap.visible = hasPlayer; // hidden on the title / menus (no player)
    if (hasPlayer) {
      g.circle(mc, mc, 7).stroke({ width: 1.5, color: 0x8fb4dc, alpha: 0.55 });
      g.circle(mc, mc, 3.2).fill({ color: 0xbfe6ff });
    }
  }

  // --- expanded map (ESC) -------------------------------------------------
  // A large zoomed-out view of the surrounding zone layout, shown while paused
  // so the player can navigate toward a named 동네 (e.g. 회랑·서고 for the
  // bookshelf nooks). Screen-space; the world is procedurally unbounded, so
  // this is a zone-colour grid around the player, not a fixed-bounds map.
  // Drawn ONCE on pause-open (the world is frozen) — never per frame, because
  // the wide structuresNear scan is heavy.
  const BIGMAP = { size: 560, range: 7600 };
  const bigMap = new Container();
  bigMap.visible = false;
  bigMap.x = Math.round(VIEW.width * 0.40);
  bigMap.y = Math.round((VIEW.height - BIGMAP.size) / 2);
  app.stage.addChild(bigMap);
  const bigMapG = new Graphics();
  bigMap.addChild(bigMapG);
  const mkText = (size, fill, bold) => new Text({ text: '', style: {
    fontFamily: 'Courier New', fontSize: size, fontWeight: bold ? 'bold' : 'normal', fill } });
  const bigMapTitle = mkText(22, 0xf0d27a, true);
  bigMapTitle.text = '지 도'; bigMapTitle.x = 18; bigMapTitle.y = 12;
  bigMap.addChild(bigMapTitle);
  const bigMapHint = mkText(13, 0x9a90b0, false);
  bigMapHint.text = '드래그 이동 · 더블클릭 내 위치 · ESC 닫기'; bigMapHint.anchor.set(1, 0);
  bigMapHint.x = BIGMAP.size - 16; bigMapHint.y = 18;
  bigMap.addChild(bigMapHint);
  const bigMapHere = mkText(15, 0xbfe6ff, true);
  bigMapHere.x = 18; bigMapHere.y = BIGMAP.size - 30;
  bigMap.addChild(bigMapHere);
  const bigMapLegend = [];
  for (let i = 0; i < 6; i++) {
    const t = mkText(14, 0xcfc8da, false);
    t.visible = false;
    bigMap.addChild(t);
    bigMapLegend.push(t);
  }

  // pan/drag state — the map can be dragged to look around; the player marker
  // stays at its true world position (so it moves off-centre when panned).
  const BM_PAD = 16, BM_TOP = 44, BM_BOTTOM = 40;
  const BM_MAPW = BIGMAP.size - BM_PAD * 2;
  const BM_MAPH = BIGMAP.size - BM_TOP - BM_BOTTOM;
  const BM_SC = BM_MAPW / (BIGMAP.range * 2); // world px -> map px
  let bigPanX = 0, bigPanY = 0;         // world-space offset from the player
  let bigDragging = false, bigDragLX = 0, bigDragLY = 0;
  let bigStructCache = null, bigStructQX = NaN, bigStructQY = NaN;
  bigMap.eventMode = 'static';
  bigMap.hitArea = new Rectangle(BM_PAD, BM_TOP, BM_MAPW, BM_MAPH);
  bigMap.cursor = 'grab';
  bigMap.on('pointerdown', (e) => {
    bigDragging = true; bigDragLX = e.global.x; bigDragLY = e.global.y;
    bigMap.cursor = 'grabbing';
  });
  const bmEndDrag = () => { bigDragging = false; bigMap.cursor = 'grab'; };
  bigMap.on('pointerup', bmEndDrag);
  bigMap.on('pointerupoutside', bmEndDrag);
  bigMap.on('globalpointermove', (e) => {
    if (!bigDragging) return;
    bigPanX -= (e.global.x - bigDragLX) / BM_SC; // grab-pull: drag right → see left
    bigPanY -= (e.global.y - bigDragLY) / BM_SC;
    bigDragLX = e.global.x; bigDragLY = e.global.y;
    drawBigMap();
  });
  // double-click / -tap snaps the view back to the player
  bigMap.on('pointertap', (e) => { if (e.detail >= 2) { bigPanX = 0; bigPanY = 0; drawBigMap(); } });

  function setBigMapVisible(v) {
    bigMap.visible = !!v;
    if (v) { bigPanX = 0; bigPanY = 0; bigStructQX = NaN; } // reset pan on open
  }

  function drawBigMap() {
    const g = bigMapG;
    g.clear();
    const S = BIGMAP.size;
    g.roundRect(0, 0, S, S, 10).fill({ color: 0x0a0813, alpha: 0.97 })
      .roundRect(2, 2, S - 4, S - 4, 8).stroke({ width: 2, color: 0x6b5a86 })
      .roundRect(0, 0, S, S, 10).stroke({ width: 2, color: 0x000000 });
    const pad = BM_PAD, top = BM_TOP;
    const mapX = pad, mapY = top, mapW = BM_MAPW, mapH = BM_MAPH;
    const sc = BM_SC; // world px -> map px
    const cx0 = camera.x + bigPanX, cy0 = camera.y + bigPanY; // panned view centre
    // zone-colour grid
    if (activeZoneTints) {
      const N = 48;
      const cw = mapW / N, ch = mapH / N;
      for (let gy = 0; gy < N; gy++) {
        for (let gx = 0; gx < N; gx++) {
          const wx = cx0 + ((gx + 0.5) / N - 0.5) * BIGMAP.range * 2;
          const wy = cy0 + ((gy + 0.5) / N - 0.5) * BIGMAP.range * 2;
          const rx = Math.floor(wx / ROOM_WORLD_W), ry = Math.floor(wy / ROOM_WORLD_H);
          const zone = zoneAt(rx, ry, activeZones, activeClusterSize);
          const spec = activeZoneTints[zone] || activeZoneTints.default;
          const tint = spec ? spec.tint : 0x444048;
          g.rect(mapX + gx * cw, mapY + gy * ch, cw + 0.6, ch + 0.6).fill({ color: tint, alpha: 0.92 });
        }
      }
    } else {
      g.rect(mapX, mapY, mapW, mapH).fill({ color: 0x2a2438, alpha: 0.9 });
    }
    // faint structure marks so landmark formations read. The wide
    // structuresNear scan is cached and only re-run when the view pans far,
    // so dragging stays smooth.
    if (bigStructCache === null || Math.abs(cx0 - bigStructQX) > 500 || Math.abs(cy0 - bigStructQY) > 500) {
      bigStructCache = structuresNear(activeRooms, cx0, cy0, BIGMAP.range + 700, activeZones, activeClusterSize);
      bigStructQX = cx0; bigStructQY = cy0;
    }
    const stq = bigStructCache;
    for (let i = 0; i < stq.length; i++) {
      const mx = mapX + mapW / 2 + (stq[i].x - cx0) * sc;
      const my = mapY + mapH / 2 + (stq[i].y - cy0) * sc;
      if (mx < mapX || mx > mapX + mapW || my < mapY || my > mapY + mapH) continue;
      g.rect(mx, my, 1.6, 1.6).fill({ color: 0x000000, alpha: 0.30 });
    }
    g.rect(mapX, mapY, mapW, mapH).stroke({ width: 1, color: 0x000000, alpha: 0.55 });
    // player marker at its true world position (off-centre when panned)
    const pcx = mapX + mapW / 2 + (camera.x - cx0) * sc;
    const pcy = mapY + mapH / 2 + (camera.y - cy0) * sc;
    if (pcx >= mapX && pcx <= mapX + mapW && pcy >= mapY && pcy <= mapY + mapH) {
      g.circle(pcx, pcy, 9).stroke({ width: 2, color: 0x8fb4dc, alpha: 0.65 });
      g.circle(pcx, pcy, 4).fill({ color: 0xbfe6ff });
    } else {
      // player off the panned view — draw a clamped edge arrow toward them
      const ex = Math.max(mapX + 8, Math.min(mapX + mapW - 8, pcx));
      const ey = Math.max(mapY + 8, Math.min(mapY + mapH - 8, pcy));
      g.circle(ex, ey, 5).fill({ color: 0xbfe6ff, alpha: 0.9 })
        .circle(ex, ey, 8).stroke({ width: 1.5, color: 0x8fb4dc, alpha: 0.5 });
    }
    // current zone + legend
    const prx = Math.floor(cx0 / ROOM_WORLD_W), pry = Math.floor(cy0 / ROOM_WORLD_H);
    const curZone = activeZoneTints ? zoneAt(prx, pry, activeZones, activeClusterSize) : null;
    bigMapHere.text = curZone ? ('현재 위치  ' + (ZONE_LABELS[curZone] || curZone)) : '';
    for (let i = 0; i < bigMapLegend.length; i++) bigMapLegend[i].visible = false;
    if (activeZoneTints && activeZones && activeZones.length) {
      const rows = Math.min(activeZones.length, bigMapLegend.length);
      const lw = 130, lh = rows * 18 + 10;
      const lx = mapX + mapW - lw - 4, ly0 = mapY + 4;
      g.roundRect(lx - 6, ly0 - 4, lw, lh, 4).fill({ color: 0x000000, alpha: 0.5 });
      for (let i = 0; i < rows; i++) {
        const z = activeZones[i];
        const spec = activeZoneTints[z] || activeZoneTints.default;
        const tint = spec ? spec.tint : 0x444048;
        const ly = ly0 + i * 18;
        g.roundRect(lx, ly, 12, 12, 2).fill({ color: tint, alpha: 0.95 })
          .stroke({ width: 1, color: 0x000000, alpha: 0.6 });
        const t = bigMapLegend[i];
        t.text = ZONE_LABELS[z] || z;
        t.x = lx + 18; t.y = ly - 1; t.visible = true;
        t.style.fill = (z === curZone) ? 0xffe9a8 : 0xcfc8da;
      }
    }
  }

  // --- varied dungeon tilemap floor ---------------------------------------
  // A fixed pool of tile sprites living in world space (so they scroll with
  // the camera for free). Each cell's tile is a deterministic hash pick, so
  // the floor is stable as the camera roams. The pool is only re-laid-out
  // when the camera crosses a tile boundary.
  //
  // Two paths coexist for the floor:
  //   1. ASCII path: spriteTexture(tileFor(cx, cy), 0) — original codebase
  //      pattern. Each tile in activeTiles is a sprite name from the ASCII
  //      art system.
  //   2. PNG Wang path: when the active map declares `pngTileset`, we split
  //      a single 64×64 PixelLab Wang sheet into TILESET_GRID²=16 sub-textures
  //      and pick by hash. Texture is sub-rect of the loaded PNG via
  //      Texture.from(source, { frame }).
  const tileWorld = TILE_PX * TILE_SCALE;
  let activeTiles = MAPS[0].tiles; // floor tile bag — swapped by setMap()
  let activeTilesetKey = null; // 'dungeon' | 'forest' | ... | null (ASCII fallback)
  let activeZones = []; // zone names for this chapter (empty → no zone branching)
  let activeZoneTints = null; // { default, <zone>: { tint, subIndices } } | null
  let activeAmbient = null; // { vignette: number, fog: 'light'|'heavy' } | null
  let activeClusterSize = 4; // regions per zone cluster — biome-tunable
  let activeInlaidBand = null; // { tile, rowInterval } — VS-style decorative
  // floor strip every rowInterval rows (ASCII path only); null = no band.

  // PNG tileset cache — by key. Each entry resolves to either an Array of
  // sub-Textures (loaded + split) or null (still loading or failed).
  const tilesetCache = new Map(); // key -> Texture[] | null | undefined (loading)
  function loadTileset(key) {
    if (!key || !TILESETS[key]) return;
    if (tilesetCache.has(key)) return; // already loading or loaded
    tilesetCache.set(key, undefined); // sentinel = loading
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const cv = document.createElement('canvas');
        cv.width = img.naturalWidth || img.width;
        cv.height = img.naturalHeight || img.height;
        const ctx = cv.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0);
        const base = Texture.from(cv);
        if (base && base.source) base.source.scaleMode = 'nearest';
        const subs = [];
        const tileSize = TILESET_TILE_PX;
        for (let row = 0; row < TILESET_GRID; row++) {
          for (let col = 0; col < TILESET_GRID; col++) {
            // PIXI v8: Texture constructor with frame rect carves a sub-region
            const sub = new Texture({
              source: base.source,
              frame: { x: col * tileSize, y: row * tileSize, width: tileSize, height: tileSize },
            });
            subs.push(sub);
          }
        }
        tilesetCache.set(key, subs);
        // Force the floor to re-lay if this is the active tileset; tiles
        // will pick up the new textures on the next updateFloor() call.
        if (activeTilesetKey === key) {
          floorCx = null;
          floorCy = null;
        }
      } catch (err) {
        console.warn('[tilesets] slice failed', key, err);
        tilesetCache.set(key, null);
      }
    };
    img.onerror = () => {
      console.warn('[tilesets] load failed', key);
      tilesetCache.set(key, null);
    };
    img.src = TILESETS[key].url;
  }
  const floorLayer = new Container();
  world.addChild(floorLayer); // first child -> drawn under every entity
  // floor decor — small detail sprites scattered on the floor so the player
  // reads "길/돌/풀 흐름" instead of a uniform Wang grid. Sits above floor,
  // below shadows/props/entities. Procedural canvas textures (no PixelLab).
  const decorLayer = new Container();
  world.addChild(decorLayer);
  // drop-shadow layer — sits above the floor, below all entity sprites
  const shadowLayer = new Container();
  world.addChild(shadowLayer);
  const shadows = []; // pooled shadow sprites (player + bosses)
  const floorCols = Math.ceil(VIEW.width / tileWorld) + 3;
  const floorRows = Math.ceil(VIEW.height / tileWorld) + 3;
  const floorTiles = [];
  for (let i = 0; i < floorCols * floorRows; i++) {
    const t = new Sprite();
    t.scale.set(TILE_SCALE);
    // mute the floor so it recedes — a busy tile texture shouldn't fight the
    // entities for attention (a darkening multiply tint)
    t.tint = 0xa6a2b2;
    floorLayer.addChild(t);
    floorTiles.push(t);
  }
  function cellHash(cx, cy) {
    return ((cx * 73856093) ^ (cy * 19349663)) >>> 0;
  }
  function tileFor(cx, cy) {
    return activeTiles[cellHash(cx, cy) % activeTiles.length];
  }
  // Zone-aware cell resolver — shared by PNG and ASCII paths so a single
  // helper edit re-tunes both. Returns the zone spec for the cell, or null
  // when the chapter has no zoneTints (legacy chapters fall back to uniform
  // hash + base tint). A cell's zone is derived from its (rx, ry) region.
  function resolveCellAt(cx, cy) {
    if (!activeZoneTints) return null;
    const rx = Math.floor((cx * tileWorld) / ROOM_WORLD_W);
    const ry = Math.floor((cy * tileWorld) / ROOM_WORLD_H);
    const zone = zoneAt(rx, ry, activeZones, activeClusterSize);
    return activeZoneTints[zone] || activeZoneTints.default || null;
  }
  let floorCx = null;
  let floorCy = null;
  function updateFloor() {
    const startCx = Math.floor((camera.x - VIEW.width / 2) / tileWorld) - 1;
    const startCy = Math.floor((camera.y - VIEW.height / 2) / tileWorld) - 1;
    if (startCx === floorCx && startCy === floorCy) return; // still covered
    floorCx = startCx;
    floorCy = startCy;
    // PNG Wang path — use 16 sub-textures of the active tileset if loaded.
    const subs = activeTilesetKey ? tilesetCache.get(activeTilesetKey) : null;
    const useSubs = Array.isArray(subs) && subs.length > 0;
    let i = 0;
    for (let r = 0; r < floorRows; r++) {
      for (let c = 0; c < floorCols; c++) {
        const cx = startCx + c;
        const cy = startCy + r;
        const t = floorTiles[i++];
        const spec = resolveCellAt(cx, cy);
        if (useSubs) {
          // Wang sub-tile은 transition tile이라 인덱스 가중을 주면 같은 sub-tile이
          // 인접 강제되어 거대 단조 영역이 생긴다. 인덱스는 모든 16 sub-tile
          // 균등 분포로 두고, zone 차이는 tint만 적용.
          t.texture = subs[cellHash(cx, cy) % subs.length];
          t.tint = spec ? spec.tint : 0xd8d4dc;
        } else {
          // VS-style inlaid band: every rowInterval rows lay an ornate
          // medallion strip instead of the hashed floor tile. Deliberate ROW
          // placement (not Wang-index weighting) so it reads as architecture.
          // cy can be negative (world spans all quadrants) → safe modulo.
          let tileName;
          if (activeInlaidBand &&
              ((cy % activeInlaidBand.rowInterval) + activeInlaidBand.rowInterval)
                % activeInlaidBand.rowInterval === 0) {
            tileName = activeInlaidBand.tile;
          } else {
            tileName = tileFor(cx, cy);
          }
          t.texture = spriteTexture(tileName, 0);
          // ASCII path inherits the zone tint when defined; otherwise the
          // original ASCII darken tint keeps the look unchanged. The band tile
          // takes the same tint so it reads THROUGH the zone colour.
          t.tint = spec ? spec.tint : 0xa6a2b2;
        }
        t.x = cx * tileWorld;
        t.y = cy * tileWorld;
      }
    }
  }
  // --- biome decoration props (room blueprints) ----------------------------
  // The structure field stamps hand-designed room layouts (content/rooms.js)
  // across the world; structuresNear gives the structures around the camera.
  // Drawn above the floor and below entities, same coords the sim collides on.
  let activeRooms = [];
  const propLayer = new Container();
  world.addChildAt(propLayer, 1); // floor(0) < props(1) < shadows < entities

  // Player buff halo — drawn below the hero sprite (between shadows and
  // entity layer) so an aura_buff weapon paints a soft disc under the feet
  // without covering the hero. Active when loadout.buffs has any entry.
  const buffHaloLayer = new Graphics();
  world.addChild(buffHaloLayer);
  // PNG sprite overlay for aura_buff weapons that set `assetKey` on their
  // buff entry. The sprite is composited above the Graphics circle so the
  // pixel art reads as the dominant visual while the soft glow underneath
  // keeps the buff legible even before the PNG loads.
  const buffHaloSpriteLayer = new Container();
  world.addChild(buffHaloSpriteLayer);
  const BUFF_HALO_POOL = 8;
  const buffHaloSprites = [];
  for (let i = 0; i < BUFF_HALO_POOL; i++) {
    const s = new Sprite();
    s.anchor.set(0.5);
    s.visible = false;
    buffHaloSpriteLayer.addChild(s);
    buffHaloSprites.push(s);
  }
  function drawBuffHalo(playerEnt, buffs) {
    buffHaloLayer.clear();
    for (let i = 0; i < buffHaloSprites.length; i++) buffHaloSprites[i].visible = false;
    if (!playerEnt || !buffs || buffs.length === 0) return;
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 3.2);
    for (let i = 0; i < buffs.length; i++) {
      const b = buffs[i];
      const col = b.color ?? 0xfff0c0;
      const r = 36 + 8 * pulse + i * 6;
      buffHaloLayer
        .circle(playerEnt.x, playerEnt.y + 8, r + 6).fill({ color: col, alpha: 0.08 })
        .circle(playerEnt.x, playerEnt.y + 8, r).fill({ color: col, alpha: 0.18 })
        .circle(playerEnt.x, playerEnt.y + 8, r).stroke({ width: 1.5, color: col, alpha: 0.45 });
      if (b.assetKey && i < buffHaloSprites.length) {
        const url = buffAssetUrl(b.assetKey, elapsed);
        const tex = url ? pngTexture(url) : null;
        if (tex) {
          const s = buffHaloSprites[i];
          s.texture = tex;
          s.x = playerEnt.x;
          s.y = playerEnt.y + 8;
          const targetDiameter = (r + 6) * 2;
          s.scale.set(targetDiameter / 64);
          s.alpha = 0.85;
          s.rotation = elapsed * 0.6;
          s.visible = true;
        }
      }
    }
  }
  // a placed AoE / vortex zone shows its true kill radius as a translucent
  // disc — so a big-radius weapon reads clearly without stretching its sprite
  const zoneLayer = new Graphics();
  world.addChild(zoneLayer); // above shadows, below entity sprites
  // Zone PNG sprite overlay — for projectiles with `groundAsset` set
  // (aoe + pull pattern weapons get the PixelLab crater/vortex art on
  // top of drawZones Graphics). Pooled so we don't allocate per-frame.
  const zoneSpriteLayer = new Container();
  world.addChild(zoneSpriteLayer); // sits between Graphics zone + entity sprites
  const ZONE_SPRITE_POOL = 96;
  const zoneSprites = [];
  for (let i = 0; i < ZONE_SPRITE_POOL; i++) {
    const s = new Sprite();
    s.anchor.set(0.5);
    s.visible = false;
    zoneSpriteLayer.addChild(s);
    zoneSprites.push(s);
  }
  // enemy telegraph rings — drawn under sprites so the windup tell is visible
  const telegraphLayer = new Graphics();
  world.addChild(telegraphLayer);
  // enemy status auras — shield barrier / haste-buffer aura / reaper menace
  // glow. Drawn under sprites (like telegraphs) so the ring frames the enemy
  // without hiding its art. These make otherwise-invisible mechanics legible:
  // a shielded enemy soaking 90% damage, the buffer to kill first, the reaper.
  const enemyAuraLayer = new Graphics();
  world.addChild(enemyAuraLayer);
  // player active signature cast — arcane target rings + falling meteors +
  // impact bursts. Drawn ABOVE enemy telegraph so the player's cast is the
  // dominant visual when it's happening, not buried under combat noise.
  // activeLayer = Graphics primitives (telegraph rings, impact flashes).
  // activeSpriteLayer = real PixelLab pixel-art (meteor body, magma burst).
  // Sprites sit ON TOP of Graphics primitives so they read as 3D objects on
  // top of the ground glyph.
  const activeLayer = new Graphics();
  world.addChild(activeLayer);
  const activeSpriteLayer = new Container();
  world.addChild(activeSpriteLayer);
  // bezier_strike beams — pure Graphics polyline glow (no PNG). Sits above
  // entity sprites so the swirl visually wraps over enemies like a CSS
  // gradient line with a head spec.
  const beamLayer = new Graphics();
  world.addChild(beamLayer);
  // Pet companion (e.g. black_pigeon weapon's bird) — single pooled sprite
  // positioned every frame by main.js via drawPet(). Sits between entity
  // sprites and beam layer so the pet reads above the player but the beam
  // glow still glides over it.
  const petSprite = new Sprite();
  petSprite.anchor.set(0.5);
  petSprite.visible = false;
  world.addChild(petSprite);

  // PNG texture cache for signature assets — separate from spriteTexture
  // because these come from real image files, not the ASCII art pipeline.
  //
  // PIXI v8's Texture.from(URL) is lazy/async — it returns a placeholder
  // whose .source isn't ready until Assets.load() has cached the URL. The
  // synchronous path we want (matching spriteTexture's behaviour) is to
  // build the canvas ourselves: new Image() → wait for onload → draw into
  // canvas → Texture.from(canvas). Returns null while the image is still
  // loading; drawActive falls back to Graphics primitives on null.
  const pngTex = new Map(); // url -> Texture (only set once image is loaded)
  const pngLoading = new Set(); // urls we've kicked off an Image() for
  // Same loader pattern as pngTexture but post-processes the image: pure /
  // near-pure black pixels (R+G+B < 30) get alpha 0. PixelLab sprites ship
  // with a hard 1px black outline — turning it transparent lets the bird
  // blend into dark floor tiles instead of reading as a framed icon. Body
  // colors survive (the smallest body channel is ~40+ on these sprites).
  const pngTexBlackOut = new Map(); // url -> Texture (alpha-keyed copy)
  const pngLoadingBlackOut = new Set();
  function pngTextureBlackOut(url) {
    const cached = pngTexBlackOut.get(url);
    if (cached) return cached;
    if (!pngLoadingBlackOut.has(url)) {
      pngLoadingBlackOut.add(url);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = img.naturalWidth || img.width;
        cv.height = img.naturalHeight || img.height;
        const ctx = cv.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0);
        const id = ctx.getImageData(0, 0, cv.width, cv.height);
        const d = id.data;
        for (let i = 0; i < d.length; i += 4) {
          if (d[i] + d[i + 1] + d[i + 2] < 30) d[i + 3] = 0;
        }
        ctx.putImageData(id, 0, 0);
        const tex = Texture.from(cv);
        if (tex && tex.source) tex.source.scaleMode = 'nearest';
        pngTexBlackOut.set(url, tex);
      };
      img.onerror = () => {};
      img.src = url;
    }
    return null;
  }
  function pngTexture(url) {
    const cached = pngTex.get(url);
    if (cached) return cached;
    if (!pngLoading.has(url)) {
      pngLoading.add(url);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const cv = document.createElement('canvas');
        cv.width = img.naturalWidth || img.width;
        cv.height = img.naturalHeight || img.height;
        const ctx = cv.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0);
        const tex = Texture.from(cv);
        if (tex && tex.source) tex.source.scaleMode = 'nearest';
        pngTex.set(url, tex);
      };
      img.onerror = () => {
        // 404 / network fail — mark cache as null so we stop retrying.
        // drawActive will use the Graphics fallback path.
        pngTex.set(url, null);
        console.warn('[sigAssets] failed to load', url);
      };
      img.src = url;
    }
    return null; // still loading or failed — caller falls back
  }
  // Reusable sprite pool inside activeSpriteLayer — keep N pre-allocated
  // sprites and toggle .visible / .texture each frame to avoid churn.
  const ACTIVE_SPRITE_POOL = 32;
  const activeSprites = [];
  for (let i = 0; i < ACTIVE_SPRITE_POOL; i++) {
    const s = new Sprite();
    s.anchor.set(0.5);
    s.visible = false;
    activeSpriteLayer.addChild(s);
    activeSprites.push(s);
  }
  // Borrow the next sprite slot for this frame; index resets at draw start.
  let activeSpriteCursor = 0;
  function borrowActiveSprite() {
    if (activeSpriteCursor >= activeSprites.length) return null;
    const s = activeSprites[activeSpriteCursor++];
    s.visible = true;
    return s;
  }
  function resetActiveSprites() {
    for (let i = 0; i < activeSpriteCursor; i++) activeSprites[i].visible = false;
    activeSpriteCursor = 0;
  }
  // magnet pull lines — thin trails from pickups inside the magnet radius
  // toward the player, so the magnet stat feels visible. Drawn under sprites
  // so the dot still pops on top of its trail.
  const magnetLayer = new Graphics();
  world.addChild(magnetLayer);

  // motion trail — snapshot the player every few frames into a ring buffer,
  // then redraw the buffered states behind the player with decreasing alpha +
  // a pale-ice tint. Reads as a VS-style after-image streak when the player
  // moves; collapses to a single faint glow when idle.
  const TRAIL_STEPS = 8;
  const TRAIL_CAPTURE_EVERY = 3; // frames between captures — wider gaps = visible streak
  const TRAIL_MAX_ALPHA = 0.7;
  const TRAIL_TINT = 0xa8d0ff;
  const trailLayer = new Container();
  world.addChild(trailLayer); // above magnet lines, below entity sprites
  const trailSprites = [];
  const trailBuffer = [];
  let trailFrameCounter = 0;
  for (let i = 0; i < TRAIL_STEPS; i++) {
    const s = new Sprite();
    s.anchor.set(0.5);
    s.visible = false;
    s.tint = TRAIL_TINT;
    s.blendMode = 'add';
    trailLayer.addChild(s);
    trailSprites.push(s);
  }
  function captureTrail(sp, e) {
    if (!sp || !sp.texture) return;
    trailFrameCounter = (trailFrameCounter + 1) % TRAIL_CAPTURE_EVERY;
    if (trailFrameCounter === 0) {
      trailBuffer.push({
        x: e.x,
        y: e.y,
        scaleX: sp.scale.x,
        scaleY: sp.scale.y,
        texture: sp.texture,
        rotation: sp.rotation,
      });
      if (trailBuffer.length > TRAIL_STEPS) trailBuffer.shift();
    }
    // redraw every frame so alpha animates smoothly even between captures
    for (let i = 0; i < TRAIL_STEPS; i++) {
      const ts = trailSprites[i];
      const buf = trailBuffer[i];
      if (!buf) {
        ts.visible = false;
        continue;
      }
      ts.visible = true;
      ts.texture = buf.texture;
      ts.x = buf.x;
      ts.y = buf.y;
      ts.scale.set(buf.scaleX, buf.scaleY);
      ts.rotation = buf.rotation;
      // older entries (lower index) fade more; newest (highest index) brightest
      const t = (i + 1) / TRAIL_STEPS;
      ts.alpha = TRAIL_MAX_ALPHA * t * t; // squared falloff — newer ones still pop
    }
  }
  function drawMagnetLines(playerEnt, entities, magnetRadius) {
    // Magnet pull lines disabled — they rendered as long screen-spanning
    // diagonal streaks (cyan source colour blended toward warm tones on
    // grass tiles), distracting from the action. Pickup motion alone
    // already conveys the magnet pull, so the lines are no longer drawn.
    magnetLayer.clear();
  }
  let telegraphVisible = true;
  // A telegraph ring above an enemy that's winding up a cast (e.telegraph >
  // 0). Reads as a deliberate visual tell: an expanding red disc that fills
  // in over the windup, plus a pulse, so the player has a clear "shoot now /
  // get out" beat. Bosses get a thicker ring than plain ranged enemies.
  function drawTelegraphs(enemies) {
    telegraphLayer.clear();
    if (!telegraphVisible) return;
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 18);
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (!(e.telegraph > 0)) continue;
      // total telegraph duration is encoded by the source (boss 0.5 / ranged
      // 0.35); we re-derive the fill from the remaining time vs. the cast
      // kind so the ring "completes" right as the cast fires
      const total = e.castQueued === 'boss' ? 0.5 : 0.35;
      const fill = Math.max(0, Math.min(1, 1 - e.telegraph / total));
      const r = e.radius * (e.castQueued === 'boss' ? 3.6 : 2.4);
      const col = 0xff3a3a;
      telegraphLayer
        .circle(e.x, e.y, r).fill({ color: col, alpha: 0.08 + 0.12 * fill })
        .circle(e.x, e.y, r * (0.5 + 0.5 * fill))
        .stroke({ width: 2.5, color: col, alpha: 0.5 + 0.45 * pulse });
    }
  }

  // Per-enemy status auras — make invisible mechanics legible. Mirrors the
  // telegraph layer (under sprites). Three reads:
  //   shieldT > 0       → cyan rune ring (this enemy is soaking 90% — wait it out)
  //   ability 'buffer'  → warm orange aura (haste source — kill this first)
  //   enemyType reaper  → red menace glow (the panic enemy — run)
  function drawEnemyAuras(enemies) {
    enemyAuraLayer.clear();
    if (!telegraphVisible) return; // honour the same FX/telegraph toggle
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 6);
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e.dead) continue;
      if (e.shieldT > 0) {
        const r = (e.radius || 12) * 2.2;
        enemyAuraLayer
          .circle(e.x, e.y, r).fill({ color: 0x8fd0ff, alpha: 0.08 + 0.06 * pulse })
          .circle(e.x, e.y, r).stroke({ width: 2, color: 0xbfe6ff, alpha: 0.55 + 0.35 * pulse })
          .circle(e.x, e.y, r * 0.72).stroke({ width: 1.5, color: 0xbfe6ff, alpha: 0.35 + 0.3 * pulse });
      }
      if (e.ability === 'buffer') {
        const r = (e.radius || 12) * 2.6;
        enemyAuraLayer
          .circle(e.x, e.y, r).fill({ color: 0xff7a4a, alpha: 0.10 + 0.08 * pulse })
          .circle(e.x, e.y, r).stroke({ width: 3, color: 0xffa060, alpha: 0.55 + 0.35 * pulse })
          .circle(e.x, e.y, r * 0.6).stroke({ width: 1.5, color: 0xffc080, alpha: 0.4 + 0.3 * pulse });
      }
      if (e.enemyType === 'reaper') {
        const r = (e.radius || 18) * 2.4;
        enemyAuraLayer
          .circle(e.x, e.y, r).fill({ color: 0x8a0000, alpha: 0.12 + 0.10 * pulse })
          .circle(e.x, e.y, r * 0.7).stroke({ width: 2.5, color: 0xff2020, alpha: 0.5 + 0.4 * pulse });
      }
    }
  }

  // Player signature cast: arcane purple target rings (telegraph phase) +
  // falling meteor with growing shadow (falling phase) + expanding burst
  // (impact phase). State is a snapshot from systems/active.js — see
  // setActiveState(). Drawn every frame; minimal cost (few primitives).
  function drawActive(activeState) {
    activeLayer.clear();
    // Hide last frame's sprites first; borrowActiveSprite re-shows any used
    // this frame.
    for (let i = 0; i < activeSpriteCursor; i++) activeSprites[i].visible = false;
    activeSpriteCursor = 0;
    // Spacebar ultimate cast triggers the hero's attack animation — same
    // path as projectile-fire detection above, but driven by signature
    // phase. Fires once per cast on the idle→telegraph transition so the
    // hero "winds up" right as the telegraph rings appear.
    const phase = activeState && activeState.castPhase;
    if (phase === 'telegraph' && lastActivePhase !== 'telegraph') {
      playerAttackUntil = elapsed + ULTIMATE_ATTACK_DUR;
    }
    lastActivePhase = phase || 'idle';
    if (!activeState || !activeState.sig) return;
    const sig = activeState.sig;

    // ---- Telegraph rings: target locked, pulsing arcane circles + hex rune
    if (activeState.castPhase === 'telegraph' && activeState.castTargets.length) {
      const total = activeState.telegraphTotal || sig.telegraphTime || 0.8;
      // 0..1 — 0 at cast start, 1 at impact. Last 25% shrinks the ring.
      const progress = Math.max(0, Math.min(1, 1 - activeState.telegraphTime / total));
      const shrink = progress < 0.75 ? 1 : 1 - (progress - 0.75) * 0.8; // 1.0 → 0.8 over last 20%
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 16);
      // scaledRadius (level-scaled in active.js) so the telegraph ring matches
      // the actual damage footprint; falls back to sig.radius pre-scale.
      const r = activeState.scaledRadius || sig.radius;
      for (let i = 0; i < activeState.castTargets.length; i++) {
        const t = activeState.castTargets[i];
        const rr = r * shrink;
        // Outer ring (arcane dark) — broad warning area
        activeLayer
          .circle(t.x, t.y, rr).fill({ color: sig.telegraphRing, alpha: 0.18 + 0.18 * pulse })
          .circle(t.x, t.y, rr).stroke({ width: 2, color: sig.telegraphFill, alpha: 0.55 + 0.35 * pulse });
        // Inner disc (lighter arcane) — focal point
        activeLayer
          .circle(t.x, t.y, rr * 0.55).fill({ color: sig.telegraphFill, alpha: 0.10 + 0.15 * pulse });
        // Hex rune — 6 spokes from center to mid-ring. Reads as "magic glyph"
        const runeR = rr * 0.7;
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2 + progress * 0.6;
          const x2 = t.x + Math.cos(a) * runeR;
          const y2 = t.y + Math.sin(a) * runeR;
          activeLayer
            .moveTo(t.x + Math.cos(a) * runeR * 0.2, t.y + Math.sin(a) * runeR * 0.2)
            .lineTo(x2, y2)
            .stroke({ width: 1.5, color: sig.telegraphRune, alpha: 0.45 + 0.4 * pulse });
        }
      }
    }

    // ---- Falling phase + impacts (visuals branch by sig.kind)
    for (let i = 0; i < activeState.drops.length; i++) {
      const d = activeState.drops[i];
      if (!d.exploded) {
        const total = d.fallTotal || 0.55;
        const t01 = Math.max(0, Math.min(1, 1 - d.fallTimer / total)); // 0..1 over fall

        // BEAM (knight holy_beam): vertical pillar of light growing brighter
        if (sig.kind === 'beam') {
          const pillarW = 14 + 22 * t01;
          const pillarH = 220 * t01;
          activeLayer
            .rect(d.x - pillarW / 2, d.y - pillarH, pillarW, pillarH)
            .fill({ color: sig.pillarColor || 0xfac860, alpha: 0.35 + 0.35 * t01 })
            .rect(d.x - pillarW / 4, d.y - pillarH, pillarW / 2, pillarH)
            .fill({ color: sig.pillarHighlight || 0xffffff, alpha: 0.55 * t01 });
          // ground glow at landing point
          activeLayer.circle(d.x, d.y, 18 * t01)
            .fill({ color: sig.pillarHighlight || 0xffffff, alpha: 0.55 * t01 });
          continue;
        }

        // SELF (warrior earth_crack): no falling body — radial ground cracks
        // expanding outward from player, intensity building toward impact
        if (sig.kind === 'self') {
          // pulsing radial cracks — 6 spokes (level-scaled radius)
          const r = (activeState.scaledRadius || sig.radius) * t01;
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * Math.PI * 2 + elapsed * 0.5;
            const x2 = d.x + Math.cos(a) * r;
            const y2 = d.y + Math.sin(a) * r;
            activeLayer
              .moveTo(d.x, d.y).lineTo(x2, y2)
              .stroke({ width: 3 + 2 * t01, color: sig.telegraphFill || 0xc64628, alpha: 0.7 + 0.3 * t01 });
          }
          continue;
        }

        // SWARM (necromancer undead_swarm): inverted of meteor — skeleton
        // RISES from the ground. Sprite starts below the target, lifts to
        // it during the fall phase, with a dark hole glow at the target.
        if (sig.kind === 'swarm') {
          // ground hole glow — pulsing as the skeleton rises
          activeLayer
            .ellipse(d.x, d.y + 4, 14 * t01, 6 * t01)
            .fill({ color: sig.telegraphRing || 0x24502a, alpha: 0.65 * t01 })
            .ellipse(d.x, d.y + 4, 10 * t01, 4 * t01)
            .fill({ color: sig.telegraphFill || 0x88b85a, alpha: 0.4 * t01 });

          // rising skeleton sprite — starts ~30px below target, lifts to it
          const riseY = d.y + 30 * (1 - t01);
          if (sig.swarmAsset) {
            const tex = pngTexture(sig.swarmAsset);
            if (tex) {
              const sp = borrowActiveSprite();
              if (sp) {
                sp.texture = tex;
                sp.x = d.x;
                sp.y = riseY;
                sp.scale.set(sig.swarmScale || 1.2);
                sp.rotation = 0;
                sp.alpha = t01; // fade in as it emerges
              }
            }
          }
          continue;
        }

        // ARROWS (huntress arrow_rain): small arrow falling at slight angle
        if (sig.kind === 'arrows') {
          const arrowY = d.y - 180 * (1 - t01);
          const arrowX = d.x - 24 * (1 - t01);
          // shaft
          activeLayer
            .moveTo(arrowX - 4, arrowY - 8).lineTo(arrowX + 4, arrowY + 8)
            .stroke({ width: 2, color: sig.arrowColor || 0xece2c8, alpha: 1 });
          // tip glint
          activeLayer.circle(arrowX + 4, arrowY + 8, 2)
            .fill({ color: sig.arrowTip || 0xbfe6f0, alpha: 1 });
          // fletch
          activeLayer.circle(arrowX - 4, arrowY - 8, 2.5)
            .fill({ color: sig.arrowFletch || 0x88b85a, alpha: 0.95 });
          // small shadow growing
          const shadowR = 2 + 6 * t01;
          activeLayer.ellipse(d.x, d.y + 2, shadowR, shadowR * 0.4)
            .fill({ color: sig.shadow || 0x07060c, alpha: 0.4 * t01 });
          continue;
        }

        // METEOR (mage): default — shadow + falling rocky fireball
        const shadowR = 4 + 22 * t01;
        activeLayer
          .ellipse(d.x, d.y + 2, shadowR, shadowR * 0.4)
          .fill({ color: sig.shadow || 0x07060c, alpha: 0.45 * t01 });
        const meteorY = d.y - 200 * (1 - t01);

        // PixelLab sprite path — used when the signature declares
        // `meteorAsset` AND the texture is loaded. While the PNG is still
        // streaming in we fall through to the Graphics fireball so the
        // first cast on a fresh page load isn't invisible.
        let usedSprite = false;
        if (sig.meteorAsset) {
          const url = assetFrameUrl(sig.meteorAsset, elapsed + i * 0.07);
          const tex = url ? pngTexture(url) : null;
          if (tex) {
            const sp = borrowActiveSprite();
            if (sp) {
              sp.texture = tex;
              sp.x = d.x;
              sp.y = meteorY;
              // Scale tuned to read at 60-72px on screen (48px source × scale)
              sp.scale.set(sig.meteorScale || 1.4);
              // Trajectory rotation: source art faces upper-right (flame
              // trailing up-left). Base offset π/4 aligns the flame with
              // the falling direction. Add a tumbling spin scaled to fall
              // progress so the meteor reads as rocky/heavy, not floating.
              sp.rotation = Math.PI / 4
                + (1 - t01) * Math.PI * 1.5 // spin slows as it nears impact
                + Math.sin(elapsed * 4 + i) * 0.08;
              sp.alpha = 1;
              usedSprite = true;
            }
          }
        }
        if (!usedSprite) {
          // No PixelLab asset configured — fallback Graphics fireball
          // (outer red halo → orange mid → flame yellow → white-hot spec)
          activeLayer
            .circle(d.x, meteorY, 16).fill({ color: sig.meteorOuter || 0xc64628, alpha: 0.5 })
            .circle(d.x, meteorY, 12).fill({ color: sig.meteorCore || 0xf08a2a, alpha: 0.85 })
            .circle(d.x, meteorY, 7).fill({ color: sig.meteorHighlight || 0xfac860, alpha: 0.95 })
            .circle(d.x, meteorY, 3).fill({ color: sig.meteorSpec || 0xffffff, alpha: 1.0 });
          for (let k = 1; k <= 4; k++) {
            activeLayer.circle(d.x, meteorY - k * 12, 6 - k).fill({
              color: k <= 2 ? (sig.meteorCore || 0xf08a2a) : (sig.meteorTrail || 0xc64628),
              alpha: 0.65 - k * 0.12,
            });
          }
        }
      } else {
        // Impact burst — PNG animation (impactAsset) OR Graphics radial
        const life = Math.max(0, d.impactLife);
        const t01 = 1 - life / 0.4;
        let usedSprite = false;
        if (sig.impactAsset) {
          const url = assetFrameUrl(sig.impactAsset, 0.4 - life);
          const tex = url ? pngTexture(url) : null;
          if (tex) {
            const sp = borrowActiveSprite();
            if (sp) {
              sp.texture = tex;
              sp.x = d.x;
              sp.y = d.y;
              const s = (sig.impactScale || 2.0) * (0.4 + 1.2 * t01);
              sp.scale.set(s);
              sp.rotation = 0;
              sp.alpha = 1 - t01 * 0.4;
              usedSprite = true;
            }
          }
        }
        if (!usedSprite) {
          const r = (activeState.scaledRadius || sig.radius) * (0.3 + 0.9 * t01);
          const alpha = 1 - t01;
          activeLayer
            .circle(d.x, d.y, r).fill({ color: sig.impactArcane || 0xb574d8, alpha: 0.22 * alpha })
            .circle(d.x, d.y, r * 0.65).fill({ color: sig.impactMid || 0xf08a2a, alpha: 0.28 * alpha })
            .circle(d.x, d.y, r * 0.32).fill({ color: sig.impactCore || 0xffffff, alpha: 0.55 * alpha })
            .circle(d.x, d.y, r).stroke({ width: 2, color: sig.impactCore || 0xffffff, alpha: 0.65 * alpha });
        }
      }
    }
  }

  // Per-weapon AoE sky-drop FX. Each `instance` carries its own state +
  // kit palette (def.aoeKit in content/weapons.js). Mirrors drawActive but
  // reads from kit.* instead of sig.* — keeps sig palette and weapon
  // palette independent so they can coexist on screen.
  //
  // ASSUMPTION: called AFTER drawActive, so activeLayer is already cleared
  // and seeded with sig FX (if any). We APPEND on top without clearing.
  // activeSpriteCursor continues from where drawActive left it.
  function drawWeaponSkyDropFx(instances) {
    if (!instances || instances.length === 0) return;
    for (let n = 0; n < instances.length; n++) {
      const inst = instances[n];
      const st = inst.state;
      const kit = inst.kit;
      if (!st || !kit) continue;

      // ---- Telegraph rings + rune ----
      if (st.castPhase === 'telegraph' && st.castTargets.length) {
        const total = st.telegraphTotal || 0.5;
        const progress = Math.max(0, Math.min(1, 1 - st.telegraphTime / total));
        const shrink = progress < 0.75 ? 1 : 1 - (progress - 0.75) * 0.8;
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 16);
        const r = kit.radius || 60;
        for (let i = 0; i < st.castTargets.length; i++) {
          const t = st.castTargets[i];
          const rr = r * shrink;
          activeLayer
            .circle(t.x, t.y, rr).fill({ color: kit.telegraphRing || 0x3a1a55, alpha: 0.18 + 0.18 * pulse })
            .circle(t.x, t.y, rr).stroke({ width: 2, color: kit.telegraphFill || 0xb574d8, alpha: 0.55 + 0.35 * pulse })
            .circle(t.x, t.y, rr * 0.55).fill({ color: kit.telegraphFill || 0xb574d8, alpha: 0.10 + 0.15 * pulse });
          const runeR = rr * 0.7;
          for (let k = 0; k < 6; k++) {
            const a = (k / 6) * Math.PI * 2 + progress * 0.6;
            const x2 = t.x + Math.cos(a) * runeR;
            const y2 = t.y + Math.sin(a) * runeR;
            activeLayer
              .moveTo(t.x + Math.cos(a) * runeR * 0.2, t.y + Math.sin(a) * runeR * 0.2)
              .lineTo(x2, y2)
              .stroke({ width: 1.5, color: kit.telegraphRune || 0xece2c8, alpha: 0.45 + 0.4 * pulse });
          }
        }
      }

      // ---- Falling drops + impact bursts ----
      for (let i = 0; i < st.drops.length; i++) {
        const d = st.drops[i];
        if (!d.exploded) {
          // rainSkipDrop: rain-pattern weapons spawn their own falling
          // projectile (smite bolts, meteor rocks), so we skip drawing a
          // separate falling body. Telegraph ring on the ground + impact
          // burst when the rehit hook fires is enough.
          if (kit.rainSkipDrop) continue;
          const total = d.fallTotal || 0.55;
          const t01 = Math.max(0, Math.min(1, 1 - d.fallTimer / total));
          // ground shadow grows as drop nears impact
          const shadowR = 4 + 22 * t01;
          activeLayer
            .ellipse(d.x, d.y + 2, shadowR, shadowR * 0.4)
            .fill({ color: kit.shadow || 0x07060c, alpha: 0.45 * t01 });

          const dropY = d.y - 200 * (1 - t01);
          let usedSprite = false;
          if (kit.dropAsset) {
            const url = assetFrameUrl(kit.dropAsset, elapsed + i * 0.07);
            const tex = url ? pngTexture(url) : null;
            if (tex) {
              const sp = borrowActiveSprite();
              if (sp) {
                sp.texture = tex;
                sp.x = d.x;
                sp.y = dropY;
                sp.scale.set(kit.dropScale || 1.4);
                // Drop sprite no longer spins as it falls — orbs/orbs-style
                // assets read clearer when they descend upright. Opt back in
                // with `kit.dropSpin: true` per weapon if needed.
                sp.rotation = kit.dropSpin
                  ? (kit.dropRotate ?? Math.PI / 4)
                    + (1 - t01) * Math.PI * 1.5
                    + Math.sin(elapsed * 4 + i) * 0.08
                  : (kit.dropRotate ?? 0);
                sp.alpha = 1;
                usedSprite = true;
              }
            }
          }
          if (!usedSprite) {
            // Graphics fallback fireball — same shape as mage signature
            activeLayer
              .circle(d.x, dropY, 16).fill({ color: kit.meteorOuter || 0xc64628, alpha: 0.5 })
              .circle(d.x, dropY, 12).fill({ color: kit.meteorCore || 0xf08a2a, alpha: 0.85 })
              .circle(d.x, dropY, 7).fill({ color: kit.meteorHighlight || 0xfac860, alpha: 0.95 })
              .circle(d.x, dropY, 3).fill({ color: kit.meteorSpec || 0xffffff, alpha: 1.0 });
            for (let k = 1; k <= 4; k++) {
              activeLayer.circle(d.x, dropY - k * 12, 6 - k).fill({
                color: k <= 2 ? (kit.meteorCore || 0xf08a2a) : (kit.meteorTrail || 0xc64628),
                alpha: 0.65 - k * 0.12,
              });
            }
          }
        } else {
          // Impact burst (PNG or Graphics)
          const life = Math.max(0, d.impactLife);
          const total = kit.impactFxLife || 0.4;
          const t01 = 1 - life / total;
          let usedSprite = false;
          if (kit.impactAsset) {
            const url = assetFrameUrl(kit.impactAsset, total - life);
            const tex = url ? pngTexture(url) : null;
            if (tex) {
              const sp = borrowActiveSprite();
              if (sp) {
                sp.texture = tex;
                sp.x = d.x;
                sp.y = d.y;
                const s = (kit.impactScale || 2.0) * (0.4 + 1.2 * t01);
                sp.scale.set(s);
                sp.rotation = 0;
                sp.alpha = 1 - t01 * 0.4;
                usedSprite = true;
              }
            }
          }
          if (!usedSprite) {
            const r = (kit.radius || 60) * (0.3 + 0.9 * t01);
            const alpha = 1 - t01;
            activeLayer
              .circle(d.x, d.y, r).fill({ color: kit.impactArcane || kit.telegraphFill || 0xb574d8, alpha: 0.22 * alpha })
              .circle(d.x, d.y, r * 0.65).fill({ color: kit.impactMid || kit.meteorCore || 0xf08a2a, alpha: 0.28 * alpha })
              .circle(d.x, d.y, r * 0.32).fill({ color: kit.impactCore || 0xffffff, alpha: 0.55 * alpha })
              .circle(d.x, d.y, r).stroke({ width: 2, color: kit.impactCore || 0xffffff, alpha: 0.65 * alpha });
          }
        }
      }
    }
  }

  // bezier_strike beams — 2-pass Graphics polyline (wide low-alpha glow +
  // thin bright core) plus head spec; the curve grows as the beam flies
  // (sampled in `BEAM_SEGMENTS` steps from start → current progress).
  // Also draws ground "telegraph" markers added via `addBeamMarker()` —
  // a pulsing white-outlined disc on the ground where the volley's beams
  // are about to land. Reads as a signature-style AoE drop.
  const BEAM_SEGMENTS = 14;
  const beamMarkers = []; // { x, y, radius, startedAt, life }
  function addBeamMarker(o) {
    beamMarkers.push({
      x: o.x, y: o.y, radius: o.radius || 90,
      startedAt: elapsed, life: o.life || 1.5,
    });
  }
  function drawBeams(projectiles) {
    beamLayer.clear();
    // Ground markers first — sit under the beam lines.
    for (let i = beamMarkers.length - 1; i >= 0; i--) {
      const m = beamMarkers[i];
      const age = elapsed - m.startedAt;
      if (age >= m.life) { beamMarkers.splice(i, 1); continue; }
      const ringAlpha = 0.55 + 0.25 * Math.sin(age * Math.PI * 4);
      // Thin translucent fill so the floor still reads through
      beamLayer.circle(m.x, m.y, m.radius).fill({ color: 0xffffff, alpha: 0.07 });
      // White rim — the "incoming AoE" tell. Two strokes for a soft edge.
      beamLayer.circle(m.x, m.y, m.radius).stroke({ width: 4, color: 0xffffff, alpha: 0.18 });
      beamLayer.circle(m.x, m.y, m.radius).stroke({ width: 1.5, color: 0xffffff, alpha: ringAlpha });
    }
    for (let i = 0; i < projectiles.length; i++) {
      const e = projectiles[i];
      if (!e.bezier) continue;
      // Dormant (stagger-queued) beams haven't launched yet — no flight
      // line, no head, no landing pulse. Movement and collision skip too.
      if (e.delay > 0) continue;
      const b = e.bezier;
      const tNow = b.t > 1 ? 1 : b.t;
      const color = e.color || 0x6a4a9f;
      // Glow pass — wide soft halo
      beamLayer.moveTo(b.sx, b.sy);
      for (let j = 1; j <= BEAM_SEGMENTS; j++) {
        const tt = (j / BEAM_SEGMENTS) * tNow;
        const u = 1 - tt;
        const x = u * u * b.sx + 2 * u * tt * b.cx + tt * tt * b.ex;
        const y = u * u * b.sy + 2 * u * tt * b.cy + tt * tt * b.ey;
        beamLayer.lineTo(x, y);
      }
      beamLayer.stroke({ width: 16, color, alpha: 0.32, cap: 'round', join: 'round' });
      // Core pass — thin bright line
      beamLayer.moveTo(b.sx, b.sy);
      for (let j = 1; j <= BEAM_SEGMENTS; j++) {
        const tt = (j / BEAM_SEGMENTS) * tNow;
        const u = 1 - tt;
        const x = u * u * b.sx + 2 * u * tt * b.cx + tt * tt * b.ex;
        const y = u * u * b.sy + 2 * u * tt * b.cy + tt * tt * b.ey;
        beamLayer.lineTo(x, y);
      }
      beamLayer.stroke({ width: 3.5, color: 0xece2c8, alpha: 0.95, cap: 'round', join: 'round' });
      // Head spec — outer purple glow + inner cream core at current position
      beamLayer.circle(e.x, e.y, 10).fill({ color, alpha: 0.5 });
      beamLayer.circle(e.x, e.y, 4).fill({ color: 0xece2c8, alpha: 0.98 });
      // Landing pulse — two concentric expanding rings + a soft splash
      // puddle (smite/천벌 impact splash). Starts earlier (last 22% of
      // flight) and reaches a much bigger radius so the AoE drop reads
      // clearly even in a crowded room.
      if (b.t > 0.78) {
        const pT = Math.min(1, (b.t - 0.78) / 0.22);
        const pA = (1 - pT) * 0.95;
        // Splash fill — soft glow puddle that widens with the rings
        beamLayer.circle(b.ex, b.ey, 8 + pT * 60).fill({
          color: 0xffffff, alpha: pA * 0.20,
        });
        // Outer ring — wider, brighter rim
        beamLayer.circle(b.ex, b.ey, 8 + pT * 64).stroke({
          width: 3.5, color: 0xffffff, alpha: pA,
        });
        // Inner ring — coloured echo (matches beam tint)
        beamLayer.circle(b.ex, b.ey, 4 + pT * 32).stroke({
          width: 2.2, color, alpha: pA * 0.85,
        });
      }
    }
  }

  // Zones (AoE/vortex discs) are drawn every other frame — the pulse
  // animation still reads smooth at 30fps and the Graphics clear+redraw is
  // expensive per draw call. `zones` is the prefiltered bucket of projectiles
  // that draw a disc (e.rehit || e.pull); no per-entity filtering needed here.
  let zoneTick = 0;
  function drawZones(zones) {
    if ((zoneTick++ & 1) !== 0) return;
    zoneLayer.clear();
    // Two-rate pulse so the inner ring breathes against the orbiting glyphs
    // rather than syncing to a single sine. Earlier 장판 felt static — just
    // a translucent disc with one pulse — so this adds:
    //   1. a slow expanding shock-ripple (breath)
    //   2. counter-rotating sub-rings (one CW, one CCW arc segments)
    //   3. 4 orbiting glyph dots around the perimeter
    //   4. a cross-hatch / star spark fading on the breath beat
    // All Graphics primitives, runs every-other-frame already.
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * 5.2);
    const breath = 0.5 + 0.5 * Math.sin(elapsed * 1.7); // slower, layered
    const spin = elapsed * 1.3;
    const counter = -elapsed * 0.9;
    for (let i = 0; i < zones.length; i++) {
      const e = zones[i];
      if (e.delay > 0) continue; // dormant during sky-drop telegraph + fall
      const col = e.color ?? 0xffffff;
      const r = e.radius;

      // Layer 1 — outer halo + filled disc + base rim (existing identity)
      zoneLayer
        .circle(e.x, e.y, r + 10).fill({ color: col, alpha: 0.06 })
        .circle(e.x, e.y, r).fill({ color: col, alpha: 0.18 })
        .circle(e.x, e.y, r * (0.55 + 0.18 * pulse))
        .stroke({ width: 2, color: 0xffffff, alpha: 0.18 + 0.22 * pulse })
        .circle(e.x, e.y, r).stroke({ width: 2.5, color: col, alpha: 0.75 });

      // Layer 2 — slow expanding shock-ripple (breath beat)
      const ripple = r * (0.85 + 0.18 * breath);
      zoneLayer
        .circle(e.x, e.y, ripple)
        .stroke({ width: 1.5, color: 0xffffff, alpha: 0.22 * (1 - breath) });

      // Layer 3 — counter-rotating arc segments (3-segment broken ring).
      // CRITICAL: PixiJS v8 `.arc()` draws an implicit line from the current
      // point to the arc start (Canvas 2D semantics). Without an explicit
      // `.moveTo()` before each arc, every arc segment connects to the
      // previous geometry's endpoint — across iterations AND across zones,
      // producing screen-spanning thin diagonals (yellow/cream for the
      // 'physical' theme — bear_trap, warhammer, etc.). Explicit moveTo to
      // the arc start point breaks the implicit chord and isolates each arc.
      const r2 = r * 0.78;
      const r3 = r * 0.62;
      for (let k = 0; k < 3; k++) {
        const a0 = spin + (k * Math.PI * 2) / 3;
        const a1 = a0 + Math.PI / 4; // 45° arc
        zoneLayer
          .moveTo(e.x + Math.cos(a0) * r2, e.y + Math.sin(a0) * r2)
          .arc(e.x, e.y, r2, a0, a1)
          .stroke({ width: 2, color: col, alpha: 0.55 });
      }
      for (let k = 0; k < 3; k++) {
        const a0 = counter + (k * Math.PI * 2) / 3 + Math.PI / 6;
        const a1 = a0 + Math.PI / 5; // 36° arc
        zoneLayer
          .moveTo(e.x + Math.cos(a0) * r3, e.y + Math.sin(a0) * r3)
          .arc(e.x, e.y, r3, a0, a1)
          .stroke({ width: 1.5, color: 0xffffff, alpha: 0.45 });
      }

      // Layer 4 — orbiting glyph dots (4 around the perimeter)
      const orbitR = r * 0.95;
      const dotR = 2.2 + 1.2 * pulse;
      for (let k = 0; k < 4; k++) {
        const a = spin * 1.6 + (k * Math.PI) / 2;
        const dx = e.x + Math.cos(a) * orbitR;
        const dy = e.y + Math.sin(a) * orbitR;
        zoneLayer.circle(dx, dy, dotR).fill({ color: 0xffffff, alpha: 0.85 });
        zoneLayer.circle(dx, dy, dotR * 2.0).fill({ color: col, alpha: 0.35 });
      }
    }
  }

  // PixelLab PNG overlay for ground zones — runs every frame (no skip)
  // because the texture cycle is the visual punch. Pools sprites to a
  // fixed cap (ZONE_SPRITE_POOL); zones past the cap fall back to pure
  // Graphics (still readable, just no PixelLab art).
  function drawZoneSprites(zones) {
    let used = 0;
    for (let i = 0; i < zones.length && used < ZONE_SPRITE_POOL; i++) {
      const e = zones[i];
      if (e.delay > 0) continue; // hide ground PNG until the orb lands
      if (!e.groundAsset) continue;
      const url = assetFrameUrl(e.groundAsset, elapsed);
      if (!url) continue;
      const tex = pngTexture(url);
      if (!tex) continue;
      const sp = zoneSprites[used++];
      sp.visible = true;
      sp.x = e.x;
      sp.y = e.y;
      sp.texture = tex;
      const w = tex.width || 64;
      // scale so the PNG fits inside the zone disc (radius * 2.2 ≈ disc
      // diameter * 1.1 — slight bleed beyond the ring keeps it framed)
      sp.scale.set((e.radius * 2.2) / w);
      sp.alpha = 0.92;
      // No tint — PixelLab art is already coloured (meteor orange / vortex
      // purple). Pixi tint multiplies, which would desaturate the source.
      sp.tint = 0xffffff;
    }
    for (let i = used; i < ZONE_SPRITE_POOL; i++) {
      zoneSprites[i].visible = false;
    }
  }
  // a fixed pool of prop sprites — the structures of every room blueprint
  // visible around the camera (structuresNear), placed each frame
  const PROP_POOL = 220;
  const PROP_QUERY = Math.max(VIEW.width, VIEW.height) * 0.85 + 240;
  const propSprites = [];
  for (let i = 0; i < PROP_POOL; i++) {
    const s = new Sprite();
    s.anchor.set(0.5, 0.86); // the prop's base rests on the placement point
    s.scale.set(TILE_SCALE);
    propLayer.addChild(s);
    propSprites.push(s);
  }
  // structuresNear scans every room blueprint cell the query overlaps; cache
  // it and only re-run when the camera has drifted past PROP_CACHE_STEP px,
  // since the visible set is stable across small camera moves.
  const PROP_CACHE_STEP = 64;
  let propCacheCx = NaN;
  let propCacheCy = NaN;
  let propCache = [];
  function updateProps() {
    const cx = Math.floor(camera.x / PROP_CACHE_STEP);
    const cy = Math.floor(camera.y / PROP_CACHE_STEP);
    if (cx !== propCacheCx || cy !== propCacheCy) {
      // Pass activeZones so the prop set matches movement.js collision filter.
      propCache = structuresNear(activeRooms, camera.x, camera.y, PROP_QUERY, activeZones, activeClusterSize);
      propCacheCx = cx;
      propCacheCy = cy;
    }
    const near = propCache;
    let i = 0;
    for (let n = 0; n < near.length && i < propSprites.length; n++) {
      const st = near[n];
      // Prefer PixelLab PNG when registered; fall back to ASCII art so props
      // without PNGs still render. A prop with neither is skipped.
      const pngUrl = structureAssetUrl(st.name);
      const tex = pngUrl ? pngTexture(pngUrl) : null;
      const hasAscii = window.SPRITES && window.SPRITES[st.name];
      if (!tex && !hasAscii) continue;
      const s = propSprites[i++];
      s.texture = tex || spriteTexture(st.name, 0);
      // Per-prop scale override — giant landmarks set scale: 1.6 in rooms.js.
      // No override → 1× (TILE_SCALE), matching the pool's init scale.
      s.scale.set(TILE_SCALE * (st.scale ?? 1));
      s.x = st.x;
      s.y = st.y;
      s.visible = true;
    }
    for (; i < propSprites.length; i++) propSprites[i].visible = false;
  }

  // === floor decor — procedural detail scatter ============================
  // Three small details — pebble cluster, grass tuft, crack line — drawn into
  // 16×16 canvases once and reused via a sprite pool. Per-cell pick is
  // deterministic on (cx, cy), so the same cell always carries the same
  // decor regardless of camera position. Zones bias which decor shows up,
  // so graveyard reads grassy, colonnade reads stony, inner-sanctum reads
  // cracked — without needing extra PixelLab art.
  function makeDecorTexture(kind) {
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 16;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    if (kind === 0) {
      // pebble cluster — three tiny dark stones (Ch.1 dungeon colonnade etc.)
      ctx.fillStyle = 'rgba(40,30,40,0.55)';
      ctx.fillRect(5, 7, 2, 2);
      ctx.fillRect(8, 9, 2, 2);
      ctx.fillRect(11, 6, 1, 1);
    } else if (kind === 1) {
      // grass tuft — short green blades (graveyard, forest old-grove)
      ctx.fillStyle = 'rgba(120,150,80,0.7)';
      ctx.fillRect(6, 8, 1, 3);
      ctx.fillRect(8, 9, 1, 3);
      ctx.fillRect(10, 7, 1, 3);
      ctx.fillStyle = 'rgba(180,200,120,0.5)';
      ctx.fillRect(7, 7, 1, 1);
      ctx.fillRect(9, 8, 1, 1);
    } else if (kind === 2) {
      // crack — thin dark jagged line (inner-sanctum, lava-flow)
      ctx.strokeStyle = 'rgba(20,15,25,0.55)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(3, 12);
      ctx.lineTo(7, 8);
      ctx.lineTo(10, 11);
      ctx.lineTo(13, 7);
      ctx.stroke();
    } else if (kind === 3) {
      // leaf — small red/yellow scattered leaves (forest)
      ctx.fillStyle = 'rgba(180,90,50,0.65)';
      ctx.fillRect(5, 6, 2, 2);
      ctx.fillRect(10, 9, 2, 2);
      ctx.fillStyle = 'rgba(200,160,60,0.6)';
      ctx.fillRect(7, 10, 1, 1);
      ctx.fillRect(12, 6, 2, 1);
    } else if (kind === 4) {
      // ember — small glowing orange dots (volcano)
      ctx.fillStyle = 'rgba(255,140,40,0.85)';
      ctx.fillRect(6, 8, 1, 1);
      ctx.fillRect(9, 6, 1, 1);
      ctx.fillRect(11, 10, 1, 1);
      ctx.fillStyle = 'rgba(255,200,80,0.55)';
      ctx.fillRect(7, 7, 1, 1);
      ctx.fillRect(10, 9, 1, 1);
    } else if (kind === 5) {
      // snowflake — small white cross marks (ice)
      ctx.fillStyle = 'rgba(220,235,255,0.75)';
      ctx.fillRect(6, 7, 3, 1);
      ctx.fillRect(7, 6, 1, 3);
      ctx.fillRect(11, 10, 3, 1);
      ctx.fillRect(12, 9, 1, 3);
    } else if (kind === 6) {
      // star sparkle — purple twinkle (void)
      ctx.fillStyle = 'rgba(220,180,255,0.85)';
      ctx.fillRect(7, 7, 1, 1);
      ctx.fillRect(11, 9, 1, 1);
      ctx.fillStyle = 'rgba(160,120,220,0.6)';
      ctx.fillRect(6, 6, 1, 1);
      ctx.fillRect(12, 10, 1, 1);
      ctx.fillRect(8, 11, 1, 1);
    }
    return Texture.from(c);
  }
  const decorTextures = [
    makeDecorTexture(0), // pebble
    makeDecorTexture(1), // grass
    makeDecorTexture(2), // crack
    makeDecorTexture(3), // leaf
    makeDecorTexture(4), // ember
    makeDecorTexture(5), // snowflake
    makeDecorTexture(6), // star
  ];
  const DECOR_POOL = 240; // enough for a full screen at ~8% density
  const decorSprites = [];
  for (let i = 0; i < DECOR_POOL; i++) {
    const s = new Sprite();
    s.anchor.set(0.5);
    s.scale.set(TILE_SCALE);
    s.visible = false;
    decorLayer.addChild(s);
    decorSprites.push(s);
  }
  let decorCx = null;
  let decorCy = null;
  // Map zone name → preferred decor kind (0=pebble, 1=grass, 2=crack).
  // Other zones / chapters without an entry fall back to a hash mix.
  // 0=pebble, 1=grass, 2=crack, 3=leaf, 4=ember, 5=snowflake, 6=star
  const ZONE_DECOR_PREF = {
    // Ch.1 dungeon
    graveyard: 1, colonnade: 0, 'inner-sanctum': 2,
    // Ch.2 forest — leaf-leaning
    'old-grove': 3, 'mossy-ruins': 1, 'wolf-den': 0,
    // Ch.3 swamp — mossy & rotting
    mire: 1, 'rot-pool': 2, 'witch-grove': 3,
    // Ch.4 volcano — ember-leaning
    'lava-flow': 4, 'ash-plain': 0, 'forge-ruin': 4,
    // Ch.5 ice — snowflake-leaning
    'frost-cavern': 5, glacier: 0, 'frozen-shrine': 5,
    // Ch.6 void — star sparkle
    rift: 6, nebula: 6, singularity: 6,
  };
  function updateDecor() {
    const startCx = Math.floor((camera.x - VIEW.width / 2) / tileWorld) - 1;
    const startCy = Math.floor((camera.y - VIEW.height / 2) / tileWorld) - 1;
    if (startCx === decorCx && startCy === decorCy) return;
    decorCx = startCx;
    decorCy = startCy;
    // Chapters without zoneTints get no decor either — keeps the legacy
    // visual untouched and avoids decor showing up in void/forest/etc.
    if (!activeZoneTints) {
      for (const s of decorSprites) s.visible = false;
      return;
    }
    let i = 0;
    for (let r = 0; r < floorRows && i < DECOR_POOL; r++) {
      for (let c = 0; c < floorCols && i < DECOR_POOL; c++) {
        const cx = startCx + c;
        const cy = startCy + r;
        const h = cellHash(cx, cy);
        // ~12% of cells carry a decor sprite
        if ((h % 8) !== 0) continue;
        // zone biases pref — 70% chance the zone's pref kind, else random
        const rx = Math.floor((cx * tileWorld) / ROOM_WORLD_W);
        const ry = Math.floor((cy * tileWorld) / ROOM_WORLD_H);
        const zone = zoneAt(rx, ry, activeZones, activeClusterSize);
        const pref = ZONE_DECOR_PREF[zone];
        const subHash = (h >>> 8) & 0xff;
        // Zone bias 70% → 85% — 사용자 평가 "이질감 약함" 반영. graveyard
        // 영역은 풀잎이, sanctum은 균열이 도배되어 동네 정체성이 강해짐.
        const kind = (pref !== undefined && subHash < 217)
          ? pref
          : subHash % 3;
        const s = decorSprites[i++];
        s.texture = decorTextures[kind];
        s.x = cx * tileWorld + tileWorld / 2;
        s.y = cy * tileWorld + tileWorld / 2;
        // small per-cell rotation for variety
        s.rotation = (((h >>> 16) & 0xff) / 256) * Math.PI * 0.5 - Math.PI * 0.25;
        s.visible = true;
      }
    }
    for (; i < decorSprites.length; i++) decorSprites[i].visible = false;
  }

  // === ambient layer (vignette + fog) ====================================
  // Per-chapter `ambient` opts in. Sits above props/entities so it tints the
  // whole frame without darkening the player too much. Vignette is a screen
  // overlay drawn once; fog is a small drift pool that wraps around the view.
  const ambientLayer = new Container();
  world.addChild(ambientLayer);

  // vignette texture — radial alpha fade into corners, drawn into a canvas
  // once. The sprite is repositioned to the camera's view rect each frame.
  const vignetteCanvas = document.createElement('canvas');
  vignetteCanvas.width = VIEW.width;
  vignetteCanvas.height = VIEW.height;
  {
    const vctx = vignetteCanvas.getContext('2d');
    const cxv = VIEW.width / 2;
    const cyv = VIEW.height / 2;
    const r = Math.max(cxv, cyv);
    const grad = vctx.createRadialGradient(cxv, cyv, 0, cxv, cyv, r);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(0.55, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,1)');
    vctx.fillStyle = grad;
    vctx.fillRect(0, 0, VIEW.width, VIEW.height);
  }
  const vignetteSprite = new Sprite(Texture.from(vignetteCanvas));
  vignetteSprite.anchor.set(0);
  vignetteSprite.visible = false;
  ambientLayer.addChild(vignetteSprite);

  // fog particle texture — soft blob; reused across the pool
  const fogCanvas = document.createElement('canvas');
  fogCanvas.width = 96;
  fogCanvas.height = 96;
  {
    const fctx = fogCanvas.getContext('2d');
    const grad = fctx.createRadialGradient(48, 48, 0, 48, 48, 48);
    grad.addColorStop(0, 'rgba(220,220,235,0.55)');
    grad.addColorStop(1, 'rgba(220,220,235,0)');
    fctx.fillStyle = grad;
    fctx.fillRect(0, 0, 96, 96);
  }
  const fogTexture = Texture.from(fogCanvas);
  const FOG_POOL = 12;
  const fogParticles = [];
  for (let i = 0; i < FOG_POOL; i++) {
    const s = new Sprite(fogTexture);
    s.anchor.set(0.5);
    s.visible = false;
    ambientLayer.addChild(s);
    fogParticles.push({ sprite: s, vx: 0, vy: 0, t: Math.random() * 1000 });
  }
  let fogInitialized = false;
  let ambientFrame = 0;
  let lastAmbientMs = performance.now();

  function updateAmbient() {
    const now = performance.now();
    let dt = (now - lastAmbientMs) / 1000;
    lastAmbientMs = now;
    if (dt > 0.1) dt = 0.1;
    if (!activeAmbient) {
      vignetteSprite.visible = false;
      for (const f of fogParticles) f.sprite.visible = false;
      fogInitialized = false;
      return;
    }
    // vignette follows camera view rect — stays screen-locked
    vignetteSprite.visible = true;
    vignetteSprite.alpha = activeAmbient.vignette ?? 0.35;
    vignetteSprite.x = camera.x - VIEW.width / 2;
    vignetteSprite.y = camera.y - VIEW.height / 2;
    if (!activeAmbient.fog) {
      for (const f of fogParticles) f.sprite.visible = false;
      return;
    }
    if (!fogInitialized) {
      for (const f of fogParticles) {
        f.sprite.x = camera.x + (Math.random() - 0.5) * VIEW.width;
        f.sprite.y = camera.y + (Math.random() - 0.5) * VIEW.height;
        f.vx = (Math.random() - 0.5) * 8;
        f.vy = (Math.random() - 0.5) * 6;
        f.sprite.scale.set(0.8 + Math.random() * 0.6);
        f.sprite.visible = true;
      }
      fogInitialized = true;
    }
    ambientFrame++;
    if (ambientFrame % 2 !== 0) return; // throttle to 30Hz
    const halfW = VIEW.width / 2 + 80;
    const halfH = VIEW.height / 2 + 80;
    for (const f of fogParticles) {
      f.t += dt * 2;
      f.sprite.x += f.vx * dt * 2;
      f.sprite.y += f.vy * dt * 2;
      if (f.sprite.x < camera.x - halfW) f.sprite.x += VIEW.width + 160;
      if (f.sprite.x > camera.x + halfW) f.sprite.x -= VIEW.width + 160;
      if (f.sprite.y < camera.y - halfH) f.sprite.y += VIEW.height + 160;
      if (f.sprite.y > camera.y + halfH) f.sprite.y -= VIEW.height + 160;
      f.sprite.alpha = 0.25 + 0.15 * Math.sin(f.t);
    }
  }

  // ── Enemy death dissolve (ash) ─────────────────────────────────────────
  // On kill we CLONE the enemy's live sprite into a detached pool and let the
  // body crumble: tint white→ash, fade alpha, drift up, shrink, and shed grey
  // ash particles. The sim frees the entity immediately and its pooled sprite
  // slot is reused next frame — so we MUST animate a clone, never the original
  // (it would fight a respawned enemy for tint/pos/alpha). See CLAUDE.md /
  // the office-hours design doc "renderer death-pool" notes.
  const deathLayer = new Container();
  world.addChild(deathLayer);
  const deathPool = [];     // recycled clone Sprites
  const deathActive = [];   // { sp, life, maxLife, scale0, flipX, driftY }
  const DEATH_LIFE = 0.38;
  const DEATH_CAP = 256;

  // ash particle — tiny soft grey blob, reused across a pool
  const ashCanvas = document.createElement('canvas');
  ashCanvas.width = 32; ashCanvas.height = 32;
  {
    const actx = ashCanvas.getContext('2d');
    const g = actx.createRadialGradient(16, 16, 0, 16, 16, 16);
    g.addColorStop(0, 'rgba(184,176,166,0.9)');
    g.addColorStop(1, 'rgba(150,144,136,0)');
    actx.fillStyle = g;
    actx.fillRect(0, 0, 32, 32);
  }
  const ashTexture = Texture.from(ashCanvas);
  const ashPool = [];
  const ashActive = [];     // { sp, life, maxLife, vx, vy }
  const ASH_LIFE = 0.6;
  const ASH_CAP = 220;

  // gated off on the 'low' FX-intensity setting (tint/alpha lerp still runs —
  // it's cheap; only the particles are skipped). Wired via setFxIntensity.
  let fxIntensityLow = false;

  // spawn a dissolving clone of enemy `id`'s current sprite at (x,y).
  // opts.big → bigger/longer dissolve + more ash (elites / mini-bosses).
  function spawnEnemyDeath(id, x, y, opts) {
    opts = opts || {};
    const src = sprites.get(id);
    if (!src || !src.texture) return; // already gone — nothing to dissolve
    if (deathActive.length >= DEATH_CAP) {
      const old = deathActive.shift(); // overflow: drop oldest, no dissolve
      old.sp.visible = false;
      deathLayer.removeChild(old.sp);
      deathPool.push(old.sp);
    }
    const big = opts.big ? 1.7 : 1;
    let sp = deathPool.pop();
    if (!sp) { sp = new Sprite(); sp.anchor.set(0.5); }
    sp.texture = src.texture;
    const base = src.baseScale || 1;
    const flipX = src.scale.x < 0;
    sp.scale.set(flipX ? -base : base, base);
    sp.x = x; sp.y = y;
    sp.alpha = 1;
    sp.tint = 0xffffff;
    sp.visible = true;
    deathLayer.addChild(sp);
    const life = DEATH_LIFE * (opts.big ? 1.5 : 1);
    deathActive.push({ sp, life, maxLife: life, scale0: base, flipX,
      driftY: 26 + Math.random() * 10 });
    if (!fxIntensityLow) {
      const n = Math.round((4 + Math.random() * 2) * big);
      for (let k = 0; k < n && ashActive.length < ASH_CAP; k++) {
        let a = ashPool.pop();
        if (!a) { a = new Sprite(ashTexture); a.anchor.set(0.5); }
        a.texture = ashTexture;
        a.x = x + (Math.random() - 0.5) * 14;
        a.y = y + (Math.random() - 0.5) * 14;
        a.alpha = 0.9;
        a.scale.set((0.4 + Math.random() * 0.4) * big);
        a.visible = true;
        deathLayer.addChild(a);
        ashActive.push({ sp: a, life: ASH_LIFE, maxLife: ASH_LIFE,
          vx: (Math.random() - 0.5) * 30 + (Math.random() < 0.5 ? -14 : 14),
          vy: -22 - Math.random() * 26 }); // drift up, blow sideways
      }
    }
  }

  function updateDeaths(dt) {
    for (let i = deathActive.length - 1; i >= 0; i--) {
      const d = deathActive[i];
      d.life -= dt;
      if (d.life <= 0) {
        d.sp.visible = false;
        deathLayer.removeChild(d.sp);
        deathPool.push(d.sp);
        deathActive[i] = deathActive[deathActive.length - 1];
        deathActive.pop();
        continue;
      }
      const t = d.life / d.maxLife; // 1 → 0
      const p = 1 - t;              // 0 → 1
      d.sp.alpha = t * t;           // ease-out fade
      const r = Math.round(0xff + (0x9a - 0xff) * p);
      const g = Math.round(0xff + (0x90 - 0xff) * p);
      const b = Math.round(0xff + (0x88 - 0xff) * p);
      d.sp.tint = (r << 16) | (g << 8) | b; // white → ash grey
      d.sp.y -= d.driftY * dt;
      const s = d.scale0 * (1 - 0.18 * p);
      d.sp.scale.set(d.flipX ? -s : s, s);
    }
    for (let i = ashActive.length - 1; i >= 0; i--) {
      const a = ashActive[i];
      a.life -= dt;
      if (a.life <= 0) {
        a.sp.visible = false;
        deathLayer.removeChild(a.sp);
        ashPool.push(a.sp);
        ashActive[i] = ashActive[ashActive.length - 1];
        ashActive.pop();
        continue;
      }
      const t = a.life / a.maxLife;
      a.sp.x += a.vx * dt;
      a.sp.y += a.vy * dt;
      a.vy += 9 * dt; // gentle settle as it drifts
      a.sp.alpha = 0.9 * t;
    }
  }

  // swap the floor tileset + room blueprints (chosen on the map-select screen).
  // Accepts the full map object — additional fields like `zones`, `zoneTints`,
  // and `ambient` flow through without signature churn. `pngTileset` optionally
  // points at a PixelLab Wang sheet (see util/tilesets.js); if set, floor cells
  // render PNG sub-textures instead of the ASCII bag.
  function setMap(map) {
    activeTiles = map.tiles;
    activeRooms = map.rooms || [];
    activeTilesetKey = map.pngTileset || null;
    activeZones = map.zones || [];
    activeZoneTints = map.zoneTints || null;
    activeAmbient = map.ambient || null;
    activeClusterSize = map.zoneClusterSize || 4;
    activeInlaidBand = map.inlaidBand || null;
    if (activeTilesetKey) loadTileset(activeTilesetKey); // kicks off Image() on first use
    floorCx = null; // force a full relayout next frame
    floorCy = null;
    decorCx = null; // decor cache too — chapter swap re-scatters
    decorCy = null;
    propCacheCx = NaN; // invalidate the structuresNear cache
    propCacheCy = NaN;
  }

  // shield bubble — shown around the player while player.shield > 0
  const bubble = new Sprite();
  bubble.anchor.set(0.5);
  bubble.visible = false;
  world.addChild(bubble);

  // player head marker — a small indicator floating above the player so it
  // never gets lost in the swarm (friend-or-foe ID, replaces an outline)
  const marker = new Sprite();
  marker.anchor.set(0.5);
  marker.visible = false;
  world.addChild(marker);

  // player HP bar — a small bar that follows the player in world space, so
  // health reads from the player itself instead of just the HUD. Enemies
  // intentionally have no health bar to keep the swarm clean. A second thin
  // bar above it shows the shield (water spirit / glass cannon arcana) so
  // the player sees the barrier deplete before HP starts falling.
  const HPBAR_W = 38;
  const HPBAR_H = 5;
  const SHIELDBAR_H = 3;
  const SHIELD_REF = 90; // matches systems/spirits.js SHIELD_CAP — the bar fills relative to this
  const playerHpBar = new Container();
  const playerHpBg = new Graphics()
    .roundRect(-HPBAR_W / 2, 0, HPBAR_W, HPBAR_H, 2)
    .fill({ color: 0x000000, alpha: 0.7 })
    .roundRect(-HPBAR_W / 2, 0, HPBAR_W, HPBAR_H, 2)
    .stroke({ width: 1, color: 0x07060c });
  const playerHpFill = new Graphics();
  const playerShieldBar = new Graphics();
  playerHpBar.addChild(playerHpBg);
  playerHpBar.addChild(playerHpFill);
  playerHpBar.addChild(playerShieldBar);
  playerHpBar.visible = false;
  world.addChild(playerHpBar);
  let lastHpPct = -1;
  let lastShieldPct = -1;
  function drawPlayerHp(p) {
    const pct = Math.max(0, Math.min(1, p.hp / p.maxHp));
    const shieldPct = Math.max(0, Math.min(1, (p.shield || 0) / SHIELD_REF));
    playerHpBar.x = p.x;
    playerHpBar.y = p.y - p.radius * 2.6 - 18; // sits just under the head marker
    if (pct !== lastHpPct) {
      lastHpPct = pct;
      playerHpFill.clear();
      // colour fades red as HP drops — green > yellow > red
      const col = pct > 0.55 ? 0x7be07a : pct > 0.28 ? 0xf0d27a : 0xe04848;
      playerHpFill.roundRect(-HPBAR_W / 2 + 1, 1, (HPBAR_W - 2) * pct, HPBAR_H - 2, 1.5)
        .fill({ color: col, alpha: 0.95 });
    }
    if (shieldPct !== lastShieldPct) {
      lastShieldPct = shieldPct;
      playerShieldBar.clear();
      if (shieldPct > 0) {
        // thin cyan bar sits just above the HP track — drops as the shield
        // soaks hits before HP starts to fall
        const y = -SHIELDBAR_H - 2;
        playerShieldBar
          .roundRect(-HPBAR_W / 2, y, HPBAR_W, SHIELDBAR_H, 1.5)
          .fill({ color: 0x000000, alpha: 0.6 })
          .roundRect(-HPBAR_W / 2 + 1, y + 0.5, (HPBAR_W - 2) * shieldPct, SHIELDBAR_H - 1, 1)
          .fill({ color: 0x88c8ff, alpha: 0.95 });
      }
    }
    playerHpBar.visible = true;
  }

  // --- entity sprites: id -> Sprite, with a reuse pool ---
  const sprites = new Map();
  const spritePool = [];
  const seen = new Set();

  // --- damage numbers: pooled Text ---
  const dmgPool = [];
  const dmgActive = []; // { txt, x, y, life }

  // --- one-shot effects (impact / death / level-up / muzzle): pooled Sprites
  // whose frames play once over their lifetime ---
  const fxPool = [];
  const fxActive = []; // { sp, name, frameCount, life, maxLife }

  // --- status icons floated above afflicted enemies: per-frame pool ---
  const statusIcons = [];

  // --- hit flash (scale pop) + screen shake ---
  const flashing = new Map(); // entityId -> seconds of flash left
  let shake = 0;
  let elapsed = 0; // global animation clock
  let lastEffectMs = performance.now();

  function spawnDamageNumber(x, y, amount, crit) {
    let txt = dmgPool.pop();
    if (!txt) {
      txt = new Text({
        text: '',
        style: {
          fontFamily: 'Courier New, monospace',
          fontSize: 16,
          fontWeight: 'bold',
          stroke: { color: 0x07060c, width: 4 },
        },
      });
      txt.anchor.set(0.5);
    }
    // crit hits read bigger, hotter and carry a bang
    txt.style.fontSize = crit ? 27 : 16;
    txt.style.fill = crit ? 0xff7a36 : 0xf0d27a;
    txt.text = crit ? Math.round(amount) + '!' : String(Math.round(amount));
    txt.x = x;
    txt.y = y;
    txt.alpha = 1;
    txt.visible = true;
    world.addChild(txt);
    dmgActive.push({ txt, x, y, life: DMG_LIFE });
  }

  // Spawn a one-shot animated effect at a world position. The clip's frames
  // play once across `life` seconds, then the sprite returns to the pool.
  // Two paths: ASCII (lookup via SPRITES[name]) OR PixelLab PNG (opts.asset
  // is a sigAssets key — frames cycled via assetFrameUrl + pngTexture).
  // PNG path is used for per-weapon trails like knives→blood_drop_fx; the
  // ASCII path keeps working for legacy trail_proj and other built-ins.
  function spawnFx(name, x, y, opts) {
    opts = opts || {};
    const asset = opts.asset || null;
    const frames = asset ? null : SPRITES[name];
    if (!asset && !frames) return;
    let sp = fxPool.pop();
    if (!sp) {
      sp = new Sprite();
      sp.anchor.set(0.5);
    }
    if (asset) {
      const url = assetFrameUrl(asset, 0);
      const tex = url ? pngTexture(url) : null;
      if (!tex) return; // PNG not loaded yet; skip this trail tick
      sp.texture = tex;
    } else {
      sp.texture = spriteTexture(name, 0);
    }
    sp.x = x;
    sp.y = y;
    sp.alpha = 1;
    sp.visible = true;
    sp.rotation = opts.rotation || 0;
    sp.scale.set(opts.scale || 1.9);
    world.addChild(sp);
    const life = opts.life || FX_LIFE;
    fxActive.push({
      sp, name, asset, life, maxLife: life,
      frameCount: frames ? frames.length : 0,
    });
  }

  // remember the hit direction with the flash so the renderer can bias the
  // shake along it (visible "맞은 방향으로 밀린다" feedback)
  const flashDir = new Map();
  function flashEntity(id, dirx, diry) {
    flashing.set(id, FLASH_TIME);
    if (dirx || diry) {
      const len = Math.hypot(dirx, diry) || 1;
      flashDir.set(id, { x: dirx / len, y: diry / len });
    }
  }
  function addShake(amount) {
    shake = Math.min(SHAKE_MAX, shake + amount);
  }

  // advance cosmetic effects + the animation clock on real frame time
  function updateEffects() {
    const now = performance.now();
    let dt = (now - lastEffectMs) / 1000;
    lastEffectMs = now;
    if (dt > 0.1) dt = 0.1;
    elapsed += dt;

    updateDeaths(dt); // tick enemy death-dissolve clones + ash particles

    for (let i = dmgActive.length - 1; i >= 0; i--) {
      const d = dmgActive[i];
      d.life -= dt;
      if (d.life <= 0) {
        d.txt.visible = false;
        world.removeChild(d.txt);
        dmgPool.push(d.txt);
        dmgActive[i] = dmgActive[dmgActive.length - 1];
        dmgActive.pop();
        continue;
      }
      d.y -= DMG_RISE * dt;
      d.txt.x = d.x;
      d.txt.y = d.y;
      d.txt.alpha = d.life / DMG_LIFE;
    }
    // one-shot effects: advance the clip across its lifetime, fade out, recycle
    for (let i = fxActive.length - 1; i >= 0; i--) {
      const f = fxActive[i];
      f.life -= dt;
      if (f.life <= 0) {
        f.sp.visible = false;
        world.removeChild(f.sp);
        fxPool.push(f.sp);
        fxActive[i] = fxActive[fxActive.length - 1];
        fxActive.pop();
        continue;
      }
      const progress = 1 - f.life / f.maxLife;
      if (f.asset) {
        // PNG trail/fx — advance through frames over the lifetime, ignore fps
        const url = assetFrameUrl(f.asset, progress * f.maxLife);
        const tex = url ? pngTexture(url) : null;
        if (tex) f.sp.texture = tex;
      } else {
        const frame = Math.min(f.frameCount - 1, Math.floor(progress * f.frameCount));
        f.sp.texture = spriteTexture(f.name, frame);
      }
      f.sp.alpha = Math.min(1, (f.life / f.maxLife) * 2.4);
    }
    for (const [id, t] of flashing) {
      const left = t - dt;
      if (left <= 0) {
        flashing.delete(id);
        flashDir.delete(id);
      } else flashing.set(id, left);
    }
    if (shake > 0) shake = Math.max(0, shake - dt * 48);
  }

  const camera = { x: 0, y: 0 };
  function centerOn(x, y) {
    camera.x = x;
    camera.y = y;
  }

  // pick the current texture + draw scale for an entity
  function applySprite(sp, e) {
    const name = pickDirectional(SPRITES, spriteNameFor(e), e);

    // PixelLab projectile path: when a projectile has an effectAsset
    // (multi-frame sigAssets entry) OR its sprite is registered in
    // weaponAssets, use the PNG (rotated by velocity via spriteAngles).
    // effectAsset wins — the in-flight effect is conceptually distinct
    // from the inventory icon (e.g. knives + crimson trail loop instead
    // of just a static dagger). Falls back to weaponAssets static PNG,
    // then ASCII if neither is loaded yet.
    if (e.type === 'projectile') {
      let projUrl = null;
      if (e.effectAsset) projUrl = assetFrameUrl(e.effectAsset, elapsed);
      if (!projUrl && e.sprite) projUrl = weaponAssetUrl(e.sprite, elapsed);
      if (projUrl) {
        const tex = pngTexture(projUrl);
        if (tex) {
          sp.texture = tex;
          // Shared melee slash (fx_slash) is a neutral grey 검기 arc reused by
          // every melee weapon — tint it by the weapon's `color` so scythe
          // (steel), berserker axe (orange), cleaver (blood red) and sword
          // (white) read distinctly off one sprite. Everything else resets to
          // white so a pooled sprite never carries a stale slash tint.
          sp.tint = (e.sprite === 'fx_slash' && e.color) ? e.color : 0xffffff;
          const w = sp.texture.width || 48;
          // Scale: floor 1.0 (small projectiles like arrows/wands stay
          // visible at native size rather than shrinking to 0.85), multiplier
          // 2.5 (bigger damage-area coverage: garlic/berserker zone weapons
          // read as the silhouette of their AoE, arrows/daggers read at full
          // PixelLab detail), cap 2.0 (half-step lands clean at 2.0; values
          // between 1.5 and 2.0 round to 1.5 or 2.0). Compared to the prior
          // (0.85 floor / 2.04 mult / 1.5 cap), small weapons now ~18% larger,
          // medium ~50% larger, large AoE ~33% larger.
          let s = Math.round(((e.radius * 2.5) / w) * 2) / 2;
          if (s < 1.0) s = 1.0;
          if (s > 2.0) s = 2.0;
          sp.baseScale = s;
          // Orbiting projectiles (books, hawks) keep their sprite upright as
          // they revolve — they don't spin around their own axis.
          // Rotation precedence mirrors the ASCII path at applySprite:2088
          // so PNG and ASCII rendering stay visually consistent:
          //   1. orbit projectiles → 0 (sprite stays upright as it revolves)
          //   2. explicit `e.spriteAngle` (melee/beam weapons that aim with
          //      vx=vy=0 still need to face the target) + base-angle offset
          //   3. velocity-derived rotation (the normal projectile path)
          //   4. fallback 0 (placed/zone projectiles whose PNG is symmetric)
          sp.rotation = e.orbit
            ? 0
            : e.spriteAngle != null
              ? e.spriteAngle + spriteBaseAngleFor(e.sprite)
              : (e.vx || e.vy)
                ? Math.atan2(e.vy, e.vx) + spriteBaseAngleFor(e.sprite)
                : 0;
          return;
        }
      }
    }

    // PixelLab enemy path: when an enemy sprite is registered in
    // enemyAssets, use the directional PNG. Bosses + miniBosses keep
    // their outlined ASCII path (the colored outline is the gameplay
    // tell of a threat tier) UNLESS a boss is also registered in
    // enemyAssets — in which case the PNG wins (it's an explicit
    // designer choice that this boss looks great in PixelLab).
    if (e.type === 'enemy' && name) {
      const enemyUrl = enemyAssetUrl(name, e.facing || 'east');
      if (enemyUrl) {
        const tex = pngTexture(enemyUrl);
        if (tex) {
          sp.texture = tex;
          const w = sp.texture.width || 48;
          // Enemy mult bumped 4.9 → 6.5 (+33%) on 2026-05-22 to restore
          // hero:enemy = 1.42:1 visual ratio. Hero PNGs use dynamic
          // baseScale=92/w (visual ~92px), so a flat radius*mult/w for
          // enemies fell behind when hero scaling went dynamic. Typical
          // radius-10 enemy on 48×48 PNG now renders ~65px (vs hero 92px).
          // Bosses (radius 16-24, 68×68 PNG) render ~104-156px —
          // appropriately threatening silhouette.
          let s = (e.radius * 6.5) / w;
          if (s < 1.0) s = 1.0;
          sp.baseScale = s;
          sp.rotation = 0;
          return;
        }
      }
    }

    // PixelLab character path: when a hero key is registered in heroAssets,
    // resolve the directional PNG URL and use it instead of ASCII. Picks
    // walking-cycle frame when the player is moving (vx/vy non-trivial),
    // idle pose otherwise. Falls through to ASCII if the PNG isn't loaded
    // yet (no flash on first frame). Only player entities use this —
    // bosses/spirits keep their outlined/composite specialised paths in
    // the ASCII branch.
    //
    // IMPORTANT: use the BASE sprite name (`e.sprite`) here, NOT the
    // directionalized `name` from pickDirectional — heroAssets registers
    // `knight_walk` (not `knight_walk_east`), so the directional key
    // would miss and force-fall to ASCII even though the PNG exists.
    if (e.type === 'player' && e.sprite) {
      const baseName = e.sprite;
      const moving = Math.abs(e.vx || 0) + Math.abs(e.vy || 0) > 6;
      const attacking = elapsed < playerAttackUntil;
      // Update facing from horizontal velocity. pickDirectional() is bypassed
      // for the PNG branch (returns above), so do it here instead — otherwise
      // e.facing sticks at its initial value and the hero only faces right.
      if (Math.abs(e.vx || 0) > 0.05) {
        e.facing = (e.vx > 0) ? 'east' : 'west';
      }
      // Fallback chain: attack → walk → idle PNG → ASCII. The first frame
      // of any walk/attack cycle isn't cached yet (pngTexture kicks off
      // lazy load + returns null), so a naive call would briefly flash
      // the legacy 16×16 ASCII sprite while frames warm up. Falling back
      // to the loaded idle PNG keeps the hero visually consistent — the
      // walk cycle just stutters on idle for a few ticks instead of
      // dropping to low-res ASCII.
      let heroUrl = heroAssetUrl(baseName, e.facing || 'east', elapsed, moving, attacking);
      if (attacking && heroUrl && !pngTexture(heroUrl)) {
        // attack PNG not loaded — fall back to walk/idle for this frame
        heroUrl = heroAssetUrl(baseName, e.facing || 'east', elapsed, moving, false);
      }
      if (moving && heroUrl && !pngTexture(heroUrl)) {
        // walk frame not loaded — fall back to idle PNG (always preloaded
        // by the time the player has been on screen for a frame). Keeps
        // ASCII fallback only as a last resort for un-registered heroes.
        heroUrl = heroAssetUrl(baseName, e.facing || 'east', elapsed, false, false);
      }
      if (heroUrl) {
        const tex = pngTexture(heroUrl);
        if (tex) {
          sp.texture = tex;
          // Hero scale targets a uniform ~92px visual regardless of source
          // resolution — chosen 2026-05-22 to match VS-style sample chunkiness:
          // - 68×68 PNGs (PixelLab size=48): scale ≈ 1.35 (chunky pixels, VS feel)
          // - 92×92 PNGs (PixelLab pro mode): scale = 1.0 (already at target)
          // - 136×136 PNGs (PixelLab size=96): scale ≈ 0.676 (downsampled)
          // Breathing + punch are additive on top, same relative feel.
          const baseHeroScale = 92 / tex.width;
          const breathing = (moving || attacking) ? 0 : Math.sin(elapsed * 1.6) * 0.025;
          const punch = attacking
            ? 0.05 * Math.max(0, 1 - (playerAttackUntil - elapsed) / ATTACK_PULSE_DUR)
            : 0;
          sp.baseScale = baseHeroScale + breathing + punch;
          sp.rotation = 0;
          return; // skip the ASCII branch entirely
        }
      }
    }

    if (name && SPRITES[name]) {
      const frames = SPRITES[name];
      const fps = FPS[name] || 0;
      const frame = fps > 0 && frames.length > 1
        ? Math.floor(elapsed * fps) % frames.length
        : 0;
      // friend-or-foe ID: bosses get a blood-red outline, mini-bosses a gold
      // outline so they read as a mid-tier threat. Plain enemies stay clean.
      // Fused spirits (e.accent set in systems/spirits.js) layer two sprite
      // clips into a single composite texture — see compositeTexture().
      if (e.boss) sp.texture = outlinedTexture(name, frame, '#c8332a');
      else if (e.miniBoss) sp.texture = outlinedTexture(name, frame, '#f0c040');
      else if (e.type === 'spirit' && e.accent && SPRITES[e.accent]) {
        sp.texture = compositeTexture(name, e.accent, frame);
      } else sp.texture = spriteTexture(name, frame);
      const w = sp.texture.width || 16;
      // size the sprite a bit beyond the hitbox; half-step scale keeps pixels
      // crisp. Projectiles draw at a gentler multiplier and a hard cap so the
      // art never renders screen-filling — a big AoE / vortex zone shows its
      // true radius through the translucent zone disc (drawZones), not by
      // stretching a tiny sprite.
      // drops + XP gems draw at a gentler multiplier — radius*3.4 made
      // pickups read oversized; projectiles already use the gentler scale.
      // Ground drops (potion / treasure chest / bomb) use an even smaller
      // 1.7× so they sit naturally on the floor instead of dwarfing the hero.
      // Per-type scale tuning (post-balance):
      //   projectile/gem  2.04 (-15%)
      //   drop            1.7  (unchanged — pickup glyphs already small)
      //   enemy           6.5  (2026-05-22: bumped 4.9 → 6.5 to restore
      //                        hero:enemy 1.42:1 ratio after hero went
      //                        dynamic baseScale=92/w; sync with PNG path)
      //   player ASCII    3.7  (2026-05-22: bumped 3.2 → 3.7 to sync with
      //                        PixelLab hero baseScale 1.0 bump)
      //   default         3.4
      const mult =
        e.type === 'projectile' || e.type === 'gem'
          ? 2.04
          : e.type === 'drop'
            ? 1.7
            : e.type === 'enemy'
              ? 6.5
              : e.type === 'player'
                ? 3.7
                : 3.4;
      let s = Math.round(((e.radius * mult) / w) * 2) / 2;
      if (s < 1) s = 1;
      if (e.type === 'projectile' && s > 3.0) s = 3.0;
      // melee swings spawn with a generous hitbox radius but no velocity
      // (vx === vy === 0). Capping their visual at 2.5× keeps legendary
      // weapons from rendering as screen-filling icons — the hit FX still
      // plays at full size via the impact event.
      if (e.type === 'projectile' && !e.vx && !e.vy && e.pierce >= 9999 && s > 2.5) s = 2.5;
      // Drops + XP gems target compact loot sizes regardless of source
      // sprite width — read as pickups, not threats. Half-step rounding
      // was REMOVED (2026-05-22) because PixelLab pickup PNGs are 48×48
      // source and half-step rounding couldn't hit the desired target px.
      // pngTexture uses nearest-neighbor scaleMode so sub-pixel ratios
      // still render crisp.
      //   gems / potions / hearts: 16px target (was 12px 2026-05-22; bumped
      //                            2026-05-23 P6 fix — 12px vs 50-60px hero
      //                            was a 1:4-5 ratio, drops became invisible
      //                            when dense, and PixelLab 48px source
      //                            at 0.25× lost detail. 16px = 0.33× +
      //                            keeps the pickup-not-threat read)
      //   chests:                  22px target (was 18px — reward visibility)
      if (e.type === 'gem') {
        s = Math.max(0.25, 16 / w);
      } else if (e.type === 'drop') {
        const target = e.dropId === 'chest' ? 22 : 16;
        s = Math.max(0.25, target / w);
      }
      sp.baseScale = s;
      // Per-sprite base-angle offset — arrows drawn pointing UP need -π/2
      // so atan2(vy,vx) on the horizontal axis renders rightward, not
      // sideways. See src/util/spriteAngles.js. Default 0 (rightward).
      //
      // `e.spriteAngle` is an explicit rotation override (used by melee
      // weapons that have vx=vy=0 but still need to face the target). It
      // wins over the velocity-derived rotation; both flow through the
      // same spriteBaseAngleFor offset so authored-up PNGs still align.
      sp.rotation =
        e.spriteAngle != null
          ? e.spriteAngle + spriteBaseAngleFor(e.sprite)
          : (e.type === 'projectile' && !e.orbit && (e.vx || e.vy))
            ? Math.atan2(e.vy, e.vx) + spriteBaseAngleFor(e.sprite)
            : 0;
    } else if (e.enemyShot) {
      // enemy shots get the danger marker so they're easy to track + dodge
      sp.texture = dangerTexture(e.color ?? 0xc8463a, e.radius ?? 8);
      sp.baseScale = 1;
      sp.rotation = 0;
    } else {
      sp.texture = circleTexture(e.color ?? 0xffffff, e.radius ?? 8);
      sp.baseScale = 1;
      sp.rotation = 0;
    }
  }

  // Per-frame type buckets — reused across sub-passes so each iteration loops
  // only over its target type (no per-entity `if (e.type === ...)` filter).
  // Arrays are reused, just truncated.
  const bucketPlayers = [];
  const bucketEnemies = [];
  const bucketProjectiles = [];
  const bucketZones = []; // projectiles that draw a zone disc (rehit/pull)

  // Player attack-pulse tracker — when a new projectile appears in the
  // entity list (player just fired), trigger the hero PNG attack frames
  // for ATTACK_PULSE_DUR seconds. No code changes to weaponFire/main
  // needed; the renderer infers "the player attacked" from projectile
  // count rising. Works for any weapon that spawns projectiles.
  const ATTACK_PULSE_DUR = 0.32; // seconds the attack animation plays per fire
  const ULTIMATE_ATTACK_DUR = 0.8; // longer pulse for spacebar ultimate cast
  let lastProjectileCount = 0;
  let playerAttackUntil = 0; // elapsed seconds when the pulse ends
  let lastActivePhase = 'idle'; // previous frame's signature cast phase

  // reconcile sprites with the entity list, advance effects, move camera
  function sync(entities) {
    seen.clear();
    bucketPlayers.length = 0;
    bucketEnemies.length = 0;
    const prevProjectileCount = bucketProjectiles.length;
    bucketProjectiles.length = 0;
    bucketZones.length = 0;
    let playerEnt = null;
    for (let i = 0; i < entities.length; i++) {
      const e = entities[i];
      seen.add(e.id);
      const t = e.type;
      if (!e.dead) {
        if (t === 'player') { playerEnt = e; bucketPlayers.push(e); }
        else if (t === 'enemy') bucketEnemies.push(e);
        else if (t === 'projectile') {
          bucketProjectiles.push(e);
          if (e.rehit || e.pull) bucketZones.push(e);
        }
      }
      let sp = sprites.get(e.id);
      if (!sp) {
        sp = spritePool.pop() || new Sprite();
        sp.anchor.set(0.5);
        sp.visible = true;
        world.addChild(sp);
        sprites.set(e.id, sp);
      }
      // Dormant sky-drop zones hide their base sprite until impact —
      // movement.js ticks down e.delay; the disc + ground PNG stay off
      // (drawZones/drawZoneSprites skip too) so only the telegraph + orb
      // visuals read during the pre-cast window.
      if (e.delay > 0) {
        sp.visible = false;
        continue;
      } else {
        sp.visible = true;
      }
      // bezier_strike beams (black_pigeon) render purely via drawBeams as
      // a Graphics polyline + head spec — no sprite, no trail particle.
      if (e.type === 'projectile' && e.bezier) {
        sp.visible = false;
        continue;
      }
      applySprite(sp, e);
      // hit flash: a brief scale pop + a positional jitter (hit-react shake)
      const flash = flashing.get(e.id) ?? 0;
      const pop = flash > 0 ? 1 + 0.28 * (flash / FLASH_TIME) : 1;
      // pulse fallback for weapons that don't have a PixelLab animation —
      // sinusoidal scale wobble masks the "frozen icon" feel on AoE zones.
      const pulse = e.weaponId && PULSE_WEAPONS.has(e.weaponId)
        ? 1 + PULSE_AMP * Math.sin(elapsed * Math.PI * 2 * PULSE_HZ + e.id * 0.7)
        : 1;
      // e.flipX mirrors the sprite horizontally (melee slash arcs face their
      // target left/right). e.spriteScaleY stretches the vertical axis so
      // legendary qi projectiles can read as thicker bands than the PNG.
      const finalScale = sp.baseScale * pop * pulse;
      const yScale = finalScale * (e.spriteScaleY || 1);
      sp.scale.set(e.flipX ? -finalScale : finalScale, yScale);
      sp.x = e.x;
      sp.y = e.y;
      // VS-style after-image streak — capture player position+sprite every frame
      if (e.type === 'player') captureTrail(sp, e);
      if (flash > 0) {
        // a directional kick (눈에 잘 띄는 hit-react) + a tiny random rattle
        const t = flash / FLASH_TIME;
        const kick = 6 * t; // px — peaks at impact, decays with the flash
        const dir = flashDir.get(e.id);
        if (dir) {
          sp.x += dir.x * kick;
          sp.y += dir.y * kick;
        }
        const rattle = 2 * t;
        sp.x += (Math.random() - 0.5) * rattle;
        sp.y += (Math.random() - 0.5) * rattle;
      }
      // Per-weapon PixelLab trail only (e.trailAsset). The generic ASCII
      // trail_proj fallback was removed — wand + bear_trap homing projectiles
      // rendered a long golden diagonal artifact because trail dots at 0.06s
      // intervals overlapped at projectile speed into a continuous line.
      // Weapons with a registered trailAsset (knives → blood_drop_fx, etc.)
      // still get their identity trail.
      if (e.type === 'projectile' && e.trailAsset && !e.orbit && (e.vx || e.vy) && fxActive.length < 110) {
        if (!e.lastTrail || elapsed - e.lastTrail >= 0.06) {
          e.lastTrail = elapsed;
          spawnFx(null, e.x, e.y, { asset: e.trailAsset, scale: 1.6, life: 0.5 });
        }
      }
    }
    for (const [id, sp] of sprites) {
      if (seen.has(id)) continue;
      sp.visible = false;
      world.removeChild(sp);
      spritePool.push(sp);
      sprites.delete(id);
    }

    // Attack pulse is now ONLY triggered by spacebar signature cast (see
    // drawActive idle→telegraph transition above). Weapon fires no longer
    // override the walk/idle cycle — the player's movement reads cleanly,
    // and the attack animation reserves itself for the signature wind-up.
    lastProjectileCount = bucketProjectiles.length;

    // ground shadows under every character — the player and every enemy
    // (bosses included) — so nothing looks like it floats off the floor.
    // Iterates the typed buckets (player + enemy) instead of the full list.
    let shadowN = 0;
    function placeShadow(e) {
      let sh = shadows[shadowN];
      if (!sh) {
        sh = new Sprite(shadowTex);
        sh.anchor.set(0.5);
        shadowLayer.addChild(sh);
        shadows.push(sh);
      }
      sh.visible = true;
      sh.x = e.x;
      const esp = sprites.get(e.id);
      const halfH = esp && esp.texture
        ? (esp.texture.height * (esp.baseScale || 1)) / 2
        : e.radius;
      sh.y = e.y + halfH * 0.82;
      const sc = (e.radius * 2.4) / shadowTex.width;
      sh.scale.set(sc, sc);
      shadowN++;
    }
    for (let i = 0; i < bucketPlayers.length; i++) placeShadow(bucketPlayers[i]);
    for (let i = 0; i < bucketEnemies.length; i++) placeShadow(bucketEnemies[i]);
    for (let i = shadowN; i < shadows.length; i++) shadows[i].visible = false;

    updateEffects();
    updateFloor();
    updateDecor();
    updateProps();
    updateAmbient();
    drawZones(bucketZones);
    drawZoneSprites(bucketZones);
    drawBeams(bucketProjectiles);
    drawTelegraphs(bucketEnemies);
    drawEnemyAuras(bucketEnemies);
    if (playerEnt) drawMagnetLines(playerEnt, entities, playerEnt.magnet || 0);

    // shield bubble follows the player while a shield value is active.
    // alpha is held below 0.5 so the hero sprite still reads through the
    // barrier — the bubble signals the barrier without hiding the player.
    if (playerEnt && (playerEnt.shield ?? 0) > 0 && SPRITES.fx_shield_bubble) {
      bubble.visible = true;
      bubble.texture = spriteTexture('fx_shield_bubble', Math.floor(elapsed * 6) % 2);
      const bw = bubble.texture.width || 16;
      bubble.scale.set((playerEnt.radius * 5.4) / bw);
      bubble.x = playerEnt.x;
      bubble.y = playerEnt.y;
      bubble.alpha = 0.45;
    } else {
      bubble.visible = false;
    }

    // player head marker — removed per user feedback: the bobbing aim
    // indicator above the hero was distracting once the hero sprites had
    // their own clear silhouettes. Marker sprite is kept in the pool so
    // we just hide it every frame.
    marker.visible = false;

    // player HP bar — only on the player, never on enemies
    if (playerEnt) drawPlayerHp(playerEnt);
    else playerHpBar.visible = false;

    // status icons float above afflicted enemies — iterate enemy bucket only
    let iconN = 0;
    for (let i = 0; i < bucketEnemies.length; i++) {
      const e = bucketEnemies[i];
      if (!e.status) continue;
      const st = e.status;
      let icon = null;
      if (st.freeze > 0) icon = 'status_freeze';
      else if (st.stun > 0) icon = 'status_stun';
      else if (st.burn > 0) icon = 'status_burn';
      else if (st.poison > 0) icon = 'status_poison';
      else if (st.bleed > 0) icon = 'status_bleed';
      else if (st.shock > 0) icon = 'status_shock';
      else if (st.slow > 0) icon = 'status_slow';
      if (!icon) continue;
      let sp = statusIcons[iconN];
      if (!sp) {
        sp = new Sprite();
        sp.anchor.set(0.5);
        sp.scale.set(2);
        world.addChild(sp);
        statusIcons.push(sp);
      }
      sp.texture = spriteTexture(icon, 0);
      sp.visible = true;
      sp.x = e.x;
      sp.y = e.y - e.radius * 2.4;
      iconN++;
    }
    for (let i = iconN; i < statusIcons.length; i++) statusIcons[i].visible = false;

    drawMinimap(bucketEnemies, bucketPlayers);

    // world is centred on the camera; the tilemap rides along inside it
    world.x = VIEW.width / 2 - camera.x;
    world.y = VIEW.height / 2 - camera.y;
    if (shake > 0) {
      world.x += (Math.random() - 0.5) * shake;
      world.y += (Math.random() - 0.5) * shake;
    }
  }

  // Warm the PNG cache for a hero's walk + attack frames (both directions)
  // before the run starts. Without this, the first time each walk frame
  // is requested it returns null and the player flashes the legacy 16×16
  // ASCII sprite (or — with the idle fallback in applySprite — momentarily
  // stutters on idle). Called from main.js startRun() after applyCharacter().
  function preloadHero(spriteName) {
    const set = HERO_ASSETS[spriteName];
    if (!set) return;
    for (const dir of ['east', 'west']) {
      const d = set[dir];
      if (!d) continue;
      if (d.idle) pngTexture(d.idle);
      if (d.walk) for (const url of d.walk) pngTexture(url);
      if (d.attack) for (const url of d.attack) pngTexture(url);
    }
  }

  return {
    app, sync, centerOn, spawnDamageNumber, spawnFx, spawnEnemyDeath,
    flashEntity, addShake, camera, setMap, setBloodMoon, preloadHero,
    drawBigMap, setBigMapVisible,
    _layers: { activeLayer, zoneLayer, world },
    setTelegraphVisible: (v) => { telegraphVisible = v; },
    setFxIntensity: (v) => { fxIntensityLow = (v === 'low'); },
    // Called once per frame by main.js with active.getRenderState(). The
    // renderer owns no game state; the active system owns the canonical
    // telegraph/drops/impacts; we just paint them.
    drawActive,
    // Per-weapon AoE FX overlays (data-driven via def.aoeKit). Called
    // AFTER drawActive each frame — appends on top of the sig layer.
    drawWeaponSkyDropFx,
    // Player buff halo — main.js passes loadout.buffs every frame.
    drawBuffHalo,
    // bezier_strike ground telegraph marker. main.js subscribes to the
    // 'beamCast' event from weaponFire.js and calls this with the volley's
    // target zone {x, y, radius, life}.
    addBeamMarker,
    // Pet companion render hook — main.js calls every frame with the
    // current pigeon orbit position. Cycles through `frames` based on the
    // shared `elapsed` clock at `fps`; falls back to a static single PNG
    // when frames aren't provided or none of them have loaded yet.
    drawPet(visible, x, y, opts = {}) {
      if (!visible) { petSprite.visible = false; return; }
      // Default to the 9-frame hover loop. Pass opts.frames/fps/url to override.
      const frames = opts.frames || [
        '/pets/anim/pigeon_0.png', '/pets/anim/pigeon_1.png',
        '/pets/anim/pigeon_2.png', '/pets/anim/pigeon_3.png',
        '/pets/anim/pigeon_4.png', '/pets/anim/pigeon_5.png',
        '/pets/anim/pigeon_6.png', '/pets/anim/pigeon_7.png',
        '/pets/anim/pigeon_8.png',
      ];
      const fps = opts.fps || 10;
      const fallback = opts.url || '/pets/pigeon.png';
      let tex = null;
      if (frames && frames.length) {
        const idx = Math.floor(elapsed * fps) % frames.length;
        tex = pngTextureBlackOut(frames[idx]);
        if (!tex) {
          // current frame not loaded yet — try any already-loaded sibling so
          // the bird never disappears mid-loop while later frames cache in
          for (let i = 0; i < frames.length && !tex; i++) tex = pngTexBlackOut.get(frames[i]) || null;
        }
      }
      if (!tex) tex = pngTextureBlackOut(fallback);
      if (!tex) { petSprite.visible = false; return; }
      if (petSprite.texture !== tex) petSprite.texture = tex;
      petSprite.visible = true;
      petSprite.x = x;
      petSprite.y = y;
      const baseScale = opts.scale || 1.0;
      // Mild scale wobble layered on the frame animation for extra liveliness.
      const wobble = 1 + 0.04 * Math.sin(elapsed * 5);
      petSprite.scale.set(opts.flipX ? -baseScale * wobble : baseScale * wobble, baseScale * wobble);
    },
  };
}
