const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');

const requireVolunteerProfile = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId: req.user.id },
    select: { userId: true },
  });

  if (!profile) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return next();
});

module.exports = { requireVolunteerProfile };
