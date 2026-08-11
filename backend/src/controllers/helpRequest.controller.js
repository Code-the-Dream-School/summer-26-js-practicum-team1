const asyncHandler = require('../utils/asyncHandler');
const prisma = require('../config/prisma');
const {
  createHelpRequestSchema,
} = require('../validations/helpRequestSchema');

const createHelpRequest = asyncHandler(async (req, res) => {
  const requesterId = req.user?.id;

  if (!requesterId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }

  if (req.user.role !== 'REQUESTER') {
    return res.status(403).json({
      success: false,
      message: 'Only requesters can create help requests',
    });
  }

  const { error, value } = createHelpRequestSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.details.map((detail) => detail.message),
    });
  }

  const {
    title,
    category,
    urgency,
    scheduledAt,
    address,
    latitude,
    longitude,
    description,
  } = value;

  const scheduledDate = new Date(scheduledAt);

  if (scheduledDate <= new Date()) {
    return res.status(400).json({
      success: false,
      message: 'scheduledAt must be a future date',
    });
  }

  const helpRequest = await prisma.helpRequest.create({
    data: {
      requesterId,
      title,
      category,
      urgency,
      scheduledAt: scheduledDate,
      address,
      latitude,
      longitude,
      description: description || null,
      status: 'PENDING',
    },
  });

  return res.status(201).json({
    success: true,
    data: helpRequest,
  });
});

module.exports = {
  createHelpRequest,
};