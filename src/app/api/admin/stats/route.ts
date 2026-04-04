import { requireAdmin } from "@/lib/auth";
import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function GET() {
  // const authError = await requireAdmin();
  // if (authError) return authError;

  await ensureDb();

  try {
    const [stations, kiosks, questions, attemptsToday, chatSessions] =
      await Promise.all([
        db.execute("SELECT COUNT(*) as count FROM stations"),
        db.execute("SELECT COUNT(*) as count FROM kiosks"),
        db.execute("SELECT COUNT(*) as count FROM questions"),
        db.execute(
          "SELECT COUNT(*) as count FROM attempts WHERE date(attempted_at) = date('now')"
        ),
        db.execute("SELECT COUNT(*) as count FROM chat_sessions"),
      ]);

    return Response.json({
      stations: Number(stations.rows[0].count),
      kiosks: Number(kiosks.rows[0].count),
      questions: Number(questions.rows[0].count),
      attempts_today: Number(attemptsToday.rows[0].count),
      chat_sessions: Number(chatSessions.rows[0].count),
    });
  } catch {
    return Response.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
