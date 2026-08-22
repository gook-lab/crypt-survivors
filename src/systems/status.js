// Status-effect system — ticks afflictions on enemies.
//
// An enemy gains a status from a weapon's on-hit proc (damage.js calls
// applyStatus). Each enemy carries two parallel maps:
//   enemy.status[type]       — seconds the status has left (the timer)
//   enemy.statusStacks[type] — how many stacks are on it (scales DoT)
//
// This system counts the timers down and applies effects:
//   burn / bleed / poison / shock — damage over time, routed through
//     damage.apply so a status kill still drops loot and fires hit/kill events
//   freeze / stun                 — the enemy cannot move (speedMult 0)
//   shock                         — slowed (speedMult 0.5)
//   slow                          — slowed, deeper per stack
//
// SYNERGIES fire while two statuses overlap (see content/status.js):
//   burn+bleed  출혈 폭발 — burn DoT ×3
//   poison+slow 시드는 저주 — poison DoT ×2
//   stun+bleed  절단 — bleed DoT ×1.5
//   burn+poison 독연기 — poison spreads to nearby enemies each tick

import { STATUS } from '../content/status.js';

const DOT_INTERVAL = 0.5; // seconds between damage-over-time ticks
const CONTAGION_RANGE = 48; // px the 독연기 synergy spreads poison

// raw fresh-application durations, kept as a named export for callers/tests
export const STATUS_DURATION = Object.fromEntries(
  Object.keys(STATUS).map((k) => [k, STATUS[k].duration]),
);

// An enemy archetype ignores a status when it makes no sense for it: bosses
// shrug off hard crowd-control, and elemental/bloodless foes resist by type.
export function isImmune(target, stype) {
  if (target.boss && (stype === 'freeze' || stype === 'stun')) return true;
  const id = String(target.sprite || target.enemyType || '');
  if (stype === 'bleed' && /skelet|wraith|wisp|spirit|bone/.test(id)) return true;
  if (stype === 'burn' && /fire|lava|magma|imp|drake/.test(id)) return true;
  if ((stype === 'freeze' || stype === 'slow') && /frost|ice|yeti/.test(id)) return true;
  return false;
}

// Apply a status to an enemy: refresh its timer, add a stack (up to maxStacks),
// and cleanse any status whose element the new one counters (fire melts ice…).
export function applyStatus(target, stype) {
  const def = STATUS[stype];
  if (!def || isImmune(target, stype)) return;
  target.status = target.status || {};
  target.statusStacks = target.statusStacks || {};
  for (const other in target.status) {
    const od = STATUS[other];
    if (target.status[other] > 0 && od && od.cleansedBy.includes(def.element)) {
      target.status[other] = 0;
      target.statusStacks[other] = 0;
    }
  }
  target.status[stype] = Math.max(target.status[stype] || 0, def.duration);
  target.statusStacks[stype] = Math.min(
    def.maxStacks,
    (target.statusStacks[stype] || 0) + 1,
  );
}

export function createStatus() {
  // 독연기: a burning + poisoned enemy seeds poison into nearby foes each tick
  function spreadPoison(world, src) {
    const ents = world.entities;
    for (let i = 0; i < ents.length; i++) {
      const o = ents[i];
      if (o === src || o.type !== 'enemy' || o.dead) continue;
      const dx = o.x - src.x;
      const dy = o.y - src.y;
      if (dx * dx + dy * dy <= CONTAGION_RANGE * CONTAGION_RANGE) {
        applyStatus(o, 'poison');
      }
    }
  }

  function update(dt, world, events, stats, damage) {
    const ents = world.entities;
    for (let i = 0; i < ents.length; i++) {
      const e = ents[i];
      if (e.type !== 'enemy' || e.dead || !e.status) continue;
      const st = e.status;
      const stk = e.statusStacks || (e.statusStacks = {});

      // count every active timer down; a lapsed status drops its stacks too
      for (const key in STATUS) {
        if (st[key] > 0) {
          st[key] -= dt;
          if (st[key] <= 0) {
            st[key] = 0;
            stk[key] = 0;
          }
        }
      }

      // synergy multipliers — both partners must be active right now
      let burnMult = 1;
      let poisonMult = 1;
      let bleedMult = 1;
      let spread = false;
      if (st.burn > 0 && st.bleed > 0) burnMult = 3; // 출혈 폭발
      if (st.poison > 0 && st.slow > 0) poisonMult = 2; // 시드는 저주
      if (st.stun > 0 && st.bleed > 0) bleedMult = 1.5; // 절단
      if (st.burn > 0 && st.poison > 0) spread = true; // 독연기

      // damage over time — every active DoT, scaled by stack count + synergy
      let dot = 0;
      if (st.burn > 0) dot += STATUS.burn.tickDamage * (stk.burn || 1) * burnMult;
      if (st.bleed > 0) dot += STATUS.bleed.tickDamage * (stk.bleed || 1) * bleedMult;
      if (st.poison > 0) dot += STATUS.poison.tickDamage * (stk.poison || 1) * poisonMult;
      if (st.shock > 0) dot += STATUS.shock.tickDamage;
      if (dot > 0) {
        st.dotTick = (st.dotTick ?? 0) - dt;
        if (st.dotTick <= 0) {
          damage.apply(world, events, stats, e, dot, 0, 0, 0);
          st.dotTick = DOT_INTERVAL;
          if (spread && !e.dead) spreadPoison(world, e);
        }
      }

      // movement modifier — freeze/stun halt, shock slows, slow deepens/stack
      if (st.freeze > 0 || st.stun > 0) e.speedMult = 0;
      else if (st.shock > 0) e.speedMult = 0.5;
      else if (st.slow > 0) e.speedMult = Math.max(0.4, 1 - 0.25 * (stk.slow || 1));
      else e.speedMult = 1;
    }
  }

  return { update };
}
