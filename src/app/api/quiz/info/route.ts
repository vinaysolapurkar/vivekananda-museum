import { ensureDb } from "@/lib/init-db";
import db from "@/lib/db";
import { serviceHeaders, jsonResponse, errorResponse } from "@/lib/utils";

const headers = serviceHeaders("quiz-service", "1.0.0");

export async function GET() {
  try {
    await ensureDb();

    const quizCount = await db.execute("SELECT COUNT(*) as count FROM quizzes");
    const questionCount = await db.execute("SELECT COUNT(*) as count FROM questions");
    const attemptCount = await db.execute("SELECT COUNT(*) as count FROM attempts");

    return jsonResponse(
      {
        service: "quiz-service",
        version: "1.0.0",
        description: "Quiz & Certificate service for Vivekananda Museum",
        stats: {
          quizzes: quizCount.rows[0].count,
          questions: questionCount.rows[0].count,
          attempts: attemptCount.rows[0].count,
        },
        endpoints: [
          "GET  /api/quiz - List all quizzes",
          "POST /api/quiz - Create quiz (admin)",
          "GET  /api/quiz/:id/questions?lang=en - Get quiz questions",
          "POST /api/quiz/:id/submit - Submit quiz answers",
          "POST /api/quiz/questions - Create question (admin)",
          "GET  /api/quiz/certificates/:attemptId - Download certificate",
          "GET  /api/quiz/health - Health check",
          "GET  /api/quiz/info - Service info",
        ],
      },
      200,
      headers
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
