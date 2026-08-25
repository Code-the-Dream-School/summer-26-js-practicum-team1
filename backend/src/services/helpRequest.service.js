const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { RequestStatus } = require('@prisma/client');
const volunteerProfileService =require('../services/volunteerProfile.service')
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
    include: {
      volunteer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
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
async function getAcceptedVolunteerProfile({
  requestId,
  requesterId,
}) {
  const helpRequest = await prisma.helpRequest.findFirst({
    where: {
      id: requestId,
      requesterId,
    },
    select: {
      status: true,
      volunteerId: true,
    },
  });

  if (!helpRequest) {
    throw new ApiError(404, 'Help request not found');
  }

  if (helpRequest.status !== RequestStatus.ACCEPTED) {
    throw new ApiError(
      400,
      'Volunteer profile is only available for accepted requests'
    );
  }

  if (!helpRequest.volunteerId) {
    throw new ApiError(
      404,
      'No volunteer has been assigned to this request'
    );
  }

  const volunteer = await prisma.user.findUnique({
    where: {
      id: helpRequest.volunteerId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profileImage: true,
      profileImageType: true,

      volunteerProfile: {
        select: {
          bio: true,
          verificationStatus: true,
          serviceArea: true,
          serviceLatitude: true,
          serviceLongitude: true,
          availability: true,

          supportCategories: {
            select: {
              supportCategory: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!volunteer) {
    throw new ApiError(404, 'Volunteer not found');
  }

  return {
    id: volunteer.id,
    name: volunteer.name,
    email: volunteer.email,
    phone: volunteer.phone,
    profileImage: volunteer.profileImage,
    profileImageType: volunteer.profileImageType,

    volunteerProfile: volunteer.volunteerProfile
      ? {
          bio: volunteer.volunteerProfile.bio,
          verificationStatus:
            volunteer.volunteerProfile.verificationStatus,
          serviceArea: volunteer.volunteerProfile.serviceArea,
          serviceLatitude:
            volunteer.volunteerProfile.serviceLatitude,
          serviceLongitude:
            volunteer.volunteerProfile.serviceLongitude,
          availability: volunteer.volunteerProfile.availability,

          interests:
            volunteer.volunteerProfile.supportCategories.map(
              (row) => row.supportCategory
            ),
        }
      : null,
  };
}

module.exports = {
  createHelpRequest,
  getHelpRequests,
  getHelpRequestById,
  updateHelpRequest,
  cancelHelpRequest,
  getAcceptedVolunteerProfile
};
