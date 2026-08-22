// Active signature system — spacebar-fired character ultimate.
//
// State machine: idle -> telegraph (target rings appear) -> falling (meteors
// drop, AoE damage on landing, impact FX) -> idle (cooldown). All state is
// kept inside this module; the renderer queries it via getRenderState() for
// the draw pass. No other system reads/writes this state.
//
// The telegraph→fall→impact state machine itself lives in engine/skyDropFx.js
// so the same pipeline can power per-weapon AoE drops (see design doc at
// ~/.gstack/projects/game/kyb-ontact-unknown-design-20260521-081727.md).
// This module is now just: input handling + cooldown + sig resolution +
// target picking + damage application. Phase transitions are delegated.

import { signatureFor } from '../content/signatures.js';
import {
  createSkyDropState,
  resetSkyDropState,
  beginCast,
  tickSkyDrop,
} from '../engine/skyDropFx.js';

const SHAKE_MAGNITUDE = 10; // fed to renderer.addShake — clamps internally
const FALLBACK_RING_RADIUS = 100; // when no enemies, drops arc around player

// ── Signature level scaling ──────────────────────────────────────────────
// Signatures were fully static (same count/damage/radius/cooldown at Lv1 and
// Lv40), so the ultimate never grew while enemy HP scaled ~3.4× over a run —
// it felt weak and the AoE read as too small late-game. These dials scale the
// spacebar ultimate with player level (the power proxy already stamped on the
// player entity for enemy HP scaling). Driven by level, not damageMult, so the
// "clean burst, no crit/proc" design in applyAoE stays intact. The balance
// harness never fires signatures (autoPick can't cast), so this is a pure
// player-experience buff with no measured-balance regression — caps keep a
// maxed run's ultimate strong but not trivializing (no proc, spacebar-gated).
const SIG_RANGE_PER_LVL = 0.02;  // +2% AoE radius per level past 1
const SIG_RANGE_MAX = 0.85;      // cap +85% radius
const SIG_DMG_PER_LVL = 0.04;    // +4% damage per level past 1
const SIG_DMG_MAX = 1.5;         // cap +150% damage (keeps pace with enemy HP)
const SIG_CD_PER_LVL = 0.012;    // -1.2% cooldown per level past 1
const SIG_CD_MAX = 0.4;          // cap -40% cooldown (floor — never spammable)
const SIG_COUNT_PER_LVL = 1 / 8; // +1 projectile per 8 levels
const SIG_COUNT_MAX = 5;         // cap +5 projectiles

// Pure: returns level-scaled { count, damage, radius, cooldown } for a sig.
// count only grows for multi-projectile signatures (count > 1) — single
// self-centered casts like warrior earth_crack stay at one big quake (extra
// targets would stack identical overlapping AoEs into a multi-hit, not the
// intended single screen-clear). They still gain radius/damage/cooldown.
export function scaleSignature(sig, level) {
  const L = Math.max(0, (level || 1) - 1); // levels past 1
  const rangeMul = 1 + Math.min(SIG_RANGE_MAX, SIG_RANGE_PER_LVL * L);
  const dmgMul = 1 + Math.min(SIG_DMG_MAX, SIG_DMG_PER_LVL * L);
  const cdMul = 1 - Math.min(SIG_CD_MAX, SIG_CD_PER_LVL * L);
  const extra = sig.count > 1
    ? Math.min(SIG_COUNT_MAX, Math.floor(L * SIG_COUNT_PER_LVL))
    : 0;
  return {
    count: sig.count + extra,
    damage: sig.damage * dmgMul,
    radius: sig.radius * rangeMul,
    cooldown: sig.cooldown * cdMul,
  };
}

