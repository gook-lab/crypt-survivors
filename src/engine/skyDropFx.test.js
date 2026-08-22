import { describe, it, expect } from 'vitest';
import {
  createSkyDropState,
  resetSkyDropState,
  beginCast,
  tickSkyDrop,
  isIdle,
  SKY_DROP_DEFAULTS,
} from './skyDropFx.js';

describe('createSkyDropState', () => {
  it('starts in idle with empty arrays', () => {
    const s = createSkyDropState();
    expect(s.castPhase).toBe('idle');
    expect(s.castTargets).toEqual([]);
    expect(s.drops).toEqual([]);
    expect(s.telegraphTime).toBe(0);
    expect(s.telegraphTotal).toBe(0);
  });

  it('idle tick returns "idle" with no callbacks fired', () => {
    const s = createSkyDropState();
    let impacts = 0;
    let teleEnds = 0;
    const r = tickSkyDrop(s, 0.016, {}, {
      onImpact: () => impacts++,
      onTelegraphEnd: () => teleEnds++,
    });
    expect(r).toBe('idle');
    expect(impacts).toBe(0);
    expect(teleEnds).toBe(0);
  });
});

describe('beginCast', () => {
  it('captures targets and enters telegraph', () => {
    const s = createSkyDropState();
    beginCast(s, {
      targets: [{ x: 10, y: 20 }, { x: 30, y: 40 }],
      telegraphTime: 0.8,
    });
    expect(s.castPhase).toBe('telegraph');
    expect(s.castTargets.length).toBe(2);
    expect(s.castTargets[0]).toEqual({ x: 10, y: 20 });
    expect(s.telegraphTime).toBeCloseTo(0.8, 3);
    expect(s.telegraphTotal).toBeCloseTo(0.8, 3);
  });

  it('defensively copies the target array', () => {
    const s = createSkyDropState();
    const targets = [{ x: 1, y: 2 }];
    beginCast(s, { targets, telegraphTime: 0.5 });
    targets[0].x = 999; // mutate caller's array
    expect(s.castTargets[0].x).toBe(1); // state unaffected
  });

  it('can be called from idle and from a previous resolved state', () => {
    const s = createSkyDropState();
    beginCast(s, { targets: [{ x: 0, y: 0 }], telegraphTime: 0.1 });
    expect(s.castPhase).toBe('telegraph');
    resetSkyDropState(s);
    expect(s.castPhase).toBe('idle');
    beginCast(s, { targets: [{ x: 5, y: 5 }], telegraphTime: 0.2 });
    expect(s.castTargets.length).toBe(1);
    expect(s.castTargets[0].x).toBe(5);
  });
});

describe('tickSkyDrop — telegraph phase', () => {
  it('does not fire onImpact during telegraph', () => {
    const s = createSkyDropState();
    beginCast(s, { targets: [{ x: 0, y: 0 }], telegraphTime: 0.8 });
    let impacts = 0;
    tickSkyDrop(s, 0.016, {}, { onImpact: () => impacts++ });
    expect(impacts).toBe(0);
  });

  it('counts down telegraphTime and stays in telegraph until time runs out', () => {
    const s = createSkyDropState();
    beginCast(s, { targets: [{ x: 0, y: 0 }], telegraphTime: 0.1 });
    tickSkyDrop(s, 0.05, {});
    expect(s.castPhase).toBe('telegraph');
    expect(s.telegraphTime).toBeCloseTo(0.05, 3);
  });

  it('fires onTelegraphEnd exactly once when telegraph completes', () => {
    const s = createSkyDropState();
    beginCast(s, { targets: [{ x: 0, y: 0 }], telegraphTime: 0.1 });
    let ends = 0;
    // tick well past telegraphTime
    tickSkyDrop(s, 0.2, {}, { onTelegraphEnd: () => ends++ });
    expect(ends).toBe(1);
    expect(s.castPhase).toBe('falling');
  });

  it('telegraph end enqueues N drops with staggered fall timers', () => {
    const s = createSkyDropState();
    const targets = [
      { x: 10, y: 0 },
      { x: 20, y: 0 },
      { x: 30, y: 0 },
    ];
    beginCast(s, { targets, telegraphTime: 0.05 });
    // Use a very small dt so the same-frame fall-through deduction is
    // negligible (original active.js behavior: when telegraph and falling
    // run in the same frame, dt deducts from both — minor over-tick).
    tickSkyDrop(s, 0.06, { fallTime: 0.5, meteorStagger: 0.1 });
    expect(s.castPhase).toBe('falling');
    expect(s.drops.length).toBe(3);
    expect(s.drops[0].fallTotal).toBeCloseTo(0.5, 3);
    expect(s.drops[1].fallTotal).toBeCloseTo(0.6, 3);
    expect(s.drops[2].fallTotal).toBeCloseTo(0.7, 3);
    expect(s.castTargets.length).toBe(0); // targets consumed
  });
});

