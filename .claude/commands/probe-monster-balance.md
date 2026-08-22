---
description: Isolation TTK probe for new biome monsters the kiting balance harness can't roll — spawns one monster type vs a real mid-game loadout and measures time-to-clear against baselines (walker/elite/brute) to surface tanky/evasive/flooding outliers.
---

# /probe-monster-balance [enemy_key ...]

`scripts/balance.js`'s kiting AI can't survive a real biome roster (wiring a
real map collapses it to 0/24 — see memory `balance-harness-kiter-cant-handle-biomes`).
So new biome monsters get **no automated balance signal**. This probe fills that
gap: it spawns ONE monster type in isolation against a realistic auto-firing
loadout and measures **time-to-clear**, comparing to baselines. Outliers = tune.

This is the codified version of the throwaway harness used to catch the
`revenant` orbit_strafe kiting outlier (memory `monster-isolation-balance-probe`).

## Inputs

- `enemy_key ...` — bestiary keys to probe (default: every key with a non-null
  `ability` or a `movePattern`, plus baselines `walker`/`elite`/`brute`).

## Steps

1. **Write a throwaway probe script** to a temp file in the project root (so the
   relative `./src/...` imports resolve), then `node` it and delete it. Shape:

   ```js
   import { createWorld } from './src/engine/world.js';
   import { createRngStreams } from './src/util/rng.js';
   import { createEvents } from './src/engine/events.js';
   import { createLoadout } from './src/loadout.js';
   import { rollChoices, applyChoice } from './src/choices.js';
   import { createMovement } from './src/systems/movement.js';
   import { createWeaponFire } from './src/systems/weaponFire.js';
   import { createCollision } from './src/systems/collision.js';
   import { createDamage } from './src/systems/damage.js';
   import { createStatus } from './src/systems/status.js';
   import { createEnemyAbilities } from './src/systems/enemyAbilities.js';
   import { FIXED_DT, PLAYER, ENEMIES, DIRECTOR } from './src/config.js';
   import { BESTIARY } from './src/content/bestiary.js';

   // mid-game loadout: createLoadout + 16× autoPick (mirror scripts/balance.js
   // autoPick scoring: evolve 100 / weapon-new 65 / multi 72 / might 62 /
   // weapon-up 55 / else 50/10)
   // enemy HP reference: hpAt(base, min=4, lvl=20) using DIRECTOR.hpPerMinute/hpPerLevel
   // probe(key): spawn batch=12 on a ring, god-mode player (hp pinned 1e7,
   //   stationary), run 30s ticking movement→enemyAbilities(…,events)→
   //   weaponFire→collision→status→reap, record time-to-clear + peak enemy count.
   ```

   Key details (match production call signatures — see memory
   `balance-js-missing-systems` / `balance-js-createdamage-signature`):
   - `createRngStreams(seed)`; monkeypatch `Math.random` → `streams.motion.next()`
     for the run, restore after (determinism — memory `balance-harness-nondeterministic`).
   - `createDamage(streams.combat, loadout)` — never no-arg.
   - `enemyAbilities.update(dt, world, player, events)` — pass `events` (summoner/
     kamikaze/shield emit `enemyFx`; harmless if unused).
   - Build the entity like `spawn.js spawnSingle`: copy `ability`, `movePattern`,
     `summonType` from the bestiary row; set `abilityCd` low so abilities fire.

2. **Run** and print a table: `type | kills | cleared(s) | peak entities`.

3. **Interpret** — baselines walker/elite/brute clear ~2.8-3.8s. Flag:
   - `cleared` > ~2× the elite baseline → too tanky / too evasive (check if it's a
     movement pattern dodging weapon coverage, NOT just HP — that was the revenant
     bug: orbit `R` too large. Tune the standoff radius before the HP).
   - `peak` ≫ batch → summoner flooding (check SUMMON_CAP / ENEMY_SOFT_CAP).
   - reaper is intentionally tanky (walker×40) and tankier still at real 9:00+ HP
     scaling than the min4/lvl20 probe reference — don't "fix" it.

4. **Tune** the outlier's dial (config.js stat, or an ability/movement constant
   in enemyAbilities.js / movement.js), re-run the probe, confirm it lands in band.

5. `npm test -- --run` after any tune (locks the change), then delete the temp
   script.

## Gotchas

- The probe player is stationary + god-mode, so it measures CLEAR SPEED, not
  survivability. For survivability use in-game QA (`/run-qa-snapshot`).
- Movement patterns inflate effective TTK beyond HP math (weapons miss a moving
  target). Read the cause, not just the number.
- Do NOT wire a real map into `scripts/balance.js` to "fix" the coverage gap —
  it collapses the calibrated kiter floor (memory `balance-harness-kiter-cant-handle-biomes`).
