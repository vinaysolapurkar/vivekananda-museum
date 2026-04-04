import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { serviceHeaders, jsonResponse, errorResponse } from "@/lib/utils";

const headers = serviceHeaders("quiz-service", "1.0.0");

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    const { id } = await params;
    const quizId = Number(id);

    const body = await request.json();
    const { answers, visitor_name } = body;

    if (!answers || typeof answers !== "object") {
      return errorResponse("answers object is required");
    }
    if (!visitor_name) {
      return errorResponse("visitor_name is required");
    }

    // Fetch quiz
    const quizResult = await db.execute({
      sql: "SELECT * FROM quizzes WHERE id = ?",
      args: [quizId],
    });

    if (quizResult.rows.length === 0) {
      return errorResponse("Quiz not found", 404);
    }

    const quiz = quizResult.rows[0];

    // Fetch all questions for this quiz
    const questionsResult = await db.execute({
      sql: "SELECT id, correct_answer FROM questions WHERE quiz_id = ?",
      args: [quizId],
    });

    const total = questionsResult.rows.length;
    if (total === 0) {
      return errorResponse("Quiz has no questions", 400);
    }

    // Grade answers
    let score = 0;
    for (const row of questionsResult.rows) {
      const questionId = String(row.id);
      const submittedAnswer = answers[questionId];
      if (submittedAnswer !== undefined && submittedAnswer === row.correct_answer) {
        score++;
      }
    }

    const percentage = Math.round((score / total) * 100);
    const passingScore = quiz.passing_score as number;
    const passed = percentage >= passingScore;

    // Generate certificate URL placeholder and coupon code if passed
    let certificateUrl = "";
    let couponCode = "";
    if (passed) {
      couponCode = `VIVE-${Date.now().toString(36).toUpperCase()}`;
    }

    // Save attempt
    const attemptResult = await db.execute({
      sql: `INSERT INTO attempts (visitor_name, quiz_id, score, passed, certificate_url, coupon_code)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [visitor_name, quizId, score, passed ? 1 : 0, certificateUrl, couponCode],
    });

    const attemptId = Number(attemptResult.lastInsertRowid);

    // Set certificate URL now that we have the attempt ID
    if (passed) {
      certificateUrl = `/api/quiz/certificates/${attemptId}`;
      await db.execute({
        sql: "UPDATE attempts SET certificate_url = ? WHERE id = ?",
        args: [certificateUrl, attemptId],
      });
    }

    return jsonResponse(
      {
        score,
        total,
        percentage,
        passed,
        certificate_url: certificateUrl || null,
        attempt_id: attemptId,
      },
      200,
      headers
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
