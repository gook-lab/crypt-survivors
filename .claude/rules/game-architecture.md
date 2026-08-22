# Crypt Survivors — Architecture Rules

Applies to: `src/**/*.js`

## Asset HD promotion (load-order critical)

The renderer never references HD sprite keys directly. Base keys
(`mage_walk`) are aliased to their best HD variant at boot time by
`src/assets/art/hd_promote.js`. **That file must be the last `*_hd*`-class
import in `main.js`** — otherwise base keys won't be re-aliased and the
renderer caches low-res textures.

Adding HD art: write a pack file that registers a new `window.SPRITES['key_xxx']`
entry, then add `key: 'key_xxx'` to PROMOTE in `hd_promote.js`. Do not edit
`characters.js` / `weapons.js` / `bestiary.js` sprite keys to point at the
variant — promotion handles it.

## Runtime composite sprites

Fused spirits (steam, oberon, frostbolt, verdant) and the parked necromancer
reuse existing sprites via canvas composition:

- Fused spirits — two layers (`sprites[]` + `accentSprites[]`) blended with
  `globalCompositeOperation = 'screen'` (see `engine/renderer.js`
  `compositeTexture`). Set `fused: true` + define `accentSprites[]` in
  `content/spirits.js`; the renderer handles the rest.
- Necromancer — mage frames + `multiply` dark-purple wash + `source-atop`
  cyan accent (`spriteTexture` branch when `name.startsWith('necro_')`).

No new pixel art is needed for these; data alone configures the composite.

## Self-contained world entities (spirits + minions)

`systems/spirits.js` and `systems/minions.js` spawn entities into the
world but are inert to other systems. Spirits orbit the player and act on
cooldown (heal / shield / attack). Minions walk toward the nearest enemy
and attack via melee or homing projectile. **Neither reads/writes loadout
state.**

When extending, follow the same pattern — own your entities, expose
nothing.

## Telegraph windows

`systems/enemyAbilities.js` introduces `telegraph` + `castQueued` on
enemies. When their ability cooldown hits 0, they queue the cast instead
of firing — `telegraph > 0` freezes movement and draws a pulsing red ring
(scale follows remaining time). The cast resolves when telegraph reaches 0.

When adding a new ability that should "tell" before firing, queue in the
same shape (`castQueued = 'newkind'`, `castDx/Dy = aim`, then resolve in
the `telegraph <= 0` branch).

## Enemy projectile tier gate

Only `elite` / `boss` / `miniBoss` enemies may fire projectiles. A
basic-role enemy with `ability: 'ranged'` (legacy data, mod, or copy-paste
mistake) is silently neutralised in `systems/enemyAbilities.js`:

```js
if (e.tierAllowsShots === undefined) {
  const role = BESTIARY[e.enemyType] ? BESTIARY[e.enemyType].role : 'basic';
  e.tierAllowsShots = role === 'elite' || !!e.boss || !!e.miniBoss;
}
if (!e.tierAllowsShots) {
  e.abilityCd = 9999; // dormant — never fires
  continue;
}
```

The role is read from `content/bestiary.js` via `BESTIARY[enemyType].role`.
Result is cached on the entity (`e.tierAllowsShots`) so the lookup runs
once per spawn, not once per frame.

The same gate is applied to **on-death burst projectiles** in `main.js`:
`events.on('kill', ...)` checks role + `miniBoss` before scattering
`spawnEnemyShot` rounds. Basic enemies still play `fx_explosion` on death
(visual feedback) but never spawn damage shots. The `kill` event payload
includes `miniBoss` for this reason.

When adding a new enemy: pick `role: 'basic' | 'elite' | 'boss'` in
`bestiary.js`. The mini-boss spawner in `systems/spawn.js` stamps
`miniBoss: true` on entities — keep that flag on the entity, not the
bestiary row.

## Weapon removal protocol

When deleting a weapon from `content/weapons.js`:

1. Remove weapon def from `WEAPONS` map
2. Remove `id` from `BASE_WEAPONS` / `EXCLUSIVE_WEAPONS` / `LEGENDARY_WEAPONS`
3. Remove evolution recipes referencing it in `content/evolutions.js`
   (both `from:` and `to:` directions)
4. Remove its sprite entry from `src/util/weaponAssets.js` and
   `src/util/spriteAngles.js` if present
