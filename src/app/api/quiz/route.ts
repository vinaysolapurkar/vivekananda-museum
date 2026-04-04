import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ensureDb } from "@/lib/init-db";
import { serviceHeaders, jsonResponse, errorResponse } from "@/lib/utils";

const headers = serviceHeaders("quiz-service", "1.0.0");

export async function GET() {
  try {
    await ensureDb();
    const result = await db.execute(
      "SELECT * FROM quizzes ORDER BY created_at DESC"
    );
    return jsonResponse({ quizzes: result.rows }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}

export async function POST(request: Request) {
  try {
    await ensureDb();
    // const authError = await requireAdmin();
    // if (authError) return authError;

    const body = await request.json();
    const { title, language, time_limit_minutes, passing_score, is_active } =
      body;

    if (!title) {
      return errorResponse("title is required");
    }

    const result = await db.execute({
      sql: `INSERT INTO quizzes (title, language, time_limit_minutes, passing_score, is_active)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        title,
        language || "en",
        time_limit_minutes ?? 10,
        passing_score ?? 50,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
      ],
    });

    return jsonResponse(
      { id: Number(result.lastInsertRowid), message: "Quiz created" },
      201,
      headers
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
