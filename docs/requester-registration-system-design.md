# Requester Registration — System Design

HELPER-40 · parent HELPER-8 · related HELPER-41 (UI), HELPER-42 (API)

User story: as a requester, I want to create an account so I can request help from trusted community members.

---

## Scope

**In scope**

- Create a `users` row with role `REQUESTER`
- Fields from the Prisma `User` model
- Client and server validation
- Duplicate email → 409
- Password hashing with bcrypt
- Optional profile image upload
- `POST /api/auth/register`
- Rate limit: 10 requests / 15 min / IP

**Out of scope**

- Login / logout
- Profile completion
- Volunteer or admin signup
- Email verification
- Password reset

---

## Flow

Form submit → client validation → `POST /api/auth/register` → server validation (fields + optional image) → normalize email → check duplicate → hash password → create user with role `REQUESTER` → 201

---

## Role

Role is always `REQUESTER`. It is set by the server. It is not accepted from the request body.

---

## Fields

| Field           | API key        | Required | Rules                                                                                         |
| --------------- | -------------- | -------- | --------------------------------------------------------------------------------------------- |
| Full Name       | `name`         | yes      | trim, 2–100 chars, letters / spaces / hyphens / apostrophes                                   |
| Email           | `email`        | yes      | trim, lowercase, valid email, max 255, unique                                                 |
| Password        | `password`     | yes      | 8–72 chars, at least one uppercase, lowercase, and number; not trimmed; stored as bcrypt hash |
| Date of Birth   | `dob`          | yes      | `YYYY-MM-DD`, not future, age 18–120                                                          |
| Gender          | `gender`       | yes      | `MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY`                                                |
| Phone           | `phone`        | no       | max 20; digits, spaces, `+ - ( )`; empty → `null`                                             |
| Profile picture | `profileImage` | no       | JPEG or PNG only; max 2MB; stored as `profileImage` (`Bytes`); sent as multipart file         |

Age is derived from `dob` for display only. It is not sent to the API.

Response fields: `id`, `name`, `role` only. The image is not returned in the register response.

Unknown fields (including `role`) are rejected.

---

## Validation errors

| Field             | Messages                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name              | `Name is required`, `Name must be at least 2 characters`, `Name must be at most 100 characters`, `Name contains invalid characters`                                          |
| email             | `Email is required`, `Enter a valid email address`                                                                                                                           |
| password          | `Password is required`, `Password must be at least 8 characters`, `Password must be at most 72 characters`, `Password must include uppercase, lowercase, and a number`       |
| dob               | `Date of birth is required`, `Date of birth must be YYYY-MM-DD`, `Date of birth cannot be in the future`, `You must be at least 18 years old`, `Enter a valid date of birth` |
| gender            | `Gender is required`, `Please select a valid gender`                                                                                                                         |
| phone             | `Phone must be at most 20 characters`, `Enter a valid phone number`                                                                                                          |
| profileImage      | `Profile picture must be a JPEG or PNG image`, `Profile picture must be at most 2MB`                                                                                         |
| email (duplicate) | `This email is already registered`                                                                                                                                           |

---

## API

`POST /api/auth/register`

Text fields may be sent as JSON, or as `multipart/form-data` when uploading a profile image. With an image, use `multipart/form-data`: text fields as form fields, file field name `profileImage`.

**Request (JSON, no image)**

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

**Request (multipart, with image)**

- `name`, `email`, `password`, `dob`, `gender`, `phone?` — form fields
- `profileImage` — file (JPEG or PNG, max 2MB)

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

**400**

```json
{
  "success": false,
  "message": "Validation failed",
  "details": [{ "field": "email", "message": "Enter a valid email address" }]
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

- Passwords stored as bcrypt hashes only (12 rounds)
- Role assigned by server only
- Duplicate email blocked before insert; unique constraint as backup
- Profile image type and size checked on the server
- Register rate limit: 10 / 15 min / IP
- Public endpoint
