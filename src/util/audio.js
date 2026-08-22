// Audio — ZzFX wrapper with a polyphony cap (eng-review T13).
//
// Bullet-heaven late game produces hundreds of hits per second; playing a
// sound per hit unthrottled tears the audio. Two limits guard against that:
// a per-sound minimum gap, and a hard cap on simultaneous voices.

import { zzfx, zzfxContext } from './zzfx.js';

// ZzFX synth parameter sets. Tuned by ear later; these are placeholders.
// boss_intro / boss_outro / mini_intro / mini_outro punctuate boss encounters
// so the player feels the threat arc (entrance → kill) without a full BGM
// track — minimal audio scope while still cueing the moment.
const SOUNDS = {
  hit: [0.5, 0.05, 360, 0, 0.01, 0.05, 1, 1.8, , , , , , 0.4],
  kill: [0.7, 0.08, 150, 0, 0.04, 0.13, 4, 1.2, , , , , , 0.7, , 0.1],
  levelup: [0.6, 0.05, 520, 0.02, 0.12, 0.2, 0, 1, , , 180, 0.05],
  // a low, ominous brass-like sweep — boss spawn
  boss_intro: [1.1, 0.1, 80, 0.05, 0.6, 0.9, 3, 0.4, , , , , 0.1, , , , 0.2, 0.6],
  // a heavy triumphant low-to-high chord — boss kill
  boss_outro: [1.4, 0.05, 200, 0.1, 0.5, 1.2, 2, 1.6, , , , , 0.3, 0.5, , 0.15, , 0.5, 0.1],
  // boss phase transition — a rising menacing growl (slide UP = escalation),
  // distinct from boss_intro's downward sweep. Fires when a boss crosses an
  // HP threshold (main.js render scan); strong + brief.
  boss_phase: [1.0, 0.07, 130, 0.04, 0.3, 0.55, 2, 0.6, 6, , , , , 0.35, , 0.25, , 0.55, 0.08],
  // smaller, faster cousin — mini-boss spawn
  mini_intro: [0.7, 0.08, 140, 0.03, 0.25, 0.4, 3, 0.6, , , , , , , , , , 0.4],
  // a single celebratory blip — mini-boss kill
  mini_outro: [0.8, 0.04, 380, 0.04, 0.18, 0.3, 1, 1.4, , , 110, 0.05, , 0.4],
  // low-HP heartbeat — a tight thump that pulses while the player is dying
  heartbeat: [0.7, 0.02, 80, 0.01, 0.1, 0.18, 1, 0.6, , , , , , , , , , 0.7],
  // player-hurt thump — a bassy, slightly detuned punch with a high-noise tail
  // so the impact reads as flesh+armor instead of just "the enemy hit me"
  hurt: [1.2, 0.06, 120, 0.02, 0.08, 0.22, 4, 1.4, -2, , , , , 0.6, , 0.2, , 0.5, 0.05],
  // ── Expansion enemy-ability SFX (2026-05-29) ──
  // kamikaze self-detonation — short heavy bass boom + noise tail
  kamikaze: [1.3, 0.05, 90, 0.01, 0.06, 0.3, 4, 1.5, , , , , , 0.8, , 0.4, , 0.4, 0.04],
  // summoner conjure — a low rising dark swell as adds appear
  enemy_summon: [0.6, 0.06, 170, 0.05, 0.22, 0.38, 2, 0.5, 8, , , , , 0.3, , 0.2, , 0.5, 0.06],
  // shielded barrier raise — a bright cyan shimmer (the "wait it out" cue)
  shield_up: [0.45, 0.04, 520, 0.04, 0.12, 0.2, 0, 1.6, , , 220, 0.06, , , , , 0.1, 0.5, 0.04],
  // Mage signature trio — meteor_storm cast flow.
  // charge: rising arcane shimmer when spacebar fires + telegraph appears
  meteor_charge: [0.6, 0.04, 240, 0.05, 0.35, 0.5, 0, 1.4, , , 480, 0.08, , , , , 0.1, 0.5, 0.08],
  // drop: low rumble as meteors leave the heavens (telegraph→falling boundary)
  meteor_drop: [0.9, 0.08, 90, 0.04, 0.3, 0.55, 4, 0.7, -3, , , , , 0.5, , 0.3, , 0.6, 0.1],
  // boom: heavy bass thump + sparkle on each impact (throttled to 1 per cast via active.js)
  meteor_boom: [1.3, 0.06, 70, 0.03, 0.15, 0.45, 2, 2.0, , , , , 0.2, 0.7, , 0.25, 0.05, 0.55, 0.05],

  // ── Per-hero signature SFX (cast + impact). All 7 heroes shared meteor_*
  // before, so every ultimate sounded identical. These are frequency/shape
  // variants of the proven meteor_charge / meteor_boom envelopes (a safe
  // pitch+timbre shift, not harsh new synthesis) themed to each hero. drop
  // stays shared (meteor_drop). Mage keeps the meteor_* baseline. Tune by ear.
  knight_cast: [0.6, 0.04, 523, 0.05, 0.35, 0.5, 0, 1.4, , , 480, 0.08, , , , , 0.1, 0.5, 0.08],
  knight_impact: [1.2, 0.06, 196, 0.03, 0.18, 0.5, 2, 1.6, , , , , 0.15, 0.3, , 0.2, 0.05, 0.55, 0.06],
  warrior_cast: [0.7, 0.05, 130, 0.06, 0.4, 0.6, 3, 0.8, , , 180, 0.1, , , , , 0.15, 0.5, 0.1],
  warrior_impact: [1.4, 0.07, 44, 0.03, 0.2, 0.6, 2, 2.0, , , , , 0.25, 0.85, , 0.3, 0.06, 0.6, 0.05],
  huntress_cast: [0.55, 0.05, 360, 0.02, 0.2, 0.3, 1, 1.4, , , 300, 0.05, , , , , 0.05, 0.4, 0.06],
  huntress_impact: [0.9, 0.06, 150, 0.01, 0.1, 0.3, 1, 1.6, -1, , , , , 0.5, , 0.2, , 0.4, 0.05],
  porta_cast: [0.55, 0.06, 620, 0.02, 0.18, 0.3, 1, 1.2, , , 400, 0.04, , , , , 0.05, 0.4, 0.05],
  porta_impact: [1.0, 0.08, 300, 0.01, 0.08, 0.35, 1, 1.4, -4, , , , 0.04, 0.6, , 0.3, , 0.4, 0.05],
  gennaro_cast: [0.55, 0.05, 300, 0.02, 0.2, 0.3, 1, 1.6, , , 260, 0.05, , 0.2, , , 0.05, 0.4, 0.06],
  gennaro_impact: [0.95, 0.06, 210, 0.01, 0.1, 0.3, 1, 1.8, , , , , 0.06, 0.4, , 0.25, , 0.4, 0.05],
  pasqualina_cast: [0.55, 0.04, 440, 0.04, 0.3, 0.45, 0, 1.4, , , 520, 0.07, , , 0.3, , 0.1, 0.5, 0.08],
  pasqualina_impact: [1.1, 0.06, 240, 0.02, 0.14, 0.45, 0, 1.8, , , , , 0.18, 0.4, 0.2, 0.2, 0.05, 0.55, 0.06],

  // ── Per-hero signature DROP cue (telegraph→fall boundary). Was shared
  // meteor_drop across all 6 non-mage heroes — the last "ultimates sound
  // identical" gap. Each is themed to the hero, in its cast/impact frequency
  // family. Mage keeps meteor_drop baseline. Tune by ear.
  knight_drop: [0.7, 0.05, 760, 0.02, 0.18, 0.5, 0, 1.2, -8, , , , , , , , 0.1, 0.5, 0.12],       // descending holy bell
  warrior_drop: [1.0, 0.1, 55, 0.05, 0.32, 0.6, 4, 0.6, -2, , , , , 0.7, , 0.35, , 0.65, 0.1],     // deep earth rumble
  huntress_drop: [0.55, 0.06, 520, 0.01, 0.1, 0.28, 1, 1.6, -6, , , , , 0.3, , 0.15, , 0.35, 0.06], // arrow whistle
  porta_drop: [0.55, 0.08, 580, 0.01, 0.12, 0.3, 2, 1.2, -5, , , , 0.03, 0.5, , 0.4, , 0.4, 0.05],  // electric crackle
  gennaro_drop: [0.55, 0.05, 440, 0.01, 0.12, 0.32, 1, 1.6, -4, , , , , 0.25, , 0.2, 0.04, 0.4, 0.06], // blade ring
  pasqualina_drop: [0.55, 0.05, 500, 0.04, 0.2, 0.4, 0, 1.4, , , -180, 0.08, , , 0.3, , 0.12, 0.5, 0.08], // arcane shimmer

  // ── Weapon fire archetypes — short, quiet blips so auto-fire has tactile
  // feedback (VS-style) without drowning the hit/kill layer. The one-at-a-time
  // fire rule + the 45ms per-name throttle keep these sane with 5 weapons
  // firing. weaponFire picks the key (fireSoundFor) and ships it on the 'fire'
  // event; main.js plays it. Per-weapon def.fireSfx overrides the archetype.
  fire_shot: [0.28, 0.05, 480, 0, 0.02, 0.08, 1, 1.8, , , , , , 0.2, , , , 0.3, 0.02],      // ranged pew / thwip
  fire_throw: [0.3, 0.08, 220, 0, 0.03, 0.1, 1, 1.2, -3, , , , , 0.4, , 0.1, , 0.3, 0.03],   // thrown whoosh
  fire_swing: [0.3, 0.1, 160, 0, 0.04, 0.12, 1, 1.0, -4, , , , , 0.5, , 0.15, , 0.3, 0.04],   // melee swish
  fire_cast: [0.26, 0.04, 320, 0.01, 0.05, 0.14, 0, 1.4, , , 120, 0.04, , , , , 0.05, 0.4, 0.05], // spell thrum
};

