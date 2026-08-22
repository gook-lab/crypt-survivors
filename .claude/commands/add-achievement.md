---
description: Add a new achievement to content + CHECKS + (optionally) snapshot fields
---

# /add-achievement <id> <category> <tier> <name-ko> <target-ko> <icon> <predicate>

Adds an achievement across the two coupled files. Skips manual file
juggling that was the source of orphaned achievements (entry defined but
CHECKS missing = impossible to unlock).

## Arguments

- `id` — kebab_case identifier, must be unique
- `category` — one of `combat / hero / weapon / boss / mastery / meta / challenge`
- `tier` — `bronze / silver / gold / platinum`
- `name-ko` — Korean display name
- `target-ko` — Korean target description ("100마리 처치" etc.)
- `icon` — sprite key (use existing icon if possible)
- `predicate` — JS arrow function string, e.g., `(s) => s.kills >= 100`

## Procedure

1. **content/achievements.js** — add entry to the `ACHIEVEMENTS` array:
   ```js
   { id: 'X', category: 'Y', tier: 'Z',
     name: '한글이름', target: '한글타겟', icon: 'icon_key',
     blurb: '도전 설명.',
     reward: '+N G' },
   ```
   Insert in the matching category block (e.g., kills_* near other kill
   achievements).
2. **achievements.js** — add the predicate to `CHECKS`:
   ```js
   X: (s) => s.kills >= 100,
   ```
3. **If predicate references a new snapshot field**, warn the user and
   update the snapshot object in both `recordRun()` and
   `checkAchievements()`. Add a defensive `|| 0` for backward compat.
4. **Run `npm test -- --run`** and confirm 111+ tests still pass.

## Guard rails

- The predicate's `(s) => ...` arrow signature must match the existing
  CHECKS style.
- Bronze tier rewards 50–200 G, silver 300–800, gold 1000–3000, platinum
  4000+. Suggest reward by tier.
- If the new id already exists, abort and surface the conflict.

## Output

The two diff blocks + test result.
