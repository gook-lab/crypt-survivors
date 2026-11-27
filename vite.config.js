import { readdirSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { defineConfig } from 'vite';

// public/ is copied into dist/ verbatim, dotfiles included — a local browse
// log (public/structures/.gstack, 12 MB) and Finder's .DS_Store files rode
// along into builds. Drop every dot-entry from the output after the copy.
function stripDotfiles() {
  let outDir = 'dist';
  const removed = [];
  function walk(dir) {
    for (const ent of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, ent.name);
      if (ent.name.startsWith('.')) {
        rmSync(p, { recursive: true, force: true });
        removed.push(p);
      } else if (ent.isDirectory()) walk(p);
    }
  }
  return {
    name: 'strip-dotfiles',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      removed.length = 0;
      walk(outDir);
      if (removed.length) console.log(`[strip-dotfiles] removed ${removed.length} dot-entries from ${outDir}`);
    },
  };
}

// Vite build config + Vitest test config in one file.
// Tests cover the pure sim/engine modules only (design doc Test Plan);
// renderer/UI/integration are verified manually.
export default defineConfig({
  base: './',
  plugins: [stripDotfiles()],
  // host: true binds 0.0.0.0 so the dev server is reachable by LAN IP, not
  // just localhost — Vite prints the Network URL on start.
  server: { port: 7153, host: true },
  preview: { port: 7153, host: true },
  build: {
    // Default 4096 inlined ~2KB PixelLab projectile PNGs as data URIs into
    // the JS bundle. With 850+ pixel-art PNGs this pushed the JS over 2MB.
    // Drop the threshold so PNGs become standalone files — HTTP/2 multiplex
    // makes the extra requests cheap and the JS bundle shrinks dramatically.
    assetsInlineLimit: 1024,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
