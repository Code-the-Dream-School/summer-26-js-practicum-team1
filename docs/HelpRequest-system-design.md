# Help Request Creation

## Overview

Authenticated requesters (role `REQUESTER`) can create help requests, stored in **HelpRequest** and linked to the requester via **User**.

## Database Fields

| Field                   | Type        | Required | Notes                                                                                                                         |
| ----------------------- | ----------- | -------- | ----------------------------------------------------------------------------------------------------------------------------- |
| id                      | Int     | Yes      | Primary key                                                                                                                   |
| requesterId             | Int (FK) | Yes      | From auth session, never client body                                                                                          |
| volunteerId             | Int (FK) | No       | Null at creation; set later via assignment flow                                                                               |
| title                   | String      | Yes      | Max ~100 chars                                                                                                                |
| category                | Enum        | Yes      | Grocery, Transportation, Household Chores, Yard Work, Pet Care, Tech Support, Companionship, Meal Prep, Medical Errand, Other |
| urgency                 | Enum        | Yes      | Low, Medium, High                                                                                                             |
| scheduledAt             | DateTime    | Yes      | Must be in the future                                                                                                         |
| address                 | String      | Yes      | From Geoapify                                                                                                                 |
| latitude / longitude    | Float       | Yes      | From Geoapify, needed for volunteer matching                                                                                  |
| placeId                 | String      | No       | Geoapify place ID, for re-lookup                                                                                              |
| description             | String      | No       | Free text                                                                                                                     |
| status                  | Enum        | Yes      | `PENDING` (default) → `ACCEPTED` → `COMPLETED` / `CANCELLED`                                                                  |
| createdAt / completedAt | DateTime    | Yes / No | Auto-set / set on completion                                                                                                  |

## Location: Geoapify Integration

- **Provider:** Geoapify Autocomplete + Geocoding API (not free-text address entry).
- **Called from:** frontend, **directly** (no backend proxy) — chosen for lower latency and simplicity.
- **Key protection:** domain-restricted API key (`VITE_GEOAPIFY_API_KEY`); this key is intentionally public-facing, not a secret.
- **Debounce** autocomplete calls (~300ms) to stay within the free tier (3,000 req/day).
- **On failure/no results/quota exceeded:** block submission, show a clear error — never fall back to unverified free-text address.
- **Fallback provider:** not built for MVP; OpenCage noted as a future option if needed.
- **Trust boundary:** `address`/`lat`/`long`/`placeId` are client-submitted and not re-verified server-side — accepted MVP risk.

## API: POST /api/requests

1. Authenticate → 401 if not logged in.
2. Authorize `REQUESTER` role → 403 otherwise.
3. Validate body (see below) → 400 on failure.
4. Create request with `status = PENDING`, `requesterId` from session.
5. Return created object.
 Get authenticated requester's requests

GET /api/requests/mine

1. Authenticate → 401 if not logged in.
2. Authorize REQUESTER role → 403 otherwise.
3. Get requesterId from the authenticated session (`req.user.id`); never accept requesterId from the client.
4. Return all help requests belonging to the authenticated requester.

Success response:

{
  "success": true,
  "data": [
    { ...request fields... }
  ]
}

Error response:

{
  "success": false,
  "message": "..."
}

### 2. Get one help request

GET /api/requests/:id

1. Authenticate → 401 if not logged in.
2. Validate request ID → 400 if invalid.
3. Authorize access to the request.
4. REQUESTER can retrieve only their own request.
5. VOLUNTEER can retrieve a request available/assigned to them according to the assignment flow.
6. ADMIN can retrieve any request.
7. Return 404 if the request does not exist or the user is not authorized to access it.

Success response:

{
  "success": true,
  "data": { ...request fields... }
}

Error response:

{
  "success": false,
  "message": "..."
}


**Validation:** `title`, `category`/`urgency` (enum match), `scheduledAt` (future date), `latitude`/`longitude` (valid ranges) required; `description`/`placeId` optional.

**Response shape:**


// success (201)
{ "success": true, "data": { ...request fields... } }
// error (400/401/403)
{ "success": false, "message": "..." }
```

## Frontend

- Form fields: Title, Category, Urgency, Date/Time, Address (Geoapify autocomplete), Description (optional).
- Client-side validation → submit via `useMutation` (TanStack Query) → show loading/error/success states → invalidate/refresh request list cache on success.
