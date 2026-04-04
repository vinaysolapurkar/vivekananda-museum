import { verifyPin, createSession, verifySession } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { pin } = await request.json();

    if (!pin) {
      return Response.json({ error: "PIN is required" }, { status: 400 });
    }

    const valid = await verifyPin(pin);
    if (!valid) {
      return Response.json({ error: "Invalid PIN" }, { status: 401 });
    }

    const token = await createSession();
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });

    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const authenticated = await verifySession();
    return Response.json({ authenticated });
  } catch {
    return Response.json({ authenticated: false });
  }
}
