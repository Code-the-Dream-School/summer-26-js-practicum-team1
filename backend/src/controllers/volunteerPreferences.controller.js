const asyncHandler = require('../utils/asyncHandler');
const {
  getVolunteerPreferences,
  updateVolunteerPreferences,
} = require('../services/volunteerPreferences.service');

const parseVolunteerId = (rawId) => {
  const volunteerId = Number(rawId);
  if (!Number.isInteger(volunteerId) || volunteerId <= 0) {
    return null;
  }
  return volunteerId;
};

const getMyPreferences = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const preferences = await getVolunteerPreferences(req.user.id);
  return res.status(200).json(preferences);
});

const updateMyPreferences = asyncHandler(async (req, res) => {
  const preferences = await updateVolunteerPreferences(req.user.id, req.body);
  return res.status(200).json(preferences);
});

const getVolunteerPreferencesById = asyncHandler(async (req, res) => {
  const volunteerId = parseVolunteerId(req.params.id);
  if (!volunteerId) {
    return res.status(400).json({
      success: false,
      message: 'Invalid volunteer id',
    });
  }

  res.set('Cache-Control', 'no-store');
  const preferences = await getVolunteerPreferences(volunteerId);
  return res.status(200).json({ success: true, data: preferences });
});

const updateVolunteerPreferencesById = asyncHandler(async (req, res) => {
  const volunteerId = parseVolunteerId(req.params.id);
  if (!volunteerId) {
    return res.status(400).json({
      success: false,
      message: 'Invalid volunteer id',
    });
  }

  const preferences = await updateVolunteerPreferences(volunteerId, req.body);
  return res.status(200).json({ success: true, data: preferences });
});

module.exports = {
  getMyPreferences,
  updateMyPreferences,
  getVolunteerPreferencesById,
  updateVolunteerPreferencesById,
};
