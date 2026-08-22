// Pull batch 3 v2-weapon sprites — 8 class-themed visuals. Polls each
// frame_0 URL until 200, then pulls remaining frames + promotes frame_0
// to live. Same shape as pull-v2-batch2.js but with the batch 3 UUIDs.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OWNER_UUID = '9c338ce6-1b8f-4f3e-a302-31dde0bad543';
const POLL_DELAY_MS = 4000;
const POLL_LIMIT = 90;

// UUIDs filled in by the spawn script; the elemental_burst one is set
// by the retry after rate-limit hit.
const JOBS = [
  { slug: 'holy_nova',       uuid: '526a260e-9b46-4f8d-9ba0-2309bfd72c94' },
  { slug: 'divine_rain',     uuid: '3c94607c-1e98-47d1-a4a6-6e98dc40e53a' },
  { slug: 'ember_ring',      uuid: 'd421e10b-70e5-4e5c-b6dc-5edf58c0c9b9' },
  { slug: 'whirlwind_blade', uuid: 'e413d4dd-309c-416b-8600-8d49e7a52aa5' },
  { slug: 'crusader_lance',  uuid: '817c09de-108b-46d5-817a-7536c48d2c8e' },
  { slug: 'berserker_axe',   uuid: '0a8ab354-99ab-4edf-8b53-d1afaaaf577a' },
  { slug: 'frost_nova',      uuid: '594b5cc8-e49d-46f4-b6f2-13c6c173c9d4' },
  // elemental_burst added programmatically — pass UUID via CLI arg or env
  // node scripts/pull-v2-batch3.js  → pulls 7 above
  // ELEMENTAL_UUID=<uuid> node ...  → adds elemental_burst job
];

const elementalUuid = process.env.ELEMENTAL_UUID;
if (elementalUuid) JOBS.push({ slug: 'elemental_burst', uuid: elementalUuid });

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
  if (!ready) {
    console.warn(`✗ ${job.slug}: timed out`);
    return;
  }
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
