import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { serviceHeaders, jsonResponse, errorResponse } from "@/lib/utils";

const headers = serviceHeaders("quiz-service", "1.0.0");

function parseOptions(raw: unknown): string[] {
  const str = typeof raw === "string" ? raw : "";
  if (!str) return [];
  try {
    let parsed: unknown = JSON.parse(str);
    if (typeof parsed === "string") parsed = JSON.parse(parsed);
    if (Array.isArray(parsed)) return parsed.map(String);
    return [];
  } catch {
    return str.split("@@");
  }
}

function correctIndexOf(correctVal: unknown, options: string[]): number {
  if (typeof correctVal === "number") return correctVal;
  const parsed = Number(correctVal);
  if (!isNaN(parsed) && String(parsed) === String(correctVal)) return parsed;
  return options.indexOf(String(correctVal));
}

// Visitor-facing: given a question + a selected option index, reports whether
// it's correct. Kept as a separate round-trip (rather than shipping every
// correct_answer in the question payload) so the answer key isn't sitting in
// the page's JS state before the visitor has actually answered.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    const { id } = await params;
    const body = await request.json();
    const { question_id, selected_index } = body;

    if (question_id === undefined || selected_index === undefined) {
      return errorResponse("question_id and selected_index are required");
    }

    const result = await db.execute({
      sql: "SELECT id, options_en, correct_answer FROM questions WHERE id = ? AND quiz_id = ?",
      args: [Number(question_id), Number(id)],
    });

    if (result.rows.length === 0) {
      return errorResponse("Question not found", 404);
    }

    const row = result.rows[0];
    const options = parseOptions(row.options_en);
    const correctIndex = correctIndexOf(row.correct_answer, options);
    const correct = Number(selected_index) === correctIndex;

    return jsonResponse({ correct, correct_index: correctIndex }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
