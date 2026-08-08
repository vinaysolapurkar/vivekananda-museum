import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ensureDb } from "@/lib/init-db";
import {
  getLang,
  localizedField,
  serviceHeaders,
  jsonResponse,
  errorResponse,
} from "@/lib/utils";

const headers = serviceHeaders("quiz-service", "1.0.0");

// The quiz is always this fixed 10-slot shape: difficulty rises steadily,
// with a picture-jigsaw breather at slot 5 (3x3) and a harder one to close
// out at slot 10 (4x4). Which questions land in the MCQ slots — and their
// order within each difficulty run — is reshuffled on every attempt.
const SLOT_PLAN: Array<{ type: "mcq"; difficulty: "easy" | "medium" | "hard" } | { type: "puzzle"; gridSize: 3 | 4 }> = [
  { type: "mcq", difficulty: "easy" },
  { type: "mcq", difficulty: "easy" },
  { type: "mcq", difficulty: "medium" },
  { type: "mcq", difficulty: "medium" },
  { type: "puzzle", gridSize: 3 },
  { type: "mcq", difficulty: "medium" },
  { type: "mcq", difficulty: "hard" },
  { type: "mcq", difficulty: "hard" },
  { type: "mcq", difficulty: "hard" },
  { type: "puzzle", gridSize: 4 },
];

function parseOptions(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String);
  const str = typeof raw === "string" ? raw : "";
  if (!str) return [];
  try {
    let parsed: unknown = JSON.parse(str);
    if (typeof parsed === "string") parsed = JSON.parse(parsed); // legacy double-encoded
    if (Array.isArray(parsed)) return parsed.map(String);
    return [];
  } catch {
    return str.split("@@");
  }
}

