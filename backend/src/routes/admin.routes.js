const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/jwt.middleware');
const csrfMiddleware = require('../middleware/csrf.middleware');
const validate = require('../middleware/validate.middleware');
const { adminAuth } = require('../middleware/adminAuth');
const {
  updatePreferencesSchema,
} = require('../validations/volunteerPreferencesSchema');

const {
  getAdminDashboard,
  getPendingVolunteers,
  approveVolunteer,
  rejectVolunteer,
  getUsers,
  getUserPreferences,
  updateUserPreferences,
} = require('../controllers/admin.controllers');

router.use(jwtMiddleware, csrfMiddleware, adminAuth);

router.get('/dashboard', getAdminDashboard);
router.get('/volunteers/pending', getPendingVolunteers);
router.get('/users', getUsers);
router.get('/users/:id/preferences', getUserPreferences);
router.put(
  '/users/:id/preferences',
  validate(updatePreferencesSchema),
  updateUserPreferences
);
router.put('/volunteers/:id/approve', approveVolunteer);
router.put('/volunteers/:id/reject', rejectVolunteer);
module.exports = router;
