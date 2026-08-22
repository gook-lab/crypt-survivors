#!/usr/bin/env node
// CSS sanity check for src/ui/style.css — flags duplicate selectors and
// counts rules per component prefix. Pure read-only, no auto-fix.
//
//   node scripts/css-validate.js
//
// The stylesheet has grown past 2000 lines; this pass catches accidental
// overrides + suggests reorganisation when prefixes drift.

import { readFileSync } from 'fs';

const CSS = readFileSync('src/ui/style.css', 'utf-8');

// Strip block comments + trim trailing braces
const stripped = CSS.replace(/\/\*[\s\S]*?\*\//g, '');

// Match top-level rule headers (skip nested @rules + @media inner content)
// Conservative regex — selectors on their own line ending with `{`
const ruleRe = /(^|\n)\s*([^{}@\n][^{}\n]*?)\s*\{/g;

const seen = new Map(); // selector → array of 1-based line numbers
let dupes = 0;
const prefixCounts = new Map();

const lines = stripped.split('\n');
let inMedia = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // shallow @media tracking — count opens/closes
  const opens = (line.match(/@media[^{]*\{/g) || []).length;
  const closes = (line.match(/}/g) || []).length;
  inMedia += opens;
  // skip @media inner content for dup detection (media-scoped rules can
  // legitimately shadow base rules)
  if (inMedia > 0) {
    inMedia -= closes;
    if (inMedia < 0) inMedia = 0;
    continue;
  }
  inMedia -= closes;
  if (inMedia < 0) inMedia = 0;

  const m = line.match(/^\s*([^{}@][^{}]*?)\s*\{\s*$/);
  if (!m) continue;
  const sel = m[1].trim();
  if (!sel || sel.startsWith('@')) continue;
  if (seen.has(sel)) {
    seen.get(sel).push(i + 1);
  } else {
    seen.set(sel, [i + 1]);
  }
  // first prefix segment (.foo-bar → 'foo', .foo → 'foo')
  const first = sel.match(/\.([a-z][a-z0-9_-]*)/i);
  if (first) {
    const pref = first[1].split('-')[0];
    prefixCounts.set(pref, (prefixCounts.get(pref) || 0) + 1);
  }
}

console.log('css-validate: ' + lines.length + ' lines\n');

const sortedDupes = [...seen.entries()]
  .filter(([, ls]) => ls.length > 1)
  .sort((a, b) => b[1].length - a[1].length);
if (sortedDupes.length === 0) {
  console.log('✓ no duplicate selectors detected\n');
} else {
  console.log('! duplicate selectors (review for accidental shadowing):');
  for (const [sel, ls] of sortedDupes.slice(0, 20)) {
    console.log('  ' + sel + '  →  lines ' + ls.join(', '));
    dupes += ls.length - 1;
  }
  if (sortedDupes.length > 20) console.log('  …and ' + (sortedDupes.length - 20) + ' more');
  console.log('');
}

const sortedPrefixes = [...prefixCounts.entries()].sort((a, b) => b[1] - a[1]);
console.log('prefix breakdown (top 15):');
for (const [pref, n] of sortedPrefixes.slice(0, 15)) {
  console.log('  .' + pref.padEnd(16) + n + ' rules');
}

if (lines.length > 2500) {
  console.log('\n! style.css is ' + lines.length + ' lines — consider splitting per-component');
}

process.exit(dupes > 0 ? 0 : 0); // informational only
