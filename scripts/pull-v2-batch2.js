// Pull the 8 priority v2-weapon sprites generated in the second PixelLab
// batch (solar_flare / dawnbreaker / anvil_drop / titans_grip / hawk_swarm /
// marksman_shot / chain_void / magma_burst). Polls each frame_0 URL until
// 200, then pulls remaining frames + promotes frame_0 to live.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OWNER_UUID = '9c338ce6-1b8f-4f3e-a302-31dde0bad543';
const POLL_DELAY_MS = 4000;
const POLL_LIMIT = 60; // 60 * 4s = 4 min max wait per job

const JOBS = [
  { slug: 'solar_flare',    uuid: 'cc44ee62-16ec-46e3-8a67-885846a857f8' },
  { slug: 'dawnbreaker',    uuid: '30422565-9d61-4c1d-8a1a-3b940ef690fc' },
  { slug: 'anvil_drop',     uuid: '7b923b8c-0aac-4bd0-a7eb-9ee075d0eb0f' },
  { slug: 'titans_grip',    uuid: '2ab67c37-d308-4dbd-9869-79f255c73ad9' },
  { slug: 'hawk_swarm',     uuid: '38489bf3-24af-4c50-a998-f4c3fcc6d47f' },
  { slug: 'marksman_shot',  uuid: '9f45c3a9-ab8d-4b9b-90ed-67d0fe450519' },
  { slug: 'chain_void',     uuid: '771c7467-3bce-4897-924f-5b1a3978ce42' },
  { slug: 'magma_burst',    uuid: '84db1126-91ac-479a-9256-751a9031717d' },
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
  if (!ready) {
    console.warn(`✗ ${job.slug}: timed out waiting for frame 0`);
    return;
  }

  let pulled = 0;
  const tasks = [];
  for (let i = 0; i < 16; i++) {
    const dest = path.join(candDir, `${i.toString().padStart(2, '0')}.png`);
    tasks.push(downloadFrame(job.uuid, i, dest).then((ok) => { if (ok) pulled += 1; }));
  }
  await Promise.all(tasks);

  // promote frame 0 to live
  const src0 = path.join(candDir, '00.png');
  const dst0 = path.join(liveDir, 'frame_000.png');
  await fs.mkdir(liveDir, { recursive: true });
  try {
    await fs.copyFile(src0, dst0);
    console.log(`✓ ${job.slug.padEnd(16)} ${pulled}/16 frames · live frame_000 promoted`);
  } catch (e) {
    console.warn(`✗ ${job.slug}: ${e.message}`);
  }
}

const start = Date.now();
await Promise.all(JOBS.map(pullJob));
console.log(`\nDONE in ${((Date.now() - start) / 1000).toFixed(1)}s`);
