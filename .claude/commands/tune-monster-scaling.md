---
description: Sweep config difficulty/survivability dials (hpPerMinute, hpPerLevel, PLAYER.regen, PLAYER_BUBBLE) across values via sed-patch + deterministic balance harness, compare the early-death rate, and pick the value that fixes the target metric without trivializing the run.
---

# /tune-monster-scaling

Empirically tune the dials that govern early-game survival, using the
deterministic balance harness as the measurement instrument. Built from the
2026-05-29 early-death pass: swept `PLAYER.regen` × `PLAYER_BUBBLE` at 24
seeds, found `1.6/14` drops 4-min death rate 42%→13% without over-easing
(2.5/20 was too easy, median 8min).

## The dials

| dial | file | effect |
|---|---|---|
| `DIRECTOR.hpPerMinute` | config.js | enemy HP time-scale (the weak-build lever — levelScale floors at 1.0 below Lv33, so time dial dominates early) |
| `DIRECTOR.hpPerLevel` | config.js | enemy HP × player level (only bites Lv33+) |
| `PLAYER.regen` | config.js | innate HP/s regen floor — offsets swarm chip |
| `PLAYER_BUBBLE` | collision.js | player↔enemy separation px — stops the swarm pinning the player |
| `DIRECTOR.baseRate` / `ratePerMinute` | config.js | spawn density curve |

## Steps

1. Record the BASELINE: `node scripts/balance.js 24`, note `survived 10:00`,
   `died < 4:00`, `median survival`, `gold/run`.
2. Pick 1–2 dials and 2–3 candidate values each. Back up the file(s):
   `cp src/config.js /tmp/cfg.bak; cp src/systems/collision.js /tmp/col.bak`.
3. For each candidate, `sed -i ''` patch the value, run `node scripts/balance.js 24`,
   grep the summary line, record. Restore the backup BETWEEN candidates so each
   trial is isolated. Example loop:
   ```bash
   for v in 1.6 2.0 2.5; do
     sed -i '' "s/  regen: [0-9.]*,$/  regen: $v,/" src/config.js
     echo "### regen=$v ###"; node scripts/balance.js 24 | grep -E "survived 10:00|died < 4:00|median"
     cp /tmp/cfg.bak src/config.js
   done
   ```
4. Compare on the TARGET metric (usually `died < 4:00` for early-death; or
   `survived 10:00` for overall difficulty). Pick the value that hits the goal
   without over-shooting (e.g. survival should stay ~20–60%, median not ballooning).
5. Apply the chosen value, update the dial's CODE COMMENT with the sweep data,
   run `npm test -- --run` (a regen change breaks `loadout.test.js` regen
   assertions — update to `base + …`), and a final confirming 24-seed run.
6. Save/refresh the relevant memory if the mechanism is new.

## Hard caveats (read before trusting deltas)

- **Butterfly / shared rng**: the harness rng stream is shared across the whole
  sim, so changing a dial reshuffles ALL downstream randomness — two configs are
  different random universes. A MONOTONIC survivability buff (regen, bubble)
  trends reliably across seeds; a single DIFFICULTY dial (hpPerMinute) A/B does
  NOT — lowering it once even made early-death WORSE (42→71%) via reshuffle.
  Use 24+ seeds and read the AGGREGATE, never per-seed deltas. (memory:
  `balance-harness-nondeterministic`)
- **regen perturbs rng less than bubble** (bubble moves enemies → changes hit
  order → rng); prefer regen as the cleaner-to-measure lever.
- **Weak-build protection lever is hpPerMinute (time dial), NOT hpPerLevel** —
  levelScale floors at 1.0 for low-level builds (memory:
  `levelscale-floor-masks-hpperlevel`). But softening hpPerMinute widens the
  bipolar gap (strong builds cruise more); survivability buffs (regen/bubble)
  target the bottom without inflating the top — usually preferable.

## Relation to other commands

- `/tune-autopick` — sweeps the autoPick *weapon-new score* in balance.js (the
  harness AI's pick heuristic), not config dials. Run it after a slot-count
  change; run THIS after a spawn/HP/survivability change.
- `/validate-balance-harness` — diffs harness vs `main.js` system signatures;
  run it first if survival metrics look broken (silent degradation) rather than
  merely off-target.
