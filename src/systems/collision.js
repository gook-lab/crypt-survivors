// Collision system (eng-review D6). Collision matrix:
//   projectile -> enemy   : damage + pierce
//   enemy      -> player  : contact damage
//   enemy     <-> enemy   : separation (VS-style push-apart so enemies don't
//                           stack on a single pixel)
// Also handles projectile lifetime / off-screen despawn.
//
// The spatial hash is rebuilt every frame (premise #4) — simplest and correct;
// cell size is tuned via the Session 2 stress test.

import { createSpatialHash } from '../engine/spatialHash.js';
import { IFRAME } from '../config.js';

const QUERY_RADIUS = 40; // covers projectile + largest enemy, both ways
// Early-death fix B: extra cleared space (px) kept between the player and any
// overlapping enemy. Enemies are ejected to player.radius+e.radius+this each
// frame so the swarm can't stack on the player and pin a weak build. Tuned
// with PLAYER.regen (config.js) via 24-seed sweep — 14 (paired with regen 1.6)
// drops 4-min death rate 42%→13% without trivializing the run.
const PLAYER_BUBBLE = 14;

// Projectile→enemy hit tolerance: enemy visuals render at ~4.2× their
// hitbox radius while small projectiles (arrow r=4) stay tight to their
// own radius. Without a bonus, a shot can pass visibly inside the enemy
// silhouette without registering — the "타격이 잘 안 들어간다" complaint.
// +5px reads as "grazes still count" without enlarging enemy↔player
// contact (which stays on the raw radii — see Gotcha #12).
const HIT_TOLERANCE = 5;

const CHAIN_RANGE = 165; // px a chain bolt can jump to the next enemy
const CHAIN_SPEED = 640; // px/sec a chain bolt travels

