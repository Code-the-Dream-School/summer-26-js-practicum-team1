# Volunteer Registration - System Design

Helper 43 - Helper 9 (parent) - Helper 44 (UI related) - Helper 45 (Backend API) - Helper 46 (Backend validation)

User story: As a volunteer, I want to register for the platform so I can become a trusted community member and help the elderly, people of disability, new parent and/or others facing temporary or long-term challenges in need of my community.

---

## Scope

- Fields from the Prisma `User` model
- Client and server validation
- Duplicate email -> 409
- Password hashing with bcrypt
- Optional profile image upload
- `POST /api/auth/register`

## Out of scopre

- Login / logout
- Profile completion
- Email verification
- Password verification

---

## Flow

Form submit -> client validation -> `POST /api/auth/register` -> server validation (fields + optional image) -> check duplicate email -> hash password -> create volunteer user (`role: VOLUNTEER`) + pending VolunteerProfile -> 201

---

## Fields

| Field           | API key        | Required | Rules                                                                                                     |
| --------------- | -------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| Full Name       | `name`         | yes      | trim, 2–100 chars, letters / spaces / hyphens / apostrophes                                               |
| Email           | `email`        | yes      | trim, lowercase, valid email, max 255, unique                                                             |
| Phone           | `phone`        | no       | max 20; digits, spaces, `+ - ( )`; empty → `null`                                                         |
| Gender          | `gender`       | yes      | `MALE`, `FEMALE`, `OTHER`, `PREFER_NOT_TO_SAY`                                                            |
| Date of Birth   | `dob`          | yes      | `YYYY-MM-DD`, not future, age 18–120                                                                      |
| Profile picture | `profileImage` | no       | JPEG or PNG only; max 2MB; stored as `profileImage` (`Bytes`); sent as multipart file                     |
| Password        | `password`     | yes      | 8–72 chars, pattern: (/^(?=._[a-z])(?=._[A-Z])(?=._\d)(?=._[^a-zA-Z0-9]).{8,72}$/); stored as bcrypt hash |

---

## Validation errors

| Field             | Messages                                                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| name (Full Name)  | `Name is required`, `Name must be at least 2 characters`, `Name must be at most 100 characters`, `Name contains invalid characters`                                          |
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
  "name": "Jhon Doe",
  "email": "jhon@example.com",
  "password": "!Test123",
  "dob": "1990-05-15",
  "gender": "MALE",
  "phone": "+1-555-123-4567",
  "accountType": "volunteer"
}
```

**Request (multipart, with image)**

```json
{
  "name": "Jhon Doe",
  "email": "jhon@example.com",
  "password": "!Test123",
  "dob": "1990-05-15",
  "gender": "MALE",
  "phone": "555-123-4567",
  "profileImage": "userImage.png",
  "accountType": "volunteer"
}
```

**201**

```json
{
  "id": 1,
  "name": "Jhon Doe",
  "role": "volunteer",
  "verificationStatus": "pending"
}
```

**400**

```json
{
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
- Register rate limit: 10 / 15 min / IP (skipSuccessfulRequest: true - only count unsuccesful request)
- Public endpoint
