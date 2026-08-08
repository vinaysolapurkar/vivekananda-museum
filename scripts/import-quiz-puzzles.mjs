/**
 * Import scripts/data/quiz-puzzle-images.json (the full Puzzle_Pictures set,
 * center-cropped to square and copied into public/images/puzzle/) as jigsaw
 * puzzle rows for quiz_id=1.
 *
 * Idempotent: skips any image_url that's already present for the quiz, so
 * it's safe to re-run against a DB that's already partially seeded —
 * including production Turso once TURSO_DATABASE_URL / TURSO_AUTH_TOKEN are
 * set in the environment.
 *
 * Run: node scripts/import-quiz-puzzles.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@libsql/client";

const QUIZ_ID = 1;

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const images = JSON.parse(
  readFileSync(new URL("./data/quiz-puzzle-images.json", import.meta.url), "utf-8")
);

async function main() {
  const existingResult = await db.execute({
    sql: "SELECT image_url FROM questions WHERE quiz_id = ? AND question_type = 'puzzle'",
    args: [QUIZ_ID],
  });
  const existing = new Set(existingResult.rows.map((r) => String(r.image_url)));

  const sortOrderResult = await db.execute({
    sql: "SELECT COALESCE(MAX(sort_order), 0) as maxOrder FROM questions WHERE quiz_id = ? AND question_type = 'puzzle'",
    args: [QUIZ_ID],
  });
  let sortOrder = Number(sortOrderResult.rows[0].maxOrder) || 0;

  let inserted = 0;
  let skipped = 0;

  for (const img of images) {
    if (existing.has(img.image_url)) {
      skipped++;
      continue;
    }
    sortOrder++;
    await db.execute({
      sql: `INSERT INTO questions (quiz_id, question_type, image_url, grid_size, sort_order)
            VALUES (?, 'puzzle', ?, ?, ?)`,
      args: [QUIZ_ID, img.image_url, img.grid_size, sortOrder],
    });
    existing.add(img.image_url);
    inserted++;
  }

  console.log(`Inserted ${inserted} puzzle images, skipped ${skipped} already-present duplicates.`);
}

main();
