const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const helpRequestService = require('../services/helpRequest.service');

const getRequestId = (req) => {
  const requestId = Number(req.params.id);

  if (!Number.isInteger(requestId) || requestId <= 0) {
    throw new ApiError(400, 'Invalid request id');
  }

  return requestId;
};

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
  const { data, meta } = await helpRequestService.getBrowseHelpRequests({
    user: req.user,
    query: req.query,
  });
  return res.status(200).json({ success: true, data, meta });
});

const getBrowseHelpRequestsFacets = asyncHandler(async (req, res) => {
  const categoryCounts = await helpRequestService.getCategoryFacets({
    user: req.user,
    query: req.query,
  });
  return res.status(200).json({ success: true, categoryCounts });
});

const acceptHelpRequest = asyncHandler(async (req, res) => {
  const requestId = getRequestId(req);

  const helpRequest = await helpRequestService.acceptHelpRequest({
    requestId,
    volunteerId: req.user.id,
  });

  return res.status(200).json({ success: true, data: helpRequest });
});

const declineHelpRequest = asyncHandler(async (req, res) => {
  const requestId = getRequestId(req);

  const response = await helpRequestService.declineHelpRequest({
    requestId,
    volunteerId: req.user.id,
  });

  return res.status(200).json({
    success: true,
    data: {
      requestId: response.requestId,
      volunteerId: response.volunteerId,
      action: response.action,
      createdAt: response.createdAt,
    },
  });
});

module.exports = {
  createHelpRequest,
  getHelpRequests,
  getBrowseHelpRequests,
  getBrowseHelpRequestsFacets,
  acceptHelpRequest,
  declineHelpRequest,
};
