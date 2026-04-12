import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function GET() {
  await ensureDb();
  // Only return top-level categories (parent_id IS NULL)
  // child_count > 0 means it's a group; image_count for leaf categories
  const cats = await db.execute({
    sql: `SELECT c.*,
          COUNT(DISTINCT i.id) as image_count,
          COUNT(DISTINCT ch.id) as child_count
          FROM slideshow_categories c
          LEFT JOIN slideshow_images i ON i.category_id = c.id AND i.is_active = 1
          LEFT JOIN slideshow_categories ch ON ch.parent_id = c.id AND ch.is_active = 1
          WHERE c.parent_id IS NULL AND c.is_active = 1
          GROUP BY c.id ORDER BY c.sort_order ASC, c.id ASC`,
    args: [],
  });
  return Response.json({ categories: cats.rows });
}

export async function POST(request: Request) {
  await ensureDb();
  const { name, description, parent_id } = await request.json();
  if (!name) return Response.json({ error: "name required" }, { status: 400 });

  const parentVal = parent_id ? Number(parent_id) : null;
  const max = await db.execute({
    sql: "SELECT COALESCE(MAX(sort_order),0) as m FROM slideshow_categories WHERE parent_id IS ?",
    args: [parentVal],
  });
  const nextOrder = Number(max.rows[0].m) + 1;

  const result = await db.execute({
    sql: "INSERT INTO slideshow_categories (name, description, sort_order, parent_id) VALUES (?, ?, ?, ?)",
    args: [name, description || "", nextOrder, parentVal],
  });
  return Response.json({ id: Number(result.lastInsertRowid), success: true }, { status: 201 });
}
