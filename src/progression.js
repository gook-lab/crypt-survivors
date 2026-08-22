// Progression — XP, level, and the level-up queue.
//
// Gems feed addXp(). Each time XP crosses the threshold a level is gained and
// queued in pendingLevels; main drains the queue by showing the upgrade picker
// once per level (a big gem can grant several at once).

import { LEVELING } from './config.js';

// Piecewise: linear until softCap, then quadratic past it. Early levels
// land fast; late levels demand real XP.
const xpForLevel = (level) => {
  const over = Math.max(0, level - (LEVELING.softCap || 0));
  return LEVELING.baseXp + level * LEVELING.growth + over * over * LEVELING.growth2;
};

export function createProgression() {
  let level = 1;
  let xp = 0;
  let xpToNext = xpForLevel(level);
  let pendingLevels = 0;

  function addXp(n) {
    xp += n;
    while (xp >= xpToNext) {
      xp -= xpToNext;
      level += 1;
      xpToNext = xpForLevel(level);
      pendingLevels += 1;
    }
  }

  return {
    addXp,
    consumeLevel() {
      if (pendingLevels > 0) pendingLevels -= 1;
    },
    // Drain all queued levels in one go. Used on death so the result page
    // doesn't have a stale level-up to pop after the player has finished.
    clearPending() {
      pendingLevels = 0;
    },
    reset() {
      level = 1;
      xp = 0;
      xpToNext = xpForLevel(level);
      pendingLevels = 0;
    },
    get level() {
      return level;
    },
    get xp() {
      return xp;
    },
    get xpToNext() {
      return xpToNext;
    },
    get pendingLevels() {
      return pendingLevels;
    },
  };
}
