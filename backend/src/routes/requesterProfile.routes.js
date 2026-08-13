const express = require('express');

const router = express.Router();

const jwtMiddleware = require('../middleware/jwt.middleware');
const requesterOnly = require('../middleware/requesterProfileMiddleware');
const validate = require('../middleware/validate.middleware');
const profileImageUpload = require('../middleware/profileImageUpload');
const csrfMiddleware = require('../middleware/csrf.middleware');

const {
  updateRequesterProfileSchema,
} = require('../validations/requesterProfileSchema');
const {
  updatePreferencesSchema,
} = require('../validations/volunteerPreferencesSchema');

const volunteerOnly = require('../middleware/volunteerProfileMiddleware');
const {
  getPreferences,
  updatePreferences,
  listSupportCategories,
} = require('../controllers/volunteerPreferences.controller');

const {
  getProfile,
  updateProfile,
  updateProfileImage,
  getProfileImage,
} = require('../controllers/requesterProfile.controller');

// Requester profile
router.get('/', jwtMiddleware, requesterOnly, getProfile);

router.patch(
  '/',
  jwtMiddleware,
  csrfMiddleware,
  requesterOnly,
  validate(updateRequesterProfileSchema),
  updateProfile
);

router.patch(
  '/image',
  jwtMiddleware,
  csrfMiddleware,
  requesterOnly,
  profileImageUpload,
  updateProfileImage
);

router.get('/image', jwtMiddleware, requesterOnly, getProfileImage);

router.get('/support-categories', jwtMiddleware, listSupportCategories);

router.get('/preferences', jwtMiddleware, volunteerOnly, getPreferences);

router.put(
  '/preferences',
  jwtMiddleware,
  csrfMiddleware,
  volunteerOnly,
  validate(updatePreferencesSchema),
  updatePreferences
);

module.exports = router;
