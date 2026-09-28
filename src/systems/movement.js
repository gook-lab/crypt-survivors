// Movement system — player input, enemy seek, projectile travel.
// Pure simulation: reads plain entity data + the input set, mutates positions.
//
// Projectiles travel along their velocity, except: `orbit` projectiles circle
// the player, `boomerang` projectiles fly out then curve back, and `homing`
// projectiles steer toward the nearest enemy. Enemy speed is scaled by
// `speedMult` (the status system drops it for freeze / slow / stun).

import { structuresNear, STRUCT_RADIUS } from '../util/structureField.js';

const HOMING_TURN = 5.5; // rad/sec a homing projectile may steer

export function createMovement(input) {
  let mapRooms = []; // the chosen map's room blueprints — set by setMap()
  let mapZones = []; // zones for the current map — passed through to structuresNear
  let mapClusterSize = 4;
  let weeklyModifier = null; // weekly challenge modifier (enemy/player speed mult)
  // Deterministic sim clock for movement patterns (weave). Accumulated from the
  // FIXED_DT ticks so the same seed reproduces in the balance harness — never
  // Date.now(). Used by `e.movePattern === 'weave'` for the side-to-side phase.
  let elapsed = 0;
  function setMap(map) {
    // Tolerate legacy callers that pass only `rooms`. New callers pass the full
    // map object so zones flow through; that keeps collision in sync with the
    // renderer's zone-filtered prop selection.
    if (Array.isArray(map)) {
      mapRooms = map;
      mapZones = [];
      mapClusterSize = 4;
    } else {
      mapRooms = (map && map.rooms) || [];
      mapZones = (map && map.zones) || [];
      mapClusterSize = (map && map.zoneClusterSize) || 4;
    }
  }

  function nearestEnemy(world, x, y) {
    let best = null;
    let bestSq = Infinity;
    const ents = world.entities;
    for (let i = 0; i < ents.length; i++) {
      const e = ents[i];
      if (e.type !== 'enemy' || e.dead) continue;
      const dx = e.x - x;
      const dy = e.y - y;
      const sq = dx * dx + dy * dy;
      if (sq < bestSq) {
        bestSq = sq;
        best = e;
      }
    }
    return best;
  }

  function update(dt, world, player, loadout) {
    elapsed += dt;
    // --- player: normalised 8-direction movement ---
    let dx = 0;
    let dy = 0;
    if (input.has('left')) dx -= 1;
    if (input.has('right')) dx += 1;
    if (input.has('up')) dy -= 1;
    if (input.has('down')) dy += 1;
    // Apply weekly challenge player speed modifier
    let moveSpeed = loadout.moveSpeed;
    if (weeklyModifier?.modifierName === 'player_speed_mult') {
      moveSpeed *= weeklyModifier.value;
    }
    // Ice chapter (Ch.5) — smooth toward the input direction instead of
    // snapping. The previous frame's velocity bleeds into this frame,
    // creating a small slide that the player has to plan around.
    if (player.iceSlide) {
      const targetVx = dx === 0 && dy === 0 ? 0 : (dx / Math.hypot(dx, dy)) * moveSpeed;
      const targetVy = dx === 0 && dy === 0 ? 0 : (dy / Math.hypot(dx, dy)) * moveSpeed;
      const lerp = 0.08; // lower = slippier; 0.08 ≈ ~150ms to reach target
      player.vx = (player.vx || 0) + (targetVx - (player.vx || 0)) * lerp;
      player.vy = (player.vy || 0) + (targetVy - (player.vy || 0)) * lerp;
      player.x += player.vx * dt;
      player.y += player.vy * dt;
    } else if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      player.vx = (dx / len) * moveSpeed;
      player.vy = (dy / len) * moveSpeed;
      player.x += player.vx * dt;
      player.y += player.vy * dt;
    } else {
      player.vx = 0;
      player.vy = 0;
    }

    // keep the player out of map structures — they are impassable decoration.
    // Pass mapZones so the colliders match the renderer's zone-filtered set,
    // and read s.radius for per-prop overrides (large props use 36 instead of
    // STRUCT_RADIUS=21). Tiny epsilon guards against degenerate same-cell push.
    if (mapRooms.length > 0) {
      const near = structuresNear(mapRooms, player.x, player.y, 160, mapZones, mapClusterSize);
      for (let i = 0; i < near.length; i++) {
        const s = near[i];
        const sx = player.x - s.x;
        const sy = player.y - s.y;
        const minD = player.radius + (s.radius ?? STRUCT_RADIUS);
        const sq = sx * sx + sy * sy;
        if (sq > 0.0001 && sq < minD * minD) {
          const d = Math.sqrt(sq);
          player.x = s.x + (sx / d) * minD;
          player.y = s.y + (sy / d) * minD;
        }
      }
    }

    // --- other entities ---
    const ents = world.entities;
    // active vortex / pull zones (usually 0-2) — gathered once per tick
    const pullZones = [];
    for (let i = 0; i < ents.length; i++) {
      const z = ents[i];
      if (z.type === 'projectile' && z.pull && !z.dead && !(z.delay > 0)) pullZones.push(z);
    }
    for (let i = 0; i < ents.length; i++) {
      const e = ents[i];
      if (e.type === 'enemy') {
        // walk toward the player; status effects scale the speed, a charge
        // ability (enemyAbilities.js) briefly bursts it, and a heavy hit's
        // stagger (damage.js) halts it for a beat
        const tx = player.x - e.x;
        const ty = player.y - e.y;
        const d = Math.hypot(tx, ty) || 1;
        if (e.staggerT > 0) e.staggerT -= dt;
        // a telegraphing enemy commits to the cast — it locks in place so the
        // windup reads visually + the player can react to a static target
        // 'buffer' enemies stamp e.hasteT on nearby allies; movement owns its
        // lifetime (it's the only consumer) so a buffed ally returns to normal
        // speed on its own when the buffer stops refreshing or dies. Composes
        // multiplicatively with status speedMult (a slowed-but-hasted enemy is
        // 0.5 × 1.35), so crowd-control still bites.
        if (e.hasteT > 0) e.hasteT -= dt;
        const haste = e.hasteT > 0 ? 1.35 : 1;
        let speed = e.staggerT > 0 || e.telegraph > 0
          ? 0
          : e.speed * (e.speedMult ?? 1) * haste * (e.charging > 0 ? 2.6 : 1);
        // Apply weekly challenge enemy speed modifier
        if (weeklyModifier?.modifierName === 'enemy_speed_mult' && speed > 0) {
          speed *= weeklyModifier.value;
        }
        // Movement pattern fork. Default = straight seek. weave/orbit_strafe
        // change the path but still respect the telegraph/stagger freeze
        // (speed === 0 short-circuits to no motion). Charging overrides the
        // pattern — a charging weaver dashes straight so the lunge reads clean.
        if (speed > 0 && e.movePattern === 'weave' && !(e.charging > 0)) {
          // serpentine: full forward + perpendicular sine. Deterministic phase
          // from the entity id so a pack of weavers doesn't move in lockstep.
          const nx = tx / d;
          const ny = ty / d;
          const phase = (e.id % 7) * 0.9;
          const osc = Math.sin(elapsed * 4 + phase) * 0.6; // ±0.6 side sway
          e.x += (nx - ny * osc) * speed * dt;
          e.y += (ny + nx * osc) * speed * dt;
        } else if (speed > 0 && e.movePattern === 'orbit_strafe' && !(e.charging > 0)) {
          // hold a standoff ring of radius R: approach when far, retreat when
          // too close, circle (tangent) in the band. Forces the player to chase
          // or AoE instead of out-walking a straight seeker. R=150 keeps the
          // strafer inside typical weapon coverage so it doesn't drag the fight
          // out forever (220 made revenant ~2.7× baseline TTK — balance probe).
          const R = e.orbitR || 150;
          const nx = tx / d;
          const ny = ty / d;
          let mx;
          let my;
          if (d > R * 1.2) { mx = nx; my = ny; }
          else if (d < R * 0.8) { mx = -nx; my = -ny; }
          else { mx = -ny; my = nx; } // tangent — circle the player
          e.x += mx * speed * dt;
          e.y += my * speed * dt;
        } else {
          e.x += (tx / d) * speed * dt;
          e.y += (ty / d) * speed * dt;
        }
        // vortex weapons drag the enemy toward the zone centre.
        // z.pullRadius decouples reach from the visual disc radius — pull
        // extends past the disc so nearby enemies get sucked in even when
        // not standing inside the zone art.
        for (let p = 0; p < pullZones.length; p++) {
          const z = pullZones[p];
          const zx = z.x - e.x;
          const zy = z.y - e.y;
          const zd = Math.hypot(zx, zy);
          const reach = z.pullRadius || z.radius;
          if (zd > 1 && zd < reach) {
            e.x += (zx / zd) * z.pull * dt;
            e.y += (zy / zd) * z.pull * dt;
          }
        }
        // structures are impassable for monsters too — push enemy out if
        // it overlapped any nearby prop after the seek + pull steps. Same
        // resolver as the player branch above so behaviour stays consistent.
        if (mapRooms.length > 0) {
          const near = structuresNear(mapRooms, e.x, e.y, 160, mapZones, mapClusterSize);
          for (let i2 = 0; i2 < near.length; i2++) {
            const s = near[i2];
            const sx = e.x - s.x;
            const sy = e.y - s.y;
            const minD = (e.radius || 12) + (s.radius ?? STRUCT_RADIUS);
            const sq = sx * sx + sy * sy;
            if (sq > 0.0001 && sq < minD * minD) {
              const dd = Math.sqrt(sq);
              e.x = s.x + (sx / dd) * minD;
              e.y = s.y + (sy / dd) * minD;
            }
          }
        }
      } else if (e.type === 'projectile') {
        if (e.orbit) {
          // orbiting projectile: circle the player (radius 0 = a static aura)
          e.orbit.angle += e.orbit.angSpeed * dt;
          e.x = player.x + Math.cos(e.orbit.angle) * e.orbit.radius;
          e.y = player.y + Math.sin(e.orbit.angle) * e.orbit.radius;
          // Stamp radial-outward velocity so damage.apply's knockback shoves
          // enemies away from the player (not along the book's tangent).
          // damage.apply normalises by hypot, so magnitude is decorative.
          e.vx = Math.cos(e.orbit.angle);
          e.vy = Math.sin(e.orbit.angle);
        } else if (e.bezier) {
          // quadratic bezier flight (bezier_strike pattern, e.g. black_pigeon).
          // Position interpolates start → control → end over `duration` so the
          // beam carves a smooth swirl from the emitter to a chosen strike
          // point. Velocity is stamped from the derivative so the renderer
          // rotates the sprite along the tangent and damage.knockback aims
          // along the current flight direction.
          //
          // `e.delay` is reused as the stagger-spawn timer — bezier_strike
          // schedules each beam in the volley to launch at a different time
          // over staggerWindow seconds, so spawn delay > 0 means "queued but
          // not yet launched": no flight, no collision (collision.js also
          // skips e.delay > 0), no draw (drawBeams checks too).
          if (e.delay > 0) { e.delay -= dt; continue; }
          const b = e.bezier;
          b.t += dt / b.duration;
          if (b.t >= 1) {
            e.x = b.ex;
            e.y = b.ey;
            world.kill(e);
            continue;
          }
          const u = 1 - b.t;
          const u2 = u * u;
          const t2 = b.t * b.t;
          const ut2 = 2 * u * b.t;
          e.x = u2 * b.sx + ut2 * b.cx + t2 * b.ex;
          e.y = u2 * b.sy + ut2 * b.cy + t2 * b.ey;
          // B'(t) = 2(1-t)(C-S) + 2t(E-C)
          e.vx = 2 * u * (b.cx - b.sx) + 2 * b.t * (b.ex - b.cx);
          e.vy = 2 * u * (b.cy - b.sy) + 2 * b.t * (b.ey - b.cy);
        } else if (e.boomerang) {
          // Opt-in curve-back (weapon def `returns: true`). Default throw
          // weapons no longer set e.boomerang — they fall through to the
          // straight-flight path below and fly off-screen. Fly out, then
          // curve back to the player; re-arm hits on the return.
          e.boomerang.age += dt;
          if (e.boomerang.age >= e.boomerang.returnAt) {
            const tx = player.x - e.x;
            const ty = player.y - e.y;
            const d = Math.hypot(tx, ty) || 1;
            const sp = Math.hypot(e.vx, e.vy) || 1;
            e.vx = (tx / d) * sp;
            e.vy = (ty / d) * sp;
            if (!e.boomerang.cleared && e.hits) {
              e.hits.length = 0;
              e.boomerang.cleared = true;
            }
          }
          e.x += e.vx * dt;
          e.y += e.vy * dt;
        } else {
          // zones with a sky-drop delay are dormant until the orb visual
          // lands — no pulse, no damage tick, no pull contribution.
          if (e.delay > 0) {
            e.delay -= dt;
            continue;
          }
          // placed AoE zone: clear the hit list on a pulse so it re-damages
          if (e.rehit) {
            e.rehitT -= dt;
            if (e.rehitT <= 0) {
              if (e.hits) e.hits.length = 0;
              e.rehitT = e.rehit;
            }
          }
          // runetracer-style bounce: reflect velocity at a random angle every
          // `bounceInterval` seconds for `bounceLeft` bounces. Reuses the
          // hits-clear trick from boomerang so the projectile can re-damage
          // already-hit enemies after each reflection.
          if (e.bounceLeft > 0) {
            e.bounceT -= dt;
            if (e.bounceT <= 0) {
              const sp = Math.hypot(e.vx, e.vy);
              const cur = Math.atan2(e.vy, e.vx);
              // 70-130° reflection — keeps it from doubling back too neatly
              const mag = Math.PI * 0.4 + Math.random() * Math.PI * 0.3;
              const sign = Math.random() < 0.5 ? -1 : 1;
              const a = cur + mag * sign;
              e.vx = Math.cos(a) * sp;
              e.vy = Math.sin(a) * sp;
              e.bounceT = e.bounceInterval;
              e.bounceLeft -= 1;
              if (e.hits) e.hits.length = 0;
            }
          }
          if (e.homing) {
            const target = nearestEnemy(world, e.x, e.y);
            if (target) {
              const desired = Math.atan2(target.y - e.y, target.x - e.x);
              const cur = Math.atan2(e.vy, e.vx);
              let diff = desired - cur;
              while (diff > Math.PI) diff -= Math.PI * 2;
              while (diff < -Math.PI) diff += Math.PI * 2;
              const maxTurn = HOMING_TURN * dt;
              const turn = diff > maxTurn ? maxTurn : diff < -maxTurn ? -maxTurn : diff;
              const a = cur + turn;
              const sp = Math.hypot(e.vx, e.vy);
              e.vx = Math.cos(a) * sp;
              e.vy = Math.sin(a) * sp;
            }
          }
          // Ballistic arc (arc_burst pattern, e.g. black_pigeon). Accumulate
          // gravity into vy so the beam launched upward decelerates, peaks,
          // and falls back. Runs before the position integration so the same
          // dt's gravity affects this frame's displacement (semi-implicit
          // Euler — stable for our framerate).
          if (e.gravity) e.vy += e.gravity * dt;
          e.x += e.vx * dt;
          e.y += e.vy * dt;
          // Sky-drop bolts expire the moment they reach their target y.
          // Prevents rain projectiles from drifting past the strike point
          // and overshooting the telegraph/impact zone.
          if (e.skyDrop && e.strikeY != null && e.y >= e.strikeY) {
            world.kill(e);
          }
          // Ballistic beams die when they fall past their landing line —
          // only after they're descending (e.vy > 0), so the upward leg
          // can't trigger the kill if landY happens to be ABOVE origin.
          if (e.landY != null && e.vy > 0 && e.y >= e.landY) {
            world.kill(e);
          }
        }
      }
    }
  }

  function setWeeklyModifier(modifier) {
    weeklyModifier = modifier;
  }

  return { update, setMap, setWeeklyModifier };
}
