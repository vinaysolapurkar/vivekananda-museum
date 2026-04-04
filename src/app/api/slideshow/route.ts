import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function GET() {
  await ensureDb();
  const result = await db.execute({
    sql: "SELECT * FROM slideshow_images WHERE is_active = 1 ORDER BY sort_order ASC, id ASC",
    args: [],
  });
  return Response.json({ images: result.rows });
}

export async function POST(request: Request) {
  await ensureDb();
  const body = await request.json();
  const { title, description, station_number, sort_order } = body;

  const result = await db.execute({
    sql: `INSERT INTO slideshow_images (title, description, image_url, station_number, sort_order) 
          VALUES (?, ?, '', ?, ?)`,
    args: [title || "", description || "", station_number || null, sort_order || 0],
  });

  return Response.json({ id: Number(result.lastInsertRowid), success: true }, { status: 201 });
}
