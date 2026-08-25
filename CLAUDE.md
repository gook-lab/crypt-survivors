# Crypt Survivors — Project Guide

Vampire Survivors-style auto-battler roguelite. Plain JavaScript (Node ≥18, no
transpilation), PixiJS v8, Vite, Vitest. The simulation never imports PixiJS —
the renderer is the only Pixi consumer, so the sim is headless-testable.

## Quick Reference

| Command | Purpose |
|---|---|
| `npm install` | First-time install |
| `npm run dev` | Dev server (http://localhost:7153/ — Vite auto-bumps port if in use) |
| `npm test -- --run` | 282 vitest unit tests as of 2026-08-22 (must pass before commits) |
| `npm run build` | Production bundle → `dist/` |
| `node scripts/balance.js [N]` | Headless balance harness — N seeds (default 5) × 10 min kiter AI. Deterministic (seeded); prints distribution summary (survived / died<4:00 / median / gold/run). Use 24+ seeds for a reliable read. |

For browser QA: use gstack `$B` binary (`/browse` skill) — never `mcp__claude-in-chrome__*`.

For pixel art generation: PixelLab MCP is registered (`mcp__pixellab__*`, available in fresh sessions).

## Project Structure

```
src/
  engine/        loop (FIXED_DT 1/60), world (entity pool), collision
                 (uniform-grid spatial hash, cell 48), renderer (only Pixi
                 consumer), events bus
  systems/       per-tick stateless: movement, spawn (director + waves +
                 mini-bosses), weaponFire, collision, damage, pickup,
                 spirits (orbiting companions), minions (summon weapons),
                 weaponSkyDropFx (per-weapon AoE sky-drop overlay —
                 telegraph + fall + impact, cosmetic),
                 status, skills (level-up unlocks), active (spacebar
                 signature ultimate; Phase 1: mage meteor_storm),
                 enemyAbilities (boss kits + telegraph + tier gate)
  content/       pure data: weapons, passives, evolutions, metaUpgrades,
                 characters, bestiary, drops, loot, achievements, arcanas,
                 spirits, rooms, maps, status, signatures (per-hero
                 spacebar ultimate definitions)
  ui/            HTML/CSS overlays — title, charselect, mapselect,
                 arcanaselect, hud, levelup, evolution, result, shop,
                 gacha, pausemenu, settings, toast, achievements, arsenal,
                 bestiary, status (page), stats, spirits (page), history
  util/          rng (seeded), audio (ZzFX wrapper + BGM engine), zzfx,
                 spriteAngles (per-sprite rotation offset map),
                 heroAssets (hero idle/walk/attack PNG bridge),
                 enemyAssets (enemy PNG bridge),
                 weaponAssets (projectile 4-5f animation registry),
                 sigAssets (signature/impact/zone PNG registry),
                 buffAssets (aura halo PNG overlay registry),
                 structureAssets (prop PNG bridge),
                 tilesets (per-biome Wang tileset)
  data/          save.js (localStorage, defensive validation),
                 settings.js (volume, FX, telegraph, hell-mode toggle)
  assets/art/    sprite ASCII packs — palette, atlas builder, base
                 sprites.js, *_hd / *_hd2 / *_xhd / *_hd3 / smooth_walk
                 variants, hd_promote.js (loads LAST)

main.js          bootstrap — wires engine + systems + renderer + UI; state
                 machine: title / mapselect / charselect / arcanaselect /
                 playing / levelup / legendary / paused / shop / gameover
loadout.js       per-run weapons / passives / spirits / meta / arcana /
                 derived modifiers (recompute folds them all)
progression.js   piecewise quadratic XP curve (softCap 10)
choices.js       level-up roll + apply (weapon-new/up, passive-*, spirit-*,
                 heal; weighted sampling without replacement)
achievements.js  recordRun + checkAchievements (mid-run + end-of-run)
meta.js          shop upgrade application (COST_SCALE inflation included)
```

## Key Architectural Patterns

### 1. Asset HD promotion (load-order critical)

Base sprite keys (`mage_walk`) are defined in `sprites.js`. HD variants live
in separate packs (`heroes_hd.js`, `heroes_smooth_walk.js`, etc.). The
**last** import — `hd_promote.js` — re-aliases base keys to the best HD
variant via a PROMOTE map, so the renderer / characters.js / weapons.js
never reference HD keys directly.

**Critical**: `hd_promote.js` must be imported **after** every `*_hd*` pack.

To add HD art for an existing key: write a pack file (`heroes_xxx.js`) that
adds `window.SPRITES['key_xxx'] = [...]`, then add `key: 'key_xxx'` to PROMOTE
in `hd_promote.js`. Never edit `characters.js`/`weapons.js` sprite keys.

### 2. Renderer-side composite sprites

Fused spirits (steam / oberon / frostbolt / verdant) and the parked
necromancer reuse existing sprites via runtime canvas composition:

- **Fused spirits**: two layers (base + accent), `globalCompositeOperation =
  'screen'` blend (see `systems/spirits.js` `act` + `renderer.js`
  `compositeTexture`).
- **Necromancer**: mage frames + `multiply` dark-purple wash + `source-atop`
  sickly-cyan accent (`renderer.js` `spriteTexture` early branch).

No new pixel art needed for these; data alone configures the composite.

### 3. Self-contained world entities (spirits + minions)

Both `systems/spirits.js` and `systems/minions.js` spawn entities into
`world.entities` (visible to renderer / spatial hash) but are inert to other
systems. Spirits orbit the player and act on cooldown (heal / shield /
attack). Minions walk toward the nearest enemy and attack via melee or
homing projectile. Neither reads/writes loadout state.

### 3b. Per-sprite rotation offset

`src/util/spriteAngles.js` maps sprite keys (e.g. `proj_arrow`,
`proj_leg_arrow`) to a base rotation offset. The renderer applies
`atan2(vy, vx) + spriteBaseAngleFor(name)` so sprites authored pointing
UP render correctly when moving horizontally. Without the offset, arrow
sprites flew "lying down" — the literal "누워서 간다" visual bug.

To add a new sprite that points up: add `'sprite_key': -Math.PI / 2`
to the SPRITE_BASE_ANGLES map. Don't change the renderer.

### 3c. Player active signature (spacebar)

`systems/active.js` runs the spacebar-fired character ultimate. Per-hero
data lives in `content/signatures.js`. All 7 active heroes have a
signature:

- mage → `meteor_storm` (kind: 'meteor', auto-aim 5 meteors)
- knight → `holy_beam` (kind: 'beam', 3 vertical light pillars + solar flare)
- warrior → `earth_crack` (kind: 'self', single self-centered AoE + magma burst)
- huntress → `arrow_rain` (kind: 'arrows', 12 small arrows)
- porta → `tesla_field` (kind: 'beam', 5 electric pillars, recolored cyan)
- gennaro → `blade_volley` (kind: 'arrows', 16 dagger rain — brass+crimson palette)
- pasqualina → `rune_barrage` (kind: 'meteor', 6 arcane runes — violet+cyan Graphics fallback)

**Level scaling** (`scaleSignature(sig, level)` in `systems/active.js`):
signatures grow with `player.level` — radius +2%/lvl (cap +85%), damage
+4%/lvl (cap +150%), cooldown −1.2%/lvl (cap −40%), count +1 per 8 lvls
(cap +5, only for `count > 1` sigs so warrior `earth_crack` stays one big
quake). Driven by level, not `damageMult`, so the no-crit/no-proc "clean
burst" in `applyAoE` stays intact. `state.scaledRadius` feeds the renderer
(telegraph + impact visuals match the damage footprint); `state.cdTotal`
feeds the HUD radial. The balance harness never fires signatures, so this is
a pure player-experience buff with no measured-balance impact — tune the
`SIG_*` dials at the top of `active.js`. Per-hero SFX: optional `castSfx /
dropSfx / impactSfx` fields override the `meteor_*` default.

State machine: `idle → telegraph → falling → idle (cooldown)`. The
renderer exposes `drawActive(state)` and main.js calls it each frame
with `active.getRenderState()` — see also the `activeLayer` Graphics
layer and `activeSpriteLayer` Container for PixelLab PNG sprites.

**Ultimate cast triggers attack animation**: `drawActive` tracks
`lastActivePhase`; on the `idle → telegraph` transition it sets
`playerAttackUntil = elapsed + ULTIMATE_ATTACK_DUR` (0.8s). This is the
**only** trigger for attack frames — weapon fire no longer overrides
the walk/idle cycle. The hero plays its attack PNG cycle while the
signature winds up, then resumes idle/walk. Edge-detect runs once per
cast, not continuously while telegraph holds.

HUD slot (`hud-active` in ui/hud.js) appears bottom-right only when the
hero has a signature. Cooldown is a radial counter-clockwise swipe.

### 3d. PixelLab PNG asset bridge

PixelLab-generated PNG sprites for signature effects live in
`public/sigs/` (Vite serves them at `/sigs/*`). The registry
`src/util/sigAssets.js` maps logical asset keys to URL(s) — single-frame
or multi-frame animation. Renderer's `pngTexture(url)` does manual
image loading (PIXI v8's `Texture.from(URL)` is lazy/async, so we use
`new Image()` + canvas → `Texture.from(canvas)` for synchronous render
once loaded). PNG fails or still loading → drawActive falls back to
Graphics primitives.

To add a new signature asset:
1. Download PNG(s) to `public/sigs/`
2. Add an entry to `SIG_ASSETS` in `sigAssets.js`
3. Reference the key as `meteorAsset` or `impactAsset` on a signature in `signatures.js`

### 3e-i. PixelLab hero sprites (idle + walking + attack)

`src/util/heroAssets.js` maps sprite names (`mage_walk`, `knight_walk`,
`warrior_walk`, `huntress_walk`, `porta_walk`, `gennaro_walk`,
`pasqualina_walk`) to per-direction sprite data. Necromancer was
removed (concept mismatch with VS roster); its PNGs stay on disk under
`public/heroes/necromancer_*` as inert assets. The codebase uses
east/west only (VS-style flat 2D side view via `pickDirectional`).
Each direction has:
- `idle`: static rotation PNG (used when stationary)
- `walk`: 8-frame array (used when moving, cycled by `elapsed * fps`)
- `attack`: N-frame array (used briefly when player fires a weapon)
- `fps`: walking cycle playback rate
- `attackFps`: attack cycle playback rate (faster, ~14fps)

`applySprite` in `renderer.js` calls `heroAssetUrl(name, dir, elapsed,
moving, attacking)`. State priority: attacking > moving > idle. The
attack pulse is purely renderer-side: when `bucketProjectiles.length`
rises (player just fired), `playerAttackUntil` is set for 0.32s. Plus
a small scale "punch" + idle "breathing" pulse (sin wobble) for life.

Source assets:
- `public/heroes/<hero>_<dir>.png` — static rotation (idle pose)
- `public/heroes/anim/<hero>_<dir>_<0..7>.png` — 8 walking frames
- `public/heroes/atk/<hero>_<dir>_<0..N>.png` — N attack frames

Attack frame counts vary by template animation and hero identity:
- knight: 3 frames (lead-jab — sword thrust, shorter for snappier feel)
- mage / porta / pasqualina: 6 frames (fireball / spell cast)
- warrior: 7 frames (surprise-uppercut — axe smash)
- huntress / gennaro: 7 frames (throw-object — throw)

When switching attack templates, update both the declared frame count
in `heroDir(...)` AND delete orphan frame PNGs (e.g. `knight_*_3.png..
knight_*_5.png` after a 6→3 swap), otherwise the renderer cycles
through stale assets.

Signature ultimate cast extends the attack window via
`ULTIMATE_ATTACK_DUR = 0.8s` (vs. `ATTACK_PULSE_DUR = 0.32s` for a
weapon fire). A 6-frame animation at `attackFps: 14` plays in ~0.43s,
fitting comfortably inside the 0.8s ultimate window. A 3-frame
animation plays in ~0.21s — a quick, snappier jab — and loops if the
window stays open.

To add a new hero PixelLab sprite:
1. Download east + west static rotations to `public/heroes/`
2. Animate via `mcp__pixellab__animate_character` (template_animation_id)
3. Extract walking + attack frames from the character ZIP
4. Add an entry to `HERO_ASSETS` in `heroAssets.js` (use `heroDir(hero, dir, attackFrames)`)

### 3e-i.5. PixelLab enemy / boss sprites

`src/util/enemyAssets.js` maps enemy sprite keys (from `content/bestiary.js`)
to east/west PNGs in `public/enemies/`. Renderer's `applySprite` branches
on `e.type === 'enemy'` before the ASCII outline path — so even bosses
registered in enemyAssets use the PixelLab art (no red outline overlay).

Phase 1 ships static rotations only — 8 common enemies (walker, runner,
bat, spider, wolf, goblin, imp, wisp) + 3 bosses (skeleton king, werewolf
king, bog witch). Walking animation can be added later via the same
idle/walk/fps shape used in heroAssets.

To add a new enemy:
1. Download east + west PNG to `public/enemies/<key>_<dir>.png`
2. Add to `ENEMY_ASSETS` in `enemyAssets.js` (use `enemyDir(key)` helper)

### 3e-ii. PixelLab projectile sprites

`src/util/weaponAssets.js` maps weapon sprite names (from
`content/weapons.js`) to PNG URLs in `public/projectiles/`. The renderer
checks `weaponAssetUrl(e.sprite)` for projectiles before the ASCII path
and applies the same `spriteBaseAngles` rotation that ASCII projectiles
use.

To add a new projectile PNG:
1. Download PNG to `public/projectiles/<spriteName>.png`
2. Add to `WEAPON_ASSETS` in `weaponAssets.js`
3. If the PNG points up (not right), add to `spriteAngles.js` PROMOTE map

### 3e-iii. PixelLab Wang tilesets (per-biome floors)

Floor rendering has TWO paths in `engine/renderer.js`:

1. **ASCII path** (legacy): `spriteTexture(tileFor(cx, cy), 0)` — picks a
   sprite name from the map's `tiles: [...]` bag.
2. **PNG Wang path**: when a map declares `pngTileset: 'dungeon'`, the
   renderer loads `/tilesets/dungeon.png` (64×64 sheet, 4×4 grid of 16×16
   tiles), splits it into 16 `Texture` sub-rects, and indexes by
   `cellHash(cx, cy) % 16`.

Per-biome tilesets live in `public/tilesets/` and are registered in
`src/util/tilesets.js`. Six biomes are wired in: dungeon / forest /
swamp / lava / ice / void — matching the 6 chapters in `content/maps.js`.

To add a new biome tileset:
1. Download Wang PNG to `public/tilesets/<biome>.png`
2. Add to `TILESETS` in `tilesets.js`
3. Set `pngTileset: '<biome>'` on the map entry in `maps.js`

The PNG tint is `0xd8d4dc` (very mild) so the PixelLab colour reads
through; the ASCII path uses `0xa6a2b2` (heavier darken) to mute the
hand-authored tiles.

### 3e-iii.5. Inlaid floor bands (VS-style 장식 바닥 띠)

Maps declare an optional `inlaidBand: { tile, rowInterval }` field to stamp an
ornate tile stripe every N rows — VS Inlaid-Library의 건축적 floor 리듬. Every
map (ch.1–5) uses one:

```js
// content/maps.js
inlaidBand: { tile: 'tile_nat_crypt_medallion', rowInterval: 6 },
```

- `tile` — sprite key for the band row (biome-themed ornate tile)
- `rowInterval` — every Nth world row becomes a band (6–8 typical)

**Rendering** (`renderer.js` `updateFloor`, ASCII path only): a cell is a band
when `((cy % rowInterval) + rowInterval) % rowInterval === 0` (safe modulo —
`cy` can be negative). The band tile takes the same zone tint as the floor, so
one strip reads differently per zone (graveyard green / colonnade ivory / …).
`setMap` reads `map.inlaidBand` into `activeInlaidBand`. Bands are NOT applied
on the PNG Wang path (all current chapters use the ASCII path).

Per-biome band tiles: dungeon `tile_nat_crypt_medallion` (6), swamp
`tile_nat_swamp_planks` (7), volcano `tile_nat_volcano_ember` (8), ice
`tile_nat_sanctuary_inlay` (7, 재활용), void `tile_void_rune` (7). The
swamp/void band+variety tiles are PixelLab 192px objects downsampled to 16px
in `tiles_vs_extra.js`; volcano/ice reuse existing ASCII variants.

To add a band: pick/author an ornate tile key, set `inlaidBand` on the map.
No renderer change — it's data-driven via `activeInlaidBand`.

### 3e-iv. PixelLab ground-zone PNGs (장판)

Weapons with `aoe` or `pull` patterns drop a placed damage zone — these
get an animated PixelLab overlay on top of the Graphics zone disc. Three
zone assets live in `public/zones/`:

- `zone_meteor` — 9-frame burning crater (aoe pattern default)
- `zone_thunder` — 4-frame lightning starburst (frames 0-3 only; 4-7
  drift colour, looped subset stays "blue lightning")
- `zone_vortex` — 8-frame spinning purple void spiral (pull pattern default)

Registered in `sigAssets.js` alongside the signature impact assets. The
renderer adds a pooled `zoneSpriteLayer` Container above the Graphics
`zoneLayer`; `drawZoneSprites(bucketZones)` runs every frame and renders
the PNG centered on each zone projectile that has `e.groundAsset` set.

Wiring in `systems/weaponFire.js`:
- `pattern === 'aoe'` → `groundAsset: def.groundAsset || 'zone_meteor'`
- `pattern === 'pull'` → `groundAsset: def.groundAsset || 'zone_vortex'`

Per-weapon override via `def.groundAsset` in `content/weapons.js` for
weapons that want a different aesthetic (e.g. ice weapon could point at
`zone_vortex` for the swirling chill). Phase 1 ships defaults only.

For huntress arrow_rain signature: `impactAsset: 'arrow_impact'` (7-frame
dust burst, 48×48). Renderer's existing impactAsset path (line ~852 in
`renderer.js`) reads it for the per-arrow ground hit.