5. Remove skill tree block at bottom of `weapons.js` (the `weaponSkills`
   map — search for `<id>: [`)
6. Update `weaponFire.test.js` if test enumerates the weapon by id
   (e.g. the `Phase 1 + v2 new weapons all have skill trees` block)
7. Run `npm test -- --run`

Skipping step 4 leaves dead PNG entries in the registry (no error, just
clutter). Skipping step 5 leaks the skill array as orphaned data.

Use `/validate-sprite-keys` after to verify nothing references the
removed sprite key.

## Buff aura system (aura_buff weapons + PNG halos)

`aura_buff` weapons stamp `loadout.buffs` entries instead of spawning
projectiles. `weaponFire.js` push shape:

```js
loadout.buffs.push({
  ...def.buff, life: def.duration,
  source: '__buff_' + def.id,
  color: def.color || 0xffffff,
  assetKey: def.assetKey || null,  // optional PNG halo
});
```

`renderer.js` `drawBuffHalo(playerEnt, loadout.buffs)` paints two layers
per active buff:

1. **Graphics circles** (always): outer + inner ring + soft fill, pulsing
   alpha on `sin(elapsed * 3.2)`. `r = 36 + 8 * pulse + i * 6` so multiple
   buffs read as concentric stacks (offset 6px per index).
2. **PNG sprite overlay** (when `buff.assetKey` set): pool of 8 Sprite
   objects in `buffHaloSpriteLayer` Container above the Graphics layer.
   Reads `pngTexture(buffAssetUrl(key, elapsed))` for the current frame,
   scales `(outerRadius + 6) * 2 / 64`, rotates `elapsed * 0.6 rad/s`,
   alpha 0.85. PNG fail → Graphics alone (existing fallback).

The `assetKey` field is **only** propagated from `def.assetKey` through
`weaponFire.js`. No system code needs to know about it — the renderer
reads it directly off the buff entry.

When adding a new aura_buff weapon:

1. Define `pattern: 'aura_buff'`, `buff: {...}`, `duration: N` on the def.
2. Optionally add `assetKey: 'buff_<name>'` for PNG halo opt-in.
3. If using PNG: download 5 frames to `public/buffs/buff_<name>_0..4.png`
   and register in `src/util/buffAssets.js` with `{frames, fps}` schema.
4. No renderer or weaponFire change needed — both are data-driven.

When adding a 9th simultaneous buff slot: bump `BUFF_HALO_POOL = 8` in
`renderer.js` (currently caps PNG overlays at 8 — Graphics circles still
render past that, but PNG sprite is skipped).

## Recompute-only passives (no system code required)

Passives split into two camps. **Recompute-only** passives fold into
`loadout.recompute()` without reading live frame state — they multiply
or add to values that existing consumers already read. **System-coded**
passives need new code in `systems/` or hooks in `damage.js` /
`status.js` to fire on game events.

Recompute-only examples (build-freedom expansion 2026-05-22):

- `fortune` → `loadout.luck += 0.12 * lvl` (damage.js:139 already reads
  loadout.luck for drop chance — no new code).
- `wisdom` → `loadout.xpGainMult *= 1 + 0.10 * lvl` (gem pickup already
  multiplies XP by xpGainMult).
- `regen2` → `loadout.regen += 0.3 * lvl` (regen tick system already
  reads loadout.regen).
- `pierce_passive` → `loadout.pierceBonus += lvl` (weaponFire already
  applies pierceBonus to projectiles).

