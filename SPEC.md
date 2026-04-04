# Vivekananda Smriti Museum — Digital Experience Platform

## Overview
A digital museum platform for Ramakrishna Ashram, Mysore (Vivekananda Smriti). Provides audio-guided mobile experience, interactive kiosks, AI chatbot, and quiz system for visitors.

## Architecture

### Frontend (PWA - Works on any phone browser)
- **Mobile App** (`/mobile`) — PWA for visitors with phone + headphone
- **Kiosk App** (`/kiosk`) — Full-screen touch interface for floor-standing kiosks
- **Admin Dashboard** (`/admin`) — Backend CMS for managing all content

### Backend Microservices (Plug-and-Play via APIs)

1. **Audio Guide Service** (`/api/audio`)
   - Station management (1-50 numbered stations)
   - Audio file management per station
   - Language selection (EN, HI, KN, MR)

2. **Kiosk Content Service** (`/api/kiosk`)
   - Slide deck management per kiosk
   - Add/edit/delete slides
   - Theme management

3. **RAG Chatbot Service** (`/api/chat`)
   - PDF upload for knowledge base (Complete Works of Vivekananda)
   - Voice input (EN/KN) → Text output
   - RAG-powered answers from uploaded documents

4. **Quiz Service** (`/api/quiz`)
   - Question bank management
   - Quiz sessions with grading
   - Certificate generation (PDF)

### Tech Stack
- **Frontend:** Next.js 14, React, Tailwind CSS
- **Backend:** Next.js API routes (serverless)
- **Database:** Turso (libSQL) — simple, edge-ready
- **Auth:** Simple PIN/QR code for admin (no user accounts needed)
- **Voice:** Deepgram (STT) + Browser TTS (free)
- **AI:** DeepSeek for RAG chatbot
- **Storage:** Local filesystem (VPS) + presigned URLs for audio/files

---

## Module 1: Audio Guide (Mobile)

### User Flow
1. Visitor receives phone at entrance
2. Opens museum PWA → selects language
3. Sees numbered list of stations (1-50)
4. Walks to Station 23 → presses 23 on phone
5. Audio plays for that painting/exhibit
6. Continues through museum

### Data Model
```
stations:
  id, number, title_en, title_kn, title_hi,
  audio_en_url, audio_kn_url, audio_hi_url,
  description_en, description_kn, description_hi,
  gallery_zone, sort_order

languages: en, kn, hi, mr
```

### API Endpoints
- `GET /api/audio/stations` — List all stations with language
- `GET /api/audio/stations/[number]` — Get single station details
- `POST /api/audio/stations` — Create station (admin)
- `PUT /api/audio/stations/[id]` — Update station (admin)
- `DELETE /api/audio/stations/[id]` — Delete station (admin)
- `POST /api/audio/upload` — Upload audio file (admin)

---

## Module 2: Kiosk Content

### User Flow
1. Kiosk displays themed slideshow
2. Visitor scrolls left/right through slides
3. Content updates live from backend

### Data Model
```
kiosks:
  id, name, location, screen_size, is_active

slides:
  id, kiosk_id, slide_number, title_en, title_kn, title_hi,
  content_en, content_kn, content_hi, image_url,
  theme, duration_seconds, sort_order
```

### API Endpoints
- `GET /api/kiosk/[id]/slides` — Get slides for kiosk
- `POST /api/kiosk/slides` — Create slide (admin)
- `PUT /api/kiosk/slides/[id]` — Update slide (admin)
- `DELETE /api/kiosk/slides/[id]` — Delete slide (admin)
- `GET /api/kiosk` — List all kiosks (admin)

---

## Module 3: RAG Chatbot (Vivekananda Chat)

### User Flow
1. Kiosk shows chat interface
2. Visitor speaks question in EN/KN (or types)
3. Whisper transcribes → RAG searches uploaded PDFs → Answer displayed
4. Follow-up questions continue conversation

