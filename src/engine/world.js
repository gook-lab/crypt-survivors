// Entity store — the simulation's single source of truth.
//
// Entities are PLAIN DATA objects (no PixiJS — premise #3). Shape:
//   { id, type, dead, x, y, vx, vy, hp, maxHp, radius, ...typeSpecific }
//
// High-churn types (projectile, gem) are pooled: when reaped, the object is
// kept and reused on the next spawn instead of being garbage-collected
// (eng-review D5). Player and enemies are not pooled.

let nextId = 1;
const POOLED_TYPES = new Set(['projectile', 'gem']);

export function createWorld() {
  const entities = [];
  const pools = new Map(); // type -> array of dead entities ready for reuse

  function spawn(type, props) {
    let e;
    const pool = pools.get(type);
    if (pool && pool.length > 0) {
      e = pool.pop();
      // wipe recycled object — assigning undefined preserves the hidden class
      // (V8 deopts `delete e[k]` to dictionary mode on each loop iteration)
      for (const k in e) e[k] = undefined;
    } else {
      e = {};
    }
    e.id = nextId++;
    e.type = type;
    e.dead = false;
    Object.assign(e, props);
    entities.push(e);
    return e;
  }

  function kill(e) {
    e.dead = true;
  }

  // Drop dead entities; return pooled types to their pool. Swap-remove keeps
  // this O(n) — order is not preserved, which the systems do not rely on.
  function reap() {
    for (let i = entities.length - 1; i >= 0; i--) {
      const e = entities[i];
      if (!e.dead) continue;
      entities[i] = entities[entities.length - 1];
      entities.pop();
      if (POOLED_TYPES.has(e.type)) {
        let pool = pools.get(e.type);
        if (!pool) {
          pool = [];
          pools.set(e.type, pool);
        }
        pool.push(e);
      }
    }
  }

  function count(type) {
    let n = 0;
    for (let i = 0; i < entities.length; i++) if (entities[i].type === type) n++;
    return n;
  }

  // Wipe every non-player entity (enemies / projectiles / gems / drops / FX
  // markers) and return pooled types to their pool. Used at the start of a
  // new run so the prior run's world doesn't bleed into the fresh playthrough.
  // The player entity is created once at boot and is referenced everywhere
  // (movement / collision / renderer), so it survives the reset — main.js is
  // responsible for re-initializing its position + hp.
  function reset() {
    for (let i = 0; i < entities.length; i++) {
      if (entities[i].type !== 'player') entities[i].dead = true;
    }
    reap();
  }

  return { entities, spawn, kill, reap, count, reset };
}