### 3f. Sky-drop weapon FX (telegraph → fall → impact)

Cosmetic visual overlay for `aoe`, `rain`, or `pull` pattern weapons.
Damage timing is unchanged (zone projectile still spawns immediately and
pulses on rehit) — the sky-drop layer adds telegraph → falling body →
impact burst on top so the cast reads as "thing fell from the sky and
made this burning patch" instead of the disc appearing instantly.

**Pipeline:**

1. `engine/skyDropFx.js` — pure state machine (telegraph → fall → impact
   → idle). Owns no state. Caller passes a state object that the helpers
   mutate. Same state shape used by `systems/active.js` (player signature
   ultimate) and `systems/weaponSkyDropFx.js` (weapon AoE overlay).
2. `systems/weaponSkyDropFx.js` — instance pool. `spawn({x,y,kit})` adds
   one in-flight FX; `update(dt)` ticks all; `getRenderInstances()` for
   the renderer.
3. `systems/weaponFire.js` — AoE/pull/rain branches emit
   `events.emit('aoeCast', {x,y,kit,weaponId})` when `def.aoeKit` is set.
   Opt-in — weapons without `aoeKit` behave exactly as before.
4. `main.js` — `events.on('aoeCast', ...)` subscribes and calls
   `weaponSkyDropFx.spawn(...)`. Update loop ticks; render path calls
   `renderer.drawWeaponSkyDropFx(weaponSkyDropFx.getRenderInstances())`
   after `drawActive(...)` so weapon FX appends on top of the active
   layer without clearing it.
