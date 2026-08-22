---
description: Validate ZzFX SOUNDS entries in src/util/audio.js — flag malformed param arrays (type/length), out-of-range values, and orphan keys (defined but never played), with dynamic-key awareness so per-hero signature SFX aren't false-flagged.
---

# /validate-zzfx-sounds

Audio bugs are **silent** — a wrong value at param position N plays a different
sound but never fails the build or a test, so it only surfaces in QA listening.
This command catches malformed/orphan `SOUNDS` entries at author time.

## What it reports

1. **Malformed param arrays** — entries in `SOUNDS` (`src/util/audio.js`) that
   are not arrays of numbers / empty slots, or are longer than the ZzFX
   parameter list (ZzFX takes ~20 optional params; **>20 = certain typo**).
   Note: ZzFX params are all optional, so a SHORT array (14–19) is normal —
   only non-numeric entries and over-length arrays are errors.
2. **Out-of-range warnings** — values well outside typical playable ranges,
   which usually mean a copy-paste / position-swap bug:
   - `param[0]` volume: typically `0.0–1.5` (master-scaled at play time)
   - `param[1]` randomness: `0–0.3`
   - `param[2]` frequency: `20–2000` Hz
   - `param[3]` attack / `param[5]` release: `0–1.5` s
   Flag outliers as warnings, not hard errors (legendary/boss cues run hot).
3. **Orphan keys** — `SOUNDS` keys never referenced anywhere. PNG-style dead
   weight, but also a hint a rename left a dangling sound. **Dynamic-key
   aware** (see below) so hero signature SFX are NOT false-flagged.
4. **Missing keys** — strings passed to `audio.play('…')` (or referenced as a
   `*Sfx` field) that have NO `SOUNDS` entry → silent no-op at runtime.

## Steps

1. Read `src/util/audio.js` — extract every key in the `SOUNDS` map + its param
   array. Check each array: all elements numeric-or-empty, length ≤ 20.
2. Build the "used keys" set from ALL of:
   - Literal `audio.play('<key>')` calls in `src/main.js`, `src/systems/*.js`.
   - Signature SFX in `src/content/signatures.js`: every `castSfx` / `dropSfx` /
     `impactSfx` value (these are played dynamically via
     `audio.play(sig.castSfx || 'meteor_charge')` etc. in `systems/active.js`).
   - Weapon `fireSfx` values in `src/content/weapons.js` + the archetype keys
     returned by `fireSoundFor` in `systems/weaponFire.js`
     (`fire_shot/throw/swing/cast`).
   - The fallback literals in `active.js` (`meteor_charge/drop/boom`).
   - BGM tracks in the `MUSIC_TRACKS` map (handled separately from `SOUNDS`).
3. Diff both directions:
   - `SOUNDS` keys ∉ used set → **orphan candidate** (annotate "verify — may be
     dynamic" if the key matches a `<hero>_(cast|drop|impact)` shape).
   - used keys ∉ `SOUNDS` → **missing** (hard error — silent no-op).
4. Print a Markdown table:
   ```
   | key | len | type ok | range warns | used? | verdict |
   ```
   then a summary line: `N sounds · M malformed · K orphans · J missing`.
5. Exit non-zero if any malformed param array or missing key is found; orphans
   and range warnings are advisory (exit 0).

## Dynamic-key awareness (false-positive guard)

Per-hero signature sounds (`knight_cast`, `warrior_drop`, `porta_impact`, …) are
NOT referenced by literal — they come from `signatures.js` fields read in
`active.js`. The command MUST harvest those field values (step 2) before
diffing, or it will wrongly flag all 18 hero SFX as orphans. Same for
`def.fireSfx` weapon overrides. When in doubt, mark a suspected-dynamic key
"verify" rather than "delete".

## Relation to other validators

- `/validate-sprite-keys` — same orphan/dead-entry shape, for projectile PNGs.
- `/validate-aoe-weapons` — field coordination within a weapon. Orthogonal.

## When to run

- After adding sounds (a hero/weapon batch typically adds several at once).
- Before a balance/QA pass, to rule out silent audio regressions.
- As a periodic maintenance audit after weapon/hero/enemy renames.
