# Define Filterable Request Fields and Browse Query Rules

## 1. Summary

Defines which `HelpRequest` fields are filterable/sortable in the browse endpoint, the allowed operators per field, and the query parameter contract the frontend will use.

## 2. Current Schema (per HelpRequest Creation doc)

| Field                   | Type               | Notes                                                                                                                         |
| ----------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| id                      | Int                | Primary key                                                                                                                   |
| requesterId             | Int (FK)           | From auth session                                                                                                             |
| volunteerId             | Int (FK), nullable | Null until accepted                                                                                                           |
| title                   | String             | Max ~100 chars                                                                                                                |
| category                | Enum               | Grocery, Transportation, Household Chores, Yard Work, Pet Care, Tech Support, Companionship, Meal Prep, Medical Errand, Other |
| urgency                 | Enum               | Low, Medium, High                                                                                                             |
| scheduledAt             | DateTime           | Must be in the future                                                                                                         |
| address                 | String             | From Geoapify, display only                                                                                                   |
| latitude / longitude    | Float              | From Geoapify, used for matching                                                                                              |
| placeId                 | String, optional   | Geoapify re-lookup, not user-facing                                                                                           |
| description             | String, optional   | Free text                                                                                                                     |
| status                  | Enum               | `PENDING` (default) → `ACCEPTED` → `COMPLETED` / `CANCELLED`                                                                  |
| createdAt / completedAt | DateTime           | Auto-set / set on completion                                                                                                  |

## 3. Filterable Fields

| Field                | Operators            | Notes                                                                                      |
| -------------------- | -------------------- | ------------------------------------------------------------------------------------------ |
| category             | `eq`, `in`           | Multi-select (`category=grocery,yard_work`) using the enum                                 |
| urgency              | `eq`, `in`           | Multi-select (`urgency=medium,high`)                                                       |
| status               | `eq`, `in`           | browse defaults to `PENDING` only                                                          |
| scheduledAt          | `gte`, `lte`, range  | "Available this weekend" style filters                                                     |
| createdAt            | `gte`, `lte`, range  | For "newest requests" filtering, distinct from sort                                        |
| latitude / longitude | `near` (radius)      | Requires `lat`, `lng`, `radiusMi`. Also supports sorting by distance (closest to farthest) |
| title / description  | `search` (full-text) |                                                                                            |

## 4. Non-Filterable Fields

| Field       | Reason                                                                                 |
| ----------- | -------------------------------------------------------------------------------------- |
| id          | Direct lookup only (`GET /api/requests/:id`)                                           |
| address     | Display/geocoding artifact — radius search uses lat/lng, not the string                |
| placeId     | Internal re-lookup key only, never exposed as a filter                                 |
| completedAt | Not user-facing on browse; derived from `status`. Exposed only in detail/history views |
| requesterId | User-specific information, not exposed as a filter                                     |
| volunteerId | Already covered by the volunteer dashboard                                             |

## 5. Query Parameter Contract

Proposed query params for `GET /api/requests`, matching the doc's response envelope (`{ success, data }`) and camelCase field naming:

```
GET /api/requests
  ?category=grocery,yard_work
  &urgency=medium,high
  &status=pending
  &scheduledAfter=<ISO8601>
  &scheduledBefore=<ISO8601>
  &createdAfter=<ISO8601>
  &lat=<float>&lng=<float>&radiusMi=<float>
  &q=<free text search on title+description>
  &sort=<field>:<asc|desc>
  &page=<int>&pageSize=<int>
```

Rules:

- All filters combine with **AND**. Multi-value params (e.g. `urgency=medium,high`) are **OR**'d within that field.
- `lat`/`lng`/`radiusMi` must all be present together or the request is rejected with `400`.
- Unknown query params are ignored, not errored.
- Enum params (`category`, `urgency`, `status`) are validated against the enum on the way in and invalid values return `400`.

## 6. Sorting Rules

| Sort key    | Default direction | Notes                                           |
| ----------- | ----------------- | ----------------------------------------------- |
| createdAt   | desc              | Default sort if none specified ("newest first") |
| scheduledAt | asc               | For "soonest need" sort                         |
| urgency     | desc              | Requires enum ordering: `Low < Medium < High`   |
| distance    | asc               | Only valid when `lat`/`lng` provided            |

Only one `sort` param is supported per request.

## 7. Status & Assignment Default Behavior

The status lifecycle is `PENDING → ACCEPTED → COMPLETED / CANCELLED`.

- **Default browse view (volunteers looking for work):** `status=PENDING` only.
- Explicit `status=` in the query overrides the default. Non-`PENDING` statuses are only returned for requests where `requesterId` or `volunteerId` matches the authenticated user; anonymous/public browse always resolves to `PENDING` regardless of `status=` override."
