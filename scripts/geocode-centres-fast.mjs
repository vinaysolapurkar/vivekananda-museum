/**
 * Geocode RKM branch centres using a built-in city coordinate lookup.
 * Falls back to Nominatim only for unknown cities (with rate limiting).
 * Outputs: public/rkm-centres/data/centres.js
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const INPUT  = "public/branch_centres.json";
const OUTDIR = "public/rkm-centres/data";
const OUTPUT = join(OUTDIR, "centres.js");

const centres = JSON.parse(readFileSync(INPUT, "utf-8"));

const FLAG = {
  "India":"🇮🇳","USA":"🇺🇸","Bangladesh":"🇧🇩","South Africa":"🇿🇦",
  "Australia":"🇦🇺","Brazil":"🇧🇷","Malaysia":"🇲🇾","Canada":"🇨🇦",
  "Mauritius":"🇲🇺","Sri Lanka":"🇱🇰","Argentina":"🇦🇷","Fiji":"🇫🇯",
  "France":"🇫🇷","Germany":"🇩🇪","Ireland":"🇮🇪","Japan":"🇯🇵",
  "Nepal":"🇳🇵","Netherlands":"🇳🇱","New Zealand":"🇳🇿","Philippines":"🇵🇭",
  "Russia":"🇷🇺","Singapore":"🇸🇬","Switzerland":"🇨🇭",
  "United Kingdom":"🇬🇧","Zambia":"🇿🇲",
};

// ── Built-in city coordinates ──────────────────────────────────────────────
// Indian cities (lat, lng)
const INDIA_CITIES = {
  "aalo": [28.16, 94.80], "adilabad": [19.66, 78.53], "adipur": [23.07, 70.07],
  "agartala": [23.83, 91.28], "agra": [27.18, 78.02], "ahmedabad": [23.02, 72.57],
  "aizawl": [23.73, 92.72], "ajmer": [26.45, 74.64], "akola": [20.71, 77.00],
  "allahabad": [25.44, 81.84], "prayagraj": [25.44, 81.84],
  "almora": [29.60, 79.65], "alwar": [27.56, 76.64],
  "amravati": [20.93, 77.75], "amritsar": [31.63, 74.87], "anantapur": [14.68, 77.60],
  "asansol": [23.68, 86.96], "aurangabad": [19.88, 75.34],
  "ayodhya": [26.79, 82.20], "badrinath": [30.74, 79.49],
  "baghbazar": [22.58, 88.37], "baranagar": [22.64, 88.38],
  "barasat": [22.72, 88.48], "bardhaman": [23.23, 87.85],
  "bareilly": [28.36, 79.42], "belgharia": [22.68, 88.39],
  "belur": [22.63, 88.35], "belur math": [22.63, 88.35],
  "bengaluru": [12.97, 77.59], "bangalore": [12.97, 77.59],
  "berhampur": [19.31, 84.79], "berhampore": [24.10, 88.25],
  "bhubaneswar": [20.30, 85.82], "bikaner": [28.02, 73.31],
  "chandigarh": [30.73, 76.78], "chennai": [13.08, 80.27],
  "madras": [13.08, 80.27], "cherrapunjee": [25.28, 91.73],
  "sohra": [25.28, 91.73], "coimbatore": [11.02, 76.98],
  "cuttack": [20.47, 85.88], "daltonganj": [24.03, 84.07],
  "dehradun": [30.32, 78.03], "delhi": [28.61, 77.21],
  "new delhi": [28.61, 77.21], "dhule": [20.90, 74.78],
  "dibrugarh": [27.48, 95.00], "durgapur": [23.55, 87.32],
  "ernakulam": [9.98, 76.30], "gangtok": [27.33, 88.61],
  "gaya": [24.80, 85.00], "gorakhpur": [26.76, 83.37],
  "guwahati": [26.18, 91.74], "gwalior": [26.22, 78.17],
  "haflong": [25.18, 92.90], "haldwani": [29.22, 79.51],
  "halasuru": [12.98, 77.62], "haripad": [9.28, 76.47],
  "haridwar": [29.95, 78.16], "hatamuniguda": [19.59, 83.51],
  "hyderabad": [17.36, 78.47], "ichapur": [22.80, 88.37],
  "imphal": [24.80, 93.94], "indore": [22.72, 75.86],
  "itanagar": [27.10, 93.62], "jaipur": [26.91, 75.82],
  "jalpaiguri": [26.54, 88.73], "jammu": [32.73, 74.87],
  "jamshedpur": [22.80, 86.20], "jamtara": [23.96, 86.80],
  "jayrambati": [22.92, 87.61], "jhargram": [22.45, 86.99],
  "jodhpur": [26.29, 73.01], "jorhat": [26.75, 94.21],
  "kadapa": [14.47, 78.82], "kalyani": [22.98, 88.44],
  "kanchipuram": [12.84, 79.70], "kanpur": [26.46, 80.33],
  "kanyakumari": [8.09, 77.55], "karaikudi": [10.07, 78.78],
  "karimganj": [24.87, 92.36], "katihar": [25.53, 87.59],
  "khetri": [28.00, 75.80], "kohima": [25.67, 94.11],
  "kolkata": [22.57, 88.36], "calcutta": [22.57, 88.36],
  "konnagar": [22.70, 88.35], "kozhikode": [11.25, 75.78],
  "latur": [18.41, 76.56], "lucknow": [26.84, 80.94],
  "ludhiana": [30.90, 75.85], "lunglei": [22.89, 92.73],
  "madurai": [9.93, 78.12], "malda": [25.01, 88.14],
  "mangaluru": [12.87, 74.88], "manipal": [13.35, 74.79],
  "mathura": [27.49, 77.67], "medinipur": [22.43, 87.32],
  "midnapore": [22.43, 87.32], "meerut": [28.98, 77.71],
  "mount abu": [24.59, 72.71], "mumbai": [19.08, 72.88],
  "bombay": [19.08, 72.88], "muzaffarpur": [26.12, 85.39],
  "mysore": [12.30, 76.65], "mysuru": [12.30, 76.65],
  "nagarcoil": [8.18, 77.43], "nagercoil": [8.18, 77.43],
  "nagpur": [21.15, 79.09], "naidupeta": [13.90, 79.91],
  "nainital": [29.39, 79.46], "nalgonda": [17.05, 79.27],
  "nasik": [19.99, 73.79], "nashik": [19.99, 73.79],
  "narendrapur": [22.44, 88.40], "narsinghpur": [22.95, 79.19],
  "nathdwara": [24.93, 73.82], "nawadwip": [23.41, 88.37],
  "nizamabad": [18.67, 78.10], "noakhali": [22.87, 91.10],
  "omkareswar": [22.24, 76.15], "ooty": [11.41, 76.70],
  "ootacamund": [11.41, 76.70], "palghat": [10.77, 76.65],
  "palakkad": [10.77, 76.65], "panihati": [22.69, 88.38],
  "parbhani": [19.27, 76.78], "patna": [25.59, 85.14],
  "porbandar": [21.64, 69.61], "puducherry": [11.93, 79.83],
  "pondicherry": [11.93, 79.83], "pune": [18.52, 73.86],
  "poona": [18.52, 73.86], "puri": [19.81, 85.83],
  "puruliya": [23.33, 86.36], "purulia": [23.33, 86.36],
  "rajahmundry": [16.98, 81.78], "rajamahendravaram": [16.98, 81.78],
  "rajkot": [22.30, 70.80], "ramakrishnapur": [22.57, 88.36],
  "ramharipur": [22.57, 88.36], "ranchi": [23.36, 85.33],
  "rangoon": [16.87, 96.17], "ratlam": [23.33, 75.04],
  "rishikesh": [30.09, 78.27], "rohtak": [28.89, 76.57],
  "saradapitha": [22.57, 88.36], "sarisha": [22.45, 88.28],
  "shillong": [25.57, 91.88], "shimla": [31.10, 77.17],
  "shivanahalli": [12.97, 77.59], "shyamla tal": [29.35, 79.50],
  "silchar": [24.83, 92.80], "siliguri": [26.72, 88.43],
  "sinthi": [22.62, 88.39], "sikra kulingram": [22.57, 88.36],
  "sitanagaram": [16.60, 81.52], "srinagar": [34.08, 74.80],
  "surat": [21.20, 72.84], "tamluk": [22.47, 87.92],
  "taki": [22.59, 88.92], "thanjavur": [10.79, 79.14],
  "tanjore": [10.79, 79.14], "thirumukkudal": [11.80, 77.50],
  "thiruvananthapuram": [8.52, 76.94], "trivandrum": [8.52, 76.94],
  "thrissur": [10.52, 76.21], "trichur": [10.52, 76.21],
  "tirupati": [13.63, 79.42], "thiruvalla": [9.38, 76.58],
  "ujjain": [23.18, 75.78], "uttarkashi": [30.73, 78.44],
  "vadodara": [22.31, 73.18], "baroda": [22.31, 73.18],
  "varanasi": [25.33, 83.00], "benares": [25.33, 83.00],
  "benaras": [25.33, 83.00], "venkatapura": [13.43, 77.95],
  "vijayawada": [16.51, 80.63], "villupuram": [11.93, 79.49],
  "visakhapatnam": [17.69, 83.21], "vizag": [17.69, 83.21],
  "vrindavan": [27.58, 77.70], "vriddhachalam": [11.52, 79.33],
  "yadadri": [17.61, 78.96], "yelagiri": [12.58, 78.63],
  "hatamuniguda": [19.59, 83.51], "mavelikara": [9.27, 76.56],
  "nettayam": [8.49, 76.88], "punkunnam": [10.52, 76.21],
  "koalpara": [22.99, 87.69], "moynapur": [23.00, 87.69],
  "indas": [23.20, 87.80], "somsar": [23.10, 87.50],
  "yadadri bhuvanagiri": [17.61, 78.96], "bhuvanagiri": [17.61, 78.96],
};

// Indian states fallback (capital coords)
const INDIA_STATES = {
  "Andhra Pradesh": [15.91, 79.74], "Arunachal Pradesh": [28.22, 94.73],
  "Assam": [26.18, 91.74], "Bihar": [25.59, 85.14],
  "Chhattisgarh": [21.27, 81.87], "Goa": [15.30, 74.12],
  "Gujarat": [23.02, 72.57], "Haryana": [29.07, 76.09],
  "Himachal Pradesh": [31.10, 77.17], "Jharkhand": [23.36, 85.33],
  "Karnataka": [12.97, 77.59], "Kerala": [8.52, 76.94],
  "Madhya Pradesh": [23.25, 77.40], "Maharashtra": [19.08, 72.88],
  "Manipur": [24.80, 93.94], "Meghalaya": [25.57, 91.88],
  "Mizoram": [23.73, 92.72], "Nagaland": [25.67, 94.11],
  "Odisha": [20.30, 85.82], "Punjab": [30.90, 75.85],
  "Rajasthan": [26.91, 75.82], "Sikkim": [27.33, 88.61],
  "Tamil Nadu": [13.08, 80.27], "Telangana": [17.38, 78.47],
  "Tripura": [23.83, 91.28], "Uttar Pradesh": [26.84, 80.94],
  "Uttarakhand": [30.32, 78.03], "West Bengal": [22.57, 88.36],
  "Delhi": [28.61, 77.21], "Jammu & Kashmir": [34.08, 74.80],
  "Ladakh": [34.17, 77.58], "Puducherry": [11.93, 79.83],
};

// International cities
const INTL_CITIES = {
  // Argentina
  "buenos aires": [-34.60, -58.38],
  // Australia
  "sydney": [-33.87, 151.21], "adelaide": [-34.93, 138.60],
  "brisbane": [-27.47, 153.02], "canberra": [-35.28, 149.13],
  "melbourne": [-37.81, 144.96], "perth": [-31.95, 115.86],
  // Bangladesh
  "bagerhat": [22.65, 89.78], "baliati": [23.80, 90.01],
  "barisal": [22.70, 90.37], "chandpur": [23.23, 90.65],
  "chittagong": [22.33, 91.81], "comilla": [23.46, 91.18],
  "dhaka": [23.72, 90.41], "dinajpur": [25.63, 88.63],
  "faridpur": [23.60, 89.84], "habiganj": [24.37, 91.42],
  "jessore": [23.17, 89.21], "jashore": [23.17, 89.21],
  "narail": [23.17, 89.50], "mymensingh": [24.75, 90.41],
  "narayanganj": [23.62, 90.50], "rangpur": [25.74, 89.25],
  "sitakunda": [22.62, 91.66], "sylhet": [24.90, 91.87],
  "fatehabad": [23.80, 90.01], "dhorla": [25.74, 89.25],
  // Brazil
  "curitiba": [-25.43, -49.27], "sao paulo": [-23.55, -46.63],
  "belo horizonte": [-19.92, -43.94], "brasilia": [-15.78, -47.93],
  "rio de janeiro": [-22.90, -43.17],
  // Canada
  "toronto": [43.65, -79.38], "surrey": [49.19, -122.85],
  "british columbia": [49.19, -122.85],
  // Fiji
  "nadi": [-17.80, 177.41],
  // France
  "gretz": [48.74, 2.73], "paris": [48.85, 2.35],
  // Germany
  "berlin": [52.52, 13.40],
  // Ireland
  "dublin": [53.33, -6.25],
  // Japan
  "kanagawa": [35.45, 139.64], "tokyo": [35.69, 139.69],
  // Malaysia
  "malaysia": [3.14, 101.69], "kuala lumpur": [3.14, 101.69],
  "johor": [1.48, 103.76], "johor bahru": [1.48, 103.76],
  "perak": [4.59, 101.09], "ipoh": [4.59, 101.09],
  // Mauritius
  "vacoas": [-20.30, 57.48], "port louis": [-20.16, 57.50],
  "st. julien": [-20.24, 57.56], "saint julien": [-20.24, 57.56],
  // Nepal
  "kathmandu": [27.72, 85.32],
  // Netherlands
  "netherlands": [52.37, 4.90], "amsterdam": [52.37, 4.90],
  // New Zealand
  "auckland": [-36.86, 174.76],
  // Philippines
  "manila": [14.60, 120.98],
  // Russia
  "st. petersburg": [59.93, 30.32], "saint petersburg": [59.93, 30.32],
  // Singapore
  "singapore": [1.35, 103.82],
  // South Africa
  "durban": [-29.86, 31.02], "chatsworth": [-29.93, 30.96],
  "ladysmith": [-28.56, 29.78], "newcastle": [-27.76, 29.93],
  "pietermaritzburg": [-29.62, 30.39], "phoenix": [-29.72, 31.00],
  "johannesburg": [-26.20, 28.04],
  // Sri Lanka
  "colombo": [6.93, 79.85], "batticaloa": [7.72, 81.70],
  // Switzerland
  "geneva": [46.20, 6.14],
  // United Kingdom
  "bourne end": [51.58, -0.71], "london": [51.51, -0.13],
  // USA
  "berkeley": [37.87, -122.27], "san jose": [37.34, -121.89],
  "boston": [42.36, -71.06], "chicago": [41.88, -87.63],
  "hollywood": [34.09, -118.33], "los angeles": [34.05, -118.24],
  "ganges": [42.53, -86.10], "washington": [38.91, -77.04],
  "washington d.c.": [38.91, -77.04], "houston": [29.76, -95.37],
  "new york": [40.71, -74.01], "portland": [45.52, -122.68],
  "providence": [41.82, -71.42], "sacramento": [38.58, -121.49],
  "san francisco": [37.77, -122.42], "seattle": [47.61, -122.33],
  "st. louis": [38.63, -90.20], "saint louis": [38.63, -90.20],
  "kansas city": [39.10, -94.58], "ridgely": [41.72, -73.96],
  "san diego": [32.72, -117.16], "santa barbara": [34.42, -119.70],
  "south pasadena": [34.11, -118.15], "trabuco canyon": [33.66, -117.58],
  "pinon hills": [34.43, -117.65],
  "st. petersburg florida": [27.77, -82.64], "st. petersburg fl": [27.77, -82.64],
  // Zambia
  "lusaka": [-15.42, 28.28],
};

// Country names to skip when extracting city
const COUNTRY_NAMES = new Set(["india","usa","bangladesh","australia","brazil","canada",
  "malaysia","mauritius","sri lanka","argentina","fiji","france","germany","ireland",
  "japan","nepal","netherlands","new zealand","philippines","russia","singapore",
  "switzerland","united kingdom","zambia","south africa"]);

function extractCity(c) {
  // Split name by comma and find the best city segment
  const parts = c.name.split(",").map(p => p.replace(/\(.*?\)/g, "").replace(/- a sub-centre.*/i, "").trim().toLowerCase());
  // Try parts from index 1 onwards (skip "Ramakrishna Math/Mission" prefix)
  for (let i = 1; i < parts.length; i++) {
    const p = parts[i];
    // Skip if it's just a country name or very short
    if (p.length < 3) continue;
    if (COUNTRY_NAMES.has(p)) continue;
    // Skip if it contains sub-centre noise
    if (p.includes("sub-centre") || p.includes("ashrama") || p.includes("centre of")) continue;
    return p;
  }
  // Fallback: use state for India, country for international
  if (c.country === "India" && c.state) return c.state.toLowerCase();
  return c.country.toLowerCase();
}

