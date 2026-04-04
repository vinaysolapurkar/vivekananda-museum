import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ensureDb } from "@/lib/init-db";
import { serviceHeaders, jsonResponse, errorResponse } from "@/lib/utils";

const headers = serviceHeaders("kiosk-content", "1.0.0");

export async function GET() {
  try {
    await ensureDb();
    const result = await db.execute("SELECT * FROM kiosks ORDER BY id");
    return jsonResponse({ kiosks: result.rows }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}

export async function POST(request: Request) {
  try {
    await ensureDb();
    // const authError = await requireAdmin();
    // if (authError) return authError;

    const body = await request.json();
    const { name, location, screen_size, is_active } = body;

    if (!name) {
      return errorResponse("name is required");
    }

    const result = await db.execute({
      sql: `INSERT INTO kiosks (name, location, screen_size, is_active)
            VALUES (?, ?, ?, ?)`,
      args: [
        name,
        location || "",
        screen_size || "",
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
      ],
    });

    return jsonResponse(
      { id: Number(result.lastInsertRowid), message: "Kiosk created" },
      201,
      headers
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
