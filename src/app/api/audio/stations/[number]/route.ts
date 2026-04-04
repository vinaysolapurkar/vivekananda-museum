import { NextRequest } from "next/server";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { getLang, serviceHeaders, errorResponse } from "@/lib/utils";
import { ensureDb } from "@/lib/init-db";

const headers = serviceHeaders("audio-guide", "1.0.0");

type RouteContext = { params: Promise<{ number: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  await ensureDb();

  const { number } = await params;
  const lang = getLang(request.nextUrl.searchParams);

  const result = await db.execute({
    sql:
      "SELECT number, title_" +
      lang +
      " AS title, description_" +
      lang +
      " AS description, audio_" +
      lang +
      "_url AS audio_url, gallery_zone FROM stations WHERE number = ?",
    args: [Number(number)],
  });

  if (result.rows.length === 0) {
    return errorResponse("Station not found", 404);
  }

  return Response.json({ station: result.rows[0] }, { headers });
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  await ensureDb();

  // const authError = await requireAdmin();
  // if (authError) return authError;

  const { number } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON body");
  }

  // Build dynamic SET clause from provided fields
  const allowedFields = [
    "title_en",
    "title_kn",
    "title_hi",
    "description_en",
    "description_kn",
    "description_hi",
    "audio_en_url",
    "audio_kn_url",
    "audio_hi_url",
    "gallery_zone",
    "sort_order",
  ];

  const setClauses: string[] = [];
  const args: (string | number)[] = [];

  for (const field of allowedFields) {
    if (field in body) {
      setClauses.push(`${field} = ?`);
      args.push(body[field] as string | number);
    }
  }

  if (setClauses.length === 0) {
    return errorResponse("No valid fields to update");
  }

  setClauses.push("updated_at = datetime('now')");
  args.push(Number(number));

  const result = await db.execute({
    sql: `UPDATE stations SET ${setClauses.join(", ")} WHERE number = ?`,
    args,
  });

  if (result.rowsAffected === 0) {
    return errorResponse("Station not found", 404);
  }

  return Response.json({ updated: true, number: Number(number) }, { headers });
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  await ensureDb();

  // const authError = await requireAdmin();
  // if (authError) return authError;

  const { number } = await params;

  const result = await db.execute({
    sql: "DELETE FROM stations WHERE number = ?",
    args: [Number(number)],
  });

  if (result.rowsAffected === 0) {
    return errorResponse("Station not found", 404);
  }

  return Response.json({ deleted: true, number: Number(number) }, { headers });
}
