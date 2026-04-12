/**
 * Re-geocode centres that share coordinates with centres in different cities.
 * Uses Nominatim with 1s rate limit.
 *
 * Run: node scripts/fix-geocoding.mjs
 */

import { readFileSync, writeFileSync } from 'fs';

const CENTRES_FILE = 'public/rkm-centres/data/centres.js';

const centresJs = readFileSync(CENTRES_FILE, 'utf-8');
const centres = JSON.parse(centresJs.match(/window\.CENTRES_DATA\s*=\s*(\[[\s\S]*\]);/)[1]);

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function nominatim(query) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'User-Agent': 'RKM-Centres-Map/1.0 (geocode fix)' } });
    const data = await res.json();
    if (data.length) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {}
  return null;
}

// Manually verified correct coordinates for clearly misplaced centres
// (cities that are obviously far from their assigned state-capital coordinate)
const MANUAL_FIXES = {
  // Gujarat
  37:  { lat: 23.242, lng: 69.666 },  // Bhuj
  127: { lat: 22.567, lng: 71.796 },  // Limbdi
  // Madhya Pradesh
  10:  { lat: 22.675, lng: 81.756 },  // Amarkantak
  86:  { lat: 22.244, lng: 76.150 },  // Omkareswar
  183: { lat: 24.532, lng: 81.296 },  // Rewa
  // Maharashtra
  13:  { lat: 19.877, lng: 75.343 },  // Aurangabad/Chhatrapati Sambhajinagar
  119: { lat: 16.700, lng: 74.243 },  // Kolhapur
  189: { lat: 18.750, lng: 73.405 },  // Lonavala
  // Odisha
  186: { lat: 22.221, lng: 84.865 },  // Rourkela
  121: { lat: 19.317, lng: 84.867 },  // Kothar (Berhampur area)
  // Chhattisgarh
  38:  { lat: 22.083, lng: 82.148 },  // Bilaspur
  // Assam
  66:  { lat: 27.391, lng: 95.621 },  // Digboi
  110: { lat: 24.871, lng: 92.352 },  // Karimganj
  115: { lat: 26.440, lng: 92.337 },  // Kharupetia
  // Tripura
  64:  { lat: 23.820, lng: 91.370 },  // Dhaleswar
  // Tamil Nadu
  46:  { lat: 12.213, lng: 78.754 },  // Chengam (near Tiruvannamalai)
  120: { lat: 11.476, lng: 78.010 },  // Konampatti (near Salem)
  151: { lat: 12.625, lng: 78.612 },  // Nattarampalli (near Vellore)
  178: { lat: 9.371,  lng: 78.831 },  // Ramanathapuram
  190: { lat: 11.664, lng: 78.146 },  // Salem
  // Kerala
  101: { lat: 10.172, lng: 76.442 },  // Kalady
  102: { lat: 9.979,  lng: 76.578 },  // Muvattupuzha
  114: { lat: 9.172,  lng: 76.499 },  // Kayamkulam
  118: { lat: 9.931,  lng: 76.267 },  // Kochi
  122: { lat: 11.441, lng: 75.706 },  // Koyilandy
  159: { lat: 10.769, lng: 76.379 },  // Ottapalam
  161: { lat: 9.265,  lng: 76.787 },  // Pathanamthitta
  222: { lat: 10.517, lng: 76.213 },  // Punkunnam (Thrissur)
  219: { lat: 9.239,  lng: 76.551 },  // Mavelikara
  220: { lat: 8.569,  lng: 76.891 },  // Nettayam (Thiruvananthapuram suburb - OK to keep near TVM)
  224: { lat: 9.381,  lng: 76.570 },  // Thiruvalla
  // Karnataka
  30:  { lat: 15.852, lng: 74.497 },  // Belagavi (Belgaum)
  31:  { lat: 15.852, lng: 74.497 },  // Belagavi sub-centre
  61:  { lat: 14.464, lng: 75.921 },  // Davanagere
  132: { lat: 14.472, lng: 76.016 },  // Madihalli (near Davanagere)
  163: { lat: 12.143, lng: 75.947 },  // Ponnampet
  201: { lat: 12.837, lng: 77.495 },  // Shivanahalli (Bengaluru suburb - OK)
  // Uttarakhand
  107: { lat: 29.957, lng: 78.163 },  // Kankhal (Haridwar)
  138: { lat: 29.280, lng: 80.200 },  // Mayavati Ashrama (Champawat)
  // Jharkhand
  63:  { lat: 24.483, lng: 86.693 },  // Deoghar
  71:  { lat: 22.601, lng: 86.461 },  // Ghatshila
  // Bihar
  44:  { lat: 25.780, lng: 84.740 },  // Chapra
  169: { lat: 25.772, lng: 87.472 },  // Purnea
  // Uttar Pradesh
  29:  { lat: 26.798, lng: 82.742 },  // Basti
  // West Bengal (many far from Kolkata)
  17:  { lat: 25.221, lng: 88.773 },  // Balurghat
  19:  { lat: 23.232, lng: 87.073 },  // Bankura
  20:  { lat: 23.194, lng: 86.974 },  // Kalpathar (Bankura area)
  21:  { lat: 23.105, lng: 87.023 },  // Kenduadihi (Bankura)
  39:  { lat: 23.670, lng: 87.720 },  // Bolpur (Shantiniketan)
  56:  { lat: 21.789, lng: 87.743 },  // Contai
  57:  { lat: 26.327, lng: 89.450 },  // Cooch Behar
  60:  { lat: 27.041, lng: 88.263 },  // Darjeeling
  67:  { lat: 26.522, lng: 89.200 },  // Falakata
  69:  { lat: 22.459, lng: 87.340 },  // Garbeta
  75:  { lat: 22.869, lng: 88.152 },  // Gurap (Hooghly)
  97:  { lat: 22.461, lng: 87.023 },  // Srirampur (Jhargram area)
  104: { lat: 22.950, lng: 87.950 },  // Kamarpukur
  124: { lat: 23.399, lng: 88.517 },  // Krishnanagar
  126: { lat: 22.590, lng: 86.980 },  // Lalgarh (Jhargram)
  141: { lat: 26.560, lng: 89.460 },  // Mekhliganj
  145: { lat: 23.405, lng: 88.371 },  // Nabadwip
  165: { lat: 11.623, lng: 92.726 },  // Port Blair
  172: { lat: 25.617, lng: 88.117 },  // Raiganj
  193: { lat: 23.812, lng: 88.003 },  // Sargachhi (Murshidabad)
  204: { lat: 23.023, lng: 87.878 },  // Sikra-Kulingram
  // Agartala area
  100: { lat: 24.183, lng: 92.008 },  // Kailashahar (Tripura)
};