### Data Model
```
knowledge_base:
  id, title, document_type (pdf/doc/txt),
  file_url, indexed_at, is_active

chat_sessions:
  id, visitor_id, started_at, ended_at, language

chat_messages:
  id, session_id, role (user/assistant),
  input_text, input_lang, output_text, sources
```

### API Endpoints
- `POST /api/chat/query` — Send question → Get RAG answer
- `POST /api/chat/upload` — Upload document to knowledge base (admin)
- `GET /api/chat/sessions` — View chat history (admin)
- `DELETE /api/chat/sessions/[id]` — Clear session (admin)

---

## Module 4: Quiz & Certificate

### User Flow
1. After museum tour, visitor sits at quiz kiosk
2. Answers 10 questions (MCQ + puzzles)
3. Score ≥ 50% → Certificate generated
4. QR code links to downloadable certificate
5. Optional: Coupon code for bookstall discount

### Data Model
```
quizzes:
  id, title, language, time_limit_minutes, passing_score

questions:
  id, quiz_id, question_en, question_kn, question_hi,
  options_en (JSON), correct_answer, difficulty, sort_order

attempts:
  id, visitor_id, quiz_id, score, passed, certificate_url, coupon_code, attempted_at
```

### API Endpoints
- `GET /api/quiz/[id]/questions` — Get quiz questions
- `POST /api/quiz/[id]/submit` — Submit answers → Get score + certificate
- `POST /api/quiz/questions` — Create question (admin)
- `POST /api/quiz/certificates/[id]/download` — Download certificate PDF

---

## Microservices Plug-in Architecture

Each service exposes:
- `GET /api/[service]/health` — Health check
- `GET /api/[service]/info` — Service metadata
- API keys for authentication between services

Services can be swapped by:
1. Deploying replacement service at same URL
2. Updating service registry in admin dashboard

```
Service Registry (admin dashboard):
- Service name
- Service URL
- API Key
- Status (active/inactive)
- Replace with new provider
```

---

## Design System

### Colors
- Primary: #1A237E (Deep Indigo — spiritual, calm)
- Secondary: #FF8F00 (Amber — warmth, Vivekananda's energy)
- Accent: #4CAF50 (Green — growth, knowledge)
- Background: #FAFAFA (Light) / #1A1A2E (Dark for kiosk)
- Text: #212121 (Dark) / #FFFFFF (Light)

### Typography
- Headings: Playfair Display (elegant, timeless)
- Body: Inter (readable, modern)
- Kannada: Noto Sans Kannada

### Mobile (Visitor PWA)
- Large touch targets (min 48px)
- High contrast for elderly visitors
- Simple navigation: Number grid + Language selector
- Audio player with large play/pause/stop buttons

### Kiosk UI
- Full-screen, no browser chrome
- Swipe/scroll navigation
- Large fonts (min 24px)
- Auto-return to home after 60s inactivity
- Voice input indicator

### Admin Dashboard
- Clean, minimal — designed for volunteer operators
- Card-based layout
- Bulk upload support
- Preview before publish

---

## Content Structure

### Gallery Zones
1. **Childhood & Early Life** (Stations 1-8)
2. **Spiritual Quest** (Stations 9-15)
3. **Chicago Parliament of Religions** (Stations 16-18)
4. **Back to India & Work** (Stations 19-25)
5. **Founding of Ramakrishna Mission** (Stations 26-30)
6. **Teachings & Philosophy** (Stations 31-40)
7. **Last Days & Legacy** (Stations 41-45)

### Audio Files
- Format: MP3, 128kbps
- Duration: 60-180 seconds per station
- Languages: Kannada (primary), English, Hindi

---

## Security
- Admin routes protected by 6-digit PIN
- QR codes for kiosk don't expose admin access
- Rate limiting on chat API
- Input sanitization for all user inputs
- CORS restricted to museum domain

---

## Deployment
- **VPS:** Node.js + PM2
- **Database:** Turso (libSQL)
- **Storage:** Local filesystem with `/public` for audio/images
- **Domain:** `museum.vivekanandasmriti.in` (or similar)
