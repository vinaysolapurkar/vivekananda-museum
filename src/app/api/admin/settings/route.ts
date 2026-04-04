import { requireAdmin } from "@/lib/auth";
import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

export async function GET() {
  // const authError = await requireAdmin();
  // if (authError) return authError;

  await ensureDb();

  try {
    const result = await db.execute("SELECT key, value FROM admin_settings");
    const settings: Record<string, string> = {};
    for (const row of result.rows) {
      settings[row.key as string] = row.value as string;
    }
    return Response.json(settings);
  } catch {
    return Response.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  // const authError = await requireAdmin();
  // if (authError) return authError;

  await ensureDb();

  try {
    const { key, value } = await request.json();

    if (!key) {
      return Response.json({ error: "Key is required" }, { status: 400 });
    }

    await db.execute({
      sql: "INSERT OR REPLACE INTO admin_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))",
      args: [key, value ?? ""],
    });

    return Response.json({ success: true });
  } catch {
    return Response.json(
      { error: "Failed to update setting" },
      { status: 500 }
    );
  }
}
