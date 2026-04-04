import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/utils";

export async function PUT(request: Request) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;
    await ensureDb();

    const body = await request.json();
    const { image_ids } = body;

    if (!Array.isArray(image_ids)) return errorResponse("image_ids array is required");

    for (let i = 0; i < image_ids.length; i++) {
      await db.execute({
        sql: "UPDATE exhibit_images SET sort_order = ? WHERE id = ?",
        args: [i, image_ids[i]],
      });
    }

    return jsonResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
