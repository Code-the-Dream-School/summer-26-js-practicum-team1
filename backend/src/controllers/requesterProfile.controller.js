const profileService = require('../services/requesterProfile.service');
const asyncHandler = require('../utils/asyncHandler');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user.id);

  return res.status(200).json({
    data: profile,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfile(req.user.id, req.body);

  return res.status(200).json({
    data: profile,
  });
});

module.exports = {
  getProfile,
  updateProfile,
};
