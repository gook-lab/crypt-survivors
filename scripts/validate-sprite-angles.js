// Sprite-angle audit.
//
// Cross-references three sources of truth for projectile rotation:
//   1. src/util/spriteAngles.js          — registered offsets (-π/2, +π, etc.)
//   2. src/util/weaponAssets.js          — PixelLab PNG mappings
//   3. public/projectiles/**/*.png       — actual files on disk
//
// The audit flags four classes of issue:
//   ERROR    PNG referenced by weaponAssets but file missing on disk
//   WARN     weaponAssets entry has no spriteAngles entry → defaulted to 0
//            (intentional for east-pointing PNGs, but worth listing so the
//            convention stays visible)
//   INFO     spriteAngles entry present but PNG not yet verified (no
//            "verified" marker in the comment block)
//   OK       spriteAngles + weaponAssets + on-disk PNG all aligned
//
// The script cannot mechanically determine whether a PNG actually points UP
// vs DOWN — that requires a human looking at the frame. What it CAN do is
// produce a checklist a human can walk through with an image viewer.
//
//   node scripts/validate-sprite-angles.js
//
// Exit code: 0 if no ERRORs, 1 otherwise. WARN/INFO never fail the audit.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const PI = Math.PI;
const ANGLE_LABEL = new Map([
  [0, 'east (default)'],
  [-PI / 2, 'up'],
  [PI / 2, 'down'],
  [PI, 'west (180° flip)'],
]);

function describeAngle(rad) {
  for (const [val, label] of ANGLE_LABEL) {
    if (Math.abs(rad - val) < 1e-6) return label;
  }
  return `${rad.toFixed(4)} rad`;
}

async function loadModule(relPath) {
  const url = new URL(`../${relPath}`, import.meta.url).href;
  return import(url);
}

function relFromRoot(absPath) {
  return absPath.startsWith(ROOT) ? absPath.slice(ROOT.length + 1) : absPath;
}

async function main() {
  const { default: _ } = await import('../src/util/spriteAngles.js').catch(() => ({ default: null }));
  // spriteAngles.js has no default export; re-read source text to get the map.
  const anglesSrc = readFileSync(resolve(ROOT, 'src/util/spriteAngles.js'), 'utf8');
  const angleMap = new Map();
  // Match `key_name: <angle expression>,` lines inside SPRITE_BASE_ANGLES.
  const RX = /^\s*(proj_[a-z0-9_]+)\s*:\s*([^,]+),/gm;
  let m;
  while ((m = RX.exec(anglesSrc)) !== null) {
    const key = m[1];
    const expr = m[2].trim();
    let val;
    try { val = Function(`return (${expr})`)(); } catch { val = NaN; }
    angleMap.set(key, { expr, val });
  }

  const { WEAPON_ASSETS } = await loadModule('src/util/weaponAssets.js');

  const issues = { ERROR: [], WARN: [], INFO: [], OK: [] };

  for (const [spriteKey, entry] of Object.entries(WEAPON_ASSETS)) {
    const urls = typeof entry === 'string'
      ? [entry]
      : Array.isArray(entry.frames) ? entry.frames
      : entry.url ? [entry.url]
      : [];
    if (urls.length === 0) continue;

    const firstUrl = urls[0];
    const firstPath = resolve(ROOT, 'public' + firstUrl);
    const exists = existsSync(firstPath);

    const angle = angleMap.get(spriteKey);
    const hasAngle = angle !== undefined;

    if (!exists) {
      issues.ERROR.push({ key: spriteKey, msg: `PNG missing: ${relFromRoot(firstPath)}` });
      continue;
    }

    if (!hasAngle) {
      issues.WARN.push({
        key: spriteKey,
        msg: `no spriteAngles entry → assumed east (0). PNG: ${relFromRoot(firstPath)}`,
      });
      continue;
    }

    // Look for a "verified" marker in the source — convention: comment line
    // above the entry says "verified" or "PNG actually points: X — verified".
    const idx = anglesSrc.indexOf(`${spriteKey}:`);
    const before = anglesSrc.slice(Math.max(0, idx - 400), idx);
    const verified = /verified|PNG actually points/i.test(before);

    if (verified) {
      issues.OK.push({
        key: spriteKey,
        msg: `${describeAngle(angle.val)} — verified`,
      });
    } else {
      issues.INFO.push({
        key: spriteKey,
        msg: `${describeAngle(angle.val)} (assumed) — open ${relFromRoot(firstPath)} and confirm`,
      });
    }
  }

  // Output report grouped by severity.
  const order = ['ERROR', 'WARN', 'INFO', 'OK'];
  for (const sev of order) {
    const rows = issues[sev];
    if (!rows.length) continue;
    console.log(`\n=== ${sev} (${rows.length}) ===`);
    for (const r of rows) console.log(`  ${r.key.padEnd(34)} ${r.msg}`);
  }

  const summary = order.map((s) => `${s}=${issues[s].length}`).join('  ');
  console.log(`\n${summary}`);

  process.exit(issues.ERROR.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('audit failed:', err);
  process.exit(2);
});