const MAX_VOICES = 16; // hard polyphony cap
const SAME_SOUND_GAP = 0.045; // s — minimum gap between identical sounds

export function createAudio() {
  let voices = 0;
  let enabled = true;
  let volume = 1; // master gain (0..1) — settings.js drives this via setVolume
  const lastAt = new Map();

  function play(name) {
    if (!enabled || volume <= 0) return;
    const params = SOUNDS[name];
    if (!params) return;
    const now = performance.now() / 1000;
    if (now - (lastAt.get(name) ?? -Infinity) < SAME_SOUND_GAP) return;
    if (voices >= MAX_VOICES) return;
    lastAt.set(name, now);
    // ZzFX param[0] is volume — scale it by the master so the slider works
    const scaled = params.slice();
    scaled[0] = (params[0] ?? 1) * volume;
    const src = zzfx(...scaled);
    if (src) {
      voices++;
      src.onended = () => {
        voices = Math.max(0, voices - 1);
      };
    }
  }

  // Browser autoplay policy: the AudioContext starts suspended until a user
  // gesture. Call this from the first keydown.
  function unlock() {
    try {
      const c = zzfxContext();
      if (c.state === 'suspended') c.resume();
    } catch {
      /* no audio available — silent is fine */
    }
  }

  // Minimal background-music engine — fires a short tonal "pulse" on a slow
  // interval so the playfield never feels silent. Mode 'ambient' uses a low
  // drone every 6s; 'boss' uses a denser, dissonant chord every 3s. Mode
  // 'off' clears the interval. Each pulse is gain-scaled by `volume` and
  // skipped entirely when audio is disabled or silenced.
  const MUSIC_TRACKS = {
    // ZzFX param sets — these stay quiet (param[0] ~0.25-0.35) so they sit
    // under the SFX layer rather than overpowering it.
    ambient: { params: [0.3, 0.05, 65, 0.4, 1.2, 1.4, 1, 0.3, , , , , , , , , 0.4, 0.7], every: 6000 },
    boss: { params: [0.45, 0.06, 130, 0.2, 0.8, 1.0, 3, 0.45, , , , , , 0.2, , 0.1, 0.3, 0.5], every: 3000 },
  };
  let musicMode = 'off';
  let musicTimer = null;
  function pulseMusic() {
    if (!enabled || volume <= 0) return;
    const t = MUSIC_TRACKS[musicMode];
    if (!t) return;
    const scaled = t.params.slice();
    scaled[0] = (t.params[0] ?? 0.3) * volume;
    try { zzfx(...scaled); } catch { /* audio context not ready, skip */ }
  }
  function setMusic(mode) {
    if (musicMode === mode) return;
    musicMode = mode;
    if (musicTimer) {
      clearInterval(musicTimer);
      musicTimer = null;
    }
    if (mode === 'off' || !MUSIC_TRACKS[mode]) return;
    pulseMusic(); // immediate first pulse so the mode change is felt
    musicTimer = setInterval(pulseMusic, MUSIC_TRACKS[mode].every);
  }

  return {
    play,
    unlock,
    setEnabled: (v) => {
      enabled = v;
    },
    setVolume: (v) => {
      volume = Math.max(0, Math.min(1, v));
    },
    setMusic,
  };
}
