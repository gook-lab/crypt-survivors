#!/usr/bin/env node
// Bundled iteration loop: vitest + build + browser screenshot.
//
// The most-repeated iteration unit during a feature session is
//   npm test -- --run && npm run build && $B goto + screenshot
// This script wraps it in a single command. Usage:
//
//   node scripts/dev-screenshot.js                # default: title page
//   node scripts/dev-screenshot.js /path/X        # navigate to /X first
//   node scripts/dev-screenshot.js -o /tmp/x.png  # custom output
//
// Requires a running dev server (npm run dev) and the gstack browse
// binary at ~/.claude/skills/gstack/browse/dist/browse.

import { execSync, spawnSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';
import os from 'os';

const args = process.argv.slice(2);
let nav = '';
let out = '/tmp/dev-screenshot.png';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '-o') { out = args[++i]; continue; }
  if (args[i].startsWith('/')) { nav = args[i]; continue; }
}

const BROWSE = path.join(os.homedir(), '.claude/skills/gstack/browse/dist/browse');
if (!existsSync(BROWSE)) {
  console.error('[dev-screenshot] browse binary not found at ' + BROWSE);
  console.error('  install gstack first.');
  process.exit(1);
}

function step(label, cmd) {
  console.log('\n→ ' + label);
  const r = spawnSync('sh', ['-c', cmd], { stdio: 'inherit' });
  if (r.status !== 0) {
    console.error('[dev-screenshot] failed at: ' + label);
    process.exit(r.status || 1);
  }
}

step('vitest', 'npm test -- --run 2>&1 | tail -6');
step('build', 'npm run build 2>&1 | tail -3');

// Probe the dev port — vite auto-bumps if 7153 is taken
function probePort(port) {
  try {
    const r = spawnSync('curl', ['-sf', '-o', '/dev/null', '-w', '%{http_code}',
      'http://localhost:' + port + '/'], { encoding: 'utf-8' });
    return r.stdout && r.stdout.trim() === '200';
  } catch { return false; }
}
let port = 7153;
while (port < 7160 && !probePort(port)) port++;
if (port >= 7160) {
  console.error('[dev-screenshot] no dev server detected on 7153-7159; start with `npm run dev`.');
  process.exit(1);
}

const url = 'http://localhost:' + port + (nav || '/');
step('navigate', `"${BROWSE}" goto ${url}`);
step('sleep', 'sleep 2');
step('screenshot', `"${BROWSE}" screenshot ${out}`);

console.log('\n[dev-screenshot] ' + out + ' (port ' + port + ')');
