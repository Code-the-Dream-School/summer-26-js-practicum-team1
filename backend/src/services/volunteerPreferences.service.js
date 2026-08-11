const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const preferenceSelect = {
  serviceArea: true,
  availability: true,
  supportCategories: {
    select: {
      supportCategory: {
        select: { id: true, name: true },
      },
    },
    orderBy: { supportCategory: { name: 'asc' } },
  },
};

const toPreferencesResponse = (profile) => ({
  serviceArea: profile.serviceArea,
  availability: profile.availability,
  interests: profile.supportCategories.map((row) => row.supportCategory),
});

async function getVolunteerPreferences(userId) {
  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId },
    select: preferenceSelect,
  });

  if (!profile) {
    throw new ApiError(403, 'Forbidden');
  }

  return toPreferencesResponse(profile);
}

async function updateVolunteerPreferences(
  userId,
  { serviceArea, availability, interestIds }
) {
  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId },
    select: { userId: true },
  });

  if (!profile) {
    throw new ApiError(403, 'Forbidden');
  }

  if (interestIds.length > 0) {
    const categories = await prisma.supportCategory.findMany({
      where: { id: { in: interestIds } },
      select: { id: true },
    });

    if (categories.length !== interestIds.length) {
      throw new ApiError(400, 'One or more interest categories are invalid');
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.volunteerProfile.update({
      where: { userId },
      data: {
        serviceArea: serviceArea ?? null,
        availability: availability ?? null,
      },
    });

    await tx.userSupportCategory.deleteMany({ where: { volunteerId: userId } });

    if (interestIds.length > 0) {
      await tx.userSupportCategory.createMany({
        data: interestIds.map((supportCategoryId) => ({
          volunteerId: userId,
          supportCategoryId,
        })),
      });
    }

    return tx.volunteerProfile.findUnique({
      where: { userId },
      select: preferenceSelect,
    });
  });

  return toPreferencesResponse(updated);
}

module.exports = {
  getVolunteerPreferences,
  updateVolunteerPreferences,
};
