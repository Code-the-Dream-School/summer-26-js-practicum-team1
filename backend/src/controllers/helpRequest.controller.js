const asyncHandler = require('../utils/asyncHandler');
const helpRequestService = require('../services/helpRequest.service');
const ApiError = require('../utils/ApiError');
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
const getHelpRequestById = asyncHandler(async (req, res) => {
  const requesterId = req.user.id;
  const { id } = req.params;

  const helpRequest = await helpRequestService.getHelpRequestById({
    id: Number(id),
    requesterId,
  });

  res.status(200).json(helpRequest);
});
const getAcceptedVolunteerProfile = asyncHandler(
  async (req, res) => {
    const requesterId = req.user.id;
    const requestId = Number(req.params.id);

    if (!Number.isInteger(requestId) || requestId <= 0) {
      throw new ApiError(400, 'Invalid help request ID');
    }

    const volunteer =
      await helpRequestService.getAcceptedVolunteerProfile({
        requestId,
        requesterId,
      });

    return res.status(200).json({
      success: true,
      data: volunteer,
    });
  }
);
const updateHelpRequest = asyncHandler(async (req, res) => {
  const requesterId = req.user.id;
  const { id } = req.params;
  console.log('UPDATE REQUEST');
  console.log('request id:', id);
  console.log('requester id:', requesterId);
  console.log('body:', req.body);
  const updatedRequest =
    await helpRequestService.updateHelpRequest({
      id: Number(id),
      requesterId,
      data: req.body,
    });

  res.status(200).json(updatedRequest);
});
const cancelHelpRequest = asyncHandler(async (req, res) => {
  const requesterId = req.user.id;
  const { id } = req.params;

  const cancelledRequest =
    await helpRequestService.cancelHelpRequest({
      id: Number(id),
      requesterId,
    });

  res.status(200).json(cancelledRequest);
});
module.exports = { 
  createHelpRequest,
   getHelpRequests, 
   getHelpRequestById,
   updateHelpRequest,
   cancelHelpRequest,
  getAcceptedVolunteerProfile
};
