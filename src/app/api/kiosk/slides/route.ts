import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { ensureDb } from "@/lib/init-db";
import { serviceHeaders, jsonResponse, errorResponse } from "@/lib/utils";

const headers = serviceHeaders("kiosk-content", "1.0.0");

export async function POST(request: Request) {
  try {
    await ensureDb();
    // const authError = await requireAdmin();
    // if (authError) return authError;

    const body = await request.json();
    const {
      kiosk_id,
      slide_number,
      title_en,
      title_kn,
      title_hi,
      content_en,
      content_kn,
      content_hi,
      image_url,
      duration_seconds,
      sort_order,
    } = body;

    if (!kiosk_id) {
      return errorResponse("kiosk_id is required");
    }

    const result = await db.execute({
      sql: `INSERT INTO slides (kiosk_id, slide_number, title_en, title_kn, title_hi,
              content_en, content_kn, content_hi, image_url, duration_seconds, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        kiosk_id,
        slide_number || 0,
        title_en || "",
        title_kn || "",
        title_hi || "",
        content_en || "",
        content_kn || "",
        content_hi || "",
        image_url || "",
        duration_seconds || 10,
        sort_order || 0,
      ],
    });

    return jsonResponse(
      { id: Number(result.lastInsertRowid), message: "Slide created" },
      201,
      headers
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return errorResponse(message, 500);
  }
}
