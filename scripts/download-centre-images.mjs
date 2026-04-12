/**
 * Download building/temple images for all 323 RKM branch centres.
 *
 * Priority:
 *   1. belurmath.org "More Info" page → centre-specific Flickr photos  ← FIRST CHOICE
 *   2. Wikidata  → P18 image property
 *   3. Wikipedia → page lead image
 *   4. Wikimedia Commons file search
 *   5. Centre's own website → building-keyword images only
 *
 * Run:  node scripts/download-centre-images.mjs
 * Safe to re-run — resumes from checkpoint.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync, createWriteStream } from 'fs';
import { join } from 'path';
import { pipeline } from 'stream/promises';

const CENTRES_FILE = 'public/rkm-centres/data/centres.js';
const OUTDIR       = 'public/rkm-centres/images';
const CHECKPOINT   = 'public/rkm-centres/data/images_checkpoint.json';
const OUTPUT       = 'public/rkm-centres/data/images.js';
const WEBSITE_MAP  = 'public/rkm-centres/data/website_map.json';
const BELURMATH    = 'https://belurmath.org/branch-centres/';

// Site-wide Flickr photo IDs that appear on every belurmath.org page — not centre-specific
const COMMON_FLICKR_IDS = new Set(['52885469206', '55199882171']);

mkdirSync(OUTDIR, { recursive: true });

// ── Helpers ───────────────────────────────────────────────────────────────────
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

async function fetchJson(url, timeout = 10000) {
  const c = new AbortController();
  const t = setTimeout(() => c.abort(), timeout);
  try {
    const res = await fetch(url, {
      signal: c.signal,
      headers: { 'User-Agent': 'RKM-Centres-Map/1.0 (museum)' },
    });
    clearTimeout(t);
    return res.ok ? JSON.parse(await res.text()) : null;
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

function resolveUrl(base, rel) {
  if (!rel) return null;
  try { return new URL(rel, base).href; } catch { return null; }
}

const BAD_KEYWORDS = /logo|icon|banner|poster|flag|symbol|avatar|header|bg|background|pattern/i;
const BUILDING_KEYWORDS = /temple|building|ashram|math|mission|campus|entrance|gate|front|main|mandir|shrine|hall|facade|exterior|view|centre|center/i;

// ── 1. belurmath.org More Info → Flickr ───────────────────────────────────────
function extractCentreFlickr(html) {
  const seen = new Set();
  const imgs = [];
  for (const m of html.matchAll(/"(https?:\/\/live\.staticflickr\.com\/\d+\/(\d+)_[^"]+\.jpg)"/gi)) {
    const photoId = m[2];
    if (COMMON_FLICKR_IDS.has(photoId) || seen.has(photoId)) continue;
    seen.add(photoId);
    imgs.push(m[1]);
  }
  return imgs;
}

// ── 2. Wikidata P18 ───────────────────────────────────────────────────────────
async function tryWikidata(query) {
  const data = await fetchJson(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&limit=3`);
  await sleep(400);
  for (const r of data?.search || []) {
    const entity = await fetchJson(`https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${r.id}&props=claims&format=json`);
    await sleep(400);
    const p18 = entity?.entities?.[r.id]?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
    if (p18) return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(p18.replace(/ /g,'_'))}?width=800`;
  }
  return null;
}

// ── 3. Wikipedia lead image ───────────────────────────────────────────────────
async function tryWikipedia(query) {
  const data = await fetchJson(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=5&srnamespace=0`);
  await sleep(600);
  for (const r of data?.query?.search || []) {
    if (!/ramakrishna|vivekananda|vedanta|belur/i.test(r.title)) continue;
    const imgData = await fetchJson(`https://en.wikipedia.org/w/api.php?action=query&pageids=${r.pageid}&prop=pageimages&format=json&pithumbsize=800`);
    await sleep(600);
    const thumb = imgData?.query?.pages?.[r.pageid]?.thumbnail?.source;
    if (thumb && !BAD_KEYWORDS.test(thumb)) return thumb;
  }
  return null;
}

// ── 4. Wikimedia Commons ──────────────────────────────────────────────────────
async function tryCommons(query) {
  const data = await fetchJson(`https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srnamespace=6&format=json&srlimit=8`);
  await sleep(600);
  for (const r of data?.query?.search || []) {
    if (!/\.(jpg|jpeg|png|webp)/i.test(r.title) || BAD_KEYWORDS.test(r.title)) continue;
    const fn = r.title.replace(/^File:/, '');
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fn)}?width=800`;
  }
  return null;
}

// ── 5. Centre website — building images only ──────────────────────────────────
async function tryWebsite(websiteUrl) {
  const html = await fetchText(websiteUrl);
  if (!html) return null;
  const imgs = [];
  for (const m of html.matchAll(/<img[^>]+(src|data-src)="([^"]+\.(jpg|jpeg|png|webp))[^"]*"[^>]*>/gi)) {
    const src = resolveUrl(websiteUrl, m[2]);
    if (!src || BAD_KEYWORDS.test(src)) continue;
    if (BUILDING_KEYWORDS.test(src)) imgs.unshift(src);
    else imgs.push(src);
  }
  await sleep(600);
  return imgs[0] || null;
}

function buildQuery(c) {
  const stripped = c.name
    .replace(/\s*[-–]\s*(a |A )?sub-centre.*/i, '')
    .replace(/^(Ramakrishna (Math|Mission|Ashrama|Kutir|Vedanta Centre|Vedanta Society)[,\s&]*)+/i, '')
    .trim();
  const city = stripped.split(',')[0].trim();
  return city ? `Ramakrishna ${c.type === 'math' ? 'Math' : 'Mission'} ${city}` : c.name;
}

