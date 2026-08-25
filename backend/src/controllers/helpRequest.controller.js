
const asyncHandler = require('../utils/asyncHandler');
const helpRequestService = require('../services/helpRequest.service');
const ApiError = require('../utils/ApiError');



const createHelpRequest = asyncHandler(
  async (req, res) => {
    const helpRequest =
      await helpRequestService.createHelpRequest({
        requesterId: req.user.id,
        data: req.body,
      });

    return res.status(201).json({
      success: true,
      data: helpRequest,
    });
  }
);



const getHelpRequests = asyncHandler(
  async (req, res) => {
    const helpRequests =
      await helpRequestService.getHelpRequests({
        requesterId: req.user.id,
      });

    return res.status(200).json({
      success: true,
      data: helpRequests,
    });
  }
);

const getHelpRequestById = asyncHandler(
  async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      throw new ApiError(
        400,
        'Invalid help request ID'
      );
    }

    const helpRequest =
      await helpRequestService.getHelpRequestById({
        id,
        requesterId: req.user.id,
      });

    return res.status(200).json({
      success: true,
      data: helpRequest,
    });
  }
);



const updateHelpRequest = asyncHandler(
  async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      throw new ApiError(
        400,
        'Invalid help request ID'
      );
    }

    const helpRequest =
      await helpRequestService.updateHelpRequest({
        id,
        requesterId: req.user.id,
        data: req.body,
      });

    return res.status(200).json({
      success: true,
      data: helpRequest,
    });
  }
);



const cancelHelpRequest = asyncHandler(
  async (req, res) => {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      throw new ApiError(
        400,
        'Invalid help request ID'
      );
    }

    const helpRequest =
      await helpRequestService.cancelHelpRequest({
        id,
        requesterId: req.user.id,
      });

    return res.status(200).json({
      success: true,
      data: helpRequest,
    });
  }
);




const getAcceptedVolunteerProfile =
  asyncHandler(async (req, res) => {
    const requestId =
      Number(req.params.id);

    if (Number.isNaN(requestId)) {
      throw new ApiError(
        400,
        'Invalid help request ID'
      );
    }

    const volunteer =
      await helpRequestService.getAcceptedVolunteerProfile({
        requestId,
        requesterId: req.user.id,
      });

    return res.status(200).json({
      success: true,
      data: volunteer,
    });
  });



const getBrowseHelpRequests =
  asyncHandler(async (req, res) => {
    const result =
      await helpRequestService.getBrowseHelpRequests({
        user: req.user,
        query: req.query,
      });

    return res.status(200).json({
      success: true,
      ...result,
    });
  });




const getBrowseHelpRequestsFacets =
  asyncHandler(async (req, res) => {
    const facets =
      await helpRequestService.getBrowseHelpRequestsFacets({
        user: req.user,
        query: req.query,
      });

    return res.status(200).json({
      success: true,
      data: facets,
    });
  });



module.exports = {
  createHelpRequest,
  getHelpRequests,
  getHelpRequestById,
  updateHelpRequest,
  cancelHelpRequest,
  getAcceptedVolunteerProfile,
  getBrowseHelpRequests,
  getBrowseHelpRequestsFacets,
};

