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
  getUsers,
} = require('../controllers/admin.controllers');
router.get(
  '/dashboard',
  jwtMiddleware,
  csrfMiddleware,
  adminAuth,
  getAdminDashboard
);
router.get(
  '/volunteers/pending',
  jwtMiddleware,
  csrfMiddleware,
  adminAuth,
  getPendingVolunteers
);
router.get('/users', jwtMiddleware, csrfMiddleware, adminAuth, getUsers);
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
