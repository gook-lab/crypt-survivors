// PixelLab character sprite registry (heroes only).
//
// Each hero key (matching sprite names in the codebase: mage_walk,
// knight_walk, warrior_walk, huntress_walk) holds per-direction
// sprite data. Each direction has:
//   - idle:   URL of the static pose (used when stationary)
//   - walk:   array of 8 walking-cycle PNGs (used while moving)
//   - attack: array of N attack-cycle PNGs (used when player is firing)
//   - fps:    walking cycle playback rate
//   - attackFps: attack cycle playback rate (separate — punches are faster)
//
// Renderer's pickHeroFrame(name, dir, elapsed, moving, attacking) resolves
// to the right URL; the PNG cache loads it. When the URL isn't loaded yet,
// the renderer falls back to ASCII art with no flash.
//
// Source assets:
//   public/heroes/<hero>_<dir>.png                — static rotation (idle)
//   public/heroes/anim/<hero>_<dir>_<0..7>.png    — 8 walking frames
//   public/heroes/atk/<hero>_<dir>_<0..N>.png     — N attack frames

const buildWalk = (hero, dir) =>
  [0, 1, 2, 3, 4, 5, 6, 7].map((i) => `/heroes/anim/${hero}_${dir}_${i}.png`);

const buildAttack = (hero, dir, frameCount = 8) =>
  Array.from({ length: frameCount }, (_, i) => `/heroes/atk/${hero}_${dir}_${i}.png`);

const heroDir = (hero, dir, attackFrames) => ({
  idle: `/heroes/${hero}_${dir}.png`,
  walk: buildWalk(hero, dir),
  attack: attackFrames ? buildAttack(hero, dir, attackFrames) : null,
  fps: 10,
  attackFps: 14, // punches read crisper at a slightly higher rate
});

// Attack frame counts vary per template animation:
// fireball=6, cross-punch=6, surprise-uppercut=7, throw-object=7.
export const HERO_ASSETS = {
  mage_walk: {
    east: heroDir('mage', 'east', 6), // fireball
    west: heroDir('mage', 'west', 6),
  },
  knight_walk: {
    east: heroDir('knight', 'east', 3), // lead-jab (sword thrust)
    west: heroDir('knight', 'west', 3),
  },
  warrior_walk: {
    east: heroDir('warrior', 'east', 7), // surprise-uppercut
    west: heroDir('warrior', 'west', 7),
  },
  huntress_walk: {
    east: heroDir('huntress', 'east', 7), // throw-object
    west: heroDir('huntress', 'west', 7),
  },
  porta_walk: {
    east: heroDir('porta', 'east', 6), // fireball template
    west: heroDir('porta', 'west', 6),
  },
  gennaro_walk: {
    east: heroDir('gennaro', 'east', 7), // throw-object template
    west: heroDir('gennaro', 'west', 7),
  },
  pasqualina_walk: {
    east: heroDir('pasqualina', 'east', 6), // fireball template
    west: heroDir('pasqualina', 'west', 6),
  },
};

// Resolve a hero sprite name + direction + state to a PNG URL.
// State priority: attacking > moving > idle. Attack frames cycle by
// elapsed * attackFps; walk by elapsed * fps; idle is the static pose.
// Returns null when the hero isn't registered.
export function heroAssetUrl(name, dir, elapsed = 0, moving = false, attacking = false) {
  const set = HERO_ASSETS[name];
  if (!set) return null;
  const d = set[dir] || set.east; // fall back to east if a direction is missing
  if (!d) return null;
  if (attacking && d.attack && d.attack.length) {
    const idx = Math.floor(elapsed * (d.attackFps || 14)) % d.attack.length;
    return d.attack[idx];
  }
  if (!moving) return d.idle;
  if (!d.walk || d.walk.length === 0) return d.idle;
  const idx = Math.floor(elapsed * (d.fps || 10)) % d.walk.length;
  return d.walk[idx];
}
