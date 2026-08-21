const asyncHandler = require('../utils/asyncHandler');
const helpRequestService = require('../services/helpRequest.service');

const createHelpRequest = asyncHandler(async (req, res) => {
  const helpRequest = await helpRequestService.createHelpRequest({
    requesterId: req.user.id,

    data: req.body,
  });

  return res.status(201).json({ success: true, data: helpRequest });
});
const getHelpRequests = asyncHandler(async (req, res) => {
  const helpRequests = await helpRequestService.getHelpRequests({
    requesterId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    data: helpRequests,
  });
});

const getBrowseHelpRequests = asyncHandler(async (req, res) => {
  const { data, meta } = await helpRequestService.getHelpRequests({
    user: req.user,
    query: req.query,
  });
  return res.status(200).json({ success: true, data, meta });
});

module.exports = { createHelpRequest, getHelpRequests, getBrowseHelpRequests };
