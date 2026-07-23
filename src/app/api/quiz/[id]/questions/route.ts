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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const lang = getLang(searchParams);
    const age = searchParams.get("age");
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

    // Filter questions by age: children (<=12) get easy+medium, teens get all, adults get medium+hard
    let difficultyFilter = "";
    if (age && !isAdminRequest) {
      const ageNum = Number(age);
      if (ageNum <= 12) {
        difficultyFilter = " AND difficulty IN ('easy', 'medium')";
      } else if (ageNum >= 18) {
        difficultyFilter = " AND difficulty IN ('medium', 'hard')";
      }
      // teens (13-17) get all questions
    }

    const questionsResult = await db.execute({
      sql: `SELECT * FROM questions WHERE quiz_id = ?${difficultyFilter} ORDER BY sort_order, id`,
      args: [Number(id)],
    });

    const questions = questionsResult.rows.map((row) => {
      const options = parseOptions(localizedField(row, "options", lang));

      if (isAdminRequest) {
        const optionsEn = parseOptions(row.options_en);
        return {
          id: row.id,
          quiz_id: row.quiz_id,
          question_en: row.question_en,
          question_kn: row.question_kn,
          question_hi: row.question_hi,
          options: optionsEn,
          correct_answer: correctIndexOf(row.correct_answer, optionsEn),
          difficulty: row.difficulty,
          sort_order: row.sort_order,
        };
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
