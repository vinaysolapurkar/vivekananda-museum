import { serviceHeaders } from "@/lib/utils";
import { ensureDb } from "@/lib/init-db";

const headers = serviceHeaders("audio-guide", "1.0.0");

export async function GET() {
  await ensureDb();

  return Response.json(
    { status: "ok", service: "audio-guide", version: "1.0.0" },
    { headers }
  );
}