Non-examples (these LOOK like recompute candidates but aren't):

- `barrier` (shield stacks every 5s, damage.js consumes one stack on
  hit) → needs a shield-regen tick system AND a damage.js hook. Plain
  `loadout.barrierStacks = lvl` does nothing because no system reads it.
- `chill` (every hit applies `status_slow` to the target) → needs
  damage.js to call `applyStatus(e, 'slow', stacks)` per hit. Plain
  `loadout.chillSlowMul` does nothing because no system reads it.

**Decision rule for new passive**: "does any existing system already
read the field I'd derive in recompute?" If yes, recompute-only. If no,
plan the system code or hook BEFORE adding the passive — otherwise it
ships as "defined but inert" and the bug is silent.

**Verification**: write a `loadout.test.js` test that sets the passive
level and asserts the derived field is correct. The test catches
recompute drift but NOT inert-system bugs — those need an integration
test against the actual consumer (damage.js, status.js, etc.).

## Save schema migration

`data/save.js` `loadSave()` validates each field with `??` fallbacks. When
adding a new persistent field:

1. Add default to `fresh()`
2. Add validated read to `loadSave()` (defensive — handle missing or
   wrong-type values)
3. Update `src/data/save.test.js` (4 `toEqual()` blocks must match)

Step 3 is easy to forget; use `/sync-save-schema` to automate it.

## Audio polyphony guard

`util/audio.js` caps simultaneous voices at 16 and throttles identical
sounds to a 45ms gap. The BGM engine (`setMusic('ambient'|'boss'|'off')`)
schedules a soft pulse on an interval, scaled by `volume` setting.

When adding sounds, define the ZzFX param array in the `SOUNDS` map. Do
not call `zzfx(...)` directly elsewhere.

## Weapon fire SFX (event-based — sim computes the key, renderer plays it)

Weapon fire sound is **selected sim-side, played renderer-side** so the
simulation stays headless and `weaponFire.update()`'s signature never changes
(avoiding the documented `balance.js` drift trap — see `game-testing.md`).

**Pipeline:**

1. `systems/weaponFire.js` `fireSoundFor(def)` — a PURE function returning a
   ZzFX key string (or `null` for silence). Archetype derived from the weapon:
   `kind === 'melee'` → `fire_swing`; `pattern` aoe/pull/rain/aura_buff →
   `fire_cast`; boomerang → `fire_throw`; physical fan/ring/orbit → `fire_throw`;
   else → `fire_shot`. A weapon may set `def.fireSfx` (incl. `null`) to override.
2. On a successful fire, the existing `events.emit('fire', {x, y, muzzle,
   action, fireSfx})` carries the key in the payload — it never plays audio.
3. `main.js` `events.on('fire', …)` calls `audio.play(fireSfx)` (the renderer
   side already owns `audio`). The 16-voice cap + 45ms per-name throttle keep
   five auto-firing weapons from tearing the mix.

**Why event-based, not injected:** threading `audio` into `weaponFire.update()`
would change its arity, and `scripts/balance.js` calls the same factory — a
forgotten sync silently degrades the harness (the recurring drift incident).
The `fire` event already exists and already routes to `main.js`, so a payload
field is zero-risk. The same discipline keeps spirit/minion/active SFX out of
the sim. Add a new archetype: add its ZzFX array to `SOUNDS` + a branch in
`fireSoundFor`. No renderer or main.js change needed.

## Hell mode (NG+) modifiers

`runEvent.hell` is the runtime flag, snapshotted from `save.hellModeEnabled`
at `startRun`. A mid-run settings change does not take effect.
`spawn.js` reads it via the `event` parameter and multiplies enemy HP by 2,
damage by 2, gold by 3.

When adding difficulty modifiers, stack them on top of the hell multiplier,
not parallel to it.

## Mid-run achievement scan

`achievements.js` exposes `checkAchievements(runDelta)` — folds current
run progress onto save stats, unlocks newly-satisfied achievements,
persists save, returns the fresh list. Currently triggered at level-up +
boss kill in `main.js`.

When adding a new achievement that should pop mid-run, just add its
predicate to `CHECKS`. The scan path is automatic.

## Render-side player-feedback signals (detection + cue, not a sim event)

Boss-encounter cues and low-HP feedback are **pure render-side detection +
feedback**: the sim already computes the underlying state (HP, `castPhase`);
`main.js`'s render loop detects the crossing and fires a cue (audio + shake +
FX + toast) without touching game logic or the harness.

**Pattern** (see the boss scan in `main.js`):

1. **Detect** — in the per-frame entity scan (after `update`), track a
   singleton flag that records the highest event already fired
   (`seenBoss`, `bossPhaseSeen`, `seenMini`).
2. **Edge-detect** — compare against the freshly-computed state
   (e.g. `bossPhaseSeen` 1→2→3 at `boss.hp` 66% / 33% thresholds, matching
   `enemyAbilities.js` `castPhase`). Fire only when it climbs.
3. **Cue** — `audio.play(...)` + `addShake(...)` + `renderer.spawnFx(...)` +
   `toast.show(...)`, then update the flag so it fires once per crossing.

