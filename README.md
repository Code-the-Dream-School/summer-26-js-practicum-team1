# Neighborhood Helper

A full-stack community platform application with a React frontend and a Node/Express backend that connects people who need assistance with volunteers.

## 🧠 Problem Statement

The U.S. has a growing older adult population, with millions of seniors needing support with everyday tasks. Many older adults live alone and face challenges such as grocery shopping, transportation, home maintenance, technology assistance, and social isolation.

Neighborhood Helper aims to connect seniors and community members with trusted volunteers who can provide everyday assistance while building stronger, more connected neighborhoods.

## 🚀 Live Demo

- **Frontend Repo:** https://github.com/Code-the-Dream-School/summer-26-js-practicum-team1/tree/main/frontend
- **Backend Repo:** https://github.com/Code-the-Dream-School/summer-26-js-practicum-team1/tree/main/backend

## 🎯 Features

- **User Registration & Login** – Secure account creation and authentication for requesters, volunteers, and administrators.
- **User Profiles** – Manage personal information, contact details, and user roles.
- **Help Request Management** – Create, edit, view, and manage requests for non-medical assistance.
- **Volunteer Request Matching** – Allow volunteers to browse and accept nearby help requests based on availability.
- **Volunteer Background Verification** – Verify volunteer identities to improve trust and safety within the community.
- **Communication** – Enable requesters and volunteers to communicate about request details and coordination.

## 📸 Screenshots

Add screenshots or GIFs of key features here.

## 🛠 Tech Stack

### Frontend

- **React (Vite)** – Frontend framework and build tool
- **React Router DOM** – Client-side routing
- **Material UI (MUI)** – Responsive UI component library
- **React Hook Form** – Form management and validation
- **TanStack Query (React Query)** – Data fetching, caching, and server state management
- **Axios** – HTTP client for communicating with the backend

### Backend

- **Node.js** – JavaScript runtime environment
- **Express.js** – Backend framework for building RESTful APIs
- **Prisma ORM** – Type-safe database ORM
- **PostgreSQL** – Relational database
- **dotenv** – Environment variable management
- **cors** – Cross-Origin Resource Sharing middleware
- **helmet** – Security middleware for HTTP headers
- **cookie-parser** – Cookie parsing middleware
- **express-rate-limit** – API rate limiting
- **express-xss-sanitizer** – Input sanitization to prevent XSS attacks
- **jsonwebtoken (JWT)** – Authentication and authorization
- **bcrypt** – Password hashing

### Database

- PostgreSQL (Prisma)

### Tooling

- **Git & GitHub** – Version control and collaboration
- **ESLint** – Code linting and quality checks
- **Prettier** – Code formatting
- **npm** – Package management

### Testing

- **Postman** – API development and manual testing

### Deployment

- **Vercel** – Frontend hosting
- **Render** – Backend hosting
- **Neon PostgreSQL** – Cloud PostgreSQL database

## 📁 Project Structure

```text
project-root/
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── layouts/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── config/
│   │   ├── app.js
│   ├── test/
│   ├── server.js
│   └── package.json
│
└── README.md
```

## ⚙️ Setup & Installation

### Prerequisites

- Node.js (v18+ recommended)
- npm
- PostgreSQL

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

Create a `.env` file inside the `backend` folder:

```env
PORT=5000
DATABASE_URL=your_postgres_url

JWT_SECRET=your_secret_key
```

`DATABASE_URL` should point at a PostgreSQL database you can create locally, e.g.:

```env
DATABASE_URL="postgresql://your_user@localhost:5432/neighborhood_helper"
```

Make sure the database itself exists before running migrations:

```bash
createdb -U your_user neighborhood_helper
# or
psql -U your_user -h localhost -c "CREATE DATABASE neighborhood_helper;"
```

`npm install` will automatically run `prisma generate` afterward (via the `prepare` script), which regenerates the Prisma Client from `prisma/schema.prisma`. If you ever see errors about missing Prisma Client types or an out-of-date client, re-run:

```bash
npm run db:generate
```

Once your database exists and `.env` points at it, apply the schema:

```bash
npm run db:migrate
```

