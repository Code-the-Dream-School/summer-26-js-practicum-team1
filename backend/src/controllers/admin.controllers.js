const adminService = require('../services/admin.service');
const requesterProfileService = require('../services/requesterProfile.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
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

async function getUsers(req, res, next) {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);

    const users = await adminService.getUsers(page, limit);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
}

const getAdminRequesterProfile = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new ApiError(400, 'Invalid requester ID');
  }

  const profile = await adminService.getRequesterProfileById(userId);

  res.status(200).json(profile);
});

const getAdminUserProfileImage = asyncHandler(async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const profileImage = await requesterProfileService.getProfileImage(userId);
  res.set('Content-Type', profileImage.profileImageType);
  return res.status(200).send(Buffer.from(profileImage.profileImage));
});
module.exports = {
  getAdminDashboard,
  getPendingVolunteers,
  approveVolunteer,
  rejectVolunteer,
  getAdminRequesterProfile,
  getAdminUserProfileImage,
  getUsers,
};
