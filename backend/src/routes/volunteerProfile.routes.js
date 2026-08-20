const express = require('express');

const router = express.Router();

const jwtMiddleware = require('../middleware/jwt.middleware');
const csrfMiddleware = require('../middleware/csrf.middleware');
const validate = require('../middleware/validate.middleware');
const volunteerOnly = require('../middleware/volunteerProfileMiddleware');
const {
  updateVolunteerProfileSchema,
} = require('../validations/volunteerProfileSchema');
const {
  updateVolunteerProfile,
} = require('../controllers/volunteerProfile.controller');

router.put(
  '/',
  jwtMiddleware,
  csrfMiddleware,
  volunteerOnly,
  validate(updateVolunteerProfileSchema),
  updateVolunteerProfile
);

module.exports = router;
