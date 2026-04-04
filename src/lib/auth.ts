import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const ADMIN_PIN = process.env.ADMIN_PIN || "123456";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "vivekananda-museum-secret-key-change-in-prod"
);

export async function verifyPin(pin: string): Promise<boolean> {
  return pin === ADMIN_PIN;
}

export async function createSession(): Promise<string> {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .setIssuedAt()
    .sign(JWT_SECRET);
  return token;
}

export async function verifySession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function requireAdmin(): Promise<Response | null> {
  const isAdmin = await verifySession();
  if (!isAdmin) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
