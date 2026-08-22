---
description: Diff scripts/balance.js vs src/main.js system factory + update signatures — flag arity drift that silently degrades the sim (missing rng → no crits, missing loadout → no damage scaling, etc.).
---

# /validate-balance-harness

Cross-check `scripts/balance.js` ↔ `src/main.js` to surface signature drift between the headless balance harness and production. Drift is invisible at runtime — guards like `if (rng && ...)` short-circuit silently, and unit tests share the broken usage so vitest can't catch it.

## What it reports

1. **Factory arity drift** — calls like `createDamage()` in balance.js whose production counterpart `createDamage(rng, loadout)` passes more args. Each missing arg is a candidate silent-degradation source.
2. **Update arity drift** — `system.update(...)` calls (movement, weaponFire, collision, etc.) whose argument count differs between the two files.
3. **Missing setMap calls** — if balance.js imports a system that has a `setMap()` method (`movement`, `renderer`, `spawn`) and main.js calls it, balance.js should too.
4. **Suggested fixes** — for each drift, print the exact production-matching call to paste back into balance.js.

## Steps

1. Run `node scripts/lib/validate-harness.js` (see implementation below).
2. The script regex-extracts `const X = createY(...)` and `X.update(...)` from both files.
3. Compute per-symbol arity diff. Anything where balance.js arity < main.js arity is flagged.
4. Print Markdown table:
   ```
   | symbol | main.js call | balance.js call | drift | suggested fix |
   ```
5. Exit code 1 if any drift found, 0 if clean — pre-commit hook friendly.

## Known incidents this would have caught

- **`createDamage()` no-args** (memory: `balance-js-createdamage-signature.md`) — survival 5/5 dying 30-170s; 1-line fix restored avg to 167s.
- **`movement.setMap()` not called** (memory: `balance-js-skips-setmap.md`) — prop changes 0 sim impact, debugging sent in wrong direction.

## Relation to other validators

- `/validate-sprite-keys`, `/validate-aoe-weapons` — orthogonal, check content-data consistency.
- This is the only validator that compares two entry-point files for runtime parity.

## When to run

- After modifying any `src/systems/*.js` factory signature
- After adding a new `setMap`/init method to a system
- Periodically as a balance regression hunt prelude (before tuning weapons)
- As a CI / pre-commit hook (cheap, runs in <1s)

## Failure modes

- balance.js intentionally omits some production deps (e.g. minions, spirits, signatures, weaponSkyDropFx — none affect sim). The script's allowlist lives at the top of `scripts/lib/validate-harness.js`; add a symbol there if it's a legitimate omission.
- A renamed parameter (same arity, different meaning) won't be caught — arity diff only. For deeper checks, consider AST-based parsing (Babel) in a future iteration.
