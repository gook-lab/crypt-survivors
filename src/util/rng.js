// Seeded pseudo-random number generator (eng-review CQ3).
// All game randomness routes through here so runs are reproducible — this is
// what makes deterministic tests and a future daily-seed mode possible.
//
// Algorithm: mulberry32 — tiny, fast, statistically fine for a game.

export function createRng(seed = Date.now() >>> 0) {
  let s = seed >>> 0;

  // Returns a float in [0, 1).
  function next() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  return {
    next,
    // Float in [min, max).
    range: (min, max) => min + next() * (max - min),
    // Integer in [min, max] inclusive.
    int: (min, max) => Math.floor(min + next() * (max - min + 1)),
    // Random element of an array.
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    seed: () => seed,
  };
}

// Named, independent RNG streams from one base seed. The balance harness routes
// each randomness CATEGORY to its own stream so a dial change in one category
// no longer reshuffles the others (the "butterfly caveat"): tweaking spawn
// difficulty stops perturbing weapon scatter and crit rolls, so single-dial A/B
// compares at a near-fixed scenario. Same base seed → identical streams.
//   spawn  — enemy spawning / director / elite rolls            (createSpawn)
//   combat — crit / proc / loot drops + level-up choice rolls   (createDamage, choices)
//   motion — weapon fan/scatter, movement bounce, signature scatter — the raw
//            Math.random hot paths, captured via the harness' global patch
// The salts are distinct constants (golden-ratio / xxhash primes) so the three
// streams decorrelate. Live game is untouched — only the harness uses this.
export function createRngStreams(seed = Date.now() >>> 0) {
  const s = (seed >>> 0) || 1;
  return {
    spawn: createRng(s),
    combat: createRng((s ^ 0x9e3779b9) >>> 0),
    motion: createRng((s ^ 0x85ebca6b) >>> 0),
  };
}
