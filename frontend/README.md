# Frontend Architecture & Developer Guide

**Application:** Neighborhood Helper — React client  
**Parent:** [Root README](../README.md)  
**Related:** [Backend README](../backend/README.md), [Help Request design](../docs/HelpRequest-system-design.md), [Admin design](../docs/Admin-system-design.md)

---

## Purpose

The frontend is the browser client for Neighborhood Helper. It renders UI, handles user interaction, manages client-side state, and communicates with the Node/Express API in `../backend`.

The frontend **is responsible for:**

- Rendering pages and reusable UI components
- Client-side routing and role-based navigation
- Form input, validation feedback, and loading/error states
- Calling backend REST endpoints through a shared HTTP client

The frontend **must not:**

- Enforce authorization (backend is the source of truth)
- Store business rules or persist data outside the API
- Connect directly to PostgreSQL

---

## System Context

```text
Browser (localhost:5173)
    │
    ├─ Static assets / Vite dev server
    │
    ├─ /api/*  ──proxy──▶  Backend (localhost:8080)
    │                         │
    │                         └─ PostgreSQL
    │
    └─ Geoapify API (direct from browser, location autocomplete)
```

| Layer            | Port / host              | Responsibility                          |
| ---------------- | ------------------------ | --------------------------------------- |
| Vite dev server  | `http://localhost:5173`  | SPA shell, HMR, `/api` proxy in dev     |
| Backend API      | `http://localhost:8080`  | Auth, business logic, database access   |
| Geoapify         | External                 | Address autocomplete (client-side key)  |

---

## Technology Stack

| Concern           | Choice              | Notes                                      |
| ----------------- | ------------------- | ------------------------------------------ |
| Framework         | React 19            | Function components, hooks                 |
| Build tool        | Vite 7              | Dev server, production bundle                |
| Routing           | React Router 7      | Nested routes under `MainLayout`           |
| UI                | MUI 9               | Theme in `src/main.jsx`                    |
| Server state      | TanStack Query 5    | Caching, mutations, session bootstrap      |
| Forms             | React Hook Form     | Login, registration, profile forms         |
| HTTP              | Axios               | `src/services/api.js`, `withCredentials`   |

---

## Application Architecture

```text
main.jsx
├── ThemeProvider (MUI)
├── QueryClientProvider (TanStack Query)
└── App.jsx
    └── MainLayout
        ├── Header
        ├── <Outlet />  ← page routes
        └── (Footer on marketing pages only)

src/
├── pages/           Route-level screens (one primary concern per file)
├── components/      Reusable UI grouped by domain (admin/, auth/, browse/, …)
├── hooks/           Data fetching, mutations, auth/session helpers
├── services/        Axios calls — no JSX
├── context/         Cross-cutting React context (e.g. AppContext)
├── layouts/         Shared page shells
└── utils/           Constants, formatters, shared config
```

### Layer rules

| Layer        | May import from              | Must not contain                |
| ------------ | ---------------------------- | ------------------------------- |
| `pages/`     | components, hooks, services  | Raw `fetch` / inline API URLs   |
| `components/`| hooks, utils                 | Direct database or auth logic   |
| `hooks/`     | services                     | JSX                             |
| `services/`  | utils                        | React hooks or components       |

New feature checklist:

1. Add API function in `src/services/`
2. Add hook in `src/hooks/` if server state is shared
3. Add page in `src/pages/` and register route in `App.jsx`
4. Extract reusable UI into `src/components/`

---

## Route Architecture

All routes are declared in `src/App.jsx` under `MainLayout` unless noted.

### Public routes

| Path                    | Page              | Auth required |
| ----------------------- | ----------------- | ------------- |
| `/`                     | HomePage          | No            |
| `/contact`              | Contact           | No            |
| `/login`                | Login             | No            |
| `/signup`               | SignupPage        | No            |
| `/requesterRegistration`| Register          | No            |

### Protected routes (any logged-in user)

| Path       | Page        | Guard            |
| ---------- | ----------- | ---------------- |
| `/profile` | ProfilePage | `ProtectedRoute` |

### Role-protected routes

| Path                  | Role(s)              | Guard                 |
| --------------------- | -------------------- | --------------------- |
| `/requester-dashboard`| `requester`          | `RoleProtectedRoute`  |
| `/helpRequest`        | `requester`          | `RoleProtectedRoute`  |
| `/browse`             | `volunteer`, `admin` | `RoleProtectedRoute`  |
| `/chat`, `/chat/:id`  | `volunteer`, `requester` | `RoleProtectedRoute` |
| `/admin/*`            | `admin`              | `RoleProtectedRoute`  |

### Route guard behavior

- **Not logged in** → redirect to `/login`
- **Logged in, wrong role** → access denied / redirect (guard-specific)
- **Backend** always re-validates role on every API call — frontend guards are UX only

Post-login redirects are defined per role in `Login.jsx` (e.g. admin → `/admin/dashboard`, requester → `/requester-dashboard`).

---

## Authentication & Session Model

