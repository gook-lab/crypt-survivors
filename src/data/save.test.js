import { describe, it, expect } from 'vitest';
import { loadSave, writeSave, addGold } from './save.js';

// in-memory stand-in for localStorage
function fakeStorage() {
  const d = {};
  return {
    getItem: (k) => (k in d ? d[k] : null),
    setItem: (k, v) => {
      d[k] = String(v);
    },
  };
}

describe('save', () => {
  it('round-trips a save through write and load', () => {
    const s = fakeStorage();
    writeSave({ gold: 250, upgrades: { might: 2 } }, s);
    const loaded = loadSave(s);
    expect(loaded.gold).toBe(250);
    expect(loaded.upgrades.might).toBe(2); // 'might' is a current META_UPGRADES id
  });

  it('prunes stale ids from id-keyed maps but keeps current ones', () => {
    // Old saves carry ids for content removed/renamed across versions. loadSave
    // drops them (vs the current catalogs) so they can't clutter the save or
    // strand gold (a stale upgrade id is unrefundable). Valid ids are kept.
    const s = fakeStorage();
    s.setItem('vs-clone-save', JSON.stringify({
      upgrades: { might: 3, removed_old_upgrade: 9 },
      achievements: { kills_100: true, deleted_ach: true },
      discoveredFusions: { steam: true, ghost_fusion: true },
      heroLevels: { knight: 2, removed_hero: 5 },
    }));
    const loaded = loadSave(s);
    expect(loaded.upgrades).toEqual({ might: 3 });
    expect(loaded.achievements.kills_100).toBe(true);
    expect(loaded.achievements.deleted_ach).toBeUndefined();
    expect(loaded.discoveredFusions.steam).toBe(true);
    expect(loaded.discoveredFusions.ghost_fusion).toBeUndefined();
    expect(loaded.heroLevels.knight).toBe(2);
    expect(loaded.heroLevels.removed_hero).toBeUndefined();
  });

  it('returns defaults when nothing is stored', () => {
    expect(loadSave(fakeStorage())).toEqual({
      gold: 0, goldLifetime: 0, upgrades: {}, unlockedChapters: 3,
      stats: { kills: 0, bosses: 0, crits: 0, damage: 0, runs: 0, maxLevel: 1, longestSurvival: 0, goldLifetime: 0 },
      achievements: {}, heroLevels: {}, tutorialShown: false, discoveredFusions: {}, hellModeUnlocked: false, hellModeEnabled: false, runHistory: [], weeklyRecords: {},
    });
  });

  it('falls back to defaults on corrupt JSON', () => {
    const s = fakeStorage();
    s.setItem('vs-clone-save', '{not valid json');
    expect(loadSave(s)).toEqual({
      gold: 0, goldLifetime: 0, upgrades: {}, unlockedChapters: 3,
      stats: { kills: 0, bosses: 0, crits: 0, damage: 0, runs: 0, maxLevel: 1, longestSurvival: 0, goldLifetime: 0 },
      achievements: {}, heroLevels: {}, tutorialShown: false, discoveredFusions: {}, hellModeUnlocked: false, hellModeEnabled: false, runHistory: [], weeklyRecords: {},
    });
  });

  it('falls back to defaults on a non-object payload', () => {
    const s = fakeStorage();
    s.setItem('vs-clone-save', '42');
    expect(loadSave(s)).toEqual({
      gold: 0, goldLifetime: 0, upgrades: {}, unlockedChapters: 3,
      stats: { kills: 0, bosses: 0, crits: 0, damage: 0, runs: 0, maxLevel: 1, longestSurvival: 0, goldLifetime: 0 },
      achievements: {}, heroLevels: {}, tutorialShown: false, discoveredFusions: {}, hellModeUnlocked: false, hellModeEnabled: false, runHistory: [], weeklyRecords: {},
    });
  });

  it('sanitises a negative or non-numeric gold value', () => {
    const s = fakeStorage();
    s.setItem('vs-clone-save', JSON.stringify({ gold: -99, upgrades: {} }));
    expect(loadSave(s).gold).toBe(0);
  });

  it('writeSave reports failure instead of throwing when storage rejects', () => {
    const quotaFull = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(writeSave({ gold: 1, upgrades: {} }, quotaFull)).toBe(false);
  });

  it('loadSave returns defaults when storage is unavailable', () => {
    expect(loadSave(null)).toEqual({
      gold: 0, goldLifetime: 0, upgrades: {}, unlockedChapters: 3,
      stats: { kills: 0, bosses: 0, crits: 0, damage: 0, runs: 0, maxLevel: 1, longestSurvival: 0, goldLifetime: 0 },
      achievements: {}, heroLevels: {}, tutorialShown: false, discoveredFusions: {}, hellModeUnlocked: false, hellModeEnabled: false, runHistory: [], weeklyRecords: {},
    });
  });

  it('addGold accumulates the run total', () => {
    const s = fakeStorage();
    addGold(120, s);
    expect(addGold(80, s)).toBe(200);
  });

  // ── build-freedom expansion — stats.goldLifetime migration ─────────────
  it('addGold mirrors lifetime gold into stats.goldLifetime', () => {
    const s = fakeStorage();
    addGold(120, s);
    addGold(80, s);
    expect(loadSave(s).stats.goldLifetime).toBe(200);
  });

  it('legacy save without stats.goldLifetime falls back to 0', () => {
    const s = fakeStorage();
    // simulate an older save that pre-dates the goldLifetime stats field
    s.setItem('vs-clone-save', JSON.stringify({
      gold: 500,
      stats: { kills: 99, bosses: 3, crits: 10, damage: 1000, runs: 2, maxLevel: 15, longestSurvival: 300 },
    }));
    const loaded = loadSave(s);
    expect(loaded.stats.goldLifetime).toBe(0);
    expect(loaded.stats.kills).toBe(99); // existing stats preserved
  });
});
