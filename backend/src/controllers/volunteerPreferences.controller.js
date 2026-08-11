const asyncHandler = require('../utils/asyncHandler');
const {
  getVolunteerPreferences,
  updateVolunteerPreferences,
} = require('../services/volunteerPreferences.service');

const getMyPreferences = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const preferences = await getVolunteerPreferences(req.user.id);
  return res.status(200).json(preferences);
});

const updateMyPreferences = asyncHandler(async (req, res) => {
  const preferences = await updateVolunteerPreferences(req.user.id, req.body);
  return res.status(200).json(preferences);
});

module.exports = { getMyPreferences, updateMyPreferences };