export function createCollision() {
  const hash = createSpatialHash(48);
  const out = [];
  const out2 = []; // second query buffer (chain-lightning targeting)

  function update(dt, world, player, damage, events, stats) {
    const ents = world.entities;

    // tick down the player's invulnerability window
    if ((player.invuln ?? 0) > 0) player.invuln -= dt;

    // broadphase grid from living enemies
    hash.clear();
    for (let i = 0; i < ents.length; i++) {
      const e = ents[i];
      if (e.type === 'enemy' && !e.dead) hash.insert(e);
    }

    for (let i = 0; i < ents.length; i++) {
      const e = ents[i];
      if (e.dead) continue;

      if (e.type === 'projectile') {
        // lifetime / despawn
        e.life -= dt;
        if (e.life <= 0) {
          world.kill(e);
          continue;
        }
        // dormant zone (sky-drop delay) — no damage until the orb lands.
        // movement.js ticks down e.delay; collision just skips while > 0.
        if (e.delay > 0) continue;
        // enemy shot — a projectile aimed at the player, not enemies. Uses
        // the same armor / shield / i-frame path as a melee contact hit.
        if (e.enemyShot) {
          if ((player.invuln ?? 0) <= 0) {
            const sdx = player.x - e.x;
            const sdy = player.y - e.y;
            const srr = player.radius + e.radius;
            if (sdx * sdx + sdy * sdy <= srr * srr) {
              let dmg = e.damage * (1 - (player.armor ?? 0));
              if ((player.shield ?? 0) > 0) {
                const soak = Math.min(player.shield, dmg);
                player.shield -= soak;
                dmg -= soak;
              }
              if (dmg > 0) player.hp -= dmg;
              player.invuln = IFRAME;
              events.emit('playerHurt', {});
              world.kill(e);
            }
          }
          continue;
        }
        // projectile -> enemy
        // a wide query is needed for melee swings, which have a large radius
        const reach = QUERY_RADIUS + e.radius;
        hash.queryCircle(e.x, e.y, reach, out);
        for (let j = 0; j < out.length; j++) {
          const en = out[j];
          if (en.dead) continue;
          // hit tracking: a pierce/melee projectile damages each enemy once
          if (e.hits && e.hits.indexOf(en.id) !== -1) continue;
          const dx = en.x - e.x;
          const dy = en.y - e.y;
          const rr = e.radius + en.radius + HIT_TOLERANCE;
          if (dx * dx + dy * dy <= rr * rr) {
            // pass the projectile as the hit `source` (crit / impact / status)
            damage.apply(world, events, stats, en, e.damage, e.vx, e.vy, e.knockback, e);
            if (e.hits) e.hits.push(en.id);
            // chain lightning: hop a bolt to the nearest not-yet-hit enemy
            if (e.chain > 0) {
              hash.queryCircle(en.x, en.y, CHAIN_RANGE, out2);
              let best = null;
              let bestSq = Infinity;
              for (let k = 0; k < out2.length; k++) {
                const nx = out2[k];
                if (nx.dead || nx === en) continue;
                if (e.hits && e.hits.indexOf(nx.id) !== -1) continue;
                const cx = nx.x - en.x;
                const cy = nx.y - en.y;
                const sq = cx * cx + cy * cy;
                if (sq < bestSq) { bestSq = sq; best = nx; }
              }
              if (best) {
                // 도전체 — a frozen enemy conducts; the bolt loses no hop here
                // (net +2 jumps versus a normal hop's −1)
                const frozen = en.status && en.status.freeze > 0;
                // skyDrop chain: each hop strikes from above the next target
                // instead of arcing horizontally. Reads as "lightning falling
                // from the sky onto a new enemy" while keeping chain rules.
                let nx, ny, nvx, nvy, nStrikeY;
                if (e.skyDrop) {
                  nx = best.x;
                  ny = best.y - 220;
                  nvx = 0;
                  nvy = 900;
                  nStrikeY = best.y;
                } else {
                  const ang = Math.atan2(best.y - en.y, best.x - en.x);
                  nx = en.x;
                  ny = en.y;
                  nvx = Math.cos(ang) * CHAIN_SPEED;
                  nvy = Math.sin(ang) * CHAIN_SPEED;
                  nStrikeY = null;
                }
                world.spawn('projectile', {
                  x: nx, y: ny,
                  vx: nvx, vy: nvy,
                  radius: e.radius, damage: e.damage, pierce: 1, life: 0.5,
                  knockback: e.knockback, color: e.color, sprite: e.sprite,
                  hits: e.hits ? e.hits.slice() : [],
                  chain: e.chain - 1 + (frozen ? 2 : 0),
                  impactFx: e.impactFx, classImpactFx: e.classImpactFx,
                  critChance: e.critChance,
                  critMult: e.critMult, proc: e.proc,
                  weaponId: e.weaponId, // forward attribution to the bounce
                  skyDrop: e.skyDrop || false, // forward sky-drop visual
                  strikeY: nStrikeY, // y where sky-drop bolt should expire
                  aoeKit: e.aoeKit || null, // forward FX kit for next hop
                });
                // sky-drop chain bolts emit an aoeCast at each hop so the
                // telegraph cloud + impact zone FX paint at every target.
                // Same sync as the rain branch — short telegraph, zero
                // fallTime — so impact lands with the new strike.
                if (e.skyDrop && e.aoeKit && events) {
                  const syncedKit = { ...e.aoeKit, telegraphTime: 0.25, fallTime: 0 };
                  events.emit('aoeCast', {
                    x: best.x, y: best.y, kit: syncedKit, weaponId: e.weaponId,
                  });
                }
              }
            }
            e.pierce -= 1;
            if (e.pierce <= 0) {
              world.kill(e);
              break;
            }
          }
        }
      } else if (e.type === 'enemy') {
        // enemy -> player contact damage, gated by invulnerability frames so
        // a swarm chips the player instead of instantly killing (balance S6).
        // Armor (permanent upgrade) reduces the hit.
        if ((player.invuln ?? 0) <= 0) {
          const pdx = player.x - e.x;
          const pdy = player.y - e.y;
          const prr = player.radius + e.radius;
          if (pdx * pdx + pdy * pdy <= prr * prr) {
            // armor cuts the hit; the water-spirit shield soaks what it can
            let dmg = e.damage * (1 - (player.armor ?? 0));
            if ((player.shield ?? 0) > 0) {
              const soak = Math.min(player.shield, dmg);
              player.shield -= soak;
              dmg -= soak;
            }
            if (dmg > 0) player.hp -= dmg;
            player.invuln = IFRAME;
            events.emit('playerHurt', {});
          }
        }
        // player <-> enemy separation (early-death fix B): eject any enemy
        // overlapping the player out to a thin bubble so the swarm can't
        // stack ON the player. Keeps a small cleared ring — the player plows
        // a lane while moving and takes fewer intermittent chip hits while
        // kiting. Damage stays iframe-gated above, so this doesn't remove
        // contact damage; it just stops the pile-up that traps weak builds.
        {
          const bdx = e.x - player.x;
          const bdy = e.y - player.y;
          const bubble = player.radius + e.radius + PLAYER_BUBBLE;
          const bsq = bdx * bdx + bdy * bdy;
          if (bsq > 0.0001 && bsq < bubble * bubble) {
            const bd = Math.sqrt(bsq);
            const push = bubble - bd;
            e.x += (bdx / bd) * push;
            e.y += (bdy / bd) * push;
          }
        }
        // enemy <-> enemy separation: push e by half the overlap; the
        // neighbour pushes itself off when its own turn comes.
        hash.queryCircle(e.x, e.y, QUERY_RADIUS, out);
        for (let j = 0; j < out.length; j++) {
          const o = out[j];
          if (o === e || o.dead) continue;
          let ox = e.x - o.x;
          let oy = e.y - o.y;
          const sq = ox * ox + oy * oy;
          const minD = e.radius + o.radius;
          if (sq > 0.0001 && sq < minD * minD) {
            const d = Math.sqrt(sq);
            const push = (minD - d) * 0.5;
            e.x += (ox / d) * push;
            e.y += (oy / d) * push;
          }
        }
      }
    }
  }

  return { update };
}
