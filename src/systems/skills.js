// Hero skill system — unlocks the chosen hero's skills at level milestones.
//
// Heroes carry a `skills` list at levels 1/10/20/30/40/50 (content/
// characters.js). As the player's level reaches each milestone the skill
// unlocks: its `effect` folds into the loadout and a toast is shown. Lv1 is
// the class starter — checked at run start, no toast.

import { applySkill } from '../content/characters.js';

export function createSkills() {
  const unlocked = new Set(); // skill levels already unlocked

  // Unlock + apply every skill the hero is now eligible for. Returns the
  // freshly-unlocked skills (callers toast them).
  function check(loadout, player, level) {
    const hero = loadout.hero;
    if (!hero) return [];
    const fresh = [];
    for (let i = 0; i < hero.skills.length; i++) {
      const skill = hero.skills[i];
      if (skill.level <= level && !unlocked.has(skill.level)) {
        unlocked.add(skill.level);
        applySkill(skill, loadout);
        fresh.push(skill);
      }
    }
    if (fresh.length > 0) {
      loadout.recompute();
      // fold skill stat changes onto the player
      if (player.maxHp !== loadout.maxHp) {
        const gain = loadout.maxHp - player.maxHp;
        player.maxHp = loadout.maxHp;
        if (gain > 0) player.hp = Math.min(player.maxHp, player.hp + gain);
      }
      player.revives = Math.round(loadout.meta.revive);
      player.armor = loadout.meta.armor;
    }
    return fresh;
  }

  // the skills unlocked so far (for the game-over screen)
  function unlockedSkills(loadout) {
    const hero = loadout.hero;
    if (!hero) return [];
    return hero.skills.filter((s) => unlocked.has(s.level));
  }

  return { check, unlockedSkills };
}
