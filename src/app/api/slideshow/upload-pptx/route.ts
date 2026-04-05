import { mkdir } from "fs/promises";
import { join } from "path";
import JSZip from "jszip";
import sharp from "sharp";
import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

const WATERMARK_HEIGHT = 36; // NotebookLM watermark is ~30-36px at the bottom

export async function POST(request: Request) {
  await ensureDb();

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const categoryId = formData.get("category_id") as string | null;
  const durationSeconds = formData.get("duration_seconds") as string | null;
  const cropWatermark = formData.get("crop_bottom") as string | null;

  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!categoryId) {
    return Response.json({ error: "category_id is required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch {
    return Response.json({ error: "Invalid PPTX file" }, { status: 400 });
  }

  const slideFiles = Object.keys(zip.files)
    .filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/)?.[1] || "0");
      const numB = parseInt(b.match(/slide(\d+)/)?.[1] || "0");
      return numA - numB;
    });

  if (slideFiles.length === 0) {
    return Response.json({ error: "No slides found in PPTX" }, { status: 400 });
  }

  const maxResult = await db.execute({
    sql: "SELECT COALESCE(MAX(sort_order), 0) as max_order FROM slideshow_images WHERE category_id = ?",
    args: [Number(categoryId)],
  });
  let nextOrder = Number(maxResult.rows[0].max_order) + 1;

  const dir = join(process.cwd(), "public", "uploads", "slideshow");
  await mkdir(dir, { recursive: true });

  const timestamp = Date.now();
  const shouldCrop = cropWatermark !== "0"; // crop by default
  const inserted: Array<{ id: number; url: string; slideNumber: number }> = [];

  for (let i = 0; i < slideFiles.length; i++) {
    const slideFile = slideFiles[i];
    const slideNum = parseInt(slideFile.match(/slide(\d+)/)?.[1] || "0");

    const relsPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
    const relsFile = zip.file(relsPath);
    if (!relsFile) continue;

    const relsXml = await relsFile.async("string");
    const imageMatches = relsXml.match(/Target="[^"]*\/media\/([^"]+)"/g);
    if (!imageMatches || imageMatches.length === 0) continue;

    const imageFileMatch = imageMatches[0].match(/Target="[^"]*\/media\/([^"]+)"/);
    if (!imageFileMatch) continue;

    const mediaFileName = imageFileMatch[1];
    const mediaPath = `ppt/media/${mediaFileName}`;
    const mediaFile = zip.file(mediaPath);
    if (!mediaFile) continue;

    const imageBuffer = await mediaFile.async("nodebuffer");

    // Output as PNG always (clean, lossless)
    const outputName = `slide_${timestamp}_${String(i + 1).padStart(3, "0")}.png`;
    const outputPath = join(dir, outputName);

    if (shouldCrop) {
      // Get image dimensions, crop bottom watermark, save
      const metadata = await sharp(imageBuffer).metadata();
      const width = metadata.width || 1376;
      const height = metadata.height || 768;
      const cropHeight = Math.max(height - WATERMARK_HEIGHT, 100);

      await sharp(imageBuffer)
        .extract({ left: 0, top: 0, width, height: cropHeight })
        .png()
        .toFile(outputPath);
    } else {
      // Just convert to PNG without cropping
      await sharp(imageBuffer).png().toFile(outputPath);
    }

    const imageUrl = `/uploads/slideshow/${outputName}`;

    const result = await db.execute({
      sql: `INSERT INTO slideshow_images (title, description, image_url, category_id, sort_order, duration_seconds, crop_bottom)
            VALUES (?, '', ?, ?, ?, ?, 0)`,
      args: [
        `Slide ${i + 1}`,
        imageUrl,
        Number(categoryId),
        nextOrder++,
        durationSeconds ? Number(durationSeconds) : 8,
      ],
    });

    inserted.push({
      id: Number(result.lastInsertRowid),
      url: imageUrl,
      slideNumber: i + 1,
    });
  }

  return Response.json(
    {
      success: true,
      slides_extracted: inserted.length,
      total_slides: slideFiles.length,
      slides: inserted,
    },
    { status: 201 }
  );
}
