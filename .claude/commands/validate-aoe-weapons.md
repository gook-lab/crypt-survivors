---
description: Lint AoE weapons in weapons.js for radius/aoeKit/impactScale consistency
---

# /validate-aoe-weapons

AoE-pattern weapons (`pattern: 'aoe' | 'pull' | 'rain'`) have THREE
fields that must stay coordinated when tuning:

1. `radius` — gameplay hitbox (zone disc damage area)
2. `aoeKit.radius` — telegraph + drop FX footprint (must equal #1)
3. `aoeKit.impactScale` — PNG impact burst size (visual peak = 48 ×
   impactScale × 1.6, target ≈ 2 × radius → `impactScale ≈ radius / 38.4`)

Drift happens because (2) is duplicated in inline aoeKit objects (5
weapons: holywater, firewall, divine_hammer, void_sphere, warhammer)
and (3) is easy to forget when nerfing radius. This command surfaces
both.

## Procedure

1. Read `src/content/weapons.js` and parse every entry whose `pattern`
   is `'aoe'`, `'pull'`, or `'rain'`.
2. For each, extract `weapon.radius`, `weapon.aoeKit?.radius`, and
   `weapon.aoeKit?.impactScale`.
3. Build a report table:
   | id | tier | radius | aoeKit.radius | impactScale | impactScale_target | status |
   - `impactScale_target = radius / 38.4` (rounded to 1 decimal)
   - `status`:
     - `RADIUS_DRIFT` if `aoeKit.radius` exists and ≠ `radius`
     - `IMPACT_OVERSIZED` if `impactScale > impactScale_target × 1.4`
     - `IMPACT_UNDERSIZED` if `impactScale < impactScale_target × 0.7`
     - `OK` otherwise
4. Print weapons with non-OK status first, then OK weapons.
5. For each drift, output a suggested edit (file path + line + old →
   new value).

## Guard rails

- Do not auto-apply edits — propose only. User confirms with /edit.
- Skip legendary tier weapons (`tier: 'legendary'`) — they're reward
  tier with deliberate larger feel; their impactScale is not constrained.
- Skip `rainSkipDrop: true` rain weapons — they have no drop body to
  size against the disc.
- If `weapon.radius` is missing (melee/ring), skip the weapon entirely.

## Output format

```
=== AoE weapons validation ===

⚠ DRIFTS (3):

firewall (basic, line 209)
  radius: 48     aoeKit.radius: 82      → RADIUS_DRIFT
  Fix: aoeKit.radius: 82 → 48 (line 215)

warcry_pulse (basic, line 952)
  radius: 54     impactScale: 2.0       → IMPACT_OVERSIZED (target 1.4)
  Fix: aoeKitFor('physical', 54, { ..., impactScale: 1.4 })

✓ OK (8):
  holywater    radius 44  scale 1.2
  divine_hammer radius 46  scale 1.2
  ...

Total: 11 AoE weapons | 3 drifts | 8 OK
```

## When to run

- After any AoE weapon balance pass (radius nerfs/buffs)
- Before committing weapons.js changes
- When a new AoE weapon is added (verify it follows the convention)
