import db from "@/lib/db";
import { ensureDb } from "@/lib/init-db";
import { serviceHeaders, jsonResponse } from "@/lib/utils";

const headers = serviceHeaders("kiosk-content", "1.0.0");

export async function GET() {
  try {
    await ensureDb();
    await db.execute("SELECT 1");
    return jsonResponse({ status: "healthy", timestamp: new Date().toISOString() }, 200, headers);
  } catch {
    return jsonResponse({ status: "unhealthy", timestamp: new Date().toISOString() }, 503, headers);
  }
}
