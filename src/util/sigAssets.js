// Signature visual assets — PNG sprites pulled from PixelLab.
//
// These files live in public/sigs/ so Vite serves them at /sigs/* in dev
// and bundles them into dist/ at build time. The renderer uses
// pngTexture(url) to lazy-load each one as a PIXI Texture with
// nearest-neighbour scaling.
//
// Single-frame sprites are { url: '/sigs/foo.png' }.
// Animated sprites are { frames: ['/sigs/foo_0.png', '/sigs/foo_1.png', ...], fps: N }.
// renderer.drawActive picks the right frame from elapsed time.

export const SIG_ASSETS = {
  // Mage meteor body — 48x48 PNG, single frame.
  // Rocky core + ember flame trail. Rendered with rotation on velocity so
  // the flame tail always trails the trajectory.
  mage_meteor: {
    url: '/sigs/mage_meteor.png',
  },
  // Knight holy impact — 64x64, 9-frame "sun pulsing brightly" animation.
  // Sits at each target as a sustained golden burst.
  knight_flare: {
    frames: [
      '/sigs/knight_flare_0.png',
      '/sigs/knight_flare_1.png',
      '/sigs/knight_flare_2.png',
      '/sigs/knight_flare_3.png',
      '/sigs/knight_flare_4.png',
      '/sigs/knight_flare_5.png',
      '/sigs/knight_flare_6.png',
      '/sigs/knight_flare_7.png',
      '/sigs/knight_flare_8.png',
    ],
    fps: 18,
  },
  // Gennaro blade_volley impact — 48x48, 4-frame blood splash.
  // PixelLab 16-frame review (id 29e8dcae) indices [3,7,11,15]: birth →
  // expanding → peak splash → dripping decay. Crimson palette differentiates
  // from huntress arrow_impact (parchment+green) sharing the same 'arrows'
  // signature kind — fixes the "둘이 동일" visual issue.
  gennaro_blood_splash: {
    frames: [
      '/sigs/gennaro_blood_splash_0.png',
      '/sigs/gennaro_blood_splash_1.png',
      '/sigs/gennaro_blood_splash_2.png',
      '/sigs/gennaro_blood_splash_3.png',
    ],
    fps: 12,
  },
  // Porta tesla impact — 48x48, 4-frame electric burst.
  // Curated sequence (PixelLab review object f4292727 frames [10,2,14,5]):
  //   sparkle birth → 8-point starburst → big yellow puff → arc legs decay.
  // Mirrors holy_beam pattern: 'beam' kind, vertical pillar (Graphics) +
  // PNG impact at strike point.
  tesla_burst: {
    frames: [
      '/sigs/tesla_burst_0.png',
      '/sigs/tesla_burst_1.png',
      '/sigs/tesla_burst_2.png',
      '/sigs/tesla_burst_3.png',
    ],
    fps: 12,
  },
  // Pasqualina rune_barrage meteor — 64x64, 4-frame swirling cosmic galaxy.
  // PixelLab review id 54172048 frames [3,7,11,15] — evenly spaced rotation
  // states of a violet+indigo nebula with bright stars. Differentiates from
  // mage_meteor (fire rock) on shared kind:'meteor': arcane vortex vs fireball.
  rune_barrage: {
    frames: [
      '/sigs/rune_barrage_0.png',
      '/sigs/rune_barrage_1.png',
      '/sigs/rune_barrage_2.png',
      '/sigs/rune_barrage_3.png',
    ],
    fps: 10,
  },
  // ─────────────────────────────────────────────────────────────────────
  // Zone / ground-AoE PNGs (for weapons that drop a placed damage zone:
  // aoe / pull patterns in content/weapons.js). The renderer's zone PNG
  // sprite layer reads SIG_ASSETS[groundAsset] for each projectile in
  // bucketZones — Graphics still draws the underlying disc + rotating
  // arcs (drawZones), PNG sits on top for the focal art.
  // ─────────────────────────────────────────────────────────────────────

  // Generic "fire crater" zone — burning meteor crater with magma cracks.
  // Wired to all aoe-pattern weapons by default (firewall, divine hammer,
  // warhammer, holywater, leg_tempest, leg_inferno_wall, leg_frozen_throne
  // included — palette via Pixi tint, see weaponFire.js groundAsset).
  zone_meteor: {
    frames: [
      '/zones/meteor_0.png',
      '/zones/meteor_1.png',
      '/zones/meteor_2.png',
      '/zones/meteor_3.png',
      '/zones/meteor_4.png',
      '/zones/meteor_5.png',
      '/zones/meteor_6.png',
      '/zones/meteor_7.png',
      '/zones/meteor_8.png',
    ],
    fps: 12,
  },

  // Lightning starburst — generated 9 frames but frames 4-7 drift toward
  // ember colours (PixelLab confused thunder/meteor). Loop 0-3 so the
  // visual stays "blue lightning starburst" the whole way.
  zone_thunder: {
    frames: [
      '/zones/thunder_0.png',
      '/zones/thunder_1.png',
      '/zones/thunder_2.png',
      '/zones/thunder_3.png',
    ],
    fps: 14,
  },

  // Cosmic vortex (purple swirling void) — for pull-pattern weapons.
  // 8-frame slow spin loop.
  zone_vortex: {
    frames: [
      '/zones/vortex_0.png',
      '/zones/vortex_1.png',
      '/zones/vortex_2.png',
      '/zones/vortex_3.png',
      '/zones/vortex_4.png',
      '/zones/vortex_5.png',
      '/zones/vortex_6.png',
      '/zones/vortex_7.png',
    ],
    fps: 10,
  },

  // Huntress arrow_rain — small dust+spark burst at each arrow impact.
  // 7-frame one-shot (renderer plays it clamped to impact life).
  arrow_impact: {
    frames: [
      '/zones/arrow_impact_0.png',
      '/zones/arrow_impact_1.png',
      '/zones/arrow_impact_2.png',
      '/zones/arrow_impact_3.png',
      '/zones/arrow_impact_4.png',
      '/zones/arrow_impact_5.png',
      '/zones/arrow_impact_6.png',
    ],
    fps: 16,
  },

  // ─────────────────────────────────────────────────────────────────────
  // Per-weapon AoE sky-drop assets (def.aoeKit in content/weapons.js).
  // Each weapon gets two single-frame PNGs: a telegraph rune (drawn on
  // the ground while the cast is winding up) and a falling body (drawn
  // arcing down toward the target during the fall phase). Impacts reuse
  // the existing knight_flare / warrior_magma / Graphics fallback so we
  // didn't have to generate 4 more animations.
  // ─────────────────────────────────────────────────────────────────────

  // divine_hammer — knight holy AoE. Gold cross rune + falling gold hammer.
  divine_hammer_telegraph: { url: '/sigs/divine_hammer_telegraph.png' },
  divine_hammer_drop:      { url: '/sigs/divine_hammer_drop.png' },

  // firewall — mage fire AoE. Red flame rune + falling flame column.
  firewall_telegraph: { url: '/sigs/firewall_telegraph.png' },
  firewall_drop:      { url: '/sigs/firewall_drop.png' },

  // holywater — mage holy/ice AoE. Blue water rune + falling glass vial.
  holywater_telegraph: { url: '/sigs/holywater_telegraph.png' },
  holywater_drop:      { url: '/sigs/holywater_drop.png' },

  // warhammer — warrior smash AoE. Iron Mjolnir rune + falling iron hammer.
  warhammer_telegraph: { url: '/sigs/warhammer_telegraph.png' },
  warhammer_drop:      { url: '/sigs/warhammer_drop.png' },

  // smite — knight rain/holy. White cross rune + falling light pillar.
  smite_telegraph: { url: '/sigs/smite_telegraph.png' },
  smite_drop:      { url: '/sigs/smite_drop.png' },

  // void_sphere — mage shadow/pull. Purple void rune + falling void orb.
  void_sphere_telegraph: { url: '/sigs/void_sphere_telegraph.png' },
  void_sphere_drop:      { url: '/sigs/void_sphere_drop.png' },

  // Generic aoe/pull telegraph — purple magic circle with V rune (4ec38e59).
  // Used as the unified pre-cast indicator for all sky-drop weapons and
  // signature ultimates — replaces per-weapon telegraph PNGs.
  aoe_telegraph_circle: { url: '/sigs/aoe_telegraph_circle.png' },

  // ─────────────────────────────────────────────────────────────────────
  // Throwing-weapon flight effects (def.effectAsset in content/weapons.js).
  // Replace the static weapon-shape PNG with a 4-frame loop showing the
  // weapon mid-flight with baked-in trail/aura. Renderer's projectile path
  // (applySprite) reads e.effectAsset and cycles frames via assetFrameUrl,
  // so the in-flight visual differs from the inventory icon.
  // ─────────────────────────────────────────────────────────────────────

  knives_fx: {
    frames: [
      '/effects/knives_fx_0.png',
      '/effects/knives_fx_1.png',
      '/effects/knives_fx_2.png',
      '/effects/knives_fx_3.png',
    ],
    fps: 14,
  },
  // Trail particle for weapons that draw blood — knives (Phase 1 test).
  // Renderer's spawnFx PNG path cycles these 4 frames across `life` seconds
  // while alpha-fading via the existing fxActive loop. The PixelLab "fading"
  // job produced near-identical frames, so the actual fade is renderer-side.
  blood_drop_fx: {
    frames: [
      '/effects/blood_drop_fx_0.png',
      '/effects/blood_drop_fx_1.png',
      '/effects/blood_drop_fx_2.png',
      '/effects/blood_drop_fx_3.png',
    ],
    fps: 14,
  },
  axe_fx: {
    frames: [
      '/effects/axe_fx_0.png',
      '/effects/axe_fx_1.png',
      '/effects/axe_fx_2.png',
      '/effects/axe_fx_3.png',
    ],
    fps: 14,
  },
  bone_fx: {
    frames: [
      '/effects/bone_fx_0.png',
      '/effects/bone_fx_1.png',
      '/effects/bone_fx_2.png',
      '/effects/bone_fx_3.png',
    ],
    fps: 10,
  },
  shield_throw_fx: {
    frames: [
      '/effects/shield_throw_fx_0.png',
      '/effects/shield_throw_fx_1.png',
      '/effects/shield_throw_fx_2.png',
      '/effects/shield_throw_fx_3.png',
    ],
    fps: 12,
  },
  cross_fx: {
    frames: [
      '/effects/cross_fx_0.png',
      '/effects/cross_fx_1.png',
      '/effects/cross_fx_2.png',
      '/effects/cross_fx_3.png',
    ],
    fps: 12,
  },
  throw_axes_fx: {
    frames: [
      '/effects/throw_axes_fx_0.png',
      '/effects/throw_axes_fx_1.png',
      '/effects/throw_axes_fx_2.png',
      '/effects/throw_axes_fx_3.png',
    ],
    fps: 14,
  },
  holy_lance_fx: {
    frames: [
      '/effects/holy_lance_fx_0.png',
      '/effects/holy_lance_fx_1.png',
      '/effects/holy_lance_fx_2.png',
      '/effects/holy_lance_fx_3.png',
    ],
    fps: 16,
  },
  crossbow_bolt_fx: {
    frames: [
      '/effects/crossbow_bolt_fx_0.png',
      '/effects/crossbow_bolt_fx_1.png',
      '/effects/crossbow_bolt_fx_2.png',
      '/effects/crossbow_bolt_fx_3.png',
    ],
    fps: 14,
  },

  // ─────────────────────────────────────────────────────────────────────
  // Batch 4 — 4-frame in-flight effectAssets for nova/lightning/orb weapons.
  // PixelLab review burst frames [3,7,11,15] (birth → expand → peak → decay).
  // Wired in content/weapons.js via def.effectAsset; renderer's projectile
  // PNG path cycles frames via assetFrameUrl + pngTexture.
  // ─────────────────────────────────────────────────────────────────────
  frost_nova_fx: {
    frames: [
      '/effects/frost_nova_fx_0.png',
      '/effects/frost_nova_fx_1.png',
      '/effects/frost_nova_fx_2.png',
      '/effects/frost_nova_fx_3.png',
    ],
    fps: 12,
  },
  holy_nova_fx: {
    frames: [
      '/effects/holy_nova_fx_0.png',
      '/effects/holy_nova_fx_1.png',
      '/effects/holy_nova_fx_2.png',
      '/effects/holy_nova_fx_3.png',
    ],
    fps: 12,
  },
  inferno_bolt_fx: {
    frames: [
      '/effects/inferno_bolt_fx_0.png',
      '/effects/inferno_bolt_fx_1.png',
      '/effects/inferno_bolt_fx_2.png',
      '/effects/inferno_bolt_fx_3.png',
    ],
    fps: 14,
  },
  voltaic_ring_fx: {
    frames: [
      '/effects/voltaic_ring_fx_0.png',
      '/effects/voltaic_ring_fx_1.png',
      '/effects/voltaic_ring_fx_2.png',
      '/effects/voltaic_ring_fx_3.png',
    ],
    fps: 14,
  },
  plasma_orb_fx: {
    frames: [
      '/effects/plasma_orb_fx_0.png',
      '/effects/plasma_orb_fx_1.png',
      '/effects/plasma_orb_fx_2.png',
      '/effects/plasma_orb_fx_3.png',
    ],
    fps: 12,
  },
  // Batch 5 effectAssets — magma / divine rain / chain void.
  magma_burst_fx: {
    frames: [
      '/effects/magma_burst_fx_0.png',
      '/effects/magma_burst_fx_1.png',
      '/effects/magma_burst_fx_2.png',
      '/effects/magma_burst_fx_3.png',
    ],
    fps: 12,
  },
  divine_rain_fx: {
    frames: [
      '/effects/divine_rain_fx_0.png',
      '/effects/divine_rain_fx_1.png',
      '/effects/divine_rain_fx_2.png',
      '/effects/divine_rain_fx_3.png',
    ],
    fps: 12,
  },
  chain_void_fx: {
    frames: [
      '/effects/chain_void_fx_0.png',
      '/effects/chain_void_fx_1.png',
      '/effects/chain_void_fx_2.png',
      '/effects/chain_void_fx_3.png',
    ],
    fps: 14,
  },
  // Batch 6 effectAssets — judgement / solar / ember / lightning.
  judgement_beam_fx: {
    frames: [
      '/effects/judgement_beam_fx_0.png',
      '/effects/judgement_beam_fx_1.png',
      '/effects/judgement_beam_fx_2.png',
      '/effects/judgement_beam_fx_3.png',
    ],
    fps: 14,
  },
  solar_flare_fx: {
    frames: [
      '/effects/solar_flare_fx_0.png',
      '/effects/solar_flare_fx_1.png',
      '/effects/solar_flare_fx_2.png',
      '/effects/solar_flare_fx_3.png',
    ],
    fps: 12,
  },
  ember_ring_fx: {
    frames: [
      '/effects/ember_ring_fx_0.png',
      '/effects/ember_ring_fx_1.png',
      '/effects/ember_ring_fx_2.png',
      '/effects/ember_ring_fx_3.png',
    ],
    fps: 12,
  },
  lightning_fx: {
    frames: [
      '/effects/lightning_fx_0.png',
      '/effects/lightning_fx_1.png',
      '/effects/lightning_fx_2.png',
      '/effects/lightning_fx_3.png',
    ],
    fps: 14,
  },

  // Warrior magma burst — 64x64, 9-frame "lava bubbling and glowing".
  // One big eruption centered on the player.
  warrior_magma: {
    frames: [
      '/sigs/warrior_magma_0.png',
      '/sigs/warrior_magma_1.png',
      '/sigs/warrior_magma_2.png',
      '/sigs/warrior_magma_3.png',
      '/sigs/warrior_magma_4.png',
      '/sigs/warrior_magma_5.png',
      '/sigs/warrior_magma_6.png',
      '/sigs/warrior_magma_7.png',
      '/sigs/warrior_magma_8.png',
    ],
    fps: 14,
  },
};

// Resolve an asset key to a frame URL given elapsed seconds.
// Returns null if the key is unknown (renderer falls back to Graphics).
export function assetFrameUrl(key, elapsed = 0) {
  const a = SIG_ASSETS[key];
  if (!a) return null;
  if (a.url) return a.url;
  if (a.frames && a.frames.length) {
    const idx = Math.floor(elapsed * (a.fps || 12)) % a.frames.length;
    return a.frames[idx];
  }
  return null;
}

// All URLs used — main.js can preload these at app start so the first
// cast doesn't stutter while the browser fetches the PNG.
export function allAssetUrls() {
  const urls = [];
  for (const k in SIG_ASSETS) {
    const a = SIG_ASSETS[k];
    if (a.url) urls.push(a.url);
    if (a.frames) urls.push(...a.frames);
  }
  return urls;
}
