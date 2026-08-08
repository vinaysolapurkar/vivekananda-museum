import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function GET() {
  await ensureDb();
  const result = await db.execute({
    sql: "SELECT * FROM letters WHERE is_active = 1 ORDER BY sort_order ASC, id ASC",
    args: [],
  });
  return Response.json({ letters: result.rows });
}

export async function POST(request: Request) {
  await ensureDb();
  const body = await request.json();
  const { title, recipient, sender, place, date_label, body: letterBody, category_id } = body;

  if (!category_id) return Response.json({ error: "category_id required" }, { status: 400 });
  if (!letterBody || !String(letterBody).trim()) return Response.json({ error: "Letter text is required" }, { status: 400 });

  const max = await db.execute({
    sql: "SELECT COALESCE(MAX(sort_order),0) as m FROM letters WHERE category_id = ?",
    args: [Number(category_id)],
  });
  const nextOrder = Number(max.rows[0].m) + 1;

  const result = await db.execute({
    sql: `INSERT INTO letters (category_id, title, recipient, sender, place, date_label, body, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      Number(category_id),
      title || "",
      recipient || "",
      sender || "Swami Vivekananda",
      place || "",
      date_label || "",
      letterBody,
      nextOrder,
    ],
  });

  return Response.json({ id: Number(result.lastInsertRowid), success: true }, { status: 201 });
}
