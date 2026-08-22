---
description: Integrate a PixelLab 1-direction enemy sprite into the game — download east, downscale, flip to west, place in public/enemies/, and register in enemyAssets.js + bestiary.js + config.js. Mirrors the prop/signature pipelines but handles the east/west directional pair.
---

# /integrate-enemy-asset <enemy_key> <object_id-or-png-url>

`enemyAssets.js` needs **east + west** PNGs per enemy (no auto-mirror). For
side-profile enemies the west sprite is just the east flipped horizontally, so
generate ONE direction in PixelLab and flip the rest here.

This is the enemy analogue of `/integrate-pixellab-asset` (which targets
signature/weapon `sigAssets`, single-frame, no flip).

## Inputs

- `enemy_key` — the bestiary key, e.g. `bone_archer`. The sprite clip field
  convention is `<key>_walk` / `<key>_run` / `<key>_fly` (see existing entries).
- A PixelLab **object_id** (preferred — generated via
  `create_1_direction_object`, `view: 'sidescroller'`, size 192 → 1 candidate
  auto-kept, no review dance) OR a direct east PNG URL.

## Steps

1. **Get the east PNG.** If given an object_id, poll until complete then read
   the rotation URL:
   ```
   mcp__pixellab__get_object(object_id, include_preview=false)  # → rotations.unknown URL
   ```
   Download + downscale to the enemy size (48 common / 64–96 big), then flip for
   west (macOS `sips`):
   ```bash
   DEST=public/enemies
   curl -sSfL "<east-rotation-url>" -o /tmp/e.png
   sips -z 48 48 /tmp/e.png --out "$DEST/<enemy_key>_east.png"
   sips -f horizontal "$DEST/<enemy_key>_east.png" --out "$DEST/<enemy_key>_west.png"
   ```
   Read both PNGs to eyeball them (PixelLab objects have transparent bg — fine
   for enemies; verify the subject faces RIGHT in east).

2. **Register the directional pair** in `src/util/enemyAssets.js` (keyed by the
   sprite clip name, NOT the bare enemy key):
   ```js
   <enemy_key>_walk: enemyDir('<enemy_key>'),
   ```

3. **Bestiary row** in `src/content/bestiary.js` (if not present): set
   `sprite: '<enemy_key>_walk'`, `role`, `ability`, `blurb`. The sprite field
   must match the enemyAssets key from step 2.

4. **Stat row** in `src/config.js` `ENEMIES` (if not present): `speed, radius,
   maxHp, damage, xp, gold, color`. spawn.js does `ENEMIES[name]` — a missing
   row throws, so wire stats BEFORE the enemy can roll in a map pool.

5. **Map pool** — add the key to a map's `enemies` (basic) or `elites` (elite)
   in `src/content/maps.js`. Keep tier appropriate (a 150hp ranged elite in the
   starter chapter is too much — see the chimera/ch.1 note).

6. **Verify**:
   ```bash
   npx vitest run --reporter=basic        # 254+ tests must pass
   npm run build
   # serve check
   for d in east west; do curl -s -o /dev/null -w "<enemy_key>_$d %{http_code}\n" \
     http://localhost:7153/enemies/<enemy_key>_$d.png; done
   ```
   Optionally `/run-qa-snapshot <stage>` and confirm no `[atlas] missing sprite:
   <enemy_key>_walk` console warning.

## Gotchas

- **east/west are separate files** — no mirror at runtime. Flip with `sips -f
  horizontal`; confirm east faces right (walker_east is the reference).
- Missing sprite key → `renderFrame` returns a 1×1 transparent canvas (invisible
  enemy, one `[atlas] missing sprite` warning) — no crash, but silently blank.
- `balance.js` does NOT use map pools (fallback walker/brute) — a new enemy
  won't show in the harness. QA it in-game.
- Generate at size 192 (`> 170` → single auto-kept candidate) to skip the
  multi-candidate review; downscale on download.
