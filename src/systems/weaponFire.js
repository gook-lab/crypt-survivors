// Weapon fire system — data-driven, multi-weapon, per-weapon levels.
//
// Each owned weapon (loadout.weapons[id] = level) keeps its own cooldown and
// fires per its data definition. Patterns:
//   'melee'     — a brief stationary blade hitbox in front of the player
//   'fan'       — a spread toward the nearest enemy (aimed = fan/count1;
//                 beam = fan with a very high projectile speed)
//   'ring'      — an even ring of shots in all directions
//   'orbit'     — shots circle the player (orbitRadius 0 = a static aura)
//   'boomerang' — shots fly out then curve back to the player
// Every projectile carries its impact FX, crit params, on-hit proc and the
// homing flag; a successful fire emits a 'fire' event for the muzzle flash.

import { WEAPONS } from '../content/weapons.js';

const MELEE_PIERCE = 9999; // a swing hits everything it overlaps (once each)
// Global projectile speed throttle. Two-pass tuning:
//   0.88 → 0.7 (user: "too fast overall")
//   0.7  → 0.5 (user: "before eating a skill perk, ~1/3 slower")
// Lv1 weapons read sluggish; Lv2+ skill tree perks (speed × 1.2~1.3) restore
// snap so the level-up cadence has weight. Applied uniformly to fan/ring/
// boomerang/chain/rain.
const PROJ_SPEED_SCALE = 0.5;
// Hard cap on per-volley projectile count after passives stack. Raised
// 5 → 8 because the `multi` passive maxes at +3 and the level ramp
// peaks at projAtLevel(9)=5 — old cap of 5 silently swallowed every
// `multi` level on mid/late weapons, making the passive feel inert.
// Per-weapon `projCap` (e.g. bible=10) still overrides this default.
const PROJ_CAP = 8;

// ── Uniform leveling rule (user feedback 2026-05-20) ─────────────────────
// All weapons start with 1 projectile at Lv1. The level-up cadence is fixed
// across the roster: odd transitions add a projectile, even transitions
// add flat damage. This replaces the legacy per-weapon def.projectiles +
// def.dmgPerLevel scaling so every level-up reads the same to the player.
//   Lv1 = 1 proj  · base dmg
//   Lv2 = 1 proj  · +5 dmg   (even step)
//   Lv3 = 2 proj  · +5 dmg   (odd step)
//   Lv4 = 2 proj  · +10 dmg  (even step)
//   Lv5 = 3 proj  · +10 dmg  (odd step)
// loadout.projectileBonus from multi-shot passives stacks on top.
// DAMAGE_SCALE applies a global tuning multiplier — bumped down to bring
// overall outgoing damage in line with enemy HP curves.
const DAMAGE_PER_EVEN = 5;
const DAMAGE_SCALE = 0.75;
function projAtLevel(level) {
  // (level + 1) >> 1 — lv1→1, lv2→1, lv3→2, lv4→2, lv5→3.
  return (level + 1) >> 1;
}
function evenSteps(level) {
  // lv1→0, lv2→1, lv3→1, lv4→2, lv5→2 — count of even-numbered transitions
  return level >> 1;
}

// Class signature impact FX — a subtle secondary burst that fires alongside
// the weapon's own impactFx so each hero's hits carry a class-tinted flair.
// See src/assets/art/fx_vs.js EFFECTS for the registered keys.
const CLASS_IMPACT_FX = {
  knight:   'fx_class_knight',
  warrior:  'fx_class_warrior',
  huntress: 'fx_class_huntress',
  mage:     'fx_class_mage',
};

// effectiveDef — fold per-weapon skill perks onto a base def before the
// engine consumes its fields. The existing fire()/update() code paths read
// def.X directly; this lets us layer skills on top without touching the
// pierce / proc / knockback pipelines in damage.js or movement.js.
//
// Skill mod rules:
//   key === 'proc'   — shallow-merge into eff.proc (chance / fx overwrite)
//   number value     — multiplicative (`speed: 1.15` → eff.speed *= 1.15)
//   string '+N'      — additive    (`pierce: '+2'`  → eff.pierce += 2)
//   boolean / object — overwrite   (`bouncesGrowth: true`, `homing: true`)
//
// def.skills is expected sorted by lvl ascending; we break on the first
// skill whose lvl exceeds the current weapon level so the loop is O(lvl).
export function effectiveDef(def, level) {
  if (!def.skills || level <= 1) return def;
  const eff = { ...def, proc: def.proc ? { ...def.proc } : null };
  for (const s of def.skills) {
    if (s.lvl > level) break;
    const mod = s.mod || {};
    for (const k of Object.keys(mod)) {
      const v = mod[k];
      if (k === 'proc' && v && typeof v === 'object') {
        eff.proc = eff.proc ? { ...eff.proc, ...v } : { ...v };
      } else if (typeof v === 'string' && v[0] === '+') {
        eff[k] = (eff[k] || 0) + Number(v.slice(1));
      } else if (typeof v === 'number') {
        eff[k] = (eff[k] || 0) * v;
      } else {
        eff[k] = v;
      }
    }
  }
  return eff;
}

