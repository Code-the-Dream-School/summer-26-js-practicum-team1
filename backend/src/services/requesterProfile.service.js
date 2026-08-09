const prisma = require('../config/prisma');

const getProfile = async (userId) => {
  return prisma.user.findUnique({
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
};

const updateProfile = async (userId, data) => {
  const { phone, address, city, bio, emergencyContact } = data;

  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        phone,
      },
    });

    await tx.requesterProfile.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        address,
        city,
        bio,
        emergencyContact,
      },
      update: {
        address,
        city,
        bio,
        emergencyContact,
      },
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
  getProfile,
  updateProfile,
};
module.exports = { getProfile, updateProfile };
