import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/utils";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const authError = await requireAdmin();
    // if (authError) return authError;
    await ensureDb();
    const { id } = await params;

    const exhibit = await db.execute({
      sql: "SELECT id FROM exhibits WHERE id = ?",
      args: [id],
    });
    if (exhibit.rows.length === 0) return errorResponse("Exhibit not found", 404);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = (formData.get("title") as string) || "";
    const description = (formData.get("description") as string) || "";
    const station_number = formData.get("station_number")
      ? Number(formData.get("station_number"))
      : null;

    if (!file) return errorResponse("file is required");

    const uploadDir = path.join(process.cwd(), "public", "uploads", "exhibits");
    await mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || ".jpg";
    const filename = `${id}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, filename);
    const bytes = new Uint8Array(await file.arrayBuffer());
    await writeFile(filePath, bytes);

    const imageUrl = `/uploads/exhibits/${filename}`;

    // Get next sort_order
    const maxOrder = await db.execute({
      sql: "SELECT COALESCE(MAX(sort_order), -1) as max_order FROM exhibit_images WHERE exhibit_id = ?",
      args: [id],
    });
    const sortOrder = (maxOrder.rows[0].max_order as number) + 1;

    const result = await db.execute({
      sql: `INSERT INTO exhibit_images (exhibit_id, image_url, title, description, station_number, sort_order)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [id, imageUrl, title, description, station_number, sortOrder],
    });

    return jsonResponse(
      { id: Number(result.lastInsertRowid), image_url: imageUrl, success: true },
      201
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
