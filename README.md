# Neighborhood Helper

A full-stack community platform with a React frontend and Node/Express backend that connects people who need assistance with volunteers.

## Tech Stack

### Frontend
- React (Vite) + TypeScript
- React Router DOM
- Material UI
- React Hook Form
- TanStack Query (React Query)
- Axios

### Backend
- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT, bcrypt, helmet, cors, cookie-parser, rate limiting, XSS sanitization

### Tooling
- ESLint + Prettier
- Git & GitHub

## Project Structure

```text
project-root/
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       ├── utils/
│       └── routes/
└── backend/
    └── src/
        ├── routes/
        ├── controllers/
        ├── middleware/
        ├── services/
        ├── utils/
        └── validations/
    └── prisma/
```

## Setup & Installation

### Prerequisites
- Node.js (v18+)
- npm
- PostgreSQL (local or cloud)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET
npm run db:generate
npm run db:migrate   # requires a running PostgreSQL instance
npm run dev
```

Backend runs on: **http://localhost:5000**

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on: **http://localhost:5173**

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `JWT_SECRET` | Secret key for JWT signing |
| `FRONTEND_URL` | Frontend origin for CORS (default: http://localhost:5173) |
| `NODE_ENV` | Environment (`development` / `production`) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL (default: http://localhost:5000) |

## Available Scripts

### Frontend
```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # Run ESLint
npm run format    # Run Prettier
```

### Backend
```bash
npm run dev          # Start dev server with nodemon
npm start            # Start production server
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run db:generate  # Generate Prisma client
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
```

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/hello` | Sample API endpoint |

## Team Workflow

- GitHub Issues for task tracking
- Feature branches for development
- Pull Requests required for merges to `main`
- Code reviews before merging

## License

Educational use only.
