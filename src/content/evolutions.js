// Weapon evolution recipes — DATA + the evolve check.
//
// A basic weapon at MAX level, while the player also owns the paired passive
// (level 1+), fuses into a legendary. evolveCheck runs after every level-up
// pick — when a recipe's conditions are met the base weapon is replaced by
// its legendary in place (the weapon-slot count is unchanged).

import { WEAPONS } from './weapons.js';

export const EVOLUTIONS = [
  { from: 'wand', passive: 'might', to: 'leg_blade' },
  { from: 'nova', passive: 'multi', to: 'leg_nova' },
  { from: 'spear', passive: 'might', to: 'leg_spear' },
  { from: 'axe', passive: 'multi', to: 'leg_axe' },
  { from: 'holywater', passive: 'vigor', to: 'leg_soul_lantern' },
  { from: 'arrow', passive: 'swift', to: 'leg_arrow' },
  { from: 'cross', passive: 'haste', to: 'leg_cross' },
  { from: 'lightning', passive: 'swift', to: 'leg_storm_caller' },
  { from: 'firewall', passive: 'might', to: 'leg_sun_phoenix' },
  { from: 'knives', passive: 'multi', to: 'leg_spectral_bow' },
  { from: 'scythe', passive: 'vigor', to: 'leg_scythe' },
  // extension recipes — reuse existing legendaries to give more starter
  // weapons a fusion path. Players who picked sword / frost_bolt / holy_lance
  // no longer feel left out of the evolution mini-game.
  { from: 'sword', passive: 'haste', to: 'leg_blade' },
  // — extension recipes (5 new weapons) — pair each with a thematic passive
  //   for evolution into an existing legendary so the player feels covered.
  { from: 'soul_arrow', passive: 'swift', to: 'leg_arrow' },
  { from: 'time_stop', passive: 'endure', to: 'leg_eternal_frost' },
  // — Phase 1 rebuild recipes — route each class-themed weapon into a
  //   thematic legendary. All five legendaries already exist; the recipe
  //   list supports multiple paths to the same legendary so these reuse
  //   leg_storm_caller / leg_bible / leg_tempest / leg_sun_phoenix /
  //   leg_blade alongside the existing lightning / bible / mace / firewall
  //   / sword paths.
  { from: 'holy_nova', passive: 'vigor', to: 'leg_bible' },
  { from: 'divine_rain', passive: 'endure', to: 'leg_tempest' },
  { from: 'whirlwind_blade', passive: 'haste', to: 'leg_blade' },

  // ── v2 rebuild — knight paths (7) ──────────────────────────────────────
  { from: 'crusader_lance', passive: 'might', to: 'leg_judgement_hammer' },
  { from: 'guardian_orbit', passive: 'endure', to: 'leg_seraph_wing' },
  { from: 'judgement_beam', passive: 'haste', to: 'leg_thunder_lord' },
  { from: 'consecrate', passive: 'vigor', to: 'leg_seraph_wing' },
  { from: 'aegis_throw', passive: 'might', to: 'leg_judgement_hammer' },
  { from: 'dawnbreaker', passive: 'swift', to: 'leg_thunder_lord' },
  { from: 'holy_censer', passive: 'vigor', to: 'leg_seraph_wing' },

  // ── v2 rebuild — warrior paths (7) ─────────────────────────────────────
  { from: 'berserker_axe', passive: 'might', to: 'leg_obsidian_blade' },
  { from: 'gladius_throw', passive: 'multi', to: 'leg_crimson_knives' },
  { from: 'anvil_drop', passive: 'endure', to: 'leg_hammer_of_dawn' },
  { from: 'spike_burst', passive: 'multi', to: 'leg_obsidian_blade' },
  { from: 'meat_cleaver', passive: 'might', to: 'leg_crimson_knives' },
  { from: 'warcry_pulse', passive: 'endure', to: 'leg_judgement_hammer' },

  // ── v2 rebuild — huntress paths (8) ────────────────────────────────────
  { from: 'barbed_net', passive: 'lodestone', to: 'leg_world_tree' },
  { from: 'hawk_swarm', passive: 'multi', to: 'leg_seraph_wing' },
  { from: 'bear_trap', passive: 'endure', to: 'leg_black_hole' },
  { from: 'marksman_shot', passive: 'swift', to: 'leg_shadow_arrow' },
  { from: 'phantom_arrow', passive: 'multi', to: 'leg_shadow_arrow' },
  { from: 'hunters_blade', passive: 'haste', to: 'leg_crimson_knives' },

  // ── v2 rebuild — mage paths (11, full elemental routing) ───────────────
  { from: 'meteor', passive: 'might', to: 'leg_inferno_wall' },
  { from: 'ice_spear', passive: 'haste', to: 'leg_frozen_throne' },
  { from: 'arcane_orb', passive: 'lodestone', to: 'leg_galaxy_orb' },
  { from: 'frost_nova', passive: 'multi', to: 'leg_frozen_throne' },
  { from: 'magma_burst', passive: 'might', to: 'leg_inferno_wall' },

  // ── build-freedom expansion — paths for fortune/wisdom/regen2/pierce_passive ──
  // Each new passive gets at least 2 evolution paths so it has equal weight
  // with the established passives in the build-decision space.
  { from: 'soul_arrow', passive: 'fortune', to: 'leg_arrow' },
  { from: 'time_stop', passive: 'fortune', to: 'leg_eternal_frost' },
  { from: 'arcane_orb', passive: 'wisdom', to: 'leg_galaxy_orb' },
  { from: 'meteor', passive: 'wisdom', to: 'leg_inferno_wall' },
  { from: 'holywater', passive: 'regen2', to: 'leg_soul_lantern' },
  { from: 'consecrate', passive: 'regen2', to: 'leg_seraph_wing' },
  { from: 'ice_spear', passive: 'pierce_passive', to: 'leg_frozen_throne' },
  { from: 'phantom_arrow', passive: 'pierce_passive', to: 'leg_shadow_arrow' },
];

// Evolve any owned weapon whose recipe is now satisfied — its base is at max
// level, the paired passive is owned, and the legendary isn't already held.
// Mutates loadout.weapons; returns the legendary weapon defs that evolved
// this call (callers toast them).
export function evolveCheck(loadout) {
  const evolved = [];
  for (const r of EVOLUTIONS) {
    const baseDef = WEAPONS[r.from];
    const lvl = loadout.weapons[r.from];
    if (
      baseDef &&
      lvl >= baseDef.maxLevel &&
      (loadout.passives[r.passive] || 0) >= 1 &&
      !loadout.weapons[r.to]
    ) {
      delete loadout.weapons[r.from];
      loadout.weapons[r.to] = 1;
      evolved.push(WEAPONS[r.to]);
    }
  }
  return evolved;
}
