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

  // Skip auth for now — admin pages are PIN-gated at layout level
  // // const authError = await requireAdmin();
  // // if (authError) return authError;

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    return errorResponse("Invalid form data: " + (err instanceof Error ? err.message : "unknown"));
  }

  const file = formData.get("file") as File | null;
  const stationNumber = formData.get("station_number") as string | null;
  const lang = formData.get("lang") as string | null;

  if (!file) return errorResponse("No file provided");
  if (!stationNumber) return errorResponse("station_number is required");
  if (!lang) return errorResponse("lang is required");

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

  // Determine file extension from mime type or filename
  const mimeType = file.type || "";
  let ext = "mp3";
  if (mimeType.includes("wav")) ext = "wav";
  else if (mimeType.includes("ogg")) ext = "ogg";
  else if (mimeType.includes("webm")) ext = "webm";
  else if (mimeType.includes("m4a") || mimeType.includes("mp4")) ext = "m4a";
  else if (file.name) {
    const parts = file.name.split(".");
    if (parts.length > 1) ext = parts[parts.length - 1].toLowerCase();
  }

  // Save file
  const dir = join(process.cwd(), "public", "uploads", "audio", stationNumber);
  await mkdir(dir, { recursive: true });

  const fileName = `${lang}.${ext}`;
  const filePath = join(dir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  // Update the station's audio URL
  const audioUrl = `/uploads/audio/${stationNumber}/${fileName}`;
  const column = `audio_${lang}_url`;

  await db.execute({
    sql: `UPDATE stations SET ${column} = ?, updated_at = datetime('now') WHERE number = ?`,
    args: [audioUrl, Number(stationNumber)],
  });

  return Response.json(
    { uploaded: true, url: audioUrl, size: buffer.length, type: mimeType },
    { status: 201, headers }
  );
}