let fixed = 0;
centres.forEach(c => {
  if (MANUAL_FIXES[c.id]) {
    const old = `${c.lat},${c.lng}`;
    c.lat = MANUAL_FIXES[c.id].lat;
    c.lng = MANUAL_FIXES[c.id].lng;
    console.log(`Fixed ${c.id}: ${c.name.substring(0,50).padEnd(50)} ${old} → ${c.lat},${c.lng}`);
    fixed++;
  }
});

console.log(`\nManual fixes applied: ${fixed}`);

// Now use Nominatim for any remaining obvious duplicates not in manual list
// Find stacks of 2+ Indian centres at same rounded coordinate (2 decimal places)
const coordMap = {};
centres.forEach(c => {
  if (!c.lat || !c.country) return;
  const key = c.lat.toFixed(1) + ',' + c.lng.toFixed(1);
  if (!coordMap[key]) coordMap[key] = [];
  coordMap[key].push(c);
});

const toRegeocode = [];
Object.values(coordMap).forEach(group => {
  if (group.length < 2) return;
  // Check if names suggest different cities
  group.forEach((c, i) => {
    if (i === 0) return; // keep first (usually the primary city)
    if (MANUAL_FIXES[c.id]) return; // already fixed
    const cityFromName = c.name.replace(/^Ramakrishna (Math|Mission|Ashrama|Kutir)[,\s]*/i,'').split(',')[0].trim();
    const primaryCity  = group[0].name.replace(/^Ramakrishna (Math|Mission|Ashrama|Kutir)[,\s]*/i,'').split(',')[0].trim();
    if (cityFromName.toLowerCase() !== primaryCity.toLowerCase()) {
      toRegeocode.push({ c, cityFromName });
    }
  });
});

console.log(`\n${toRegeocode.length} additional centres to re-geocode via Nominatim…`);

for (const { c, cityFromName } of toRegeocode) {
  const query = c.state ? `${cityFromName}, ${c.state}, India` : `${cityFromName}, ${c.country}`;
  const geo = await nominatim(query);
  await sleep(1050);
  if (geo) {
    console.log(`  ✓ ${c.id}: ${cityFromName} → ${geo.lat.toFixed(3)}, ${geo.lng.toFixed(3)}`);
    c.lat = geo.lat;
    c.lng = geo.lng;
  } else {
    console.log(`  ✗ ${c.id}: ${cityFromName} — no result`);
  }
}

writeFileSync(CENTRES_FILE, `// Auto-generated by scripts/geocode-centres-fast.mjs\nwindow.CENTRES_DATA = ${JSON.stringify(centres, null, 2)};\n`);
console.log('\nDone. centres.js updated.');
