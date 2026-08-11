const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/jwt.middleware');
const csrfMiddleware = require('../middleware/csrf.middleware');
const { adminAuth } = require('../middleware/adminAuth');
const validate = require('../middleware/validate.middleware');
const {
  volunteerPreferencesSchema,
} = require('../validations/volunteerPreferencesSchema');

const {
  getAdminDashboard,
  getPendingVolunteers,
  approveVolunteer,
  rejectVolunteer,
  getUsers,
} = require('../controllers/admin.controllers');
const {
  getVolunteerPreferencesById,
  updateVolunteerPreferencesById,
} = require('../controllers/volunteerPreferences.controller');

router.use(jwtMiddleware, csrfMiddleware, adminAuth);

router.get('/dashboard', getAdminDashboard);
router.get('/volunteers/pending', getPendingVolunteers);
router.get('/users', getUsers);
router.get('/volunteers/:id/preferences', getVolunteerPreferencesById);
router.put(
  '/volunteers/:id/preferences',
  validate(volunteerPreferencesSchema),
  updateVolunteerPreferencesById
);
router.put('/volunteers/:id/approve', approveVolunteer);
router.put('/volunteers/:id/reject', rejectVolunteer);
module.exports = router;
