const asyncHandler = require('../utils/asyncHandler');
const helpRequestService = require('../services/helpRequest.service');

const createHelpRequest = asyncHandler(async (req, res) => {
  const helpRequest = await helpRequestService.createHelpRequest({
    requesterId: req.user.id,
    requesterRole: req.user.role,
    data: req.body,
  });

  return res.status(201).json({ success: true, data: helpRequest });
});

module.exports = { createHelpRequest };