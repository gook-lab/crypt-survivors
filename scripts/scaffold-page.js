#!/usr/bin/env node
// Scaffold a new UI page module — boilerplate for the createX(mount)
// pattern shared by all overlays (stats, spirits, history, etc.).
//
//   node scripts/scaffold-page.js <name> ["Korean page title"]
//
// Example:
//   node scripts/scaffold-page.js leaderboard "리더보드"
//
// Generates src/ui/<name>.js. Does NOT wire into title.js or main.js —
// use the /wire-title-page command (or do it manually) after this.

import { existsSync, writeFileSync } from 'fs';
import path from 'path';

const args = process.argv.slice(2);
if (args.length < 1) {
  console.error('usage: scaffold-page.js <name> ["Korean title"]');
  process.exit(1);
}
const name = args[0].toLowerCase();
const title = args[1] || name;
const createName = 'create' + name.charAt(0).toUpperCase() + name.slice(1);
const outPath = path.join('src/ui', name + '.js');

if (existsSync(outPath)) {
  console.error('refusing to overwrite ' + outPath);
  process.exit(1);
}

const template = `// ${title} page — read-only catalog overlay.
//
// Follows the .page → .page-panel → .page-head + .page-scroll structure
// shared by every catalog page (bestiary / arsenal / stats / …). ESC
// closes back to the title.

export function ${createName}(mount) {
  const el = document.createElement('div');
  el.className = 'page hidden';
  mount.appendChild(el);

  let closeCb = null;
  function close() {
    el.classList.add('hidden');
    if (closeCb) closeCb();
  }
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !el.classList.contains('hidden')) close();
  });

  function build() {
    el.innerHTML = \`
      <div class="page-panel">
        <div class="page-head">
          <h2 class="page-title">${title}</h2>
          <button class="page-close" id="${name}-close">닫기</button>
        </div>
        <div class="page-scroll" id="${name}-scroll">
          <!-- TODO: populate content here -->
        </div>
      </div>\`;
    el.querySelector('#${name}-close').addEventListener('click', close);
  }

  return {
    open(cb) {
      closeCb = cb;
      build(); // re-read on each open so updates surface
      el.classList.remove('hidden');
    },
  };
}
`;

writeFileSync(outPath, template);
console.log('scaffolded ' + outPath);
console.log('next: wire into title.js + main.js (use /wire-title-page ' + name + ')');