5. `engine/renderer.js` `drawWeaponSkyDropFx(instances)` — mirrors
   `drawActive` but reads from `kit.*` palette instead of `sig.*`. Each
   stage falls back to Graphics primitives when the PNG asset key is
   missing or still loading.

**`aoeKit` schema** (in `content/weapons.js` weapon def):

- `telegraphTime`, `fallTime`, `impactFxLife` — phase durations (seconds)
- `radius` — telegraph ring footprint (px)
- `telegraphAsset`, `dropAsset`, `impactAsset` — optional PNG keys in
  `sigAssets.js` (`assetFrameUrl(key, elapsed)`)
- Palette colors (fallback when assets missing): `telegraphRing`,
  `telegraphFill`, `telegraphRune`, `meteorOuter`, `meteorCore`,
  `meteorHighlight`, `meteorSpec`, `meteorTrail`, `shadow`,
  `impactCore`, `impactMid`, `impactArcane`
- `impactScale`, `dropScale` — render-time multipliers
- `rainSkipDrop: true` — for rain-pattern weapons whose projectile
  IS the falling body; suppresses the synthesized drop sprite

For the 19 expansion weapons (everything beyond the 6 wedge weapons that
ship with PNGs), use the `aoeKitFor(theme, radius, opts)` helper at the
top of `weapons.js` instead of writing out the full palette. Themes:
`fire / holy / ice / lightning / shadow / arcane / nature / physical /
void`. Example: `aoeKit: aoeKitFor('lightning', 132, { telegraphTime: 0.55 })`.

