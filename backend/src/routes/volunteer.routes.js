const express = require('express');
const jwtMiddleware = require('../middleware/jwt.middleware');
const csrfMiddleware = require('../middleware/csrf.middleware');
const validate = require('../middleware/validate.middleware');
const {
  getMyPreferences,
  updateMyPreferences,
} = require('../controllers/volunteerPreferences.controller');
const { volunteerPreferencesSchema } = require('../validations/volunteerPreferencesSchema');

const router = express.Router();

router.get('/me/preferences', jwtMiddleware, getMyPreferences);

router.put(
  '/me/preferences',
  jwtMiddleware,
  csrfMiddleware,
  validate(volunteerPreferencesSchema),
  updateMyPreferences
);

module.exports = router;
