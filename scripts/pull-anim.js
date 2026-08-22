// Pull 8-frame animations for selected projectile sprites.
// animate_object output URLs are at /rotations/{animation_id}/frame_N.png
// but the API returns them via get_object — we re-resolve via get_object.
//
// Strategy: each anim UUID, poll until status=completed → frame URLs ready,
// then download frame_0..frame_7 into src/assets/projectiles_vs/<slug>/
// as frame_000.png..frame_007.png (replacing the single static frame).
//
// projectiles_vs.js loader is updated separately to detect N>1 frames and
// set fps for animated weapons.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OWNER_UUID = '9c338ce6-1b8f-4f3e-a302-31dde0bad543';
const POLL_DELAY_MS = 6000;
const POLL_LIMIT = 50; // 50 * 6s = 5 min per job

// (slug, animation_object_uuid) — the UUID is the same as the source
// object UUID after animate_object queues an animation on it. The
// animation frames live at /rotations/{animation_id}/frame_N.png — get_object
// returns the actual URLs once status flips to completed.
const JOBS = [
  { slug: 'leg_inferno_wall',   uuid: '68f606e4-4c16-4772-a0ee-7473e762a8f4' },
  { slug: 'consecrate',         uuid: 'cb1794a2-445a-4ce2-a4e1-ff155f550de2' },
  { slug: 'magma_burst',        uuid: 'cbd1d720-b7aa-414b-805f-c5e4dc5b66fc' },
  { slug: 'solar_flare',        uuid: '5b551a31-e405-4fec-85ff-43e22042bdb6' },
  { slug: 'leg_frozen_throne',  uuid: 'd8db40bf-694c-4d1b-be3a-b0ccd0b0d8d2' },
  { slug: 'ember_ring',         uuid: 'bb344484-fd74-40c7-872d-236ecee618b1' },
  { slug: 'voltaic_ring',       uuid: 'e42cd3c8-4a28-4e26-8615-3acaef546176' },
  { slug: 'plasma_orb',         uuid: 'd0bfb76b-61bf-4801-a69d-dba41d0a2f52' },
  { slug: 'leg_galaxy_orb',     uuid: 'e5e45a08-9b2c-4247-8f59-47952a00b919' },
  { slug: 'barbed_net',         uuid: '6185279c-b89c-4e54-80eb-634940beabe3' },
];

// Once animation is ready PixelLab serves frames at /rotations/unknown/animations/{anim_name}/frame_N.png
// but the auto-promoted animation usually shows as additional rotations after the static. The
// simplest fetch path is the same /rotations/unknown.png pattern with frame_N suffix per the
// existing pull pattern. If 404, fall back to candidate frames.
function staticUrl(uuid) {
  return `https://backblaze.pixellab.ai/file/pixellab-characters/objects/${OWNER_UUID}/${uuid}/rotations/unknown.png`;
}
function animFrameUrl(uuid, idx) {
  // animate_object output stored alongside the object under rotations/animations/
  return `https://backblaze.pixellab.ai/file/pixellab-characters/objects/${OWNER_UUID}/${uuid}/animations/unknown/frame_${idx}.png`;
}

async function waitForAnim(uuid) {
  for (let i = 0; i < POLL_LIMIT; i++) {
    const res = await fetch(animFrameUrl(uuid, 0), { method: 'HEAD' });
    if (res.ok) return true;
    await new Promise((r) => setTimeout(r, POLL_DELAY_MS));
  }
  return false;
}

async function downloadFrame(uuid, idx, dest) {
  const res = await fetch(animFrameUrl(uuid, idx));
  if (!res.ok) return false;
  const ab = await res.arrayBuffer();
  if (ab.byteLength === 0) return false;
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, Buffer.from(ab));
  return true;
}

async function pullJob(job) {
  const liveDir = path.join(ROOT, 'src/assets/projectiles_vs', job.slug);
  const ready = await waitForAnim(job.uuid);
  if (!ready) {
    console.warn(`✗ ${job.slug}: animation not ready (timeout)`);
    return;
  }
  let pulled = 0;
  for (let i = 0; i < 8; i++) {
    const dest = path.join(liveDir, `frame_00${i}.png`);
    if (await downloadFrame(job.uuid, i, dest)) pulled += 1;
  }
  console.log(`✓ ${job.slug.padEnd(22)} ${pulled}/8 anim frames`);
}

const start = Date.now();
await Promise.all(JOBS.map(pullJob));
console.log(`\nDONE in ${((Date.now() - start) / 1000).toFixed(1)}s`);
