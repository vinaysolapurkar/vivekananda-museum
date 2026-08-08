import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";

// Unauthenticated, visitor-facing settings only — never expose admin_pin or
// anything else from the full admin_settings table here. Whitelist keys
// explicitly rather than returning the row set.
const PUBLIC_KEYS = ["kiosk_inactivity_timeout"] as const;

export async function GET() {
  await ensureDb();

  try {
    const placeholders = PUBLIC_KEYS.map(() => "?").join(",");
    const result = await db.execute({
      sql: `SELECT key, value FROM admin_settings WHERE key IN (${placeholders})`,
      args: [...PUBLIC_KEYS],
    });
    const settings: Record<string, string> = {};
    for (const row of result.rows) {
      settings[row.key as string] = row.value as string;
    }
    return Response.json(settings);
  } catch {
    return Response.json({}, { status: 200 });
  }
}