// a weapon's projectile count for the current level. Uniform across all
// weapons: 1 at Lv1, +1 at every odd-level transition (Lv1→3, Lv3→5).
// loadout.projectileBonus from passives still stacks on top, capped at
// PROJ_CAP. Legacy def.projectiles + def.projGrowth are ignored — the
// only knob is the level.
//
// Per-weapon override: when def declares `baseProj` (and optionally
// `growthPerLevel` / `projCap`), the uniform ramp is bypassed. Used by
// orbit weapons like bible — Lv1 spawns 3 books, +1 per level, cap 10.
function projCount(def, level, loadout) {
  if (def.baseProj != null) {
    const growth = def.growthPerLevel || 0;
    const cap = def.projCap || PROJ_CAP;
    return Math.min(cap, def.baseProj + (level - 1) * growth + (loadout.projectileBonus || 0));
  }
  return Math.min(PROJ_CAP, projAtLevel(level) + (loadout.projectileBonus || 0));
}

// every weapon gets a trait: its explicit proc, or a tag-derived default so
// no weapon is plain — blades bleed, blunt stuns, elements apply their status.
function defaultProcFor(def) {
  const t = def.tags || [];
  if (/mace|whip|hammer|flail/.test(def.id)) return { fx: 'status_stun', chance: 0.25 };
  if (t.includes('ice')) return { fx: 'status_freeze', chance: 0.25 };
  if (t.includes('fire')) return { fx: 'status_burn', chance: 0.3 };
  if (t.includes('lightning')) return { fx: 'status_shock', chance: 0.3 };
  if (t.includes('shadow')) return { fx: 'status_poison', chance: 0.25 };
  if (t.includes('arcane')) return { fx: 'status_freeze', chance: 0.15 };
  if (t.includes('holy') || t.includes('nature')) return { fx: 'status_slow', chance: 0.25 };
  return { fx: 'status_bleed', chance: 0.2 }; // physical default
}

// the cast/swing flourish a weapon plays at the player when it fires
function actionFx(def) {
  if (def.kind === 'melee') return 'fx_swing';
  if (def.pattern === 'ring' || def.pattern === 'arc_burst' || def.pattern === 'bezier_strike') return 'fx_summon_circle';
  if (def.pattern === 'boomerang') return 'fx_boomerang_arc';
  if (def.pattern === 'fan' && (def.projectiles || 1) >= 4) return 'fx_fan_burst';
  return null;
}

// Pick the weapon-fire sound (a key into audio.js SOUNDS). Returns a string
// the renderer side (main.js fire handler) plays, or null for silence. Pure
// data → no audio import here, so the sim stays headless. A weapon def may set
// `fireSfx` explicitly (including null to silence) to override the archetype.
function fireSoundFor(def) {
  if (def.fireSfx !== undefined) return def.fireSfx;
  if (def.kind === 'melee') return 'fire_swing';
  switch (def.pattern) {
    case 'aoe':
    case 'pull':
    case 'rain':
    case 'aura_buff':
      return 'fire_cast'; // "laid down" casts get a soft thrum, not a snap
    case 'boomerang':
      return 'fire_throw';
    default:
      break;
  }
  // fan / ring / orbit / chain projectiles: physical = thrown whoosh, else pew
  if (def.tags && def.tags.includes('physical')) return 'fire_throw';
  return 'fire_shot';
}

