// Sky-drop FX state machine — telegraph → fall → impact → idle.
//
// Owns NO state. Helpers mutate a state object you pass in. Two consumers
// share this pipeline:
//   - systems/active.js (player signature ultimate — spacebar cast)
//   - systems/weaponFire.js AoE pattern (future — per-weapon sky-drop)
//
// Renderer-facing shape is preserved: state.castPhase / .telegraphTime /
// .telegraphTotal / .castTargets / .drops match what engine/renderer.js
// reads. Per-signature visual fields (sig.kind, sig.meteorAsset, etc) stay
// on a sibling `sig` field owned by the caller.
//
// Lifecycle:
//   1. createSkyDropState() → fresh state with castPhase='idle'
//   2. beginCast(state, { targets, telegraphTime }) → enters 'telegraph'
//   3. tickSkyDrop(state, dt, config, callbacks) every frame → advances
//      phases; calls onImpact(drop,isFirst) per drop landing; returns
//      `'resolved'` when last drop finishes (caller resets cooldown then).
//
// All math is deterministic per (state,dt) — no Math.random inside the
// module so callers can seed their own RNG for tests.

export const SKY_DROP_DEFAULTS = {
  fallTime: 0.55,        // seconds from telegraph end → first drop impact
  meteorStagger: 0.04,   // per-drop delay so impacts don't all share a frame
  impactFxLife: 0.4,     // seconds the impact burst remains visible
};

// Build a fresh state object. Renderer.drawActive reads these fields
// directly so the field names matter.
export function createSkyDropState() {
  return {
    castPhase: 'idle',        // 'idle' | 'telegraph' | 'falling'
    telegraphTime: 0,
    telegraphTotal: 0,
    castTargets: [],          // [{x,y}] visible during 'telegraph'
    drops: [],                // [{x,y,fallTimer,fallTotal,exploded,impactLife,index}]
  };
}

// Reset to idle. Existing array references are kept (just length=0) so
// renderer's references stay valid across runs.
export function resetSkyDropState(state) {
  state.castPhase = 'idle';
  state.telegraphTime = 0;
  state.telegraphTotal = 0;
  state.castTargets.length = 0;
  state.drops.length = 0;
}

// Enter 'telegraph' with the given targets. Defensive-copies the target
// array so caller can reuse its scratch buffer.
export function beginCast(state, { targets, telegraphTime }) {
  state.castTargets.length = 0;
  for (let i = 0; i < targets.length; i++) {
    state.castTargets.push({ x: targets[i].x, y: targets[i].y });
  }
  state.telegraphTime = telegraphTime;
  state.telegraphTotal = telegraphTime;
  state.castPhase = 'telegraph';
}

// Advance the state machine one frame.
//
// config: { fallTime, meteorStagger, impactFxLife } — any missing field
//         falls back to SKY_DROP_DEFAULTS.
// callbacks: { onImpact(drop, isFirstImpactThisFrame), onTelegraphEnd() }
//            both optional — caller wires in damage/audio/shake here.
//
// Returns one of:
//   'idle'      — state.castPhase remained 'idle' (nothing to do)
//   'telegraph' — still telegraphing or just entered falling this frame
//   'falling'   — drops in flight or impacting
//   'resolved'  — last drop's impact FX just expired this frame; caller
//                 should now reset cooldown / cleanup.
export function tickSkyDrop(state, dt, config = {}, callbacks = {}) {
  const fallTime = config.fallTime ?? SKY_DROP_DEFAULTS.fallTime;
  const stagger = config.meteorStagger ?? SKY_DROP_DEFAULTS.meteorStagger;
  const impactLife = config.impactFxLife ?? SKY_DROP_DEFAULTS.impactFxLife;

  if (state.castPhase === 'idle') return 'idle';

  // ---- Phase: telegraph (rings pulsing, locked targets) ----
  if (state.castPhase === 'telegraph') {
    state.telegraphTime -= dt;
    if (state.telegraphTime <= 0) {
      for (let i = 0; i < state.castTargets.length; i++) {
        const t = state.castTargets[i];
        const total = fallTime + i * stagger;
        state.drops.push({
          x: t.x,
          y: t.y,
          fallTimer: total,
          fallTotal: total,
          exploded: false,
          impactLife: 0,
          index: i,
        });
      }
      state.castTargets.length = 0;
      state.castPhase = 'falling';
      if (callbacks.onTelegraphEnd) callbacks.onTelegraphEnd();
    }
  }

  // ---- Phase: falling (descend → impact → fade) ----
  if (state.castPhase === 'falling') {
    let firstImpactThisFrame = false;
    for (let i = state.drops.length - 1; i >= 0; i--) {
      const d = state.drops[i];
      if (!d.exploded) {
        d.fallTimer -= dt;
        if (d.fallTimer <= 0) {
          d.exploded = true;
          d.impactLife = impactLife;
          const isFirst = !firstImpactThisFrame;
          firstImpactThisFrame = true;
          if (callbacks.onImpact) callbacks.onImpact(d, isFirst);
        }
      } else {
        d.impactLife -= dt;
        if (d.impactLife <= 0) state.drops.splice(i, 1);
      }
    }
    if (state.drops.length === 0) {
      state.castPhase = 'idle';
      return 'resolved';
    }
    return 'falling';
  }

  return state.castPhase;
}

// Convenience: true if no cast is in flight.
export function isIdle(state) {
  return state.castPhase === 'idle';
}
