# Help Request Creation

## Overview

The Help Request Creation feature allows authenticated requesters to create new help requests.

The created help request will be stored in the **HelpRequest** table and associated with the authenticated requester through the **User** table according to the ERD relationship design.

---

## Database Design

### HelpRequest Entity

- requesterId
- volunteerId
- title
- category
- urgency
- scheduledAt
- address
- latitude
- longitude
- placeId
- description
- status
- createdAt
- completedAt



### Category & Urgency (MVP values)
**Category:**
Grocery Shopping, Transportation, Household Chores, Yard Work, Pet Care, Tech Support, Companionship, Meal Preparation, Medical Errand, Other

**Urgency:** Low, Medium, High

### Status on creation

A new help request is created with status 

### Is Description required?

Optional. Not part of the original required-field list; requester can add detail but isn't blocked from submitting without it.


### Location fields

Team decision: location is captured via a third-party location/geocoding API (e.g. Google Places) at request-creation time, not typed freely.

- `address` — the human-readable formatted address returned by the API; shown to the requester and to volunteers.
- `latitude` / `longitude` — the coordinates from the same API response; used for proximity-based volunteer matching . Required, not optional, if matching will do radius/distance search.
- `placeId` — the API's place identifier; optional, for re-lookup only.


## Relationship

A single requester can create multiple help requests.

---

# Backend Implementation

## API Endpoint

### Create Help Request

**POST** `/api/requests`

---

## POST Request Flow

1. Authenticate the requester.
2. Verify the user has permission to create a help request.
3. Validate incoming request data.
4. Create a new help request linked to the authenticated user.
5. Save the request using Prisma ORM.
6. Return the created help request response.

---

## Authentication

The API requires an authenticated user.

Authentication flow:

- Verify the user's JWT/session.
- Extract authenticated user information from `req.user`.
- Use the authenticated user's ID as `requesterId` — always taken from the authenticated session, never accepted from the client request body.
- Prevent unauthenticated users from creating help requests.

---

## Validation

Before creating a help request, validate all required fields.

### Required Fields

- Title
- Category
- Urgency
- Date & Time Needed (`scheduledAt`)
- Address
- Latitude
- Longitude

### Optional Fields

- Description
- Place ID

Validation should ensure:

- Required fields are provided.
- Values match allowed formats/enums.
- Invalid requests are rejected before database insertion.

---

# Frontend Implementation

## Help Request Form

The form allows requesters to enter:

- Title
- Category
- Urgency
- Date & Time Needed
- Address (via third-party location API — autocomplete/search, not free text; returns `address`, `latitude`, `longitude`, `placeId`)
- Description (optional)

---

## Help Request Submission

Frontend workflow:

1. Validate user input before submission.
2. Display validation errors.
3. Submit data using the POST `/api/requests` endpoint.
4. Display API error messages if the request fails.
5. Show success feedback after successful creation.

---

# State Management (TanStack Query)

## Create Help Request

Use TanStack Query mutation:

- Implement request creation using `useMutation`.
- Handle loading, success, and error states.

## Cache Management

After successful request creation:

- Invalidate related queries.
- Refresh cached help request data.
- Update UI with the newly created request.
