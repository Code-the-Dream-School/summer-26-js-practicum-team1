# Volunteer Interests & Availability — Data Model

HELPER-29 · parent HELPER-23 · related HELPER-30 (UI), HELPER-31 (API), HELPER-32 (auth)

User story: as a volunteer, I want to add my interests and availability, so I receive suitable volunteer opportunities.

Based on the Neighborhood Helper MVP ER diagram.

---

## Scope

**In**

- How volunteer interests and availability are stored
- `SUPPORT_CATEGORIES` + join rows for interests
- `availability` and `service_area` on `VOLUNTEER_PROFILES`
- Who is allowed to edit these fields

**Out**

- API (HELPER-31)
- Auth wiring (HELPER-32)
- Preferences UI (HELPER-30)
- Matching logic
- Help-request tables

---

## ERD pieces we use

```text
USERS
  └── VOLUNTEER_PROFILES
        ├── availability
        ├── service_area
        ├── verification_status
        └── USER_SUPPORT_CATEGORIES ──► SUPPORT_CATEGORIES
```

| Need                     | Where it lives                    |
| ------------------------ | --------------------------------- |
| Interests list           | `SUPPORT_CATEGORIES`              |
| Selected interests       | `USER_SUPPORT_CATEGORIES`         |
| Availability             | `VOLUNTEER_PROFILES.availability` |
| Area for location filter | `VOLUNTEER_PROFILES.service_area` |
| Request location (later) | `HELP_REQUESTS.location`          |

The ERD draws `USER_SUPPORT_CATEGORIES` off requester profiles (`requester_id`). HELPER-23 is volunteer preferences, so we use the same join pattern with `volunteer_id` → `volunteer_profiles.user_id`. Requester-side prefs can stay a follow-up if needed.

---

## Interests

`SUPPORT_CATEGORIES` is the shared tag list (`id`, `name`, `description`). Admins can manage it later.

MVP seed ideas: Groceries, Errands, Transport, Tech help, Companionship, Home help, Other.

A volunteer’s picks are rows in `USER_SUPPORT_CATEGORIES`:

- `volunteer_id` → `volunteer_profiles.user_id`
- `support_category_id` → `support_categories.id`
- unique on `(volunteer_id, support_category_id)`

Updates replace the whole set in one go (delete old rows, insert the new selection).

---

## Availability

ERD keeps this as one column on the volunteer profile. For MVP we store JSON there so we still get days / times / frequency without a new table.

Example:

```json
{
  "frequency": "WEEKLY",
  "slots": [
    { "dayOfWeek": "MON", "startTime": "09:00", "endTime": "12:00" },
    { "dayOfWeek": "FRI", "startTime": "14:00", "endTime": "18:00" }
  ]
}
```

Rules for later validation:

- `frequency` is `WEEKLY` only for MVP
- `dayOfWeek` is `MON` … `SUN`
- times are `HH:mm`, end after start
- no overlapping slots on the same day
- cap around 14 slots
- times are local community wall-clock (timezone later)

PUT replaces the whole JSON blob.

---

## Service area

`service_area` on `VOLUNTEER_PROFILES` — optional free text for MVP (city, neighborhood, or zip-style string, max 255).

Used later to filter help requests by `HELP_REQUESTS.location`. Exact match rules are not part of this ticket.

---

## Prisma sketch

```prisma
model VolunteerProfile {
  userId             Int                @id
  bio                String?
  availability       Json?
  serviceArea        String?            @map("service_area") @db.VarChar(255)
  verificationStatus VerificationStatus @default(PENDING) @map("verification_status")
  createdAt          DateTime           @default(now()) @map("created_at")
  user               User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  verifications      VolunteerVerification[]
  supportCategories  UserSupportCategory[]

  @@index([verificationStatus])
  @@index([serviceArea])
  @@map("volunteer_profiles")
}

model SupportCategory {
  id          Int      @id @default(autoincrement())
  name        String   @unique @db.VarChar(100)
  description String?
  users       UserSupportCategory[]

  @@map("support_categories")
}

model UserSupportCategory {
  id                Int @id @default(autoincrement())
  volunteerId       Int @map("volunteer_id")
  supportCategoryId Int @map("support_category_id")

  volunteer       VolunteerProfile @relation(fields: [volunteerId], references: [userId], onDelete: Cascade)
  supportCategory SupportCategory  @relation(fields: [supportCategoryId], references: [id], onDelete: Cascade)

  @@unique([volunteerId, supportCategoryId])
  @@map("user_support_categories")
}
```

Keep existing `created_at` / verification fields. Do not add separate availability or interest tables.

---

## Who can edit

- Owner can read/write their own prefs (`req.user.id` = profile `user_id`)
- `ADMIN` can edit too
- Matching reads happen in backend services, not via a public “edit anyone” API

---

## API (HELPER-31)

Self:

- `GET /api/profile` — identity for any logged-in user, plus `requesterProfile` and/or `volunteer` slices when they exist
- `PUT /api/profile/volunteer` — volunteer slice write (`serviceArea`, coordinates, `availability`, `interestIds`)
- `GET /api/support-categories` — shared catalog

Admin:

- `GET /api/admin/users/:id` — user detail shell
- `GET /api/admin/users/:id/volunteer` / `PUT /api/admin/users/:id/volunteer` — same volunteer slice

`PATCH /api/profile` stays requester-only (HELPER-25). Opening it would upsert `RequesterProfile` for volunteers.

Same envelope as login/register: resource on success, `{ error, details? }` on validation errors.

---

## Open points

1. Stick with `volunteer_id` on the join, or one table that also covers requesters as in the ERD drawing?
2. Are empty interests / availability allowed before a volunteer accepts requests?
3. Keep `service_area` free text, or lock it to a fixed city/zip list later?
