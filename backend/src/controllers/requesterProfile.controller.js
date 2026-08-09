const { StatusCodes } = require('http-status-codes');
const profileService = require('../services/requesterProfile.service');
const asyncHandler = require('../utils/asyncHandler');

const getProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user.id);

  return res.status(StatusCodes.OK).json({
    data: profile,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfile(req.user.id, req.body);

  return res.status(StatusCodes.OK).json({
    data: profile,
  });
});

module.exports = {
  getProfile,
  updateProfile,
};