**Existing signals:** boss intro (`seenBoss` → `boss_intro` + shake + name
toast), boss phase escalation (`bossPhaseSeen` → `boss_phase` growl + 13px
shake + `fx_explosion` + flash + "페이즈 전환" toast), mini-boss intro
(`seenMini` → `mini_intro`), low-HP vignette (`low-hp` body class + heartbeat).

**Singleton-reset discipline:** `bossPhaseSeen` resets to 1 in the boss-intro
block (new boss) so the pooled entity slot can't carry a stale phase into the
next boss; `seenBoss`/`seenMini` clear when no such entity is present.

**Why render-side:** the threshold check is deterministic every frame, so the
sim never needs to emit a `'phaseTransition'` event — that would add signatures
to enemy systems + `balance.js` plumbing for a purely cosmetic cue. Keeping it
in `main.js` leaves the sim/harness untouched. New cue → add a singleton flag +
an edge-detect branch in the scan; zero sim change.

## Ultimate attack animation trigger

Player attack animation (`playerAttackUntil` in `engine/renderer.js`) is
triggered **exclusively** by the spacebar signature ultimate cast — no
longer by weapon fire. Auto-fired weapons fire every cooldown cycle, and
gating attack frames on projectile spawn meant the hero was almost always
in attack pose, masking the walk/idle cycle. Decoupling the two leaves
walk/idle readable during gameplay and reserves attack frames for the
deliberate signature wind-up.

**Signature ultimate cast** — when the active state transitions
`idle → telegraph`, `drawActive(state)` edge-detects via a cached
`lastActivePhase` and sets `playerAttackUntil = elapsed + ULTIMATE_ATTACK_DUR`
(0.8s). The pulse fires once per cast, not every frame the telegraph holds.

The 0.8s window lets the hero's attack PNG cycle play through its full
N-frame loop while the telegraph rings flash, then the cast resolves and
the hero returns to idle/walk. For 3-frame animations like knight's
lead-jab, the loop cycles ~3 times during 0.8s at attackFps:14 — reads
as a flurry rather than a single jab.

`ATTACK_PULSE_DUR` (0.32s) still exists as a constant — used by the
scale "punch" calculation in `applySprite` so the hero scales by +5% at
the start of the attack and settles. Not the trigger.

When adding a new signature kind: nothing required for the attack
animation trigger — it fires automatically on the state transition.

## Hero sprite PNG paths — base key vs directional key

Hero rendering has TWO independent sprite paths with **different key
conventions**. Mixing them silently falls back to the wrong path.

1. **PixelLab PNG path** (`src/util/heroAssets.js`)
   - `HERO_ASSETS` keys are **base sprite names**: `'knight_walk'`,
     `'mage_walk'`, `'porta_walk'`, etc.
   - `heroAssetUrl(baseName, dir, elapsed, moving, attacking)` resolves
     to a directional PNG URL like `/heroes/knight_east.png` (or walk
     frame from `/heroes/anim/`, attack frame from `/heroes/atk/`).
   - Wins when the PNG is loaded — renderer returns early before ASCII.

2. **ASCII / canvas-frames path** (`src/assets/art/*.js` packs)
   - `window.SPRITES` keys are **directional**: `'knight_walk_east'`,
     `'knight_walk_west'`, etc.
   - `pickDirectional(SPRITES, name, e)` transforms a base name like
     `'knight_walk'` into the matching directional key based on `e.vx`.
   - Fallback path when no PNG is registered or PNG hasn't loaded yet.

**The critical bug to avoid** (renderer.js applySprite player branch):
The `name` variable inside `applySprite` is the OUTPUT of `pickDirectional`,
so it is already directionalized (`'knight_walk_east'`). If you pass that
to `heroAssetUrl`, `HERO_ASSETS['knight_walk_east']` is `undefined` and
the function returns `null` — the PNG branch silently misses and the ASCII
fallback runs.

Always pass the BASE name to `heroAssetUrl`:

```js
if (e.type === 'player' && e.sprite) {
  const baseName = e.sprite;          // 'knight_walk' (NOT 'knight_walk_east')
  let heroUrl = heroAssetUrl(baseName, e.facing || 'east', ...);
  // ...
}
```

When extending the hero sprite system: register new heroes in
`HERO_ASSETS` by their base key only. The east/west variant is selected
by the `dir` parameter, not by appending to the key.

