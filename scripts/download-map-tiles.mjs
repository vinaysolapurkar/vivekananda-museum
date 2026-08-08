#!/usr/bin/env node
// Downloads a local offline tile pack for the two CesiumJS map apps
// (public/viveka-digvijaya and public/rkm-centres) so they never need to
// reach the internet at runtime — see CLAUDE.md "Offline map tiles" for why.
//
// Coverage: a global low-zoom overview (z0-5) plus a close-up patch (z6-16,
// +/-2 tiles) around every pinned location in each app's data file. This
// mirrors exactly what was downloaded when the offline map work was done —
// re-running this script reproduces the same tile pack from scratch on any
// machine, so the tiles themselves don't need to be committed to git.
//
// Usage: node scripts/download-map-tiles.mjs [--only=travels|centres]

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC = path.join(ROOT, "public");

const UA = "VivekanandaMuseumKiosk/1.0 (educational museum project)";
const CONCURRENCY = 8;
const RETRIES = 3;
const GLOBAL_ZOOM_MAX = 5; // full-world coverage, cheap at these zooms
const LOCAL_ZOOM_MAX = 16; // close-up detail around each pin
const TILE_BUFFER = 2; // +/- tiles around each pin's own tile, per zoom level

// ── Extract a `window.NAME = [...]` JSON array embedded in a data.js file ──
function extractJsonArray(filePath, marker) {
  const content = fs.readFileSync(filePath, "utf-8");
  const start = content.indexOf(marker);
  if (start === -1) throw new Error(`${marker} not found in ${filePath}`);
  const arrStart = content.indexOf("[", start);
  let depth = 0;
  let end = -1;
  for (let i = arrStart; i < content.length; i++) {
    if (content[i] === "[") depth++;
    else if (content[i] === "]") {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  return JSON.parse(content.slice(arrStart, end));
}

function latLngToTile(lat, lng, z) {
  const latRad = (lat * Math.PI) / 180;
  const n = 2 ** z;
  let x = Math.floor(((lng + 180) / 360) * n);
  let y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  x = Math.max(0, Math.min(n - 1, x));
  y = Math.max(0, Math.min(n - 1, y));
  return [x, y];
}

// ── Build the deduped [z,x,y] tile list for a set of {lat,lng} points ──────
function buildTileList(points) {
  const tiles = new Set();
  const add = (z, x, y) => tiles.add(`${z},${x},${y}`);

  for (let z = 0; z <= GLOBAL_ZOOM_MAX; z++) {
    const n = 2 ** z;
    for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) add(z, x, y);
  }

  for (let z = GLOBAL_ZOOM_MAX + 1; z <= LOCAL_ZOOM_MAX; z++) {
    const n = 2 ** z;
    for (const { lat, lng } of points) {
      const [cx, cy] = latLngToTile(lat, lng, z);
      for (let dx = -TILE_BUFFER; dx <= TILE_BUFFER; dx++) {
        for (let dy = -TILE_BUFFER; dy <= TILE_BUFFER; dy++) {
          const x = cx + dx, y = cy + dy;
          if (x >= 0 && x < n && y >= 0 && y < n) add(z, x, y);
        }
      }
    }
  }

  return [...tiles].map((s) => s.split(",").map(Number));
}

// ── Resumable, rate-limited downloader ──────────────────────────────────
async function downloadTileSet(label, tiles, baseUrl, destDir, ext) {
  let done = 0, skipped = 0, failed = 0;
  const total = tiles.length;
  const start = Date.now();
  const log = (msg) => console.log(`[${label}] [${((Date.now() - start) / 1000).toFixed(0)}s] ${msg}`);

  async function downloadOne([z, x, y]) {
    const dir = path.join(destDir, String(z), String(y));
    const file = path.join(dir, `${x}.${ext}`);
    if (fs.existsSync(file) && fs.statSync(file).size > 0) { skipped++; return; }
    fs.mkdirSync(dir, { recursive: true });
    const url = `${baseUrl}/${z}/${y}/${x}`;
    for (let attempt = 1; attempt <= RETRIES; attempt++) {
      try {
        const res = await fetch(url, { headers: { "User-Agent": UA } });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
        done++;
        return;
      } catch (e) {
        if (attempt === RETRIES) { failed++; console.error(`[${label}] FAILED ${z}/${y}/${x}: ${e.message}`); }
        else await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }
  }

  async function worker(queue) {
    while (queue.length) {
      await downloadOne(queue.pop());
      const processed = done + skipped + failed;
      if (processed % 2000 === 0) log(`${processed}/${total} (done=${done} skipped=${skipped} failed=${failed})`);
    }
  }

  log(`Starting: ${total} tiles -> ${path.relative(ROOT, destDir)}`);
  const queue = [...tiles];
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));
  log(`Done. done=${done} skipped=${skipped} failed=${failed} total=${total}`);
}

async function main() {
  const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];

  const travelsLocations = extractJsonArray(
    path.join(PUBLIC, "viveka-digvijaya/data/data.js"),
    "window.LOCATIONS_DATA"
  ).filter((l) => l.lat != null && l.lng != null);

  const centres = extractJsonArray(
    path.join(PUBLIC, "rkm-centres/data/centres.js"),
    "window.CENTRES_DATA"
  ).filter((c) => c.lat != null && c.lng != null);

  if (!only || only === "travels") {
    const tiles = buildTileList(travelsLocations);
    await downloadTileSet(
      "travels-satellite", tiles,
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile",
      path.join(PUBLIC, "viveka-digvijaya/tiles/satellite"), "jpg"
    );
  }

  if (!only || only === "centres") {
    const tiles = buildTileList(centres);
    await downloadTileSet(
      "centres-imagery", tiles,
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile",
      path.join(PUBLIC, "rkm-centres/tiles/imagery"), "jpg"
    );
    await downloadTileSet(
      "centres-labels", tiles,
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile",
      path.join(PUBLIC, "rkm-centres/tiles/labels"), "png"
    );
  }

  console.log("\nAll requested tile sets are up to date.");
}

main().catch((e) => { console.error(e); process.exit(1); });
