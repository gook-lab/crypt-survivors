import { describe, it, expect } from 'vitest';
import { spriteBaseAngleFor } from './spriteAngles.js';

describe('spriteBaseAngleFor — arrow rotation regression guard', () => {
  it('genuinely-vertical arrow sprites stay -PI/2', () => {
    // proj_leg_arrow measured ≈ -89° (real vertical art); sun_phoenix is a
    // radial burst (rotation moot). proj_arrow is Tier S east-pointing (0).
    expect(spriteBaseAngleFor('proj_leg_arrow')).toBeCloseTo(-Math.PI / 2, 5);
    expect(spriteBaseAngleFor('proj_leg_sun_phoenix')).toBeCloseTo(-Math.PI / 2, 5);
  });

  it('diagonal up-right spear/arrow family gets +π/4 (anim art ≈ -45°)', () => {
    // A PixelLab batch is authored pointing UP-RIGHT (~-45°), not vertical.
    // Blanket -π/2 made them fly ~45° tilted ("누워서 간다"). offset +π/4
    // cancels the -45° authoring so the tip leads along velocity. Measured
    // via principal-axis on the actual anim frames + visual confirmation.
    // proj_knives joined this family 2026-05-29 (PCA -45°, elong 5.3, tip
    // up-right, pommel bottom-left) — was previously mis-filed as up (-π/2).
    for (const k of [
      'proj_ice_spear', 'proj_leg_spear', 'proj_spear', 'proj_piercing_arrow',
      'proj_leg_shadow_arrow', 'proj_salvo_shot', 'proj_phantom_arrow',
      'proj_marksman_shot', 'proj_knives',
    ]) {
      expect(spriteBaseAngleFor(k)).toBeCloseTo(Math.PI / 4, 5);
    }
  });

  it('shared melee slash fx_slash gets +π/2 so the convex edge faces the target', () => {
    // fx_slash (검/낫/도끼/식칼 공통 검기) is authored convex-up at rotation 0.
    // melee sets spriteAngle = atan2(toward enemy); offset +π/2 cancels the
    // atan2 east-baseline so a monster straight up renders the arc convex-up.
    expect(spriteBaseAngleFor('fx_slash')).toBeCloseTo(Math.PI / 2, 5);
    // end-to-end: monster straight up (θ = -π/2) → rotation ~0 (authored look)
    expect(Math.atan2(-1, 0) + spriteBaseAngleFor('fx_slash')).toBeCloseTo(0, 5);
  });

  it('symmetric/east-pointing projectiles return 0 — no rotation offset', () => {
    // Sprites whose authored orientation already aligns with rightward motion
    // (or sprites that are radially symmetric) should NOT have an offset.
    // Adding one here would silently rotate axes, holy crosses, etc. wrong.
    expect(spriteBaseAngleFor('proj_axe')).toBe(0);
    expect(spriteBaseAngleFor('proj_hunters_bow')).toBe(0);
    expect(spriteBaseAngleFor('proj_wand')).toBe(0);
    expect(spriteBaseAngleFor('proj_cross')).toBe(0);
    expect(spriteBaseAngleFor('proj_whip')).toBe(0);
    expect(spriteBaseAngleFor('proj_leg_axe')).toBe(0);
  });

  it('west-pointing arrow PNG gets +π so tip leads motion', () => {
    // proj_arrow PNG (frames 0-4) is authored with tip on LEFT side. Without
    // the +π flip, atan2(0,1)=0 + 0 leaves it pointing west while moving east
    // — user sees the arrow tip lagging toward the player. The +π rotates
    // the west-pointing PNG 180° so the tip leads.
    expect(spriteBaseAngleFor('proj_arrow')).toBeCloseTo(Math.PI, 5);
  });

  it('dagger_blade gets +π (west-pointing) and lightning 0 (east-pointing)', () => {
    // 2026-05-29 axis audit overturned the earlier "point UP → -π/2" guess:
    //  • proj_dagger_blade: PCA ~0° (elong 1.9), thin tip on the LEFT, ornate
    //    guard on the right — same as proj_arrow → +π flips the tip to lead.
    //  • proj_lightning: PCA ~0° (elong 2.0), bright head on the RIGHT (east);
    //    it is pattern=rain so rotation is moot, but 0 is the correct authored
    //    orientation (entry removed from the map → default 0).
    expect(spriteBaseAngleFor('proj_dagger_blade')).toBeCloseTo(Math.PI, 5);
    expect(spriteBaseAngleFor('proj_lightning')).toBe(0);
  });

  it('legendary qi crescents return π so inner arc faces motion direction', () => {
    // PixelLab crescent PNGs land with the concave side opposite to the
    // generator's "east-pointing" hint; +π rotation aligns the inner curve
    // to the enemy.
    expect(spriteBaseAngleFor('proj_leg_blade')).toBeCloseTo(Math.PI, 5);
    expect(spriteBaseAngleFor('proj_leg_scythe')).toBeCloseTo(Math.PI, 5);
    expect(spriteBaseAngleFor('proj_leg_whip')).toBeCloseTo(Math.PI, 5);
    expect(spriteBaseAngleFor('proj_leg_obsidian_blade')).toBeCloseTo(Math.PI, 5);
  });

  it('unknown sprite names return 0 (defensive default)', () => {
    expect(spriteBaseAngleFor('proj_does_not_exist')).toBe(0);
    expect(spriteBaseAngleFor('')).toBe(0);
    expect(spriteBaseAngleFor(undefined)).toBe(0);
    expect(spriteBaseAngleFor(null)).toBe(0);
  });

  it('end-to-end: rightward up-authored sprite combined angle is -PI/2', () => {
    // The renderer applies: atan2(vy, vx) + spriteBaseAngleFor(sprite)
    // For a horizontal rightward leg_arrow (authored UP): atan2(0, 1) = 0,
    // + (-PI/2) = -PI/2. The sprite was authored pointing UP (-PI/2 from
    // horizontal), so:
    //   art angle (up) + applied rotation (-PI/2) = pointing right ✓
    const applied = Math.atan2(0, 1) + spriteBaseAngleFor('proj_leg_arrow');
    expect(applied).toBeCloseTo(-Math.PI / 2, 5);

    // An axe (no offset) moving right: art is authored rightward, rotation 0
    //   → renders right. No regression.
    const axeApplied = Math.atan2(0, 1) + spriteBaseAngleFor('proj_axe');
    expect(axeApplied).toBe(0);
    // proj_arrow is west-pointing PNG, so rightward motion needs +π to flip.
    //   atan2(0,1) + π = π → west-pointing PNG rotates 180° → renders east ✓
    const arrowApplied = Math.atan2(0, 1) + spriteBaseAngleFor('proj_arrow');
    expect(arrowApplied).toBeCloseTo(Math.PI, 5);
  });
});
