import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function GET() {
  await ensureDb();
  const cats = await db.execute({
    sql: `SELECT c.*, COUNT(i.id) as image_count 
          FROM slideshow_categories c 
          LEFT JOIN slideshow_images i ON i.category_id = c.id AND i.is_active = 1
          GROUP BY c.id ORDER BY c.sort_order ASC, c.id ASC`,
    args: [],
  });
  return Response.json({ categories: cats.rows });
}

export async function POST(request: Request) {
  await ensureDb();
  const { name, description } = await request.json();
  if (!name) return Response.json({ error: "name required" }, { status: 400 });

  const max = await db.execute({ sql: "SELECT COALESCE(MAX(sort_order),0) as m FROM slideshow_categories", args: [] });
  const nextOrder = Number(max.rows[0].m) + 1;

  const result = await db.execute({
    sql: "INSERT INTO slideshow_categories (name, description, sort_order) VALUES (?, ?, ?)",
    args: [name, description || "", nextOrder],
  });
  return Response.json({ id: Number(result.lastInsertRowid), success: true }, { status: 201 });
}
