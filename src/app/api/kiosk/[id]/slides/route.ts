import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { getLang, localizedField, serviceHeaders, jsonResponse, errorResponse } from "@/lib/utils";

const headers = serviceHeaders("kiosk-content", "1.0.0");

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDb();
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const lang = getLang(searchParams);

    const result = await db.execute({
      sql: "SELECT * FROM slides WHERE kiosk_id = ? ORDER BY sort_order, slide_number",
      args: [Number(id)],
    });

    const slides = result.rows.map((row) => ({
      id: row.id,
      slide_number: row.slide_number,
      title: localizedField(row, "title", lang),
      content: localizedField(row, "content", lang),
      image_url: row.image_url,
      duration_seconds: row.duration_seconds,
    }));

    return jsonResponse({ slides }, 200, headers);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
