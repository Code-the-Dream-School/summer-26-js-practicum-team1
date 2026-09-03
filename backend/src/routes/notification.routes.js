const express = require('express');

const router = express.Router();

const {
  listNotifications,
  markNotificationRead,
} = require('../controllers/notification.controller');

const jwtMiddleware = require('../middleware/jwt.middleware');
const csrfMiddleware = require('../middleware/csrf.middleware');
const validate = require('../middleware/validate.middleware');
const { requireRole } = require('../middleware/authorize');
const {
  listNotificationsQuerySchema,
} = require('../validations/notificationSchema');

router.get(
  '/',
  jwtMiddleware,
  requireRole('REQUESTER'),
  validate(listNotificationsQuerySchema, 'query'),
  listNotifications
);

router.patch(
  '/:id/read',
  jwtMiddleware,
  csrfMiddleware,
  requireRole('REQUESTER'),
  markNotificationRead
);

module.exports = router;
