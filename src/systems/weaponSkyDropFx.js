// Per-weapon sky-drop FX — visual overlay for AoE pattern weapons that
// declare `aoeKit` in their definition.
//
// Pure cosmetic layer:
//   - Damage timing is unchanged (zone projectile still pulses on rehit).
//   - This system maintains a pool of in-flight FX instances and ticks
//     each through the shared engine/skyDropFx.js state machine.
//   - Renderer iterates getRenderInstances() to draw telegraph rings,
//     falling bodies, and impact bursts on top of the existing zone disc.
//
// Self-contained pattern (CLAUDE.md "Self-contained world entities"):
// instances live here, no other system reads or writes them.

import {
  createSkyDropState,
  resetSkyDropState,
  beginCast,
  tickSkyDrop,
} from '../engine/skyDropFx.js';

export function createWeaponSkyDropFx() {
  // Each instance: { x, y, state, kit, weaponId }
  // `state` follows engine/skyDropFx state shape (castPhase/drops/etc).
  // `kit` is the def.aoeKit from content/weapons.js for renderer palette
  // and asset lookup.
  const instances = [];

  function spawn({ x, y, kit, weaponId }) {
    if (!kit) return;
    const state = createSkyDropState();
    beginCast(state, {
      targets: [{ x, y }],
      telegraphTime: kit.telegraphTime ?? 0.5,
    });
    instances.push({ x, y, state, kit, weaponId });
  }

  function update(dt) {
    for (let i = instances.length - 1; i >= 0; i--) {
      const inst = instances[i];
      const result = tickSkyDrop(inst.state, dt, {
        fallTime: inst.kit.fallTime,
        meteorStagger: inst.kit.meteorStagger,
        impactFxLife: inst.kit.impactFxLife,
      });
      if (result === 'resolved') {
        instances.splice(i, 1);
      }
    }
  }

  function getRenderInstances() {
    return instances;
  }

  function reset() {
    for (let i = 0; i < instances.length; i++) {
      resetSkyDropState(instances[i].state);
    }
    instances.length = 0;
  }

  return { spawn, update, getRenderInstances, reset };
}
