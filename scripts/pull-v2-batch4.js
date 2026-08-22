// Pull batch 4 v2-weapon sprites — 8 priority class-themed visuals.
// Same shape as previous batches. inferno_bolt + plasma_orb hit rate
// limit on submission so they're added when retried via ENV.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OWNER_UUID = '9c338ce6-1b8f-4f3e-a302-31dde0bad543';
const POLL_DELAY_MS = 4000;
const POLL_LIMIT = 90;

const JOBS = [
  { slug: 'judgement_beam', uuid: '9649579f-c6ea-4057-9e37-994567ba7c84' },
  { slug: 'consecrate',     uuid: '6cd83d39-2687-4ee9-b73b-30918a84decc' },
  { slug: 'spike_burst',    uuid: 'f27040d2-8c33-4ef0-9cee-07c075db254b' },
  { slug: 'warcry_pulse',   uuid: '9d368efa-04f7-4bf6-9b05-22c3ec42ff98' },
  { slug: 'barbed_net',     uuid: '502e6aba-adbe-4a98-b23d-2b28b41165ba' },
  { slug: 'phantom_arrow',  uuid: '17bc8c57-8066-4d3a-bb3a-f1994be40079' },
];

if (process.env.INFERNO_UUID) JOBS.push({ slug: 'inferno_bolt', uuid: process.env.INFERNO_UUID });
if (process.env.PLASMA_UUID) JOBS.push({ slug: 'plasma_orb', uuid: process.env.PLASMA_UUID });

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
