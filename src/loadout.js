// Loadout — the player's owned weapons and passives, the global modifiers
// derived from passive levels, and the permanent (meta) upgrade bonuses.
//
//   weapons : { weaponId: level }
//   passives: { passiveId: level }
//   meta    : permanent-upgrade contributions, set once per run at run start
//   derived : damageMult, cooldownMult, projectileBonus, moveSpeed, maxHp,
//             magnet, xpGainMult, goldMult, regen, projSizeMult, projLifeMult
//             — recomputed from passives + meta by recompute().

import { PLAYER } from './config.js';
import { STARTING_WEAPON } from './content/weapons.js';

export function createLoadout() {
  const loadout = {
    weapons: { [STARTING_WEAPON]: 1 },
    passives: {},
    // elemental spirits: spirit id -> tier (1..maxTier). The spirit system
    // reads this; spirits are not loadout modifiers, so recompute ignores them.
    spirits: {},
    // chosen hero + its exclusive weapon id (set by applyCharacter at run start)
    hero: null,
    exclusiveWeapon: null,
    // permanent-upgrade bonuses (filled by applyMetaUpgrades at run start)
    meta: {
      damage: 0, cooldown: 0, projectiles: 0, moveSpeed: 0, maxHp: 0,
      magnet: 0, xpGain: 0, goldGain: 0, regen: 0, armor: 0, revive: 0,
      projSize: 0, projLife: 0, critChance: 0, critMult: 0, pierce: 0, luck: 0,
      projSpeed: 0, curse: 0, // VS forge: Speed (projectile velocity) + Curse
    },
    // run-economy tokens granted by shop upgrades (reroll / skip).
    // Start with 1 of each so first-time players can dodge unwanted
    // weapons from the opening level-ups. Shop upgrades stack on top.
    tokens: { reroll: 1, skip: 1 },
    // hero on-kill effects registered by skills ('ignite'|'lifesteal'|'blast')
    onKill: [],
    // active timed buffs from drop potions: { damage?, moveSpeed?, cooldown?,
    // life }. life counts down; recompute() folds the live ones in.
    buffs: [],
    // derived
    damageMult: 1,
    cooldownMult: 1,
    projectileBonus: 0,
    moveSpeed: PLAYER.speed,
    maxHp: PLAYER.maxHp,
    magnet: PLAYER.magnet,
    xpGainMult: 1,
    goldMult: 1,
    regen: 0,
    projSizeMult: 1,
    projLifeMult: 1,
    projSpeedMult: 1, // VS Speed powerup — projectile velocity multiplier
    // critical hits — every damaging hit rolls critChance to deal critMult x
    critChance: 0.15,
    critMult: 2.0,
    pierceBonus: 0, // extra projectile pierce from the shop
    luck: 0, // extra drop chance from the shop
    recompute,
  };

  // Derive the modifiers from current passive levels + meta bonuses.
  function recompute() {
    const p = loadout.passives;
    const m = loadout.meta;
    loadout.damageMult = (1 + 0.12 * (p.might ?? 0)) * (1 + m.damage);
    loadout.cooldownMult = Math.max(
      0.25,
      Math.pow(0.92, p.haste ?? 0) * (1 - m.cooldown),
    );
    loadout.projectileBonus = (p.multi ?? 0) + m.projectiles;
    loadout.moveSpeed = PLAYER.speed * (1 + 0.09 * (p.swift ?? 0)) * (1 + m.moveSpeed);
    loadout.maxHp = PLAYER.maxHp + 22 * (p.vigor ?? 0) + m.maxHp;
    loadout.magnet = PLAYER.magnet + 38 * (p.lodestone ?? 0) + m.magnet;
    loadout.xpGainMult = 1 + m.xpGain;
    loadout.goldMult = 1 + m.goldGain;
    loadout.regen = m.regen;
    loadout.projSizeMult = 1 + 0.22 * (p.aura ?? 0) + m.projSize;
    loadout.projLifeMult = 1 + 0.3 * (p.endure ?? 0) + m.projLife;
    loadout.projSpeedMult = 1 + (m.projSpeed ?? 0); // VS Speed powerup
    // — extension passives — exposed as derived numbers so main.js's kill /
    //   hurt event handlers can fold them in without reading the raw passive
    loadout.lifestealPerKill = 2 * (p.lifesteal ?? 0);
    loadout.reflectDmg = 8 * (p.reflect ?? 0);
    loadout.stormDmg = 5 * (p.storm ?? 0);
    // crit balance — moved 0.15/2.0 → 0.10/1.6 after a playtest showed
    // crits one-shotting commons + dominating DPS. Crit still feels good but
    // no longer trivialises the early game.
    loadout.critChance = 0.10 + m.critChance;
    loadout.critMult = 1.6 + m.critMult;
    loadout.pierceBonus = m.pierce + (p.pierce_passive ?? 0);
    loadout.luck = m.luck + 0.12 * (p.fortune ?? 0);
    // build-freedom expansion (recompute-only passives):
    // wisdom multiplies XP gain on top of meta-derived xpGainMult.
    loadout.xpGainMult = (1 + m.xpGain) * (1 + 0.10 * (p.wisdom ?? 0));
    // regen2 stacks additively on top of meta-derived regen + the innate
    // base regen floor (PLAYER.regen) — see config: anti-chip survivability.
    loadout.regen = (PLAYER.regen ?? 0) + m.regen + 0.3 * (p.regen2 ?? 0);

    // fold active drop-potion buffs on top of the derived modifiers; a
    // critChance buff (e.g. huntress 흔적 추적 window) overrides the rolled
    // value while it's live
    let bDamage = 1;
    let bMove = 1;
    let bCooldown = 1;
    let bCrit = null;
    for (let i = 0; i < loadout.buffs.length; i++) {
      const b = loadout.buffs[i];
      if (b.damage) bDamage *= b.damage;
      if (b.moveSpeed) bMove *= b.moveSpeed;
      if (b.cooldown) bCooldown *= b.cooldown;
      if (b.critChance != null && (bCrit == null || b.critChance > bCrit)) bCrit = b.critChance;
    }
    loadout.damageMult *= bDamage;
    loadout.moveSpeed *= bMove;
    loadout.cooldownMult = Math.max(0.2, loadout.cooldownMult * bCooldown);
    if (bCrit != null) loadout.critChance = bCrit;
    // arcana 광란 — kill streak (frenzyStacks) stacks +2% damage, cap 30 (60%)
    if (loadout.frenzyStacks) {
      loadout.damageMult *= 1 + 0.02 * loadout.frenzyStacks;
    }
    // arcana 고요 — main's update loop sets stillnessMult (2.0 still, 0.7 moving)
    if (loadout.stillnessMult) loadout.damageMult *= loadout.stillnessMult;
  }

  // Wipe the loadout back to its constructed defaults so the next run starts
  // clean. Called from startRun() before applyCharacter/applyMetaUpgrades/
  // applyArcana fold their additive contributions on top — without this,
  // weapons/passives/spirits carry over and meta keeps inflating across
  // restarts (char.bonus and the +=meta path in applyMetaUpgrades both
  // accumulate). Mutates in place so all systems holding the same reference
  // see the cleared state.
  function reset() {
    loadout.weapons = { [STARTING_WEAPON]: 1 };
    loadout.passives = {};
    loadout.spirits = {};
    loadout.hero = null;
    loadout.exclusiveWeapon = null;
    loadout.meta = {
      damage: 0, cooldown: 0, projectiles: 0, moveSpeed: 0, maxHp: 0,
      magnet: 0, xpGain: 0, goldGain: 0, regen: 0, armor: 0, revive: 0,
      projSize: 0, projLife: 0, critChance: 0, critMult: 0, pierce: 0, luck: 0,
    };
    loadout.tokens = { reroll: 1, skip: 1 };
    loadout.onKill = [];
    loadout.buffs = [];
    loadout.arcana = null;
    loadout.arcanaTag = null;
    loadout.lastFusion = null;
    loadout.frenzyStacks = 0;
    loadout.soulCount = 0;
    loadout.stillnessMult = undefined;
    recompute();
  }
  loadout.reset = reset;

  return loadout;
}
