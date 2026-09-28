// Weekly challenge mode — deterministic seeded runs from ISO week number.
//
// Every Monday-Sunday span (ISO week) gets a unique seed + 1 modifier.
// Same week → same seed + same rule for all players. Different week → different
// seed + rule. Modifiers apply via runEvent (not global config mutation), so
// normal runs after weekly runs stay unaffected.

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
// Rules are data only; the simulation reads modifierName/value from runEvent
// and applies them locally at consumption points (movement, pickup, etc).
const WEEKLY_RULES = [
  {
    id: 'speed_up_enemies',
    name: '이번 주는 적이 더 빨라요',
    modifierName: 'enemy_speed_mult',
    value: 1.2, // 20% faster
  },
  {
    id: 'speed_up_player',
    name: '이번 주는 내 캐릭터가 더 빨라요',
    modifierName: 'player_speed_mult',
    value: 1.15, // 15% faster
  },
  {
    id: 'no_healing_items',
    name: '이번 주는 회복 아이템이 없어요',
    modifierName: 'no_healing',
    value: true,
  },
  {
    id: 'extra_gold',
    name: '이번 주는 드롭 골드가 많아요',
    modifierName: 'gold_mult',
    value: 1.3, // 30% more gold
  },
  {
    id: 'extra_xp',
    name: '이번 주는 경험치를 더 받아요',
    modifierName: 'xp_mult',
    value: 1.2, // 20% more xp
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
// Returns a copy so caller can't mutate the original array.
export function getAllRules() {
  return [...WEEKLY_RULES].sort((a, b) => a.id.localeCompare(b.id));
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
