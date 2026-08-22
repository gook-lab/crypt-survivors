// Pull the 32 newly-promoted PixelLab assets (16 legendary-collection
// variants + 16 wand/staff variants) into pixellab_candidates/ so the
// picker.html tool can display + select them. Same CDN URL pattern as
// pull-pixellab-batch.js.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DEST_BASE = path.join(ROOT, 'src/assets/pixellab_candidates');
const OWNER_UUID = '9c338ce6-1b8f-4f3e-a302-31dde0bad543';
const CONCURRENCY = 12;

// "전설의 무기모음집 검, 창, 활, 지팡이, …" — 16 candidates.
// Each is a different stylistic interpretation of the prompt — the picker
// renders them in a grid so you can choose which becomes the live PROMOTE
// alias for each legendary weapon (proj_leg_blade, proj_leg_spear, etc.).
const LEGENDARY_PACK = [
  '1fc9f82a-d730-418b-9cb7-714f30ef0587',
  '60a4e8f4-972f-4ff2-ad05-05693d94b14c',
  '461f0cf4-eb3e-4615-8060-a632278bf4bd',
  '48410d11-f175-4111-8c97-3f2489fbc8b5',
  'ad53fe31-3780-420d-a1b9-8edc257a961a',
  '8178fc12-778a-475a-ab78-9991c7414a7e',
  'c6ff43f4-8606-4772-9e99-17ec8ea4bafb',
  'f92ae0ec-f18a-4ec4-af99-f7c539b88d9b',
  '6604b1bf-bcf9-42b6-90af-2b2af316d7de',
  '4715380d-a16c-4928-b5ec-085cec01bae0',
  'a234eebc-2c04-41a3-b8fb-487ec0ef4df5',
  '119c66bc-08d0-443f-8dc2-15a7759c6852',
  '5ec6cd78-b854-4fad-8092-fa9d227fc24b',
  'f83ef37a-c890-4ca4-9efa-99d349c0943a',
  '32ecadb6-a5d3-452b-a9aa-695a79700614',
  'c216531d-785b-45c3-97d7-4f2e02710673',
];

// "마법 지팡이, 완드" — 16 candidates for mage wand / staff visuals.
// Best fits the existing proj_wand alias and the new mage exclusive
// astral_staff. Multiple picks can power leg_crystal_shard / leg_galaxy_orb
// etc. via PROMOTE.
const WAND_ROD = [
  'baf12a76-5653-411f-b3c5-b48af3038cd4',
  'f5425116-c587-4366-b527-45c63eda7ae8',
  '015c5fc5-305c-4232-a634-6da71c06da7f',
  'd110b13f-86d5-4c95-bd84-895c3f8d83cf',
  'a5af30d8-7f57-42cf-a75f-105c4abe86d7',
  '553c4225-3574-4949-9ab1-54a56e6985f9',
  '9c2c9c12-2dac-4e3a-8352-fee8e292dd46',
  '952728e8-9deb-43d5-9113-a46a878a5da2',
  'ea06bde9-5c9a-4899-96f4-025ff7152169',
  'b71cc73d-042f-4ec2-a809-fd5ab0512c7c',
  '36e54c6c-d964-4f59-a4c2-938a9d95d038',
  '16b3caea-baff-42ea-81a6-a3f54050b10b',
  'af9c968b-435e-4c1b-bb7c-884e28ab7b80',
  '15aefa10-5d0c-4096-8be7-ece5a80060cc',
  '0b518849-3c53-4b0c-9685-dc6f9ed7536f',
  '8b0d9469-7eb6-4322-b017-5dbe898d2249',
];

const TARGETS = [
  ...LEGENDARY_PACK.map((u) => ['legendary_pack', u]),
  ...WAND_ROD.map((u) => ['wand_rod', u]),
];

function url(uuid) {
  return `https://backblaze.pixellab.ai/file/pixellab-characters/objects/${OWNER_UUID}/${uuid}/rotations/unknown.png`;
}

function dest(concept, uuid) {
  return path.join(DEST_BASE, concept, `${uuid.slice(0, 8)}.png`);
}

async function downloadOne(concept, uuid) {
  const u = url(uuid);
  const d = dest(concept, uuid);
  await fs.mkdir(path.dirname(d), { recursive: true });
  const res = await fetch(u);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} ← ${u}`);
  const ab = await res.arrayBuffer();
  if (ab.byteLength === 0) throw new Error('empty body');
  await fs.writeFile(d, Buffer.from(ab));
  return ab.byteLength;
}

async function runWithConcurrency(items, n, worker) {
  const r = { ok: 0, fail: 0, bytes: 0, errors: [] };
  let i = 0;
  async function next() {
    while (true) {
      const k = i++;
      if (k >= items.length) return;
      const [c, u] = items[k];
      try {
        r.bytes += await worker(c, u);
        r.ok += 1;
      } catch (e) {
        r.fail += 1;
        r.errors.push(`${c}/${u.slice(0, 8)}: ${e.message}`);
      }
    }
  }
  await Promise.all(Array.from({ length: n }, next));
  return r;
}

const start = Date.now();
console.log(`Pull: ${TARGETS.length} new candidates (legendary_pack 16 + wand_rod 16)`);
const r = await runWithConcurrency(TARGETS, CONCURRENCY, downloadOne);
const sec = ((Date.now() - start) / 1000).toFixed(1);
console.log(`DONE in ${sec}s — ok=${r.ok}  fail=${r.fail}  bytes=${(r.bytes / 1024).toFixed(1)}KB`);
if (r.errors.length) {
  for (const e of r.errors) console.log('  ' + e);
}
