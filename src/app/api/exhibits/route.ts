import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/utils";

export async function GET() {
  try {
    await ensureDb();
    const result = await db.execute(
      `SELECT e.*, COUNT(ei.id) as image_count
       FROM exhibits e
       LEFT JOIN exhibit_images ei ON ei.exhibit_id = e.id
       GROUP BY e.id
       ORDER BY e.sort_order, e.id`
    );
    return jsonResponse({ exhibits: result.rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}

export async function POST(request: Request) {
  try {
    const authError = await requireAdmin();
    if (authError) return authError;
    await ensureDb();

    const body = await request.json();
    const { name, description = "", kiosk_id = null, sort_order = 0 } = body;

    if (!name) return errorResponse("name is required");

    const result = await db.execute({
      sql: `INSERT INTO exhibits (name, description, kiosk_id, sort_order) VALUES (?, ?, ?, ?)`,
      args: [name, description, kiosk_id, sort_order],
    });

    return jsonResponse({ id: Number(result.lastInsertRowid), success: true }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
