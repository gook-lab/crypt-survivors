// Shared PNG loader for the *_vs.js art packs.
//
// Each pack still registers its sprites in its own order (load order decides
// which pack wins a shared SPRITES key), but the network work no longer runs
// pack by pack, frame by frame: main.js asks every pack for its URL list up
// front and `preloadImages` requests them all at once. When a pack then walks
// its frames, `loadImage` hands back the request already in flight.

const pending = new Map(); // url -> Promise<HTMLImageElement>

export function loadImage(url) {
  let p = pending.get(url);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('failed to load ' + url));
      img.src = url;
    });
    pending.set(url, p);
  }
  return p;
}

// Start every request now; `onProgress(done, total)` fires as each settles.
// Never rejects — the packs see a failed URL through their own loadImage call.
export function preloadImages(urls, onProgress) {
  const unique = [...new Set(urls)];
  const total = unique.length;
  let done = 0;
  if (onProgress) onProgress(0, total);
  const tick = () => {
    done++;
    if (onProgress) onProgress(done, total);
  };
  return Promise.all(unique.map((u) => loadImage(u).then(tick, tick)));
}

// Drop the Image references once every pack has copied them into canvases.
export function releaseImages() {
  pending.clear();
}
