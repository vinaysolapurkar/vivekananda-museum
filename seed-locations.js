const Database = require('better-sqlite3');
const fs = require('fs');
const db = new Database('local.db');

const PHASE_MAP = {
  "p1": "Early Life & Indian Wandering",
  "p2": "First Western Tour",
  "p3": "Return to India & Mission Building",
  "p4": "Second Western Tour",
  "p5": "Final Years & Mahasamadhi",
};

// Load upstream locations
const raw = fs.readFileSync('/tmp/upstream_locations.json', 'utf-8');
const locations = JSON.parse(raw);

// Clear existing
db.prepare('DELETE FROM travel_locations').run();

const insert = db.prepare(`
  INSERT INTO travel_locations (name, country, lat, lng, year, description, phase, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const tx = db.transaction(() => {
  locations.forEach((loc, i) => {
    const phase = PHASE_MAP[loc.phase] || loc.phase;
    const name = loc.place ? `${loc.name} — ${loc.place}` : loc.name;
    const country = loc.city ? `${loc.city}, ${loc.country}` : loc.country;
    insert.run(
      name,
      country,
      loc.lat,
      loc.lng,
      loc.date || '',
      loc.desc || '',
      phase,
      i + 1
    );
  });
});

tx();
console.log(`Imported ${locations.length} locations from upstream VivekaDigvijaya repo.`);
db.close();
