---
description: Measure projectile PNG principal axis (Python/PIL PCA) and cross-check src/util/spriteAngles.js offsets — flag directional sprites that fly "lying down" (누워서 간다). Elongation-gated so crescents don't false-positive.
---

# /audit-projectile-angles

Find projectile sprites whose `spriteAngles.js` offset doesn't match the
PNG's authored orientation, so an aimed/traveling projectile renders tilted
("누워서 간다") instead of tip-toward-motion. Born from a 2026-05-29 finding:
a whole PixelLab batch was authored up-RIGHT (~-45°) but blanket-offset `-π/2`
(assumes straight up), so spears/arrows flew ~45° lying down — fixed to `+π/4`.

## Key principle (don't skip)

The renderer applies `rotation = atan2(vy,vx) + spriteBaseAngleFor(sprite)`
(or `e.spriteAngle + offset` for melee). A sprite is correctly oriented when
`authored_axis + offset ≡ 0 (mod π)` so the long axis aligns to travel.

**PCA is reliable ONLY for elongated sprites** (elongation = λ1/λ2 > ~1.6:
spears, arrows, lances, daggers). Crescents (검기), rings, bursts, orbs are
near-isotropic → PCA returns an arbitrary axis = FALSE POSITIVE. Always print
elongation and treat `elong < 1.6` as "round/symmetric — offset moot", then
confirm those by EYE (montage), never by PCA. (memory:
`pixellab-pca-elongation-threshold`)

Direction only matters for `fan` / `chain` / aimed `melee` patterns. `orbit` /
`ring` / `aoe` / `pull` / `rain` / `boomerang`(→straight) / `arc_burst` are
direction-agnostic — skip them.

## Steps

1. Parse `src/content/weapons.js` — collect `{id, pattern, sprite}` for
   weapons whose pattern is `fan` / `chain` (and `melee` aimed). Filter to
   directional sprite families (arrow/spear/lance/blade/dagger/bolt/knife/dart).
2. Parse `src/util/spriteAngles.js` `SPRITE_BASE_ANGLES` → current offset per key.
3. For each sprite, locate the ACTIVE PNG. **Anim wins over static** (later JS
   object key wins): try `public/projectiles/anim/<key>_0.png`, then
   `anim/<key without proj_>_0.png`, then `public/projectiles/<key>.png`.
4. Run the PCA (Python/PIL) per PNG — non-alpha pixel covariance → principal
   axis angle (deg) + elongation ratio:
   ```python
   from PIL import Image; import math
   im=Image.open(p).convert("RGBA"); px=im.load(); xs=[];ys=[]
   for y in range(im.height):
     for x in range(im.width):
       if px[x,y][3]>40: xs.append(x);ys.append(y)
   n=len(xs); mx=sum(xs)/n; my=sum(ys)/n; sxx=syy=sxy=0
   for x,y in zip(xs,ys):
     dx=x-mx;dy=y-my; sxx+=dx*dx;syy+=dy*dy;sxy+=dx*dy
   theta=math.degrees(0.5*math.atan2(2*sxy,(sxx-syy)))
   tr=sxx+syy; disc=max(0,(tr*tr/4)-(sxx*syy-sxy*sxy))**0.5
   elong=(tr/2+disc)/max(1e-6,tr/2-disc)
   ```
5. Compute `alignment = (axis + offset) mod 180` (wrap to ±90). Flag
   `MIS ~N° off` when `|alignment| > 18°` AND `elong >= 1.6`. Else `OK` (or
   `round/symmetric — offset moot` when elong < 1.6).
6. Print a table: `sprite | axis° | elong | offset° | verdict`.
7. For each MIS (elongated): suggest the corrected offset = `-axis` rounded to
   the nearest of {0, ±π/4, ±π/2, π}. For low-elong flags, build a labeled
   montage PNG (PIL, NEAREST upscale) and inspect visually before changing.
8. Apply approved fixes to `spriteAngles.js` (with a comment citing the
   measured axis), add/extend the `spriteAngles.test.js` regression assertion,
   run `npx vitest run src/util/spriteAngles.test.js`.

## Relation to other validators

- `/validate-sprite-keys` — checks PNG *coverage* (orphan/dead keys), not
  *orientation*. Run that first to confirm the sprite has a PNG at all, then
  this for direction correctness. Complementary, not overlapping.

## Notes

- `performance.getEntriesByType` does NOT see `new Image()` loads — don't use
  it to verify PNGs reaching the renderer (memory: renderer asset-load caveat).
- Boomerang weapons are now straight off-screen throws (`def.returns` opt-in);
  their weapon-model PNG flying is intended — not a direction bug.
