# Overview

Implement a secure Profile Management feature that enables authenticated users to view and update their own profile information. The feature consists of protected REST API endpoints, database operations through Prisma, and a React frontend that retrieves and updates profile data using TanStack Query.

General user information will be stored in the User table, while requester-specific details will be stored in the RequesterProfile table, following the ERD design.

## Database Design

### RequesterProfile Schema

#### Fields

- userId - primary key/foreign key

- address

- city

- bio

- emergencyContact

### Relationship

User (1)------> RequesterProfile(1)

## Workflow

React (Profile Page)
│
│ Axios
Express API (/users/profile)
│
Authentication Middleware
│
Profile Controller
│
Joi Validation
│
Prisma ORM
│
User Table

        |

RequesterProfile

## Backend

### Api Endpoints

- GET/api/auth/profile

- PATCH/api/auth/profile

- GET/api/auth/profile/image

- PATCH/api/auth/profile/image

### GET Flow

- Authenticate user.

- Retrieve the user from the User table.

- Retrieve the associated RequesterProfile table.

- Return a combined response containing data from both tables.

### PATCH Flow

- Authenticate user.

- Validate incoming data.

- Update editable fields in the User table.

- Update requester-specific fields in the Requester table.

- Return the updated profile.

## Authentication

- Verify the user's JWT/session.

- Extract the authenticated user's ID from req.user.

- Prevent users from accessing or updating another user's profile.

## Validation

- Validate editable fields before updating the database.

### Example editable fields:

Full Name (not editable)

Email (not editable)

Phone Number

Date of Birth (not editable)

Gender (not editable)

Profile Image (if supported)

Address

City

Mobility Notes

Emergency Contact

## Frontend

### Profile Page

#### Display:

Full Name

Email (read only)

Phone Number

Date of Birth

Gender

Role (read only)

Profile Image (if supported)

Address

City

Mobility Notes

Emergency Contact

### Profile Edit

- Pre-populate fields with existing profile data.

- Validate user input before submission.

- Display validation and API error messages.

- Submit updates using the PATCH endpoint.

- Show success feedback after saving.

## State Management using Tanstack

- Fetch profile data (useQuery).

- Update profile (useMutation).

- Refresh cached profile data after a successful update
