---
description: Validate weapon sprite keys cross-reference between weapons.js and weaponAssets.js — report orphans (weapon without PNG) and dead entries (PNG without weapon).
---

# /validate-sprite-keys

Cross-check `src/content/weapons.js` ↔ `src/util/weaponAssets.js` to surface mismatches that silently fall back to ASCII or waste bundle size.

## What it reports

1. **Orphan weapons** — weapons whose `sprite` field has no matching key in `WEAPON_ASSETS`. These render as ASCII (functional but the player loses the PixelLab PNG).
2. **Dead PNG entries** — `WEAPON_ASSETS` keys that no weapon references. PNG ships in bundle but is never displayed. Common source: legacy sprite renames (e.g. `proj_wand` after wand weapon switched to `proj_spell_arcane_swirl`).
3. **Coverage summary** — % of weapons with PNG, broken down by tier (basic / exclusive / legendary).
4. **Suggested fixes** — for each orphan, either propose registering a PNG from PixelLab review/completed pool or accepting ASCII as intentional.

## Steps

1. Read `src/content/weapons.js` — extract every `sprite: 'proj_*'` value plus the owning weapon id and tier.
2. Read `src/util/weaponAssets.js` — extract every key in `WEAPON_ASSETS`.
3. Compute set diff both directions.
4. For orphans, query `mcp__pixellab__list_objects --status=completed --tags <sprite_key>` to see if a tagged asset already exists in the user's PixelLab pool (cheap fix — just download).
5. Print Markdown table:
   ```
   | sprite | weapon id | tier | status | suggested action |
   ```
6. Print coverage summary: `basic: X/Y · exclusive: X/Y · legendary: X/Y`.

## Relation to other validators

- `/validate-aoe-weapons` — checks aoeKit field coordination *within* a weapon (radius, impactScale, etc.). Orthogonal to this command.
- `/integrate-pixellab-asset` — the wire-up pipeline. Use this *before* integration to plan which sprites need work.

## When to run

- After bulk weapon removal/rename
- Before shipping a "PixelLab coverage" milestone
- Periodically as a maintenance audit (catches drift)

## Failure modes

- weaponAssets.js may legitimately have aliased keys (e.g. `proj_wand` + `proj_spell_arcane_swirl` both pointing at same PNG for backward compat). Don't flag aliases as dead — recognise by URL collision.
- Some weapons intentionally ship ASCII (e.g. frost_bolt was unwired due to PNG/name mismatch). Allow a `// intentional ASCII: <reason>` comment near the sprite field to suppress the orphan warning.
