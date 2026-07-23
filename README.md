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
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── app.js
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

# Google reCAPTCHA
RECAPTCHA_SECRET=your_recaptcha_secret
RECAPTCHA_BYPASS=your_recaptcha_bypass_value

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3001
```

Backend runs on:  
http://localhost:5000

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

## 🧪 Available Scripts

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

- **Frank Stepanski** - Associate Director of CTD , for supporting the program and creating opportunities for students to gain real-world software development experience.
- **Roy Mosby** - Lead Mentor, for providing guidance, technical support, and valuable feedback throughout the project.
- **Rodrigo M. F. Castilho** - Mentor, for guidance, support, and contributions to our learning journey.
- **Anastasia Nikulkina** - Assistant Mentor, for mentorship, code reviews, and encouragement.

We also appreciate our fellow developers for their collaboration, teamwork, and dedication in building the Neighborhood Helper application.

Finally, we thank the open-source community and the developers behind the tools, libraries, and technologies that helped make this project possible.

## 📄 License

This project is for educational purposes only.
