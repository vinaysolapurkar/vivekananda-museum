import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import {
  getLang,
  localizedField,
  serviceHeaders,
  jsonResponse,
  errorResponse,
} from "@/lib/utils";

const headers = serviceHeaders("quiz-service", "1.0.0");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const lang = getLang(searchParams);

    const quizResult = await db.execute({
      sql: "SELECT * FROM quizzes WHERE id = ?",
      args: [Number(id)],
    });

    if (quizResult.rows.length === 0) {
      return errorResponse("Quiz not found", 404);
    }

    const quiz = quizResult.rows[0];

    const questionsResult = await db.execute({
      sql: "SELECT * FROM questions WHERE quiz_id = ? ORDER BY sort_order, id",
      args: [Number(id)],
    });

    const questions = questionsResult.rows.map((row) => {
      const rawOptions = localizedField(row, "options", lang) as string;
      let options: string[];
      try {
        options = JSON.parse(rawOptions);
      } catch {
        // Fallback: split by @@ delimiter
        options = rawOptions ? rawOptions.split("@@") : [];
      }

      return {
        id: row.id,
        question: localizedField(row, "question", lang),
        options,
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