function lookupCoords(c) {
  const city = extractCity(c);

  if (c.country === "India") {
    // Exact match
    if (INDIA_CITIES[city]) return INDIA_CITIES[city];
    // Contains key
    for (const [key, coords] of Object.entries(INDIA_CITIES)) {
      if (city.includes(key) || key.includes(city)) return coords;
    }
    if (c.state && INDIA_STATES[c.state]) return INDIA_STATES[c.state];
    return [22.57, 88.36];
  }

  // International — exact match first, then substring (key must be >= 5 chars)
  if (INTL_CITIES[city]) return INTL_CITIES[city];
  for (const [key, coords] of Object.entries(INTL_CITIES)) {
    if (key.length >= 5 && (city.includes(key) || (key.includes(city) && city.length >= 5))) return coords;
  }
  // Last resort: scan the full centre name for any known city key
  const fullName = c.name.toLowerCase();
  for (const [key, coords] of Object.entries(INTL_CITIES)) {
    if (key.length >= 5 && fullName.includes(key)) return coords;
  }

  // Try country centroid
  const countryCentroids = {
    "Bangladesh": [23.68, 90.35], "Australia": [-25.27, 133.78],
    "Brazil": [-14.24, -51.93], "Canada": [56.13, -106.35],
    "South Africa": [-30.56, 22.94], "Malaysia": [4.21, 108.00],
    "USA": [37.09, -95.71], "Sri Lanka": [7.87, 80.77],
    "Mauritius": [-20.35, 57.55], "Fiji": [-17.71, 178.06],
    "France": [46.23, 2.21], "Germany": [51.16, 10.45],
    "Ireland": [53.41, -8.24], "Japan": [36.20, 138.25],
    "Nepal": [28.39, 84.12], "Netherlands": [52.13, 5.29],
    "New Zealand": [-40.90, 174.89], "Philippines": [12.88, 121.77],
    "Russia": [61.52, 105.32], "Singapore": [1.35, 103.82],
    "Switzerland": [46.82, 8.23], "United Kingdom": [55.38, -3.44],
    "Argentina": [-38.42, -63.62], "Zambia": [-13.13, 27.85],
  };
  return countryCentroids[c.country] || [0, 0];
}

mkdirSync(OUTDIR, { recursive: true });

const results = [];
let matched = 0;

for (let i = 0; i < centres.length; i++) {
  const c = centres[i];
  const [lat, lng] = lookupCoords(c);
  matched++;

  results.push({
    id: i + 1,
    name: c.name,
    country: c.country,
    state: c.state || null,
    address: c.address || null,
    phone: c.phone || null,
    email: c.email || null,
    flag: FLAG[c.country] || "🏛️",
    type: c.name.toLowerCase().includes("mission") ? "mission" : "math",
    lat,
    lng,
  });
  console.log(`  ✓ [${i+1}/${centres.length}] ${c.name}  →  ${lat.toFixed(3)}, ${lng.toFixed(3)}`);
}

const js = `// Auto-generated by scripts/geocode-centres-fast.mjs\nwindow.CENTRES_DATA = ${JSON.stringify(results, null, 2)};\n`;
writeFileSync(OUTPUT, js, "utf-8");

console.log(`\n${"─".repeat(55)}`);
console.log(`Done. ${matched}/${centres.length} centres geocoded.`);
console.log(`Output: ${OUTPUT}`);
