const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { Role, RequestStatus } = require('@prisma/client');

async function createHelpRequest({ requesterId, requesterRole, data }) {
  if (requesterRole !== Role.REQUESTER) {
    throw new ApiError(403, 'Only requesters can create help requests');
  }

  const scheduledDate = new Date(data.scheduledAt);
  if (scheduledDate <= new Date()) {
    throw new ApiError(400, 'scheduledAt must be a future date');
  }

  return prisma.helpRequest.create({
    data: {
      requesterId,
      title: data.title,
      category: data.category,
      urgency: data.urgency,
      scheduledAt: scheduledDate,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      placeId: data.placeId || null,
      description: data.description || null,
      status: RequestStatus.PENDING,
    },
  });
}

module.exports = { createHelpRequest };