// ── Load data ─────────────────────────────────────────────────────────────────
const centresJs = readFileSync(CENTRES_FILE, 'utf-8');
const CENTRES = JSON.parse(centresJs.match(/window\.CENTRES_DATA\s*=\s*(\[[\s\S]*\]);/)[1]);
const checkpoint = existsSync(CHECKPOINT) ? JSON.parse(readFileSync(CHECKPOINT, 'utf-8')) : {};
const websiteMap = existsSync(WEBSITE_MAP) ? JSON.parse(readFileSync(WEBSITE_MAP, 'utf-8')) : {};
console.log(`Loaded ${CENTRES.length} centres. ${Object.keys(checkpoint).length} already done.`);

// ── Scrape More Info URLs from belurmath.org ──────────────────────────────────
let moreInfoMap = {};
const moreInfoCache = 'public/rkm-centres/data/moreinfo_map.json';
if (existsSync(moreInfoCache)) {
  moreInfoMap = JSON.parse(readFileSync(moreInfoCache, 'utf-8'));
  console.log(`Loaded ${Object.keys(moreInfoMap).length} More Info URLs from cache.`);
} else {
  console.log('Fetching belurmath.org for More Info URLs…');
  const html = await fetchText(BELURMATH, 25000);
  if (!html) { console.error('Failed to fetch belurmath.org'); process.exit(1); }
  for (const row of html.matchAll(/<tr class="row-\d+">([\s\S]*?)<\/tr>/g)) {
    const nameM = row[1].match(/column-1">([\s\S]*?)<\/td>/);
    const col3M = row[1].match(/column-3">([\s\S]*?)<\/td>/);
    if (!nameM || !col3M) continue;
    const name = nameM[1].replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').trim();
    const urlM = col3M[1].match(/href="([^"]+)"/);
    if (urlM) moreInfoMap[name] = urlM[1];
  }
  writeFileSync(moreInfoCache, JSON.stringify(moreInfoMap, null, 2));
  console.log(`Found More Info URLs for ${Object.keys(moreInfoMap).length} centres.`);
}

// ── Main loop ─────────────────────────────────────────────────────────────────
const images = { ...checkpoint };
let ok = 0, fromFlickr = 0, fromWikidata = 0, fromWiki = 0, fromCommons = 0, fromWeb = 0, fail = 0, skipped = 0;

for (let i = 0; i < CENTRES.length; i++) {
  const c = CENTRES[i];
  const key = String(c.id);

  if (key in images) {
    skipped++;
    if (images[key]) ok++;
    continue;
  }

  const destBase = join(OUTDIR, String(c.id));
  let imgUrl = null, source = null;

  // 1. belurmath.org More Info → Flickr
  const moreInfoUrl = moreInfoMap[c.name];
  if (moreInfoUrl) {
    const html = await fetchText(moreInfoUrl);
    await sleep(700);
    if (html) {
      const flickrImgs = extractCentreFlickr(html);
      if (flickrImgs.length > 0) { imgUrl = flickrImgs[0]; source = 'belurmath'; }
    }
  }

  // 2. Wikidata
  if (!imgUrl) {
    imgUrl = await tryWikidata(buildQuery(c));
    if (imgUrl) source = 'wikidata';
  }

  // 3. Wikipedia
  if (!imgUrl) {
    imgUrl = await tryWikipedia(buildQuery(c));
    if (imgUrl) source = 'wikipedia';
  }

  // 4. Commons
  if (!imgUrl) {
    imgUrl = await tryCommons(buildQuery(c));
    if (imgUrl) source = 'commons';
  }

  // 5. Centre's own website
  if (!imgUrl && websiteMap[c.name]) {
    imgUrl = await tryWebsite(websiteMap[c.name]);
    if (imgUrl) source = 'website';
  }

  // Download
  let savedPath = null;
  if (imgUrl) savedPath = await downloadImage(imgUrl, destBase);

  if (savedPath) {
    images[key] = 'images/' + savedPath.replace(/.*\/images\//, '');
    ok++;
    if (source === 'belurmath')  fromFlickr++;
    if (source === 'wikidata')   fromWikidata++;
    if (source === 'wikipedia')  fromWiki++;
    if (source === 'commons')    fromCommons++;
    if (source === 'website')    fromWeb++;
    console.log(`  ✓ [${i+1}/${CENTRES.length}] (${source}) ${c.name}`);
  } else {
    images[key] = null;
    fail++;
    console.log(`  ✗ [${i+1}/${CENTRES.length}] ${c.name}`);
  }

  if ((i + 1) % 5 === 0) writeFileSync(CHECKPOINT, JSON.stringify(images, null, 2));
}

writeFileSync(CHECKPOINT, JSON.stringify(images, null, 2));

const imageMap = {};
Object.entries(images).forEach(([id, p]) => { if (p) imageMap[id] = p; });
writeFileSync(OUTPUT, `// Auto-generated by scripts/download-centre-images.mjs — do not edit manually\nwindow.CENTRE_IMAGES = ${JSON.stringify(imageMap, null, 2)};\n`, 'utf-8');

console.log(`\n${'─'.repeat(60)}`);
console.log(`Done. ${ok} images total.`);
console.log(`  belurmath Flickr: ${fromFlickr} | Wikidata: ${fromWikidata} | Wikipedia: ${fromWiki} | Commons: ${fromCommons} | Website: ${fromWeb}`);
console.log(`  ${fail} centres had no image. (${skipped} from cache)`);
console.log(`Output: ${OUTPUT}`);
