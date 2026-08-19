# Chat with Volunteer Before Arrival

HELPER-93· parent HELPER-91

user story: As a requester, I want to chat with my volunteers before they arrive so I can share details and coordinate.

For the MVP, the feature will support 1:1 text messaging with polling. Messages will be persisted in the database and remain available after the request is completed.

Push and email notifications are out of scope for the MVP.

# Objective

Enable requesters and assigned volunteers to:

- Open a chat after a request is accepted.
- Send and receive text messages.
- View message timestamps.
- Receive new messages through periodic polling.
- Access persisted chat history.

# Flow

Request Status = ACCEPTED
|
v
[Message Volunteer]
|
v
Chat Screen
|
+---- View existing messages
|
+---- Send message
|
+---- Poll for new messages
|
v
Mark messages as read

# Chat availablity

- A chat can only be accessed when Request.status = ACCEPTED and the request has an accepted volunteer.
- The requester can access the chat only if authenticatedUser.id = request.requesterId
- The volunteer can access the chat only if authenticatedUser.id = request.volunteerId

# API Design

## Get Message

GET /api/requests/:requestId/messages

Authorization:

The authenticated user must be either Requester, Assigned volunteer

## Send Message

POST /api/requests/:requestId/messages

## Read Status

PATCH /api/requests/:requestId/messages/read

# Database Relation

User
│
Request
|
├── requesterId ─────┐
│ │
│ Conversation
│ │
└── volunteerId ─────┘
│
│
Messages
│
senderId
│
User

## Polling

The frontend uses TanStack Query to periodically retrieve messages.

## ChatPage

- Getting the request ID.
- Loading messages.
- Displaying the conversation.
- Sending messages.
- Marking messages as read.

## MessageList

- Rendering messages.
- Displaying timestamps.
- Differentiating sender/recipient messages.

## MessageInput

- Entering text.
- Client-side validation.
- Sending the message.
- Clearing the input after successful submission.

## Validation

- string
- trim
- required
- minimum 1 character
- maximum reasonable message length

# Acceptance criteria

- Requester can open a chat with a volunteer once a request has been accepted.

- Requester can send and receive text messages in real time (or near-real time).

- Requester can see message timestamps and read/delivery status.

- Requester is notified of new messages (in-app, and push/email if supported).

- Chat history persists for the duration of the request (and is retrievable afterward).
