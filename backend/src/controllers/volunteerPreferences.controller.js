const preferencesService = require('../services/volunteerPreferences.service');
const asyncHandler = require('../utils/asyncHandler');

const getPreferences = asyncHandler(async (req, res) => {
  const preferences = await preferencesService.getPreferences(req.user.id);

  return res.status(200).json({
    data: preferences,
  });
});

const updatePreferences = asyncHandler(async (req, res) => {
  const preferences = await preferencesService.updatePreferences(
    req.user.id,
    req.body
  );

  return res.status(200).json({
    data: preferences,
  });
});

module.exports = { getPreferences, updatePreferences };
