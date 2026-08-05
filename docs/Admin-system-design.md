------##Purpose##-----
The admin feature Provides, manage volunteer verification and monitor platform activities. Only admin have administrative access (Admin dashboard). Where admin can approve or reject volunteer verification request.

------Business Rules-----
Volunteer Approval Rules
All users who register as volunteers must go through the admin verification process.

A volunteer account is not considered active until an admin approves the volunteer verification request.

The system must not create a VolunteerProfile record for a volunteer applicant before admin approval.

##When the admin approves a volunteer request##

The user's role/status is updated according to the approved volunteer workflow, allowing access to volunteer features.

A VolunteerProfile record is created.

The user gains access to volunteer features.

##When the admin rejects a volunteer request:##

The user cannot access volunteer features.

No VolunteerProfile record is created.

Only approved volunteers can accept and complete help requests.

--------##briefcase Admin Role Responsibilities##--------
Responsibility

Access admin dashboard.

Review and approve/reject volunteer verification request

View platform activity data

bust in silhouette Admin Account Creation
Admin accounts are manually created or seeded by the system owner

Admin role is assigned directly in the users table.

Only users with the Admin role can access admin features.

##Frontend##
Frontend route protection improves user experience, but backend authorization is the final security layer.
Create a protected frontend route such as: /admin

example:

If someone visits:



http://localhost:5173/admin
route guard checks:

Not logged in → Redirect to /login

Logged in as ADMIN → Show the Admin Dashboard

Logged in but not ADMIN → Show "Access Denied" or redirect to the home page

The user doesn't have to click an "Admin" button—they can navigate directly to the URL.
## Database Behavior

Before approval:
- User account exists.
- Volunteer verification request status is PENDING.
- VolunteerProfile record does not exist.

After approval:
- User role is updated to VOLUNTEER.
- VolunteerProfile record is created.
- Verification status becomes APPROVED.

After rejection:
- Verification status becomes REJECTED.
- VolunteerProfile record is not created.
##key Authentication and Authorization##
##Authentication##
Admin use the same login flow as other users.

Credentials are verified through the authentication service.

Successful login generates JWT/session.

-----##Authorization-##----
Admin-only routes must check the user’s role.

Non- admin users must receive 403 forbidden.


## Admin can ##

Review volunteer verification request.

Approve volunteer status

Reject volunteer profiles.

 

-----## flow diagram ##-----
Volunteer submits application
        ↓
Admin reviews information
        ↓
Admin approves/rejects
        ↓
System updates volunteer status
        ↓
User receives notification


##Admin Dashboard Includes##
pending volunteer verifications


API Route 

GET   /api/admin/dashboard                              Get admin dashboard statistics

GET  /api/admin/volunteers/pending                 Get all volunteers waiting for approval

PUT /api/admin/volunteers/:id/approve             Approve a volunteer

PUT /api/admin/volunteers/:id/reject                 Reject a volunteer 

Middleware

authenticateUser()

checkRole("ADMIN")

Allow Access

Security Considerations

##Includes##
Admin Routes require authentication
admin permissions are checked on backeend ,not only frontend.
The ADMIN role cannot be selected during user registration.
JWT/session must contain role information.
unauthorized access returns proper HTTP status code.


-----## Error Handling ##-----

The Admin API returns appropriate HTTP status codes and error messages to ensure consistent communication between the client and server.

HTTP Status Code

Error

Description

200 OK

Success

The request was completed successfully.

400 Bad Request

Invalid Request

The request contains invalid or missing data.

401 Unauthorized

Authentication Required

The user is not authenticated or the JWT/session is missing or invalid.

403 Forbidden

Access Denied

The authenticated user does not have the ADMIN role.

404 Not Found

Resource Not Found

The requested volunteer profile or resource does not exist.

409 Conflict

Conflict

The volunteer has already been approved or rejected, so the requested action cannot be completed.

500 Internal Server Error

Server Error

An unexpected error occurred while processing the request.

Standard Error Response
All error responses should follow a consistent JSON format.



{
  "success": false,
  "message": "Access denied. Admin privileges are required."
}
##Error Handling Rules##
Validate all incoming request data before processing.

Authenticate the user before allowing access to any admin endpoint.

Verify that the authenticated user has the ADMIN role.

Return appropriate HTTP status codes for all errors.

Do not expose sensitive system information, database details, or stack traces in API responses.

Log server-side errors for debugging and monitoring.

