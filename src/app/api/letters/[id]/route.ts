import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;
  const body = await request.json();
  const { title, recipient, sender, place, date_label, body: letterBody, sort_order, is_active } = body;

  await db.execute({
    sql: `UPDATE letters SET
          title = COALESCE(?, title),
          recipient = COALESCE(?, recipient),
          sender = COALESCE(?, sender),
          place = COALESCE(?, place),
          date_label = COALESCE(?, date_label),
          body = COALESCE(?, body),
          sort_order = COALESCE(?, sort_order),
          is_active = COALESCE(?, is_active)
          WHERE id = ?`,
    args: [
      title, recipient, sender, place, date_label, letterBody, sort_order,
      is_active !== undefined ? is_active : null,
      Number(id),
    ],
  });

  return Response.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await ensureDb();
  const { id } = await params;
  await db.execute({ sql: "DELETE FROM letters WHERE id = ?", args: [Number(id)] });
  return Response.json({ success: true });
}
