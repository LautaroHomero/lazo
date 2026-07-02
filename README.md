# Lazo — Compliance Obligations Tracker

A full-stack application for tracking corporate compliance obligations: what needs to be filed, when it's due, what state it's in, and what documentation it requires. The goal of the project is to model the domain rigorously — status transitions, overdue detection, document-gated rules, audit history, and concurrency — as **server-side business rules**, not just UI conventions.

The backend follows a clean/domain-driven architecture (API → application use cases → domain → infrastructure). The frontend is a Next.js App Router app with a dashboard that offers Table, Kanban, and Calendar views over the same data.

---

## Quick start

**Try it locally in under a minute with Docker:**

```bash
docker compose up --build -d
docker compose exec backend python3 seed_db.py
```

- Frontend → http://localhost:3000
- Backend → http://localhost:8000
- API docs (Swagger) → http://localhost:8000/docs

**Login:** the dashboard is gated behind a simple demo login (no real user management — see [Known limitations](#known-limitations)):

```
user: admin
password: secret
```

---

## Highlights

- **Business rules enforced server-side, not just in the UI.** Invalid status transitions and the "document required before submitting" rule are rejected by the backend and never persisted, regardless of what the client sends.
- **Explicit, table-driven state machine** (`backend/domain/state_machine.py`) — adding a new status only means editing one dictionary, no branching `if` chains.
- **Optimistic concurrency control.** Every obligation carries a `version`; concurrent updates that read a stale version are rejected with a 409 instead of silently overwriting each other's changes.
- **Audit trail.** Every status change is recorded with `from_status`, `to_status`, and a timestamp, and returned with the obligation.
- **Overdue is derived, not stored.** `is_overdue` is computed from `due_date` and `status` at read time, so it's always correct even if nobody "closes" an obligation.
- **Sensitive data masking.** `company_tax_id` is stored in full but returned masked (`••••1234`) in every API response.
- **Three synchronized dashboard views** (Table, Kanban by status, and a read-only monthly Calendar) with search, status filtering, and pagination — all driven by the same data and the same i18next-backed translations.
- **Docker Compose for local development, deployable independently to Vercel** (frontend) + any container host (backend) for a public demo — see [Deployment](#deployment).

## Known limitations

Being transparent about the current scope:

- No real authentication/authorization — the login is a hardcoded demo credential meant to gate the UI, not a security boundary. There's no per-user data or RBAC.
- Document uploads are stored on local disk on the backend, not a real object store (S3, etc.), so they require a host with persistent disk.
- No CI/CD pipeline or automated linting on push.
- No pagination/limits on the raw list/dashboard API endpoints themselves (pagination currently lives in the frontend's Table view).
- Observability is minimal (no structured logging or metrics).

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | FastAPI, Pydantic, SQLAlchemy |
| Persistence | PostgreSQL (Docker Compose) or SQLite (local dev, zero setup) |
| Frontend | Next.js 14 (App Router), React, TypeScript (strict), Tailwind CSS |
| i18n | i18next / react-i18next (English & Spanish) |
| Icons | lucide-react |
| Backend tests | Python `unittest` (standard library) |

---

## Project structure

```
lazo/
├── docker-compose.yml
├── DEPLOY.md                 # Vercel + external backend hosting guide
├── backend/
│   ├── api/                  # FastAPI routes, request/response schemas wiring
│   ├── application/          # Use cases (CreateObligation, UpdateObligation, ChangeStatus, ...)
│   ├── domain/                # Entities, enums, state machine, domain errors
│   ├── infraestructure/       # SQLAlchemy repository implementation
│   ├── db/                   # Engine/session config, ORM models, mappers
│   ├── schemas/               # Pydantic request/response models
│   ├── tests/                 # unittest test suite
│   └── seed_db.py             # Sample data generator
│
└── frontend/
    ├── app/
    │   ├── auth/               # Demo login
    │   ├── dashboard/          # Table / Kanban / Calendar views
    │   ├── obligations/        # Detail, create, edit
    │   └── actions/             # Server Actions calling the backend API
    ├── components/             # AppShell, KanbanBoard, Calendar, ObligationCard, ...
    └── lib/                    # API client, i18next setup, translations
```

### Backend layers

- **API** (`api/`) — HTTP endpoints; translates requests into use case calls and domain errors into HTTP status codes.
- **Application** (`application/`) — one class per use case (`CreateObligation`, `UpdateObligation`, `ChangeStatus`, `AttachDocument`, `DeleteObligation`, `GetDashboard`).
- **Domain** (`domain/`) — the `Obligation` entity, `ObligationStatus`/`ObligationType` enums, `StateMachine`, and domain-specific exceptions. No framework dependencies here.
- **Infraestructure** (`infraestructure/`) — the SQLAlchemy-backed repository implementing the domain's repository interface (optimistic locking, mapping ORM ↔ domain).
- **DB** (`db/`) — engine/session setup, ORM models, and settings (`db/config.py`), all environment-variable driven.

---

## Business rules

### State machine

```
pending ──────────────▶ in_progress
  ▲                        │  ▲
  └────────────────────────┘  │
                               ▼
                          submitted
                               │  ▲
                               ▼  │
                             done ┘
```

Allowed transitions (`backend/domain/state_machine.py`):

- `pending → in_progress`
- `in_progress → pending`
- `in_progress → submitted`
- `submitted → in_progress`
- `submitted → done`
- `done → in_progress`

Any other transition is rejected with `InvalidTransitionError` (HTTP 400) and never persisted.

### Other invariants

- **Document-gated submission**: if `requires_document` is `true`, the obligation cannot move to `submitted` until a document has been attached.
- **Overdue is derived**: `is_overdue = due_date < today AND status not in (submitted, done)`, computed on every read.
- **Due date validation on write**: creating an obligation with a past due date is rejected. Updating one only re-validates the due date **if it's actually changing** — so you can still rename or edit any other field of an obligation that's already overdue without being blocked by that same rule.
- **Optimistic concurrency**: updates carry the `version` the client last read; if it doesn't match the current stored version, the API returns 409 instead of overwriting a concurrent change.
- **Masked tax id**: `company_tax_id` is always returned masked in API responses.

---

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/obligations` | Create an obligation |
| GET | `/api/obligations` | List all obligations |
| GET | `/api/obligations/{id}` | Get a single obligation |
| PUT | `/api/obligations/{id}` | Update an obligation (title, description, type, due date, owner, tax id, requires_document) |
| DELETE | `/api/obligations/{id}` | Delete an obligation |
| POST | `/api/obligations/{id}/status` | Change status (validated against the state machine) |
| POST | `/api/obligations/{id}/documents` | Attach a document (multipart upload) |
| GET | `/api/dashboard` | Obligations grouped by status |
| GET | `/api/health` | Health check |

Interactive docs are available at `/docs` (Swagger) and `/redoc` on any running backend instance.

---

## Frontend features

- **Dashboard with three views**, switchable via `?view=table|kanban|calendar`, all sharing the same search/status filters (except the calendar, which is intentionally read-only/informational):
  - **Table** — a flat, sortable-by-due-date list with pagination (4 items per page).
  - **Kanban** — one column per status, with quick edit/delete actions on every card.
  - **Calendar** — a month view you can page through (prev/next month) that marks days with due obligations. It never filters or mutates data — it's purely informational.
- **Create / Edit / Delete** obligations from the UI (the edit form lets you change the title and due date even on an already-overdue obligation — see the due date rule above).
- **Status transitions and document upload** from the obligation detail page.
- **i18n via i18next/react-i18next** (English/Spanish), with a single resource dictionary shared between server components (via a plain, server-safe i18next instance) and client components (via `useTranslation`).
- **Audit history and version** shown on the obligation detail page.

---

## Running the project

### Option 1 — Local development with SQLite (fastest, no Docker)

Backend:

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python3 seed_db.py
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Frontend (in another terminal):

```bash
cd frontend
npm install
npm run dev
```

- Frontend → http://127.0.0.1:3000
- Backend → http://127.0.0.1:8000

By default the backend uses a local SQLite file (`backend/lazo.db`) — no database setup required.

### Option 2 — Docker Compose (PostgreSQL, everything together)

```bash
docker compose up --build -d
docker compose exec backend python3 seed_db.py
```

- Frontend → http://localhost:3000
- Backend → http://localhost:8000
- Postgres → localhost:5432

Inside the Docker network, the frontend talks to the backend at `http://backend:8000/api`; from your browser/host machine, the backend is reachable at `http://localhost:8000`.

### Option 3 — Public demo (Vercel + external backend host)

The frontend can be deployed to Vercel while the backend + Postgres run on a persistent host (Render, Railway, Fly.io, a VPS, etc.) — Vercel isn't a good fit for the backend itself (it needs a persistent process and local disk for uploaded documents). Full step-by-step instructions, required environment variables, and a deployment checklist are in **[DEPLOY.md](DEPLOY.md)**.

---

## Environment variables

See `backend/.env.example` and `frontend/.env.example` for the full list. The short version:

**Backend**
- `DATABASE_URL` — defaults to local SQLite; set to a Postgres URL in Docker/production.
- `ALLOWED_ORIGINS` / `ALLOWED_ORIGIN_REGEX` — CORS allow-list for the frontend's origin(s).
- `PUBLIC_BASE_URL` — the backend's public URL, used to build absolute links to uploaded documents.

**Frontend**
- `API_URL` — backend URL used server-side (Server Components/Actions).
- `NEXT_PUBLIC_API_URL` — backend URL exposed to the browser bundle.

---

## Testing

```bash
cd backend
python3 -m unittest discover -s tests -p "test_*.py"
```

Covers domain rules (state machine, document-gating), due-date validation (including the "can still edit an overdue obligation" rule), optimistic concurrency, repository persistence, and deletion.

---

## Mock data

`backend/seed_db.py` creates four obligations covering every status (pending, in_progress with a document, submitted with an audit trail, and done) so you can exercise the full workflow immediately after seeding.
