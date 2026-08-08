import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function POST(request: Request) {
  await ensureDb();
  const { order } = await request.json();

  if (!Array.isArray(order)) {
    return Response.json({ error: "order must be an array of letter IDs" }, { status: 400 });
  }

  for (let i = 0; i < order.length; i++) {
    await db.execute({
      sql: "UPDATE letters SET sort_order = ? WHERE id = ?",
      args: [i + 1, Number(order[i])],
    });
  }

  return Response.json({ success: true, count: order.length });
}
