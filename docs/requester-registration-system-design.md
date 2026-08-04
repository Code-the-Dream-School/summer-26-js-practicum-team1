# Requester Registration — System Design

HELPER-40 · parent HELPER-8 · related HELPER-41 (UI), HELPER-42 (API)  
Author: Derya · last updated August 2026

This doc covers what we collect when a requester signs up, how we validate it, and what the backend should do with it. Archana can use it for the registration form (HELPER-41); I'll implement the API side (HELPER-42). If we change anything here, update the code too.

User story: as a requester, I want to create an account so I can request help from trusted community members.

---

## What we're building (and not)

**In scope for now:**

- Create a row in `users` with role `REQUESTER`
- Fields from the current Prisma `User` model
- Validation on client (HELPER-41) and server (HELPER-42)
- Duplicate email → 409
- Password hashing with bcrypt (already in `backend/package.json`)
- `POST /api/auth/register`
- Stricter rate limit on register: 10 requests per 15 min per IP (global limit is already 100/15min in `middleware/index.js`)

**Not in this work:**

- Login/logout — HELPER-20 branch exists but isn't on `main` yet
- Profile completion (address, mobility, emergency contact)
- Profile picture (`profileImage` on User — later)
- `REQUESTER_PROFILES` table — still not in schema
- Creating `VolunteerProfile` / `VolunteerVerification` rows (those models were added for volunteer/admin flows in PR #7/#10)
- Volunteer or admin signup through this endpoint
- Email verification, password reset

---

## Flow

User fills the form → frontend validates → `POST /api/auth/register` → server validates → normalize email, check duplicate → hash password → `prisma.user.create` with `REQUESTER` → 201.

Nothing hits the database until server validation passes.

---

## Role

Everyone who registers through this endpoint gets `REQUESTER`. Set it in the service on `user.create`, not from the request body. Don't create a `VolunteerProfile` row here.

Prisma `Role` enum: `REQUESTER`, `VOLUNTEER`, `ADMIN`.

---

## Fields

| UI (Figma) | API key | Prisma / DB | Required | Notes |
|------------|---------|-------------|----------|-------|
| Full Name | `name` | `name` | yes | max 100 |
| Email | `email` | `email` | yes | unique, max 255 |
| Password | `password` | — | yes | sent in API only; stored as `passwordHash` → `hashed_password` |
| Date of Birth | `dob` | `dob` | yes | `YYYY-MM-DD` |
| Gender | `gender` | `gender` | yes | Prisma `Gender` enum |
| Phone | `phone` | `phone` | no | max 20 |

Age on Figma is display-only — calculate from DOB, don't send to API.

Gender values: `MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY`.

Server also sets: `id` (auto), `role` (`REQUESTER`), `createdAt`, hashed password. Response should only return `id`, `name`, `role` — never password or hash.

---

## Validation

Same rules on client and server where possible.

**name** — required, trim, 2–100 chars. Letters (unicode), spaces, hyphens, apostrophes.  
Errors: `Name is required`, `Name must be at least 2 characters`, `Name must be at most 100 characters`, `Name contains invalid characters`.

**email** — required, trim, lowercase before check/insert, valid format, max 255.  
Duplicate → 409 `This email is already registered`. Prisma `@unique` is the backup.  
Errors: `Email is required`, `Enter a valid email address`.

**password** — required, 8–72 chars (bcrypt limit), at least one upper, lower, and number. Don't trim. Hash with bcrypt only.  
No shared salt-round constant on `main` yet — I'm going with 12 rounds for HELPER-42; should align with HELPER-20 when that merges.  
Errors: `Password is required`, `Password must be at least 8 characters`, `Password must be at most 72 characters`, `Password must include uppercase, lowercase, and a number`.

**dob** — required, `YYYY-MM-DD`, valid date, not future, min age 18, max 120. Date-only, no timezone games.  
Errors: `Date of birth is required`, `Date of birth must be YYYY-MM-DD`, `Date of birth cannot be in the future`, `You must be at least 18 years old`, `Enter a valid date of birth`.

**gender** — required, must match enum.  
Errors: `Gender is required`, `Please select a valid gender`.

**phone** — optional; digits, spaces, `+ - ( )`; empty → `null`.  
Errors: `Phone must be at most 20 characters`, `Enter a valid phone number`.

Use a strict Joi schema on the backend — strip or reject extra fields, especially `role`.

---

## API

README says `POST /api/auth/register`. Note: frontend login uses `/logon` and `/logoff` in `api.js`, not README's `login`/`logout`. Register path should match README.

**Request:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass1",
  "dob": "1990-05-15",
  "gender": "FEMALE",
  "phone": "555-123-4567"
}
```

`phone` optional. No `role` in body.

**Responses** — match what admin endpoints already do on `main` (`{ success, message, data }`) and `error.middleware.js`:

201:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Jane Doe",
    "role": "requester"
  }
}
```

