const adminService = require('../services/admin.service');
const asyncHandler = require('../utils/asyncHandler');
const { VerificationStatus } = require('@prisma/client');

const getAdminDashboard = asyncHandler(async (req, res) => {
  const stats = await adminService.getDashboardStats();
  return res.status(200).json({ success: true, data: stats });
});

const getPendingVolunteers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const result = await adminService.getPendingVolunteers({ page, limit });
  return res.status(200).json({ success: true, data: result });
});

async function reviewVolunteer(req, res, status) {
  const volunteerId = Number(req.params.id);
  if (!Number.isInteger(volunteerId) || volunteerId <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid volunteer id',
    });
  }
  const { notes } = req.body || {};
  const adminId = req.user.id;

  const updated = await adminService.reviewVolunteer({
    volunteerId,
    adminId,
    status,
    notes,
  });

  return res.status(200).json({
    success: true,
    message: `Volunteer request ${status.toLowerCase()} successfully`,
    data: updated,
  });
}

const approveVolunteer = asyncHandler((req, res) =>
  reviewVolunteer(req, res, VerificationStatus.APPROVED)
);

const rejectVolunteer = asyncHandler((req, res) =>
  reviewVolunteer(req, res, VerificationStatus.REJECTED)
);

module.exports = {
  getAdminDashboard,
  getPendingVolunteers,
  approveVolunteer,
  rejectVolunteer,
};
