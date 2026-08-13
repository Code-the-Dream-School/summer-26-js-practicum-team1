# Volunteer Interests & Availability — Data Model

HELPER-29 · parent HELPER-23 · HELPER-30 (UI) · HELPER-31 (API) · HELPER-32 (auth)

**Story:** As a volunteer, I want to add my interests and availability so I get suitable opportunities.

---

## 1. Scope

| In | Out |
|----|-----|
| Storage for interests, availability, service area | Matching engine |
| Who can read/write | Help-request tables / browse UI |
| API path contract for HELPER-31/32 | Building the endpoints/UI (those tickets) |

---

## 2. Architecture

```text
┌─────────────┐       1:1        ┌──────────────────────┐
│    User     │─────────────────▶│  VolunteerProfile    │
└─────────────┘                  │  - availability      │
                                 │  - service_area      │
                                 │  - verification_…    │
                                 └──────────┬───────────┘
                                            │ M:N
                                            ▼
                                 ┌──────────────────────┐
                                 │ UserSupportCategory  │
                                 └──────────┬───────────┘
                                            │
                                            ▼
                                 ┌──────────────────────┐
                                 │  SupportCategory     │
                                 │  (shared tag list)   │
                                 └──────────────────────┘
```

| Concern | Table / column |
|---------|----------------|
| Tag catalog | `support_categories` |
| Volunteer’s selected tags | `user_support_categories` |
| Weekly time slots | `volunteer_profiles.availability` (JSON) |
| Location hint | `volunteer_profiles.service_area` |

Join key: `volunteer_id` → `volunteer_profiles.user_id` (volunteer-only for MVP).

---

## 3. Fields

### Interests

- Catalog: `id`, `name`, `description` (admin-managed later)
- MVP seeds: Groceries, Errands, Transport, Tech help, Companionship, Home help, Other
- Unique `(volunteer_id, support_category_id)`
- Save = replace set (delete + insert)

### Availability (JSON on profile)

```json
{
  "frequency": "WEEKLY",
  "slots": [
    { "dayOfWeek": "MON", "startTime": "09:00", "endTime": "12:00" }
  ]
}
```

| Rule | MVP |
|------|-----|
| `frequency` | `WEEKLY` only |
| `dayOfWeek` | `MON` … `SUN` |
| time | `HH:mm`, end > start |
| overlap | not on same day |
| max slots | ~14 |
| timezone | local wall-clock (later) |

PUT replaces the whole blob.

### Service area

Optional string, max 255 (city / neighborhood / zip-style). Used later for request location filter — matching rules out of scope here.

---

## 4. Prisma sketch

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

No separate availability/interest tables. Keep existing verification fields.

---

## 5. Access control

| Actor | Access |
|-------|--------|
| Volunteer (owner) | Read/write own prefs |
| Admin | Read/write any volunteer’s prefs |
| Others | No direct prefs write API |

Owner check: `req.user.id` === profile `user_id`.  
Pending volunteers (have `VolunteerProfile`) can save prefs.

---

## 6. API contract

Self routes sit under `/api/profile` (shared profile area). Admin UI uses `/admin/users/:id` with a prefs section when the user is a volunteer.

| Method | Path | Who |
|--------|------|-----|
| `GET` | `/api/profile/support-categories` | any logged-in user (JWT) |
| `GET` | `/api/profile/preferences` | owner (JWT) |
| `PUT` | `/api/profile/preferences` | owner (JWT + CSRF) |
| `GET` | `/api/admin/users/:id/preferences` | admin (JWT + CSRF + ADMIN) |
| `PUT` | `/api/admin/users/:id/preferences` | admin (JWT + CSRF + ADMIN) |

**PUT body:** `{ serviceArea?, availability?, interestIds: number[] }`

**Success:** prefs resource. **Validation fail:** `{ error, details? }` (admin may use `{ success, data }` if that matches existing admin style).

---

## 7. MVP decisions

1. Volunteer-only join table  
2. Empty interests / availability allowed  
3. Free-text `service_area`  
