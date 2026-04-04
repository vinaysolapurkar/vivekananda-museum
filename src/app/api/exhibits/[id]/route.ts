import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/utils";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    const { id } = await params;

    const exhibit = await db.execute({
      sql: "SELECT * FROM exhibits WHERE id = ?",
      args: [id],
    });

    if (exhibit.rows.length === 0) return errorResponse("Exhibit not found", 404);

    const images = await db.execute({
      sql: "SELECT * FROM exhibit_images WHERE exhibit_id = ? ORDER BY sort_order, id",
      args: [id],
    });

    return jsonResponse({ exhibit: exhibit.rows[0], images: images.rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // const authError = await requireAdmin();
    // if (authError) return authError;
    await ensureDb();
    const { id } = await params;

    const body = await request.json();
    const { name, description, kiosk_id, sort_order, is_active } = body;

    const fields: string[] = [];
    const args: (string | number | null)[] = [];

    if (name !== undefined) { fields.push("name = ?"); args.push(name); }
    if (description !== undefined) { fields.push("description = ?"); args.push(description); }
    if (kiosk_id !== undefined) { fields.push("kiosk_id = ?"); args.push(kiosk_id); }
    if (sort_order !== undefined) { fields.push("sort_order = ?"); args.push(sort_order); }
    if (is_active !== undefined) { fields.push("is_active = ?"); args.push(is_active); }

    if (fields.length === 0) return errorResponse("No fields to update");

    args.push(id);
    await db.execute({
      sql: `UPDATE exhibits SET ${fields.join(", ")} WHERE id = ?`,
      args,
    });

    return jsonResponse({ success: true });
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
    // const authError = await requireAdmin();
    // if (authError) return authError;
    await ensureDb();
    const { id } = await params;

    await db.execute({ sql: "DELETE FROM exhibit_images WHERE exhibit_id = ?", args: [id] });
    await db.execute({ sql: "DELETE FROM exhibits WHERE id = ?", args: [id] });

    return jsonResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
