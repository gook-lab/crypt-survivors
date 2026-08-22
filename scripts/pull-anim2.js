// Pull animation frames for completed PixelLab animations.
// Hardcodes the (slug, object_uuid, anim_uuid) tuples extracted from
// get_object responses — each anim_uuid is unique per animate_object call.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OWNER_UUID = '9c338ce6-1b8f-4f3e-a302-31dde0bad543';

const JOBS = [
  {
    slug: 'leg_inferno_wall',
    object: '68f606e4-4c16-4772-a0ee-7473e762a8f4',
    anim:   '6f373ab7-dab8-4bf7-b567-f025f0f724d8',
  },
  {
    slug: 'consecrate',
    object: 'cb1794a2-445a-4ce2-a4e1-ff155f550de2',
    anim:   'ffbe315a-d99a-49e7-abc1-d613348fa735',
  },
];

function frameUrl(object, anim, idx) {
  return `https://backblaze.pixellab.ai/file/pixellab-characters/objects/${OWNER_UUID}/${object}/animations/${anim}/unknown/${idx}.png`;
}

async function downloadFrame(object, anim, idx, dest) {
  const res = await fetch(frameUrl(object, anim, idx));
  if (!res.ok) return false;
  const ab = await res.arrayBuffer();
  if (ab.byteLength === 0) return false;
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(ab));
  return true;
}

async function pullJob(job) {
  const liveDir = path.join(ROOT, 'src/assets/projectiles_vs', job.slug);
  // Wipe the single static frame_000 so we get a clean N-frame sequence.
  // (existing frame_000.png will be overwritten with the first anim frame.)
  let pulled = 0;
  for (let i = 0; i < 9; i++) {
    const dest = path.join(liveDir, `frame_00${i}.png`);
    if (await downloadFrame(job.object, job.anim, i, dest)) pulled += 1;
  }
  console.log(`✓ ${job.slug.padEnd(22)} ${pulled}/9 anim frames`);
}

const start = Date.now();
await Promise.all(JOBS.map(pullJob));
console.log(`\nDONE in ${((Date.now() - start) / 1000).toFixed(1)}s`);
