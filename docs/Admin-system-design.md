# Admin Feature

## Purpose

The Admin feature provides functionality to manage volunteer verification requests and monitor platform activities.

Only users with the **ADMIN** role have administrative access to the Admin Dashboard.

## The Admin Dashboard allows administrators to:

- Review volunteer verification requests.
- Approve or reject volunteer applications.
- View platform activity statistics.

---

# Business Rules

## Volunteer Approval Rules

- All users who register as volunteers must go through the admin verification process.
- When a volunteer application is submitted, a `VolunteerProfile` record is created with a default verification status of `PENDING`.
- A volunteer account is not considered active until an admin approves the verification request.
- Only approved volunteers can access volunteer features.
- Only approved volunteers can accept and complete help requests.
- A volunteer request cannot be approved or rejected more than once after it has already been reviewed.

---

# Frontend

Frontend route protection improves user experience, but backend authorization is the final security layer.

A protected frontend route should be created:

```text
/admin
```

## Route Behavior

- If the user is not logged in → Redirect to `/login`.
- If the user is logged in and has the **ADMIN** role → Show the Admin Dashboard.
- If the user is logged in but does not have the **ADMIN** role → Show "Access Denied" or redirect to the home page.

Users do not need to select an Admin option from the interface. Direct navigation to the `/admin` URL must still be protected.

## Login Role Redirect

After successful login, the system identifies the user's role and redirects the user according to their role.

Example:

- `ADMIN` users are redirected to the Admin Dashboard.
- Other users are redirected according to their assigned role and available features.

Frontend redirects improve user experience, but access permissions must always be enforced by the backend.

---

# Database Behavior

## When Volunteer Application Is Submitted

- User account exists with role `VOLUNTEER`.
- `VolunteerProfile` record is created.
- `verificationStatus` is set to `PENDING`.
- Access to volunteer features stays blocked until approval (`requireApprovedIfVolunteer`).

---

## After Approval

- `VolunteerProfile.verificationStatus` changes to `APPROVED`.
- User role remains `VOLUNTEER` (already set at signup).
- A `VolunteerVerification` record is created for approval history.
- User gains access to volunteer features.

---

## After Rejection

- `VolunteerProfile.verificationStatus` changes to `REJECTED`.
- User role remains `VOLUNTEER`.
- A `VolunteerVerification` record is created for rejection history.
- User cannot access volunteer features.

---

# Key Authentication and Authorization

## Authentication

- Admin users use the same login flow as other users.
- Credentials are verified through the authentication service.
- Successful login creates a JWT/session containing authentication information.
- Authenticated user information is available through the request user object.

---

## Authorization

Admin-only routes must verify the user's role.

### Authorization Rules

- User must be authenticated.
- User role must be `ADMIN`.
- Non-admin users receive `403 Forbidden`.

---

# Role Values

Backend and database roles use uppercase values:

```text
ADMIN
VOLUNTEER
REQUESTER
```

The backend and database use uppercase role values for authorization checks.

If API responses transform role values for frontend use, frontend role checks should follow the API response format rather than directly using database enum values.

---

# Admin Dashboard Includes

- Pending volunteer verification requests.
- Total users.
- Total volunteers.
- Total requesters.

---

# API Routes

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/dashboard` | Get admin dashboard statistics |
| GET | `/api/admin/users` | Get all users |
| GET | `/api/admin/volunteers/pending` | Get volunteers waiting for approval |
| PUT | `/api/admin/volunteers/:id/approve` | Approve volunteer request |
| PUT | `/api/admin/volunteers/:id/reject` | Reject volunteer request |

---

# API Validation Rules

## Volunteer Review Request

Before approving or rejecting a volunteer:

- Volunteer ID must be a valid integer.
- Volunteer profile must exist.
- Volunteer request status must be `PENDING`.

If the request has already been reviewed:

- Return `409 Conflict`.

Example:

```json
{
  "success": false,
  "message": "Volunteer request has already been reviewed"
}
```

---

# Middleware

Admin endpoints require authentication and authorization middleware.

## Authentication Middleware

Responsible for:

- Validating user authentication.
- Checking JWT/session information.
- Attaching authenticated user information to the request.

---

## Admin Authorization Middleware (`adminAuth`)

Responsible for:

- Checking that the authenticated user's role is `ADMIN`.
- Blocking unauthorized access.

Unauthorized users receive proper HTTP status codes.

---

# Error Handling

The Admin API returns appropriate HTTP status codes and messages.

| Status Code | Error | Description |
|---|---|---|
| 200 OK | Success | Request completed successfully |
| 400 Bad Request | Invalid Request | Request contains invalid or missing data |
| 401 Unauthorized | Authentication Required | User is not authenticated or authentication information is invalid |
| 403 Forbidden | Access Denied | Authenticated user does not have ADMIN privileges |
| 404 Not Found | Resource Not Found | Volunteer profile or requested resource does not exist |
| 409 Conflict | Conflict | Volunteer request has already been approved or rejected |
| 500 Internal Server Error | Server Error | Unexpected server-side error |

---

# Error Response Format

Authentication and authorization middleware return:

## 401 Unauthorized

```json
{
  "error": "Unauthorized"
}
```

## 403 Forbidden

```json
{
  "error": "Forbidden"
}
```

Controller-level errors return:

```json
{
  "success": false,
  "message": "Error message"
}
```



# Error Handling Rules

- Validate all incoming request data before processing.
- Authenticate users before allowing access to admin endpoints.
- Verify the authenticated user's `ADMIN` role.
- Return correct HTTP status codes.
- Do not expose database details or stack traces.
- Log server-side errors for debugging and monitoring.

---

# Security Considerations

- Admin routes require authentication.
- Backend authorization is the final security layer.
- Frontend route protection alone is not sufficient.
- The `ADMIN` role cannot be selected during user registration.
- Admin permissions are checked on the backend.
- Sensitive system information must not be exposed in API responses.
- Unauthorized access attempts must return proper HTTP status codes.