**PNG branch facing update — pickDirectional bypass trap.** The PNG
branch returns BEFORE `pickDirectional()` runs (it's the early-return at
the top of `applySprite`). And `pickDirectional()` is the ONLY place
`e.facing` gets updated based on `e.vx`. So when a hero uses the PNG
path (heroAssetUrl returns a URL), facing must be updated inline before
reading it — otherwise the hero is frozen on its initial direction.

This was a real regression after `heroes_vs.js` was deleted: the removal
of `window.SPRITES['<hero>_walk_east']` entries made `pickDirectional()`
early-return (line 85), and porta/gennaro/pasqualina forever faced
'east'. The fix lives in the PNG branch of `applySprite`:

```js
if (e.type === 'player' && e.sprite) {
  const baseName = e.sprite;
  // pickDirectional() is bypassed for PNG path — update facing here.
  if (Math.abs(e.vx || 0) > 0.05) {
    e.facing = (e.vx > 0) ? 'east' : 'west';
  }
  let heroUrl = heroAssetUrl(baseName, e.facing || 'east', ...);
}
```

When adding a new PNG-rendered entity type (not just heroes): if its
render branch returns before `pickDirectional()`, mirror the same
inline facing update or it will get stuck on the initial direction.

## Renderer asset load verification — performance API caveat

`performance.getEntriesByType('resource')` does NOT register image loads
made via `new Image()` with `img.crossOrigin = 'anonymous'`. The
renderer's `pngTexture(url)` cache (renderer.js ~line 530) uses exactly
this pattern, so the resource timing API will appear empty even when
PNGs are loading correctly.

When verifying that a hero/projectile/signature PNG is reaching the
renderer, use one of:

- DevTools Network tab (source of truth for all fetches)
- `fetch(url).then(r => r.status)` (works for same-origin)
- Inline `console.log` injected into `pngTexture` itself
- Inspect the `pngTex` Map directly via dev console

Do NOT use `performance.getEntriesByType` for hero/projectile PNG
verification. It will produce false negatives that send debugging in
the wrong direction.

## Renderer debug logging — env-flag gated console output

For renderer-internal debugging (which texture is selected, why a branch
was missed), the convention is **one-shot console.log gated on a window
flag**, not a permanent log. Example:

```js
if (!window.__dbg && condition) {
  window.__dbg = 1;
  console.log('[dbg] applySprite player baseName=', baseName);
}
```

This logs once per session (when the condition first holds), so the
console doesn't get flooded across 60fps render loops. Remove the entire
`if (!window.__dbg)` line before committing — these are session-scoped
diagnostics, not permanent code.

Toggle is implicit: a fresh page load resets the flag, so the next time
the condition holds the log fires once again. No need to clear via dev
console.

When adding multiple one-shot logs in the same session, use distinct
flag names (`__dbg1`, `__dbg2`, etc.) so they don't shadow each other.
When adding a hero attack template with non-default frame count, ensure
`attackFps` covers the loop within 0.8s (a 14-frame animation at fps:14
takes exactly 1.0s — wouldn't loop, which is fine).

## Signature visual differentiation

Signatures in `content/signatures.js` share rendering paths by `kind`:
- `kind: 'arrows'` — huntress `arrow_rain` AND gennaro `blade_volley`
- `kind: 'beam'`   — knight `holy_beam` AND porta `tesla_field`
- `kind: 'meteor'` — mage `meteor_storm` AND pasqualina `rune_barrage`

Same `kind` ≠ same look. Each signature MUST set distinct asset keys
(`impactAsset` / `meteorAsset` for the relevant kind) so the heroes feel
visually different. Sharing `arrow_impact` between `arrow_rain` and
`blade_volley` shipped once and read as identical effects in the arsenal —
that is the failure mode this rule prevents. Palette fields alone
(`arrowColor`, `arrowTip`, `arrowFletch`) are not enough; the PNG burst
sprite dominates the visual.

When adding a new signature on an existing `kind`: generate or pick a
distinct PixelLab asset whose palette matches the hero's identity (gennaro
→ crimson `gennaro_blood_splash`, huntress → parchment+green `arrow_impact`,
porta → electric yellow `tesla_burst`) and wire it through `impactAsset`
per the pipeline in CLAUDE.md "Add / replace a PixelLab signature impact".

The arsenal page (`ui/arsenal.js` 시그니처 섹션) is the verification surface:
each card shows `PixelLab` or faded `Graphics fallback` so coverage gaps
are visible at a glance. Use it before AND after a swap.

