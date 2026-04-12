import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;

  const cat = await db.execute({ sql: "SELECT * FROM slideshow_categories WHERE id = ?", args: [Number(id)] });
  if (cat.rows.length === 0) return Response.json({ error: "Not found" }, { status: 404 });

  // If this is a group category, return its children with image counts
  const children = await db.execute({
    sql: `SELECT c.*, COUNT(i.id) as image_count
          FROM slideshow_categories c
          LEFT JOIN slideshow_images i ON i.category_id = c.id AND i.is_active = 1
          WHERE c.parent_id = ? AND c.is_active = 1
          GROUP BY c.id ORDER BY c.sort_order ASC, c.id ASC`,
    args: [Number(id)],
  });

  if (children.rows.length > 0) {
    return Response.json({ category: cat.rows[0], children: children.rows });
  }

  const images = await db.execute({
    sql: "SELECT * FROM slideshow_images WHERE category_id = ? AND is_active = 1 ORDER BY sort_order ASC, id ASC",
    args: [Number(id)],
  });

  return Response.json({ category: cat.rows[0], images: images.rows });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;
  const body = await request.json();
  
  const fields: string[] = [];
  const args: unknown[] = [];
  
  if (body.name !== undefined) { fields.push("name = ?"); args.push(body.name); }
  if (body.description !== undefined) { fields.push("description = ?"); args.push(body.description); }
  if (body.sort_order !== undefined) { fields.push("sort_order = ?"); args.push(body.sort_order); }
  if (body.is_active !== undefined) { fields.push("is_active = ?"); args.push(body.is_active); }
  if (body.cover_image_url !== undefined) { fields.push("cover_image_url = ?"); args.push(body.cover_image_url); }

  if (fields.length > 0) {
    args.push(Number(id));
    await db.execute({ sql: `UPDATE slideshow_categories SET ${fields.join(", ")} WHERE id = ?`, args: args as (string | number | null)[] });
  }
  return Response.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;
  await db.execute({ sql: "DELETE FROM slideshow_images WHERE category_id = ?", args: [Number(id)] });
  await db.execute({ sql: "DELETE FROM slideshow_categories WHERE id = ?", args: [Number(id)] });
  return Response.json({ success: true });
}
