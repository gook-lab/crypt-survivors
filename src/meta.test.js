import { describe, it, expect } from 'vitest';
import { costFor, applyMetaUpgrades, COST_SCALE } from './meta.js';
import { createLoadout } from './loadout.js';
import { META_UPGRADES } from './content/metaUpgrades.js';

const upgrade = (id) => META_UPGRADES.find((u) => u.id === id);

describe('meta', () => {
  it('costFor reads the per-level cost array (scaled by COST_SCALE)', () => {
    const u = META_UPGRADES[0];
    expect(costFor(u, 0)).toBe(Math.ceil(u.cost[0] * COST_SCALE));
    expect(costFor(u, 2)).toBe(Math.ceil(u.cost[2] * COST_SCALE));
  });

  // VS PowerUps rework: might 0.05/lev (was 0.03), vigor→maxhealth (+10/lev),
  // revive→revival, + new Speed (projSpeed) / Curse (curse) keys.
  it('the might upgrade raises the damage multiplier', () => {
    const lo = createLoadout();
    applyMetaUpgrades(lo, { maxHp: 100, hp: 100 }, { might: 3 }); // 0.05/level
    expect(lo.damageMult).toBeCloseTo(1.15, 5); // (1+0) * (1 + 0.15)
  });

  it('the maxhealth upgrade raises and fills the player max hp', () => {
    const lo = createLoadout();
    const player = { maxHp: 100, hp: 50 };
    applyMetaUpgrades(lo, player, { maxhealth: 3 }); // 10/level -> +30
    expect(lo.maxHp).toBe(130);
    expect(player.maxHp).toBe(130);
    expect(player.hp).toBe(130); // a run starts at full hp
  });

  it('sets player armor and revives from those upgrades', () => {
    const lo = createLoadout();
    const player = { maxHp: 100, hp: 100 };
    applyMetaUpgrades(lo, player, { armor: 3, revival: 1 });
    expect(player.armor).toBeCloseTo(0.075, 5); // 0.025 * 3
    expect(player.revives).toBe(1);
  });

  it('Speed raises the projectile speed multiplier', () => {
    const lo = createLoadout();
    applyMetaUpgrades(lo, { maxHp: 100, hp: 100 }, { speed: 2 }); // 0.10/level
    expect(lo.projSpeedMult).toBeCloseTo(1.2, 5);
  });

  it('Curse accumulates into loadout.meta.curse (spawn reads it)', () => {
    const lo = createLoadout();
    applyMetaUpgrades(lo, { maxHp: 100, hp: 100 }, { curse: 5 }); // 0.08/level
    expect(lo.meta.curse).toBeCloseTo(0.4, 5);
  });

  it('grants run tokens from economy upgrades', () => {
    const lo = createLoadout();
    const before = lo.tokens.reroll || 0;
    applyMetaUpgrades(lo, { maxHp: 100, hp: 100 }, { reroll: 2 });
    expect(lo.tokens.reroll).toBe(before + 2);
  });

  it('leaves baselines intact with no saved upgrades', () => {
    const lo = createLoadout();
    const player = { maxHp: 100, hp: 100 };
    applyMetaUpgrades(lo, player, {});
    expect(lo.damageMult).toBe(1);
    expect(player.revives).toBe(0);
  });

  it('every meta upgrade carries a meta map or a token', () => {
    const meta = createLoadout().meta;
    for (let i = 0; i < META_UPGRADES.length; i++) {
      const u = META_UPGRADES[i];
      expect(Boolean(u.meta) || Boolean(u.token)).toBe(true);
      if (u.meta) {
        for (const k in u.meta) expect(meta).toHaveProperty(k);
      }
    }
  });
});
