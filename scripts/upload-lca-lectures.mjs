/**
 * One-time upload script: Lectures from Colombo to Almora
 * Uses only Node.js built-ins (no npm install needed).
 *
 * Run from project root:  node scripts/upload-lca-lectures.mjs
 * Requires dev server running at http://localhost:3000
 */

import { readFileSync, statSync } from "fs";
import { join } from "path";

const BASE_URL = "http://localhost:3000";
const SLIDES_DIR = "/Users/anikethanrv/Downloads/LCA Slide Deck";
const PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

const lectures = [
  { num: "01", file: "01-First Public Lecture in The East-India's_Spiritual_Mission.pptx",                                      name: "First Public Lecture in The East" },
  { num: "02", file: "02-Vedantism-The_Vedantic_Philosophy.pptx",                                                               name: "Vedantism" },
  { num: "03", file: "03-Reply to the address at the Pamban-India_s_Spiritual_Mission.pptx",                                    name: "Reply to Address at the Pamban" },
  { num: "04", file: "04-Address at the Rameshwaram Temple-The_Essence_of_Real_Worship.pptx",                                   name: "Address at the Rameshwaram Temple" },
  { num: "05", file: "05-Reply to the address at Ramnad-India_s_Spiritual_Awakening.pptx",                                      name: "Reply to Address at Ramnad" },
  { num: "06", file: "06-REPLY TO THE ADDRESS OF WELCOME AT PARAMAKUDI-Architects_of_Destiny.pptx",                             name: "Reply to Address at Paramakudi" },
  { num: "07", file: "07-REPLY TO THE ADDRESS OF WELCOME AT SHIVA GANGA & MANAMADURA-India_s_Spiritual_Awakening.pptx",         name: "Reply to Address at Shiva Ganga & Manamadura" },
  { num: "08", file: "08-REPLY TO THE ADDRESS OF WELCOME AT MADURA [1]-Vivekananda_s_Madura_Vision.pptx",                      name: "Reply to Address at Madura" },
  { num: "09", file: "09-THE MISSION OF THE VEDĀNTA.pptx",                                                                     name: "The Mission of the Vedanta" },
  { num: "10", file: "10-REPLY TO THE ADDRESS OF WELCOME AT MADRAS-India_s_Spiritual_Bedrock.pptx",                             name: "Reply to Address at Madras" },
  { num: "11", file: "11-MY PLAN OF CAMPAIGN.pptx",                                                                             name: "My Plan of Campaign" },
  { num: "12", file: "12-VEDĀNTA IN ITS APPLICATION TO INDIAN LIFE.pptx",                                                      name: "Vedanta in Its Application to Indian Life" },
  { num: "13", file: "13-THE SAGES OF INDIA.pptx",                                                                              name: "The Sages of India" },
  { num: "14", file: "14-THE WORK BEFORE US.pptx",                                                                              name: "The Work Before Us" },
  { num: "15", file: "15-THE FUTURE OF INDIA.pptx",                                                                             name: "The Future of India" },
  { num: "16", file: "16-ON CHARITY.pptx",                                                                                      name: "On Charity" },
  { num: "17", file: "17-ADDRESS OF WELCOME PRESENTED AT CALCUTTA AND REPLY.pptx",                                              name: "Address of Welcome at Calcutta and Reply" },
  { num: "18", file: "18-THE VEDĀNTA IN ALL ITS PHASES.pptx",                                                                   name: "The Vedanta in All Its Phases" },
  { num: "19", file: "19-ADDRESS OF WELCOME AT ALMORA AND REPLY.pptx",                                                          name: "Address of Welcome at Almora and Reply" },
  { num: "20", file: "20 VEDIC TEACHING IN THEORY AND PRACTICE.pptx",                                                           name: "Vedic Teaching in Theory and Practice" },
  { num: "21", file: "21-BHAKTI.pptx",                                                                                          name: "Bhakti" },
  { num: "22", file: "22-THE COMMON BASES OF HINDUISM.pptx",                                                                    name: "The Common Bases of Hinduism" },
  { num: "23", file: "23-BHAKTI.pptx",                                                                                          name: "Bhakti (Lecture 2)" },
  { num: "24", file: "24-THE VEDĀNTA.pptx",                                                                                     name: "The Vedanta" },
  { num: "25", file: "25-VEDANTISM.pptx",                                                                                       name: "Vedantism (Lecture 2)" },
  { num: "26", file: "26-THE INFLUENCE OF INDIAN SPIRITUAL THOUGHT IN ENGLAND.pptx",                                            name: "Influence of Indian Spiritual Thought in England" },
  { num: "27", file: "27 SANNYĀSA ITS IDEAL AND PRACTICE.pptx",                                                                 name: "Sannyasa: Its Ideal and Practice" },
  { num: "28", file: "28-WHAT HAVE I LEARNT.pptx",                                                                              name: "What Have I Learnt" },
  { num: "29", file: "29-THE RELIGION WE ARE BORN IN.pptx",                                                                     name: "The Religion We Are Born In" },
];

// Step 1: Create parent category
console.log("Creating parent category...");
const parentRes = await fetch(`${BASE_URL}/api/slideshow/categories`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Lectures from Colombo to Almora",
    description: "Series of lectures delivered by Swami Vivekananda upon his return to India",
  }),
});
const parentData = await parentRes.json();
if (!parentData.id) {
  console.error("Failed to create parent category:", parentData);
  process.exit(1);
}
const parentId = parentData.id;
console.log(`  ✓ Parent category created (id=${parentId})\n`);

// Step 2 + 3: For each lecture, create child category then upload PPTX
let successCount = 0;
let failCount = 0;

for (const lecture of lectures) {
  const filePath = join(SLIDES_DIR, lecture.file);

  // Check file exists
  try {
    statSync(filePath);
  } catch {
    console.error(`  ✗ [${lecture.num}] File not found: ${lecture.file}`);
    failCount++;
    continue;
  }

  // Create child category
  const catRes = await fetch(`${BASE_URL}/api/slideshow/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: `${lecture.num}. ${lecture.name}`,
      description: "",
      parent_id: parentId,
    }),
  });
  const catData = await catRes.json();
  if (!catData.id) {
    console.error(`  ✗ [${lecture.num}] Failed to create category:`, catData);
    failCount++;
    continue;
  }

  // Upload PPTX using built-in FormData + File
  process.stdout.write(`  [${lecture.num}/29] Uploading "${lecture.name}"... `);
  const buffer = readFileSync(filePath);
  const blob = new Blob([buffer], { type: PPTX_MIME });
  const file = new File([blob], lecture.file, { type: PPTX_MIME });

  const form = new FormData();
  form.set("file", file);
  form.set("category_id", String(catData.id));
  form.set("duration_seconds", "8");
  form.set("crop_bottom", "1");

  try {
    const uploadRes = await fetch(`${BASE_URL}/api/slideshow/upload-pptx`, {
      method: "POST",
      body: form,
    });
    const uploadData = await uploadRes.json();

    if (uploadData.success) {
      console.log(`✓  ${uploadData.slides_extracted} slides`);
      successCount++;
    } else {
      console.log(`✗  ${JSON.stringify(uploadData)}`);
      failCount++;
    }
  } catch (err) {
    console.log(`✗  ${err.message}`);
    failCount++;
  }
}

console.log(`\n${'─'.repeat(50)}`);
console.log(`Done. ${successCount}/29 lectures uploaded, ${failCount} failed.`);
