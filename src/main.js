// Bootstrap — wires the engine, systems, renderer and UI together.
//
// Session 7 milestone: a full state machine (title -> playing <-> levelup ->
// gameover, plus the shop). The gold shop spends a persisted gold balance on
// permanent upgrades that are applied at the start of each run.

// Crypt pixel-art pack — side-effect imports set window.PALETTE / SPRITES /
// AtlasBuilder, which the renderer reads. Must load before the renderer runs.
// The *_hd.js packs add polished high-res variants; hd_promote.js then
// re-points the base sprite keys at them (loads last).
import './assets/art/palette.js';
import './assets/art/sprites.js';
import './assets/art/atlas.js';
import './assets/art/weapons_hd.js';
import './assets/art/enemies_hd.js';
import './assets/art/heroes_hd.js';
import './assets/art/bosses_hd.js';
import './assets/art/chests_polished.js';
import './assets/art/tiles_unified.js';
import './assets/art/tiles_natural.js';
import './assets/art/water_hd.js';
import './assets/art/structures.js';
import './assets/art/structures_extra.js';
import './assets/art/heroes_xhd.js';
import './assets/art/heroes_hd3.js';
import './assets/art/heroes_smooth_walk.js';
import './assets/art/enemies_hd2.js';
import './assets/art/projectiles_hd.js';
import './assets/art/skills_hd.js';
import './assets/art/pickups_hd2.js';
import './assets/art/lightning_polish.js';
import './assets/art/effects_hd3.js';
import './assets/art/pets_hd.js';
import './assets/art/icons_passives.js';
import './assets/art/hd_promote.js';
import './assets/art/tiles_vs.js';
import './assets/art/tiles_vs_extra.js';
import './assets/art/enemies_vs.js';
import './assets/art/fx_vs.js';
import './assets/art/pickups_vs.js';
import './assets/art/projectiles_vs.js';
import { createRenderer } from './engine/renderer.js';
import { createWorld } from './engine/world.js';
import { createLoop } from './engine/loop.js';
import { createEvents } from './engine/events.js';
import { createRng } from './util/rng.js';
import { getIsoWeek, getRuleForWeek, getWeeklyRecord, updateWeeklyRecord } from './util/weeklyChallenge.js';
import { createAudio } from './util/audio.js';
import { createInput } from './input.js';
import { createProgression } from './progression.js';
import { createLoadout } from './loadout.js';
import { applyCharacter } from './content/characters.js';
import { LEGENDARY_WEAPONS, BASE_WEAPONS } from './content/weapons.js';
import { rollChest } from './content/loot.js';
import { DROPS } from './content/drops.js';
import { rollChoices, applyChoice } from './choices.js';
import { evolveCheck } from './content/evolutions.js';
import { applyMetaUpgrades } from './meta.js';
import { loadSave, writeSave, addGold, unlockChapter } from './data/save.js';
import { recordRun, checkAchievements } from './achievements.js';
import { createMovement } from './systems/movement.js';
import { createSpawn } from './systems/spawn.js';
import { createWeaponFire } from './systems/weaponFire.js';
import { createCollision } from './systems/collision.js';
import { createDamage } from './systems/damage.js';
import { createPickup } from './systems/pickup.js';
import { createSpirits } from './systems/spirits.js';
import { SPIRITS } from './content/spirits.js';
import { createStatus, applyStatus } from './systems/status.js';
import { createSkills } from './systems/skills.js';
import { createActive } from './systems/active.js';
import { createWeaponSkyDropFx } from './systems/weaponSkyDropFx.js';
import { createEnemyAbilities, spawnEnemyShot, bossKitFor } from './systems/enemyAbilities.js';
import { createHud } from './ui/hud.js';
import { createLevelUp } from './ui/levelup.js';
import { createResult } from './ui/result.js';
import { createTitle } from './ui/title.js';
import { createMapSelect } from './ui/mapselect.js';
import { createCharSelect } from './ui/charselect.js';
import { createArcanaSelect } from './ui/arcanaselect.js';
import { applyArcana } from './content/arcanas.js';
import { createSettings } from './ui/settings.js';
import { getSettings, onSettingsChange } from './data/settings.js';
import { createGacha } from './ui/gacha.js';
import { createPauseMenu } from './ui/pausemenu.js';
import { createToast } from './ui/toast.js';
import { createAchievements } from './ui/achievements.js';
import { createArsenal } from './ui/arsenal.js';
import { createBestiary } from './ui/bestiary.js';
import { BESTIARY } from './content/bestiary.js';
import { createStatusPage } from './ui/status.js';
import { createStats } from './ui/stats.js';
import { createSpiritsPage } from './ui/spirits.js';
import { createHistory } from './ui/history.js';
import { createEvolution } from './ui/evolution.js';
import { createShop } from './ui/shop.js';
import { PLAYER, VIEW, ENEMIES, SPAWN, SURVIVAL_GOLD_PER_SEC } from './config.js';

