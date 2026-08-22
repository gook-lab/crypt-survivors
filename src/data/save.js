// Persistent save — localStorage, defensively handled (eng-review CQ1).
//
// Save failures (quota, private mode, disabled storage) and corrupt data must
// never crash: writes swallow errors, loads validate the shape and fall back
// to fresh defaults. The storage object is injectable for unit tests.
//
// Shape: gold (spendable) · goldLifetime (earned, for achievements) ·
// upgrades (shop levels) · unlockedChapters · stats (lifetime counters) ·
// achievements (unlocked id map).

import { META_UPGRADES } from '../content/metaUpgrades.js';
import { ACHIEVEMENTS } from '../content/achievements.js';
import { CHARACTERS } from '../content/characters.js';
import { SPIRITS } from '../content/spirits.js';

const KEY = 'vs-clone-save';

// Source-of-truth id sets for stale-id pruning (see pruneIds). Built once at
// module load from the current content catalogs — these four content modules
// are pure data and never import save.js, so there is no import cycle.
const VALID_UPGRADE_IDS = new Set(META_UPGRADES.map((u) => u.id));
const VALID_ACHIEVEMENT_IDS = new Set(ACHIEVEMENTS.map((a) => a.id));
const VALID_HERO_IDS = new Set(CHARACTERS.map((c) => c.id));
const VALID_FUSION_IDS = new Set(
  Object.keys(SPIRITS).filter((k) => SPIRITS[k] && SPIRITS[k].fused),
);

function freshStats() {
  return {
    kills: 0, bosses: 0, crits: 0, damage: 0, runs: 0, maxLevel: 1,
    longestSurvival: 0, // longest single-run survival in seconds
    goldLifetime: 0, // lifetime gold earned — drives midas arcana unlock
  };
}

function fresh() {
  return {
    gold: 0,
    goldLifetime: 0,
    upgrades: {},
    // chapters 1-3 (던전·숲·늪) are open from the start; 4 (용암) and 5 (서리)
    // unlock by clearing the chapter before them
    unlockedChapters: 3,
    stats: freshStats(),
    achievements: {},
    heroLevels: {}, // per-hero permanent damage upgrade (id -> level)
    tutorialShown: false, // first-run guide toasts played
    discoveredFusions: {}, // spirit-fusion id -> true once discovered
    hellModeUnlocked: false, // unlocked after first 10-min survival
    hellModeEnabled: false, // toggled via settings (or charselect after unlock)
    runHistory: [], // last 10 completed runs (most-recent first)
  };
}

function getStore(storage) {
  if (storage) return storage;
  return typeof localStorage !== 'undefined' ? localStorage : null;
}

const num = (v, min, fallback) =>
  (Number.isFinite(v) && v >= min ? v : fallback);

// Drop id-keyed entries whose id is no longer in the current content catalog.
// Old saves carry ids for upgrades / achievements / fusions that were renamed
// or removed across versions; left in place they clutter the save and, worse,
// a stale upgrade id is unrefundable — the shop's totalSpent only iterates the
// current META_UPGRADES, so the gold spent on a removed upgrade is stranded.
// Pure: returns a new object, never mutates the input. Non-object → {}.
function pruneIds(obj, validSet, label) {
  if (!obj || typeof obj !== 'object') return {};
  const out = {};
  let dropped = 0;
  for (const k in obj) {
    if (validSet.has(k)) out[k] = obj[k];
    else dropped += 1;
  }
  if (dropped > 0 && typeof console !== 'undefined' && console.warn) {
    console.warn('[save] pruned ' + dropped + ' stale ' + label + ' id(s)');
  }
  return out;
}

export function loadSave(storage) {
  const store = getStore(storage);
  if (!store) return fresh();
  try {
    const raw = store.getItem(KEY);
    if (!raw) return fresh();
    const d = JSON.parse(raw);
    if (!d || typeof d !== 'object') return fresh();
    const s = d.stats && typeof d.stats === 'object' ? d.stats : {};
    return {
      gold: num(d.gold, 0, 0),
      goldLifetime: num(d.goldLifetime, 0, 0),
      upgrades: pruneIds(d.upgrades, VALID_UPGRADE_IDS, 'upgrade'),
      unlockedChapters: Math.max(3, num(d.unlockedChapters, 0, 3)),
      stats: {
        kills: num(s.kills, 0, 0),
        bosses: num(s.bosses, 0, 0),
        crits: num(s.crits, 0, 0),
        damage: num(s.damage, 0, 0),
        runs: num(s.runs, 0, 0),
        maxLevel: num(s.maxLevel, 1, 1),
        longestSurvival: num(s.longestSurvival, 0, 0),
        goldLifetime: num(s.goldLifetime, 0, 0),
      },
      achievements: pruneIds(d.achievements, VALID_ACHIEVEMENT_IDS, 'achievement'),
      heroLevels: pruneIds(d.heroLevels, VALID_HERO_IDS, 'heroLevel'),
      tutorialShown: d.tutorialShown === true,
      discoveredFusions: pruneIds(d.discoveredFusions, VALID_FUSION_IDS, 'fusion'),
      hellModeUnlocked: d.hellModeUnlocked === true,
      hellModeEnabled: d.hellModeEnabled === true,
      runHistory: Array.isArray(d.runHistory) ? d.runHistory.slice(0, 10) : [],
    };
  } catch {
    return fresh();
  }
}

export function writeSave(save, storage) {
  const store = getStore(storage);
  if (!store) return false;
  try {
    store.setItem(KEY, JSON.stringify(save));
    return true;
  } catch {
    return false; // quota / disabled — non-fatal
  }
}

// Add a run's gold to the persistent total (spendable + lifetime).
export function addGold(amount, storage) {
  const save = loadSave(storage);
  const g = Math.max(0, Math.floor(amount));
  save.gold += g;
  save.goldLifetime += g;
  // stats.goldLifetime mirrors save.goldLifetime so the unlocked-arcana
  // picker (which only sees save.stats) can gate the midas arcana on it.
  save.stats.goldLifetime = (save.stats.goldLifetime || 0) + g;
  writeSave(save, storage);
  return save.gold;
}

// Raise the highest unlocked chapter (stage progression).
export function unlockChapter(chapter, storage) {
  const save = loadSave(storage);
  if (chapter > save.unlockedChapters) {
    save.unlockedChapters = chapter;
    writeSave(save, storage);
  }
  return save.unlockedChapters;
}
