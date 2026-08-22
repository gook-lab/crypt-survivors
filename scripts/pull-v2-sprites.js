// Pull the 7 newly-generated v2/legendary sprite candidates into
// pixellab_candidates/<concept>/ (16 frames each = 112 PNGs), then promote
// candidate #0 of each into the live projectiles_vs/<slug>/frame_000.png
// so PROJECTILES map immediately picks them up.
//
// User reviews via picker.html and can swap to a different candidate later
// by running this script with PROMOTE_INDEX overrides (or manually copying).

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OWNER_UUID = '9c338ce6-1b8f-4f3e-a302-31dde0bad543';

const JOBS = [
  { slug: 'meteor',              uuid: '79927697-3dcd-4cd7-b14d-8e28da5cc275', live: 'meteor' },
  { slug: 'ice_spear',           uuid: 'ddd3ac51-82f2-44c3-bd23-4f6f61cd011e', live: 'ice_spear' },
  { slug: 'bear_trap',           uuid: 'c73cebe3-73f7-4d39-8a51-744b6ec0c78f', live: 'bear_trap' },
  { slug: 'leg_frozen_throne',   uuid: 'bb9afc1d-5fa3-442b-a016-19df73fccdf5', live: 'leg_frozen_throne' },
  { slug: 'leg_galaxy_orb',      uuid: '2eb80079-18bb-4e42-8ce5-fd857f79749f', live: 'leg_galaxy_orb' },
  { slug: 'leg_seraph_wing',     uuid: 'a285d7d5-b69b-4bab-b2b9-8bf50d51c3c2', live: 'leg_seraph_wing' },
  { slug: 'leg_thunder_lord',    uuid: 'fcc02156-ca2c-4877-8cd5-f460dcd52226', live: 'leg_thunder_lord' },
];

function frameUrl(uuid, idx) {
  return `https://backblaze.pixellab.ai/file/pixellab-characters/objects/${OWNER_UUID}/${uuid}/rotations/frame_${idx}.png`;
}

async function download(targetPath, fromUrl) {
  const res = await fetch(fromUrl);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} ← ${fromUrl}`);
  const ab = await res.arrayBuffer();
  if (ab.byteLength === 0) throw new Error('empty body');
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, Buffer.from(ab));
  return ab.byteLength;
}

const start = Date.now();
let ok = 0, fail = 0, bytes = 0;

for (const job of JOBS) {
  const candidatesDir = path.join(ROOT, 'src/assets/pixellab_candidates', job.slug);
  const liveDir = path.join(ROOT, 'src/assets/projectiles_vs', job.live);

  // pull all 16 candidate frames into pixellab_candidates/
  const tasks = [];
  for (let i = 0; i < 16; i++) {
    const dest = path.join(candidatesDir, `${i.toString().padStart(2, '0')}.png`);
    tasks.push(
      download(dest, frameUrl(job.uuid, i))
        .then((n) => { ok += 1; bytes += n; })
        .catch((e) => { fail += 1; console.warn(`  ${job.slug}/${i}: ${e.message}`); }),
    );
  }
  await Promise.all(tasks);

  // promote frame 0 as the live texture (user can swap via picker later)
  const src0 = path.join(candidatesDir, '00.png');
  const dst0 = path.join(liveDir, 'frame_000.png');
  await fs.mkdir(liveDir, { recursive: true });
  try {
    await fs.copyFile(src0, dst0);
    console.log(`✓ ${job.slug.padEnd(22)} → projectiles_vs/${job.live}/  (frame 0 of 16 promoted)`);
  } catch (e) {
    console.warn(`✗ ${job.slug}: ${e.message}`);
  }
}

const sec = ((Date.now() - start) / 1000).toFixed(1);
console.log(`\nDONE in ${sec}s — ok=${ok}/${JOBS.length * 16}  fail=${fail}  bytes=${(bytes / 1024).toFixed(1)}KB`);
