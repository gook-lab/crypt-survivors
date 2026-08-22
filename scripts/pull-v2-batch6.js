// Pull batch 6 — last 7 v2 + legendary sprites. Same shape as batch5.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OWNER_UUID = '9c338ce6-1b8f-4f3e-a302-31dde0bad543';
const POLL_DELAY_MS = 4000;
const POLL_LIMIT = 120;

const JOBS = [
  { slug: 'aegis_throw',        uuid: 'b6bb945f-0877-4493-aca3-1b9c8d4b3c0f' },
  { slug: 'chained_spear',      uuid: '63d8a46f-6d13-4dc6-a9c1-14ab7e9d416a' },
  { slug: 'silencer_dart',      uuid: 'dbb0c56a-e99e-45c4-806b-c5b73140c238' },
  { slug: 'hunters_blade',      uuid: 'f89fc734-1313-4355-aca1-3b21373cae70' },
  { slug: 'glacial_lance',      uuid: 'a174ae50-2f07-440c-b864-4879b7dd2443' },
  { slug: 'leg_inferno_wall',   uuid: '0f95d6d9-a522-4bf2-84c1-a62ea36af561' },
  { slug: 'leg_crimson_knives', uuid: 'b412f62f-eb5b-440b-bc70-81b87b965bb4' },
];

function frameUrl(uuid, idx) {
  return `https://backblaze.pixellab.ai/file/pixellab-characters/objects/${OWNER_UUID}/${uuid}/rotations/frame_${idx}.png`;
}

async function waitForFrame0(uuid) {
  for (let i = 0; i < POLL_LIMIT; i++) {
    const res = await fetch(frameUrl(uuid, 0), { method: 'HEAD' });
    if (res.ok) return true;
    await new Promise((r) => setTimeout(r, POLL_DELAY_MS));
  }
  return false;
}

async function downloadFrame(uuid, idx, dest) {
  const res = await fetch(frameUrl(uuid, idx));
  if (!res.ok) return false;
  const ab = await res.arrayBuffer();
  if (ab.byteLength === 0) return false;
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(ab));
  return true;
}

async function pullJob(job) {
  const candDir = path.join(ROOT, 'src/assets/pixellab_candidates', job.slug);
  const liveDir = path.join(ROOT, 'src/assets/projectiles_vs', job.slug);
  const ready = await waitForFrame0(job.uuid);
  if (!ready) { console.warn(`✗ ${job.slug}: timed out`); return; }
  let pulled = 0;
  const tasks = [];
  for (let i = 0; i < 16; i++) {
    const dest = path.join(candDir, `${i.toString().padStart(2, '0')}.png`);
    tasks.push(downloadFrame(job.uuid, i, dest).then((ok) => { if (ok) pulled += 1; }));
  }
  await Promise.all(tasks);
  const src0 = path.join(candDir, '00.png');
  const dst0 = path.join(liveDir, 'frame_000.png');
  await fs.mkdir(liveDir, { recursive: true });
  try {
    await fs.copyFile(src0, dst0);
    console.log(`✓ ${job.slug.padEnd(22)} ${pulled}/16 · promoted`);
  } catch (e) {
    console.warn(`✗ ${job.slug}: ${e.message}`);
  }
}

const start = Date.now();
await Promise.all(JOBS.map(pullJob));
console.log(`\nDONE in ${((Date.now() - start) / 1000).toFixed(1)}s · ${JOBS.length} jobs`);
