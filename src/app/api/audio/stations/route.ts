import { NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getLang, serviceHeaders, errorResponse } from "@/lib/utils";
import { ensureDb } from "@/lib/init-db";

const headers = serviceHeaders("audio-guide", "1.0.0");

export async function GET(request: NextRequest) {
  await ensureDb();

  const lang = getLang(request.nextUrl.searchParams);

  const rows = await db.execute(
    "SELECT number, title_" +
      lang +
      " AS title, description_" +
      lang +
      " AS description, audio_" +
      lang +
      "_url AS audio_url, gallery_zone FROM stations ORDER BY sort_order ASC, number ASC"
  );

  return Response.json({ stations: rows.rows }, { headers });
}

export async function POST(request: NextRequest) {
  await ensureDb();

  const authError = await requireAdmin();
  if (authError) return authError;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }

  const {
    number,
    title_en = "",
    title_kn = "",
    title_hi = "",
    description_en = "",
    description_kn = "",
    description_hi = "",
    audio_en_url = "",
    audio_kn_url = "",
    audio_hi_url = "",
    gallery_zone = "",
    sort_order = 0,
  } = body as Record<string, string | number>;

  if (number == null) {
    return errorResponse("Station number is required");
  }

  try {
    const result = await db.execute({
      sql: `INSERT INTO stations (number, title_en, title_kn, title_hi, description_en, description_kn, description_hi, audio_en_url, audio_kn_url, audio_hi_url, gallery_zone, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        number as number,
        title_en as string,
        title_kn as string,
        title_hi as string,
        description_en as string,
        description_kn as string,
        description_hi as string,
        audio_en_url as string,
        audio_kn_url as string,
        audio_hi_url as string,
        gallery_zone as string,
        sort_order as number,
      ],
    });

    return Response.json(
      { id: Number(result.lastInsertRowid), number },
      { status: 201, headers }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create station";
    if (message.includes("UNIQUE")) {
      return errorResponse("Station number already exists", 409);
    }
    return errorResponse(message, 500);
  }
}
