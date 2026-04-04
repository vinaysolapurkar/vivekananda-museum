import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

// Log an analytics event
export async function POST(request: Request) {
  await ensureDb();
  const { event_type, module, item_id, item_name, metadata, visitor_id } = await request.json();

  await db.execute({
    sql: `INSERT INTO analytics_events (event_type, module, item_id, item_name, metadata, visitor_id) 
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      event_type || "view",
      module || "unknown",
      String(item_id || ""),
      item_name || "",
      JSON.stringify(metadata || {}),
      visitor_id || "",
    ],
  });

  return Response.json({ success: true });
}

// Get analytics summary
export async function GET(request: Request) {
  await ensureDb();
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "7d";

  let dateFilter = "datetime('now', '-7 days')";
  if (period === "24h") dateFilter = "datetime('now', '-1 day')";
  else if (period === "30d") dateFilter = "datetime('now', '-30 days')";
  else if (period === "all") dateFilter = "datetime('2020-01-01')";

  // Overall counts
  const totals = await db.execute({
    sql: `SELECT module, event_type, COUNT(*) as count 
          FROM analytics_events WHERE created_at > ${dateFilter}
          GROUP BY module, event_type ORDER BY count DESC`,
    args: [],
  });

  // Top viewed items per module
  const topItems = await db.execute({
    sql: `SELECT module, item_id, item_name, COUNT(*) as views 
          FROM analytics_events WHERE created_at > ${dateFilter} AND event_type = 'view'
          GROUP BY module, item_id ORDER BY views DESC LIMIT 20`,
    args: [],
  });

  // Daily activity
  const daily = await db.execute({
    sql: `SELECT DATE(created_at) as date, module, COUNT(*) as count 
          FROM analytics_events WHERE created_at > ${dateFilter}
          GROUP BY date, module ORDER BY date DESC`,
    args: [],
  });

  // Chat questions
  const chatQuestions = await db.execute({
    sql: `SELECT input_text as question, COUNT(*) as asked_count 
          FROM chat_messages WHERE role = 'user' AND created_at > ${dateFilter}
          GROUP BY input_text ORDER BY asked_count DESC LIMIT 20`,
    args: [],
  });

  // Quiz scores
  const quizScores = await db.execute({
    sql: `SELECT visitor_name, score, passed, attempted_at 
          FROM attempts WHERE attempted_at > ${dateFilter}
          ORDER BY attempted_at DESC LIMIT 20`,
    args: [],
  });

  // Category views
  const categoryViews = await db.execute({
    sql: `SELECT item_name, COUNT(*) as views 
          FROM analytics_events WHERE module = 'slideshow' AND event_type = 'view' AND created_at > ${dateFilter}
          GROUP BY item_name ORDER BY views DESC`,
    args: [],
  });

  // Slide views
  const slideViews = await db.execute({
    sql: `SELECT item_id, item_name, COUNT(*) as views 
          FROM analytics_events WHERE module = 'slideshow' AND event_type = 'slide_view' AND created_at > ${dateFilter}
          GROUP BY item_id ORDER BY views DESC LIMIT 20`,
    args: [],
  });

  return Response.json({
    period,
    totals: totals.rows,
    topItems: topItems.rows,
    daily: daily.rows,
    chatQuestions: chatQuestions.rows,
    quizScores: quizScores.rows,
    categoryViews: categoryViews.rows,
    slideViews: slideViews.rows,
  });
}
