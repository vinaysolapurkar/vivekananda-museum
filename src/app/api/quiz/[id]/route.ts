import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ensureDb } from "@/lib/init-db";
import { serviceHeaders, jsonResponse, errorResponse } from "@/lib/utils";

const headers = serviceHeaders("quiz-service", "1.0.0");

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;
    const quizId = Number(id);
    const body = await request.json();
    const { title, time_limit_minutes, passing_score, is_active } = body;

    if (!title) {
      return errorResponse("title is required");
    }

    const existing = await db.execute({
      sql: "SELECT id FROM quizzes WHERE id = ?",
      args: [quizId],
    });
    if (existing.rows.length === 0) {
      return errorResponse("Quiz not found", 404);
    }

    await db.execute({
      sql: `UPDATE quizzes
            SET title = ?, time_limit_minutes = ?, passing_score = ?, is_active = ?, updated_at = datetime('now')
            WHERE id = ?`,
      args: [
        title,
        time_limit_minutes ?? 10,
        passing_score ?? 50,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        quizId,
      ],
    });

    return jsonResponse({ id: quizId, message: "Quiz updated" }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;
    const quizId = Number(id);

    const existing = await db.execute({
      sql: "SELECT id FROM quizzes WHERE id = ?",
      args: [quizId],
    });
    if (existing.rows.length === 0) {
      return errorResponse("Quiz not found", 404);
    }

    // Explicit cleanup (FK cascade is not guaranteed to be enabled in SQLite/LibSQL)
    await db.execute({ sql: "DELETE FROM questions WHERE quiz_id = ?", args: [quizId] });
    await db.execute({ sql: "DELETE FROM attempts WHERE quiz_id = ?", args: [quizId] });
    await db.execute({ sql: "DELETE FROM quizzes WHERE id = ?", args: [quizId] });

    return jsonResponse({ id: quizId, message: "Quiz deleted" }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