describe('tickSkyDrop — falling phase', () => {
  it('fires onImpact when a drop lands', () => {
    const s = createSkyDropState();
    beginCast(s, { targets: [{ x: 7, y: 13 }], telegraphTime: 0.01 });
    const impacts = [];
    const cfg = { fallTime: 0.1, meteorStagger: 0, impactFxLife: 0.1 };
    // telegraph → falling
    tickSkyDrop(s, 0.05, cfg);
    // fall through impact
    tickSkyDrop(s, 0.2, cfg, { onImpact: (d, first) => impacts.push({ x: d.x, y: d.y, first }) });
    expect(impacts.length).toBe(1);
    expect(impacts[0]).toEqual({ x: 7, y: 13, first: true });
  });

  it('marks isFirstImpactThisFrame only on the first impact of a frame', () => {
    const s = createSkyDropState();
    beginCast(s, {
      targets: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 20, y: 0 }],
      telegraphTime: 0.01,
    });
    const cfg = { fallTime: 0.05, meteorStagger: 0, impactFxLife: 0.1 };
    tickSkyDrop(s, 0.02, cfg);
    // all 3 drops have same fallTimer (stagger=0) — single big tick lands them together
    const flags = [];
    tickSkyDrop(s, 0.2, cfg, { onImpact: (d, first) => flags.push(first) });
    expect(flags.length).toBe(3);
    expect(flags[0]).toBe(true);
    expect(flags[1]).toBe(false);
    expect(flags[2]).toBe(false);
  });

  it('removes drops after impactFxLife expires and returns "resolved"', () => {
    const s = createSkyDropState();
    beginCast(s, { targets: [{ x: 0, y: 0 }], telegraphTime: 0.01 });
    const cfg = { fallTime: 0.05, meteorStagger: 0, impactFxLife: 0.1 };
    let resolves = 0;
    let last = '';
    // step through telegraph + fall + impact fade
    for (let i = 0; i < 30; i++) {
      const r = tickSkyDrop(s, 0.02, cfg);
      if (r === 'resolved') resolves++;
      last = r;
    }
    expect(resolves).toBe(1);
    expect(s.drops.length).toBe(0);
    expect(s.castPhase).toBe('idle');
    expect(last).toBe('idle');
  });

  it('does not call onImpact twice for the same drop', () => {
    const s = createSkyDropState();
    beginCast(s, { targets: [{ x: 0, y: 0 }], telegraphTime: 0.01 });
    const cfg = { fallTime: 0.05, meteorStagger: 0, impactFxLife: 0.2 };
    let impacts = 0;
    for (let i = 0; i < 30; i++) {
      tickSkyDrop(s, 0.02, cfg, { onImpact: () => impacts++ });
    }
    expect(impacts).toBe(1);
  });
});

describe('tickSkyDrop — defaults', () => {
  it('SKY_DROP_DEFAULTS provides fallTime / stagger / impactFxLife', () => {
    expect(SKY_DROP_DEFAULTS.fallTime).toBeGreaterThan(0);
    expect(SKY_DROP_DEFAULTS.meteorStagger).toBeGreaterThanOrEqual(0);
    expect(SKY_DROP_DEFAULTS.impactFxLife).toBeGreaterThan(0);
  });

  it('missing config falls back to defaults', () => {
    const s = createSkyDropState();
    beginCast(s, { targets: [{ x: 0, y: 0 }], telegraphTime: 0.01 });
    tickSkyDrop(s, 0.1, {}); // empty config → defaults
    expect(s.drops[0].fallTotal).toBeCloseTo(SKY_DROP_DEFAULTS.fallTime, 3);
  });
});

describe('resetSkyDropState', () => {
  it('clears all transient state without changing identity of arrays', () => {
    const s = createSkyDropState();
    const targetsRef = s.castTargets;
    const dropsRef = s.drops;
    beginCast(s, { targets: [{ x: 1, y: 2 }, { x: 3, y: 4 }], telegraphTime: 0.5 });
    resetSkyDropState(s);
    expect(s.castPhase).toBe('idle');
    expect(s.castTargets.length).toBe(0);
    expect(s.drops.length).toBe(0);
    expect(s.telegraphTime).toBe(0);
    expect(s.telegraphTotal).toBe(0);
    // identity preserved — renderer cached references stay valid
    expect(s.castTargets).toBe(targetsRef);
    expect(s.drops).toBe(dropsRef);
  });
});

describe('isIdle', () => {
  it('true when castPhase is idle, false otherwise', () => {
    const s = createSkyDropState();
    expect(isIdle(s)).toBe(true);
    beginCast(s, { targets: [{ x: 0, y: 0 }], telegraphTime: 0.5 });
    expect(isIdle(s)).toBe(false);
  });
});
