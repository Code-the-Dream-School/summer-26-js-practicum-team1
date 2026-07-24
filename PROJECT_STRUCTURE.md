# Project Structure

Overview of the Neighborhood Helper codebase.

**Branch:** `feature/initial-project-setup`

---

## Architecture

```text
Browser  →  Frontend (localhost:5173)  →  Backend (localhost:5000)  →  PostgreSQL
```

---

## Root

```text
├── frontend/     React app (Vite + TypeScript)
├── backend/      Express API
└── README.md     Setup instructions
```

---

## Frontend (`frontend/src/`)

```text
main.tsx              Entry point + providers (Router, MUI, React Query)
App.tsx               Renders routes
routes/index.tsx      URL → page mapping
layouts/MainLayout.tsx   Navbar + page shell
pages/HomePage.tsx       Home page
components/
  HelloMessage.tsx    Fetches and shows API message
  ContactForm.tsx     Form example (React Hook Form + MUI)
services/api.ts       Axios client + API functions
hooks/useHello.ts     React Query hook for /api/hello
context/AppContext.tsx   Global app state (AppProvider)
utils/constants.ts    API_URL constant
```

**Data flow:**

```text
HelloMessage → useHello → getHello() → GET /api/hello
```

**Env:** `frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

**Run:**

```bash
cd frontend && npm install && cp .env.example .env && npm run dev
```

---

## Backend (`backend/src/`)

```text
server.js             Starts server + DB connection
app.js                Express app + middleware
routes/               URL definitions
controllers/          Request/response handling
services/             Business logic
middleware/           Auth, errors, 404
validations/          Input validation
utils/                Prisma, JWT, bcrypt helpers
prisma/schema.prisma  Database models (User)
```

**Request flow:**

```text
GET /api/hello → route → validation → controller → service → JSON response
```

**Middleware order:**

```text
helmet → cors → json → cookies → xss → morgan → rate-limit → routes
```

**Env:** `backend/.env`

```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/neighborhood_helper
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

**Run:**

```bash
cd backend && npm install && cp .env.example .env && npm run db:generate && npm run dev
```

---

## API Endpoints

| Method | URL | Response |
|--------|-----|----------|
| GET | `/` | `{ "success": true, "message": "Backend API is running" }` |
| GET | `/api/hello` | `{ "success": true, "data": { "message": "Hello World" } }` |

---

## Adding Features

**New page:** `pages/` → add route in `routes/index.tsx`

**New API call (frontend):** add function in `services/api.ts` → create hook in `hooks/`

**New API route (backend):** `validations/` → `services/` → `controllers/` → `routes/` → mount in `app.js`

---

## Notes

- Auth utils (`jwt.js`, `hash.js`, `auth.js`) are ready but not wired to routes yet.
- `ContactForm` is client-side only (no backend POST yet).
