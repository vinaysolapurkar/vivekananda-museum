import { initializeDatabase } from "@/lib/db";

export async function GET() {
  try {
    await initializeDatabase();
    return Response.json({ success: true, message: "Database initialized" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
