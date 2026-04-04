import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export default db;

export async function initializeDatabase() {
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS stations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number INTEGER NOT NULL UNIQUE,
      title_en TEXT NOT NULL DEFAULT '',
      title_kn TEXT NOT NULL DEFAULT '',
      title_hi TEXT NOT NULL DEFAULT '',
      description_en TEXT NOT NULL DEFAULT '',
      description_kn TEXT NOT NULL DEFAULT '',
      description_hi TEXT NOT NULL DEFAULT '',
      audio_en_url TEXT NOT NULL DEFAULT '',
      audio_kn_url TEXT NOT NULL DEFAULT '',
      audio_hi_url TEXT NOT NULL DEFAULT '',
      gallery_zone TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS kiosks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      location TEXT NOT NULL DEFAULT '',
      screen_size TEXT NOT NULL DEFAULT '',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS slides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kiosk_id INTEGER NOT NULL,
      slide_number INTEGER NOT NULL DEFAULT 0,
      title_en TEXT NOT NULL DEFAULT '',
      title_kn TEXT NOT NULL DEFAULT '',
      title_hi TEXT NOT NULL DEFAULT '',
      content_en TEXT NOT NULL DEFAULT '',
      content_kn TEXT NOT NULL DEFAULT '',
      content_hi TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      duration_seconds INTEGER NOT NULL DEFAULT 10,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (kiosk_id) REFERENCES kiosks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS knowledge_base (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      document_type TEXT NOT NULL DEFAULT 'pdf',
      file_url TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      indexed_at TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      language TEXT NOT NULL DEFAULT 'en',
      started_at TEXT NOT NULL DEFAULT (datetime('now')),
      ended_at TEXT
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
      input_text TEXT NOT NULL DEFAULT '',
      input_lang TEXT NOT NULL DEFAULT 'en',
      output_text TEXT NOT NULL DEFAULT '',
      sources TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      language TEXT NOT NULL DEFAULT 'en',
      time_limit_minutes INTEGER NOT NULL DEFAULT 10,
      passing_score INTEGER NOT NULL DEFAULT 50,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quiz_id INTEGER NOT NULL,
      question_en TEXT NOT NULL DEFAULT '',
      question_kn TEXT NOT NULL DEFAULT '',
      question_hi TEXT NOT NULL DEFAULT '',
      options_en TEXT NOT NULL DEFAULT '[]',
      options_kn TEXT NOT NULL DEFAULT '[]',
      options_hi TEXT NOT NULL DEFAULT '[]',
      correct_answer INTEGER NOT NULL DEFAULT 0,
      difficulty TEXT NOT NULL DEFAULT 'medium',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visitor_name TEXT NOT NULL DEFAULT '',
      quiz_id INTEGER NOT NULL,
      score INTEGER NOT NULL DEFAULT 0,
      passed INTEGER NOT NULL DEFAULT 0,
      certificate_url TEXT NOT NULL DEFAULT '',
      coupon_code TEXT NOT NULL DEFAULT '',
      attempted_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}
