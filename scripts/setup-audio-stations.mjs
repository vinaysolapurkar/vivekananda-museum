/**
 * Setup audio guide stations from the 5 RTF sections + 29 MP3 recordings.
 * 1. Deletes all existing stations
 * 2. Creates 29 stations with correct titles, gallery_zone (= RTF section), sort_order
 * 3. Copies each MP3 to public/uploads/audio/{n}/en.mp3 and updates DB
 *
 * Run from project root:  node scripts/setup-audio-stations.mjs
 */

import { copyFile, mkdir } from "fs/promises";
import { join } from "path";
import { createClient } from "@libsql/client";

const RECORDINGS_DIR = "/Users/anikethanrv/Data/Smaraka_Study_Centre_Library/Smaraka_Recordings/Final_Recordings";
const PROJECT_ROOT = process.cwd();

const db = createClient({ url: "file:local.db" });

// ── Station definitions ──────────────────────────────────────────────────────
// [ number, title_en, gallery_zone, mp3_filename ]
const stations = [
  // I. The Divine Prelude
  [1,  "Vision of Sri Ramakrishna about Narendra",          "I. The Divine Prelude",           "01_Sri_Ramakrishna_On_Narendra.mp3"],
  [2,  "Prayer of Bhuvaneshwari Devi for the Male Child",   "I. The Divine Prelude",           "02_Prayer_Of_Bhuvaneshwari_Devi_For_The_Male_Child.mp3"],
  [3,  "First Lessons At Mother's Knees",                   "I. The Divine Prelude",           "03_First_Lessons_At_Mothers_Knees.mp3"],
  [4,  "Narendra's Childhood and All-Round Personality",    "I. The Divine Prelude",           "04_Narendras_All_Round_Personality.mp3"],

  // II. The Master and the Disciple
  [5,  "Narendra's Meeting with Sri Ramakrishna",           "II. The Master and the Disciple", "05_Narendras_Meeting_With_Sri_Ramakrishna.mp3"],
  [6,  "Sri Ramakrishna and His Sadhanas",                  "II. The Master and the Disciple", "06_Sri_Ramakrishna_And_His_Sadhanas.mp3"],
  [7,  "Touch of the Master: Dissolution of the World",     "II. The Master and the Disciple", "07_Touch_Of_The_Master.mp3"],
  [8,  "Narendra Accepting Kali",                           "II. The Master and the Disciple", "08_Narendra_Accepting_Kali.mp3"],
  [9,  "Moulding Narendra: Shivajnane Jiva Seva",           "II. The Master and the Disciple", "09_Moulding_Narendra.mp3"],
  [10, "Power Transfer to Narendra at Kashipur",            "II. The Master and the Disciple", "10_Power_Transfer_At_Kashipur.mp3"],

  // III. The Preparation
  [11, "After the Passing: Baranagar Math",                 "III. The Preparation",            "11_Passing_Of_The_Master_Baranagar_Math.mp3"],
  [12, "Parivrajaka Life (The Wandering Monk)",             "III. The Preparation",            "12_Parivrajaka_Life.mp3"],
  [13, "Meeting with Sheshadri Iyer in Bangalore",          "III. The Preparation",            "13_Meeting_With_Sir_Sheshadri_Iyer_Bangalore.mp3"],

  // IV. The Mysore Journey
  [14, "Arrival in Mysore",                                 "IV. The Mysore Journey",          "14_Arrival_in_Mysore.mp3"],
  [15, "Sheshadri Bhavan Visit",                            "IV. The Mysore Journey",          "15_Sheshadri_Bhavan_Visit.mp3"],
  [16, "Arrival in Niranjana Mutt (Anathalaya)",            "IV. The Mysore Journey",          "16_Arrival_At_Niranjana_Mutt.mp3"],
  [17, "Swamiji Conversing with Children in Anathalaya",    "IV. The Mysore Journey",          "17_Swamiji_Conversing_With_Children_At_Anathalaya.mp3"],
  [18, "Meditation in the Shiva Temple at Niranjan Mutt",   "IV. The Mysore Journey",          "18_Meditation_At_Niranjana_Mutt.mp3"],
  [19, "Visit to Chamundi Hill and Her Darshan",            "IV. The Mysore Journey",          "19_Visit_To_Chamundi_Hill.mp3"],
  [20, "Visiting the Palace in a Tonga with Iyer",          "IV. The Mysore Journey",          "20_Visit_To_Mysore_Palace.mp3"],
  [21, "Meeting Maharaja Chamarajendra Wadiyar",            "IV. The Mysore Journey",          "21_Meeting_Chamarajendra_Wadiyar.mp3"],
  [22, "The Versatile Genius in Mysore",                    "IV. The Mysore Journey",          "22_The_Versatile_Genius_In_Mysore.mp3"],
  [23, "Farewell from Mysore",                              "IV. The Mysore Journey",          "23_Farewell_From_Mysore.mp3"],

  // V. The Global Conquest
  [24, "The Kanyakumari Incident",                          "V. The Global Conquest",          "24_The_Kanyakumari_Incident.mp3"],
  [25, "Receiving Letter of Permission from Sri Sharada Devi", "V. The Global Conquest",      "25_Letter_Of_Permission_Sharada_Devi.mp3"],
  [26, "Travel to America",                                 "V. The Global Conquest",          "26_Travel_To_America.mp3"],
  [27, "Challenges at Chicago and the Grand Success",       "V. The Global Conquest",          "27_Challenges_At_Chicago_And_Grand_Success.mp3"],
  [28, "Triumphant Return and Regeneration of India",       "V. The Global Conquest",          "28_Triumphant_Return.mp3"],
  [29, "Mahasamadhi and the Voice Without a Form",          "V. The Global Conquest",          "29_Mahasamadhi.mp3"],
];

