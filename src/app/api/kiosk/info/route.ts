import { ensureDb } from "@/lib/init-db";
import { serviceHeaders, jsonResponse } from "@/lib/utils";

const headers = serviceHeaders("kiosk-content", "1.0.0");

export async function GET() {
  await ensureDb();
  return jsonResponse(
    {
      service: "kiosk-content",
      version: "1.0.0",
      description: "Kiosk slides management service for Vivekananda Museum",
    },
    200,
    headers
  );
}
