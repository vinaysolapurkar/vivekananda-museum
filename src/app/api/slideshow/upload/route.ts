import { mkdir } from "fs/promises";
import { join } from "path";
import sharp from "sharp";
import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function POST(request: Request) {
  await ensureDb();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (err) {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const title = (formData.get("title") as string) || "";
  const description = (formData.get("description") as string) || "";
  const stationNumber = formData.get("station_number") as string | null;
  const sortOrder = formData.get("sort_order") as string | null;
  const categoryId = formData.get("category_id") as string | null;
  const durationSeconds = formData.get("duration_seconds") as string | null;
  const cropBottom = formData.get("crop_bottom") as string | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  // Order within the target category (falls back to global max when no category).
  const maxResult = await db.execute({
    sql: categoryId
      ? "SELECT COALESCE(MAX(sort_order), 0) as max_order FROM slideshow_images WHERE category_id = ?"
      : "SELECT COALESCE(MAX(sort_order), 0) as max_order FROM slideshow_images",
    args: categoryId ? [Number(categoryId)] : [],
  });
  const nextOrder = sortOrder ? Number(sortOrder) : (Number(maxResult.rows[0].max_order) + 1);

  // Save file
  const dir = join(process.cwd(), "public", "uploads", "slideshow");
  await mkdir(dir, { recursive: true });

  const fileName = `slide_${Date.now()}_${Math.round(Math.random() * 1e6)}.jpg`;
  const filePath = join(dir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());

  // Accept any raster image (JPEG/PNG/WEBP/GIF/TIFF/AVIF/HEIC…). Normalise to a
  // web-friendly JPEG: honour EXIF orientation, flatten transparency onto a
  // neutral background (so PNGs don't turn black), and cap the largest side so
  // huge phone/camera files stay performant on the kiosk.
  try {
    await sharp(buffer, { failOn: "none" })
      .rotate()
      .resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#0f0806" })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(filePath);
  } catch {
    return Response.json(
      { error: "Unsupported or corrupt image file. Please upload a JPG, PNG, WEBP, GIF, or TIFF image." },
      { status: 400 }
    );
  }

  const imageUrl = `/uploads/slideshow/${fileName}`;

  // Insert into DB
  const result = await db.execute({
    sql: `INSERT INTO slideshow_images (title, description, image_url, station_number, sort_order, category_id, duration_seconds, crop_bottom)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      title, description, imageUrl,
      stationNumber ? Number(stationNumber) : null,
      nextOrder,
      categoryId ? Number(categoryId) : null,
      durationSeconds ? Number(durationSeconds) : 5,
      cropBottom !== null ? Number(cropBottom) : 0,
    ],
  });

  return Response.json({
    success: true,
    id: Number(result.lastInsertRowid),
    url: imageUrl,
    size: buffer.length,
  }, { status: 201 });
}
