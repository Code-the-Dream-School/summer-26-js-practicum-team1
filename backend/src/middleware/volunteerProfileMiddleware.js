const ApiError = require('../utils/ApiError');

const volunteerOnly = (req, res, next) => {
  if (req.user.role !== 'VOLUNTEER') {
    return next(new ApiError(403, 'Only volunteers can access this resource.'));
  }
  next();
};

module.exports = volunteerOnly;
