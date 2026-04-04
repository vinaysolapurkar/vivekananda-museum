import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { serviceHeaders, jsonResponse, errorResponse } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

const SVC_NAME = "rag-chatbot";
const SVC_VERSION = "1.0.0";

export async function POST(request: Request) {
  try {
    await ensureDb();

    const body = await request.json();
    const { question, lang = "en", session_id } = body;

    if (!question || typeof question !== "string") {
      return errorResponse("question is required");
    }

    // Resolve or create session
    let sessionId = session_id;
    if (!sessionId) {
      sessionId = uuidv4();
      await db.execute({
        sql: "INSERT INTO chat_sessions (id, language, started_at) VALUES (?, ?, datetime('now'))",
        args: [sessionId, lang],
      });
    }

    // Extract keywords from the question for LIKE-based search
    const keywords = question
      .toLowerCase()
      .split(/\s+/)
      .filter((w: string) => w.length > 2)
      .slice(0, 10);

    // Search knowledge_base for relevant content
    let matchedDocs: Array<{
      id: number;
      title: string;
      content: string;
    }> = [];

    if (keywords.length > 0) {
      const likeClauses = keywords.map(() => "LOWER(content) LIKE ?");
      const likeArgs = keywords.map((kw: string) => `%${kw}%`);

      const result = await db.execute({
        sql: `SELECT id, title, content FROM knowledge_base
              WHERE is_active = 1 AND (${likeClauses.join(" OR ")})
              LIMIT 5`,
        args: likeArgs,
      });

      matchedDocs = result.rows.map((row) => ({
        id: row.id as number,
        title: row.title as string,
        content: row.content as string,
      }));
    }

    // Build sources list
    const sources = matchedDocs.map((doc) => ({
      id: doc.id,
      title: doc.title,
    }));

    let answer: string;

    if (process.env.DEEPSEEK_API_KEY) {
      // Build context from matched docs
      const context = matchedDocs
        .map((doc) => `[${doc.title}]\n${doc.content}`)
        .join("\n\n---\n\n");

      const systemPrompt = `You are a knowledgeable guide for the Swami Vivekananda Museum. Answer questions about Swami Vivekananda, his life, teachings, and the museum using the provided context. Respond in ${lang === "kn" ? "Kannada" : lang === "hi" ? "Hindi" : "English"}. If the context does not contain enough information, say so politely.`;

      const userPrompt = context
        ? `Context:\n${context}\n\nQuestion: ${question}`
        : question;

      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 1024,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        answer =
          data.choices?.[0]?.message?.content ||
          "I could not generate a response.";
      } else {
        // Fallback if API call fails
        answer = matchedDocs.length
          ? matchedDocs.map((d) => d.content).join("\n\n")
          : "I could not find relevant information. Please try rephrasing your question.";
      }
    } else {
      // No API key - return matched context directly
      if (matchedDocs.length > 0) {
        answer = matchedDocs
          .map((doc) => `**${doc.title}**\n${doc.content}`)
          .join("\n\n---\n\n");
      } else {
        answer =
          "I could not find relevant information in the knowledge base. Please try rephrasing your question.";
      }
    }

    // Save user message
    await db.execute({
      sql: `INSERT INTO chat_messages (session_id, role, input_text, input_lang, output_text, sources, created_at)
            VALUES (?, 'user', ?, ?, '', '[]', datetime('now'))`,
      args: [sessionId, question, lang],
    });

    // Save assistant response
    await db.execute({
      sql: `INSERT INTO chat_messages (session_id, role, input_text, input_lang, output_text, sources, created_at)
            VALUES (?, 'assistant', '', ?, ?, ?, datetime('now'))`,
      args: [sessionId, lang, answer, JSON.stringify(sources)],
    });

    return jsonResponse(
      { answer, sources, session_id: sessionId },
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
