import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function GET() {
  await ensureDb();
  const result = await db.execute({
    sql: "SELECT id, title, document_type, content, is_active, created_at FROM knowledge_base ORDER BY id DESC",
    args: [],
  });
  return Response.json({ documents: result.rows });
}

export async function DELETE(request: Request) {
  await ensureDb();
  const { id } = await request.json();
  await db.execute({ sql: "DELETE FROM knowledge_base WHERE id = ?", args: [Number(id)] });
  return Response.json({ success: true });
}
