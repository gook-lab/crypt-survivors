---
description: Wire a new UI page into the title menu (6-step process across title.js + main.js)
---

# /wire-title-page <page-name> [button-label]

Adds a new page to the title menu. Automates the 6-step pattern that
shows up every time a new info / stats / catalog page is added.

## Arguments

- `page-name` — the page's exported create-function name (e.g., `Stats`,
  `Spirits`, `History`). The script will look for `src/ui/<lower>.js` →
  `createStats(mount)`.
- `button-label` — display string for the title menu button (default:
  page-name in Korean — let the user adjust if needed).

## Procedure

1. **Title button** — add to the `<button class="title-btn title-btn-sm"
   id="title-XXX">LABEL</button>` row in `src/ui/title.js` `el.innerHTML`.
   Place before "설정" so the new entry stays near the catalog group.
2. **Click handler** — append:
   ```js
   el.querySelector('#title-XXX').addEventListener('click', () => {
     if (cbs.xxx) cbs.xxx();
   });
   ```
3. **Callback exporter** — add `onXxx: (cb) => { cbs.xxx = cb; }` to the
   `return {...}` block in `title.js`.
4. **Import in main.js** — add `import { createXxx } from './ui/<lower>.js';`
   alongside the other UI page imports.
5. **Instantiate in main.js** — add `const xxxPage = createXxx(mount);`
   inside the UI page block.
6. **Wire in main.js** — add `title.onXxx(() => { title.hide();
   xxxPage.open(() => title.show()); });` next to the other
   `title.onYyy(...)` lines.

## Guard rails

- Page file (`src/ui/<lower>.js`) must already exist and export
  `createXxx(mount)` returning `{ open(cb) }`. If missing, run
  `/scaffold-page <lower>` first.
- Do not touch UI page file itself.
- Verify with `npm run build` after wiring.

## Output

A diff summary + build result.
