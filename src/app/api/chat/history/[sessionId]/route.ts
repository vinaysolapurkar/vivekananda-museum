import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { serviceHeaders, jsonResponse } from "@/lib/utils";

const SVC_NAME = "rag-chatbot";
const SVC_VERSION = "1.0.0";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    await ensureDb();

    const { sessionId } = await params;

    // Verify session exists
    const session = await db.execute({
      sql: "SELECT id, language, started_at, ended_at FROM chat_sessions WHERE id = ?",
      args: [sessionId],
    });

    if (session.rows.length === 0) {
      return jsonResponse(
        { error: "Session not found" },
        404,
        serviceHeaders(SVC_NAME, SVC_VERSION)
      );
    }

    // Fetch messages
    const messages = await db.execute({
      sql: `SELECT id, role, input_text, input_lang, output_text, sources, created_at
            FROM chat_messages
            WHERE session_id = ?
            ORDER BY created_at ASC, id ASC`,
      args: [sessionId],
    });

    const formattedMessages = messages.rows.map((row) => ({
      id: row.id,
      role: row.role,
      input_text: row.input_text,
      input_lang: row.input_lang,
      output_text: row.output_text,
      sources: JSON.parse((row.sources as string) || "[]"),
      created_at: row.created_at,
    }));

    return jsonResponse(
      {
        session: session.rows[0],
        messages: formattedMessages,
      },
      200,
      serviceHeaders(SVC_NAME, SVC_VERSION)
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(
      { error: message },
      500,
      serviceHeaders(SVC_NAME, SVC_VERSION)
    );
  }
}
