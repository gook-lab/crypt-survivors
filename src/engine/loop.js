// Fixed-timestep game loop (eng-review D3).
//
// The simulation steps in fixed FIXED_DT chunks so behaviour is identical
// regardless of frame rate. Real elapsed time is accumulated; whole steps are
// drained from the accumulator each frame.
//
// Spiral-of-death guard: a single frame is capped at 0.25s, and no more than
// MAX_UPDATES_PER_FRAME catch-up steps run. If the sim is still behind after
// that (long background-tab stall), the leftover debt is dropped so the game
// resumes at normal speed instead of fast-forwarding.

import { FIXED_DT, MAX_UPDATES_PER_FRAME } from '../config.js';

// Pure accumulator math — unit-tested without a renderer.
// Returns how many fixed steps to run and the carried-over accumulator.
export function stepCount(
  accumulator,
  frameTime,
  fixedDt = FIXED_DT,
  maxSteps = MAX_UPDATES_PER_FRAME,
) {
  let acc = accumulator + Math.min(Math.max(frameTime, 0), 0.25);
  let steps = 0;
  while (acc >= fixedDt && steps < maxSteps) {
    acc -= fixedDt;
    steps++;
  }
  if (acc > fixedDt) acc = 0; // drop spiral-of-death debt
  return { steps, accumulator: acc };
}

// Wires the loop onto PixiJS's ticker (the rAF source — D3).
// update(dt) runs only while getState() === 'playing' (D4); render() always
// runs so menus/pause still draw.
export function createLoop({ ticker, getState, update, render }) {
  let accumulator = 0;

  ticker.add((t) => {
    if (getState() === 'playing') {
      const r = stepCount(accumulator, t.deltaMS / 1000);
      for (let i = 0; i < r.steps; i++) update(FIXED_DT);
      accumulator = r.accumulator;
    } else {
      accumulator = 0; // don't bank debt while paused
    }
    render();
  });
}
