import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;

  const cat = await db.execute({ sql: "SELECT * FROM letter_categories WHERE id = ?", args: [Number(id)] });
  if (cat.rows.length === 0) return Response.json({ error: "Not found" }, { status: 404 });

  const category = cat.rows[0];

  // A group category holds sub-collections; return its children (with letter
  // counts) even when empty so the admin can keep adding sub-collections.
  // Fall back to child-detection for legacy rows created before `kind` existed.
  const children = await db.execute({
    sql: `SELECT c.*, COUNT(l.id) as letter_count
          FROM letter_categories c
          LEFT JOIN letters l ON l.category_id = c.id AND l.is_active = 1
          WHERE c.parent_id = ? AND c.is_active = 1
          GROUP BY c.id ORDER BY c.sort_order ASC, c.id ASC`,
    args: [Number(id)],
  });

  const isGroup = category.kind === "group" || children.rows.length > 0;
  if (isGroup) {
    return Response.json({ category, children: children.rows });
  }

  const letters = await db.execute({
    sql: "SELECT * FROM letters WHERE category_id = ? AND is_active = 1 ORDER BY sort_order ASC, id ASC",
    args: [Number(id)],
  });

  return Response.json({ category, letters: letters.rows });
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
    await db.execute({ sql: `UPDATE letter_categories SET ${fields.join(", ")} WHERE id = ?`, args: args as (string | number | null)[] });
  }
  return Response.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;
  const catId = Number(id);

  // Collect this category plus any sub-collections (2-level model) so a group
  // and everything inside it is removed cleanly.
  const children = await db.execute({
    sql: "SELECT id FROM letter_categories WHERE parent_id = ?",
    args: [catId],
  });
  const ids = [catId, ...children.rows.map((r) => Number(r.id))];
  const placeholders = ids.map(() => "?").join(",");

  await db.execute({ sql: `DELETE FROM letters WHERE category_id IN (${placeholders})`, args: ids });
  await db.execute({ sql: `DELETE FROM letter_categories WHERE id IN (${placeholders})`, args: ids });
  return Response.json({ success: true });
}
