// Diff scripts/balance.js vs src/main.js system factory and update call signatures.
// Surfaces arity drift that silently degrades the headless balance harness.
//
// Why: damage.js's apply() has guards like `if (source && rng && ...)` that
// short-circuit when args are missing — no error, but crits/procs/drops
// vanish. Unit tests share the broken usage so vitest can't catch it.
//
//   node scripts/lib/validate-harness.js
//
// Exit 0 = clean, 1 = drift detected.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO = resolve(dirname(__filename), '..', '..');

// Symbols intentionally absent from balance.js — visual/UI/audio-only systems
// that don't affect simulation outcomes. Add a symbol here to suppress a
// legitimate omission warning.
//
// CAUTION: do NOT add a system whose .update() reads/writes player state or
// world entities. spirits.update heals + shields (sim-affecting), minions.update
// summons attacking entities (sim-affecting), active.update is the spacebar
// ultimate damage source (sim-affecting). They were on this allowlist before
// 2026-05-21 and silently masked balance regressions.
const HARNESS_OMITS = new Set([
  'createSkills',          // level-up unlocks; balance.js does its own pick
  'createWeaponSkyDropFx', // visual sky-drop overlay (cosmetic)
  'createRenderer',
  'createLoop',
  'setMusic',
  // UI factories — balance.js is headless so HUD, modals, toasts are absent.
  'createHud',
  'createToast',
  'createLevelUp',
  'createEvolution',
  'createResult',
  'createGacha',
  'createPauseMenu',
  'createSettings',
  'createCharSelect',
  'createMapSelect',
  'createArcanaSelect',
  'createTitle',
  'createShop',
  'createAchievements',
  'createArsenal',
  'createBestiary',
  'createHistory',
  'createSpiritsPage',
  'createStats',
  'createStatusPage',
  'createLegendary',
]);

function extractCalls(source, varName) {
  // Match: const damage = createDamage(rng, loadout);
  // Capture symbol + args string. Allow whitespace + multiline.
  const re = new RegExp(
    `(?:const|let)\\s+(\\w+)\\s*=\\s*(create\\w+)\\s*\\(([^)]*)\\)`,
    'g',
  );
  const out = new Map(); // factory -> { argCount, varName }
  let m;
  while ((m = re.exec(source))) {
    const [, lhs, factory, args] = m;
    const argCount = args.trim() === '' ? 0 : args.split(',').length;
    out.set(factory, { argCount, varName: lhs, raw: args.trim() });
  }
  return out;
}

function extractUpdates(source) {
  // Match: damage.update(dt, world, player, ...)
  // Capture symbol + args. Multi-line ok via [^)]+.
  const re = /(\w+)\.update\s*\(([^)]*)\)/g;
  const out = new Map();
  let m;
  while ((m = re.exec(source))) {
    const [, varName, args] = m;
    const argCount = args.trim() === '' ? 0 : args.split(',').length;
    // Keep the higher arity if multiple call sites exist
    const existing = out.get(varName);
    if (!existing || existing.argCount < argCount) {
      out.set(varName, { argCount, raw: args.trim() });
    }
  }
  return out;
}

function loadFile(rel) {
  return readFileSync(resolve(REPO, rel), 'utf8');
}

function diff() {
  const mainSrc = loadFile('src/main.js');
  const balSrc = loadFile('scripts/balance.js');

  const mainFactories = extractCalls(mainSrc);
  const balFactories = extractCalls(balSrc);
  const mainUpdates = extractUpdates(mainSrc);
  const balUpdates = extractUpdates(balSrc);

  const issues = [];

  // Factory drift
  for (const [factory, mainCall] of mainFactories) {
    if (HARNESS_OMITS.has(factory)) continue;
    const balCall = balFactories.get(factory);
    if (!balCall) continue; // balance.js may legitimately omit (will be flagged below if mapped to a varName main.js uses in update path)
    if (balCall.argCount < mainCall.argCount) {
      issues.push({
        kind: 'factory-arity',
        symbol: factory,
        main: `${factory}(${mainCall.raw})`,
        bal: `${factory}(${balCall.raw})`,
        suggest: `const ${balCall.varName} = ${factory}(${mainCall.raw});`,
      });
    }
  }

  // Update drift — match by var name (damage.update vs damage.update)
  // Build varName -> factory map from main.js to know which system each var binds.
  const mainVarToFactory = new Map();
  for (const [factory, info] of mainFactories) mainVarToFactory.set(info.varName, factory);
  const balVarToFactory = new Map();
  for (const [factory, info] of balFactories) balVarToFactory.set(info.varName, factory);

  for (const [varName, mainUp] of mainUpdates) {
    const factory = mainVarToFactory.get(varName);
    if (factory && HARNESS_OMITS.has(factory)) continue;
    const balUp = balUpdates.get(varName);
    if (!balUp) {
      // main.js calls this update every tick but balance.js doesn't call it
      // at all. Silent mechanic deactivation — flag as a missing-update issue.
      issues.push({
        kind: 'missing-update',
        symbol: `${varName}.update`,
        main: `${varName}.update(${mainUp.raw})`,
        bal: '(not called)',
        suggest: `${varName}.update(${mainUp.raw}); // mirror main.js update loop`,
      });
      continue;
    }
    if (balUp.argCount < mainUp.argCount) {
      issues.push({
        kind: 'update-arity',
        symbol: `${varName}.update`,
        main: `${varName}.update(${mainUp.raw})`,
        bal: `${varName}.update(${balUp.raw})`,
        suggest: `${varName}.update(${mainUp.raw}); // match main.js arity`,
      });
    }
  }

  // setMap presence — if main.js calls X.setMap(...), balance.js should too (or
  // explicitly note the omission via HARNESS_OMITS).
  const setMapRe = /(\w+)\.setMap\s*\(/g;
  const mainSetMap = new Set();
  const balSetMap = new Set();
  let m;
  while ((m = setMapRe.exec(mainSrc))) mainSetMap.add(m[1]);
  setMapRe.lastIndex = 0;
  while ((m = setMapRe.exec(balSrc))) balSetMap.add(m[1]);
  for (const v of mainSetMap) {
    if (balSetMap.has(v)) continue;
    const factory = mainVarToFactory.get(v);
    if (factory && HARNESS_OMITS.has(factory)) continue;
    if (!balVarToFactory.has(v)) continue; // balance.js doesn't use this var anyway
    issues.push({
      kind: 'missing-setmap',
      symbol: `${v}.setMap`,
      main: `${v}.setMap(...)`,
      bal: '(not called)',
      suggest: `${v}.setMap(map); // mirror main.js — pass the active map object`,
    });
  }

  return issues;
}

function main() {
  const issues = diff();
  if (issues.length === 0) {
    console.log('✓ balance harness signatures match production. No drift detected.');
    process.exit(0);
  }
  console.log(`✗ ${issues.length} signature drift issue(s) found:\n`);
  console.log('| kind | symbol | main.js | balance.js | suggested fix |');
  console.log('|---|---|---|---|---|');
  for (const i of issues) {
    const fix = i.suggest.replace(/\|/g, '\\|');
    console.log(`| ${i.kind} | \`${i.symbol}\` | \`${i.main}\` | \`${i.bal}\` | \`${fix}\` |`);
  }
  console.log('\nFix balance.js to match main.js, then rerun this validator.');
  process.exit(1);
}

main();
