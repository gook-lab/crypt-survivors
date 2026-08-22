// Uniform-grid spatial hash — collision broadphase (eng-review premise #4).
//
// Engine physics does not scale to bullet-heaven entity counts, so collision
// is custom. The grid buckets entities by cell; a query only checks the cells
// the search circle overlaps instead of every entity (O(n) -> ~O(1) per query).
//
// Rebuilt every frame in v1 (clear + re-insert all) — simplest and correct.
// Cell size is tuned via the Session 2 stress test.

export function createSpatialHash(cellSize = 48) {
  const cells = new Map(); // "cx,cy" -> entity[]

  const key = (cx, cy) => cx + ',' + cy;

  function clear() {
    cells.clear();
  }

  function insert(e) {
    const k = key(Math.floor(e.x / cellSize), Math.floor(e.y / cellSize));
    let bucket = cells.get(k);
    if (!bucket) {
      bucket = [];
      cells.set(k, bucket);
    }
    bucket.push(e);
  }

  // Collect every entity in the cells the circle (x, y, radius) overlaps.
  // Broadphase only — caller still does the precise distance check.
  function queryCircle(x, y, radius, out = []) {
    out.length = 0;
    const minCx = Math.floor((x - radius) / cellSize);
    const maxCx = Math.floor((x + radius) / cellSize);
    const minCy = Math.floor((y - radius) / cellSize);
    const maxCy = Math.floor((y + radius) / cellSize);
    for (let cx = minCx; cx <= maxCx; cx++) {
      for (let cy = minCy; cy <= maxCy; cy++) {
        const bucket = cells.get(key(cx, cy));
        if (bucket) for (let i = 0; i < bucket.length; i++) out.push(bucket[i]);
      }
    }
    return out;
  }

  return { clear, insert, queryCircle, cellSize };
}
