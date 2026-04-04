import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { requireAdmin } from "@/lib/auth";
import { serviceHeaders, jsonResponse, errorResponse } from "@/lib/utils";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

const SVC_NAME = "rag-chatbot";
const SVC_VERSION = "1.0.0";

export async function POST(request: Request) {
  try {
    await ensureDb();

    // Admin check
    const authError = await requireAdmin();
    if (authError) return authError;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const title = formData.get("title") as string | null;

    if (!file) {
      return errorResponse("file is required");
    }
    if (!title) {
      return errorResponse("title is required");
    }

    // Ensure upload directory exists
    const uploadDir = join(process.cwd(), "public", "uploads", "knowledge");
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileName = `${timestamp}_${safeFileName}`;
    const filePath = join(uploadDir, fileName);

    // Write file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/knowledge/${fileName}`;

    // Try to extract PDF text
    let content = "";
    if (file.name.toLowerCase().endsWith(".pdf")) {
      try {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: new Uint8Array(arrayBuffer) });
        const textResult = await parser.getText();
        content = textResult.text || "";
        await parser.destroy();
      } catch {
        // pdf-parse not available or parsing failed - store empty content
        content = "";
      }
    }

    // Store in knowledge_base
    const result = await db.execute({
      sql: `INSERT INTO knowledge_base (title, document_type, file_url, content, indexed_at, is_active, created_at)
            VALUES (?, ?, ?, ?, datetime('now'), 1, datetime('now'))`,
      args: [
        title,
        file.name.toLowerCase().endsWith(".pdf") ? "pdf" : "document",
        fileUrl,
        content,
      ],
    });

    const documentId = Number(result.lastInsertRowid);

    return jsonResponse(
      {
        success: true,
        document: {
          id: documentId,
          title,
          file_url: fileUrl,
          has_content: content.length > 0,
        },
      },
      201,
      serviceHeaders(SVC_NAME, SVC_VERSION)
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(
      { error: message },
      500,
      serviceHeaders(SVC_NAME, SVC_VERSION)
    );
  }
}
