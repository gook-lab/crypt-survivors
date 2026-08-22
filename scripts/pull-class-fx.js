// Pull all 16 candidate frames per class signature FX into
// src/assets/pixellab_candidates/class_<name>/<idx>.png, then promote the
// first 4 into the live asset folder src/assets/fx_vs/class_<name>/ so
// fx_vs.js can register them as a 4-frame animation.
//
// User picks the best candidate later via picker.html.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OWNER_UUID = '9c338ce6-1b8f-4f3e-a302-31dde0bad543';

const JOBS = [
  { slug: 'class_knight',   uuid: 'effe0092-375c-4d01-951d-049e90138ef9' },
  { slug: 'class_warrior',  uuid: '9b676264-6902-46ca-a431-d0477e8bd9b7' },
  { slug: 'class_huntress', uuid: 'cf923602-3555-4ea6-9530-9fd44c2dcfe4' },
  { slug: 'class_mage',     uuid: 'b2d67985-5f55-4dd2-95dc-4e03528260d8' },
];

function url(uuid, frameIdx) {
  return `https://backblaze.pixellab.ai/file/pixellab-characters/objects/${OWNER_UUID}/${uuid}/rotations/frame_${frameIdx}.png`;
}

async function downloadOne(targetPath, fromUrl) {
  const res = await fetch(fromUrl);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} ← ${fromUrl}`);
  const ab = await res.arrayBuffer();
  if (ab.byteLength === 0) throw new Error('empty body');
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, Buffer.from(ab));
  return ab.byteLength;
}

const start = Date.now();
let okCount = 0;
let totalBytes = 0;

for (const job of JOBS) {
  const candidatesDir = path.join(ROOT, 'src/assets/pixellab_candidates', job.slug);
  const liveDir = path.join(ROOT, 'src/assets/fx_vs', job.slug);

  // 1) Pull all 16 candidates into pixellab_candidates/<slug>/
  const tasks = [];
  for (let i = 0; i < 16; i++) {
    const dest = path.join(candidatesDir, `${i.toString().padStart(2, '0')}.png`);
    tasks.push(downloadOne(dest, url(job.uuid, i)).then((n) => {
      okCount += 1;
      totalBytes += n;
    }));
  }
  await Promise.all(tasks);

  // 2) Promote first 4 to fx_vs/<slug>/frame_00<i>.png for the engine.
  //    (4-frame anim played at ~10fps reads as a brief burst — adjust later
  //    via picker.html.)
  for (let i = 0; i < 4; i++) {
    const src = path.join(candidatesDir, `${i.toString().padStart(2, '0')}.png`);
    const dst = path.join(liveDir, `frame_00${i}.png`);
    await fs.mkdir(liveDir, { recursive: true });
    await fs.copyFile(src, dst);
  }
  console.log(`${job.slug}: 16 candidates pulled, 4 promoted to live`);
}

const sec = ((Date.now() - start) / 1000).toFixed(1);
console.log(`\nDONE in ${sec}s — ok=${okCount}/64  bytes=${(totalBytes / 1024).toFixed(1)}KB`);
