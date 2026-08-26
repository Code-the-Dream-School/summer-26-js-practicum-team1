const asyncHandler = require('../utils/asyncHandler');
const requesterProfileService = require('../services/requesterProfile.service');

const updateProfile = asyncHandler(async (req, res) => {
  const profile = await requesterProfileService.updateProfile(
    req.user.id,
    req.body
  );

  return res.status(200).json({
    data: profile,
  });
});

module.exports = {
  updateProfile,
};