`role` in response is lowercase because `Login.jsx` uses `requester` / `volunteer` / `admin` in redirects. DB stores `REQUESTER`.

400 validation:
```json
{
  "success": false,
  "message": "Validation failed",
  "details": [
    { "field": "email", "message": "Enter a valid email address" }
  ]
}
```

409 duplicate email:
```json
{
  "success": false,
  "message": "This email is already registered"
}
```

500 — generic message, no stack trace. Use `ApiError` from `utils/ApiError.js` for thrown errors.

---

## Backend (HELPER-42)

Route `POST /register` under `/api/auth`, rate limiter on that route, controller with `asyncHandler`, validation module, service for duplicate check + bcrypt + create.

Follow the same layering as `admin.routes` / `admin.controllers` / `admin.service` on `main`.

Files to add:
- `validations/registerSchema.js`
- `controllers/auth.controller.js`
- `services/auth.service.js`
- `routes/auth.routes.js`

Mount in `app.js`: `app.use('/api/auth', authRoutes)`.

`joi` isn't in `package.json` on `main` yet — add it in HELPER-42 (HELPER-20 branch uses Joi too).

What's already on `main`: hello + admin routes, `ApiError`, `asyncHandler`, Prisma client with `@prisma/adapter-pg` in `config/prisma.js`, mock auth middleware for testing. No auth routes or register endpoint yet.

DB: one insert into `users`. No volunteer tables, no requester profile table. Email normalized lowercase. Required columns: `name`, `email`, `passwordHash`, `dob`, `gender`.

---

## Security notes

- bcrypt only for passwords, never log plain text
- role from server only
- XSS sanitizer already in global middleware
- duplicate check before insert + unique constraint
- register-specific rate limit (10 / 15 min / IP)
- public endpoint — no session required

---

## UI notes for Archana (HELPER-41)

Figma page: `/requesterregistration`.

On `main` we have `Login.jsx`, `Header`, `useAuth`, routes for `/` and `/login`. No register page yet; login "Sign up" still goes to `/`.

| Figma | What to do |
|-------|------------|
| Name, email, DOB, gender | as above |
| Age | show only, from DOB |
| Password | not on Figma — needs to be added |
| Phone | optional field |
| Profile upload | skip for now |
| Button says "Update My Profile" | use "Create account" for signup |

Handle loading, field errors, 409, network errors, success. After success — probably redirect to `/login` for MVP (team hasn't decided on auto-login).

New files likely: `Register.jsx`, `register()` in `api.js`, `/register` route, fix sign-up link on login. Match login card layout.

---

## Still open

- Auto-login after register?
- Redirect URL after success (`/login` seems fine for MVP)
- Email verification — not in schema
- Strict Joi vs strip unknown fields — I'm leaning strict
- Phone normalization — nothing in repo yet
- bcrypt rounds — 12 for now, sync with HELPER-20
- README vs frontend auth path naming (`login` vs `logon`)

---

## References

- Jira HELPER-8, 40, 41, 42
- `backend/prisma/schema.prisma` — User, VolunteerProfile, VolunteerVerification
- Root `README.md`
- Figma `/requesterregistration`
- `frontend/src/pages/Login.jsx`, `services/api.js`, `hooks/useAuth.js`
- `admin.controllers.js`, `utils/ApiError.js`, `utils/asyncHandler.js`

Recent `main` stuff that affects this: PR #6 added login UI (no register yet). PR #7/#10 added volunteer verification and admin APIs — registration should use the same response/error patterns. HELPER-20 login API still only on a branch.

Figma gaps: no password field (schema needs it), profile upload deferred. ER diagram still shows `REQUESTER_PROFILES` but Prisma has volunteer tables instead.