// ── Step 1: Delete all existing stations ────────────────────────────────────
console.log("Step 1: Deleting existing stations...");
const existing = await db.execute("SELECT number FROM stations ORDER BY number");
console.log(`  Found ${existing.rows.length} existing stations: ${existing.rows.map(r => r.number).join(", ")}`);
await db.execute("DELETE FROM stations");
console.log("  ✓ All stations deleted\n");

// ── Step 2 + 3: Create stations and copy MP3s ────────────────────────────────
console.log("Step 2 & 3: Creating stations and copying audio files...");
let ok = 0, fail = 0;

for (const [num, title, zone, mp3] of stations) {
  const srcPath = join(RECORDINGS_DIR, mp3);
  const destDir = join(PROJECT_ROOT, "public", "uploads", "audio", String(num));
  const destPath = join(destDir, "en.mp3");
  const audioUrl = `/uploads/audio/${num}/en.mp3`;

  // Insert station
  await db.execute({
    sql: `INSERT INTO stations (number, title_en, title_kn, title_hi,
            description_en, description_kn, description_hi,
            audio_en_url, audio_kn_url, audio_hi_url,
            gallery_zone, sort_order)
          VALUES (?, ?, '', '', '', '', '', ?, '', '', ?, ?)`,
    args: [num, title, audioUrl, zone, num],
  });

  // Copy MP3
  try {
    await mkdir(destDir, { recursive: true });
    await copyFile(srcPath, destPath);
    console.log(`  ✓ [${String(num).padStart(2)}] ${title}`);
    ok++;
  } catch (err) {
    // Station created but file missing — clear the audio URL
    await db.execute({
      sql: "UPDATE stations SET audio_en_url = '' WHERE number = ?",
      args: [num],
    });
    console.log(`  ✗ [${String(num).padStart(2)}] ${title}  — file not found: ${mp3}`);
    fail++;
  }
}

console.log(`\n${'─'.repeat(55)}`);
console.log(`Done. ${ok} stations created with audio, ${fail} without.`);
console.log(`\nThe 5 gallery zones (section tabs in the audio guide):`);
const zones = [...new Set(stations.map(s => s[2]))];
zones.forEach(z => {
  const count = stations.filter(s => s[2] === z).length;
  console.log(`  ${z}  (${count} tracks)`);
});
