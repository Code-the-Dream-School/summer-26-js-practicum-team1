const volunteerProfileService = require('../services/volunteerProfile.service');
const asyncHandler = require('../utils/asyncHandler');

const updateVolunteerProfile = asyncHandler(async (req, res) => {
  const volunteer = await volunteerProfileService.updateVolunteerProfile(
    req.user.id,
    req.body
  );

  return res.status(200).json({
    data: volunteer,
  });
});

const listSupportCategories = asyncHandler(async (_req, res) => {
  const categories = await volunteerProfileService.listSupportCategories();

  return res.status(200).json({
    data: categories,
  });
});

module.exports = {
  updateVolunteerProfile,
  listSupportCategories,
};
