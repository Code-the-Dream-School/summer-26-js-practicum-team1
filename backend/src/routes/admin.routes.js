const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/jwt.middleware');
const csrfMiddleware = require('../middleware/csrf.middleware');
const validate = require('../middleware/validate.middleware');
const { adminAuth } = require('../middleware/adminAuth');
const {
  updateVolunteerProfileSchema,
} = require('../validations/volunteerProfileSchema');

const {
  getAdminDashboard,
  getPendingVolunteers,
  approveVolunteer,
  rejectVolunteer,
  getUsers,
  getUser,
  getUserVolunteer,
  updateUserVolunteer,
  getAdminRequesterProfile,
  getAdminUserProfileImage,
} = require('../controllers/admin.controllers');

router.use(jwtMiddleware, adminAuth);

router.get('/dashboard', getAdminDashboard);
router.get('/volunteers/pending', getPendingVolunteers);
router.get('/users', getUsers);
router.get('/users/:id/volunteer', getUserVolunteer);
router.get('/users/:id/profile/image', getAdminUserProfileImage);
router.get('/users/:id', getUser);
router.get('/requesters/:id/profile', getAdminRequesterProfile);

router.put(
  '/users/:id/volunteer',
  csrfMiddleware,
  validate(updateVolunteerProfileSchema),
  updateUserVolunteer
);
router.put('/volunteers/:id/approve', csrfMiddleware, approveVolunteer);
router.put('/volunteers/:id/reject', csrfMiddleware, rejectVolunteer);

module.exports = router;
