const { VerificationStatus } = require('@prisma/client');

const requireRole = (roles) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
      });
    }

    if (!allowed.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
      });
    }

    next();
  };
};

const requireApprovedIfVolunteer = (req, res, next) => {
  if (
    req.user.role === 'VOLUNTEER' &&
    req.user.volunteerProfile?.verificationStatus !==
      VerificationStatus.APPROVED
  ) {
    return res.status(403).json({ error: 'Volunteer account not approved' });
  }
  next();
};

module.exports = { requireRole, requireApprovedIfVolunteer };
