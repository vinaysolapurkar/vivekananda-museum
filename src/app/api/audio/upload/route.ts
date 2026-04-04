import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import db from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { serviceHeaders, errorResponse } from "@/lib/utils";
import { ensureDb } from "@/lib/init-db";

const headers = serviceHeaders("audio-guide", "1.0.0");

export async function POST(request: NextRequest) {
  await ensureDb();

  const authError = await requireAdmin();
  if (authError) return authError;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse("Invalid form data");
  }

  const file = formData.get("file") as File | null;
  const stationNumber = formData.get("station_number") as string | null;
  const lang = formData.get("lang") as string | null;

  if (!file || !stationNumber || !lang) {
    return errorResponse("Fields file, station_number, and lang are required");
  }

  if (!["en", "kn", "hi"].includes(lang)) {
    return errorResponse("lang must be one of: en, kn, hi");
  }

  // Verify station exists
  const station = await db.execute({
    sql: "SELECT id FROM stations WHERE number = ?",
    args: [Number(stationNumber)],
  });

  if (station.rows.length === 0) {
    return errorResponse("Station not found", 404);
  }

  // Save file
  const dir = join(process.cwd(), "public", "uploads", "audio", stationNumber);
  await mkdir(dir, { recursive: true });

  const filePath = join(dir, `${lang}.mp3`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  // Update the station's audio URL
  const audioUrl = `/uploads/audio/${stationNumber}/${lang}.mp3`;
  const column = `audio_${lang}_url`;

  await db.execute({
    sql: `UPDATE stations SET ${column} = ?, updated_at = datetime('now') WHERE number = ?`,
    args: [audioUrl, Number(stationNumber)],
  });

  return Response.json(
    { uploaded: true, url: audioUrl },
    { status: 201, headers }
  );
}
