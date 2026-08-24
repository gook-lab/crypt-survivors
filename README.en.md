# Crypt Survivors

[한국어](README.md) | **English**

A Vampire Survivors-style bullet-heaven roguelite in plain JavaScript (Node ≥18, no transpilation) + PixiJS v8 + Vite.

Move to kite the swarm; weapons fire automatically. Collect XP and level up to pick weapons, passives, and orbiting spirits. Max out a weapon to evolve it. Survive the rising difficulty, then spend gold in the forge to permanently upgrade your loadout and run it back.

> Sister project: `../dragon-game` (Dungeon Craft — a Dragon Quest-style turn-based JRPG).
> We share hero and asset data, but the architecture is completely different.

## Screenshot

<img src="docs/screenshots/01-title.png" width="600">

## Running

```bash
npm install
npm run dev      # dev server at http://localhost:7153/ (Vite auto-increments port if in use)
npm test         # 282 Vitest unit tests (required before commit)
npm run build    # production bundle → dist/
node scripts/balance.js [N]   # headless balance harness
```

Controls: **arrow keys / WASD** to move, **spacebar** for your hero's signature ultimate.
Weapons fire automatically.

### Balance Harness

`node scripts/balance.js [N]` — runs N seeds (default 5) × 10 minutes of deterministic kiting AI simulation.
It prints survival / early-death / median-survival / gold-per-run stats. For a reliable read, I run 24+ seeds.

## Project Structure

```
src/
  engine/     loop (FIXED_DT 1/60) · world (entity pool) · collision (uniform spatial hash, cell 48)
              renderer (only PixiJS consumer) · events (hit bus)
  systems/    per-tick stateless sim — movement · spawn (director + waves + mini-bosses)
              weaponFire · collision · damage · pickup · status
              spirits (orbiting companions) · minions (summon weapons) · skills (level-up unlocks)
              active (spacebar signature) · enemyAbilities (boss kits + telegraph)
              weaponSkyDropFx (per-weapon sky-drop AoE overlay)
  content/    pure data — weapons · passives · evolutions · metaUpgrades · characters
              bestiary · drops · loot · achievements · arcanas · spirits · rooms · maps
              status · signatures
  ui/         HTML/CSS overlays — title · charselect · mapselect · arcanaselect · hud
              levelup · evolution · result · shop · gacha · pausemenu · settings
              toast · achievements · arsenal · bestiary · status · stats · spirits · history
  util/       rng (seeded) · audio (ZzFX wrapper + BGM engine) · spriteAngles
              heroAssets / enemyAssets / weaponAssets / sigAssets / buffAssets
              structureAssets / tilesets (per-biome Wang tilesets)
  data/       save.js (localStorage, defensive validation) · settings.js
  assets/art/ sprite ASCII packs — palette, atlas builder, sprites.js,
              *_hd / *_hd2 / *_xhd / *_hd3 / smooth_walk variants, hd_promote.js (loads last)

main.js         bootstrap + state machine (title / mapselect / charselect / arcanaselect /
                playing / levelup / legendary / paused / shop / gameover)
loadout.js      per-run weapons · passives · spirits · meta · arcana + derived modifiers (recompute folds it all)
progression.js  piecewise quadratic XP curve (softCap 10)
choices.js      level-up roll + apply (weighted sampling without replacement)
achievements.js recordRun + checkAchievements (mid-run + end-of-run)
meta.js         forge upgrade application (COST_SCALE inflation included)
scripts/balance.js  headless balance harness
```

Content (weapons, passives, enemies, evolutions, shop upgrades) is all data. Adding new content means editing `content/` — not changing engine code. The extension checklist is in [CLAUDE.md](CLAUDE.md).

## Core Design

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for the full breakdown. In brief:

1. **Sim / render completely separated** — the simulation is pure data + pure functions and never imports PixiJS.
   The renderer is the only Pixi consumer. So the entire game runs headless in Node for balance tuning.
2. **Asset HD promotion** — `hd_promote.js` re-aliases base sprite keys to their best HD variants and loads **last**.
   Neither the renderer nor content code references HD keys directly.
3. **Self-contained world entities** — spirits and minions spawn into `world.entities` where the renderer and spatial hash see them,
   but other systems ignore them. They don't read or write loadout state.
4. **Data-driven enemy behavior** — spawn.js copies the `ability` and `movePattern` fields from bestiary rows onto entities.
   We don't write new system code for each enemy type.
5. **Telegraph windows** — bosses and ranged enemies don't fire instantly when their cooldown ends. They queue the cast and show a warning ring.
   Meanwhile, movement.js locks them in place.
6. **Defensive save migration** — old saves don't crash.

## Status

Fully playable and complete. The flow is: title → map/character/arcana selection → run loop → level-up choices → weapon evolution → difficulty scaling → result screen → forge loop.

- All 7 heroes have spacebar signature ultimates (meteor storm, holy beam, earth crack, arrow rain, tesla field, blade volley, rune barrage)
- PixelLab pixel-art pipeline — heroes with 4-dir idle/walk/attack, enemies/bosses, projectile animations, per-biome Wang tilesets, buff aura halos, structure props
- Forge = **global** upgrades (VS PowerUps model; 4 categories, no per-hero upgrades)
- Hell mode (NG+), arcanas, achievements, bestiary/arsenal, gacha, run history
- 282 unit tests

The design went through gstack `/office-hours` → `/plan-eng-review` → `/plan-design-review`.

## Documentation

| Document | Contents |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Architecture in depth |
| [CLAUDE.md](CLAUDE.md) | Development rules + content extension checklists + known gotchas (899 lines) |

## License

**Source-available — not open-source.** The code is publicly readable, but you don't have permission to use it.
To use it in another project, redistribute it, or commercialize it, you need written permission in advance.
Full terms: [LICENSE](LICENSE). Korean summary: [LICENSE.ko.md](LICENSE.ko.md).

Sound effects are [ZzFX](https://github.com/KilledByAPixel/ZzFX) (MIT); pixel art was generated with PixelLab.
Third-party components follow their own licenses.
