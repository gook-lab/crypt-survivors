import { describe, it, expect } from 'vitest';
import { stepCount } from './loop.js';

const DT = 1 / 60;

describe('stepCount (fixed-timestep accumulator)', () => {
  it('runs one step for a ~16.7ms frame', () => {
    const r = stepCount(0, DT, DT, 5);
    expect(r.steps).toBe(1);
    expect(r.accumulator).toBeCloseTo(0, 6);
  });

  it('runs zero steps for a tiny frame', () => {
    const r = stepCount(0, DT / 4, DT, 5);
    expect(r.steps).toBe(0);
  });

  it('clamps catch-up steps and drops debt on a long stall', () => {
    // 5 real seconds elapsed — without the clamp this would run 300 steps.
    const r = stepCount(0, 5, DT, 5);
    expect(r.steps).toBeLessThanOrEqual(5);
    expect(r.accumulator).toBe(0); // spiral-of-death debt dropped
  });

  it('accumulates the fractional remainder across frames', () => {
    let acc = 0;
    let total = 0;
    for (let i = 0; i < 60; i++) {
      const r = stepCount(acc, 0.01, DT, 5); // sixty 10ms frames = 600ms
      acc = r.accumulator;
      total += r.steps;
    }
    expect(total).toBeGreaterThan(30); // ~36 steps of 16.7ms
    expect(total).toBeLessThan(42);
  });

  it('ignores a negative frame time', () => {
    const r = stepCount(0, -1, DT, 5);
    expect(r.steps).toBe(0);
    expect(r.accumulator).toBe(0);
  });
});