This creates the database schema (and any pending migrations) locally. See [Database Setup & Scripts](#database-setup--scripts) below for the full script reference and what each one does.

Finally, start the server:

```bash
npm run dev
```

Backend runs on:
http://localhost:5000

### Database Setup & Scripts

The backend uses Prisma ORM against PostgreSQL. All database-related tasks are exposed as npm scripts.

### First-time setup

1. Create your local PostgreSQL database (see [Backend Setup](#backend-setup) above).
2. Set `DATABASE_URL` in `.env` to point at it.
3. Run `npm install` — this generates the Prisma Client automatically.
4. Run `npm run db:migrate` to create the schema.
5. (Optional) Run `npm run db:seed` to populate it with sample data.

### Script reference

| Script                | What it does                                                                                                                                                                  | Safe in production?                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| `npm run db:generate` | Regenerates Prisma Client from `prisma/schema.prisma`. Runs automatically after `npm install` via `prepare`.                                                                  | Yes                                 |
| `npm run db:migrate`  | Creates and applies migrations during local development (`prisma migrate dev`).                                                                                               | **No — local only**                 |
| `npm run db:deploy`   | Applies already-committed migrations with no prompts and no drift detection (`prisma migrate deploy`). This is the command CI/CD and deployed environments should run.        | Yes                                 |
| `npm run db:status`   | Shows which migrations are applied vs. pending. Read-only.                                                                                                                    | Yes                                 |
| `npm run db:studio`   | Opens Prisma Studio, a GUI for browsing and editing data.                                                                                                                     | **No — local/troubleshooting only** |
| `npm run db:reset`    | **Destructive.** Drops the database, reapplies all migrations from scratch, then reruns the seed script (`prisma migrate reset`).                                             | **No — local only**                 |
| `npm run db:seed`     | Runs `prisma/seed.js` to populate the database with sample data. Wipes and recreates seed records, so it's also destructive to existing data in whatever database it targets. | **No — local/test only**            |

### Test database

Database-backed tests must never run against your development database. Set up an isolated test database before writing any test that touches Prisma directly:

1. Create a separate local database for tests, e.g. `backend_test_db`.
2. Copy `.env.test.example` to `.env.test` and point `DATABASE_URL` at that test database:

```env
   DATABASE_URL="postgresql://your_user@localhost:5432/backend_test_db"
   JWT_SECRET="test-secret-do-not-use-outside-tests"
```

3. Apply migrations to it: `DATABASE_URL="<your test URL>" npx prisma migrate deploy`

`test/setup.js` loads `.env.test` automatically for every Jest run and will throw if `DATABASE_URL` doesn't look like a test database (i.e. doesn't contain the word "test") — this is what prevents a future database-backed test command from silently targeting development data. `.env.test` is git-ignored; only `.env.test.example` is committed as a template.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

```env
# Backend API URL
VITE_BASE_URL=""

# Local backend server
VITE_TARGET="http://localhost:3000"

# Production backend URL (Render)
# VITE_TARGET="https://node-homework-909.onrender.com"

# Google reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Frontend runs on:  
http://localhost:3000

### Frontend

```bash
npm run dev
npm run build
npm run preview
```

### Backend

```bash
npm run dev
npm start
```

## 🔐 API Overview

```text
## Authentication
POST   /api/auth/register              Register a new user
POST   /api/auth/login                 Login user
POST   /api/auth/logout                Logout user
GET    /api/auth/me                    Get current logged-in user


## Users / Profiles
GET    /api/users/:id                  Get user profile
PUT    /api/users/:id                  Update user profile


## Help Requests
GET    /api/requests                   Get all help requests
POST   /api/requests                   Create a help request
GET    /api/requests/:id               Get request details
PUT    /api/requests/:id               Update help request
DELETE /api/requests/:id               Delete help request


## Volunteer
GET    /api/volunteers/requests        View available requests
POST   /api/requests/:id/accept        Accept for a help request


## Messaging
POST   /api/conversations              Create conversation
GET    /api/conversations/:id/messages Get messages
POST   /api/messages                   Send message


## Admin
GET    /api/admin/users/pending        Get pending users
PATCH  /api/admin/users/:id/approve    Approve volunteer
PATCH  /api/admin/users/:id/reject     Reject volunteer
```

## 🤝 Team & Collaboration

### Team Members

| Name                   | Role             |
| ---------------------- | ---------------- |
| Roy Mosby              | Lead Mentor      |
| Rodrigo M. F. Castilho | Mentor           |
| Anastasia Nikulkina    | Assistant Mentor |
| Aarthy Mayakrishnan    | Developer        |
| Archana                | Developer        |
| Cesar Verastegui       | Developer        |
| Derya                  | Developer        |
| Emmanuel Cobian        | Developer        |
| Smeh “Niki”            | Developer        |

### Workflow

- GitHub Issues for task tracking
- Feature branches for development
- Pull Requests required for all merges
- Code reviews before merging to `main`

## 🧩 Development Process

- Agile / sprint-based workflow
- Backend API built before frontend integration
- MVP defined early
- Incremental feature development

## 📌 Known Issues / Limitations

- Additional test coverage can be added for future features
- Performance optimization can be improved as usage grows

## 🛣 Future Improvements

- Add automated testing (Jest, Supertest)
- AI-powered assistant for creating help requests

## 🙌 Acknowledgments

This project was developed as part of the **Code the Dream** program. We are grateful for the mentorship, guidance, and support provided throughout the development process.

Special thanks to:

- **Frank Stepanski** - Team Manager , for supporting the program and creating opportunities for students to gain real-world software development experience.
- **Roy Mosby** - Lead Mentor, for providing guidance, technical support, and valuable feedback throughout the project.
- **Rodrigo M. F. Castilho** - Mentor, for guidance, support, and contributions to our learning journey.
- **Anastasia Nikulkina** - Assistant Mentor, for mentorship, code reviews, and encouragement.

We also appreciate our fellow developers for their collaboration, teamwork, and dedication in building the Neighborhood Helper application.

Finally, we thank the open-source community and the developers behind the tools, libraries, and technologies that helped make this project possible.

## 📄 License

This project is for educational purposes only.
