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
    const { answers, visitor_name, question_ids } = body;

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

    // Fetch all questions with options for this quiz
    const questionsResult = await db.execute({
      sql: "SELECT id, options_en, correct_answer FROM questions WHERE quiz_id = ?",
      args: [quizId],
    });

    // If the client tells us which questions were actually shown (e.g. age-filtered
    // subsets), grade only that subset — otherwise grade the whole quiz.
    let gradedRows = questionsResult.rows;
    if (Array.isArray(question_ids) && question_ids.length > 0) {
      const idSet = new Set(question_ids.map((q: unknown) => Number(q)));
      const filtered = questionsResult.rows.filter((r) => idSet.has(Number(r.id)));
      if (filtered.length > 0) gradedRows = filtered;
    }

    const total = gradedRows.length;
    if (total === 0) {
      return errorResponse("Quiz has no questions", 400);
    }

    // Grade answers and collect correct answers for review
    let score = 0;
    const review: Array<{ question_id: number; correct_index: number; selected_index: number; correct: boolean }> = [];

    for (const row of gradedRows) {
      const questionId = String(row.id);
      const submittedIndex = answers[questionId];

      // Parse options (JSON or @@ delimited, tolerating legacy double-encoding)
      let options: string[] = [];
      const rawOptions = typeof row.options_en === "string" ? row.options_en : "";
      if (rawOptions) {
        try {
          let parsed: unknown = JSON.parse(rawOptions);
          if (typeof parsed === "string") parsed = JSON.parse(parsed);
          options = Array.isArray(parsed) ? parsed.map(String) : [];
        } catch { options = rawOptions.split("@@"); }
      }

      // Determine correct index: correct_answer can be an index (number) or text (string)
      let correctIndex: number;
      const correctVal = row.correct_answer;
      if (typeof correctVal === "number") {
        correctIndex = correctVal;
      } else {
        const parsed = Number(correctVal);
        if (!isNaN(parsed) && String(parsed) === String(correctVal)) {
          // It's a numeric string like "0", "1"
          correctIndex = parsed;
        } else {
          // It's the text of the correct option
          correctIndex = options.indexOf(correctVal as string);
        }
      }

      // Unanswered questions count as wrong (selected_index -1 in the review)
      const answered = submittedIndex !== undefined && submittedIndex !== null;
      const isCorrect = answered && Number(submittedIndex) === correctIndex;
      if (isCorrect) score++;

      review.push({
        question_id: Number(row.id),
        correct_index: correctIndex,
        selected_index: answered ? Number(submittedIndex) : -1,
        correct: isCorrect,
      });
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
        review,
      },
      200,
      headers
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
