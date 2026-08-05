const express = require('express');
const router = express.Router();
const mockAuth = require('../middleware/auth.middleware');
const { adminAuth } = require('../middleware/adminAuth');

const {
  getAdminDashboard,
  getPendingVolunteers,
  approveVolunteer,
  rejectVolunteer,
  getUsers,
} = require('../controllers/admin.controllers');
router.get('/dashboard', mockAuth, adminAuth, getAdminDashboard);
router.get('/volunteers/pending', mockAuth, adminAuth, getPendingVolunteers);
router.get('/users', mockAuth, adminAuth, getUsers);
router.put('/volunteers/:id/approve', mockAuth, adminAuth, approveVolunteer);
router.put('/volunteers/:id/reject', mockAuth, adminAuth, rejectVolunteer);
module.exports = router;