// correct_answer may be stored as an index (number / numeric string) or as the answer text.
function correctIndexOf(correctVal: unknown, options: string[]): number {
  if (typeof correctVal === "number") return correctVal;
  const parsed = Number(correctVal);
  if (!isNaN(parsed) && String(parsed) === String(correctVal)) return parsed;
  return options.indexOf(String(correctVal));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Shuffles a pool but sorts items not shown last time ahead of items that
// were — so picking the first N items avoids yesterday's (or five-minutes-ago's)
// set whenever the pool is large enough to allow it, without ever leaving a
// slot empty just because everything happens to have been shown before.
function shuffleAvoidingRecent<T>(arr: T[], recentIds: Set<number>, idOf: (item: T) => number): T[] {
  const fresh = shuffle(arr.filter((item) => !recentIds.has(idOf(item))));
  const repeat = shuffle(arr.filter((item) => recentIds.has(idOf(item))));
  return [...fresh, ...repeat];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const lang = getLang(searchParams);
    const isAdminRequest = searchParams.get("admin") === "true";

    if (isAdminRequest) {
      const authError = await requireAdmin();
      if (authError) return authError;
    }

    const quizResult = await db.execute({
      sql: "SELECT * FROM quizzes WHERE id = ?",
      args: [Number(id)],
    });

    if (quizResult.rows.length === 0) {
      return errorResponse("Quiz not found", 404);
    }

    const quiz = quizResult.rows[0];

    if (isAdminRequest) {
      const allRows = await db.execute({
        sql: "SELECT * FROM questions WHERE quiz_id = ? ORDER BY question_type, difficulty, sort_order, id",
        args: [Number(id)],
      });
      const questions = allRows.rows.map((row) => {
        const optionsEn = parseOptions(row.options_en);
        return {
          id: row.id,
          quiz_id: row.quiz_id,
          question_type: row.question_type || "mcq",
          question_en: row.question_en,
          question_kn: row.question_kn,
          question_hi: row.question_hi,
          options: optionsEn,
          correct_answer: correctIndexOf(row.correct_answer, optionsEn),
          difficulty: row.difficulty,
          sort_order: row.sort_order,
          image_url: row.image_url || "",
          grid_size: row.grid_size || 0,
        };
      });
      return jsonResponse(
        {
          quiz: {
            title: quiz.title,
            time_limit_minutes: quiz.time_limit_minutes,
            passing_score: quiz.passing_score,
          },
          questions,
        },
        200,
        headers
      );
    }

    // ── Visitor-facing: assemble the fixed 10-slot progressive-difficulty
    // sequence, randomized within each difficulty tier / puzzle size, while
    // steering away from whatever the immediately preceding visitor was shown
    // (so back-to-back attempts on the same kiosk don't repeat). ──
    const mcqRows = await db.execute({
      sql: "SELECT * FROM questions WHERE quiz_id = ? AND (question_type = 'mcq' OR question_type IS NULL OR question_type = '')",
      args: [Number(id)],
    });
    const puzzleRows = await db.execute({
      sql: "SELECT * FROM questions WHERE quiz_id = ? AND question_type = 'puzzle'",
      args: [Number(id)],
    });

    const lastShownResult = await db.execute({
      sql: "SELECT question_ids FROM quiz_last_shown WHERE quiz_id = ?",
      args: [Number(id)],
    });
    let recentIds = new Set<number>();
    if (lastShownResult.rows.length > 0) {
      try {
        const parsed = JSON.parse(String(lastShownResult.rows[0].question_ids || "[]"));
        if (Array.isArray(parsed)) recentIds = new Set(parsed.map(Number));
      } catch {
        // Corrupt/empty — treat as no history
      }
    }

    const byDifficulty: Record<string, typeof mcqRows.rows> = { easy: [], medium: [], hard: [] };
    for (const row of mcqRows.rows) {
      const d = (row.difficulty as string) || "medium";
      if (!byDifficulty[d]) byDifficulty[d] = [];
      byDifficulty[d].push(row);
    }
    for (const d of Object.keys(byDifficulty)) {
      byDifficulty[d] = shuffleAvoidingRecent(byDifficulty[d], recentIds, (row) => Number(row.id));
    }

    const puzzlesBySize: Record<number, typeof puzzleRows.rows> = {};
    for (const row of puzzleRows.rows) {
      const g = Number(row.grid_size) || 0;
      if (!puzzlesBySize[g]) puzzlesBySize[g] = [];
      puzzlesBySize[g].push(row);
    }
    for (const g of Object.keys(puzzlesBySize)) {
      puzzlesBySize[Number(g)] = shuffleAvoidingRecent(puzzlesBySize[Number(g)], recentIds, (row) => Number(row.id));
    }

    const usedMcqIndex: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
    const usedPuzzleIndex: Record<number, number> = {};
    const questions: unknown[] = [];
    const shownIds: number[] = [];

    for (const slot of SLOT_PLAN) {
      if (slot.type === "mcq") {
        const pool = byDifficulty[slot.difficulty] || [];
        const idx = usedMcqIndex[slot.difficulty]++;
        const row = pool[idx];
        if (!row) continue; // not enough questions in this tier — skip gracefully
        questions.push({
          id: row.id,
          type: "mcq",
          difficulty: row.difficulty,
          question: localizedField(row, "question", lang),
          options: parseOptions(localizedField(row, "options", lang)),
        });
        shownIds.push(Number(row.id));
      } else {
        const pool = puzzlesBySize[slot.gridSize] || [];
        if (pool.length === 0) continue; // no puzzle image configured for this size — skip gracefully
        const idx = (usedPuzzleIndex[slot.gridSize] ?? 0) % pool.length;
        usedPuzzleIndex[slot.gridSize] = idx + 1;
        const row = pool[idx];
        questions.push({
          id: row.id,
          type: "puzzle",
          gridSize: slot.gridSize,
          image_url: row.image_url,
        });
        shownIds.push(Number(row.id));
      }
    }

    if (shownIds.length > 0) {
      await db.execute({
        sql: `INSERT INTO quiz_last_shown (quiz_id, question_ids, updated_at) VALUES (?, ?, datetime('now'))
              ON CONFLICT(quiz_id) DO UPDATE SET question_ids = excluded.question_ids, updated_at = excluded.updated_at`,
        args: [Number(id), JSON.stringify(shownIds)],
      });
    }

    return jsonResponse(
      {
        quiz: {
          title: quiz.title,
          time_limit_minutes: quiz.time_limit_minutes,
          passing_score: quiz.passing_score,
        },
        questions,
      },
      200,
      headers
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
