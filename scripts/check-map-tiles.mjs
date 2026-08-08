#!/usr/bin/env node
// Non-blocking startup check: warns (once, loudly) if the offline map tile
// packs haven't been downloaded yet. Never fails the build/dev command —
// the rest of the app works fine without them, only the two map modules
// need the tiles. See scripts/download-map-tiles.mjs.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.resolve(__dirname, "..", "public");

function tileCount(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const zDir of fs.readdirSync(dir)) {
    const zPath = path.join(dir, zDir);
    if (!fs.statSync(zPath).isDirectory()) continue;
    for (const yDir of fs.readdirSync(zPath)) {
      const yPath = path.join(zPath, yDir);
      if (fs.statSync(yPath).isDirectory()) count += fs.readdirSync(yPath).length;
    }
  }
  return count;
}

const sets = [
  { label: "Travels map satellite imagery", dir: path.join(PUBLIC, "viveka-digvijaya/tiles/satellite") },
  { label: "RKM Centres map imagery", dir: path.join(PUBLIC, "rkm-centres/tiles/imagery") },
  { label: "RKM Centres map place labels", dir: path.join(PUBLIC, "rkm-centres/tiles/labels") },
];

const missing = sets.filter((s) => tileCount(s.dir) < 1000); // sanity floor, not an exact expected count

if (missing.length > 0) {
  console.warn("\n\x1b[33m⚠ Offline map tiles not found:\x1b[0m");
  for (const s of missing) console.warn(`  - ${s.label}`);
  console.warn("  The /map and /centres pages will show blank/broken maps until you run:");
  console.warn("  \x1b[1m  npm run download-tiles\x1b[0m");
  console.warn("  (one-time, ~1.85GB, ~45 min on a typical connection — everything else in the app works fine without it)\n");
}
