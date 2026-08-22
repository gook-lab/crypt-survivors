import { defineConfig } from 'vite';

// Vite build config + Vitest test config in one file.
// Tests cover the pure sim/engine modules only (design doc Test Plan);
// renderer/UI/integration are verified manually.
export default defineConfig({
  base: './',
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
