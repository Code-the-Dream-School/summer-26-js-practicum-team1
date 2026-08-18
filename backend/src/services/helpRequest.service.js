const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { RequestStatus } = require('@prisma/client');

async function createHelpRequest({ requesterId, data }) {
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
      description: data.description || null,
      status: RequestStatus.PENDING,
    },
  });
}


async function getHelpRequests({ requesterId }) {
  return prisma.helpRequest.findMany({
    where: {
      requesterId,
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  });
}
async function getHelpRequestById({ id, requesterId }) {
  const helpRequest = await prisma.helpRequest.findUnique({
    where: {
      id,
      requesterId,
    },
  });

  if (!helpRequest) {
    throw new ApiError(404, 'Help request not found');
  }

  return helpRequest;
}
async function updateHelpRequest({
  id,
  requesterId,
  data,
}) {
  const existingRequest = await prisma.helpRequest.findUnique({
    where: {
      id,
      requesterId,
    },
  });

  if (!existingRequest) {
    throw new ApiError(404, 'Help request not found');
  }

  if (existingRequest.status !== RequestStatus.PENDING) {
    throw new ApiError(
      400,
      'Only pending requests can be edited'
    );
  }

  return prisma.helpRequest.update({
    where: {
      id,
    },
    data: {
      title: data.title,
      category: data.category,
      urgency: data.urgency,
      scheduledAt: new Date(data.scheduledAt),
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  });
}
async function cancelHelpRequest({
  id,
  requesterId,
}) {
  const existingRequest = await prisma.helpRequest.findFirst({
    where: {
      id,
      requesterId,
    },
  });

  if (!existingRequest) {
    throw new ApiError(404, 'Help request not found');
  }

  if (existingRequest.status !== RequestStatus.PENDING) {
    throw new ApiError(
      400,
      'Only pending requests can be cancelled'
    );
  }

  return prisma.helpRequest.update({
    where: {
      id,
    },
    data: {
      status: RequestStatus.CANCELLED,
    },
  });
}


module.exports = {
  createHelpRequest,
  getHelpRequests,
  getHelpRequestById,
  updateHelpRequest,
  cancelHelpRequest
};