## Random world events

Every ~90s, `main.js` `tickRandomEvents()` rolls one of three flavour
events: treasure flock, gem rain, twin trouble. Triggers are
self-contained (toast + direct spawn). No separate scheduler.

To add an event: add a roll branch + spawn block in `tickRandomEvents`.
Don't introduce a new event-bus channel — keep it local.

## State machine (main.js)

States: `title / mapselect / charselect / arcanaselect / playing / levelup
/ legendary / paused / shop / gameover`. The loop gates `update(dt)` on
`state === 'playing'`. `render()` runs in every state.

Transitions to title (`returnToTitle()`) must hide every transient modal
(levelUp, evolution, gacha) + clear `low-hp` and `hell-mode` body classes
+ set music to 'off'. Otherwise stale overlays persist.

## setMap signature (single-argument map object)

`renderer.setMap(map)` / `movement.setMap(map)` accept the full map object
from `content/maps.js`. The map carries `tiles`, `rooms`, `pngTileset`,
`zones`, `zoneTints`, `zoneClusterSize` (default 4), `ambient`. Production
callers in `main.js` pass full map:

```js
renderer.setMap(map);
spawn.setMap(map);
movement.setMap(map);
```

`movement.setMap()` tolerates an Array (treats as `rooms`) for backward
compatibility. When adding a new map field: extend the entry in `maps.js`,
unpack in the relevant `setMap()` branch. Don't re-introduce positional-arg
drift (`setMap(tiles, rooms, pngTileset)` style).

## Structure field visual variety (skip + jitter)

Room blueprints in `content/rooms.js` are stamped deterministically across
the world. To prevent verbatim repetition, `structuresNear()`
(`util/structureField.js`) applies two per-region variations:

1. Skip ~25%: `propHash % 4 === 0` drops the prop. Different regions drop
   different props (regionHash + propIndex hash).
2. Jitter ±12px: non-fixed props shift `dx, dy = ±12`. Collision matches
   the jittered position — movement + renderer call the same function.

Both opt out for `fixed: true` props — giant landmarks always stamp at
the design-grid anchor. Set `fixed: true` only for zone centerpieces or
exact-position decorations.

## Structures are impassable for player AND enemies

`movement.js`의 player branch와 enemy branch가 **같은 `structuresNear` +
push-out 로직**을 공유한다. 적도 prop을 통과하지 못한다 — 던전 기둥
뒤에 숨거나 좁은 통로를 막을 수 있어 전술적 의미가 생긴다.

- player: 입력 후 `mapRooms.length > 0` 분기에서 한 번 resolve.
- enemy: seek (player 방향) + pull zone 이동 후 같은 resolve. 매 tick
  per-enemy `structuresNear` 호출 — 비용 우려 시 spatial hash로 캐싱
  검토 (현재는 region cluster size 4 → near-set이 작아 OK).

projectile은 prop을 무시 — 화살이 묘비를 통과하는 게 게임 느낌상 자연스러워서.

새 entity type을 추가하고 prop collision이 필요하면 같은 6줄 블록
(`mapRooms.length > 0 && near.length` 루프)을 그 분기에도 미러링. radius는
entity별로 다르니 `e.radius || 12` fallback 잊지 말 것.

## Zone-aware collision + visual parity

`zoneAt(rx, ry, zones, clusterSize)` is called by renderer (tile tint,
decor pick, `updateProps`) **and** movement (`structuresNear` prop
collision). They must agree, so `structuresNear` accepts `zones` +
`clusterSize` and movement.js's `setMap(map)` extracts `mapZones` +
`mapClusterSize`.

When adding a new zone consumer (e.g. zone-specific spawn): flow both
zones + clusterSize, never one alone — otherwise collision/visual
mismatch.

## Floor decor scatter

`renderer.js` `decorLayer` overlays small detail sprites (~12% cell
density, 7 procedural canvas kinds: pebble/grass/crack/leaf/ember/
snowflake/star). zone bias 85% via `ZONE_DECOR_PREF` map.

decor는 collision 없음 — 시각만. 새 zone 추가 시 `ZONE_DECOR_PREF`에
zone 이름 → decor 인덱스 (0-6) 매핑 한 줄 추가. 새 decor kind 추가 (7+):
`makeDecorTexture(kind)` switch 분기 + `decorTextures` 길이 늘림.
