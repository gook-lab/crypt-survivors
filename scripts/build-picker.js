// Build a static asset picker page that lets the user browse all
// pixellab_candidates/<concept>/*.png variants, click favorites, and copy
// a PROMOTE-snippet for hd_promote.js.
//
// Usage:
//   node scripts/build-picker.js          → writes picker.html at project root
//   npm run dev                            → serve via Vite
//   open http://localhost:7153/picker.html → click favorites + copy snippet
//
// The picker is a single-file static page (~30KB). It does not import the
// project's bundle — it just renders <img> tags whose src points at
// /src/assets/pixellab_candidates/... which Vite serves during dev.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CANDIDATES_DIR = path.join(ROOT, 'src/assets/pixellab_candidates');
const OUT = path.join(ROOT, 'picker.html');

const concepts = (await fs.readdir(CANDIDATES_DIR, { withFileTypes: true }))
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();

const groups = {};
for (const concept of concepts) {
  const dir = path.join(CANDIDATES_DIR, concept);
  const files = (await fs.readdir(dir))
    .filter((f) => f.endsWith('.png'))
    .sort();
  groups[concept] = files;
}

const total = Object.values(groups).reduce((sum, f) => sum + f.length, 0);
console.log(`Indexed ${total} candidates across ${concepts.length} concepts.`);

const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8" />
<title>PixelLab candidates picker — Crypt Survivors</title>
<style>
  :root {
    --bg: oklch(15% 0 0);
    --surface: oklch(22% 0 0);
    --text: oklch(92% 0 0);
    --accent: oklch(72% 0.18 60);
    --selected: oklch(70% 0.22 140);
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; padding: 1.5rem;
    background: var(--bg);
    color: var(--text);
    font-family: ui-sans-serif, system-ui, sans-serif;
    image-rendering: pixelated;
  }
  h1 { font-size: 1.4rem; margin: 0 0 0.4rem; }
  .lead { color: oklch(72% 0 0); font-size: 0.92rem; line-height: 1.5; margin: 0 0 1.5rem; }
  .lead code { background: var(--surface); padding: 0.1rem 0.4rem; border-radius: 4px; }
  details { margin: 0 0 1rem; }
  summary {
    cursor: pointer;
    font-size: 1.1rem; font-weight: 600;
    padding: 0.5rem 0.8rem;
    background: var(--surface);
    border-radius: 6px;
    display: flex; align-items: center; gap: 0.6rem;
  }
  summary .count { color: oklch(60% 0 0); font-weight: 400; font-size: 0.85rem; margin-left: auto; }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 6px;
    padding: 0.8rem 0;
  }
  .cell {
    aspect-ratio: 1;
    background: var(--surface);
    border: 2px solid transparent;
    border-radius: 4px;
    padding: 4px;
    cursor: pointer;
    position: relative;
    transition: transform 0.1s, border-color 0.1s;
  }
  .cell:hover { transform: scale(1.06); border-color: var(--accent); }
  .cell img {
    width: 100%; height: 100%;
    object-fit: contain;
    display: block;
  }
  .cell.selected {
    border-color: var(--selected);
    background: oklch(35% 0.08 140);
  }
  .cell .badge {
    position: absolute;
    top: 2px; right: 4px;
    color: var(--selected);
    font-weight: 700;
    font-size: 0.7rem;
    text-shadow: 0 0 4px oklch(0% 0 0 / 0.8);
  }
  .toolbar {
    position: sticky; top: 0; z-index: 10;
    background: var(--bg);
    padding: 0.6rem 0;
    margin-bottom: 1rem;
    border-bottom: 1px solid oklch(30% 0 0);
    display: flex; gap: 0.5rem; flex-wrap: wrap;
  }
  button {
    background: var(--accent);
    color: oklch(15% 0 0);
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: 600;
    cursor: pointer;
  }
  button:hover { filter: brightness(1.1); }
  button.secondary { background: var(--surface); color: var(--text); }
  #status { color: oklch(72% 0 0); font-size: 0.9rem; align-self: center; }
  pre.snippet {
    background: oklch(10% 0 0);
    color: oklch(85% 0.05 140);
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 1rem 0 2rem;
  }
</style>
</head>
<body>
<h1>PixelLab candidates picker — Crypt Survivors</h1>
<p class="lead">
  Click a candidate to mark it as a favorite for that concept. Multiple
  favorites per concept are allowed. The <em>"Copy PROMOTE snippet"</em>
  button assembles a code block you can paste into
  <code>src/assets/art/hd_promote.js</code> to alias the project's base
  sprite key (e.g. <code>proj_arrow</code>) onto your chosen variant.
  Pixel art is rendered with <code>image-rendering: pixelated</code> so
  the visual matches in-game scale.
