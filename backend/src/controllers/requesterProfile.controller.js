const profileService = require('../services/requesterProfile.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

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

const updateProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Profile image file is required');
  }
  const profileImage = await profileService.updateProfileImage(
    req.user.id,
    req.file.buffer,
    req.file.mimetype
  );
  return res.status(200).json({ data: profileImage });
});

const getProfileImage = asyncHandler(async (req, res) => {
  const profileImage = await profileService.getProfileImage(req.user.id);
  if (!profileImage) {
    return res.status(204).send();
  }
  res.set('Content-Type', profileImage.profileImageType);
  return res.status(200).send(Buffer.from(profileImage.profileImage));
});

module.exports = {
  getProfile,
  updateProfile,
  updateProfileImage,
  getProfileImage,
};