export function createActive() {
  // ---- mutable state, reset each run ----
  // skyDropFx fields (castPhase/telegraphTime/telegraphTotal/castTargets/drops)
  // live directly on `state` so the renderer's existing reads work unchanged.
  const state = createSkyDropState();
  state.cooldown = 0;
  state.sig = null;
  state.sigCharId = null;
  state.scaledRadius = 0; // level-scaled AoE radius, read by renderer.drawActive
  state.cdTotal = 0;      // level-scaled cooldown total, read by HUD radial

  function reset() {
    resetSkyDropState(state);
    state.cooldown = 0;
    state.sig = null;
    state.sigCharId = null;
    state.scaledRadius = 0;
    state.cdTotal = 0;
  }

  function resolveSignature(hero) {
    if (!hero) {
      state.sig = null;
      state.sigCharId = null;
      return null;
    }
    if (state.sigCharId === hero.id) return state.sig;
    state.sigCharId = hero.id;
    state.sig = signatureFor(hero.id);
    return state.sig;
  }

  // Pick N target positions from the enemy field. If empty, fall back to a
  // ring around the player so the cast still has visual feedback. The
  // `centerOnPlayer` flag (warrior earth_crack) forces all targets onto the
  // player — auto-aim is irrelevant when the spell is self-centered.
  function pickTargets(world, player, count, sig) {
    if (sig && sig.centerOnPlayer) {
      const targets = [];
      // scatterRadius: spread targets around the player (necromancer
      // undead_swarm). Without it, all N targets sit on top of each other
      // (warrior earth_crack uses this — count=1 + huge radius covers it).
      if (sig.scatterRadius) {
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2 + Math.random() * 0.6;
          const r = sig.scatterRadius * (0.4 + 0.6 * Math.random());
          targets.push({
            x: player.x + Math.cos(a) * r,
            y: player.y + Math.sin(a) * r,
          });
        }
      } else {
        for (let i = 0; i < count; i++) {
          targets.push({ x: player.x, y: player.y });
        }
      }
      return targets;
    }

    const ents = world.entities;
    const enemies = [];
    for (let i = 0; i < ents.length; i++) {
      const e = ents[i];
      if (e.type === 'enemy' && !e.dead) enemies.push(e);
    }

    if (enemies.length === 0) {
      // Fallback: star ring around the player. "Always casts" feels better
      // than "nothing happens because no enemies near".
      const targets = [];
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        targets.push({
          x: player.x + Math.cos(a) * FALLBACK_RING_RADIUS,
          y: player.y + Math.sin(a) * FALLBACK_RING_RADIUS,
        });
      }
      return targets;
    }

    // Stride-pick from the closest 4*count enemies so meteors spread across
    // the cluster instead of all stacking on the single nearest target.
    enemies.sort((a, b) => {
      const da = (a.x - player.x) ** 2 + (a.y - player.y) ** 2;
      const db = (b.x - player.x) ** 2 + (b.y - player.y) ** 2;
      return da - db;
    });
    const pool = enemies.slice(0, Math.min(enemies.length, count * 4));
    const targets = [];
    for (let i = 0; i < count; i++) {
      const e = pool[Math.floor((i * pool.length) / count) % pool.length];
      targets.push({ x: e.x, y: e.y });
    }
    return targets;
  }

  // Apply AoE damage at (cx,cy) within `radius` to all live enemies.
  // Reuses damage.apply so crit rolls + stats counters + 'hit' event all
  // happen consistently (renderer pops damage numbers, audio plays 'hit').
  function applyAoE(world, events, stats, damage, cx, cy, radius, amount) {
    const ents = world.entities;
    const rsq = radius * radius;
    for (let i = 0; i < ents.length; i++) {
      const e = ents[i];
      if (e.type !== 'enemy' || e.dead) continue;
      const dx = e.x - cx;
      const dy = e.y - cy;
      if (dx * dx + dy * dy > rsq) continue;
      const len = Math.hypot(dx, dy) || 1;
      const dirx = dx / len;
      const diry = dy / len;
      // No source → no crit roll, no on-hit proc. That's intentional: the
      // signature is a clean burst, not a weapon that procs ignite/freeze.
      damage.apply(world, events, stats, e, amount, dirx, diry, 0, null);
    }
  }

  function update(dt, world, player, loadout, input, events, stats, damage, audio, addShake) {
    const hero = loadout && loadout.hero;
    const sig = resolveSignature(hero);

    // Always tick cooldown (so cooldown progresses while paused-... actually
    // main.js gates the entire update loop on state==='playing', so paused
    // state never reaches us — cooldown stays where it is. That matches the
    // design doc Pass F "paused → telegraph timer paused" requirement.
    if (state.cooldown > 0) state.cooldown = Math.max(0, state.cooldown - dt);

    if (!sig) return; // hero has no signature

    // Level-scaled values for this frame. player.level is stamped by main.js /
    // balance.js for enemy HP scaling, so it's the natural power proxy.
    const s = scaleSignature(sig, (player && player.level) || 1);
    state.scaledRadius = s.radius; // renderer reads this for telegraph/impact size
    state.cdTotal = s.cooldown;    // HUD radial reads this for the swipe total

    // Player death cancels mid-cast cleanly — no orphan damage, no impacts.
    if (player && player.dead) {
      if (state.castPhase !== 'idle') {
        resetSkyDropState(state);
      }
      return;
    }

    // Drive the shared sky-drop pipeline. Per-impact damage + audio cue +
    // first-impact screen shake live in onImpact (the FX module is pure
    // visual timing).
    // Signature SFX are data-driven with a meteor_* fallback. All 7 heroes
    // shared the same meteor charge/drop/boom, so every ultimate sounded
    // identical — the loudest "heroes feel same" cue. A signature can now
    // declare castSfx / dropSfx / impactSfx in content/signatures.js to get
    // its own voice; absent fields keep the original sound (zero-risk).
    const result = tickSkyDrop(state, dt, {}, {
      onTelegraphEnd: () => {
        if (audio) audio.play(sig.dropSfx || 'meteor_drop');
      },
      onImpact: (drop, isFirst) => {
        applyAoE(world, events, stats, damage, drop.x, drop.y, s.radius, s.damage);
        if (isFirst) {
          if (audio) audio.play(sig.impactSfx || 'meteor_boom');
          if (addShake) addShake(SHAKE_MAGNITUDE);
        }
      },
    });
    if (result === 'resolved') {
      state.cooldown = s.cooldown;
    }

    // ---- Input: queue a new cast (idle + cooldown ready + spacebar pressed)
    if (
      state.castPhase === 'idle'
      && state.cooldown <= 0
      && input
      && input.justPressedSpace
    ) {
      const targets = pickTargets(world, player, s.count, sig);
      beginCast(state, { targets, telegraphTime: sig.telegraphTime });
      if (audio) audio.play(sig.castSfx || 'meteor_charge');
    }
  }

  function getRenderState() {
    return state;
  }

  // HUD-facing view: enough to draw the cooldown slot + key hint.
  function getHudInfo() {
    const sig = state.sig;
    if (!sig) return null;
    return {
      sigId: sig.id,
      sigName: sig.name,
      cooldown: state.cooldown,
      total: state.cdTotal || sig.cooldown,
      ready: state.cooldown <= 0,
      phase: state.castPhase, // 'idle' | 'telegraph' | 'falling'
    };
  }

  return { update, reset, getRenderState, getHudInfo };
}
