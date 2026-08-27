const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const updateProfile = async (userId, data) => {
  const { phone, address, city, bio, emergencyContact } = data;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  return prisma.$transaction(async (tx) => {
    if (phone !== undefined) {
      await tx.user.update({
        where: { id: userId },
        data: { phone },
      });
    }

    const profileData = {};

    if (address !== undefined) {
      profileData.address = address;
    }

    if (city !== undefined) {
      profileData.city = city;
    }

    if (bio !== undefined) {
      profileData.bio = bio;
    }

    if (emergencyContact !== undefined) {
      profileData.emergencyContact = emergencyContact;
    }

    await tx.requesterProfile.upsert({
      where: {
        userId,
      },

      create: {
        userId,
        ...profileData,
      },

      update: profileData,
    });

    return tx.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dob: true,
        gender: true,
        role: true,
        requesterProfile: {
          select: {
            address: true,
            city: true,
            bio: true,
            emergencyContact: true,
          },
        },
      },
    });
  });
};

module.exports = {
  updateProfile,
};
