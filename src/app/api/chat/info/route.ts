import { ensureDb } from "@/lib/init-db";
import db from "@/lib/db";
import { serviceHeaders, jsonResponse } from "@/lib/utils";

const SVC_NAME = "rag-chatbot";
const SVC_VERSION = "1.0.0";

export async function GET() {
  try {
    await ensureDb();

    const docCount = await db.execute(
      "SELECT COUNT(*) as count FROM knowledge_base WHERE is_active = 1"
    );
    const sessionCount = await db.execute(
      "SELECT COUNT(*) as count FROM chat_sessions"
    );

    return jsonResponse(
      {
        service: SVC_NAME,
        version: SVC_VERSION,
        description:
          "RAG Chatbot service for the Swami Vivekananda Museum. Ask questions about Vivekananda's life, teachings, and the museum.",
        endpoints: [
          { method: "POST", path: "/api/chat/query", description: "Ask a question" },
          { method: "POST", path: "/api/chat/upload", description: "Upload a document (admin)" },
          { method: "GET", path: "/api/chat/history/[sessionId]", description: "Get chat history" },
          { method: "GET", path: "/api/chat/health", description: "Health check" },
          { method: "GET", path: "/api/chat/info", description: "Service info" },
        ],
        stats: {
          active_documents: Number(docCount.rows[0].count),
          total_sessions: Number(sessionCount.rows[0].count),
        },
        deepseek_configured: !!process.env.DEEPSEEK_API_KEY,
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
