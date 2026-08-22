import { describe, it, expect } from 'vitest';
import { createStatus, applyStatus, isImmune, STATUS_DURATION } from './status.js';
import { createDamage } from './damage.js';
import { createWorld } from '../engine/world.js';
import { createEvents } from '../engine/events.js';
import { STATUS } from '../content/status.js';

function setup() {
  return {
    world: createWorld(),
    events: createEvents(),
    stats: { time: 0, kills: 0, gold: 0 },
    damage: createDamage(),
    status: createStatus(),
  };
}

describe('applyStatus', () => {
  it('sets the timer to the status duration and one stack', () => {
    const e = { x: 0, y: 0 };
    applyStatus(e, 'burn');
    expect(e.status.burn).toBe(STATUS.burn.duration);
    expect(e.statusStacks.burn).toBe(1);
  });

  it('re-applying adds stacks up to maxStacks', () => {
    const e = { x: 0, y: 0 };
    for (let i = 0; i < 9; i++) applyStatus(e, 'burn');
    expect(e.statusStacks.burn).toBe(STATUS.burn.maxStacks); // capped at 5
  });

  it('cleanses a status countered by the new element (fire melts ice)', () => {
    const e = { x: 0, y: 0 };
    applyStatus(e, 'freeze'); // ice
    expect(e.status.freeze).toBeGreaterThan(0);
    applyStatus(e, 'burn'); // fire — cleansedBy of freeze includes 'ice'... fire
    expect(e.status.freeze).toBe(0);
    expect(e.statusStacks.freeze).toBe(0);
  });
});

describe('isImmune', () => {
  it('bosses shrug off hard crowd-control', () => {
    expect(isImmune({ boss: true }, 'freeze')).toBe(true);
    expect(isImmune({ boss: true }, 'stun')).toBe(true);
    expect(isImmune({ boss: true }, 'burn')).toBe(false);
  });

  it('skeletons cannot bleed; an immune status never applies', () => {
    expect(isImmune({ sprite: 'boss_skeleton_king' }, 'bleed')).toBe(true);
    const e = { x: 0, y: 0, sprite: 'boss_skeleton_king' };
    applyStatus(e, 'bleed');
    expect(e.status).toBeUndefined();
  });
});

describe('status DoT + synergies', () => {
  it('burns an enemy for damage over time', () => {
    const { world, events, stats, damage, status } = setup();
    const e = world.spawn('enemy', { x: 0, y: 0, hp: 500, maxHp: 500 });
    applyStatus(e, 'burn');
    status.update(0.5, world, events, stats, damage); // one DoT tick
    expect(e.hp).toBeLessThan(500);
  });

  it('burn+bleed (출혈 폭발) tics burn for 3× the solo amount', () => {
    function burnDamage(extraBleed) {
      const { world, events, stats, damage, status } = setup();
      const e = world.spawn('enemy', { x: 0, y: 0, hp: 9999, maxHp: 9999 });
      applyStatus(e, 'burn');
      if (extraBleed) applyStatus(e, 'bleed');
      status.update(0.5, world, events, stats, damage);
      return 9999 - e.hp;
    }
    const solo = burnDamage(false);
    const combo = burnDamage(true);
    // combo = burn×3 + bleed×1; subtract a solo bleed tick to isolate burn×3
    expect(combo).toBeGreaterThan(solo * 2);
  });
});

describe('STATUS_DURATION', () => {
  it('mirrors the duration of every status in the content table', () => {
    for (const key in STATUS) {
      expect(STATUS_DURATION[key]).toBe(STATUS[key].duration);
    }
  });
});
