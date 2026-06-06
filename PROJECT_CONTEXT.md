# AI Study Platform — Project Context

> **Agent instruction:** Read this file at the start of every task. Follow it for all design, code, and architecture decisions unless the user explicitly overrides something in the current message.

---

## Project Overview

AI-powered interview preparation and career guidance platform for students.

**Core user flows:**
- Upload resumes
- Analyze skill gaps vs job descriptions
- Generate AI preparation roadmaps
- Attend mock interviews (technical + HR)
- Practice communication via AI debates
- Receive personalized feedback

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Zustand, React Router |
| Backend | FastAPI (Python) |
| AI | CrewAI multi-agent architecture |
| Database | Firebase Firestore |
| Auth | Firebase Authentication |
| File storage | Firebase Storage (other assets; resumes store text in Firestore only) |

---

## Architecture

```
Frontend (React / Vite)
        ↓  HTTP
FastAPI Backend
        ↓
CrewAI Agents
        ↓
Firebase (Auth, Firestore, Storage)
```

- Frontend talks to **FastAPI** for AI and business logic.
- Firebase handles **auth** and **persistence**. Resume PDFs are parsed in the browser; only **extracted text** is saved to Firestore.
- Do not call CrewAI directly from the frontend.

---

## Repository Layout

```
ai-study-platform/
├── PROJECT_CONTEXT.md      ← this file (source of truth)
├── frontend/               ← React app (active)
│   └── src/
│       ├── app/            ← router
│       ├── components/     ← UI + layout + auth
│       ├── config/         ← navigation, constants
│       ├── hooks/
│       ├── lib/            ← firebase, api (future)
│       ├── pages/
│       └── stores/         ← Zustand
├── backend/                ← FastAPI + CrewAI (skill gap started)
└── docs/                   ← CrewAI copy-paste prompts (e.g. CREWAI_SKILL_GAP_PROMPTS.md)
```

---

## Main Features (MVP Roadmap)

| # | Feature | Status |
|---|---------|--------|
| 1 | Authentication (signup, login, logout, protected routes) | ✅ Frontend done |
| 2 | Dashboard (progress, scores, feedback history) | 🟡 Shell / placeholders |
| 3 | Resume upload (PDF → text in Firestore) | ✅ Frontend (text only, no PDF storage) |
| 4 | Skill gap analysis (resume + JD → gaps, strengths) | 🟡 Backend + UI; add CrewAI AMP URL + token |
| 5 | AI roadmap (company, role, date, missing skills) | ⬜ Not started |
| 6 | Quiz generator (MCQ, coding, topic-based) | ⬜ Not started |
| 7 | Mock interview (technical, HR, AI feedback) | ⬜ Not started |
| 8 | AI debate arena | ⬜ Not started |

**Current phase:** Frontend foundation → then **FastAPI integration**.

---

## Frontend Conventions

### Must use
- **TypeScript** for all new code
- **shadcn/ui** for UI primitives (add via `npx shadcn@latest add <component>`)
- **Zustand** for client state (`src/stores/`)
- **React Router** for routing (`src/app/router.tsx`)
- **`@/` path alias** → `src/`
- **Firebase env vars** with `VITE_` prefix (see `frontend/.env.example`)

### Folder rules
- **Pages** → `src/pages/<feature>/`
- **Reusable UI** → `src/components/`
- **Feature-specific components** → `src/components/<feature>/`
- **API calls** → `src/lib/api/` (create when integrating backend)
- **Firebase** → `src/lib/firebase/`
- **Nav items** → `src/config/navigation.ts` (keep in sync with routes)

### Routes (protected unless noted)

| Path | Page |
|------|------|
| `/login`, `/signup` | Public auth |
| `/dashboard` | Dashboard home |
| `/resume` | Resume upload |
| `/skill-gap` | Skill gap analysis |
| `/roadmap` | AI roadmap |
| `/quiz` | Quiz generator |
| `/mock-interview` | Mock interview |
| `/debate` | Debate arena |

### Auth pattern
- `useAuth()` from `@/hooks/use-auth` (Zustand `auth-store`)
- `ProtectedRoute` / `PublicRoute` in `@/components/auth/protected-route`
- `AuthBootstrap` in `main.tsx` initializes Firebase listener

---

## Development Rules

1. **MVP first** — ship the smallest working slice; avoid premature abstractions.
2. **Modular** — one concern per file; reusable components over copy-paste.
3. **Beginner-friendly** — clear names, shallow folders, minimal magic.
4. **Modern UI** — consistent spacing, responsive layout, accessible forms.
5. **No overengineering** — no extra layers, helpers, or tests unless asked or clearly valuable.
6. **Match existing style** — follow patterns already in `frontend/src/`.
7. **Backend later** — use placeholder pages or typed API stubs until FastAPI endpoints exist.
8. **Secrets** — never commit `.env.local`; only `.env.example` in git.

---

## Environment Variables

### Frontend (`frontend/.env.local`)

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
# VITE_FIREBASE_MEASUREMENT_ID=  (optional)

# Future — FastAPI base URL
# VITE_API_URL=http://localhost:8000
```

---

## API Integration (when backend exists)

- Base URL: `import.meta.env.VITE_API_URL`
- Attach Firebase ID token: `Authorization: Bearer <token>` from `getFirebaseAuth().currentUser.getIdToken()`
- Centralize fetch logic in `src/lib/api/client.ts`
- Handle loading/error states in pages; keep components dumb where possible

---

## Backend Guidelines (FastAPI — future)

- RESTful routes grouped by feature (`/resume`, `/skill-gap`, `/roadmap`, etc.)
- Validate requests with Pydantic models
- CrewAI orchestration stays in Python, not the frontend
- Return JSON shapes documented for frontend types in `src/types/`

---

## What NOT to do

- Do not add new UI libraries alongside shadcn
- Do not replace Zustand with Redux/Context for global state without user request
- Do not break protected-route behavior
- Do not store secrets in source code
- Do not implement full features as mocks when user asked for real integration

---

## Commands

```bash
# Frontend (from frontend/)
npm run dev          # local dev server
npm run build        # production build
npx shadcn@latest add <name>   # add UI component
```

---

## Changelog (implementation notes)

| Date | Note |
|------|------|
| 2026-05-22 | Frontend foundation: Tailwind, shadcn, Firebase auth/Firestore setup, routing, sidebar layout, dashboard shell, Zustand auth store |
| 2026-05-24 | Resume upload: Firestore `resumes` with `extractedText`, client PDF parsing (pdfjs), no Storage; `/resume` page |
| 2026-06-03 | Skill gap: FastAPI `/api/skill-gap/analyze`, CrewAI AMP client (Option B), `/skill-gap` page, `docs/CREWAI_AMP_SETUP.md` |
