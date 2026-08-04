# Requester Registration — System Design

HELPER-40 · parent HELPER-8 · related HELPER-41 (UI), HELPER-42 (API)  
Author: Derya · last updated August 2026

Defines what we collect when a requester signs up, how we validate it, and the API contract. Use this for the registration form (HELPER-41) and the register endpoint (HELPER-42). If rules change here, update the code too.

User story: as a requester, I want to create an account so I can request help from trusted community members.

Implemented in HELPER-42 — see PR #13.

---

## Scope

**In:**

- Create a `users` row with role `REQUESTER`
- Fields from the current Prisma `User` model
- Client + server validation
- Duplicate email → 409
- Password hashing with bcrypt
- `POST /api/auth/register`
- Rate limit on register: 10 requests / 15 min / IP

**Out:**

- Login / logout
- Profile completion (address, mobility, emergency contact)
- Profile picture
- `REQUESTER_PROFILES` table
- Volunteer / admin signup on this endpoint
- Email verification, password reset

---

## Flow

Form → client validation → `POST /api/auth/register` → server validation → normalize email, check duplicate → hash password → create user as `REQUESTER` → 201.

Nothing hits the database until server validation passes.

---

## Role

Everyone who registers through this endpoint gets `REQUESTER`. Set it on the server in `user.create`, not from the request body. Do not create a `VolunteerProfile` here.

---

## Fields

| UI (Figma) | API key | Prisma / DB | Required | Notes |
|------------|---------|-------------|----------|-------|
| Full Name | `name` | `name` | yes | max 100 |
| Email | `email` | `email` | yes | unique, max 255 |
| Password | `password` | — | yes | API only; stored as `passwordHash` |
| Date of Birth | `dob` | `dob` | yes | `YYYY-MM-DD` |
| Gender | `gender` | `gender` | yes | Prisma `Gender` enum |
| Phone | `phone` | `phone` | no | max 20 |

Age on Figma is display-only — calculate from DOB, don't send to the API.

Gender: `MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY`.

Server also sets `id`, `role` (`REQUESTER`), `createdAt`, and the password hash. Response returns only `id`, `name`, `role` — never password or hash.

---

## Validation

Same rules on client and server where possible.

**name** — required, trim, 2–100 chars. Letters (unicode), spaces, hyphens, apostrophes.  
Errors: `Name is required`, `Name must be at least 2 characters`, `Name must be at most 100 characters`, `Name contains invalid characters`.

**email** — required, trim, lowercase before check/insert, valid format, max 255.  
Duplicate → 409 `This email is already registered`.  
Errors: `Email is required`, `Enter a valid email address`.

**password** — required, 8–72 chars, at least one upper, lower, and number. Don't trim. Hash with bcrypt (12 rounds).  
Errors: `Password is required`, `Password must be at least 8 characters`, `Password must be at most 72 characters`, `Password must include uppercase, lowercase, and a number`.

**dob** — required, `YYYY-MM-DD`, not future, age 18–120.  
Errors: `Date of birth is required`, `Date of birth must be YYYY-MM-DD`, `Date of birth cannot be in the future`, `You must be at least 18 years old`, `Enter a valid date of birth`.

**gender** — required, must match enum.  
Errors: `Gender is required`, `Please select a valid gender`.

**phone** — optional; digits, spaces, `+ - ( )`; empty → `null`.  
Errors: `Phone must be at most 20 characters`, `Enter a valid phone number`.

Reject unknown fields (especially `role`).

---

## API

`POST /api/auth/register`

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

**201**

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

`role` in the response is lowercase (`requester` / `volunteer` / `admin`). DB stores `REQUESTER`.

**400**

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [
    { "field": "email", "message": "Enter a valid email address" }
  ]
}
```

**409**

```json
{
  "success": false,
  "message": "This email is already registered"
}
```

---

## Security

- bcrypt only; never log plain passwords
- role from server only
- duplicate check + unique constraint
- register rate limit (10 / 15 min / IP)
- public endpoint — no session required

---

## UI notes (HELPER-41)

Figma: `/requesterregistration`.

| Figma | What to do |
|-------|------------|
| Name, email, DOB, gender | as above |
| Age | show only, from DOB |
| Password | not on Figma — add it |
| Phone | optional |
| Profile upload | skip for now |
| "Update My Profile" | use "Create account" for signup |

Handle loading, field errors, 409, network errors. After success, redirect to `/login` for MVP unless the team decides on auto-login.

Likely files: `Register.jsx`, `register()` in `api.js`, `/register` route, fix the sign-up link on login. Match the login card layout.

---

## Open questions

- Auto-login after register?
- Redirect after success (`/login` for MVP)
- Shared Sign Up / role-choice page before requester vs volunteer registration
