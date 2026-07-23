import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ensureDb } from "@/lib/init-db";
import { serviceHeaders, jsonResponse, errorResponse } from "@/lib/utils";

const headers = serviceHeaders("quiz-service", "1.0.0");

// Accepts an array, a JSON string, or undefined and always returns a clean JSON array string.
function normalizeOptions(value: unknown): string {
  if (Array.isArray(value)) return JSON.stringify(value.map(String));
  if (typeof value === "string") {
    try {
      let parsed: unknown = JSON.parse(value);
      if (typeof parsed === "string") parsed = JSON.parse(parsed); // legacy double-encoded
      if (Array.isArray(parsed)) return JSON.stringify(parsed.map(String));
    } catch {
      // not JSON — fall through
    }
    return JSON.stringify(value ? value.split("@@") : []);
  }
  return "[]";
}

export async function POST(request: Request) {
  try {
    await ensureDb();
    // const authError = await requireAdmin();
    // if (authError) return authError;

    const body = await request.json();
    const {
      quiz_id,
      question_en,
      question_kn,
      question_hi,
      options_en,
      options_kn,
      options_hi,
      correct_answer,
      difficulty,
      sort_order,
    } = body;

    if (!quiz_id) {
      return errorResponse("quiz_id is required");
    }
    if (!question_en) {
      return errorResponse("question_en is required");
    }
    if (correct_answer === undefined || correct_answer === null) {
      return errorResponse("correct_answer is required");
    }

    // Verify quiz exists
    const quizResult = await db.execute({
      sql: "SELECT id FROM quizzes WHERE id = ?",
      args: [Number(quiz_id)],
    });

    if (quizResult.rows.length === 0) {
      return errorResponse("Quiz not found", 404);
    }

    const result = await db.execute({
      sql: `INSERT INTO questions (quiz_id, question_en, question_kn, question_hi, options_en, options_kn, options_hi, correct_answer, difficulty, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        Number(quiz_id),
        question_en,
        question_kn || "",
        question_hi || "",
        normalizeOptions(options_en),
        normalizeOptions(options_kn),
        normalizeOptions(options_hi),
        correct_answer,
        difficulty || "medium",
        sort_order ?? 0,
      ],
    });

    return jsonResponse(
      { id: Number(result.lastInsertRowid), message: "Question created" },
      201,
      headers
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}

export async function PUT(request: Request) {
  try {
    await ensureDb();
    const authError = await requireAdmin();
    if (authError) return authError;

    const body = await request.json();
    const {
      id,
      question_en,
      question_kn,
      question_hi,
      options_en,
      options_kn,
      options_hi,
      correct_answer,
      difficulty,
      sort_order,
    } = body;

    if (!id) {
      return errorResponse("id is required");
    }

    const existing = await db.execute({
      sql: "SELECT * FROM questions WHERE id = ?",
      args: [Number(id)],
    });
    if (existing.rows.length === 0) {
      return errorResponse("Question not found", 404);
    }
    const row = existing.rows[0];

    // Only overwrite fields that were provided; keep existing values otherwise.
    await db.execute({
      sql: `UPDATE questions
            SET question_en = ?, question_kn = ?, question_hi = ?,
                options_en = ?, options_kn = ?, options_hi = ?,
                correct_answer = ?, difficulty = ?, sort_order = ?
            WHERE id = ?`,
      args: [
        question_en !== undefined ? question_en : (row.question_en as string),
        question_kn !== undefined ? question_kn : (row.question_kn as string),
        question_hi !== undefined ? question_hi : (row.question_hi as string),
        options_en !== undefined ? normalizeOptions(options_en) : (row.options_en as string),
        options_kn !== undefined ? normalizeOptions(options_kn) : (row.options_kn as string),
        options_hi !== undefined ? normalizeOptions(options_hi) : (row.options_hi as string),
        correct_answer !== undefined && correct_answer !== null
          ? correct_answer
          : (row.correct_answer as number),
        difficulty !== undefined ? difficulty : (row.difficulty as string),
        sort_order !== undefined ? sort_order : (row.sort_order as number),
        Number(id),
      ],
    });

    return jsonResponse({ id: Number(id), message: "Question updated" }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureDb();
    const authError = await requireAdmin();
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return errorResponse("id query parameter is required");
    }

    const existing = await db.execute({
      sql: "SELECT id FROM questions WHERE id = ?",
      args: [Number(id)],
    });
    if (existing.rows.length === 0) {
      return errorResponse("Question not found", 404);
    }

    await db.execute({ sql: "DELETE FROM questions WHERE id = ?", args: [Number(id)] });

    return jsonResponse({ id: Number(id), message: "Question deleted" }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