**Arsenal hover preview**: `ui/arsenal.js` builds a CSS-only animated
preview (`.ars-preview-tele/drop/impact` keyframes in `style.css`) per
weapon card. aoeKit weapons cycle telegraph → fall → impact; non-aoeKit
weapons show the projectile sprite with a pattern-themed motion.

### 3e-v. Zone-aware map system (zones + zoneTints + ambient)

Maps in `content/maps.js` carry more than tiles + enemy pool. Zone-aware
fields subdivide a biome into distinct "동네" with their own tint, decor
bias, and giant landmark:

- `zones: [...]` — zone names shuffled across region clusters
- `zoneTints: { default, <zone>: { tint } }` — per-zone floor tint
- `zoneClusterSize` (default 4) — regions per cluster. forest=3 (빽빽),
  dungeon/swamp/volcano=4, ice=5, void=6 (광활)
- `ambient: { vignette: 0.3-0.5, fog: 'light'|'heavy' }` — edge vignette +
  drifting fog particles

`structureField.zoneAt(rx, ry, zones, clusterSize)` deterministically maps
region to zone via hash. Blueprints in `rooms.js` tagged with `zone:` filter
into matching clusters. zone당 3-4 blueprint (거대 1 + 일반 2-3), 거대
prop은 `fixed: true` 옵션으로 anchor 고정 (jitter/skip 비적용).

`ROOM_SCALE = 5` → region 2400×1350 px. `setMap(map)` 단일 인자로 모든
field 전달 (renderer + movement 동일 시그니처).

### 3e-vi. Floor decor scatter (procedural details)

`engine/renderer.js`의 `decorLayer`가 floor 위에 작은 detail sprite를
~12% cell 밀도로 deterministic scatter. 7종 procedural canvas:
0=pebble, 1=grass, 2=crack, 3=leaf, 4=ember, 5=snowflake, 6=star.

zone 별 bias 85%: `ZONE_DECOR_PREF` map (`renderer.js`)에 zone → decor
인덱스 매핑. graveyard=grass, lava-flow=ember, frost-cavern=snowflake,
void=star 등. 같은 cell hash는 항상 같은 decor — 시각 일관성.

새 biome zone 추가 시:
1. `maps.js`에 `zones`/`zoneTints` 항목
2. `renderer.js` `ZONE_DECOR_PREF`에 zone → 0~6 인덱스
3. `rooms.js`에 zone-tagged blueprint

decor 새 kind 추가 (7+): `makeDecorTexture(kind)` switch에 분기 추가 +
`decorTextures` array 길이 늘림.

### 3e-vii. PixelLab structure / prop sprites (rooms.js bridge)

room blueprint prop (`content/rooms.js` `structures[]`)의 `name`은
`structureAssetUrl()` (in `src/util/structureAssets.js`)으로 PNG URL 확인 →
있으면 PNG, 없으면 ASCII fallback (`window.SPRITES`).

```js
// src/util/structureAssets.js
export const STRUCTURE_ASSETS = {
  prop_giant_tombstone: '/structures/prop_giant_tombstone.png',
  prop_tombstone_hd: '/structures/prop_tombstone_hd.png',
  // ... 26+ props across 6 chapters
};
```

PNG는 `public/structures/`에 배치 — Vite 정적 자산 `/structures/*`.

blueprint entry:

```js
{ name: 'prop_giant_tombstone', x: 240, y: 110,
  radius: 24, scale: 1.6, fixed: true }
```

- `radius` — collision 반경 (default `STRUCT_RADIUS=21`)
- `scale` — TILE_SCALE 곱 (default 1.0, 거대 1.3~2.4)
- `fixed: true` — 거대 landmark anchor 고정 (skip/jitter 비적용)

새 prop 추가:
1. PixelLab `create_object` (size 48 일반 / 96 거대)
2. PNG 다운로드 → `public/structures/<name>.png`
3. `structureAssets.js` `STRUCTURE_ASSETS`에 등록
4. `rooms.js` blueprint에 sprite key 사용
5. PNG 로드 실패 시 ASCII fallback이 자동 — render 코드 변경 0

`weaponAssets.js` 패턴 미러 — 동일한 PNG/ASCII fallback path.

### 3e-viii. Level-up slot system (build freedom dial)

Level-up presents 3 picks from a weighted candidate pool (`src/choices.js`
`rollChoices`). The pool sizes are gated by two constants:

- `WEAPON_SLOTS = 5` — max distinct weapons (was 4 pre-2026-05-22)
- `PASSIVE_SLOTS = 5` — max distinct passives (was 4 pre-2026-05-22)

Once a player owns `WEAPON_SLOTS` weapons, `weapon-new` candidates stop
appearing; same for passives. Spirit slot (`SPIRIT_SLOTS` in
`content/spirits.js`) is independent.

**Slot count is coupled to balance**. Expanding slots (4→5 e.g.):

1. **Build dilution** — players spread weapons thinner → per-weapon DPS
   drops → weak builds can't keep up with monster scaling.
2. **`scripts/balance.js` autoPick heuristic** — was tuned for prior
   slot count. Slot 5 expansion needed `weapon-new` priority drop
   80→65 so it picks 4 weapons then levels them instead of greedily
   filling all 5.
3. **`config.js` `hpPerMinute` / `hpPerLevel`** — monster scaling
   needs to soften with slot expansion. Slot 4→5 needed
   `hpPerMinute 0.32→0.24` + `hpPerLevel 0.045→0.030` to recover
   1/5 survive 10:00 baseline.

