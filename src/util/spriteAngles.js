// Per-sprite-key rotation offset for directional projectiles.
//
// renderer.js applies `atan2(vy,vx) + spriteBaseAngleFor(name)` so a sprite
// drawn pointing UP still aligns with horizontal motion. Without this, a
// rightward arrow renders sideways because atan2 of (1,0) is 0 radians and
// the renderer would happily draw the up-pointing arrow at 0 rotation.
//
// Keep this map minimal — only sprites whose authored orientation is NOT
// rightward need an entry. Default is 0 (rightward, matches atan2).

const SPRITE_BASE_ANGLES = {
  // ── Diagonal up-right family (+π/4) ──────────────────────────────────
  // A whole PixelLab batch of spears/arrows is authored pointing UP-RIGHT
  // (principal axis ≈ -45° measured from the actual anim frames), NOT
  // straight up. They were blanket-assigned -π/2 (assumes vertical), so they
  // flew ~45° tilted — the "누워서 간다" bug the user spotted on ice_spear.
  // The melee/projectile rotation is atan2(velocity) + offset; with the art
  // at -45°, offset +π/4 cancels it so the tip leads along the velocity.
  // (Verified: ice_spear/leg_spear/piercing_arrow -45.3°, salvo/phantom -44°,
  // marksman -50°, leg_shadow_arrow -45°, spear cluster -28°, knives -45°.)
  proj_leg_shadow_arrow: Math.PI / 4,
  proj_spear: Math.PI / 4,
  proj_ice_spear: Math.PI / 4, // was proj_frost_bolt; halberd-style ice spear
  proj_leg_spear: Math.PI / 4, // 미스릴 할버드
  proj_salvo_shot: Math.PI / 4,
  proj_piercing_arrow: Math.PI / 4,
  proj_phantom_arrow: Math.PI / 4,
  proj_marksman_shot: Math.PI / 4,
  // proj_knives (단검 투척, pattern fan) measured -45° (elong 5.3, tip up-right
  // with pommel bottom-left — same authoring as the spear batch). Was blanket
  // -π/2 so the starter knives flew "lying down"; +π/4 makes the tip lead.
  proj_knives: Math.PI / 4,
  // ── Straight-up family (-π/2) ────────────────────────────────────────
  // These measured ≈ -85..-90° (genuinely vertical art) or are radially
  // symmetric (sun_phoenix burst — rotation moot). proj_arrow itself is now
  // Tier S east-pointing (offset 0). The previously-flagged knives / dagger /
  // lightning were audited 2026-05-29 (PCA on anim frames + visual confirm):
  // knives -45° → +π/4 (diagonal family above), dagger_blade ~0° tip-west → π
  // (with proj_arrow below), lightning ~0° head-east → 0 (entry removed).
  // hunters_blade stays -π/2 (reads near-vertical).
  proj_leg_arrow: -Math.PI / 2,
  proj_leg_sun_phoenix: -Math.PI / 2,
  // proj_bear_trap intentionally absent — placed, rotation doesn't read.
  proj_hunters_blade: -Math.PI / 2,
  proj_gladius_throw: -Math.PI / 2,
  proj_silencer_dart: -Math.PI / 2,
  proj_crusader_lance: -Math.PI / 2,
  // Batch 3 — crimson_knives PNG authored pointing DOWN (blade tips down),
  // so flip by +PI/2 instead of -PI/2 to align with rightward atan2 baseline.
  // dawnbreaker lightning is vertical-symmetric — up convention works.
  // whirlwind/anvil/net/warcry stay symmetric/radial, no entry.
  proj_leg_crimson_knives: Math.PI / 2,
  proj_dawnbreaker: -Math.PI / 2,
  // Batch 7 — lance/lightning shapes pointing up. meteor/burst/hawk/rune/glyph
  // are symmetric or follow velocity naturally, no entry.
  proj_glacial_lance: -Math.PI / 2,
  proj_spell_ice_crystal: -Math.PI / 2,
  proj_leg_thunder_lord: -Math.PI / 2,
  // Batch 8 — nova/blade/hammer/void are symmetric.
  // proj_arrow: the comment USED to say "east-pointing PNG, entry removed",
  // but the actual animated PNG frames point WEST (tip on left). Without an
  // offset the arrow tip lagged behind motion (visible as tip-toward-player).
  // Restored +π to flip 180° — verified by reading proj_arrow_0.png +
  // proj_arrow_2.png frames.
  proj_arrow: Math.PI,
  // proj_dagger_blade (dagger_fan, pattern fan) measured ~0° (elong 1.9) with
  // the thin blade TIP on the LEFT (west) and ornate guard on the right — same
  // authoring as proj_arrow. Was -π/2 so the dagger flew tip-down; +π flips it
  // so the tip leads motion. Audited 2026-05-29.
  proj_dagger_blade: Math.PI,
  // Batch 11 — directional bolts/beam (authored up). scythe/holy_nova/
  // frost_nova/magma_burst/divine_rain are symmetric or oriented for motion
  // direction already; no entry needed. proj_lightning was here at -π/2 but
  // measured ~0° (east-pointing head, elong 2.0) and is pattern=rain anyway
  // (rotation moot) — entry removed 2026-05-29 (default 0 = east).
  proj_chain_void: -Math.PI / 2,
  proj_judgement_beam: -Math.PI / 2,
  // Batch 12 — legendary qi projectiles (crescent slash arcs). PixelLab
  // generated PNGs land with the arc's concave (inner) side facing the
  // generator's left, so we rotate +π so the inner curve fronts the
  // enemy (motion direction).
  proj_leg_blade: Math.PI,
  proj_leg_scythe: Math.PI,
  proj_leg_whip: Math.PI,
  proj_leg_obsidian_blade: Math.PI,
  // fx_slash — shared melee slash arc (검 / 낫 / 광전사 도끼 / 핏빛 식칼).
  // Authored as a ∩ with the convex (cutting) edge UP at rotation 0. The
  // melee branch sets spriteAngle = atan2(toward target), so to keep the
  // crescent's convex pointing AT the enemy we cancel the atan2 baseline:
  // monster straight up (θ = -π/2) must render at rotation ~0 (authored
  // ∩-up), so offset = +π/2. Verified against the in-game slash facing.
  fx_slash: Math.PI / 2,
};

export function spriteBaseAngleFor(name) {
  return SPRITE_BASE_ANGLES[name] || 0;
}
