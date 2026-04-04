import { initializeDatabase } from "./db";

let initialized = false;

export async function ensureDb() {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
}
