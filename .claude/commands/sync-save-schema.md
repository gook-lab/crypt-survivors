---
description: Sync src/data/save.test.js toEqual blocks with the current fresh() schema
---

# /sync-save-schema

Every time a new field is added to `fresh()` in `src/data/save.js`, four
`toEqual()` blocks in `src/data/save.test.js` must be updated to match.
This command automates that sync.

## Procedure

1. Read `src/data/save.js` and extract the literal returned by `fresh()`.
   Note every field + its default value (in declaration order).
2. Format the shape as a single-line JS object literal matching the
   compact style the test file uses:
   ```
   gold: 0, goldLifetime: 0, upgrades: {}, unlockedChapters: 3,
   stats: { kills: 0, bosses: 0, crits: 0, damage: 0, runs: 0, maxLevel: 1, longestSurvival: 0 },
   achievements: {}, heroLevels: {}, tutorialShown: false,
   discoveredFusions: {}, hellModeUnlocked: false, hellModeEnabled: false,
   runHistory: [],
   ```
3. Read `src/data/save.test.js`. Identify the four `expect(loadSave(...)).toEqual({...})` calls.
4. Replace the object literal inside each `.toEqual({...})` with the
   updated shape.
5. Run `npm test -- --run src/data/save.test.js` and report whether the
   four save-related tests pass.

## Guard rails

- Do not touch any tests outside `save.test.js`.
- Do not change the `loadSave()` validation logic.
- If `freshStats()` is also being extended, recurse into it.
- If new fields require a non-trivial default (an object or array), keep
  the literal form (`{}`, `[]`) — don't expand into nested defaults.

## Output

A diff summary of `save.test.js` changes + the four test results.
