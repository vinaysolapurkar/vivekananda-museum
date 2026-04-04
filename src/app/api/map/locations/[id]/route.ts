import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { requireAdmin } from "@/lib/auth";
import { jsonResponse, errorResponse } from "@/lib/utils";

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
    const { name, country, lat, lng, year, description, phase, sort_order } = body;

    const fields: string[] = [];
    const args: (string | number | null)[] = [];

    if (name !== undefined) { fields.push("name = ?"); args.push(name); }
    if (country !== undefined) { fields.push("country = ?"); args.push(country); }
    if (lat !== undefined) { fields.push("lat = ?"); args.push(lat); }
    if (lng !== undefined) { fields.push("lng = ?"); args.push(lng); }
    if (year !== undefined) { fields.push("year = ?"); args.push(year); }
    if (description !== undefined) { fields.push("description = ?"); args.push(description); }
    if (phase !== undefined) { fields.push("phase = ?"); args.push(phase); }
    if (sort_order !== undefined) { fields.push("sort_order = ?"); args.push(sort_order); }

    if (fields.length === 0) return errorResponse("No fields to update");

    args.push(id);
    await db.execute({
      sql: `UPDATE travel_locations SET ${fields.join(", ")} WHERE id = ?`,
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

    await db.execute({ sql: "DELETE FROM travel_locations WHERE id = ?", args: [id] });
    return jsonResponse({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
