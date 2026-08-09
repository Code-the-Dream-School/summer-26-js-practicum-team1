const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

const getProfile = async (userId) => {
  const profile = await prisma.user.findUnique({
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

  if (!profile) {
    throw new ApiError(404, 'User profile not found');
  }

  return profile;
};

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

const updateProfileImage = async (userId, imageBuffer) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      profileImage: imageBuffer,
    },
  });

  return {
    message: 'Profile image updated successfully',
  };
};

const getProfileImage = async (userId) => {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      profileImage: true,
    },
  });

  if (!profile) {
    throw new ApiError(404, 'User not found');
  }

  return profile;
};

module.exports = {
  getProfile,
  updateProfile,
  updateProfileImage,
  getProfileImage,
};
