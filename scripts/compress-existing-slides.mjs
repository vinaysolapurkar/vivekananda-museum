/**
 * One-time script: convert existing slideshow PNGs → JPEG quality 82
 * Updates filenames (*.png → *.jpg) and patches the SQLite DB records.
 *
 * Run from project root:  node scripts/compress-existing-slides.mjs
 */

import { readdir, unlink, stat } from "fs/promises";
import { join, basename, extname } from "path";
import sharp from "sharp";
import { createClient } from "@libsql/client";

const uploadsDir = join(process.cwd(), "public", "uploads", "slideshow");

// Open local DB (same path as src/lib/db.ts default)
const db = createClient({ url: "file:local.db" });

const files = await readdir(uploadsDir);
const pngFiles = files.filter(f => extname(f).toLowerCase() === ".png");

if (pngFiles.length === 0) {
  console.log("No PNG files found — nothing to do.");
  process.exit(0);
}

console.log(`Found ${pngFiles.length} PNG file(s). Compressing…`);

let totalBefore = 0;
let totalAfter = 0;
let converted = 0;
let skipped = 0;

for (const pngName of pngFiles) {
  const pngPath = join(uploadsDir, pngName);
  const jpgName = pngName.replace(/\.png$/i, ".jpg");
  const jpgPath = join(uploadsDir, jpgName);

  const statBefore = await stat(pngPath);
  totalBefore += statBefore.size;

  try {
    await sharp(pngPath).jpeg({ quality: 82 }).toFile(jpgPath);

    const statAfter = await stat(jpgPath);
    totalAfter += statAfter.size;

    const pctSaved = (((statBefore.size - statAfter.size) / statBefore.size) * 100).toFixed(1);
    console.log(`  ${pngName} → ${jpgName}  (${(statBefore.size/1024).toFixed(0)} KB → ${(statAfter.size/1024).toFixed(0)} KB, -${pctSaved}%)`);

    // Update DB record
    const oldUrl = `/uploads/slideshow/${pngName}`;
    const newUrl = `/uploads/slideshow/${jpgName}`;
    await db.execute({
      sql: "UPDATE slideshow_images SET image_url = ? WHERE image_url = ?",
      args: [newUrl, oldUrl],
    });

    // Remove original PNG
    await unlink(pngPath);
    converted++;
  } catch (err) {
    console.error(`  FAILED: ${pngName} — ${err.message}`);
    skipped++;
  }
}

const savedMB = ((totalBefore - totalAfter) / 1024 / 1024).toFixed(1);
console.log(`\nDone. ${converted} converted, ${skipped} skipped.`);
console.log(`Size: ${(totalBefore/1024/1024).toFixed(1)} MB → ${(totalAfter/1024/1024).toFixed(1)} MB (saved ${savedMB} MB)`);