When changing slot count: run `node scripts/balance.js` + 5 in-game
runs across diverse hero/arcana combos to confirm survival
distribution. Expect bipolar distribution post-expansion (strong
builds become stronger, weak builds become weaker — two peaks is
normal, not a regression).

### 3e-ix. PixelLab buff aura halos (rotating PNG overlay)

Aura weapons (`pattern: 'aura_buff'` in `content/weapons.js`) grant timed
modifiers into `loadout.buffs` (existing potion-buff fold path). 5 weapons
ship with PixelLab PNG halo overlays as of Batch 23: `arcane_field,
warcry_pulse, wrath_focus, holy_blessing, garlic_aura`.

**Pipeline:**

1. `content/weapons.js` — aura_buff weapon def includes `buff:{...}`,
   `duration: <s>`, and optional `assetKey: 'buff_X'` to opt-in to PNG.
2. `src/util/buffAssets.js` — registry mapping `buff_X` → `{frames, fps}`
   (mirrors weaponAssets / sigAssets schema). 64×64 5-frame PNGs in
   `public/buffs/`.
3. `systems/weaponFire.js` — aura_buff branch pushes
   `{...def.buff, life, source, color, assetKey}` into `loadout.buffs`.
4. `engine/renderer.js` `drawBuffHalo(playerEnt, buffs)` — called every
   frame. Two render layers:
   - **Graphics circles** (always): two concentric rings + soft fill,
     pulsing alpha on `sin(elapsed * 3.2)`, staggered radii per buff.
   - **PNG sprite** (optional): pool of 8 Sprites in `buffHaloSpriteLayer`
     Container, above the Graphics layer. Active when `b.assetKey` is set
     and `pngTexture(buffAssetUrl(key, elapsed))` returns a loaded texture.
     Scaled to `targetDiameter / 64` (halo outer dia ÷ PNG size), rotated
     `elapsed * 0.6 rad/s`, alpha 0.85.

PNG load failure / not-yet-loaded → only Graphics halo renders (existing
stable fallback). Adding a new buff weapon with PNG halo:

1. Generate 5-frame 64×64 PixelLab animation
   (`create_1_direction_object` + `animate_object` with `floating gently`
   or `pulsing` verb).
2. Download frames to `public/buffs/buff_<name>_0..4.png`.
3. Register `buff_<name>: {frames: [...], fps: 10-14}` in `buffAssets.js`.
4. Add `assetKey: 'buff_<name>'` to the weapon def in `weapons.js`.
5. `weaponFire.js` aura_buff branch automatically propagates assetKey.

No renderer code change needed for new buffs — drawBuffHalo is data-driven.

### 3g. Enemy death dissolve (renderer clone death-pool)

When an enemy dies, the body crumbles to ash instead of vanishing. The
mechanic lives **entirely renderer-side** so the sim stays headless-testable
(the sim just `world.kill`s the entity + emits `kill`).

**Pipeline:**

1. `systems/damage.js` — the `kill` event payload includes `id: target.id`
   (added specifically so the renderer can find the dying sprite).
2. `main.js` `events.on('kill', ...)` — for non-boss kills calls
   `renderer.spawnEnemyDeath(id, x, y, { big })` (`big` for `elite` role or
   `miniBoss`). Basic mobs no longer spawn `fx_explosion` (read as a bomb, not
   a death); a small `fx_hit` spark stays for punch. Elites keep the burst.
3. `engine/renderer.js` `spawnEnemyDeath(id, x, y, opts)` — looks up the
   enemy's **live sprite** in the `sprites` map and **CLONES** its texture into
   a detached `deathLayer` pool, then ticks a dissolve in `updateDeaths(dt)`
   (called from `updateEffects`): tint `white→ash 0x9a9088`, alpha ease-out
   fade, upward drift, slight shrink, + grey ash particles (own pool).

**CRITICAL — clone, never reuse the pooled original.** A PixiJS Sprite can
attach to only one parent. The sim frees the entity immediately (reap) and its
pooled sprite slot is reused by a respawned enemy within the same/next frame.
If the dissolve animated the *original* sprite, the dying clone and a respawned
enemy would fight over the same object (position/tint/alpha flicker). So
`spawnEnemyDeath` does `new Sprite()` from `src.texture` and owns the clone for
the 0.38s window. See memory `renderer-death-pool-clone-sprite`.

**Timing**: `kill` fires during `collision.update` (before `world.reap()` and
before `render()`'s `sync()`), so the renderer's `sprites` map still holds last
frame's sprite — the lookup resolves. An enemy that spawns AND dies in one
frame (never rendered) has no sprite → `spawnEnemyDeath` no-ops gracefully.

**Tuning dials** (top of the death block in `renderer.js`): `DEATH_LIFE`
(0.38), `driftY`, ash count/scale, ash color, `DEATH_CAP`/`ASH_CAP`.
`setFxIntensity('low')` skips ash particles but keeps the cheap tint/fade.

### 4. Telegraph windows (boss + ranged)

`systems/enemyAbilities.js` introduces a `telegraph` field on enemies. When
their ability cooldown hits 0, instead of firing immediately, they queue
the cast (`castQueued`, `castDx/Dy`, `castPhase`) and set `telegraph > 0`.
While telegraphing, `movement.js` freezes them in place and `renderer.js`
`drawTelegraphs` draws a pulsing red ring scaled by remaining time.

To add a new telegraphed ability: queue inside the existing window pattern
(see `bosscast` branch), resolve in the `telegraph <= 0` block.

### 4b. Enemy behaviour archetypes (data-driven from bestiary)

Beyond charge/ranged/burst/bosscast, enemies carry behaviour via **three
bestiary.js row fields** that `spawn.js` (spawnSingle + spawnWave) copies onto
the entity — no per-enemy system code:

- `ability` — `summoner` (telegraph→spawn `summonType` adds, `SUMMON_CAP`
  lifetime), `shielded` (periodic `shieldT` barrier, 90% soak via the damage.js
  hook right after the freeze mult), `kamikaze` (windup→dash→detonate shrapnel
  ring + self-kill; intentionally bypasses the elite-only ranged tier gate),
  `buffer` (stamps `e.hasteT` on nearby allies — movement.js owns the decay so
  it self-expires + composes with status `speedMult`). One field, not an array.
- `movePattern` — `weave` (sine perpendicular; gate on `!(e.charging > 0)`, NOT
  `<= 0` — `undefined <= 0` is false so the branch silently never runs) or
  `orbit_strafe` (hold standoff ring, default R=150 — tuned to weapon coverage;
  220 made revenant ~2.7× baseline TTK because weapons miss a circling target).
- `summonType` — enemyType the summoner conjures.

`split` was tried + removed (2026-05-29). If you re-add a death-trigger effect,
put it in **damage.js's death block** (the shared seam run by BOTH main.js and
balance.js via collision), NOT the main.js `kill` event — balance.js has no
listeners so it would silently no-op in the harness.

