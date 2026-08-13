const ApiError = require('../utils/ApiError');

const requesterOnly = (req, res, next) => {
  if (req.user.role !== 'REQUESTER') {
    return next(new ApiError(403, 'Only requesters can access this resource.'));
  }

  next();
};

module.exports = requesterOnly;