export function createWeaponFire() {
  const timers = {}; // weapon id -> seconds until it may fire again

  function nearestEnemy(world, player) {
    let nearest = null;
    let bestSq = Infinity;
    const ents = world.entities;
    for (let i = 0; i < ents.length; i++) {
      const e = ents[i];
      if (e.type !== 'enemy' || e.dead) continue;
      const dx = e.x - player.x;
      const dy = e.y - player.y;
      const sq = dx * dx + dy * dy;
      if (sq < bestSq) {
        bestSq = sq;
        nearest = e;
      }
    }
    return nearest;
  }

  // Fire one volley/swing. Returns false only when a fan weapon has no target.
  // `events` is optional — when present, AoE-pattern weapons with an aoeKit
  // emit 'aoeCast' so the weapon sky-drop FX system can spawn a visual overlay.
  function fire(world, player, def, level, loadout, events) {
    // Uniform damage formula (user feedback): base + flat 5 per even-level
    // transition, scaled down 25% globally. Replaces the legacy
    // dmgPerLevel multiplicative ramp so every weapon levels predictably.
    const damage = (def.damage + DAMAGE_PER_EVEN * evenSteps(level))
      * DAMAGE_SCALE
      * loadout.damageMult;
    // fields stamped on every projectile this weapon spawns this volley
    const tag = {
      impactFx: def.impact || null,
      classImpactFx: CLASS_IMPACT_FX[loadout.hero?.id] || null,
      critChance: loadout.critChance,
      critMult: loadout.critMult,
      proc: def.proc || defaultProcFor(def),
      homing: !!def.homing,
      // weapon attribution — damage.js sums damage by source weapon so the
      // result screen can show a per-weapon contribution chart
      weaponId: def.id,
      // sprite vertical stretch (legendary qi projectiles want a taller
      // crescent than the native PNG height). renderer applies as scale.y
      // multiplier; defaults to 1 when undefined.
      spriteScaleY: def.spriteScaleY || 1,
      // Multi-frame projectile effect (def.effectAsset → sigAssets entry).
      // Renderer's applySprite cycles frames via assetFrameUrl when set,
      // overriding the static weaponAssets PNG so the in-flight visual
      // differs from the inventory icon.
      effectAsset: def.effectAsset || null,
      // Per-weapon trail particle (def.trailAsset → sigAssets entry).
      // Renderer spawns this PNG every TRAIL_INTERVAL behind the projectile
      // instead of the generic ASCII trail_proj — the visual signature of
      // the weapon (blood drops for knives, sparks for holy_lance, etc.).
      trailAsset: def.trailAsset || null,
    };

    // aura_buff weapons stamp a timed buff onto loadout.buffs (existing
    // potion-buff system) instead of spawning a projectile. recompute()
    // folds active buffs; main.js ticks each buff's life and re-recomputes
    // on expire. Refresh duration when the same weapon's buff is still up.
    if (def.pattern === 'aura_buff') {
      if (!def.buff || !def.duration) return false;
      const key = '__buff_' + def.id;
      // Level scaling: each level past 1 adds 1s of buff uptime (Lv1 →
      // def.duration, Lv5 → def.duration + 4). Cooldown is fixed, so this
      // walks uptime toward 100% at max level. Before this, leveling an
      // aura_buff weapon did nothing — both magnitude AND duration were read
      // straight off def, so 4 of the 5 level-up picks were inert ("defined
      // but inert" — see CLAUDE.md). Magnitude stays fixed so the damage /
      // cooldown multiplier can't spiral; only uptime improves.
      const dur = def.duration + (Math.max(1, level) - 1);
      let existing = null;
      for (let i = 0; i < loadout.buffs.length; i++) {
        if (loadout.buffs[i].source === key) { existing = loadout.buffs[i]; break; }
      }
      if (existing) {
        existing.life = dur; // refresh
      } else {
        loadout.buffs.push({ ...def.buff, life: dur, source: key, color: def.color || 0xffffff, assetKey: def.assetKey || null });
        loadout.recompute();
      }
      return true;
    }

    if (def.kind === 'melee') {
      const target = nearestEnemy(world, player);
      const angle = target
        ? Math.atan2(target.y - player.y, target.x - player.x)
        : 0;
      world.spawn('projectile', {
        x: player.x + Math.cos(angle) * def.reach,
        y: player.y + Math.sin(angle) * def.reach,
        vx: 0,
        vy: 0,
        radius: def.radius * (loadout.projSizeMult ?? 1),
        damage,
        pierce: MELEE_PIERCE,
        life: def.life,
        knockback: def.knockback,
        color: def.color,
        sprite: def.sprite,
        hits: [],
        // Slash arcs/qi sprites face the target via the renderer's
        // spriteAngle override (applySprite). Replaces the old flipX
        // approach which only handled left/right and left vertical/diagonal
        // strikes facing the wrong way.
        spriteAngle: angle,
        ...tag,
      });
      return true;
    }

    if (def.pattern === 'orbit') {
      // a ring of projectiles that circle the player; orbitRadius 0 holds them
      // on the player as a static aura. movement.js advances the orbit angle.
      const count = projCount(def, level, loadout);
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        world.spawn('projectile', {
          x: player.x + Math.cos(angle) * def.orbitRadius,
          y: player.y + Math.sin(angle) * def.orbitRadius,
          vx: 0,
          vy: 0,
          radius: def.radius * (loadout.projSizeMult ?? 1),
          damage,
          pierce: MELEE_PIERCE,
          life: def.life * (loadout.projLifeMult ?? 1),
          knockback: def.knockback,
          color: def.color,
          sprite: def.sprite,
          orbit: { angle, radius: def.orbitRadius, angSpeed: def.orbitSpeed },
          hits: [],
          ...tag,
        });
      }
      return true;
    }

    if (def.pattern === 'boomerang') {
      // Throw weapons (axe / gladius / shield / cross). Default behavior is a
      // STRAIGHT throw that flies out past the screen edge (pierce:999 plows
      // through everything) — the thrown-axe feel. The old curve-back boomerang
      // is now opt-in per weapon via `def.returns: true` (sets the boomerang
      // flag the movement.js branch reads). With life × speed ≈ 480-550px and
      // the camera centered on the player, a straight throw clears the ~295px
      // half-screen and exits.
      const count = projCount(def, level, loadout);
      const target = nearestEnemy(world, player);
      const baseAngle = target
        ? Math.atan2(target.y - player.y, target.x - player.x)
        : 0;
      const life = def.life * (loadout.projLifeMult ?? 1);
      for (let i = 0; i < count; i++) {
        const angle = baseAngle + (i - (count - 1) / 2) * (def.spread || 0.4);
        world.spawn('projectile', {
          x: player.x,
          y: player.y,
          vx: Math.cos(angle) * def.speed * PROJ_SPEED_SCALE * (loadout.projSpeedMult ?? 1),
          vy: Math.sin(angle) * def.speed * PROJ_SPEED_SCALE * (loadout.projSpeedMult ?? 1),
          radius: def.radius * (loadout.projSizeMult ?? 1),
          damage,
          pierce: def.pierce + (loadout.pierceBonus ?? 0),
          life,
          knockback: def.knockback,
          color: def.color,
          sprite: def.sprite,
          hits: [],
          // opt-in curve-back; otherwise a straight off-screen throw
          boomerang: def.returns ? { age: 0, returnAt: life * 0.45 } : undefined,
          ...tag,
        });
      }
      return true;
    }

    if (def.pattern === 'aoe') {
      // a placed lingering damage zone — dropped on the nearest enemy (or
      // forward), stationary; movement.js clears its hit list on a pulse so
      // it re-damages everything inside for its lifetime.
      //
      // Multi-zone spawn: count comes from the uniform projectile ramp +
      // loadout.projectileBonus (multi passive). Each zone targets a
      // distinct nearby enemy; if fewer enemies than zones, the remaining
      // zones jitter around the anchor by ~radius so they don't stack.
      // Sky-drop telegraph + impact fire per zone so multi-cast reads.
      const count = projCount(def, level, loadout);
      const target = nearestEnemy(world, player);
      const anchorX = target ? target.x : player.x;
      const anchorY = target ? target.y : player.y - 90;
      const projRadius = def.radius * (loadout.projSizeMult ?? 1);
      const life = def.life * (loadout.projLifeMult ?? 1);
      const delay = def.aoeKit
        ? ((def.aoeKit.telegraphTime ?? 0.5) + (def.aoeKit.fallTime ?? 0.5))
        : 0;
      const used = new Set();
      if (target) used.add(target.id);
      const spots = [{ x: anchorX, y: anchorY }];
      if (count > 1) {
        const ents = world.entities;
        const cands = [];
        for (let k = 0; k < ents.length; k++) {
          const en = ents[k];
          if (!en || en.dead || en.type !== 'enemy' || used.has(en.id)) continue;
          const dx = en.x - anchorX;
          const dy = en.y - anchorY;
          cands.push({ e: en, sq: dx * dx + dy * dy });
        }
        cands.sort((a, b) => a.sq - b.sq);
        for (let k = 0; k < cands.length && spots.length < count; k++) {
          spots.push({ x: cands[k].e.x, y: cands[k].e.y });
          used.add(cands[k].e.id);
        }
        while (spots.length < count) {
          const ang = Math.random() * Math.PI * 2;
          const dist = (def.radius || 40) * (0.5 + Math.random() * 0.5);
          spots.push({
            x: anchorX + Math.cos(ang) * dist,
            y: anchorY + Math.sin(ang) * dist,
          });
        }
      }
      for (let s = 0; s < spots.length; s++) {
        const p = spots[s];
        world.spawn('projectile', {
          x: p.x,
          y: p.y,
          vx: 0,
          vy: 0,
          radius: projRadius,
          damage,
          pierce: MELEE_PIERCE,
          life,
          knockback: def.knockback,
          color: def.color,
          sprite: def.sprite,
          hits: [],
          rehit: 0.4,
          rehitT: 0.4,
          // Ground PNG art — per-weapon opt-in via def.groundAsset. No
          // generic default: a fire-crater overlay on every aoe weapon
          // (holywater, divine_hammer, etc.) read thematically wrong.
          groundAsset: def.groundAsset || null,
          // Zone is dormant until the sky-drop visual lands — synced to
          // telegraph + fall durations so the disc only appears at impact.
          delay,
          ...tag,
        });
        // Sky-drop visual overlay per zone — opt-in via def.aoeKit. Damage
        // timing is unchanged; this adds telegraph→fall→impact for each
        // zone so multi-zone casts read as "N things fell from the sky"
        // instead of one big poof.
        if (def.aoeKit && events) {
          events.emit('aoeCast', { x: p.x, y: p.y, kit: def.aoeKit, weaponId: def.id });
        }
      }
      return true;
    }

    if (def.pattern === 'rain') {
      // Sky-drop rain — each projectile spawns above a strike point and falls
      // straight down. Same recipe as the lightning skyDrop chain branch.
      // Strike point picks the nearest enemy when one is close enough; else
      // a random spot inside strikeRadius around the player. Each projectile
      // emits its own aoeCast for telegraph + impact zone visuals.
      const count = projCount(def, level, loadout);
      const lifeMult = (loadout.projLifeMult ?? 1);
      const strikeR = def.strikeRadius || 240;
      const usedTargets = new Set();
      const enemies = world.entities;
      // Find candidate enemies inside strikeR (one strike each, no doubling).
      const candidates = [];
      for (let k = 0; k < enemies.length; k++) {
        const en = enemies[k];
        if (!en || en.dead || en.type !== 'enemy') continue;
        const dx = en.x - player.x;
        const dy = en.y - player.y;
        if (dx * dx + dy * dy <= strikeR * strikeR) candidates.push(en);
      }
      for (let i = 0; i < count; i++) {
        let strikeX, strikeY;
        // Prefer untaken enemy targets first; fall back to random spot.
        let picked = null;
        for (let k = 0; k < candidates.length; k++) {
          const en = candidates[k];
          if (usedTargets.has(en.id)) continue;
          picked = en;
          usedTargets.add(en.id);
          break;
        }
        if (picked) {
          strikeX = picked.x;
          strikeY = picked.y;
        } else {
          const ang = Math.random() * Math.PI * 2;
          const dist = 60 + Math.random() * (strikeR - 60);
          strikeX = player.x + Math.cos(ang) * dist;
          strikeY = player.y + Math.sin(ang) * dist;
        }
        // Chain hop opt-in — rain weapons with `bounces` set (e.g. lightning)
        // get a chain stamp so collision.js can hop the bolt to nearby enemies
        // after each strike. Other rain weapons (smite, divine_rain, meteor)
        // leave bounces undefined → no hop.
        const effectiveBounces = def.bouncesGrowth
          ? (def.bounces || 0) + Math.floor((level - 1) / 2)
          : (def.bounces || 0);
        // Sky-drop bolt only needs to live until it reaches the strike point.
        // 220px fall at vy=900 → ~0.244s. Movement.js kills the entity the
        // moment its y crosses strikeY, so the bolt vanishes at impact even
        // if life is longer. life cap keeps things safe if movement skips.
        world.spawn('projectile', {
          x: strikeX,
          y: strikeY - 220,
          vx: 0,
          vy: 900,
          radius: def.radius * (loadout.projSizeMult ?? 1),
          damage,
          pierce: def.pierce + (loadout.pierceBonus ?? 0),
          life: 0.35,
          knockback: def.knockback,
          color: def.color,
          sprite: def.sprite,
          hits: [],
          skyDrop: true,
          strikeY,
          chain: effectiveBounces,
          aoeKit: def.aoeKit || null, // forward FX kit so chain hop can re-emit
          ...tag,
        });
        if (def.aoeKit && events) {
          // Rain pattern syncs FX to the actual fall — the projectile is the
          // falling body (~0.244s to strike), so telegraph time is short and
          // fallTime is zeroed. Otherwise the impact zone appears ~0.7s late.
          const syncedKit = { ...def.aoeKit, telegraphTime: 0.25, fallTime: 0 };
          events.emit('aoeCast', {
            x: strikeX, y: strikeY, kit: syncedKit, weaponId: def.id,
          });
        }
      }
      return true;
    }

    if (def.pattern === 'pull') {
      // a placed vortex: a stationary zone that drags enemies inward
      // (movement.js) and re-damages on a pulse
      const target = nearestEnemy(world, player);
      const px = target ? target.x : player.x;
      const py = target ? target.y : player.y;
      world.spawn('projectile', {
        x: px,
        y: py,
        vx: 0,
        vy: 0,
        radius: def.radius * (loadout.projSizeMult ?? 1),
        damage,
        pierce: MELEE_PIERCE,
        life: def.life * (loadout.projLifeMult ?? 1),
        knockback: def.knockback,
        color: def.color,
        sprite: def.sprite,
        hits: [],
        rehit: 0.5,
        rehitT: 0.5,
        pull: 280, // inward drag (px/sec) — beats enemy walk speed (~80) so they actually pile in
        pullRadius: def.pullRadius || def.radius, // pull reach (visual disc can stay smaller)
        // Zone is dormant until the sky-drop visual lands. delay = telegraph
        // + fall durations so the disc only appears when the orb hits ground.
        delay: def.aoeKit ? ((def.aoeKit.telegraphTime ?? 0.5) + (def.aoeKit.fallTime ?? 0.5)) : 0,
        // Pull weapons get the cosmic vortex PNG by default — fits void
        // theming (void_sphere, leg_black_hole, leg_galaxy_orb,
        // leg_void_collapse). Override per-weapon via def.groundAsset.
        groundAsset: def.groundAsset || 'zone_vortex',
        ...tag,
      });
      if (def.aoeKit && events) {
        events.emit('aoeCast', { x: px, y: py, kit: def.aoeKit, weaponId: def.id });
      }
      return true;
    }

    if (def.pattern === 'chain') {
      // Horizontal chain — a bolt aimed at the nearest enemy; collision.js
      // hops it to nearby enemies up to `bounces` times. `bouncesGrowth: true`
      // adds +1 hop per 2 levels (lv1→0, lv3→1, lv5→2 extra).
      // For sky-drop chains (lightning), the weapon now uses `pattern: 'rain'`
      // with `bounces` set — see the rain branch.
      const target = nearestEnemy(world, player);
      if (!target) return false;
      const ang = Math.atan2(target.y - player.y, target.x - player.x);
      const effectiveBounces = def.bouncesGrowth
        ? def.bounces + Math.floor((level - 1) / 2)
        : def.bounces;
      world.spawn('projectile', {
        x: player.x,
        y: player.y,
        vx: Math.cos(ang) * def.speed * PROJ_SPEED_SCALE * (loadout.projSpeedMult ?? 1),
        vy: Math.sin(ang) * def.speed * PROJ_SPEED_SCALE * (loadout.projSpeedMult ?? 1),
        radius: def.radius * (loadout.projSizeMult ?? 1),
        damage,
        pierce: 1 + (loadout.pierceBonus ?? 0),
        life: def.life * (loadout.projLifeMult ?? 1),
        knockback: def.knockback,
        color: def.color,
        sprite: def.sprite,
        hits: [],
        chain: effectiveBounces || 3,
        ...tag,
      });
      return true;
    }

    if (def.pattern === 'arc_burst') {
      // Ballistic salvo — beams launched UPWARD in random directions from a
      // point above the player, then fall back under constant `gravity` so
      // each beam traces a parabolic arc. Unlike `rain` (vertical-only),
      // each beam picks an independent launch angle in the upper hemisphere.
      //
      // landY is OPT-IN via def.landYOffset: when set, beams die the
      // moment they fall past that line (rain-drop feel). When omitted,
      // beams fly until def.life expires — so the parabola can reach the
      // far edge of the map (the boomerang-axe feel).
      const count = projCount(def, level, loadout);
      const ox = player.x;
      const oy = player.y + (def.originOffsetY || 0);
      const life = def.life * (loadout.projLifeMult ?? 1);
      const launchSpeed = def.launchSpeed || def.speed || 360;
      const gravity = def.gravity || 700;
      const landY = def.landYOffset != null ? player.y + def.landYOffset : null;
      // Angle window biased AWAY from the horizon so every shot actually
      // arcs (no flat trajectories). Default ≈ [-153°, -27°] — upper hemi
      // minus the near-horizontal slivers. Per-weapon override via def.
      const angleMin = def.launchAngleMin ?? -Math.PI * 0.85;
      const angleMax = def.launchAngleMax ?? -Math.PI * 0.15;
      // Per-shot speed jitter for varied arc heights/distances. ±25% default.
      const speedJitter = def.speedJitter ?? 0.25;
      for (let i = 0; i < count; i++) {
        const angle = angleMin + Math.random() * (angleMax - angleMin);
        const sp = launchSpeed * (1 - speedJitter + Math.random() * 2 * speedJitter);
        const spawn = {
          x: ox,
          y: oy,
          vx: Math.cos(angle) * sp,
          vy: Math.sin(angle) * sp,
          radius: def.radius * (loadout.projSizeMult ?? 1),
          damage,
          pierce: def.pierce + (loadout.pierceBonus ?? 0),
          life,
          knockback: def.knockback,
          color: def.color,
          sprite: def.sprite,
          hits: [],
          gravity,
          ...tag,
        };
        if (landY != null) spawn.landY = landY;
        world.spawn('projectile', spawn);
      }
      return true;
    }

    if (def.pattern === 'bezier_strike') {
      // VS "Black Pigeon" — every volley picks ONE target zone around the
      // player, then sends a swarm of curved beams from the emitter
      // (originOffsetY above the player) converging into that zone. Each
      // beam picks a landing spot inside the zone and flies a unique
      // quadratic Bezier curve to it. The control-point offset is
      // perpendicular to the segment with a random sign and magnitude,
      // so the swarm mixes S-curves, gentle bows, and longer swirls —
      // but they all aim into the same spot, reading as a plasma strike.
      //
      // Beams die when they reach their landing point (movement.js bezier
      // branch kills on t >= 1) — no extra landY/lifetime guard needed.
      const count = projCount(def, level, loadout);
      // Beam origin: a live pet companion (e.g. black_pigeon orbiting the
      // player, see main.js render hook) wins over the static originOffsetY
      // hover point. When the companion is absent (weapon not equipped /
      // companion hidden) we fall back to the offset above the player.
      const sx = player.beamOriginX != null ? player.beamOriginX : player.x;
      const sy = player.beamOriginY != null
        ? player.beamOriginY
        : player.y + (def.originOffsetY || 0);
      const life = def.life * (loadout.projLifeMult ?? 1);
      const strikeMax = def.strikeRadius || 320;
      const strikeMin = def.strikeMinDist || 120;
      const flightTime = def.flightTime || 1.0;
      const curveAmount = def.curveAmount ?? 0.55;
      const targetRadius = def.targetRadius || 90;
      // staggerWindow spreads the volley over time so an N-beam shot reads
      // as a sustained barrage instead of a single instantaneous burst —
      // makes multi-shot passives feel meaningful (more beams = denser
      // barrage, not a bigger single flash). Each beam's e.delay is set
      // so movement/collision/draw all ignore it until launch time.
      const staggerWindow = def.staggerWindow ?? 0;
      // ONE target zone per volley. Direction + distance around the player.
      const targetAng = Math.random() * Math.PI * 2;
      const targetDist = strikeMin + Math.random() * Math.max(0, strikeMax - strikeMin);
      const tcx = player.x + Math.cos(targetAng) * targetDist;
      const tcy = player.y + Math.sin(targetAng) * targetDist;
      // Emit ground telegraph for the renderer — a white-rimmed disc that
      // pulses on the floor through the whole barrage, then fades when
      // the last beam should have landed (staggerWindow + flightTime + lead-out).
      if (events) {
        events.emit('beamCast', {
          x: tcx, y: tcy, radius: targetRadius,
          life: staggerWindow + flightTime + 0.5,
        });
      }
      for (let i = 0; i < count; i++) {
        // Each beam picks a uniform-area point INSIDE the target zone
        // (sqrt(random) keeps the distribution from clustering at the
        // centre).
        const a = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * targetRadius;
        const ex = tcx + Math.cos(a) * r;
        const ey = tcy + Math.sin(a) * r;
        // Even stagger across the window: 0, w/N, 2w/N, ..., (N-1)w/N.
        // (Even spacing keeps the barrage steady; switch to random if a
        // future weapon wants a chaotic feel.)
        const delay = staggerWindow > 0 ? (i / count) * staggerWindow : 0;
        // Perpendicular control offset for swirl. sign randomises left/right
        // bow direction; magnitude scales with segment length so distant
        // strikes still feel curved (not a straight near-tangent).
        const dx = ex - sx;
        const dy = ey - sy;
        const segLen = Math.hypot(dx, dy) || 1;
        const px = -dy / segLen;
        const py = dx / segLen;
        const sign = Math.random() < 0.5 ? -1 : 1;
        const off = segLen * curveAmount * sign * (0.6 + Math.random() * 0.8);
        const cx = (sx + ex) / 2 + px * off;
        const cy = (sy + ey) / 2 + py * off;
        world.spawn('projectile', {
          x: sx,
          y: sy,
          vx: 0,
          vy: 0,
          radius: def.radius * (loadout.projSizeMult ?? 1),
          damage,
          pierce: def.pierce + (loadout.pierceBonus ?? 0),
          life: life + delay, // ensure dormant beams still have flight budget
          knockback: def.knockback,
          color: def.color,
          sprite: def.sprite,
          hits: [],
          delay,
          bezier: { sx, sy, cx, cy, ex, ey, t: 0, duration: flightTime },
          ...tag,
        });
      }
      return true;
    }

    // fan / ring
    const count = projCount(def, level, loadout);
    let baseAngle = 0;
    if (def.pattern !== 'ring') {
      const target = nearestEnemy(world, player);
      if (!target) return false;
      baseAngle = Math.atan2(target.y - player.y, target.x - player.x);
    }
    for (let i = 0; i < count; i++) {
      const angle =
        def.pattern === 'ring'
          ? baseAngle + (i / count) * Math.PI * 2
          : baseAngle + (i - (count - 1) / 2) * (def.spread || 0);
      world.spawn('projectile', {
        x: player.x,
        y: player.y,
        // fan/ring now share the global PROJ_SPEED_SCALE throttle (previously
        // raw def.speed made fan/ring weapons feel ~30% faster than chain/
        // boomerang/rain which already applied the scale).
        vx: Math.cos(angle) * def.speed * PROJ_SPEED_SCALE * (loadout.projSpeedMult ?? 1),
        vy: Math.sin(angle) * def.speed * PROJ_SPEED_SCALE * (loadout.projSpeedMult ?? 1),
        radius: def.radius * (loadout.projSizeMult ?? 1),
        damage,
        pierce: def.pierce + (loadout.pierceBonus ?? 0),
        life: def.life * (loadout.projLifeMult ?? 1),
        knockback: def.knockback,
        color: def.color,
        sprite: def.sprite,
        hits: [],
        bounceLeft: def.bounceLeft || 0,
        bounceT: def.bounceInterval || 0,
        bounceInterval: def.bounceInterval || 0,
        ...tag,
      });
    }
    return true;
  }

  function update(dt, world, player, loadout, events) {
    // One-at-a-time rule: don't fire if a projectile from this weapon is still
    // active. Builds a per-weapon active count once per frame (cheaper than a
    // counter that hooks spawn/death paths). Entity pool churn is small enough
    // that a single iteration is invisible at 60fps.
    const activeByWeapon = {};
    for (const e of world.entities) {
      if (!e.dead && e.type === 'projectile' && e.weaponId) {
        activeByWeapon[e.weaponId] = (activeByWeapon[e.weaponId] || 0) + 1;
      }
    }

    for (const id in loadout.weapons) {
      const baseDef = WEAPONS[id];
      if (!baseDef) continue;
      const level = loadout.weapons[id];
      // Fold per-weapon skill perks onto the base def. fire() reads def.X
      // throughout; effectiveDef returns the same object reference when the
      // weapon has no skills so this is free for legacy weapons.
      const def = effectiveDef(baseDef, level);
      timers[id] = (timers[id] ?? 0) - dt;
      if (timers[id] > 0) continue;
      // One-at-a-time: if any projectile from this weapon is still in flight,
      // hold the next volley. Keep the timer at 0 so we re-check next frame.
      if ((activeByWeapon[id] || 0) > 0) {
        timers[id] = 0;
        continue;
      }
      const fired = fire(world, player, def, level, loadout, events);
      // AoE/pull zones felt over-frequent (user feedback). Inflate their
      // cooldown 1.3× so the "lay down" cadence matches the slower
      // projectile speed — fan/ring/orbit etc. keep their normal cooldown.
      const zoneSlowdown = def.pattern === 'aoe' || def.pattern === 'pull' ? 1.3 : 1;
      timers[id] = fired ? def.cooldown * loadout.cooldownMult * zoneSlowdown : 0;
      if (fired && events) {
        events.emit('fire', {
          x: player.x,
          y: player.y,
          muzzle: def.muzzle || null,
          action: actionFx(def),
          fireSfx: fireSoundFor(def),
        });
      }
    }
  }

  return { update };
}
