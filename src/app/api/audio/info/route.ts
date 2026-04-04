import { serviceHeaders } from "@/lib/utils";
import { ensureDb } from "@/lib/init-db";

const headers = serviceHeaders("audio-guide", "1.0.0");

export async function GET() {
  await ensureDb();

  return Response.json(
    {
      service: "audio-guide",
      version: "1.0.0",
      description:
        "Audio Guide service for Vivekananda Museum. Provides multilingual audio tours for museum stations.",
      endpoints: [
        { method: "GET", path: "/api/audio/health", description: "Health check" },
        { method: "GET", path: "/api/audio/info", description: "Service info" },
        {
          method: "GET",
          path: "/api/audio/stations",
          description: "List all stations (supports ?lang=en|kn|hi)",
        },
        {
          method: "POST",
          path: "/api/audio/stations",
          description: "Create a new station (admin)",
        },
        {
          method: "GET",
          path: "/api/audio/stations/:number",
          description: "Get a single station by number (supports ?lang)",
        },
        {
          method: "PUT",
          path: "/api/audio/stations/:number",
          description: "Update a station (admin)",
        },
        {
          method: "DELETE",
          path: "/api/audio/stations/:number",
          description: "Delete a station (admin)",
        },
        {
          method: "POST",
          path: "/api/audio/upload",
          description: "Upload audio file for a station (admin, multipart form)",
        },
      ],
    },
    { headers }
  );
}
