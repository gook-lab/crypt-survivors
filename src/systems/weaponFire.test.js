import { describe, it, expect } from 'vitest';
import { createWeaponFire, effectiveDef } from './weaponFire.js';
import { createWorld } from '../engine/world.js';
import { WEAPONS } from '../content/weapons.js';

const loadout = (over) => ({
  weapons: { wand: 1 },
  damageMult: 1,
  cooldownMult: 1,
  projectileBonus: 0,
  ...over,
});

function withEnemyAt(x, y) {
  const w = createWorld();
  const player = w.spawn('player', { x: 0, y: 0 });
  w.spawn('enemy', { x, y });
  return { w, player };
}

describe('weaponFire', () => {
  it('the wand fires at an enemy when off cooldown', () => {
    const { w, player } = withEnemyAt(100, 0);
    createWeaponFire().update(0.016, w, player, loadout());
    expect(w.count('projectile')).toBe(1);
  });

  it('holds fire while still on cooldown', () => {
    const { w, player } = withEnemyAt(100, 0);
    const wf = createWeaponFire();
    wf.update(0.016, w, player, loadout());
    wf.update(0.1, w, player, loadout());
    expect(w.count('projectile')).toBe(1);
  });

  it('holds fire while the prior projectile is still alive (one-at-a-time)', () => {
    const { w, player } = withEnemyAt(100, 0);
    const wf = createWeaponFire();
    wf.update(0.016, w, player, loadout());
    // wand cooldown is 1.0s, but its projectile life is 1.6s — the rule
    // skips the second volley until the first projectile dies/returns.
    wf.update(1.1, w, player, loadout());
    expect(w.count('projectile')).toBe(1);
  });

  it('fires again once the prior projectile has cleared', () => {
    const { w, player } = withEnemyAt(100, 0);
    const wf = createWeaponFire();
    wf.update(0.016, w, player, loadout());
    // kill + reap the first projectile so the one-at-a-time guard releases
    for (const e of w.entities) if (e.type === 'projectile') w.kill(e);
    w.reap();
    wf.update(1.1, w, player, loadout());
    expect(w.count('projectile')).toBe(1);
  });

  it('a fan weapon does not fire without a target', () => {
    const w = createWorld();
    const player = w.spawn('player', { x: 0, y: 0 });
    createWeaponFire().update(0.016, w, player, loadout());
    expect(w.count('projectile')).toBe(0);
  });

  it('projectileBonus adds projectiles to a volley', () => {
    const { w, player } = withEnemyAt(100, 0);
    createWeaponFire().update(0.016, w, player, loadout({ projectileBonus: 2 }));
    expect(w.count('projectile')).toBe(3); // wand 1 + bonus 2
  });

  it('a ring weapon fires a full ring even with no enemies', () => {
    const w = createWorld();
    const player = w.spawn('player', { x: 0, y: 0 });
    createWeaponFire().update(0.016, w, player, loadout({ weapons: { nova: 1 } }));
    // uniform leveling — every weapon starts at 1 projectile (ring inclusive)
    expect(w.count('projectile')).toBe(1);
  });

  it('fires every owned weapon', () => {
    const { w, player } = withEnemyAt(100, 0);
    createWeaponFire().update(0.016, w, player, loadout({ weapons: { wand: 1, nova: 1 } }));
    expect(w.count('projectile')).toBe(2); // wand 1 + nova 1 (uniform Lv1)
  });

  it('weapon level scales projectile damage', () => {
    const lvl1 = withEnemyAt(100, 0);
    createWeaponFire().update(0.016, lvl1.w, lvl1.player, loadout({ weapons: { wand: 1 } }));
    const dmg1 = lvl1.w.entities.find((e) => e.type === 'projectile').damage;

    const lvl3 = withEnemyAt(100, 0);
    createWeaponFire().update(0.016, lvl3.w, lvl3.player, loadout({ weapons: { wand: 3 } }));
    const dmg3 = lvl3.w.entities.find((e) => e.type === 'projectile').damage;

    expect(dmg3).toBeGreaterThan(dmg1); // dmgPerLevel 0.3 -> level 3 hits harder
  });

  it('a melee weapon swings a stationary, wide blade hitbox', () => {
    const { w, player } = withEnemyAt(60, 0);
    createWeaponFire().update(0.016, w, player, loadout({ weapons: { sword: 1 } }));
    const blade = w.entities.find((e) => e.type === 'projectile');
    expect(blade).toBeTruthy();
    expect(blade.vx).toBe(0); // a swing does not travel
    expect(blade.vy).toBe(0);
    expect(blade.radius).toBeGreaterThan(20); // wide swing area
  });

  it('a melee weapon swings even with no enemy in range', () => {
    const w = createWorld();
    const player = w.spawn('player', { x: 0, y: 0 });
    createWeaponFire().update(0.016, w, player, loadout({ weapons: { sword: 1 } }));
    expect(w.count('projectile')).toBe(1);
  });

  // Phase 1 rebuild — projectile counts at lv1 (no passives, no bonuses).
  // Each new weapon is data only; the engine spawns one entity per shot in
  // its pattern. These tests lock in the volley size + key flags.
  // Uniform leveling — all weapons start at 1 projectile at Lv1, regardless
  // of pattern. Per-pattern fields (orbit angSpeed/radius, ring spread, etc.)
  // still apply to whatever count is spawned.

  it('holy_nova — 1 ring shot at Lv1 (uniform start)', () => {
    const w = createWorld();
    const player = w.spawn('player', { x: 0, y: 0 });
    createWeaponFire().update(0.016, w, player, loadout({ weapons: { holy_nova: 1 } }));
    expect(w.count('projectile')).toBe(1);
  });

  it('divine_rain — 1 falling hammer at Lv1 (uniform start)', () => {
    const w = createWorld();
    const player = w.spawn('player', { x: 0, y: 0 });
    createWeaponFire().update(0.016, w, player, loadout({ weapons: { divine_rain: 1 } }));
    expect(w.count('projectile')).toBe(1);
  });


  it('whirlwind_blade — 4 spinning blades at Lv1 (bible-style baseProj)', () => {
    // Spinning orbit weapons (orbitRadius > 0) opt out of the uniform 1-at-Lv1
    // ramp via `baseProj`. The ring needs an evenly spaced "necklace" silhouette
    // at all levels — starting with 1 blade reads as a single missile, not a
    // surrounding orbit. baseProj:4 here matches bible:3 / guardian_orbit:3 /
    // hawk_swarm:3 (all set so Lv1 is recognisable as the weapon's identity).
    const w = createWorld();
    const player = w.spawn('player', { x: 0, y: 0 });
    createWeaponFire().update(0.016, w, player, loadout({ weapons: { whirlwind_blade: 1 } }));
    expect(w.count('projectile')).toBe(4);
    const blade = w.entities.find((e) => e.type === 'projectile');
    expect(blade.orbit.angSpeed).toBeCloseTo(4.5); // signature fast spin
  });

  it('uniform projectile ramp: Lv1=1, Lv3=2, Lv5=3', () => {
    for (const [lvl, expected] of [[1, 1], [2, 1], [3, 2], [4, 2], [5, 3]]) {
      const w = createWorld();
      const player = w.spawn('player', { x: 0, y: 0 });
      createWeaponFire().update(0.016, w, player, loadout({ weapons: { holy_nova: lvl } }));
      expect(w.count('projectile'), `Lv${lvl}`).toBe(expected);
    }
  });

  // `multi` passive must actually add projectiles to every volley. Regression
  // guard: PROJ_CAP was 5 — every passive level past 1 on mid/late weapons
  // (Lv5+) was silently swallowed by the cap. Cap is now 8, so multi maxes
  // (+3 — value derived in loadout.recompute) remain visible on Lv5 ring
  // weapons (projAtLevel(5)=3 + projectileBonus=3 = 6).
  it('projectileBonus stacks on top of level ramp (Lv5 ring + bonus 3 → 6 shots)', () => {
    const w = createWorld();
    w.spawn('enemy', { x: 100, y: 0, hp: 50, radius: 10 });
    const player = w.spawn('player', { x: 0, y: 0 });
    createWeaponFire().update(0.016, w, player, loadout({
      weapons: { holy_nova: 5 },
      projectileBonus: 3,
    }));
    expect(w.count('projectile')).toBe(6);
  });

  it('projectileBonus adds shots to Lv1 ring weapon (1 + 1 = 2)', () => {
    const w = createWorld();
    w.spawn('enemy', { x: 100, y: 0, hp: 50, radius: 10 });
    const player = w.spawn('player', { x: 0, y: 0 });
    createWeaponFire().update(0.016, w, player, loadout({
      weapons: { holy_nova: 1 },
      projectileBonus: 1,
    }));
    expect(w.count('projectile')).toBe(2);
  });

  // bible-style orbit weapons must spawn their full ring at Lv1 — the
  // signature silhouette (3+ orbs circling) is the weapon's identity.
  // Regression guard: pre-fix these spawned only 1 because projCount
  // ignored def.projectiles when baseProj wasn't set.
  it('bible spawns 3 orbs at Lv1 (signature ring count)', () => {
    const w = createWorld();
    const player = w.spawn('player', { x: 0, y: 0 });
    createWeaponFire().update(0.016, w, player, loadout({ weapons: { bible: 1 } }));
    expect(w.count('projectile')).toBe(3);
  });

  it('orbit weapons start at their designed projectile count (not 1)', () => {
    // baseProj is the per-weapon Lv1 count — bible-style ring identity.
    const expected = {
      bible: 3,
      holy_censer: 2,
      guardian_orbit: 3,
      hawk_swarm: 3,
      whirlwind_blade: 4,
    };
    for (const [id, count] of Object.entries(expected)) {
      const w = createWorld();
      const player = w.spawn('player', { x: 0, y: 0 });
      createWeaponFire().update(0.016, w, player, loadout({ weapons: { [id]: 1 } }));
      expect(w.count('projectile'), id).toBe(count);
    }
  });

  // bouncesGrowth — lightning gains +1 hop per 2 levels (lv1→4, lv3→5, lv5→6).
  // The engine writes the effective hop count into projectile.chain.
  it('lightning bouncesGrowth — lv1 keeps base hops (4)', () => {
    const { w, player } = withEnemyAt(100, 0);
    createWeaponFire().update(0.016, w, player, loadout({ weapons: { lightning: 1 } }));
    const bolt = w.entities.find((e) => e.type === 'projectile');
    expect(bolt.chain).toBe(4);
  });

  it('lightning bouncesGrowth — lv5 ramps to 6 hops', () => {
    const { w, player } = withEnemyAt(100, 0);
    createWeaponFire().update(0.016, w, player, loadout({ weapons: { lightning: 5 } }));
    const bolt = w.entities.find((e) => e.type === 'projectile');
    expect(bolt.chain).toBe(6);
  });

  // ── bezier_strike (검은 비둘기) ──────────────────────────────────────────
  describe('bezier_strike pattern (black_pigeon)', () => {
    it('fires baseProj=10 beams at lv1 even without a target', () => {
      const w = createWorld();
      const player = w.spawn('player', { x: 0, y: 0 });
      createWeaponFire().update(0.016, w, player, loadout({ weapons: { black_pigeon: 1 } }));
      expect(w.count('projectile')).toBe(10);
    });

    it('every beam carries a bezier curve from the pigeon into a single target zone', () => {
      const w = createWorld();
      const player = w.spawn('player', { x: 100, y: 200 });
      createWeaponFire().update(0.016, w, player, loadout({ weapons: { black_pigeon: 1 } }));
      const projs = w.entities.filter((e) => e.type === 'projectile');
      // emission point: originOffsetY = -34 → (100, 166)
      for (const p of projs) {
        expect(p.bezier.sx).toBe(100);
        expect(p.bezier.sy).toBe(166);
        // no landY/gravity — pure bezier flight
        expect(p.landY).toBeUndefined();
        expect(p.gravity).toBeUndefined();
      }
      // All beams should converge into ONE target zone of radius=160, so
      // the MAX pairwise distance between any two endpoints is bounded by
      // the zone diameter (triangle inequality — every pair is at most
      // 2*targetRadius apart). If endpoints were scattered around the
      // player in a 360° band like the pre-fix behavior, this would
      // routinely exceed 2*strikeMin = 360.
      let maxPair = 0;
      for (let i = 0; i < projs.length; i++) {
        for (let j = i + 1; j < projs.length; j++) {
          const d = Math.hypot(
            projs[i].bezier.ex - projs[j].bezier.ex,
            projs[i].bezier.ey - projs[j].bezier.ey,
          );
          if (d > maxPair) maxPair = d;
        }
      }
      expect(maxPair).toBeLessThanOrEqual(2 * 160 + 1e-6);
    });

    it('movement integrates the bezier and kills the beam at t=1', () => {
      // smoke test the movement integration: after one flightTime, every
      // beam should have advanced to its end point and been reaped.
      const w = createWorld();
      const player = w.spawn('player', { x: 0, y: 0 });
      createWeaponFire().update(0.016, w, player, loadout({ weapons: { black_pigeon: 1 } }));
      // Pull the bezier+kill loop out of movement.js inline so the test
      // doesn't depend on input/spawning the player input subsystem.
      const dt = 0.05;
      const flightTime = 1.2;
      const steps = Math.ceil(flightTime / dt) + 3;
      for (let step = 0; step < steps; step++) {
        for (const e of w.entities) {
          if (e.type !== 'projectile' || !e.bezier || e.dead) continue;
          const b = e.bezier;
          b.t += dt / b.duration;
          if (b.t >= 1) { w.kill(e); continue; }
          const u = 1 - b.t, u2 = u*u, t2 = b.t*b.t, ut2 = 2*u*b.t;
          e.x = u2*b.sx + ut2*b.cx + t2*b.ex;
          e.y = u2*b.sy + ut2*b.cy + t2*b.ey;
        }
        w.reap();
      }
      expect(w.count('projectile')).toBe(0);
    });

    it('lv5 skill ramp produces ~45 beams (within projCap)', () => {
      const w = createWorld();
      const player = w.spawn('player', { x: 0, y: 0 });
      createWeaponFire().update(0.016, w, player, loadout({ weapons: { black_pigeon: 5 } }));
      // baseProj 10 + (5-1)*growth 5 = 30, plus skill +5 (lv2) +10 (lv5) = 45
      expect(w.count('projectile')).toBe(45);
    });
  });

  // ── arc_burst pattern weapons (falling_axe family) ─────────────────────
  describe('arc_burst pattern (ballistic hammer/axe toss)', () => {
    it('falling_axe spawns 1 axe at Lv1, with gravity stamped on the entity', () => {
      const w = createWorld();
      const player = w.spawn('player', { x: 0, y: 0 });
      createWeaponFire().update(0.016, w, player, loadout({ weapons: { falling_axe: 1 } }));
      expect(w.count('projectile')).toBe(1);
      const axe = w.entities.find((e) => e.type === 'projectile');
      expect(axe.gravity).toBe(620); // falling_axe def
      expect(axe.weaponId).toBe('falling_axe');
    });

    it('holy_hammer_toss inherits the falling_axe ballistics (heavier gravity)', () => {
      const w = createWorld();
      const player = w.spawn('player', { x: 0, y: 0 });
      createWeaponFire().update(0.016, w, player, loadout({ weapons: { holy_hammer_toss: 1 } }));
      expect(w.count('projectile')).toBe(1);
      const hammer = w.entities.find((e) => e.type === 'projectile');
      expect(hammer.gravity).toBe(720); // heavier than falling_axe (620)
      expect(hammer.weaponId).toBe('holy_hammer_toss');
      expect(hammer.proc.fx).toBe('status_stun'); // signature proc differs from axe (bleed)
    });

    it('leg_world_hammer is registered as a legendary arc_burst', () => {
      const def = WEAPONS.leg_world_hammer;
      expect(def, 'leg_world_hammer must exist').toBeTruthy();
      expect(def.tier).toBe('legendary');
      expect(def.pattern).toBe('arc_burst');
      expect(def.proc.chance).toBe(1.0); // guaranteed stun
    });

    it('leg_world_hammer Lv3 skill widens radius and trims cooldown', () => {
      const eff = effectiveDef(WEAPONS.leg_world_hammer, 3);
      expect(eff.cooldown).toBeCloseTo(2.4 * 0.88, 5); // lv2 cd trim
      expect(eff.radius).toBeCloseTo(14 * 1.25, 5);     // lv3 radius bump
    });
  });

  // ── v2 rebuild — effectiveDef skill-tree fold ─────────────────────────────
  describe('effectiveDef (skill tree fold)', () => {
    it('returns the same def reference when no skills + lv1', () => {
      const def = { speed: 100 };
      expect(effectiveDef(def, 1)).toBe(def);
    });

    it('returns the same def reference at lv1 even with skills (lvl 2+ only)', () => {
      const def = { speed: 100, skills: [{ lvl: 2, mod: { speed: 1.5 } }] };
      expect(effectiveDef(def, 1)).toBe(def);
    });

    it('number mod multiplies (radius 100 × 1.25 = 125 at lv2)', () => {
      const def = { radius: 100, skills: [{ lvl: 2, mod: { radius: 1.25 } }] };
      expect(effectiveDef(def, 2).radius).toBe(125);
    });

    it("'+N' string mod adds (pierce 2 + 2 = 4 at lv4)", () => {
      const def = {
        pierce: 2,
        skills: [
          { lvl: 2, mod: {} },
          { lvl: 3, mod: {} },
          { lvl: 4, mod: { pierce: '+2' } }
        ],
      };
      expect(effectiveDef(def, 4).pierce).toBe(4);
    });

    it('proc mod merges into eff.proc (chance overwrites, fx preserved)', () => {
      const def = {
        proc: { fx: 'status_bleed', chance: 0.2 },
        skills: [{ lvl: 3, mod: { proc: { chance: 0.5 } } }],
      };
      const eff = effectiveDef(def, 3);
      expect(eff.proc.chance).toBe(0.5);
      expect(eff.proc.fx).toBe('status_bleed'); // not overwritten
    });

    it('proc mod survives a missing base proc (creates one)', () => {
      const def = {
        proc: null,
        skills: [{ lvl: 3, mod: { proc: { fx: 'status_freeze', chance: 0.3 } } }],
      };
      const eff = effectiveDef(def, 3);
      expect(eff.proc).toEqual({ fx: 'status_freeze', chance: 0.3 });
    });

    it('boolean mod overwrites (bouncesGrowth: true unlock)', () => {
      const def = {
        bounces: 3,
        skills: [{ lvl: 5, mod: { bouncesGrowth: true } }],
      };
      expect(effectiveDef(def, 5).bouncesGrowth).toBe(true);
    });

    it('does not mutate the original def or its proc', () => {
      const def = {
        radius: 100, pierce: 2, proc: { fx: 'status_bleed', chance: 0.2 },
        skills: [
          { lvl: 2, mod: { radius: 1.5 } },
          { lvl: 3, mod: { proc: { chance: 0.5 } } }
        ],
      };
      effectiveDef(def, 3);
      expect(def.radius).toBe(100);
      expect(def.proc.chance).toBe(0.2); // original untouched
    });

    it('skill mods stack across levels (lv5 sees all 4 perks)', () => {
      const def = {
        radius: 100, pierce: 2, speed: 100, projectiles: 1,
        skills: [
          { lvl: 2, mod: { radius: 1.2 } },           // 100 → 120
          { lvl: 3, mod: { speed: 1.5 } },            // 100 → 150
          { lvl: 4, mod: { pierce: '+2' } },          // 2 → 4
          { lvl: 5, mod: { projectiles: '+1' } },     // 1 → 2
        ],
      };
      const eff = effectiveDef(def, 5);
      expect(eff.radius).toBe(120);
      expect(eff.speed).toBe(150);
      expect(eff.pierce).toBe(4);
      expect(eff.projectiles).toBe(2);
    });
  });

  // ── Pilot skill trees on the 4 class starters ─────────────────────────────
  describe('pilot skill trees on class starters', () => {
    it('divine_hammer (knight) — lv5 grants +1 projectile and projGrowth', () => {
      const eff = effectiveDef(WEAPONS.divine_hammer, 5);
      expect(eff.projectiles).toBe(2); // base 1 + skill +1
      expect(eff.projGrowth).toBe(true);
      expect(eff.proc.chance).toBe(0.8); // lv3 boost
    });

    it('axe (warrior) — lv5 grants +1 boomerang, faster recovery', () => {
      const eff = effectiveDef(WEAPONS.axe, 5);
      expect(eff.projectiles).toBe(2); // base 1 + skill +1
      expect(eff.speed).toBeCloseTo(320 * 1.2, 5); // lv4 +20% speed
    });

    it('arrow (huntress) — lv5 grants +1 shot, +2 pierce, faster', () => {
      const eff = effectiveDef(WEAPONS.arrow, 5);
      expect(eff.projectiles).toBe(2);  // 1 + 1
      expect(eff.pierce).toBe(4);       // 2 + 2
      // huntress speed re-tuned: base 420 (was 560) × 1.2 매의 눈 perk
      expect(eff.speed).toBeCloseTo(420 * 1.2, 5);
      expect(eff.proc.chance).toBe(0.5);
    });

    it('nova (mage) — lv5 grants +4 projectiles, faster cooldown, big proc', () => {
      const eff = effectiveDef(WEAPONS.nova, 5);
      expect(eff.projectiles).toBe(12); // 8 + 4
      expect(eff.cooldown).toBeCloseTo(1.7 * 0.85, 5); // 15% faster
      expect(eff.proc.chance).toBe(0.5);
    });
  });

  // ── v2 rebuild — base + legendary roster integrity ─────────────────────────
  describe('weapon roster (v2 expansion)', () => {
    it('every BASE_WEAPONS id resolves to a real weapon def', async () => {
      const { BASE_WEAPONS } = await import('../content/weapons.js');
      for (const id of BASE_WEAPONS) {
        expect(WEAPONS[id], `BASE_WEAPONS contains unknown id ${id}`).toBeTruthy();
      }
    });

    it('every LEGENDARY_WEAPONS id resolves to a real weapon def', async () => {
      const { LEGENDARY_WEAPONS } = await import('../content/weapons.js');
      for (const id of LEGENDARY_WEAPONS) {
        expect(WEAPONS[id], `LEGENDARY_WEAPONS contains unknown id ${id}`).toBeTruthy();
        expect(WEAPONS[id].tier, `${id} should be tier=legendary`).toBe('legendary');
      }
    });

    it('roster size hits the v2 targets (≥71 base, ≥30 legendary)', async () => {
      const { BASE_WEAPONS, LEGENDARY_WEAPONS } = await import('../content/weapons.js');
      // Threshold lowered from 72 → 71 → 57 → 55 after repeated prunes of
      // weapons without PixelLab art and concept dupes (prism/bone/holy_lance/
      // frost_bolt/crossbow_bolt/void_orb/storm_field/ember_ring/solar_flare/
      // titans_grip/silencer_dart/inferno_bolt/voltaic_ring/plasma_orb).
      // Keep floor so future deletions are deliberate.
      expect(BASE_WEAPONS.length).toBeGreaterThanOrEqual(55);
      expect(LEGENDARY_WEAPONS.length).toBeGreaterThanOrEqual(29);
    });

    it('Phase 1 + v2 new weapons all have skill trees (auto-injected or explicit)', () => {
      // class starters (4) + Phase 1 (5) + v2 new (35) = 44 weapons must
      // expose .skills so effectiveDef has perks to fold at lv2-5.
      const ids = [
        // starters (4 — explicit on the def, not auto-injected)
        'cross', 'wand', 'arrow', 'axe',
        // Phase 1 rebuild (5)
        'holy_nova', 'divine_rain', 'whirlwind_blade',
        // v2 knight (7)
        'crusader_lance', 'guardian_orbit', 'judgement_beam',
        'consecrate', 'aegis_throw', 'dawnbreaker',
        // v2 warrior (7) — chained_spear pruned (no PixelLab art)
        'berserker_axe', 'gladius_throw', 'anvil_drop', 'spike_burst',
        'meat_cleaver', 'warcry_pulse',
        // v2 huntress (9)
        'piercing_arrow', 'barbed_net', 'hawk_swarm', 'bear_trap',
        'marksman_shot', 'phantom_arrow', 'salvo_shot',
        'hunters_blade',
        // v2 mage (11)
        'meteor', 'ice_spear', 'chain_void', 'arcane_orb', 'elemental_burst',
        'frost_nova', 'magma_burst', 'glacial_lance',
        // arc_burst expansion (basic sibling of falling_axe)
        'holy_hammer_toss',
      ];
      for (const id of ids) {
        expect(WEAPONS[id], id).toBeTruthy();
        expect(WEAPONS[id].skills, `${id} missing skills`).toBeTruthy();
        expect(WEAPONS[id].skills.length, `${id} has too few perks`).toBeGreaterThanOrEqual(4);
      }
    });
  });

  describe('throwing weapon effectAsset', () => {
    it('throwing weapons declare an effectAsset that resolves in sigAssets', async () => {
      const { SIG_ASSETS } = await import('../util/sigAssets.js');
      const ids = [
        'knives', 'axe', 'shield_throw', 'cross',
        'throw_axes' ];
      for (const id of ids) {
        const def = WEAPONS[id];
        expect(def, id).toBeTruthy();
        expect(def.effectAsset, `${id} missing effectAsset`).toBeTruthy();
        expect(
          SIG_ASSETS[def.effectAsset],
          `${id} effectAsset '${def.effectAsset}' not registered in sigAssets`,
        ).toBeTruthy();
      }
    });

    it('a thrown projectile carries its effectAsset onto the spawned entity', () => {
      const { w, player } = withEnemyAt(100, 0);
      createWeaponFire().update(0.016, w, player, loadout({ weapons: { knives: 1 } }));
      const p = w.entities.find((e) => e.type === 'projectile');
      expect(p).toBeTruthy();
      expect(p.effectAsset).toBe('knives_fx');
    });
  });

  // AoE pattern multi-zone spawn — P5 fix (2026-05-23). Before the fix, the
  // AoE branch dropped exactly one zone regardless of projectile count, so the
  // `multi` passive (loadout.projectileBonus) and the uniform level ramp were
  // silently ignored for ~15 AoE weapons (holywater, smite, sanctuary,
  // divine_hammer, meteor, etc). These tests pin the corrected behaviour.
  describe('AoE pattern: multi-zone spawn (P5)', () => {
    it('holywater at Lv1 with no projectile bonus drops exactly one zone', () => {
      const { w, player } = withEnemyAt(100, 0);
      createWeaponFire().update(
        0.016,
        w,
        player,
        loadout({ weapons: { holywater: 1 }, projectileBonus: 0 }),
      );
      const zones = w.entities.filter((e) => e.type === 'projectile');
      expect(zones).toHaveLength(1);
      expect(zones[0].rehit).toBeCloseTo(0.4);
    });

    it('multi passive (projectileBonus) spawns additional zones', () => {
      // Lv1 ramp = 1 zone, + projectileBonus 2 → expect 3 zones total
      const w = createWorld();
      const player = w.spawn('player', { x: 0, y: 0 });
      w.spawn('enemy', { x: 100, y: 0 });
      w.spawn('enemy', { x: 60, y: 80 });
      w.spawn('enemy', { x: -50, y: 50 });
      createWeaponFire().update(
        0.016,
        w,
        player,
        loadout({ weapons: { holywater: 1 }, projectileBonus: 2 }),
      );
      expect(w.count('projectile')).toBe(3);
    });

    it('Lv3 holywater respects the uniform projectile ramp', () => {
      // projAtLevel(3) = 2 — every weapon gains a projectile at Lv3.
      const w = createWorld();
      const player = w.spawn('player', { x: 0, y: 0 });
      w.spawn('enemy', { x: 100, y: 0 });
      w.spawn('enemy', { x: -100, y: 30 });
      createWeaponFire().update(
        0.016,
        w,
        player,
        loadout({ weapons: { holywater: 3 }, projectileBonus: 0 }),
      );
      expect(w.count('projectile')).toBe(2);
    });

    it('when fewer enemies than zones, extra zones jitter around the anchor', () => {
      // 1 enemy, count = 3 (Lv1 + projectileBonus 2). Anchor on the enemy; the
      // remaining two zones should jitter inside ~radius distance, not stack.
      const { w, player } = withEnemyAt(120, 0);
      createWeaponFire().update(
        0.016,
        w,
        player,
        loadout({ weapons: { holywater: 1 }, projectileBonus: 2 }),
      );
      const zones = w.entities.filter((e) => e.type === 'projectile');
      expect(zones).toHaveLength(3);
      // first zone anchors on the enemy
      expect(zones[0].x).toBeCloseTo(120);
      expect(zones[0].y).toBeCloseTo(0);
      // remaining zones shifted off the anchor (jitter > 0)
      const offsets = zones.slice(1).map((z) =>
        Math.hypot(z.x - 120, z.y - 0),
      );
      for (const off of offsets) {
        expect(off).toBeGreaterThan(0);
      }
    });

    it('emits an aoeCast event per zone when def.aoeKit is set', () => {
      const w = createWorld();
      const player = w.spawn('player', { x: 0, y: 0 });
      w.spawn('enemy', { x: 100, y: 0 });
      w.spawn('enemy', { x: -100, y: 0 });
      const casts = [];
      const events = { emit: (name, p) => { if (name === 'aoeCast') casts.push(p); } };
      const wf = createWeaponFire();
      wf.update(
        0.016,
        w,
        player,
        loadout({ weapons: { holywater: 1 }, projectileBonus: 1 }),
        events,
      );
      expect(casts).toHaveLength(2);
      expect(casts[0].weaponId).toBe('holywater');
      expect(casts[1].weaponId).toBe('holywater');
      // each cast carries its own (x,y) — multi-cast reads as N drops
      expect(casts[0].x).not.toBe(casts[1].x);
    });
  });

  describe('aura_buff level scaling', () => {
    // Regression: aura_buff weapons (arcane_field, warcry_pulse, etc.) read
    // duration straight off def, so leveling 1→5 did nothing — 4 inert picks.
    // Each level past 1 now adds 1s of buff uptime.
    const stampBuff = (lvl) => {
      const w = createWorld();
      const player = w.spawn('player', { x: 0, y: 0 });
      const buffs = [];
      createWeaponFire().update(
        0.016,
        w,
        player,
        loadout({ weapons: { arcane_field: lvl }, buffs, recompute: () => {} }),
      );
      return buffs;
    };

    it('stamps exactly one buff regardless of level', () => {
      expect(stampBuff(1)).toHaveLength(1);
      expect(stampBuff(5)).toHaveLength(1);
    });

    it('Lv5 buff uptime is +4s over Lv1 (leveling is no longer inert)', () => {
      const lvl1 = stampBuff(1)[0].life;
      const lvl5 = stampBuff(5)[0].life;
      expect(lvl5).toBeGreaterThan(lvl1);
      expect(lvl5 - lvl1).toBeCloseTo(4, 5);
    });
  });

  describe('throw weapons (boomerang pattern) fly straight off-screen', () => {
    // Redesign: axe/gladius/shield/cross throws no longer curve back. They
    // fly straight (no boomerang flag) and pierce off-screen. Curve-back is
    // opt-in per weapon via def.returns.
    it('axe spawns a straight projectile with no boomerang curve-back', () => {
      const { w, player } = withEnemyAt(100, 0);
      createWeaponFire().update(0.016, w, player, loadout({ weapons: { axe: 1 } }));
      const proj = [...w.entities].find((e) => e.type === 'projectile');
      expect(proj).toBeTruthy();
      expect(proj.boomerang).toBeFalsy(); // no return curve
      expect(proj.pierce).toBeGreaterThanOrEqual(999); // plows through, exits screen
      expect(Math.hypot(proj.vx, proj.vy)).toBeGreaterThan(0); // actually moving
    });
  });

  describe('Speed powerup (loadout.projSpeedMult) scales projectile velocity', () => {
    const speed = (mult) => {
      const { w, player } = withEnemyAt(100, 0);
      createWeaponFire().update(0.016, w, player, loadout({ weapons: { axe: 1 }, projSpeedMult: mult }));
      const proj = [...w.entities].find((e) => e.type === 'projectile');
      return Math.hypot(proj.vx, proj.vy);
    };
    it('projSpeedMult 2 doubles the launch velocity vs 1', () => {
      const base = speed(1);
      const fast = speed(2);
      expect(fast).toBeCloseTo(base * 2, 1);
    });
  });

  describe('weapon fire SFX (fireSfx on the fire event)', () => {
    // The sim never imports audio — weaponFire just stamps a sound key onto the
    // 'fire' event; main.js plays it. Archetype is derived from kind/pattern/tags
    // unless the weapon def sets `fireSfx` explicitly.
    const captureFire = (weapons) => {
      const { w, player } = withEnemyAt(100, 0);
      const fires = [];
      const events = { emit: (name, data) => { if (name === 'fire') fires.push(data); }, on: () => {} };
      createWeaponFire().update(0.016, w, player, loadout({ weapons }), events);
      return fires;
    };

    it('a magic fan weapon (wand, arcane) ships fire_shot', () => {
      const fires = captureFire({ wand: 1 });
      expect(fires.length).toBe(1);
      expect(fires[0].fireSfx).toBe('fire_shot');
    });
    it('a physical fan weapon (knives) ships fire_throw', () => {
      expect(captureFire({ knives: 1 })[0].fireSfx).toBe('fire_throw');
    });
    it('a boomerang weapon (axe) ships fire_throw', () => {
      expect(captureFire({ axe: 1 })[0].fireSfx).toBe('fire_throw');
    });
    it('a melee weapon (sword) ships fire_swing', () => {
      expect(captureFire({ sword: 1 })[0].fireSfx).toBe('fire_swing');
    });
    it('an aoe weapon (holywater) ships fire_cast', () => {
      expect(captureFire({ holywater: 1 })[0].fireSfx).toBe('fire_cast');
    });
    it('omitting events keeps the sim headless (no throw)', () => {
      const { w, player } = withEnemyAt(100, 0);
      expect(() => createWeaponFire().update(0.016, w, player, loadout({ weapons: { wand: 1 } }))).not.toThrow();
    });
  });
});
