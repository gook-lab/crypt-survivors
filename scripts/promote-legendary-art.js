// Promote chosen PixelLab candidate PNGs into live game sprites.
//
// Source: src/assets/pixellab_candidates/legendary_pack/<uuid8>.png
//         src/assets/pixellab_candidates/wand_rod/<uuid8>.png
// Destination: src/assets/projectiles_vs/<slug>/frame_000.png
//
// After promotion, the matching slug in projectiles_vs.js PROJECTILES map
// loads it as the override texture for the sprite key.

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CANDIDATES = path.join(ROOT, 'src/assets/pixellab_candidates');
const LIVE = path.join(ROOT, 'src/assets/projectiles_vs');

// (live slug, candidate folder, candidate uuid8, description)
// — slug becomes the projectiles_vs/<slug>/ folder; the matching entry in
//   PROJECTILES maps it to a sprite key the weapon defs reference.
const ASSIGNMENTS = [
  // ── Legendary weapons (11) — leveraging the legendary_pack collection ──
  ['leg_blade',            'legendary_pack', '32ecadb6', 'jeweled silver+blue sword'],
  ['leg_obsidian_blade',   'legendary_pack', 'c216531d', 'silver katana — dark/clean'],
  ['leg_judgement_hammer', 'legendary_pack', '6604b1bf', 'golden morning star — holy hammer'],
  ['leg_hammer_of_dawn',   'legendary_pack', '119c66bc', 'golden spiked mace — dawn'],
  ['leg_axe',              'legendary_pack', 'c6ff43f4', 'bronze battle axe'],
  ['leg_spear',            'legendary_pack', 'a234eebc', 'golden trident — holy halberd'],
  ['leg_arrow',            'legendary_pack', 'ad53fe31', 'golden ornate crossbow'],
  ['leg_crystal_shard',    'legendary_pack', 'f92ae0ec', 'blue crystal-orb staff'],
  ['leg_scythe',           'legendary_pack', '48410d11', 'black dragon scythe'],
  ['leg_shadow_arrow',     'legendary_pack', '4715380d', 'hooded green dagger'],
  ['leg_phoenix_arrow',    'legendary_pack', '60a4e8f4', 'silver shuriken — close fit'],
  // ── Mage weapons (4) — wand_rod variants for staff identity ────────────
  ['wand',                 'wand_rod',       'd110b13f', 'crystal-flower staff w/ rainbow petals'],
  ['astral_staff',         'wand_rod',       'af9c968b', 'blue-gem royal scepter'],
  ['arcane_orb',           'wand_rod',       '16b3caea', 'gold royal scepter — orb'],
  ['leg_world_tree',       'wand_rod',       '553c4225', 'gnarled bone-wood wand'],
];

let promoted = 0;
for (const [slug, srcFolder, uuid8, desc] of ASSIGNMENTS) {
  const src = path.join(CANDIDATES, srcFolder, `${uuid8}.png`);
  const dstDir = path.join(LIVE, slug);
  const dst = path.join(dstDir, 'frame_000.png');
  try {
    await fs.access(src);
  } catch {
    console.warn(`SKIP ${slug}: candidate not found at ${src}`);
    continue;
  }
  await fs.mkdir(dstDir, { recursive: true });
  await fs.copyFile(src, dst);
  console.log(`✓ ${slug.padEnd(24)} ← ${srcFolder}/${uuid8}  (${desc})`);
  promoted += 1;
}

console.log(`\nPromoted ${promoted}/${ASSIGNMENTS.length} → src/assets/projectiles_vs/<slug>/frame_000.png`);
console.log('Next: update PROJECTILES map in src/assets/art/projectiles_vs.js + weapons.js sprite keys.');
