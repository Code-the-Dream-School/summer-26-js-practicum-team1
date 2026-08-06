const express = require('express');
const router = express.Router();
const jwtMiddleware = require('../middleware/jwt.middleware');
const csrfMiddleware = require('../middleware/csrf.middleware');
const { adminAuth } = require('../middleware/adminAuth');

const {
  getAdminDashboard,
  getPendingVolunteers,
  approveVolunteer,
  rejectVolunteer,
} = require('../controllers/admin.controllers');
router.get('/dashboard', getAdminDashboard);
router.get('/volunteers/pending', getPendingVolunteers);
router.put(
  '/volunteers/:id/approve',
  jwtMiddleware,
  csrfMiddleware,
  adminAuth,
  approveVolunteer
);
router.put(
  '/volunteers/:id/reject',
  jwtMiddleware,
  csrfMiddleware,
  adminAuth,
  rejectVolunteer
);
module.exports = router;
