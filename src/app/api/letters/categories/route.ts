import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function GET() {
  await ensureDb();
  // Return top-level categories (parent_id IS NULL).
  // `kind` = 'group' → holds sub-collections (child_count); 'collection' → holds letters (letter_count).
  const cats = await db.execute({
    sql: `SELECT c.*,
          COUNT(DISTINCT l.id) as letter_count,
          COUNT(DISTINCT ch.id) as child_count
          FROM letter_categories c
          LEFT JOIN letters l ON l.category_id = c.id AND l.is_active = 1
          LEFT JOIN letter_categories ch ON ch.parent_id = c.id AND ch.is_active = 1
          WHERE c.parent_id IS NULL AND c.is_active = 1
          GROUP BY c.id ORDER BY c.sort_order ASC, c.id ASC`,
    args: [],
  });
  return Response.json({ categories: cats.rows });
}

export async function POST(request: Request) {
  await ensureDb();
  const { name, description, parent_id, kind, cover_image_url } = await request.json();
  if (!name) return Response.json({ error: "name required" }, { status: 400 });

  const parentVal = parent_id ? Number(parent_id) : null;
  // Sub-categories are always collections (2-level model matches the kiosk viewer).
  const kindVal = parentVal ? "collection" : kind === "group" ? "group" : "collection";

  const max = await db.execute({
    sql: "SELECT COALESCE(MAX(sort_order),0) as m FROM letter_categories WHERE parent_id IS ?",
    args: [parentVal],
  });
  const nextOrder = Number(max.rows[0].m) + 1;

  const result = await db.execute({
    sql: "INSERT INTO letter_categories (name, description, sort_order, parent_id, kind, cover_image_url) VALUES (?, ?, ?, ?, ?, ?)",
    args: [name, description || "", nextOrder, parentVal, kindVal, cover_image_url || ""],
  });
  return Response.json({ id: Number(result.lastInsertRowid), success: true }, { status: 201 });
}
