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
  getProfile,
  updateProfile,
  updateProfileImage,
  getProfileImage,
} = require('../controllers/profile.controller');

router.get('/', jwtMiddleware, getProfile);

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
  profileImageUpload,
  updateProfileImage
);

router.get('/image', jwtMiddleware, getProfileImage);

module.exports = router;
