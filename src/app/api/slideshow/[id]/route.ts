import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;
  const body = await request.json();
  const { title, description, station_number, sort_order, is_active, duration_seconds, crop_bottom } = body;

  await db.execute({
    sql: `UPDATE slideshow_images SET
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          station_number = COALESCE(?, station_number),
          sort_order = COALESCE(?, sort_order),
          is_active = COALESCE(?, is_active),
          duration_seconds = COALESCE(?, duration_seconds),
          crop_bottom = COALESCE(?, crop_bottom)
          WHERE id = ?`,
    args: [title, description, station_number, sort_order, is_active, duration_seconds, crop_bottom !== undefined ? crop_bottom : null, Number(id)],
  });

  return Response.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;
  await db.execute({ sql: "DELETE FROM slideshow_images WHERE id = ?", args: [Number(id)] });
  return Response.json({ success: true });
}