**Formation waves**: `spawn.js spawnWave` arranges the rush pack into a shape
cycled by `waveCount % 4` — `wall / ring / sine_column / pincer` (bearing from
seeded rng). **Reaper**: a time-gated panic spawn (9:00, hell 7:00; +1 / 1.5min,
maxAlive 3; walker×40 HP, near-unkillable — run, don't fight).

**Enemy-ability SFX (`enemyFx` event)**: the sim is headless, so
`enemyAbilities.update(dt, world, player, events)` emits `events.emit('enemyFx',
{kind, x, y})` for kamikaze/summon/shield; `main.js` plays the SFX (audio.js
`kamikaze`/`enemy_summon`/`shield_up`) + a flourish. Mirrors the weapon-fire SFX
seam — never thread `audio` into the sim (signature-drift trap; see game-testing).

Balance can't be measured via `scripts/balance.js` (its kiter can't roll biome
pools — `/probe-monster-balance` isolation harness instead).

### 4c. Enemy status auras (renderer drawEnemyAuras)

`renderer.js drawEnemyAuras(bucketEnemies)` (own Graphics layer under sprites,
mirrors `drawTelegraphs`; called after it in the render loop) makes otherwise
invisible mechanics legible: `shieldT > 0` → cyan rune ring ("wait it out"),
`ability === 'buffer'` → orange aura ("kill first"), `enemyType === 'reaper'` →
red menace glow ("run"). Cosmetic only; honours the `telegraphVisible` toggle.

### 4d. Enemy sprite clip-key: 3-layer consistency

For an **ambient** enemy the renderer resolves art via `ENEMY_SPRITE[enemyType]`
(in renderer.js) — NOT `bestiary.sprite` (spawn.js doesn't set `e.sprite` on
ambient mobs; bosses DO set it, so theirs uses bestiary/spawn sprite). So a new
enemy's art needs the SAME clip key in **three** places or it silently falls
back to ASCII:

1. `renderer.js` `ENEMY_SPRITE[enemyType] = '<key>'`
2. `src/util/enemyAssets.js` `ENEMY_ASSETS['<key>'] = enemyDir('<fileprefix>')`
3. `content/bestiary.js` row `sprite: '<key>'` (kept consistent; used by bosses
   + the bestiary UI)

PixelLab pipeline (per `/integrate-enemy-asset`): `create_1_direction_object`
(view sidescroller, size 192 → single auto-kept candidate) → `sips -z 48`
downscale (96 for bosses) → `sips -f horizontal` west flip → `public/enemies/`.
Rotation URL is a fixed pattern (`backblaze.../objects/<account>/<id>/rotations/
unknown.png`) so a batch's URLs can be built without per-object `get_object`.

### 5. Save schema: defensive migration

`data/save.js` `loadSave()` validates every field with `??` fallbacks. When
adding a new persistent field:

1. Add default to `fresh()`
2. Add validated read to `loadSave()` (e.g., `d.newField === true` or
   `Array.isArray(d.newField) ? ... : []`)
3. Update `src/data/save.test.js` (4 `toEqual()` blocks)

Forget step 3 → tests fail. There's a `/sync-save-schema` command to
automate this; see `.claude/commands/`.

### 6. Audio polyphony guard

`util/audio.js` caps simultaneous voices at 16 and throttles identical
sounds to a 45ms minimum gap. The BGM engine (`setMusic('ambient'|'boss'
|'off')`) schedules a soft pulse on an interval, scaled by the user volume
setting. New sounds → add to the `SOUNDS` ZzFX-param map.

### 7. Hell mode (NG+) modifiers

`runEvent.hell` is the runtime flag. `startRun` snapshots it from the save
so a mid-run settings change won't take effect. Spawn.js multiplies HP by 2
and gold by 3 when `event.hell` is true.

**Build dilution on slot expansion**: monster scaling dials
(`hpPerMinute` / `hpPerLevel`) are NOT directly tied to slot count in
code, but they ARE coupled in practice. More slots → wider builds →
lower per-weapon DPS → weak builds die faster. After any slot count
change, retune via `node scripts/balance.js`. Note: `hpPerLevel` uses
`max(1, lvl × hpPerLevel)` so weak builds stuck at low level stay at
levelScale=1.00 — the **time dial (`hpPerMinute`) is the real lever**
for weak-build protection, not the level dial.

### 8. Mid-run achievement scan

`checkAchievements(runDelta)` synthesises a snapshot from `save.stats +
runDelta` and unlocks any newly-satisfied achievement, persisting + showing
toasts. Currently triggered on level-up and boss kill — see `main.js`
event handlers.

### 9. Meta progression — 대장간 (global forge, VS PowerUps model)

Permanent upgrades are **global** (apply to every hero) — there is no
per-character upgrade. (The old per-hero `heroLevels` +5%-damage buy in
charselect was removed 2026-05-29; `save.heroLevels` stays as a defunct
back-compat field.) `content/metaUpgrades.js` is a VS-aligned catalog across
4 categories (⚔️공격 / 🛡️방어 / 💰성장 / 🎲편의): Might·Amount·Cooldown·Area·
Speed·Duration·(crit·pierce game extras) / MaxHealth·Armor·Recovery·MoveSpeed·
Revival / Growth·Greed·Luck·Magnet·Curse / Reroll·Skip.

Each upgrade has `meta:{key:val}` (folded into `loadout.meta[k]` × level by
`applyMetaUpgrades` in `meta.js`, `COST_SCALE=1.5`) or `token:` (run economy).
Adding a stat = add `meta:{newKey}` + a `recompute()` consumer. Two new keys
this rework needed plumbing:
- **Speed** → `meta.projSpeed` → `loadout.projSpeedMult` (recompute) →
  `weaponFire.js` multiplies `def.speed * PROJ_SPEED_SCALE * projSpeedMult`.
- **Curse** → `meta.curse` → `player.curse` stamp in `main.js` (mirrors the
  `player.level` stamp) → `spawn.js` `hellMul = (hell?2:1) * (1 + player.curse)`
  (raises enemy HP AND count — more risk, more gold/xp).

`ui/shop.js` renders ALL categories on ONE page (no per-tab scroll; hero
roster panel removed) + a 초기화 (gold-refund) button (`refundAll` — refunds
current-catalog spend, wipes `save.upgrades`, also clears stale ids from an
older catalog). Missing icon keys fall back to a tier-colored rune glyph
(same as arcanaselect). The balance harness has no meta upgrades, so forge
changes don't affect measured balance.

