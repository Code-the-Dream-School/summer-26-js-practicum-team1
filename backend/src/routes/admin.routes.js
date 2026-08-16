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
  getAdminRequesterProfile,
  getUsers,
} = require('../controllers/admin.controllers');

router.use(jwtMiddleware, csrfMiddleware, adminAuth);

router.get('/dashboard', getAdminDashboard);
router.get('/volunteers/pending', getPendingVolunteers);
router.get('/users', getUsers);
router.put('/volunteers/:id/approve', approveVolunteer);
router.put('/volunteers/:id/reject', rejectVolunteer);
router.get('/requesters/:id/profile', getAdminRequesterProfile);
module.exports = router;
