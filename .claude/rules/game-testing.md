# Crypt Survivors — Testing Rules

Applies to: `src/**/*.test.js`, `scripts/balance.js`

## Vitest discipline

- Run `npm test -- --run` before committing. 111+ tests across 19 files.
- Tests live next to source (`src/foo/bar.js` ↔ `src/foo/bar.test.js`).
- Coverage focus: `engine/`, `systems/`, `util/`, `content/` (data validation).
  UI files are exercised manually via gstack `$B`.

## Save schema migration tests

`src/data/save.test.js` has 4 `toEqual()` blocks that explicitly enumerate
every save field. **When a new field is added to `fresh()` in
`src/data/save.js`**, all 4 blocks must be updated. Forgetting any of
them fails the suite.

Use `/sync-save-schema` to automate this. Or `sed` pattern:

```bash
sed -i '' 's/maxLevel: 1 }/maxLevel: 1, newField: defaultValue }/g' \
  src/data/save.test.js
```

Each new field must also have a `loadSave()` validation test — old saves
without the field should not crash, they should get the default.

## Crit calculation

`stats.crits / stats.hits` is the correct crit-rate ratio. **Not** `crits
/ kills` (each kill takes multiple hits, inflating the value).

`stats.hits` is incremented in `damage.js` `apply()` on every damage
event. Any test that asserts on crit display must check the ratio uses
`hits`, not `kills`.

## Balance harness signature drift

`scripts/balance.js` must call system factory functions with the same
signatures as production (`src/main.js`). When a system gains a new
dependency (e.g., `createDamage(rng)` → `createDamage(rng, loadout)`),
**both** `main.js` and `balance.js` must be updated together.

Forgetting `balance.js` causes **silent degradation**: the harness runs
without errors but mechanics guarded by `if (rng && ...)` short-circuit.
damage.js's crit roll (`source && rng && source.critChance && ...`),
status proc (`source && source.proc && rng && ...`), and loot drop
(`rng && rng.next() < ...`) all silently disable. Survival metrics tank
and look like a real balance regression. Unit tests don't catch this
because `damage.test.js` / `collision.test.js` / `status.test.js` also
use no-arg `createDamage()` — the broken usage is shared.

**Known incidents:**
- `createDamage()` called without `rng, loadout` → no crits/procs/drops
  (memory: `balance-js-createdamage-signature.md`)
- `movement.setMap()` never called → prop collision inert
  (memory: `balance-js-skips-setmap.md`)
- Missing `system.update()` calls (not just signature drift). E.g. `active`,
  `spirits`, `minions`, `weaponSkyDropFx` may be wired in `src/main.js` but
  forgotten in `scripts/balance.js`. Mechanics deactivate silently — no
  crash, just lower survival metrics. Check every `*.update(...)` call in
  main.js's loop has a mirror in balance.js's loop in the same order.
  (memory: `balance-js-missing-systems.md`)

**Checklist when adding a system parameter:**

1. Update factory signature in `src/systems/<name>.js`
2. Update call site in `src/main.js`
3. Update call site in `scripts/balance.js` with identical args
4. Run `npm test -- --run` (won't catch drift on its own — tests share the
   no-arg pattern)
5. Run `node scripts/balance.js` — compare survival distribution against
   the healthy baseline (1–3 / 5 survive 10:00)
6. If suspicious, run `/validate-balance-harness` to diff signatures

## Balance harness

`node scripts/balance.js [N]` runs N seeds (default 5) × 10 minutes with a
kiting AI through the full sim (no renderer). Use after balance changes:

```bash
node scripts/balance.js        # 5 seeds + per-30s sample dump
node scripts/balance.js 24     # 24 seeds, distribution summary only
```

**Deterministic** (2026-05-29): the sim used unseeded `Math.random()` in hot
paths (weaponFire fan/scatter, movement bounce, active scatter), so the same
seed flipped survive↔die between runs — every prior balance conclusion was
partly noise. `runOnce` now monkeypatches `Math.random → seeded rng` (restored
after each run); same seed → identical result. Live-game untouched.
See memory `balance-harness-nondeterministic`.

Output: per-seed line (survival / Lv / kills / **gold** / peak levelScale) +
a distribution summary:
- `survived 10:00 : X/N` — full clears
- `died < 4:00 : X/N` — the early-death / bipolar tail (the metric that
  actually moves; see `early-death-trapped-chip-mechanism`)
- `median survival`, `gold/run (kill+survival, no goldMult)`

Healthy: ~20–60% survive 10:00, FEW early deaths, Lv 14–43, multiple weapons
in the damage chart. Single-seed dominance or a high early-death rate is a
regression signal — use 24 seeds for a reliable read (5 is noisy).

**Butterfly caveat**: the seeded rng stream is SHARED across the whole sim, so
changing any difficulty dial reshuffles all downstream randomness — two configs
are different random universes, not the same scenario at two difficulties.
A monotonic survivability buff (regen, bubble) trends reliably; a single
difficulty dial (hpPerMinute) A/B does NOT. Tune at 24+ seeds and read the
aggregate, not per-seed deltas.

## When adding a new weapon / passive / arcana

- Weapon → add an integration test in `src/systems/weaponFire.test.js`
  verifying the pattern doesn't crash and projectile counts match
  `projGrowth` expectations.
- Passive → add a test in `src/loadout.test.js` verifying `recompute()`
  folds the level into the derived modifier.
- Arcana → manual play test; no unit coverage required.
- Hero skill → add to `src/content/characters.test.js` `applySkill`
  block. Crit-bonus / on-kill / meta-fold paths each have an example.

## When breaking changes happen

Balance retunes (crit mult, base damage, shop scaling) ripple to:
- `src/content/characters.test.js` `applySkill` block (crit derived)
- `src/meta.test.js` `applyMetaUpgrades` block (vigor / might / armor)

Don't change these tests by re-running — assert the new intended
behavior. Half the value of these tests is locking in deliberate
balance choices.
