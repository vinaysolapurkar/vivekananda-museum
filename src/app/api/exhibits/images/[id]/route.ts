import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/utils";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;
    await ensureDb();
    const { id } = await params;

    const image = await db.execute({
      sql: "SELECT image_url FROM exhibit_images WHERE id = ?",
      args: [id],
    });

    if (image.rows.length > 0) {
      const imageUrl = image.rows[0].image_url as string;
      const filePath = path.join(process.cwd(), "public", imageUrl);
      try { await unlink(filePath); } catch {}
    }

    await db.execute({ sql: "DELETE FROM exhibit_images WHERE id = ?", args: [id] });

    return jsonResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