## Content Extension Checklists

### Add a weapon

1. Define in `content/weapons.js` (basic in `WEAPONS`, add id to `BASE_WEAPONS`).
2. If new projectile sprite: add ASCII art to a `*_hd.js` pack + alias in `hd_promote.js`.
3. If pattern `'summon'`: fill minion fields (`minionSprite`, `minionHp`, `atkRange`, `atkInterval`, `attackType`).
4. If pattern `'bounce'` (or any fan/ring weapon that should reflect):
   set `bounceLeft` (typically 3–7) and `bounceInterval` (seconds, ~0.4
   for fast tracers). `systems/movement.js` reflects the projectile
   velocity 70–130° at random each interval and clears the hit list so
   the same enemy can be re-hit. Threaded through fan/ring spawn —
   no new pattern branch needed in `weaponFire.js`. Set `pierce: 999`
   if the projectile should pass through enemies between bounces.
5. If pattern `'aoe'` / `'rain'` / `'pull'`: (Optional) attach an `aoeKit`
   for sky-drop FX. Cheapest: `aoeKit: aoeKitFor('fire', radius)` —
   palette-only Graphics fallback. Premium: add PixelLab PNGs to
   `public/sigs/` + register keys in `sigAssets.js`, then set
   `telegraphAsset` / `dropAsset` / `impactAsset` in the kit. See
   section 3f. For rain weapons, add `rainSkipDrop: true` so the
   projectile itself is the falling body.
6. (Optional) Add evolution recipe in `content/evolutions.js` (basic + passive → legendary id).
7. (Optional) Add an integration test in `src/systems/weaponFire.test.js`.

### Add a passive

1. Define in `content/passives.js` (`maxLevel`, `desc`).
2. Update `loadout.js` `recompute()` — fold the passive level into a derived modifier.
3. (Optional) Add icon ASCII to `icons_passives.js`.
4. Add test in `src/loadout.test.js` to verify recompute applies it.

### Add an arcana

1. Define in `content/arcanas.js` — `bonus(meta)` applies static modifiers, `effect.onKill` adds an onKill hook, `effect.tag` sets a runtime flag (`loadout.arcanaTag`).
2. Optional unlock predicate (`unlock.check(stats)`). The picker filters out locked arcanas via `unlockedArcanas(stats)`.

### Add a hero

1. Define in `content/characters.js` (id, unlockChapter, sprite, starter, exclusive, bonus, 6 skills at L1/10/20/30/40/50).
2. Add an exclusive weapon to `EXCLUSIVE_WEAPONS` in `weapons.js`.
3. Add sprite — either fresh art or alias via a pack file + `hd_promote.js`.
4. Adjust `charselect.js` label logic if the unlockChapter introduces a new tier.

### Add a UI page

There's a `/wire-title-page` command — see `.claude/commands/`.

Manually: button HTML in `title.js`, click listener, `onX` callback exporter,
import in main.js, create in main.js, wire `title.onX(() => x.open(() =>
title.show()))`.

### Add / replace a PixelLab signature impact (자산 통합 파이프라인)

The arsenal page (`ui/arsenal.js` → 시그니처 섹션) is the **single verification
surface** for which signatures use PixelLab vs Graphics fallback. PixelLab
label on the card = `impactAsset`/`meteorAsset` set; faded "Graphics fallback"
label = missing. Use it before/after to confirm a swap landed.

Token-cheap promote loop (proven through `tesla_burst`, `gennaro_blood_splash`):

1. `mcp__pixellab__list_objects --status review` → find candidate by description
2. `get_object(id, include_preview=false)` — skip the 16-image preview block
3. `select_object_frames(id, [3,7,11,15])` — burst-style默认 균등분포 (birth →
   expand → peak → decay). If the description does not say "burst", inspect
   preview first.
4. `curl -sSfL "<frame URL>" -o public/sigs/<key>_<i>.png` for the 4 selected
5. `sigAssets.js` — add `<key>: { frames: [...4 paths...], fps: 12 }` (mirror
   the `knight_flare` shape; no special-case needed in the renderer)
6. `content/signatures.js` (or `content/weapons.js` for weapon impact) —
   set `impactAsset: '<key>'` / `meteorAsset: '<key>'` / `groundAsset: '<key>'`
7. `npx vitest run --reporter=basic` — 226 tests must pass
8. Open the arsenal page in browser → PixelLab label appears on that card

If no suitable PixelLab object exists, `mcp__pixellab__create_object` with
`directions=1, n_frames=16, size=48, view='low top-down'` queues a new
job (~30-90s) and you pick up at step 2. Cost: 20 generations per 16-pack.

**Signature differentiation rule:** signatures sharing the same `kind`
(e.g. huntress `arrow_rain` and gennaro `blade_volley` both `kind:'arrows'`)
must have **distinct `impactAsset` keys** so the arsenal preview reads as
different weapons. The bug fix this rule encodes: huntress + gennaro both
pointing at `arrow_impact` made the cards visually identical despite different
palette fields. See `.claude/rules/game-architecture.md` for the principle.

## Known Gotchas

1. **`hd_promote.js` must load last** — otherwise base sprite keys won't
   re-alias and the renderer uses low-res art.
2. **Save migration tests** — adding a field to `fresh()` requires updates to
   4 `toEqual()` blocks in `save.test.js`. The `/sync-save-schema` command
   automates this.
3. **`for (k in e) delete e[k]` deopts V8** — use `e[k] = undefined` instead
   on pooled entities (see `world.js`).
4. **Korean IME breaks WASD** — `input.js` checks `e.code` (`KeyA/W/S/D`) as
   a fallback for `e.key`. Necessary for any non-Latin layout.
5. **`location.reload()` flash** — on title→shop, reloading shows the empty
   playfield briefly. `openShop(fromResult=false)` uses local state instead.
6. **Renderer Graphics throttle** — minimap (every 4 frames) and zones
   (every 2 frames) skip redraw cycles. Don't 60fps everything.
7. **`structuresNear` cache** — invalidate on `setMap()` (clears the
   `propCacheCx/Cy`). Cache invalidation lives next to data source change.
8. **Result `critRate` = crits / hits** — `stats.hits` is incremented in
   `damage.js`. Don't compute as crits/kills (each kill takes multiple hits).
9. **`location.reload()` is reserved for shop-from-result** (dead world
   needs a fresh page). Title-to-shop uses state transition.
10. **AoE radius ↔ impactScale 짝지음** — `aoeKit.impactScale`은
    `drawWeaponSkyDropFx`에서 `scale = impactScale * (0.4 + 1.2 * t01)`
    로 적용 (peak at t01=1 → impactScale × 1.6). 48×48 PNG 기준 peak
    visual = `48 × impactScale × 1.6`. zone disc가 PNG에 자연스럽게
    감싸이려면 target ≈ `2 × radius` → `impactScale ≈ radius / 38.4`.
    radius 줄일 때 impactScale 같이 안 줄이면 임팩트 burst가 disc보다
    1.5~2배 커보임. Legendary는 의도적으로 더 크게 유지.