async function main() {
  const mount = document.getElementById('game');

  // Scale the whole game (canvas + UI overlays) to fill the window, keeping
  // the 960x540 aspect. The sim still runs at 960x540 — only the display
  // scales — so balance is untouched; the canvas stays crisp (pixelated).
  function fitScreen() {
    const s = Math.min(window.innerWidth / VIEW.width, window.innerHeight / VIEW.height);
    mount.style.transform = `scale(${s})`;
  }
  fitScreen();
  window.addEventListener('resize', fitScreen);

  // PixelLab tile/enemy/fx PNGs decode asynchronously — wait for them
  // before the renderer caches any textures. Hero sprites no longer go
  // through this path; heroAssets.js handles them via pngTexture on demand.
  if (typeof window.TILES_VS_LOAD === 'function') await window.TILES_VS_LOAD();
  if (typeof window.TILES_VS_EXTRA_LOAD === 'function') await window.TILES_VS_EXTRA_LOAD();
  if (typeof window.ENEMIES_VS_LOAD === 'function') await window.ENEMIES_VS_LOAD();
  if (typeof window.FX_VS_LOAD === 'function') await window.FX_VS_LOAD();
  if (typeof window.PICKUPS_VS_LOAD === 'function') await window.PICKUPS_VS_LOAD();
  if (typeof window.PROJECTILES_VS_LOAD === 'function') await window.PROJECTILES_VS_LOAD();

  const renderer = await createRenderer(mount);
  if (typeof window !== 'undefined' && /[?&]debug=1\b/.test(window.location.search)) {
    window.__renderer = renderer;
  }

  // pixel-art cursor from the art pack
  if (window.AtlasBuilder && window.SPRITES && window.SPRITES.cursor_aim) {
    const src = window.AtlasBuilder.renderFrame('cursor_aim', 0);
    const cc = document.createElement('canvas');
    cc.width = src.width * 3;
    cc.height = src.height * 3;
    const cx = cc.getContext('2d');
    cx.imageSmoothingEnabled = false;
    cx.drawImage(src, 0, 0, cc.width, cc.height);
    const hot = Math.floor(cc.width / 2);
    document.body.style.cursor = `url(${cc.toDataURL()}) ${hot} ${hot}, crosshair`;
  }

  const world = createWorld();
  const events = createEvents();
  // run seed — captured for the run-history log + the share-seed UI
  const runSeed = Date.now() >>> 0;
  const rng = createRng(runSeed);
  const audio = createAudio();
  const input = createInput();
  const progression = createProgression();
  const loadout = createLoadout();

  const player = world.spawn('player', {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    hp: PLAYER.maxHp,
    maxHp: PLAYER.maxHp,
    radius: PLAYER.radius,
    color: PLAYER.color,
    armor: 0,
    revives: 0,
    invuln: 0,
    shield: 0,
  });
  const stats = { time: 0, kills: 0, gold: 0, crits: 0, damage: 0, bosses: 0 };

  const movement = createMovement(input);
  const spawn = createSpawn(rng);
  const weaponFire = createWeaponFire();
  const collision = createCollision();
  const damage = createDamage(rng, loadout);
  const pickup = createPickup();
  const spirits = createSpirits();
  const status = createStatus();
  const skills = createSkills();
  const active = createActive();
  const weaponSkyDropFx = createWeaponSkyDropFx();
  const enemyAbilities = createEnemyAbilities();
  const hud = createHud(mount);
  const levelUp = createLevelUp(mount);
  const result = createResult(mount);
  const title = createTitle(mount);
  const mapSelect = createMapSelect(mount);
  const charSelect = createCharSelect(mount);
  const arcanaSelect = createArcanaSelect(mount, rng);
  const settings = createSettings(mount);
  const gacha = createGacha(mount);
  const pauseMenu = createPauseMenu(mount);
  const toast = createToast(mount);
  const achievements = createAchievements(mount);
  const arsenal = createArsenal(mount);
  const bestiary = createBestiary(mount);
  const statusPage = createStatusPage(mount);
  const statsPage = createStats(mount);
  const spiritsPage = createSpiritsPage(mount);
  const historyPage = createHistory(mount);
  const evolution = createEvolution(mount);
  const shop = createShop(mount);

  // live user-preference cache; gates damage numbers + shake + fx intensity
  // at the call sites. Updates on every settings change so the toggle in the
  // panel reflects immediately.
  let prefs = getSettings();
  onSettingsChange((s) => {
    prefs = s;
    if (audio.setVolume) audio.setVolume(s.volume);
    if (renderer.setTelegraphVisible) renderer.setTelegraphVisible(s.bossTelegraph);
    if (renderer.setFxIntensity) renderer.setFxIntensity(s.fxIntensity);
  });
  if (audio.setVolume) audio.setVolume(prefs.volume);
  if (renderer.setTelegraphVisible) renderer.setTelegraphVisible(prefs.bossTelegraph);
  if (renderer.setFxIntensity) renderer.setFxIntensity(prefs.fxIntensity);
  const addShake = (n) => { if (prefs.shake) renderer.addShake(n); };

  // hit-event channel (D11): damage numbers, hit flash, SFX and screen shake
  // all subscribe to the same simulation events.
  // enemy type -> the death burst the renderer plays on a kill

  events.on('hit', ({ x, y, amount, crit }) => {
    if (prefs.dmgNumbers) renderer.spawnDamageNumber(x, y, amount, crit);
  });
  events.on('hit', ({ id, dirx, diry }) => renderer.flashEntity(id, dirx, diry));
  events.on('hit', ({ x, y, impactFx, crit }) => {
    // a hit's impact FX — punchier, and bigger still on a critical; a crit
    // layers an extra spark burst so it reads as a heavy hit
    if (impactFx) renderer.spawnFx(impactFx, x, y, { scale: crit ? 3.6 : 2.5 });
    if (crit) renderer.spawnFx('fx_hit', x, y, { scale: 3.0, life: 0.3 });
  });
  events.on('hit', ({ x, y, classImpactFx, crit }) => {
    // class signature flair — a subtle smaller burst tinted to the hero's
    // class (knight=gold, warrior=red, huntress=green, mage=violet). Drawn
    // alongside the weapon's own impact so weapon identity stays readable.
    if (classImpactFx) renderer.spawnFx(classImpactFx, x, y, { scale: crit ? 2.0 : 1.4, life: 0.25 });
  });
  events.on('hit', ({ x, y, procFx }) => { if (procFx) renderer.spawnFx(procFx, x, y, { scale: 2.0 }); });
  events.on('hit', () => audio.play('hit'));
  events.on('hit', ({ crit }) => { if (crit) requestHitstop(0.05); });
  events.on('hit', ({ amount, crit }) => { stats.damage += amount; if (crit) stats.crits += 1; });
  events.on('kill', ({ boss }) => { if (boss) stats.bosses += 1; });
  // bezier_strike (black_pigeon) ground telegraph + pigeon lock.
  // Telegraph paints a pulsing white-rimmed disc where the volley's beams
  // are about to land. Lock pins the pigeon companion in place for the
  // duration of the barrage so every staggered beam launches from the
  // same emitter (the bird hovers in a tight bob instead of orbiting
  // away and leaving the beams visually disconnected).
  const pigeonLock = { x: 0, y: 0, expires: 0 };
  const lastPigeonPos = { x: 0, y: 0 };
  events.on('beamCast', (o) => {
    if (renderer.addBeamMarker) renderer.addBeamMarker(o);
    pigeonLock.x = lastPigeonPos.x;
    pigeonLock.y = lastPigeonPos.y;
    pigeonLock.expires = performance.now() * 0.001 + (o.life || 7);
  });
  // Random world events — every ~90s a coin flip drops one of three flavour
  // events (treasure flock / double mini-boss / gem rain). Single owner here
  // so timing + payload are co-located; renders as a toast + immediate spawn.
  let nextEventAt = 90;
  function tickRandomEvents() {
    if (state !== 'playing') return;
    if (stats.time < nextEventAt) return;
    nextEventAt = stats.time + 80 + Math.random() * 40;
    const roll = Math.random();
    if (roll < 0.34) {
      // treasure flock — a small chest cluster around the player
      for (let i = 0; i < 3; i++) {
        const a = Math.random() * Math.PI * 2;
        world.spawn('drop', {
          dropId: 'chest', chestTier: 'wood', sprite: 'pickup_chest',
          x: player.x + Math.cos(a) * 80,
          y: player.y + Math.sin(a) * 80,
          vx: 0, vy: 0, radius: 10,
        });
      }
      toast.show('이벤트', '상자 3개가 등장했다', '✦ 행운');
    } else if (roll < 0.67) {
      // gem rain — a burst of XP gems scattered around the player
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2;
        const r = 60 + Math.random() * 140;
        world.spawn('gem', {
          x: player.x + Math.cos(a) * r,
          y: player.y + Math.sin(a) * r,
          vx: 0, vy: 0,
          xp: 3, radius: 8, color: 0x88c8ff, sprite: 'pickup_xp_blue',
        });
      }
      toast.show('이벤트', '경험치 보석이 쏟아진다', '✦ 행운');
    } else {
      // twin trouble — two beefed-up enemies on opposite sides of the player
      toast.show('이벤트', '강한 적이 양쪽에서 다가온다', '⚠ 위협');
      const elites = (currentMap && currentMap.elites && currentMap.elites.length > 0)
        ? currentMap.elites : ['brute'];
      const hpScale = 1 + (stats.time / 60) * 0.55; // matches DIRECTOR.hpPerMinute
      const baseAng = Math.random() * Math.PI * 2;
      for (let s = 0; s < 2; s++) {
        const name = elites[Math.floor(Math.random() * elites.length)];
        const def = ENEMIES[name];
        if (!def) continue;
        const ang = baseAng + s * Math.PI; // opposite sides
        const hp = Math.round(def.maxHp * hpScale * 3); // 3× elite
        world.spawn('enemy', {
          enemyType: name,
          miniBoss: true,
          x: player.x + Math.cos(ang) * SPAWN.radius,
          y: player.y + Math.sin(ang) * SPAWN.radius,
          vx: 0, vy: 0,
          hp, maxHp: hp,
          radius: def.radius * 1.4,
          speed: def.speed * 0.85,
          damage: Math.round(def.damage * 1.3),
          xp: (def.xp || 1) * 4,
          gold: (def.gold || 1) * 4,
          color: 0xff5a3a, // distinct red tint so they read as event spawns
          ability: 'charge',
          abilityCd: 1.5,
        });
      }
    }
  }

  // Chapter hazards — biome-specific environmental damage / movement
  // effects. Ch.4 (용암 분지) periodically spawns stationary fire patches
  // around the player that tick burn on contact. Ch.5 (서리 동굴) eases the
  // player's movement so direction changes carry a slight slide. Other
  // chapters are inert.
  let hazardT = 0;
  function tickChapterHazards(dt) {
    if (!currentMap) return;
    // Ch.4 lava patches — every ~5s spawn 3 fire shots that linger in place
    if (currentMap.chapter === 4) {
      hazardT += dt;
      if (hazardT >= 5) {
        hazardT = 0;
        for (let k = 0; k < 3; k++) {
          const a = Math.random() * Math.PI * 2;
          const dist = 140 + Math.random() * 180;
          const fx = player.x + Math.cos(a) * dist;
          const fy = player.y + Math.sin(a) * dist;
          // a stationary "fire patch" — radius 28, lasts 3s, burn proc
          world.spawn('projectile', {
            x: fx, y: fy, vx: 0, vy: 0,
            radius: 28, damage: 6, life: 3.0, pierce: 9999,
            color: 0xf0822a, sprite: null, hits: [],
            enemyShot: true, // routes at the player like a boss shot
          });
        }
      }
    }
    // Ch.5 ice — apply a tiny "slide" factor to the player by smoothing vx/vy
    // back to zero slower. Movement.js already snaps velocity to 0 on no
    // input; we override the snap when the chapter is ice by carrying a
    // fraction of the last frame's velocity forward.
    if (currentMap.chapter === 5) {
      player.iceSlide = true; // movement.js gates on this
    } else {
      player.iceSlide = false;
    }
  }

  // Blood Moon — a 15s scripted intensity surge every BLOODMOON_PERIOD
  // seconds. Spawn rate triples and new enemies hit ×1.3 with red tinted
  // sprites. Punctuates the otherwise monotonic spawn curve so the player
  // feels distinct "phases" inside a single run.
  const BLOODMOON_PERIOD = 240; // first surge at 4:00, then every 4 min
  const BLOODMOON_DURATION = 15;
  const runEvent = { bloodMoon: false, hell: false };
  let nextBloodMoonAt = BLOODMOON_PERIOD;
  let bloodMoonEndsAt = -Infinity;
  function tickBloodMoon(dt) {
    const t = stats.time;
    if (!runEvent.bloodMoon && t >= nextBloodMoonAt) {
      runEvent.bloodMoon = true;
      bloodMoonEndsAt = t + BLOODMOON_DURATION;
      nextBloodMoonAt = t + BLOODMOON_PERIOD;
      toast.show('피의 달', '적의 수와 위협이 일시적으로 폭증한다', '✦ 이벤트');
      audio.play('levelup');
      addShake(18);
      if (renderer.setBloodMoon) renderer.setBloodMoon(true);
    } else if (runEvent.bloodMoon && t >= bloodMoonEndsAt) {
      runEvent.bloodMoon = false;
      toast.show('피의 달 끝', '잠시 숨을 고를 시간이다', '✦ 이벤트');
      if (renderer.setBloodMoon) renderer.setBloodMoon(false);
    }
  }

  // combo tracker — consecutive kills within COMBO_WINDOW seconds. Tracks the
  // peak combo across the run so the result screen can flex a "max combo" stat.
  const COMBO_WINDOW = 2.5;
  let comboCount = 0;
  let lastKillT = -Infinity;
  events.on('kill', () => {
    if (stats.time - lastKillT <= COMBO_WINDOW) comboCount += 1;
    else comboCount = 1;
    lastKillT = stats.time;
    if (comboCount > (stats.maxCombo || 0)) stats.maxCombo = comboCount;
  });
  events.on('kill', ({ id, x, y, enemyType, boss, miniBoss }) => {
    audio.play('kill');
    if (!boss) {
      // The body itself crumbles to ash: the renderer clones the dying enemy's
      // sprite and dissolves it (tint→ash, fade, drift up, ash particles) — so
      // a kill reads as "it died" instead of a bomb popping over an empty spot.
      // A small impact spark stays for punch. Elites get a bigger ash cloud +
      // keep the burst; basic mobs drop the generic explosion entirely.
      const role = BESTIARY[enemyType] ? BESTIARY[enemyType].role : 'basic';
      const elite = role === 'elite' || miniBoss;
      if (renderer.spawnEnemyDeath) renderer.spawnEnemyDeath(id, x, y, { big: elite });
      renderer.spawnFx('fx_hit', x, y, { scale: elite ? 2.6 : 2.0, life: 0.28 });
      if (elite) renderer.spawnFx('fx_explosion', x, y, { scale: 1.5, life: 0.4 });
    }
  });
  // 사망 폭발 — a 'burst' monster scatters enemy shots when it dies.
  // Per user feedback: only elite/boss/mini-boss tier may fire projectiles;
  // basic-role enemies still play the visual explosion FX but don't spawn
  // damaging shots (the original slime/bog_zombie burst was a basic-tier
  // bullet hell that felt unfair against unarmoured starters).
  events.on('kill', ({ x, y, ability, dmg, enemyType, boss, miniBoss }) => {
    if (ability !== 'burst') return;
    const role = BESTIARY[enemyType] ? BESTIARY[enemyType].role : 'basic';
    const elite = role === 'elite' || boss || miniBoss;
    if (elite) {
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        spawnEnemyShot(world, x, y, Math.cos(a), Math.sin(a), 188,
          Math.round((dmg || 8) * 0.5), null);
      }
    }
    renderer.spawnFx('fx_explosion', x, y, { scale: 1.7, life: 0.4 });
  });
  // expansion enemy-ability FX — enemyAbilities.js emits 'enemyFx' for the
  // moments the sim can't make a sound itself (it's headless). SFX + a small
  // renderer flourish for the kamikaze blast.
  events.on('enemyFx', ({ kind, x, y }) => {
    if (kind === 'kamikaze') {
      audio.play('kamikaze');
      renderer.spawnFx('fx_explosion', x, y, { scale: 1.8, life: 0.4 });
    } else if (kind === 'summon') {
      audio.play('enemy_summon');
    } else if (kind === 'shield') {
      audio.play('shield_up');
    }
  });
  // hero on-kill skills (Lv40 고유 효과). The re-entrancy guard keeps a 'blast'
  // that kills another enemy from cascading into endless nested explosions.
  const ONKILL_RADIUS = 92;
  let onKillBusy = false;
  events.on('kill', ({ x, y, boss }) => {
    if (loadout.onKill.length === 0 || onKillBusy) return;
    onKillBusy = true;
    if (loadout.onKill.includes('lifesteal')) {
      // 피의 갈증 — every kill drains a little life back into the player
      player.hp = Math.min(player.maxHp, player.hp + (boss ? 14 : 3));
    }
    if (loadout.onKill.includes('mercy')) {
      // 부활의 기도 (cleric) — a small heal per kill
      player.hp = Math.min(player.maxHp, player.hp + (boss ? 8 : 1));
    }
    if (loadout.onKill.includes('critwindow')) {
      // 흔적 추적 (huntress) — a 2 s guaranteed-crit window after each kill
      loadout.buffs.push({ critChance: 1.0, life: 2.0 });
      loadout.recompute();
    }
    if (loadout.onKill.includes('bloodbath')) {
      // arcana 핏빛 의식 — +1 HP per kill (boss +6); max-hp penalty applied at start
      player.hp = Math.min(player.maxHp, player.hp + (boss ? 6 : 1));
    }
    // 흡혈 passive — heals on every kill, scaled by passive level. A green
    // "+N" floats above the player so the player notices the regen pulse.
    if (loadout.lifestealPerKill > 0) {
      const before = player.hp;
      player.hp = Math.min(player.maxHp, player.hp + loadout.lifestealPerKill);
      const healed = player.hp - before;
      if (healed > 0 && renderer.spawnDamageNumber) {
        // negative-coloured dmg number — we reuse spawnDamageNumber for the
        // floating text, with a custom green fill via crit flag false. Cheap
        // visual feedback; doesn't pollute stats.crits because crit=false.
        renderer.spawnDamageNumber(player.x, player.y - 12, healed, false);
      }
    }
    if (loadout.onKill.includes('frenzy')) {
      // arcana 광란 — kill streak: each kill stacks +2% damage up to +60%.
      // The streak resets on player hit (see 'playerHurt' below).
      loadout.frenzyStacks = Math.min(30, (loadout.frenzyStacks || 0) + 1);
      loadout.recompute();
    }
    if (loadout.onKill.includes('soulreaper')) {
      // arcana 영혼 수확자 — every 100 kills, full heal + 3 s godmode
      loadout.soulCount = (loadout.soulCount || 0) + 1;
      if (loadout.soulCount >= 100) {
        loadout.soulCount = 0;
        player.hp = player.maxHp;
        player.invuln = Math.max(player.invuln ?? 0, 3.0);
        renderer.spawnFx('fx_levelup', player.x, player.y, { scale: 3.0, life: 0.8 });
      }
    }
    const ignite = loadout.onKill.includes('ignite'); // 신성 광휘
    const blast = loadout.onKill.includes('blast'); // 마력 폭발
    const shock = loadout.onKill.includes('shock'); // 감전의 잔재 (Porta)
    if (ignite || blast || shock) {
      const shockRadius = 70;
      const radius = shock && !blast ? shockRadius : ONKILL_RADIUS;
      const ents = world.entities;
      for (let i = 0; i < ents.length; i++) {
        const e = ents[i];
        if (e.type !== 'enemy' || e.dead) continue;
        const dx = e.x - x;
        const dy = e.y - y;
        if (dx * dx + dy * dy > radius * radius) continue;
        if (ignite) applyStatus(e, 'burn');
        if (blast) damage.apply(world, events, stats, e, 34, dx, dy, 60);
        if (shock) {
          applyStatus(e, 'shock');
          damage.apply(world, events, stats, e, 18, dx, dy, 40);
        }
      }
      const fx = blast ? 'fx_explosion' : (shock ? 'fx_chain_lightning' : 'fx_impact_scorch');
      renderer.spawnFx(fx, x, y, {
        scale: blast ? 2.6 : (shock ? 2.2 : 2.0), life: 0.45,
      });
    }
    onKillBusy = false;
  });
  events.on('fire', ({ x, y, muzzle, action, fireSfx }) => {
    if (muzzle) renderer.spawnFx(muzzle, x, y, { scale: 1.5, life: 0.22 });
    if (action) renderer.spawnFx(action, x, y, { scale: 2.4, life: 0.32 });
    // Per-weapon fire SFX (archetype or def.fireSfx). audio.play guards
    // polyphony (16 voices) + a 45ms per-name throttle, so 5 auto-firing
    // weapons can't tear the audio. Silent when fireSfx is null.
    if (fireSfx) audio.play(fireSfx);
  });
  events.on('aoeCast', ({ x, y, kit, weaponId }) => {
    weaponSkyDropFx.spawn({ x, y, kit, weaponId });
  });
  events.on('playerHurt', () => {
    // strong feedback when the player is hit: shake + flash + hit-stop + a
    // brief red vignette so the player can't miss a hit even when surrounded
    // by enemies (which used to drown out a single 9-shake)
    addShake(14);
    renderer.flashEntity(player.id);
    requestHitstop(0.08);
    audio.play('hurt');
    mount.classList.add('player-hurt-flash');
    // 240ms — slightly longer than the .player-hurt-fade keyframe so the
    // class survives the full animation cycle, then clears cleanly
    setTimeout(() => mount.classList.remove('player-hurt-flash'), 240);
    // arcana 광란 — getting hit resets the kill streak
    if (loadout.frenzyStacks) {
      loadout.frenzyStacks = 0;
      loadout.recompute();
    }
    // 반사 passive — punch every nearby enemy with the reflect damage
    if (loadout.reflectDmg > 0) {
      const ents = world.entities;
      const r = 80;
      for (let i = 0; i < ents.length; i++) {
        const e = ents[i];
        if (e.type !== 'enemy' || e.dead) continue;
        const dx = e.x - player.x;
        const dy = e.y - player.y;
        if (dx * dx + dy * dy > r * r) continue;
        damage.apply(world, events, stats, e, loadout.reflectDmg, dx, dy, 4);
      }
      renderer.spawnFx('fx_impact_shock', player.x, player.y, { scale: 1.4, life: 0.25 });
    }
  });
  events.on('bossKill', ({ x, y }) => {
    addShake(14);
    audio.play('boss_outro');
    renderer.spawnFx('fx_explosion', x, y, { scale: 3.4, life: 0.7 });
    // bigger cinematic for the boss kill — 0.45s hitstop (was 0.11) + zoom
    // flash on the screen via a brief white overlay class. The renderer's
    // hitstop already pauses sim, so the time freeze is "real" not just visual.
    hitstop = 0.45;
    hitstopCd = 0.28;
    mount.classList.add('boss-kill-flash');
    setTimeout(() => mount.classList.remove('boss-kill-flash'), 600);
    // mid-run achievement scan (boss-count milestones)
    const ach = checkAchievements({
      kills: stats.kills, bosses: stats.bosses, crits: stats.crits,
      damage: stats.damage, level: progression.level, time: stats.time,
    });
    for (let i = 0; i < ach.length; i++) {
      const a = ach[i];
      setTimeout(() => toast.showAchievement(a.name, a.blurb || ''), 600 + i * 400);
    }
  });
  events.on('miniBossKill', ({ x, y }) => {
    addShake(8);
    audio.play('mini_outro');
    renderer.spawnFx('fx_explosion', x, y, { scale: 2.0, life: 0.5 });
  });

  // 'title' | 'mapselect' | 'charselect' | 'playing' | 'levelup' |
  // 'legendary' | 'gameover' | 'shop'
  let state = 'title';

  // hit-stop: a brief sim freeze on a crit / boss kill for impact (hit-react
  // technique #4). Gated by a cooldown so dense combat doesn't micro-stutter.
  let hitstop = 0;
  let hitstopCd = 0;
  function requestHitstop(duration) {
    if (hitstopCd > 0) return;
    hitstop = duration;
    hitstopCd = 0.28;
  }

  // Shop entry — title button vs result-screen button need different exits.
  // From the title, closing returns to the title (no reload — avoids the
  // flash where the empty world briefly shows between shop close and page
  // reload). From the result, we still hard-reload because the world is in
  // a dead state and a fresh page is the cleanest reset.
  function openShop(fromResult) {
    title.hide();
    state = 'shop';
    shop.open(() => {
      if (fromResult) {
        location.reload();
        return;
      }
      state = 'title';
      title.show();
    });
  }

  // "모험 시작" -> choose a map, then a hero, then the run begins.
  let currentMap = null; // the chosen stage (for chapter-unlock on game over)
  function openMapSelect() {
    state = 'mapselect';
    mapSelect.show((map) => {
      currentMap = map;
      renderer.setMap(map);
      spawn.setMap(map);
      movement.setMap(map);
      openCharSelect();
    });
  }

  function openCharSelect() {
    state = 'charselect';
    charSelect.show(openArcanaSelect, currentMap, openMapSelect);
  }

  // After picking a hero, offer an arcana (run-only modifier) before the run
  // actually begins. The chosen arcana folds into loadout.meta + onKill and
  // becomes part of the run; "건너뛰기" passes null, leaving the run plain.
  let pendingCharacter = null;
  // 주간 도전 여부는 타이틀에서 정하고, 맵 → 영웅 → 아르카나 흐름은 일반 모드와 같이 쓴다
  let weeklyMode = false;
  function openArcanaSelect(character) {
    pendingCharacter = character;
    state = 'arcanaselect';
    const ctx = {
      chapter: currentMap?.chapter,
      mapName: currentMap?.name,
      heroName: character?.name,
    };
    arcanaSelect.show(
      (arcana) => startRun(pendingCharacter, arcana, weeklyMode),
      ctx,
      { onBackMap: openMapSelect, onBackHero: openCharSelect },
    );
  }

  // Begin a run with the chosen character: set its starting weapon + sprite,
  // fold in the saved permanent upgrades, then layer the run-arcana on top.
  function startRun(character, arcana, weeklyChallenge) {
    audio.unlock();
    // Wipe ALL prior-run state before the apply* calls fold their additive
    // contributions on top. Without this, ESC → 종료 → 새 캐릭터 시작 carries
    // the prior run's weapons/passives/level/world entities/buffs over —
    // applyCharacter only overwrites `loadout.weapons`, and char.bonus +
    // applyMetaUpgrades += into meta so values inflate every restart.
    loadout.reset();
    progression.reset();
    world.reset();
    stats.time = 0; stats.kills = 0; stats.gold = 0; stats.crits = 0;
    stats.damage = 0; stats.bosses = 0; stats.hits = 0; stats.maxCombo = 0;
    // run-state closures owned by main.js
    nextEventAt = 90;
    hazardT = 0;
    nextBloodMoonAt = BLOODMOON_PERIOD;
    bloodMoonEndsAt = -Infinity;
    runEvent.bloodMoon = false;
    runEvent.weeklyChallenge = null; // clear prior weekly state
    hitstop = 0; hitstopCd = 0;
    comboCount = 0; lastKillT = -Infinity;
    onKillBusy = false;
    // player entity is reused across runs — reset position + transient state
    // (hp/maxHp/armor/revives are set by applyMetaUpgrades below)
    player.x = 0; player.y = 0; player.vx = 0; player.vy = 0;
    player.invuln = 0; player.shield = 0; player.iceSlide = false;
    player.dead = false;
    // TEMP debug handle for browse-driven verification — gated so it only
    // attaches when ?debug=1 is on the URL, so production sessions stay clean.
    if (typeof window !== 'undefined' && /[?&]debug=1\b/.test(window.location.search)) {
      window.__dbg = { player, loadout, progression, stats, get state(){ return state; } };
    }
    applyCharacter(character, loadout, player);
    // Warm the hero's walk + attack PNG frames so the first walk cycle
    // doesn't flash the legacy ASCII sprite while frames lazy-load.
    if (renderer.preloadHero) renderer.preloadHero(character.sprite);
    applyMetaUpgrades(loadout, player, loadSave().upgrades);
    applyArcana(arcana, loadout); // null = 건너뛰기, no modifier
    skills.check(loadout, player, 1); // unlock the Lv1 class skill (no toast)
    active.reset(); // fresh cooldown + state machine each run
    weaponSkyDropFx.reset(); // clear any in-flight AoE FX from last run
    hud.show(); // re-show after a returnToTitle hid it
    if (audio.setMusic) audio.setMusic('ambient'); // start the BGM drone
    // Weekly challenge — seeded run with modifiers based on ISO week.
    // Same week → same modifiers for all players.
    // Modifiers are stored in runEvent and read by consumption points
    // (movement, pickup, etc) so global config stays unaffected.
    if (weeklyChallenge) {
      const isoWeek = getIsoWeek();
      const rule = getRuleForWeek(isoWeek.year, isoWeek.week);
      runEvent.weeklyChallenge = { rule, year: isoWeek.year, week: isoWeek.week };
      // Set the weekly modifier on systems that need it
      movement.setWeeklyModifier(rule);
      pickup.setWeeklyModifier(rule);
      damage.setWeeklyModifier(rule);
      toast.show('이번 주 도전', rule.name, '도전');
    } else {
      // Clear weekly modifiers for normal runs
      movement.setWeeklyModifier(null);
      pickup.setWeeklyModifier(null);
      damage.setWeeklyModifier(null);
    }
    // snapshot hell-mode toggle for this run (a mid-run settings change
    // won't take effect; spawn.js reads runEvent.hell every frame)
    const _sv = loadSave();
    runEvent.hell = !!(_sv.hellModeUnlocked && _sv.hellModeEnabled);
    if (runEvent.hell) {
      toast.show('지옥 모드 가동', '적이 강해졌다 · 골드 ×3', '⚠ 지옥');
      mount.classList.add('hell-mode');
    } else {
      mount.classList.remove('hell-mode');
    }
    // first-run tutorial — guide the new player through the basics. Toasts
    // queue inside the existing toast system; tag '✦ 안내' marks them as
    // tutorial text rather than a skill unlock. Save flag flips so subsequent
    // runs stay clean.
    const s = loadSave();
    if (!s.tutorialShown) {
      s.tutorialShown = true;
      writeSave(s);
      setTimeout(() => toast.show('이동', 'WASD 또는 화살표 키로 움직여라', '✦ 안내'), 600);
      setTimeout(() => toast.show('자동 공격', '무기는 알아서 가까운 적을 공격한다', '✦ 안내'), 4200);
      setTimeout(() => toast.show('경험치', '파란 보석을 모아 레벨업 — 레벨업마다 강화를 선택', '✦ 안내'), 8000);
      setTimeout(() => toast.show('일시정지', 'ESC로 멈추고 현재 능력치를 확인할 수 있다', '✦ 안내'), 12000);
    }
    state = 'playing';
  }

  title.onStart((isWeeklyChallenge) => {
    weeklyMode = !!isWeeklyChallenge;
    openMapSelect();
  });
  title.onShop(() => openShop(false));
  // info pages hide the title while open and restore it when closed (the
  // close callback fires on 닫기), so the menu never shows through the page
  title.onAchievements(() => { title.hide(); achievements.open(() => title.show()); });
  title.onArsenal(() => { title.hide(); arsenal.open(() => title.show()); });
  title.onBestiary(() => { title.hide(); bestiary.open(() => title.show()); });
  title.onStatus(() => { title.hide(); statusPage.open(() => title.show()); });
  title.onSettings(() => { title.hide(); settings.open(() => title.show()); });
  title.onStats(() => { title.hide(); statsPage.open(() => title.show()); });
  title.onHistory(() => { title.hide(); historyPage.open(() => title.show()); });
  title.onSpirits(() => { title.hide(); spiritsPage.open(() => title.show()); });
  result.onShop(() => openShop(true));
  result.onStats(() => statsPage.open(() => {}));

  function openLevelUp() {
    state = 'levelup';
    audio.play('levelup');
    renderer.spawnFx('fx_levelup', player.x, player.y, { scale: 2.6, life: 0.7 });
    levelUp.show(
      rollChoices(rng, 3, loadout),
      (choice) => {
        applyChoice(choice, loadout, player);
        progression.consumeLevel();
        // spirit fusion — choices.js sets loadout.lastFusion when picking the
        // 2nd ingredient collapses both into a fused spirit. Surface the
        // moment with a toast + brief fx so the player notices the recipe.
        if (loadout.lastFusion) {
          const fusedDef = SPIRITS[loadout.lastFusion];
          if (fusedDef) {
            toast.show(fusedDef.name, '두 정령이 융합했다 — ' + fusedDef.desc, '✦ 정령 융합');
            renderer.spawnFx('fx_levelup', player.x, player.y, { scale: 3.2, life: 0.9 });
            // persistent discovery — feeds fusion_first / fusion_all checks
            const sv = loadSave();
            sv.discoveredFusions = sv.discoveredFusions || {};
            if (!sv.discoveredFusions[loadout.lastFusion]) {
              sv.discoveredFusions[loadout.lastFusion] = true;
              writeSave(sv);
            }
          }
          loadout.lastFusion = null;
        }
        // weapon evolution — a maxed base weapon + its paired passive fuses
        // into a legendary — show the dedicated evolution overlay
        const evolved = evolveCheck(loadout);
        for (let i = 0; i < evolved.length; i++) evolution.show(evolved[i]);
        // mid-run achievement scan — fires top-right toasts for any milestone
        // the new level just unlocked (e.g., Lv 20 reached) without waiting
        // for death
        const ach = checkAchievements({
          kills: stats.kills, bosses: stats.bosses, crits: stats.crits,
          damage: stats.damage, level: progression.level, time: stats.time,
        });
        for (let i = 0; i < ach.length; i++) {
          const a = ach[i];
          setTimeout(() => toast.showAchievement(a.name, a.blurb || ''), 300 + i * 400);
        }
        // unlock any hero skill the new level reaches
        const fresh = skills.check(loadout, player, progression.level);
        for (let i = 0; i < fresh.length; i++) toast.show(fresh[i].name, fresh[i].blurb);
        if (progression.pendingLevels > 0) openLevelUp();
        else state = 'playing';
      },
      {
        tokens: loadout.tokens,
        // reroll — spend a token to draw 3 new choices (rebuilds the panel)
        onReroll: () => {
          if ((loadout.tokens.reroll || 0) <= 0) return;
          loadout.tokens.reroll -= 1;
          openLevelUp();
        },
        // skip — spend a token to take no upgrade this level (still counts)
        onSkip: () => {
          if ((loadout.tokens.skip || 0) <= 0) return;
          loadout.tokens.skip -= 1;
          progression.consumeLevel();
          levelUp.hide();
          if (progression.pendingLevels > 0) openLevelUp();
          else state = 'playing';
        },
      },
    );
  }

  // Return to the title screen without reloading the page — just hide the HUD,
  // clear pause state, and show the title. The game loop will stop simulating
  // (update only runs when state === 'playing') but rendering continues,
  // leaving the frozen game world visible under the title.
  function returnToTitle() {
    state = 'title';
    hud.hide();
    pauseMenu.close();
    // bulletproof — hide every transient modal so the title never shows
    // through a stuck levelup / evolution / gacha / result overlay
    if (levelUp.hide) levelUp.hide();
    if (evolution.hide) evolution.hide();
    if (gacha.hide) gacha.hide();
    if (result.hide) result.hide();
    mount.classList.remove('hell-mode'); // clear run-time hell visual
    mount.classList.remove('low-hp');
    if (audio.setMusic) audio.setMusic('off');
    title.show();
  }

  // ESC pause menu — freezes the run (state 'paused' halts the loop) and
  // shows the run's stats; resume or quit to the title.
  function openPause() {
    const prev = state; // restore whichever state we paused from on resume
    state = 'paused';
    // expanded zone map — drawn once (world is frozen while paused) so the
    // wide structuresNear scan never runs per-frame.
    if (renderer.setBigMapVisible) {
      renderer.setBigMapVisible(true);
      if (renderer.drawBigMap) renderer.drawBigMap();
    }
    const hideBigMap = () => { if (renderer.setBigMapVisible) renderer.setBigMapVisible(false); };
    pauseMenu.open(
      stats,
      progression.level,
      player,
      loadout,
      () => { hideBigMap(); state = prev === 'levelup' ? 'levelup' : 'playing'; },
      () => { hideBigMap(); returnToTitle(); },
      () => { hideBigMap(); settings.open(() => {}); }, // settings overlay on top
    );
  }

  // A collected treasure chest opens the gacha modal (content/loot.js +
  // ui/gacha.js): it reveals 1-3 loot items, then main applies each effect.
  function openGacha(type) {
    state = 'legendary'; // a paused overlay state — the loop gates the sim
    audio.play('levelup');
    const result = rollChest(rng, type);
    gacha.show(result, () => {
      for (const item of result.items) applyLoot(item);
      // fold any maxHp / armor change (a rune may roll vigor) onto the player
      if (player.maxHp !== loadout.maxHp) {
        const gain = loadout.maxHp - player.maxHp;
        player.maxHp = loadout.maxHp;
        if (gain > 0) player.hp = Math.min(player.maxHp, player.hp + gain);
      }
      player.armor = loadout.meta.armor;
      if (progression.pendingLevels > 0) openLevelUp();
      else state = 'playing';
    });
  }

  // Add a random not-yet-owned weapon from `pool`; gold if the pool is full.
  function grantRandomWeapon(pool) {
    const avail = pool.filter((wid) => !loadout.weapons[wid]);
    if (avail.length === 0) {
      stats.gold += 120;
      return;
    }
    loadout.weapons[avail[Math.floor(rng.next() * avail.length)]] = 1;
    loadout.recompute();
  }

  // Apply one rolled loot item (content/loot.js LOOT_ITEMS) by id.
  function applyLoot(item) {
    const id = item.id;
    if (id.indexOf('gold_') === 0) {
      stats.gold += item.value;
    } else if (id === 'heart_small') {
      player.hp = Math.min(player.maxHp, player.hp + item.value);
    } else if (id === 'chicken') {
      player.hp = Math.min(player.maxHp, player.hp + player.maxHp * item.value);
    } else if (id === 'potion_might') {
      loadout.buffs.push({ damage: 1.15, life: Infinity });
      loadout.recompute();
    } else if (id === 'potion_swift') {
      loadout.buffs.push({ moveSpeed: 1.2, life: Infinity });
      loadout.recompute();
    } else if (id === 'potion_mana') {
      loadout.buffs.push({ cooldown: 0.9, life: Infinity });
      loadout.recompute();
    } else if (id === 'potion_arcane') {
      loadout.buffs.push({ damage: 1.25, life: Infinity });
      loadout.recompute();
    } else if (id === 'magnet') {
      for (let i = 0; i < world.entities.length; i++) {
        const e = world.entities[i];
        if (e.type === 'gem' && !e.dead) {
          progression.addXp(e.xp * (loadout.xpGainMult ?? 1));
          world.kill(e);
        }
      }
    } else if (id === 'bomb') {
      for (let i = 0; i < world.entities.length; i++) {
        const e = world.entities[i];
        if (e.type === 'enemy' && !e.dead) {
          damage.apply(world, events, stats, e, item.value, 0, 0, 0);
        }
      }
      addShake(11);
    } else if (id === 'scroll') {
      loadout.tokens.reroll = (loadout.tokens.reroll || 0) + 1;
    } else if (id === 'rune') {
      const passives = ['might', 'haste', 'multi', 'vigor', 'swift', 'lodestone'];
      const p = passives[Math.floor(rng.next() * passives.length)];
      loadout.passives[p] = (loadout.passives[p] || 0) + 1;
      loadout.recompute();
    } else if (id === 'weapon_roll') {
      grantRandomWeapon(BASE_WEAPONS);
    } else if (id === 'legendary_seed') {
      grantRandomWeapon(LEGENDARY_WEAPONS);
    }
  }

  // Apply a collected loot drop's effect (drops.js defines the kinds).
  function onCollectDrop(dropEnt) {
    const def = DROPS[dropEnt.dropId];
    if (!def) return;
    switch (def.kind) {
      case 'heal':
        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * def.healFrac);
        audio.play('levelup');
        break;
      case 'buff':
        loadout.buffs.push({ ...def.buff, life: def.duration });
        loadout.recompute();
        audio.play('levelup');
        break;
      case 'magnet':
        for (let i = 0; i < world.entities.length; i++) {
          const e = world.entities[i];
          if (e.type === 'gem' && !e.dead) {
            progression.addXp(e.xp * (loadout.xpGainMult ?? 1));
            world.kill(e);
          }
        }
        audio.play('levelup');
        break;
      case 'bomb':
        for (let i = 0; i < world.entities.length; i++) {
          const e = world.entities[i];
          if (e.type === 'enemy' && !e.dead) {
            damage.apply(world, events, stats, e, def.damage, 0, 0, 0);
          }
        }
        addShake(11);
        break;
      case 'gold': {
        let goldAmount = def.amount;
        // Apply weekly challenge gold multiplier
        if (runEvent.weeklyChallenge?.rule?.modifierName === 'gold_mult') {
          goldAmount = Math.round(goldAmount * runEvent.weeklyChallenge.rule.value);
        }
        stats.gold += goldAmount;
        audio.play('kill');
        break;
      }
      case 'chest':
        // chest entities can carry a chestTier — 'wood' (mini-boss reward,
        // common-heavy roll) vs the default 'boss' tier (full epic chest)
        openGacha(dropEnt.chestTier || 'boss');
        break;
    }
  }

  window.addEventListener('keydown', (e) => {
    // ESC during a run opens the pause menu (stats + resume / quit); ESC again
    // resumes. The loop freezes the sim while state is 'paused'.
    if (e.key === 'Escape') {
      if (state === 'playing') {
        openPause();
        return;
      }
      if (state === 'paused') {
        pauseMenu.close();
        return;
      }
      if (state === 'shop') {
        // ESC closes the shop the same way the 닫기 button does — back to
        // title without a reload (avoids the brief empty-world flash)
        shop.close && shop.close();
        state = 'title';
        title.show();
        return;
      }
      // ESC during levelup — open the pause menu over the levelup so the
      // player can see stats / quit. Picking still requires 1/2/3 or a
      // click; ESC again from pause returns to the levelup choice.
      if (state === 'levelup') {
        openPause();
        return;
      }
      // ESC on result page — back to title (closes any stale modals that
      // may have leaked through, like a levelup pending at the moment of
      // death). Without this branch, ESC was silently a no-op on gameover.
      if (state === 'gameover') {
        returnToTitle();
        return;
      }
      return;
    }
    if (state === 'gameover') {
      if (e.key === 'r' || e.key === 'R') location.reload();
      if (e.key === 's' || e.key === 'S') openShop(true); // from result → reload on exit
    }
    if (state === 'levelup' && e.key >= '1' && e.key <= '3') {
      levelUp.pick(Number(e.key) - 1);
    }
    // shortcut keys for the reroll / skip tokens
    if (state === 'levelup' && (e.key === 'r' || e.key === 'R')) {
      if ((loadout.tokens.reroll || 0) > 0) {
        loadout.tokens.reroll -= 1;
        openLevelUp();
      }
    }
    if (state === 'levelup' && (e.key === 'x' || e.key === 'X')) {
      if ((loadout.tokens.skip || 0) > 0) {
        loadout.tokens.skip -= 1;
        progression.consumeLevel();
        levelUp.hide();
        if (progression.pendingLevels > 0) openLevelUp();
        else state = 'playing';
      }
    }
  });

  function update(dt) {
    // hit-stop: freeze the whole sim briefly (render keeps running)
    hitstopCd -= dt;
    if (hitstop > 0) {
      hitstop -= dt;
      return;
    }
    stats.time += dt;
    movement.update(dt, world, player, loadout);
    // arcana 고요 — standing still doubles damage, moving cuts it 30%. We
    // track the static/moving state and only recompute on transitions so the
    // recompute() cost stays off the hot path.
    if (loadout.arcanaTag && loadout.arcanaTag.stillness) {
      const moving = (player.vx || 0) !== 0 || (player.vy || 0) !== 0;
      const want = moving ? 0.7 : 2.0;
      if (loadout.stillnessMult !== want) {
        loadout.stillnessMult = want;
        loadout.recompute();
      }
    }
    tickBloodMoon(dt);
    tickChapterHazards(dt);
    tickLowHp(dt);
    tickRandomEvents();
    // 폭풍 passive — while moving, tick a small aoe under the player's feet.
    // The tick interval is the same regardless of level; the damage scales.
    if (loadout.stormDmg > 0 && ((player.vx || 0) !== 0 || (player.vy || 0) !== 0)) {
      stormT = (stormT || 0) - dt;
      if (stormT <= 0) {
        stormT = 0.35;
        const ents = world.entities;
        const r = 56;
        let hitAny = false;
        for (let i = 0; i < ents.length; i++) {
          const e = ents[i];
          if (e.type !== 'enemy' || e.dead) continue;
          const dx = e.x - player.x;
          const dy = e.y - player.y;
          if (dx * dx + dy * dy > r * r) continue;
          damage.apply(world, events, stats, e, loadout.stormDmg, dx, dy, 0);
          hitAny = true;
        }
        // visible swirl under the player so the passive feels active even
        // when no enemy is in range — only spawn the fx on hits so it isn't
        // a permanent particle dump.
        if (hitAny) {
          renderer.spawnFx('fx_chain_lightning', player.x, player.y, { scale: 1.6, life: 0.22 });
        }
      }
    }
    player.level = progression.level; // expose to spawn.js levelScale
    player.curse = loadout.meta.curse || 0; // VS Curse → spawn difficulty mult
    spawn.update(dt, world, player, stats.time, runEvent);
    enemyAbilities.update(dt, world, player, events);
    weaponFire.update(dt, world, player, loadout, events);
    active.update(dt, world, player, loadout, input, events, stats, damage, audio, addShake);
    weaponSkyDropFx.update(dt);
    spirits.update(dt, world, player, loadout);
    collision.update(dt, world, player, damage, events, stats);
    status.update(dt, world, events, stats, damage);
    pickup.update(dt, world, player, loadout, progression, onCollectDrop);
    world.reap();
    // consume one-shot edges (justPressedSpace) so they fire exactly once
    input.consumeFrame();

    // expire timed drop-potion buffs; recompute folds the live ones in
    if (loadout.buffs.length > 0) {
      let expired = false;
      for (let i = loadout.buffs.length - 1; i >= 0; i--) {
        loadout.buffs[i].life -= dt;
        if (loadout.buffs[i].life <= 0) {
          loadout.buffs.splice(i, 1);
          expired = true;
        }
      }
      if (expired) loadout.recompute();
    }

    if (loadout.regen > 0) {
      player.hp = Math.min(player.maxHp, player.hp + loadout.regen * dt);
    }

    if (player.hp <= 0) {
      if (player.revives > 0) {
        player.revives -= 1;
        player.hp = player.maxHp;
      } else {
        state = 'gameover';
        if (audio.setMusic) audio.setMusic('off'); // silence the BGM on death
        // hide any transient modal that was open at the moment of death
        // (levelup / evolution / gacha). Otherwise the modal lingers under
        // the result page and re-appears when the player clicks through.
        if (levelUp.hide) levelUp.hide();
        if (evolution.hide) evolution.hide();
        if (gacha.hide) gacha.hide();
        // drop any pending level-ups — the run is over; no more picks.
        progression.clearPending();
        // Survival bonus: reward time survived (added before goldMult so Greed
        // scales it too). Lifts mediocre/early-death runs and incentivizes
        // pushing deeper rather than only farming kills. See config.
        stats.survivalGold = Math.floor(stats.time * SURVIVAL_GOLD_PER_SEC);
        stats.gold = Math.floor((stats.gold + stats.survivalGold) * loadout.goldMult);
        addGold(stats.gold); // persist the run's gold for the shop
        // progression-based unlock: Ch4 at Lv20, Ch5 at Lv30. Replaces the
        // old "clear chapter -> unlock next" rule so any chapter played can
        // earn the next, given a strong enough run.
        const reached = progression.level;
        const before = loadSave().unlockedChapters;
        // forest(구 ch.2) 흡수로 5챕터 체계: 1 던전 / 2 늪 / 3 용암 / 4 얼음 /
        // 5 공허. 시작 시 1~3 개방(unlockedChapters 기본 3), Lv20→ch4, Lv30→ch5.
        if (reached >= 20 && before < 4) {
          unlockChapter(4);
          toast.show('새 챕터 해금', 'Ch.4 서리 동굴 + 전사 영웅이 열렸다', '✦ 해금');
        }
        if (reached >= 30 && loadSave().unlockedChapters < 5) {
          unlockChapter(5);
          toast.show('새 챕터 해금', 'Ch.5 공허의 균열이 열렸다', '✦ 해금');
        }
        // Hell-mode unlock — surviving a full 10-min run rewards a new
        // difficulty toggle in the settings panel (×2 enemy HP/damage,
        // ×3 gold, all unlocks gated by maxLevel still apply on top).
        if (stats.time >= 600 && !loadSave().hellModeUnlocked) {
          const sv = loadSave();
          sv.hellModeUnlocked = true;
          writeSave(sv);
          toast.show('지옥 모드 해금', '설정에서 지옥 난이도를 켤 수 있다', '✦ 해금');
        }
        // fold the run into lifetime stats + unlock achievements
        const freshAch = recordRun({
          kills: stats.kills, bosses: stats.bosses, crits: stats.crits,
          damage: stats.damage, level: progression.level, time: stats.time,
        });
        // record this run into save.runHistory (last 10) for the run-log page
        const _svHist = loadSave();
        _svHist.runHistory = _svHist.runHistory || [];
        _svHist.runHistory.unshift({
          ts: Date.now(),
          hero: loadout.hero ? loadout.hero.id : null,
          level: progression.level,
          time: Math.floor(stats.time),
          kills: stats.kills,
          gold: stats.gold,
          weapons: Object.keys(loadout.weapons),
          arcana: loadout.arcana ? loadout.arcana.id : null,
          chapter: currentMap ? currentMap.chapter : null,
          hell: runEvent.hell || false,
          seed: runSeed,
        });
        if (_svHist.runHistory.length > 10) _svHist.runHistory.length = 10;
        writeSave(_svHist);
        // top-right achievement notifications, staggered so multiple unlocks
        // don't clobber each other. The result screen still lists them but
        // the toast pops immediately so the moment is felt.
        for (let i = 0; i < freshAch.length; i++) {
          const a = freshAch[i];
          setTimeout(() => toast.showAchievement(a.name, a.blurb || ''), 200 + i * 400);
        }
        // death beat — a burst + heavy shake plays before the result drops in
        renderer.spawnFx('fx_explosion', player.x, player.y, { scale: 3.4, life: 0.8 });
        renderer.spawnFx('fx_hit', player.x, player.y, { scale: 2.6, life: 0.4 });
        addShake(20);
        audio.play('kill');
        // Update weekly challenge record if this run was in weekly mode
        let weeklyRecordInfo = null;
        if (runEvent.weeklyChallenge) {
          const sv = loadSave();
          const prevRecord = getWeeklyRecord(sv, runEvent.weeklyChallenge.year, runEvent.weeklyChallenge.week);
          const prevBestSurvival = prevRecord.bestSurvival;
          updateWeeklyRecord(sv, runEvent.weeklyChallenge.year, runEvent.weeklyChallenge.week, stats.time, stats.kills);
          writeSave(sv);
          const newRecord = getWeeklyRecord(sv, runEvent.weeklyChallenge.year, runEvent.weeklyChallenge.week);
          weeklyRecordInfo = {
            rule: runEvent.weeklyChallenge.rule,
            prevBestSurvival,
            bestSurvival: newRecord.bestSurvival,
          };
        }
        setTimeout(() => {
          result.show(
            stats, progression.level, loadout,
            skills.unlockedSkills(loadout), freshAch,
            weeklyRecordInfo,
          );
        }, 720);
        return;
      }
    }
    // a chest collected this tick may have opened the gacha modal — don't
    // also open level-up over it; the gacha callback chains to level-up.
    if (state === 'playing' && progression.pendingLevels > 0) openLevelUp();
  }

  function render() {
    renderer.centerOn(player.x, player.y);
    player.magnet = loadout.magnet; // expose to renderer for the pull lines
    // black_pigeon companion — orbits the player when the weapon is owned.
    // While a barrage is in flight (pigeonLock active) the bird sits at the
    // locked position with a small bob so every staggered beam launches
    // from the same emitter that you can see on screen.
    const hasPigeon = loadout.weapons && loadout.weapons.black_pigeon;
    if (hasPigeon) {
      const t = performance.now() * 0.001;
      let px, py, flipX;
      if (t < pigeonLock.expires) {
        // Locked during cast — sub-bob keeps the bird "alive" without
        // letting it wander from the visible beam emitter.
        const bobR = 6;
        px = pigeonLock.x + Math.cos(t * 4) * bobR;
        py = pigeonLock.y + Math.sin(t * 4) * (bobR * 0.4);
        flipX = Math.cos(t * 4) < 0;
      } else {
        const orbitR = 36;
        px = player.x + Math.cos(t * 1.2) * orbitR;
        py = player.y - 40 + Math.sin(t * 1.2) * (orbitR * 0.4);
        flipX = Math.cos(t * 1.2) < 0;
      }
      player.beamOriginX = px;
      player.beamOriginY = py;
      lastPigeonPos.x = px;
      lastPigeonPos.y = py;
      renderer.drawPet(true, px, py, { flipX, scale: 1.4 });
    } else {
      player.beamOriginX = undefined;
      player.beamOriginY = undefined;
      renderer.drawPet(false, 0, 0);
    }
    renderer.sync(world.entities);
    renderer.drawActive(active.getRenderState());
    renderer.drawWeaponSkyDropFx(weaponSkyDropFx.getRenderInstances());
    renderer.drawBuffHalo(player, loadout.buffs);
    let boss = null;
    let miniSeen = false;
    for (let i = 0; i < world.entities.length; i++) {
      const e = world.entities[i];
      if (e.dead) continue;
      if (e.boss) { boss = e; }
      else if (e.miniBoss) miniSeen = true;
    }
    // stamp the kit signature onto the boss so hud.update can render it
    if (boss && !boss.signature) {
      boss.signature = bossKitFor(boss.sprite).signature || '';
    }
    // boss / mini-boss intro audio cue — fired once on the frame the
    // entity first appears in the world, so spawn.js stays oblivious to
    // audio. The seenBoss/seenMini flags prevent re-triggering each frame.
    if (boss && !seenBoss) {
      audio.play('boss_intro');
      addShake(12);
      seenBoss = true;
      bossPhaseSeen = 1; // new boss → reset escalation tracking
      bossesSpawnedCount += 1; // power the HUD next-event ETA
      if (audio.setMusic) audio.setMusic('boss'); // denser pulse during boss
      // signature ability toast — each boss has a named cast (뼈 폭풍 / 독무 /
      // 화염 숨결 …) advertised at spawn so the fight reads as a set piece.
      const kit = bossKitFor(boss.sprite);
      const bossName = boss.bossName || '보스';
      toast.show(bossName, '✦ ' + (kit.signature || '암흑의 권능'), '⚠ 보스 등장');
    } else if (!boss && seenBoss) {
      seenBoss = false;
      if (audio.setMusic) audio.setMusic('ambient'); // back to the slow drone
    }
    // Boss phase transition signal — escalation tell as the boss crosses an HP
    // threshold (66% / 33%, matching fireBossCast's castPhase). Fired once per
    // crossing (bossPhaseSeen only climbs), distinct from the red attack
    // telegraph: an audio swell + strong shake + a big burst on the boss + a
    // toast. Pure player feedback; the sim handles the actual stat ramp.
    if (boss && boss.maxHp > 0) {
      const ph = boss.hp > boss.maxHp * 0.66 ? 1 : boss.hp > boss.maxHp * 0.33 ? 2 : 3;
      if (ph > bossPhaseSeen) {
        bossPhaseSeen = ph;
        audio.play('boss_phase');
        addShake(13);
        renderer.spawnFx('fx_explosion', boss.x, boss.y, { scale: 4.0, life: 0.5 });
        renderer.flashEntity(boss.id);
        const nm = boss.bossName || '보스';
        toast.show(nm, ph >= 3 ? '✦ 최후의 발악!' : '✦ 분노 폭발', '⚠ 페이즈 전환');
      }
    }
    if (miniSeen && !seenMini) {
      audio.play('mini_intro');
      seenMini = true;
      miniBossesSpawnedCount += 1;
    } else if (!miniSeen && seenMini) {
      seenMini = false;
    }
    // soonest upcoming event — main.js owns the timers (BLOODMOON_PERIOD,
    // BOSS / MINI cadence) so we compute the next event here and feed it to
    // the HUD as { label, secs } for the countdown chip
    const t = stats.time;
    const nextBossAt = 120 + bossesSpawnedCount * 150; // BOSS.firstMinute*60 + n * intervalMin*60
    const nextMiniAt = 60 + miniBossesSpawnedCount * 150;
    const nextBloodAt = runEvent.bloodMoon ? bloodMoonEndsAt : nextBloodMoonAt;
    const candidates = [
      { label: '보스', secs: nextBossAt - t },
      { label: '미니보스', secs: nextMiniAt - t },
      { label: runEvent.bloodMoon ? '피의 달 종료' : '피의 달', secs: nextBloodAt - t },
    ];
    let next = null;
    for (const c of candidates) {
      if (c.secs > 0 && (!next || c.secs < next.secs)) next = c;
    }
    hud.update(player, stats, progression, boss, loadout, next, runEvent.hell, active.getHudInfo());
  }
  // counters mirrored from spawn.js — main needs them to compute next-event
  // ETAs for the HUD countdown. Incremented in render() when a boss / mini
  // first appears in the world (seenBoss / seenMini transition).
  let bossesSpawnedCount = 0;
  let miniBossesSpawnedCount = 0;
  let seenBoss = false;
  let seenMini = false;
  // Boss phase escalation tracking — the highest HP-threshold phase the current
  // boss has reached (1 / 2 / 3). Reset to 1 when a new boss appears so the
  // pooled entity slot never carries a stale phase into the next boss. The
  // sim already ramps fireBossCast by castPhase; this drives the player-facing
  // cue only (render-side), so the balance harness needs none of it.
  let bossPhaseSeen = 1;
  // low-HP feedback — toggles a CSS vignette on #game and plays a heartbeat
  // sound on a slow tick while the player sits below LOW_HP_THRESH
  const LOW_HP_THRESH = 0.25;
  let lowHpActive = false;
  let heartbeatT = 0;
  let stormT = 0; // 폭풍 passive tick
  function tickLowHp(dt) {
    if (state !== 'playing') return;
    const ratio = player.hp / Math.max(1, player.maxHp);
    const want = ratio > 0 && ratio < LOW_HP_THRESH;
    if (want !== lowHpActive) {
      lowHpActive = want;
      mount.classList.toggle('low-hp', lowHpActive);
    }
    if (lowHpActive) {
      heartbeatT -= dt;
      if (heartbeatT <= 0) {
        heartbeatT = 0.95;
        audio.play('heartbeat');
      }
    } else heartbeatT = 0;
  }

  createLoop({
    ticker: renderer.app.ticker,
    getState: () => state,
    update,
    render,
  });
}

main();
