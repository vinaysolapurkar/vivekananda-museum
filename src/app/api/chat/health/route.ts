import { ensureDb } from "@/lib/init-db";
import { serviceHeaders, jsonResponse } from "@/lib/utils";

const SVC_NAME = "rag-chatbot";
const SVC_VERSION = "1.0.0";

export async function GET() {
  try {
    await ensureDb();

    return jsonResponse(
      {
        status: "healthy",
        service: SVC_NAME,
        version: SVC_VERSION,
        timestamp: new Date().toISOString(),
      },
      200,
      serviceHeaders(SVC_NAME, SVC_VERSION)
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(
      {
        status: "unhealthy",
        service: SVC_NAME,
        version: SVC_VERSION,
        error: message,
      },
      503,
      serviceHeaders(SVC_NAME, SVC_VERSION)
    );
  }
}
