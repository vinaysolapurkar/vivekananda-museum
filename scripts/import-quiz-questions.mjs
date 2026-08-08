/**
 * Import scripts/data/quiz-300-questions.json (parsed from the 300-question
 * quiz spreadsheet) into the questions table for quiz_id=1.
 *
 * Option order in the JSON is already shuffled at parse time (the source
 * spreadsheet always had the correct answer in option A) — this script
 * inserts options/correct_answer as-is, unchanged.
 *
 * Idempotent: skips any question whose text (case/whitespace-insensitive)
 * already exists in the quiz, so it's safe to re-run against a DB that's
 * already been partially or fully seeded — including production Turso once
 * TURSO_DATABASE_URL / TURSO_AUTH_TOKEN are set in the environment.
 *
 * Run: node scripts/import-quiz-questions.mjs
 */

import { readFileSync } from "fs";
import { createClient } from "@libsql/client";

const QUIZ_ID = 1;

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

const questions = JSON.parse(
  readFileSync(new URL("./data/quiz-300-questions.json", import.meta.url), "utf-8")
);

function norm(s) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

async function main() {
  const existingResult = await db.execute({
    sql: "SELECT question_en FROM questions WHERE quiz_id = ?",
    args: [QUIZ_ID],
  });
  const existing = new Set(existingResult.rows.map((r) => norm(String(r.question_en))));

  const sortOrderResult = await db.execute({
    sql: "SELECT COALESCE(MAX(sort_order), 0) as maxOrder FROM questions WHERE quiz_id = ? AND question_type = 'mcq'",
    args: [QUIZ_ID],
  });
  let sortOrder = Number(sortOrderResult.rows[0].maxOrder) || 0;

  let inserted = 0;
  let skipped = 0;

  for (const q of questions) {
    if (existing.has(norm(q.question))) {
      skipped++;
      continue;
    }
    sortOrder++;
    await db.execute({
      sql: `INSERT INTO questions (quiz_id, question_en, options_en, correct_answer, difficulty, sort_order, question_type)
            VALUES (?, ?, ?, ?, ?, ?, 'mcq')`,
      args: [QUIZ_ID, q.question, JSON.stringify(q.options), q.correct_index, q.difficulty, sortOrder],
    });
    existing.add(norm(q.question));
    inserted++;
  }

  console.log(`Inserted ${inserted} questions, skipped ${skipped} already-present duplicates.`);
}

main();
