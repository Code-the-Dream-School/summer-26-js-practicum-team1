const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const getPreferences = async (userId) => {
  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId },
    select: {
      serviceArea: true,
      serviceLatitude: true,
      serviceLongitude: true,
      availability: true,
      supportCategories: {
        select: {
          supportCategory: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!profile) {
    throw new ApiError(404, 'Volunteer profile not found');
  }

  return {
    serviceArea: profile.serviceArea,
    serviceLatitude: profile.serviceLatitude,
    serviceLongitude: profile.serviceLongitude,
    availability: profile.availability,
    interests: profile.supportCategories.map((row) => row.supportCategory),
  };
};

const updatePreferences = async (userId, data) => {
  const existing = await prisma.volunteerProfile.findUnique({
    where: { userId },
    select: { userId: true },
  });

  if (!existing) {
    throw new ApiError(404, 'Volunteer profile not found');
  }

  const {
    serviceArea,
    serviceLatitude,
    serviceLongitude,
    availability,
    interestIds,
  } = data;

  if (interestIds !== undefined) {
    const uniqueIds = [...new Set(interestIds)];

    if (uniqueIds.length > 0) {
      const found = await prisma.supportCategory.findMany({
        where: { id: { in: uniqueIds } },
        select: { id: true },
      });

      if (found.length !== uniqueIds.length) {
        throw new ApiError(400, 'One or more interest ids are invalid');
      }
    }
  }

  await prisma.$transaction(async (tx) => {
    const profileData = {};

    if (serviceArea !== undefined) {
      profileData.serviceArea = serviceArea === '' ? null : serviceArea;
    }

    if (serviceLatitude !== undefined) {
      profileData.serviceLatitude = serviceLatitude;
    }

    if (serviceLongitude !== undefined) {
      profileData.serviceLongitude = serviceLongitude;
    }

    if (availability !== undefined) {
      profileData.availability = availability;
    }

    if (Object.keys(profileData).length > 0) {
      await tx.volunteerProfile.update({
        where: { userId },
        data: profileData,
      });
    }

    if (interestIds !== undefined) {
      const uniqueIds = [...new Set(interestIds)];

      await tx.userSupportCategory.deleteMany({
        where: { volunteerId: userId },
      });

      if (uniqueIds.length > 0) {
        await tx.userSupportCategory.createMany({
          data: uniqueIds.map((supportCategoryId) => ({
            volunteerId: userId,
            supportCategoryId,
          })),
        });
      }
    }
  });

  return getPreferences(userId);
};

const listSupportCategories = async () => {
  return prisma.supportCategory.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
};

module.exports = { getPreferences, updatePreferences, listSupportCategories };
