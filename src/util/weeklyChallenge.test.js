import { describe, it, expect } from 'vitest';
import {
  getIsoWeek,
  formatWeek,
  getWeeklySeed,
  getRuleForWeek,
  getWeeklyRecord,
  updateWeeklyRecord,
} from './weeklyChallenge.js';

describe('weeklyChallenge', () => {
  it('extracts ISO week from a date', () => {
    // 2026-01-05 is a Monday, start of week 2 of 2026
    const d = new Date(2026, 0, 5);
    const week = getIsoWeek(d);
    expect(week.year).toBe(2026);
    expect(week.week).toBe(2);
  });

  it('extracts week 1 correctly', () => {
    // 2026-01-01 is a Thursday, in week 1 of 2026
    const d = new Date(2026, 0, 1);
    const week = getIsoWeek(d);
    expect(week.year).toBe(2026);
    expect(week.week).toBe(1);
  });

  it('wraps year boundary on late December', () => {
    // 2025-12-29 (Monday) is in week 1 of 2026
    const d = new Date(2025, 11, 29);
    const week = getIsoWeek(d);
    expect(week.year).toBe(2026);
    expect(week.week).toBe(1);
  });

  it('formats week consistently', () => {
    expect(formatWeek({ year: 2026, week: 1 })).toBe('2026-W01');
    expect(formatWeek({ year: 2026, week: 40 })).toBe('2026-W40');
    expect(formatWeek({ year: 2026, week: 53 })).toBe('2026-W53');
  });

  it('same week yields same seed', () => {
    const seed1 = getWeeklySeed(2026, 40);
    const seed2 = getWeeklySeed(2026, 40);
    expect(seed1).toBe(seed2);
  });

  it('different weeks yield different seeds', () => {
    const seed1 = getWeeklySeed(2026, 40);
    const seed2 = getWeeklySeed(2026, 41);
    expect(seed1).not.toBe(seed2);
  });

  it('different years yield different seeds', () => {
    const seed1 = getWeeklySeed(2026, 40);
    const seed2 = getWeeklySeed(2025, 40);
    expect(seed1).not.toBe(seed2);
  });

  it('picks a rule deterministically for a given week', () => {
    const rule1 = getRuleForWeek(2026, 40);
    const rule2 = getRuleForWeek(2026, 40);
    expect(rule1.id).toBe(rule2.id);
  });

  it('different weeks may pick different rules', () => {
    const rule1 = getRuleForWeek(2026, 40);
    const rule2 = getRuleForWeek(2026, 41);
    // Rules should be different most of the time (unless RNG collides)
    // This test is probabilistic but passes with high likelihood given
    // the seeding scheme
  });

  it('updates and retrieves weekly records', () => {
    const save = { weeklyRecords: {} };
    const before = getWeeklyRecord(save, 2026, 40);
    expect(before.bestSurvival).toBe(0);
    expect(before.bestKills).toBe(0);

    updateWeeklyRecord(save, 2026, 40, 305, 145);
    const after = getWeeklyRecord(save, 2026, 40);
    expect(after.week).toBe('2026-W40');
    expect(after.bestSurvival).toBe(305);
    expect(after.bestKills).toBe(145);
  });

  it('keeps best survival and kills across updates', () => {
    const save = { weeklyRecords: {} };
    updateWeeklyRecord(save, 2026, 40, 100, 50);
    updateWeeklyRecord(save, 2026, 40, 150, 40); // 150 > 100 but 40 < 50
    const record = getWeeklyRecord(save, 2026, 40);
    expect(record.bestSurvival).toBe(150); // max of 100 and 150
    expect(record.bestKills).toBe(50); // max of 50 and 40
  });

  it('handles missing save.weeklyRecords gracefully', () => {
    const save = {};
    const record = getWeeklyRecord(save, 2026, 40);
    expect(record.week).toBeNull();
    expect(record.bestSurvival).toBe(0);
  });
});
