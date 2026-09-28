// Weekly challenge mode — deterministic seeded runs from ISO week number.
//
// Every Monday-Sunday span (ISO week) gets a unique seed + 1-2 modifiers
// (enemy speed ±%, no healing items, etc.). Same week → same seed + same rules
// for all players. Different week → different seed + different rules.

import { createRng } from './rng.js';

// Extract ISO week (1-53) and year from a date.
// Returns { year: YYYY, week: 1-53 }
export function getIsoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Mon=1, Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return {
    year: d.getUTCFullYear(),
    week: weekNum,
  };
}

// Format week for display: "2026-W40"
export function formatWeek({ year, week }) {
  return `${year}-W${String(week).padStart(2, '0')}`;
}

// Derive a deterministic seed from year + week. Same (year, week) → same seed.
export function getWeeklySeed(year, week) {
  const base = year * 1000 + week; // e.g., 2026040 for 2026-W40
  return (base >>> 0) * 2654435761; // arbitrary hash prime
}

// Weekly modifier rules. One modifier is active per week.
// Each rule returns a function: (config, loadout) => { applies mods inline }
const WEEKLY_RULES = [
  {
    id: 'speed_up_enemies',
    name: '적이 더 빠워요',
    apply: (config) => {
      config.ENEMY_SPEED_MULT = (config.ENEMY_SPEED_MULT || 1.0) * 1.2;
    },
  },
  {
    id: 'speed_up_player',
    name: '당신이 더 빨라졌어요',
    apply: (config) => {
      config.PLAYER_SPEED_MULT = (config.PLAYER_SPEED_MULT || 1.0) * 1.15;
    },
  },
  {
    id: 'no_healing_items',
    name: '회복 아이템이 없어요',
    apply: (config, loadout) => {
      // Drop healing items from loot pool
      if (loadout) {
        loadout.noHealing = true;
      }
    },
  },
  {
    id: 'extra_gold',
    name: '드롭 골드가 많아요',
    apply: (config) => {
      config.GOLD_MULT = (config.GOLD_MULT || 1.0) * 1.3;
    },
  },
  {
    id: 'extra_xp',
    name: '경험치를 더 받아요',
    apply: (config) => {
      config.XP_MULT = (config.XP_MULT || 1.0) * 1.2;
    },
  },
];

// Pick the rule for a given week.
export function getRuleForWeek(year, week) {
  const seed = getWeeklySeed(year, week);
  const rng = createRng(seed);
  const ruleIdx = rng.int(0, WEEKLY_RULES.length - 1);
  return WEEKLY_RULES[ruleIdx];
}

// Get all rule names for display (ordered by id for consistency).
export function getAllRules() {
  return WEEKLY_RULES.sort((a, b) => a.id.localeCompare(b.id));
}

// Weekly challenge record shape (persisted in save.weeklyRecords).
export function freshWeeklyRecord() {
  return {
    week: null, // "2026-W40"
    bestSurvival: 0, // seconds
    bestKills: 0,
  };
}

export function getWeeklyRecord(save, year, week) {
  if (!save.weeklyRecords) return freshWeeklyRecord();
  const week_str = formatWeek({ year, week });
  return save.weeklyRecords[week_str] || freshWeeklyRecord();
}

export function updateWeeklyRecord(save, year, week, survival, kills) {
  if (!save.weeklyRecords) save.weeklyRecords = {};
  const week_str = formatWeek({ year, week });
  const current = save.weeklyRecords[week_str] || freshWeeklyRecord();
  current.week = week_str;
  current.bestSurvival = Math.max(current.bestSurvival || 0, survival);
  current.bestKills = Math.max(current.bestKills || 0, kills);
  save.weeklyRecords[week_str] = current;
}
