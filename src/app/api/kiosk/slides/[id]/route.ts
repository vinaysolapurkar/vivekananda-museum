import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ensureDb } from "@/lib/init-db";
import { serviceHeaders, jsonResponse, errorResponse } from "@/lib/utils";

const headers = serviceHeaders("kiosk-content", "1.0.0");

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;
    const body = await request.json();

    const fields: string[] = [];
    const args: (string | number | null)[] = [];

    const allowedFields = [
      "kiosk_id",
      "slide_number",
      "title_en",
      "title_kn",
      "title_hi",
      "content_en",
      "content_kn",
      "content_hi",
      "image_url",
      "duration_seconds",
      "sort_order",
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        fields.push(`${field} = ?`);
        args.push(body[field]);
      }
    }

    if (fields.length === 0) {
      return errorResponse("No fields to update");
    }

    fields.push("updated_at = datetime('now')");
    args.push(Number(id));

    await db.execute({
      sql: `UPDATE slides SET ${fields.join(", ")} WHERE id = ?`,
      args,
    });

    return jsonResponse({ message: "Slide updated" }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    const authError = await requireAdmin();
    if (authError) return authError;

    const { id } = await params;

    await db.execute({
      sql: "DELETE FROM slides WHERE id = ?",
      args: [Number(id)],
    });

    return jsonResponse({ message: "Slide deleted" }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
