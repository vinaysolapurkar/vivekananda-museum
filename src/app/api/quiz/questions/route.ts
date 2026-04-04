import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ensureDb } from "@/lib/init-db";
import { serviceHeaders, jsonResponse, errorResponse } from "@/lib/utils";

const headers = serviceHeaders("quiz-service", "1.0.0");

export async function POST(request: Request) {
  try {
    await ensureDb();
    const authError = await requireAdmin();
    if (authError) return authError;

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
        JSON.stringify(options_en || []),
        JSON.stringify(options_kn || []),
        JSON.stringify(options_hi || []),
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
