import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function GET() {
  await ensureDb();
  // Return top-level categories (parent_id IS NULL).
  // `kind` = 'group' → holds sub-albums (child_count); 'album' → holds images (image_count).
  const cats = await db.execute({
    sql: `SELECT c.*,
          COUNT(DISTINCT i.id) as image_count,
          COUNT(DISTINCT ch.id) as child_count,
          COALESCE(
            NULLIF(c.cover_image_url, ''),
            (SELECT si.image_url FROM slideshow_images si
               WHERE si.category_id = c.id AND si.is_active = 1
               ORDER BY si.sort_order ASC, si.id ASC LIMIT 1),
            (SELECT si.image_url FROM slideshow_images si
               JOIN slideshow_categories cc ON cc.id = si.category_id
               WHERE cc.parent_id = c.id AND si.is_active = 1
               ORDER BY cc.sort_order ASC, si.sort_order ASC, si.id ASC LIMIT 1)
          ) as cover
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
  const { name, description, parent_id, kind } = await request.json();
  if (!name) return Response.json({ error: "name required" }, { status: 400 });

  const parentVal = parent_id ? Number(parent_id) : null;
  // Sub-categories are always albums (2-level model matches the kiosk viewer).
  const kindVal = parentVal ? "album" : kind === "group" ? "group" : "album";

  const max = await db.execute({
    sql: "SELECT COALESCE(MAX(sort_order),0) as m FROM slideshow_categories WHERE parent_id IS ?",
    args: [parentVal],
  });
  const nextOrder = Number(max.rows[0].m) + 1;

  const result = await db.execute({
    sql: "INSERT INTO slideshow_categories (name, description, sort_order, parent_id, kind) VALUES (?, ?, ?, ?, ?)",
    args: [name, description || "", nextOrder, parentVal, kindVal],
  });
  return Response.json({ id: Number(result.lastInsertRowid), success: true }, { status: 201 });
}
