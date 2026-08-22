// Pull batch 5 + retries — guardian_orbit, gladius_throw, piercing_arrow,
// salvo_shot, voltaic_ring, meat_cleaver + whirlwind_blade retry.
// Same poll+download+promote shape as earlier pull scripts.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OWNER_UUID = '9c338ce6-1b8f-4f3e-a302-31dde0bad543';
const POLL_DELAY_MS = 4000;
const POLL_LIMIT = 120; // bumped — some jobs stick at 90% for 5+ minutes

const JOBS = [
  { slug: 'guardian_orbit',  uuid: 'e4da50fc-8699-4732-b145-296bb87d0878' },
  { slug: 'gladius_throw',   uuid: '77324042-f033-44a1-a3b0-f8de922d9617' },
  { slug: 'piercing_arrow',  uuid: '5d5fd336-61f9-4fb8-b954-d787f43ac41b' },
  { slug: 'salvo_shot',      uuid: '39178dcb-5d14-4920-bcca-ad320469a66d' },
  { slug: 'voltaic_ring',    uuid: 'f29ccd80-7474-46f7-afb6-a9ff9e778c15' },
  { slug: 'meat_cleaver',    uuid: 'c28053b6-a6ce-41f8-82d6-bb86db67ac12' },
  // retry — fell out of batch 3 with timeout
  { slug: 'whirlwind_blade', uuid: 'e413d4dd-309c-416b-8600-8d49e7a52aa5' },
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
    console.log(`✓ ${job.slug.padEnd(18)} ${pulled}/16 · live frame_000 promoted`);
  } catch (e) {
    console.warn(`✗ ${job.slug}: ${e.message}`);
  }
}

const start = Date.now();
await Promise.all(JOBS.map(pullJob));
console.log(`\nDONE in ${((Date.now() - start) / 1000).toFixed(1)}s · ${JOBS.length} jobs`);
