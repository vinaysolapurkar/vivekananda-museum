import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function POST(request: Request) {
  await ensureDb();
  const { order } = await request.json();

  if (!Array.isArray(order)) {
    return Response.json({ error: "order must be an array of image IDs" }, { status: 400 });
  }

  // Update sort_order for each image
  for (let i = 0; i < order.length; i++) {
    await db.execute({
      sql: "UPDATE slideshow_images SET sort_order = ? WHERE id = ?",
      args: [i + 1, Number(order[i])],
    });
  }

  return Response.json({ success: true, count: order.length });
}
