// Achievement tracking — folds a finished run into the save, detects newly
// unlocked trophies and grants their gold rewards.
//
// Only achievements with a CHECK predicate are auto-tracked; the rest (combos,
// secrets, no-damage runs, ...) show on the page but are not yet detected.

import { ACHIEVEMENTS } from './content/achievements.js';
import { loadSave, writeSave } from './data/save.js';

// id -> predicate over the lifetime-stats snapshot
const CHECKS = {
  kills_100: (s) => s.kills >= 100,
  kills_1000: (s) => s.kills >= 1000,
  kills_10000: (s) => s.kills >= 10000,
  kills_100000: (s) => s.kills >= 100000,
  crit_1000: (s) => s.crits >= 1000,
  dmg_1m: (s) => s.damage >= 1000000,
  gold_total_10k: (s) => s.goldLifetime >= 10000,
  gold_total_100k: (s) => s.goldLifetime >= 100000,
  runs_10: (s) => s.runs >= 10,
  runs_100: (s) => s.runs >= 100,
  // longestSurvival tracks a single-run best in seconds (3/5/10/15 min)
  survival_3min: (s) => s.longestSurvival >= 180,
  survival_5min: (s) => s.longestSurvival >= 300,
  survival_10min: (s) => s.longestSurvival >= 600,
  survival_15min: (s) => s.longestSurvival >= 900,
  // maxLevel milestones — line up with the Lv 20/30/40 chapter unlock gates
  hero_lv20: (s) => s.maxLevel >= 20,
  hero_lv30: (s) => s.maxLevel >= 30,
  hero_lv40: (s) => s.maxLevel >= 40,
  hero_lv50: (s) => s.maxLevel >= 50,
  // spirit fusion discoveries (NN) — folded into snapshot by recordRun /
  // checkAchievements via save.discoveredFusions
  fusion_first: (s) => (s.fusionCount || 0) >= 1,
  fusion_all: (s) => (s.fusionCount || 0) >= 4,
  hero_knight: (s) => s.runs >= 1,
  hero_warrior: (s) => s.unlockedChapters >= 2,
  hero_mage: (s) => s.unlockedChapters >= 3,
  hero_huntress: (s) => s.unlockedChapters >= 4,
  hero_cleric: (s) => s.unlockedChapters >= 5,
  shop_upgrade_first: (s) => s.shopBought >= 1,
  boss_skeleton_king: (s) => s.bosses >= 1,
  boss_vampire: (s) => s.bosses >= 3,
  boss_demon: (s) => s.bosses >= 6,
  boss_lich: (s) => s.bosses >= 10,
  boss_all: (s) => s.bosses >= 14,
};

// is this achievement auto-tracked?
export function isTracked(id) {
  return !!CHECKS[id];
}

// Mid-run achievement scan — uses a synthetic stats snapshot that folds the
// current run's progress on top of save.stats so milestones unlock the
// moment they're earned (not on next death). Returns freshly-unlocked
// achievements + persists them. Cheap enough to call on level-up / boss kill.
export function checkAchievements(runDelta) {
  const save = loadSave();
  const s = save.stats;
  let shopBought = 0;
  for (const k in save.upgrades) shopBought += save.upgrades[k];
  let fusionCount = 0;
  for (const k in save.discoveredFusions || {}) if (save.discoveredFusions[k]) fusionCount++;
  const snapshot = {
    kills: s.kills + (runDelta.kills || 0),
    bosses: s.bosses + (runDelta.bosses || 0),
    crits: s.crits + (runDelta.crits || 0),
    damage: s.damage + (runDelta.damage || 0),
    runs: s.runs,
    maxLevel: Math.max(s.maxLevel, runDelta.level || 1),
    longestSurvival: Math.max(s.longestSurvival || 0, runDelta.time || 0),
    goldLifetime: save.goldLifetime,
    unlockedChapters: save.unlockedChapters,
    shopBought, fusionCount,
  };
  const fresh = [];
  for (let i = 0; i < ACHIEVEMENTS.length; i++) {
    const a = ACHIEVEMENTS[i];
    const fn = CHECKS[a.id];
    if (!fn || save.achievements[a.id] || !fn(snapshot)) continue;
    save.achievements[a.id] = true;
    const g = rewardGold(a.reward);
    save.gold += g;
    save.goldLifetime += g;
    fresh.push(a);
  }
  if (fresh.length > 0) writeSave(save);
  return fresh;
}

// gold parsed from a reward string like "+50 G" / "+1,000 G · 칭호…"
function rewardGold(str) {
  const m = (str || '').match(/\+([\d,]+)\s*G/);
  return m ? parseInt(m[1].replace(/,/g, ''), 10) : 0;
}

// Fold a finished run into the save, unlock newly-met achievements, grant
// their gold. Returns the freshly-unlocked achievement objects (for a toast).
export function recordRun(run) {
  const save = loadSave();
  const s = save.stats;
  s.kills += run.kills || 0;
  s.bosses += run.bosses || 0;
  s.crits += run.crits || 0;
  s.damage += run.damage || 0;
  s.runs += 1;
  s.maxLevel = Math.max(s.maxLevel, run.level || 1);
  s.longestSurvival = Math.max(s.longestSurvival || 0, run.time || 0);

  let shopBought = 0;
  for (const k in save.upgrades) shopBought += save.upgrades[k];
  let fusionCount = 0;
  for (const k in save.discoveredFusions || {}) if (save.discoveredFusions[k]) fusionCount++;
  const snapshot = {
    kills: s.kills, bosses: s.bosses, crits: s.crits, damage: s.damage,
    runs: s.runs, maxLevel: s.maxLevel,
    longestSurvival: s.longestSurvival || 0,
    goldLifetime: save.goldLifetime,
    unlockedChapters: save.unlockedChapters,
    shopBought, fusionCount,
  };

  const fresh = [];
  for (let i = 0; i < ACHIEVEMENTS.length; i++) {
    const a = ACHIEVEMENTS[i];
    const fn = CHECKS[a.id];
    if (!fn || save.achievements[a.id] || !fn(snapshot)) continue;
    save.achievements[a.id] = true;
    const g = rewardGold(a.reward);
    save.gold += g;
    save.goldLifetime += g;
    fresh.push(a);
  }
  writeSave(save);
  return fresh;
}
