# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint
```

There are no automated tests. Validate changes manually via the dev server.

## Architecture Overview

This is a **Next.js 16 kiosk app** for the Swami Vivekananda museum (Sri Ramakrishna Ashram, Mysore). It runs as a touch-screen museum exhibit with five interactive modules.

### Database

`src/lib/db.ts` — single LibSQL client. Defaults to `file:local.db` (SQLite) in dev; in production uses Turso via `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` env vars.

`src/lib/init-db.ts` — exports `ensureDb()`, a lazy once-per-process initialiser. **Every API route calls `await ensureDb()` before any DB access.**

Schema tables: `stations`, `kiosks`, `slides`, `knowledge_base`, `chat_sessions`, `chat_messages`, `quizzes`, `questions`, `attempts`, `admin_settings`, `exhibits`, `exhibit_images`, `slideshow_categories`, `slideshow_images`, `travel_locations`.

`GET /api/init` — seeds the database with default stations, a quiz, 20 questions, and 433 travel locations. Call this once on a fresh deployment.

### Auth

`src/lib/auth.ts` — PIN-based admin auth. PIN set via `ADMIN_PIN` env var (default `123456`). Issues a 24h JWT stored in an `admin_session` HttpOnly cookie. Use `requireAdmin()` in admin API routes to guard them.

### Module Pages → API Routes

| Page | Route | Backend |
|------|-------|---------|
| `/guide` | Audio guide with TTS | `GET /api/audio/stations` |
| `/kiosk/slideshow` | Slideshow viewer | `GET /api/slideshow` |
| `/chat` | RAG chatbot ("Speak with Swamiji") | `POST /api/chat/query` |
| `/quiz` | Knowledge quiz + certificate | `GET/POST /api/quiz`, `/api/quiz/[id]/questions`, `/api/quiz/[id]/submit` |
| `/map` | World travels globe | Served as static iframe — no API |
| `/admin` | Admin dashboard | `/api/admin/*` |

### Map / VivekaDigvijaya

`/map` renders a fullscreen `<iframe src="/viveka-digvijaya/index.html">`. The entire VivekaDigvijaya app lives as static files under `public/viveka-digvijaya/` — it uses **CesiumJS** (not globe.gl), ArcGIS satellite tiles (no API key required), and loads data from `public/viveka-digvijaya/data/data.js` as `window` globals. The ochre/saffron colour theme is defined in the `<style>` block of `public/viveka-digvijaya/index.html` via CSS variables (`--gold: #C8701A`, etc.). To modify the globe UI, edit that HTML file directly.

### Chat (RAG)

`/api/chat/query` does keyword-based LIKE search across `knowledge_base.content`, then sends matched excerpts as context to the Claude API (`claude-sonnet-4-6` via `ANTHROPIC_API_KEY`). Upload PDFs at `/admin` to populate the knowledge base. The chatbot stays in character as Swami Vivekananda.

### Admin

Protected by PIN + JWT cookie. Manages: stations, kiosks, slideshow images (uploaded to `public/uploads/slideshow/`), PPTX import (converts to slides), knowledge base PDFs, quiz questions, and admin settings (PIN, coupon codes, analytics toggle).

### Environment Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `TURSO_DATABASE_URL` | Production DB URL | `file:local.db` |
| `TURSO_AUTH_TOKEN` | Turso auth | *(none — omit for local SQLite)* |
| `ANTHROPIC_API_KEY` | Claude API for chat | *(required for chat)* |
| `ADMIN_PIN` | Admin dashboard PIN | `123456` |
| `JWT_SECRET` | Signs admin session tokens | `vivekananda-museum-secret-key-change-in-prod` |

### Utility pattern

`src/lib/utils.ts` exports `jsonResponse`, `errorResponse`, and `serviceHeaders` — use these in all API routes for consistent response formatting.
