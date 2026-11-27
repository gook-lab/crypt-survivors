// First-load probe — cold-cache request count, transferred bytes and time
// until the title screen is interactive, on a production build.
//
//   npm run build && npx vite preview --port 5341 --strictPort &
//   PLAYWRIGHT=<path to playwright pkg> node scripts/measure-load.mjs [url] [runs]
//
// Playwright is not a dependency of this repo; point PLAYWRIGHT at any local
// install (default: resolve 'playwright' normally). Two profiles run: an
// unthrottled one and a 4 Mbps / 40 ms RTT one (CDP network emulation).
// "title" = #title-start visible (clicks before boot ends are held and
// replayed); "ready" = window.__bootReady, i.e. every sprite pack is loaded
// and a run can start. Builds without the marker count ready = title.

const pwPath = process.env.PLAYWRIGHT || 'playwright';
const { chromium } = await import(pwPath.endsWith('.js') || pwPath.startsWith('/') ? `${pwPath}/index.mjs` : pwPath);

const url = process.argv[2] || 'http://localhost:5341/';
const runs = Number(process.argv[3] || 3);

const PROFILES = [
  { name: 'unthrottled', net: null },
  {
    name: '4Mbps-40ms',
    net: { offline: false, latency: 40, downloadThroughput: (4e6 / 8), uploadThroughput: (1e6 / 8) },
  },
];

async function once(browser, profile) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  if (profile.net) await cdp.send('Network.emulateNetworkConditions', profile.net);

  const reqs = new Map();
  let bytes = 0;
  let inflight = 0;
  let lastActivity = Date.now();
  cdp.on('Network.requestWillBeSent', (e) => {
    reqs.set(e.requestId, { url: e.request.url, type: e.type, bytes: 0 });
    inflight++;
    lastActivity = Date.now();
  });
  cdp.on('Network.loadingFinished', (e) => {
    const r = reqs.get(e.requestId);
    if (r) r.bytes = e.encodedDataLength;
    bytes += e.encodedDataLength;
    inflight--;
    lastActivity = Date.now();
  });
  cdp.on('Network.loadingFailed', () => {
    inflight--;
    lastActivity = Date.now();
  });

  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'commit' });
  let loaderSeen = null;
  page
    .waitForSelector('#boot-loader', { state: 'visible', timeout: 60000 })
    .then(() => { loaderSeen = Date.now() - t0; })
    .catch(() => {});
  await page.waitForSelector('#title-start', { state: 'visible', timeout: 180000 });
  const tTitle = Date.now() - t0;
  const atTitle = { reqs: reqs.size, bytes };
  const hasMarker = await page.evaluate(() => typeof window.__bootFail === 'function');
  if (hasMarker) await page.waitForFunction(() => window.__bootReady === true, null, { timeout: 180000 });
  const tReady = Date.now() - t0;

  // network quiet for 1.5 s → everything the page fetches on its own is in
  while (inflight > 0 || Date.now() - lastActivity < 1500) {
    if (Date.now() - t0 > 300000) break;
    await new Promise((r) => setTimeout(r, 100));
  }
  const tIdle = lastActivity - t0;
  const byType = {};
  for (const r of reqs.values()) {
    const k = r.type || 'Other';
    byType[k] = byType[k] || { n: 0, bytes: 0 };
    byType[k].n++;
    byType[k].bytes += r.bytes;
  }
  await ctx.close();
  return { tTitle, tReady, loaderSeen, atTitle, total: { reqs: reqs.size, bytes, tIdle }, byType };
}

const median = (a) => [...a].sort((x, y) => x - y)[Math.floor(a.length / 2)];
const kb = (b) => `${(b / 1024).toFixed(0)} KB`;

const browser = await chromium.launch();
for (const profile of PROFILES) {
  const rs = [];
  for (let i = 0; i < runs; i++) rs.push(await once(browser, profile));
  const m = (f) => median(rs.map(f));
  console.log(`\n== ${profile.name} (${runs} cold runs, median) ==`);
  console.log(`loader visible   : ${rs.every((r) => r.loaderSeen != null) ? `${m((r) => r.loaderSeen)} ms` : 'n/a'}`);
  console.log(`title visible    : ${m((r) => r.tTitle)} ms   (each: ${rs.map((r) => r.tTitle).join(', ')})`);
  console.log(`  by then        : ${m((r) => r.atTitle.reqs)} requests, ${kb(m((r) => r.atTitle.bytes))}`);
  console.log(`all art ready    : ${m((r) => r.tReady)} ms   (each: ${rs.map((r) => r.tReady).join(', ')})`);
  console.log(`network idle     : ${m((r) => r.total.tIdle)} ms, ${m((r) => r.total.reqs)} requests, ${kb(m((r) => r.total.bytes))}`);
  console.log('  by type (last run):', Object.entries(rs[rs.length - 1].byType).map(([k, v]) => `${k} ${v.n}/${kb(v.bytes)}`).join(' · '));
}
await browser.close();
