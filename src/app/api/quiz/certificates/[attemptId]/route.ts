import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { serviceHeaders, jsonResponse, errorResponse } from "@/lib/utils";

const headers = serviceHeaders("quiz-service", "1.0.0");

const VIVEKANANDA_QUOTES = [
  "Arise, awake, and stop not till the goal is reached.",
  "You cannot believe in God until you believe in yourself.",
  "In a conflict between the heart and the brain, follow your heart.",
  "The greatest religion is to be true to your own nature. Have faith in yourselves.",
  "All the powers in the universe are already ours. It is we who have put our hands before our eyes and cry that it is dark.",
];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ attemptId: string }> }
) {
  try {
    await ensureDb();
    const { attemptId } = await params;

    const attemptResult = await db.execute({
      sql: "SELECT * FROM attempts WHERE id = ?",
      args: [Number(attemptId)],
    });

    if (attemptResult.rows.length === 0) {
      return errorResponse("Attempt not found", 404);
    }

    const attempt = attemptResult.rows[0];

    if (!attempt.passed) {
      return errorResponse("No certificate available for failed attempts", 400);
    }

    // Fetch quiz title
    const quizResult = await db.execute({
      sql: "SELECT title FROM quizzes WHERE id = ?",
      args: [attempt.quiz_id],
    });

    const quizTitle =
      quizResult.rows.length > 0 ? quizResult.rows[0].title : "Unknown Quiz";

    const quote =
      VIVEKANANDA_QUOTES[
        Math.floor(Math.random() * VIVEKANANDA_QUOTES.length)
      ];

    return jsonResponse(
      {
        certificate: {
          visitor_name: attempt.visitor_name,
          quiz_title: quizTitle,
          score: attempt.score,
          date: attempt.attempted_at,
          coupon_code: attempt.coupon_code,
          quote,
        },
      },
      200,
      headers
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
