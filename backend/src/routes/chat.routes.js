const express = require('express');

const router = express.Router();

const jwtMiddleware = require('../middleware/jwt.middleware');
const csrfMiddleware = require('../middleware/csrf.middleware');
const validate = require('../middleware/validate.middleware');

const { createMessageSchema } = require('../validations/chatSchema');

const {
  getMessages,
  sendMessage,
  markMessagesRead,
  getConversations,
  getUnreadMessageCount,
} = require('../controllers/chat.controller');

router.get('/unreadCount', jwtMiddleware, getUnreadMessageCount);

router.get('/conversations', jwtMiddleware, getConversations);

router.get('/requests/:requestId/messages', jwtMiddleware, getMessages);

router.post(
  '/requests/:requestId/messages',
  jwtMiddleware,
  csrfMiddleware,
  validate(createMessageSchema),
  sendMessage
);

router.patch(
  '/requests/:requestId/messages/read',
  jwtMiddleware,
  csrfMiddleware,
  markMessagesRead
);

module.exports = router;