</p>

<div class="toolbar">
  <button onclick="emitSnippet()">Copy PROMOTE snippet</button>
  <button class="secondary" onclick="clearAll()">Clear selections</button>
  <span id="status">${total} candidates across ${concepts.length} concepts.</span>
</div>

<pre class="snippet" id="snippet" hidden></pre>

${concepts
  .map(
    (concept) => `<details open>
  <summary>${concept} <span class="count">${groups[concept].length}</span></summary>
  <div class="grid">
    ${groups[concept]
      .map((f) => {
        const uuid = f.replace(/\.png$/, '');
        const src = `/src/assets/pixellab_candidates/${concept}/${f}`;
        return `<div class="cell" data-concept="${concept}" data-uuid="${uuid}" onclick="toggle(this)">
        <img src="${src}" alt="${concept}/${uuid}" loading="lazy" />
        <span class="badge" hidden>★</span>
      </div>`;
      })
      .join('\n    ')}
  </div>
</details>`,
  )
  .join('\n')}

<script>
const STORAGE_KEY = 'pixellab-picker-selections';
const selections = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');

document.querySelectorAll('.cell').forEach((cell) => {
  const { concept, uuid } = cell.dataset;
  if (selections[concept] && selections[concept].includes(uuid)) {
    cell.classList.add('selected');
    cell.querySelector('.badge').hidden = false;
  }
});

function toggle(cell) {
  const { concept, uuid } = cell.dataset;
  selections[concept] = selections[concept] || [];
  const i = selections[concept].indexOf(uuid);
  if (i >= 0) {
    selections[concept].splice(i, 1);
    cell.classList.remove('selected');
    cell.querySelector('.badge').hidden = true;
  } else {
    selections[concept].push(uuid);
    cell.classList.add('selected');
    cell.querySelector('.badge').hidden = false;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
}

function clearAll() {
  for (const k of Object.keys(selections)) delete selections[k];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(selections));
  document.querySelectorAll('.cell.selected').forEach((c) => {
    c.classList.remove('selected');
    c.querySelector('.badge').hidden = true;
  });
  document.getElementById('snippet').hidden = true;
}

function emitSnippet() {
  // Map our concept slugs onto the project's base sprite keys.
  const CONCEPT_TO_KEY = {
    arrow:           'proj_arrow',
    knives:          'proj_knives',
    nova_orb:        'proj_nova',
    void_vortex:     'proj_void_sphere',
    divine_hammer:   'proj_divine_hammer',
    firewall:        'proj_firewall',
    holywater:       'proj_holywater',
    lightning:       'proj_lightning',
    chest_gold:      'pickup_chest_gold',
    potion_might:    'pickup_potion_might',
    xp_red:          'pickup_xp_red',
    fire_explosion:  'fx_explosion',
    sword_slash:     'fx_slash',
    starfield:       'fx_holywater_splash',
    wide_slash:      'fx_swing',
    level_up_sparkle:'fx_levelup',
  };
  const out = [];
  out.push('// Paste into src/assets/art/hd_promote.js PROMOTE map.');
  out.push('// The chosen candidate PNG also has to be copied into the live');
  out.push('// asset folder (src/assets/projectiles_vs / fx_vs / pickups_vs).');
  out.push('');
  for (const [concept, uuids] of Object.entries(selections)) {
    if (!uuids.length) continue;
    const key = CONCEPT_TO_KEY[concept] || concept;
    out.push(\`// \${concept} — \${uuids.length} pick\${uuids.length > 1 ? 's' : ''}: \${uuids.join(', ')}\`);
    out.push(\`// \${key}: 'CHOSEN_UUID_HD',  // alias in PROMOTE\`);
  }
  if (out.length === 3) out.push('// (no selections yet)');
  const pre = document.getElementById('snippet');
  pre.textContent = out.join('\\n');
  pre.hidden = false;
  navigator.clipboard?.writeText(pre.textContent).catch(() => {});
  document.getElementById('status').textContent = 'Snippet copied to clipboard';
}
</script>
</body>
</html>
`;

await fs.writeFile(OUT, html, 'utf8');
console.log(`Wrote ${OUT} (${(html.length / 1024).toFixed(1)} KB)`);
console.log(`Open http://localhost:7153/picker.html with \`npm run dev\` running.`);
