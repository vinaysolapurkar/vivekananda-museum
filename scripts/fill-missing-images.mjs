/**
 * Fill missing centre images by scraping "More Info" pages on belurmath.org.
 * Each More Info page embeds Flickr photo galleries specific to that centre.
 * We exclude the 3 site-wide common Flickr photos and take the first unique one.
 *
 * Run: node scripts/fill-missing-images.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, createWriteStream } from 'fs';
import { join } from 'path';
import { pipeline } from 'stream/promises';

const CENTRES_FILE = 'public/rkm-centres/data/centres.js';
const CHECKPOINT   = 'public/rkm-centres/data/images_checkpoint.json';
const OUTPUT       = 'public/rkm-centres/data/images.js';
const OUTDIR       = 'public/rkm-centres/images';
const BELURMATH    = 'https://belurmath.org/branch-centres/';

// Site-wide Flickr photo IDs that appear on every page — not centre-specific
const COMMON_FLICKR_IDS = new Set([
  '52885469206',
  '55199882171',
]);

mkdirSync(OUTDIR, { recursive: true });

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchText(url, timeout = 15000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: c.signal,
      headers: { 'User-Agent': 'RKM-Centres-Map/1.0 (museum; building photos)' },
      redirect: 'follow',
    });
    clearTimeout(t);
    return res.ok ? await res.text() : null;
  } catch { clearTimeout(t); return null; }
}

async function downloadImage(url, destBase, timeout = 18000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: c.signal,
      headers: { 'User-Agent': 'RKM-Centres-Map/1.0 (museum)' },
      redirect: 'follow',
    });
    clearTimeout(t);
    if (!res.ok) return null;
    const ct = res.headers.get('content-type') || '';
    let ext = '.jpg';
    if (ct.includes('png')) ext = '.png';
    else if (ct.includes('webp')) ext = '.webp';
    const dest = destBase + ext;
    await pipeline(res.body, createWriteStream(dest));
    return dest;
  } catch { clearTimeout(t); return null; }
}

// Extract centre-specific Flickr image URLs from a More Info page
function extractCentreFlickr(html) {
  const all = [...html.matchAll(/"(https?:\/\/live\.staticflickr\.com\/\d+\/(\d+)_[^"]+\.jpg)"/gi)];
  const seen = new Set();
  const unique = [];
  for (const m of all) {
    const photoId = m[2];
    if (COMMON_FLICKR_IDS.has(photoId)) continue;
    if (seen.has(photoId)) continue;
    seen.add(photoId);
    // Prefer _h (large) or _k (original) size variants
    unique.push(m[1]);
  }
  return unique;
}

// Also extract belurmath.org wp-content/uploads images (non-logo)
function extractWpImages(html) {
  const all = [...html.matchAll(/"(https?:\/\/belurmath\.org\/wp-content\/uploads\/20\d\d\/\d+\/[^"]+\.(jpg|jpeg|png|webp))"/gi)];
  return all.map(m => m[1]).filter(u =>
    !u.includes('Logo') && !u.includes('logo') &&
    !u.includes('cropped') && !u.includes('icon') &&
    !u.includes('placeholder')
  );
}

// ── Load centres ──────────────────────────────────────────────────────────────
const centresJs = readFileSync(CENTRES_FILE, 'utf-8');
const match = centresJs.match(/window\.CENTRES_DATA\s*=\s*(\[[\s\S]*\]);/);
const CENTRES = JSON.parse(match[1]);
const checkpoint = JSON.parse(readFileSync(CHECKPOINT, 'utf-8'));

const missing = CENTRES.filter(c => checkpoint[String(c.id)] === null);
console.log(`${missing.length} centres need images.`);

// ── Scrape More Info URLs from belurmath.org ──────────────────────────────────
console.log('Fetching belurmath.org branch-centres page…');
const mainHtml = await fetchText(BELURMATH, 25000);
if (!mainHtml) { console.error('Failed to fetch belurmath.org'); process.exit(1); }

const moreInfoMap = {};  // centre name → More Info URL
const rows = [...mainHtml.matchAll(/<tr class="row-\d+">([\s\S]*?)<\/tr>/g)];
for (const row of rows) {
  const nameM = row[1].match(/column-1">([\s\S]*?)<\/td>/);
  const col3M = row[1].match(/column-3">([\s\S]*?)<\/td>/);
  if (!nameM || !col3M) continue;
  const name   = nameM[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').trim();
  const urlM   = col3M[1].match(/href="([^"]+)"/);
  if (urlM) moreInfoMap[name] = urlM[1];
}
console.log(`Found More Info URLs for ${Object.keys(moreInfoMap).length} centres.`);

// ── Process each missing centre ───────────────────────────────────────────────
let ok = 0, fail = 0;
const images = { ...checkpoint };

for (let i = 0; i < missing.length; i++) {
  const c = missing[i];
  const moreInfoUrl = moreInfoMap[c.name];

  if (!moreInfoUrl) {
    console.log(`  ✗ [${i+1}/${missing.length}] No More Info URL: ${c.name}`);
    fail++;
    continue;
  }

  const html = await fetchText(moreInfoUrl);
  await sleep(800);

  if (!html) {
    console.log(`  ✗ [${i+1}/${missing.length}] Fetch failed: ${c.name}`);
    fail++;
    continue;
  }

  // Try Flickr images first (centre-specific), then wp-content/uploads
  const flickrImgs = extractCentreFlickr(html);
  const wpImgs     = extractWpImages(html);
  const candidates = [...flickrImgs, ...wpImgs];

  let saved = null;
  for (const imgUrl of candidates.slice(0, 3)) {  // try up to 3
    const destBase = join(OUTDIR, String(c.id));
    saved = await downloadImage(imgUrl, destBase);
    if (saved) break;
    await sleep(500);
  }

  if (saved) {
    images[String(c.id)] = 'images/' + saved.replace(/.*\/images\//, '');
    ok++;
    console.log(`  ✓ [${i+1}/${missing.length}] ${c.name}  (${flickrImgs.length} flickr, ${wpImgs.length} wp imgs)`);
  } else {
    console.log(`  ✗ [${i+1}/${missing.length}] ${c.name}  (${flickrImgs.length} flickr, ${wpImgs.length} wp imgs)`);
    fail++;
  }
}

// ── Save ──────────────────────────────────────────────────────────────────────
writeFileSync(CHECKPOINT, JSON.stringify(images, null, 2));

const imageMap = {};
Object.entries(images).forEach(([id, p]) => { if (p) imageMap[id] = p; });
writeFileSync(OUTPUT, `// Auto-generated — do not edit manually\nwindow.CENTRE_IMAGES = ${JSON.stringify(imageMap, null, 2)};\n`, 'utf-8');

console.log(`\n${'─'.repeat(55)}`);
console.log(`Done. ${ok} new images found, ${fail} still missing.`);
console.log(`Total with images: ${Object.keys(imageMap).length} / ${CENTRES.length}`);