11. **Drop/gem 사이즈는 타입별 target px (direct ratio)** — `applySprite`에서
    blanket multiplier 대신 type별 target pixel size + 직접 비율
    `s = target / w` (floor 0.25). gem/potion/heart 12px, chest 18px.
    2026-05-22 이전엔 half-step 라운딩 (`Math.round(target/w*2)/2`)을 썼지만
    PixelLab 48×48 source + 16px target 시 closest 0.5 = 24px (50% 초과)
    문제 발생 → 제거. PixiJS nearest-neighbor scaleMode가 sub-pixel ratio도
    crisp 렌더링 (renderer.js `pngTexture` scaleMode='nearest'). PNG/ASCII
    양 경로 같은 target px 사용 — visual parity 보장.
12. **Magnet pull line alpha 0.12** — `drawMagnetLines`의 라인이 화면
    가로지르는 대각선 실선처럼 보이는 걸 막으려 0.4 → 0.12로 낮춤.
    더 줄이면 자석 효과 시각 피드백 사라지므로 0.10 이하는 비추.
13. **Dead sprite keys in `weaponAssets.js`** — `proj_wand`는 legacy
    starter sprite key지만 wand 무기의 실제 `sprite`는
    `proj_spell_arcane_swirl`. registry 추가 시 무기 def의 실제 `sprite`
    필드와 정확히 일치하는 키로 등록 (proj_<id> 추측 실패). 무기 제거 시
    `weaponAssets.js`의 해당 sprite 엔트리도 같이 정리 — 아니면 dead
    entry로 누적되고 무기고 audit 시 혼동.
14. **Projectile PNG scale: floor 1.0 / mult 2.5 / cap 2.0** —
    `renderer.js:1729` `applySprite` projectile PNG 분기 공식
    `s = round(radius * 2.5 / w * 2) / 2`, clamp [1.0, 2.0]. 2026-05-22:
    floor 0.85→1.0, mult 2.04→2.5, cap 1.5→2.0 bump — 작은 무기 +18%,
    중간 +50%, 큰 AoE +33%. half-step 라운딩 유지 (cap 2.0도 그리드 정렬).
    AOE/orbit 무기의 `e.radius`가 damage 영역이라 곱 시 sprite 부풀어
    over-upscale → cap 2.0이 막음. 작은 radius 무기(wand=6, arrow=4)는
    formula 0.51 등 산출 → floor 1.0에서 그대로 (잘 보이게).
    `aoeKit.impactScale`은 별도 multiplier(Gotcha #10 공식)로 그대로 작용.
15. **PixiJS v8 `.arc()` implicit chord** — Canvas 2D 시맨틱대로 `.arc()`는
    직전 geometry의 current point에서 arc start까지 implicit line을 추가한
    뒤 호를 그린다. `drawZones` broken-ring처럼 여러 `.arc()` 연속 호출하면
    예상치 못한 chord가 화면 가로지르는 노란 선으로 나타남 (`physical` 테마
    rune 색 `0xfff0c0` 매치). **fix**: 모든 `.arc()` 앞에 명시적
    `.moveTo(cx + r*cos(a0), cy + r*sin(a0))` 추가 (`renderer.js:1084-1102`).
    `.circle()`은 내부 moveTo 있어서 안전; partial `.arc()`만 위험.
16. **Hero/Enemy scale baseline 1.0** — `renderer.js` 영웅 PixelLab 경로
    `sp.baseScale = 1.0 + breathing + punch` (line 1823). 적 mult `4.9`,
    floor `1.0` (line 1772). ASCII fallback도 sync: player mult 3.7, enemy
    mult 4.9 (line 1866-1870). 2026-05-22 bump (player 0.85→1.0, enemy
    4.2→4.9) — 영웅:일반적 비례 ~1.42:1 유지하면서 전체 +17%.
17. **Early-death survivability levers (regen + bubble)** — 약빌드는 클리어
    용량 부족으로 스웜에 갇혀 간헐 chip 누적으로 ~3~4분에 죽음(희석 아님;
    iframe은 플레이어당 0.7s, 적은 walk-through). 두 레버로 완화:
    `PLAYER.regen` (config.js, 내재 재생 HP/s — loadout.recompute가 fold)
    + `PLAYER_BUBBLE` (collision.js, player↔적 분리 px — 적이 플레이어 위에
    못 쌓이게 eject). 24시드 스윕으로 짝지어 튜닝: 0.8/7→4분전사망 42%,
    **1.6/14→13%**(채택), 2.5/20→너무 쉬움. 한 번에 하나씩 바꿔
    `node scripts/balance.js 24`로 재측정. 메커니즘:
    `early-death-trapped-chip-mechanism` 메모리.

## Run Workflow

A typical iteration is `npm test -- --run && npm run build && $B goto …
&& $B screenshot`. The `scripts/dev-screenshot.js` script bundles this.

## Save / Schema Stability

Save fields added this codebase: `tutorialShown`, `discoveredFusions`,
`hellModeUnlocked`, `hellModeEnabled`, `runHistory[]`, `longestSurvival`.
Backward-compatible via `loadSave()` defaults.

## Future Extensions

- Necromancer hero (parked in `content/characters.js`; sprites await PixelLab).
- Daily challenge mode (seeded run + 24h leaderboard).
- Hero specialization tree (Lv30 branching).
- Chapter-specific BGM tracks.
- i18n English / Spanish.

See `~/.gstack/projects/game/` for design docs + balance philosophy.

## 문서 규약

사람이 읽는 문서(`README*.md`, `docs/**/*.md`)는 guk-lab 공통 규약을 따른다.
정본은 `~/sonix/toy/guk-lab-docs` — 복사하지 않고 가리킨다.

- 톤: `guk-lab-docs/STYLE.md` — 본문 습니다체, 헤드 요약·표 셀은 명사형,
  헤딩은 기술 명사구, 수치에는 측정 시점 병기.
- 다이어그램: `guk-lab-docs/harness/skills/doc-diagrams/SKILL.md` —
  `docs/diagrams/<name>.mmd` 가 정본, 색은 의미(core/view/store/external/tool),
  점선은 런타임 밖 경로에만.
- 브랜치·PR: `guk-lab-docs/playbooks/branching.md` — main 직접 커밋 금지,
  develop 에 쌓고 PR 로 합친다.
- `README.md` 를 고치면 `README.en.md` 도 같은 커밋에서 고친다.