| Concern        | Implementation                                              |
| -------------- | ----------------------------------------------------------- |
| Session        | HTTP-only cookies set by backend on login                   |
| CSRF           | `X-CSRF-TOKEN` header on mutating requests (`POST`/`PATCH`/`DELETE`) |
| Token source   | `user.csrfToken` from `GET /api/auth/me` via `useAuth`      |
| Axios config   | `withCredentials: true` on all API requests                 |
| Session bootstrap | `useAuth` → TanStack Query `['me']` on app load          |

**Trust boundary:** A visible UI element does not imply permission. Always assume the API may return `401` or `403`.

---

## API Integration

### HTTP client

- **File:** `src/services/api.js` (and domain-specific files such as `adminApi.js`)
- **Base URL:** `API_URL` from `src/utils/constants.js` → `import.meta.env.VITE_API_URL || ''`

### Request flow (local development — recommended)

1. Frontend issues request to `/api/...` (relative URL, empty `VITE_API_URL`)
2. Vite dev server proxies `/api` → `http://localhost:8080` (`vite.config.js`)
3. Backend validates session + role, returns JSON

### Request flow (direct backend URL)

1. Set `VITE_API_URL=http://localhost:8080`
2. Axios calls backend origin directly
3. Backend `CLIENT_URL` must include `http://localhost:5173` (CORS + credentials)

### Mutation example

```js
await api.post(
  '/api/requests/:id/accept',
  {},
  { headers: { 'X-CSRF-TOKEN': user.csrfToken } }
);
```

---

## Environment Configuration

Copy `frontend/.env.example` → `frontend/.env`. Restart `npm run dev` after changes.

| Variable               | Required | Default / local value | Purpose                                      |
| ---------------------- | -------- | --------------------- | -------------------------------------------- |
| `VITE_API_URL`         | No       | empty (recommended)   | Axios base URL; empty enables Vite proxy     |
| `VITE_GEOAPIFY_API_KEY`| For location features | —          | Geoapify autocomplete (domain-restricted)  |

### `VITE_API_URL` modes

| Mode        | Value                          | When to use                          |
| ----------- | ------------------------------ | ------------------------------------ |
| Proxy       | empty or unset                 | Local dev (cookies + CSRF simplest)  |
| Direct      | `http://localhost:8080`        | Debugging CORS or bypassing proxy    |
| Production  | `https://<backend-host>`       | `npm run build` / deployed frontend  |

Only variables prefixed with `VITE_` are exposed to the client bundle.

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- npm
- Backend running with PostgreSQL migrated and seeded

### 1. Backend (required first)

```bash
cd backend
npm install
cp .env.example .env
# Set DATABASE_URL and JWT_SECRET
npx prisma migrate deploy
npm run db:seed
npm run dev
```

Expected: `Server running on http://localhost:8080`

Verify:

```bash
curl http://localhost:8080/api/hello
```

Backend `.env` (minimum):

```env
PORT=8080
DATABASE_URL=postgresql://user:password@localhost:5432/neighborhood_helper
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:5173
```

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Expected: `http://localhost:5173`

Sign in with a seeded user from `backend/prisma/seed.js`.

---

## npm Scripts

| Script            | Command           | Purpose                              |
| ----------------- | ----------------- | ------------------------------------ |
| Development       | `npm run dev`     | Vite dev server + HMR                |
| Production build  | `npm run build`   | Output to `dist/`                    |
| Preview build     | `npm run preview` | Serve `dist/` locally                |
| Lint              | `npm run lint`    | ESLint                               |
| Format            | `npm run format`  | Prettier                             |

There is no frontend unit-test runner. API contracts are validated by backend Jest tests (`cd backend && npm test`).

---

## External Integrations

### Geoapify (location autocomplete)

- **Called from:** frontend directly (not proxied through backend)
- **Env:** `VITE_GEOAPIFY_API_KEY`
- **Used by:** help request creation, browse location filters
- **Key handling:** domain-restricted public key; not a server secret
- **On failure:** block submission; do not fall back to unverified free-text address

See [Help Request design](../docs/HelpRequest-system-design.md) for the full location trust model.

---

## Troubleshooting

| Symptom                                      | Likely cause                          | Fix                                              |
| -------------------------------------------- | ------------------------------------- | ------------------------------------------------ |
| Network error on all API calls               | Backend not running                   | Start backend on port 8080                       |
| Login succeeds but session not persisted     | Cookie domain mismatch                | Use `localhost`, not `127.0.0.1`               |
| CORS error with direct `VITE_API_URL`        | `CLIENT_URL` mismatch                 | Set `CLIENT_URL=http://localhost:5173` or use proxy mode |
| Location autocomplete returns nothing        | Missing Geoapify key                  | Set `VITE_GEOAPIFY_API_KEY`, restart dev server  |
| `401` on POST/PATCH/DELETE after login       | Missing CSRF header                   | Pass `X-CSRF-TOKEN` from `useAuth`               |
| Env change has no effect                     | Vite caches env at startup            | Restart `npm run dev`                            |

---

## Related Documentation

| Document | Scope |
| -------- | ----- |
| [Root README](../README.md) | Project overview, full-stack setup |
| [Backend README](../backend/README.md) | API security and controller patterns |
| [Help Request design](../docs/HelpRequest-system-design.md) | Request creation, browse, Geoapify |
| [Admin design](../docs/Admin-system-design.md) | Admin routes and verification rules |
