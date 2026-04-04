import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
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

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  // Get max sort order
  const maxResult = await db.execute({
    sql: "SELECT COALESCE(MAX(sort_order), 0) as max_order FROM slideshow_images",
    args: [],
  });
  const nextOrder = sortOrder ? Number(sortOrder) : (Number(maxResult.rows[0].max_order) + 1);

  // Save file
  const dir = join(process.cwd(), "public", "uploads", "slideshow");
  await mkdir(dir, { recursive: true });

  const ext = file.name?.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `slide_${Date.now()}.${ext}`;
  const filePath = join(dir, fileName);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filePath, buffer);

  const imageUrl = `/uploads/slideshow/${fileName}`;

  // Insert into DB
  const result = await db.execute({
    sql: `INSERT INTO slideshow_images (title, description, image_url, station_number, sort_order, category_id, duration_seconds) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      title, description, imageUrl, 
      stationNumber ? Number(stationNumber) : null, 
      nextOrder,
      categoryId ? Number(categoryId) : null,
      durationSeconds ? Number(durationSeconds) : 5,
    ],
  });

  return Response.json({
    success: true,
    id: Number(result.lastInsertRowid),
    url: imageUrl,
    size: buffer.length,
  }, { status: 201 });
}
