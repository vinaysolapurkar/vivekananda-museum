import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/utils";

export async function GET() {
  try {
    await ensureDb();
    const result = await db.execute("SELECT * FROM travel_locations ORDER BY sort_order, id");
    return jsonResponse({ locations: result.rows });
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
    const { name, country, lat, lng, year = "", description = "", phase = "", sort_order = 0 } = body;

    if (!name || !country || lat === undefined || lng === undefined) {
      return errorResponse("name, country, lat, lng are required");
    }

    const result = await db.execute({
      sql: `INSERT INTO travel_locations (name, country, lat, lng, year, description, phase, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [name, country, lat, lng, year, description, phase, sort_order],
    });

    return jsonResponse({ id: Number(result.lastInsertRowid), success: true }, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
