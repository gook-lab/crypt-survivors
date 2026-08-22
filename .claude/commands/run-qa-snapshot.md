---
description: Drive the game into a live run (dev server → ?debug=1 → menu clicks → optional __dbg teleport) and screenshot, without manually clicking through title/stage/hero/arcana each time.
---

# /run-qa-snapshot [stage] [hero-index] [teleport x,y]

Fast-track the repetitive "get into a playable run and screenshot it" loop. The
menu path (title → stage → hero → arcana → playing) is identical every time, and
`?debug=1` exposes `window.__dbg` for teleport/state probing. This bundles it.

Use it whenever you need to eyeball a render change in actual gameplay (floor
tiles, props, enemies, FX, HUD, the ESC map) instead of just a unit test.

## Steps

1. **Ensure dev server is up** (Vite auto-bumps the port). Check 7153 first:
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:7153/ || \
   curl -s -o /dev/null -w "%{http_code}" http://localhost:7154/
   ```
   If down (000), start it backgrounded and read the chosen port:
   ```bash
   npm run dev > /tmp/cs-dev.log 2>&1 &
   sleep 5 && grep -iE "Local:" /tmp/cs-dev.log
   ```

2. **Resolve the browse binary** (`$B`), then drive in **with `?debug=1`**:
   ```bash
   B="$HOME/.claude/skills/gstack/browse/dist/browse"
   $B goto "http://localhost:<PORT>/?debug=1"; sleep 2
   $B click "text=모험 시작"; sleep 0.8
   $B click "text=<stage 한글명>"; sleep 0.8   # 고대 던전 / 독무 늪지 / 용암 분지 / 서리 동굴 / 공허의 균열
   $B click ".cs-pick >> nth=<hero-index>"; sleep 0.8   # 0=기사(knight) default
   $B click ".arc-card >> nth=0"; sleep 1.5
   ```
   Default stage = 고대 던전, hero-index = 0. ice/void are Lv-gated (locked from
   a fresh save) — they won't be clickable unless `unlockedChapters` is raised.

3. **Confirm playing state** (collision/sim only runs when `state==='playing'`):
   ```bash
   $B js "typeof window.__dbg"   # must be 'object'
   $B js "window.__dbg.state"    # must be 'playing' (not 'levelup'/'paused')
   ```
   If a level-up modal popped, dismiss before testing collision/teleport:
   `$B click ".lvl-action >> nth=1"` (스킵).

4. **(Optional) teleport** to inspect a far spot (e.g. a zone nook). Use a
   headless probe to find a world coord first (see /probe pattern in
   structureField), then:
   ```bash
   $B js "window.__dbg.player.x=<X>; window.__dbg.player.y=<Y>; 'ok'"
   ```

5. **Screenshot** (use `--clip x,y,w,h` to zoom a region; `--viewport` for full):
   ```bash
   $B screenshot --viewport /tmp/qa.png
   $B console 2>&1 | grep -iE "error|uncaught|TypeError|404" | tail   # error scan
   ```
   Read the PNG to verify.

## Gotchas

- `?debug=1` is required for `window.__dbg` (gated in `main.js` startRun). Forget
  it → teleport/state probes return undefined.
- `state==='playing'` gate: a teleport while a modal is open looks like "nothing
  happened" because the sim is paused. Always check state first.
- The browse daemon can time out / the dev server can die mid-session — if every
  `$B` call times out, `curl` the port; restart `npm run dev` if 000 (note the
  new port).
- `performance.getEntriesByType` does NOT see `new Image()` PNG loads — verify
  asset loads via console `[atlas] missing sprite` warnings or `curl … -w %{http_code}`.
