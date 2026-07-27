# Project Structure

Overview of the Neighborhood Helper codebase.

**Branch:** `feature/initial-project-setup`

---

## Architecture

```text
Browser  →  Frontend (localhost:5173)  →  Backend (localhost:5001)
```

---

## Root

```text
├── frontend/     React app (Vite + JavaScript)
├── backend/      Express API
└── README.md     Setup instructions
```

---

## Frontend (`frontend/src/`)

```text
main.jsx              Entry point + providers (Router, MUI, React Query)
App.jsx               Renders routes
routes/index.jsx      URL → page mapping
layouts/MainLayout.jsx   Navbar + page shell
pages/HomePage.jsx       Home page
components/
  HelloMessage.jsx    Fetches and shows API message
services/api.js       Axios client + API functions
hooks/useHello.js     React Query hook for /api/hello
context/AppContext.jsx   Global app state (AppProvider)
utils/constants.js    API_URL constant
```

**Data flow:**

```text
HelloMessage → useHello → getHello() → GET /api/hello
```

**Env:** `frontend/.env` (optional in dev — Vite proxies `/api` to the backend)

```env
# VITE_API_URL=http://localhost:5001  # only needed for production builds
```

**Run:**

```bash
cd frontend && npm install && cp .env.example .env && npm run dev
```

---

## Backend (`backend/src/`)

```text
server.js             Starts server
app.js                Express app + middleware
routes/               URL definitions
controllers/          Request/response handling
services/             Business logic
middleware/           Error handling, 404
validations/          Input validation
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
PORT=5001
DATABASE_URL=postgresql://user:password@localhost:5432/neighborhood_helper
FRONTEND_URL=http://localhost:5173
```

**Run:**

```bash
cd backend && npm install && cp .env.example .env && npm run dev
```

---

## API Endpoints

| Method | URL | Response |
|--------|-----|----------|
| GET | `/` | `{ "success": true, "message": "Backend API is running" }` |
| GET | `/api/hello` | `{ "success": true, "data": { "message": "Hello World" } }` |

---

## Adding Features

**New page:** `pages/` → add route in `routes/index.jsx`

**New API call (frontend):** add function in `services/api.js` → create hook in `hooks/`

**New API route (backend):** `validations/` → `services/` → `controllers/` → `routes/` → mount in `app.js`
