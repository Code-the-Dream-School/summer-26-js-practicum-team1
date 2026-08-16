const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { VerificationStatus, Role } = require('@prisma/client');

async function getDashboardStats() {
  const [totalUsers, pendingVolunteers, totalRequesters, totalVolunteers] =
    await prisma.$transaction([
      prisma.user.count(),
      prisma.volunteerProfile.count({
        where: { verificationStatus: VerificationStatus.PENDING },
      }),
      prisma.user.count({ where: { role: Role.REQUESTER } }),
      prisma.user.count({ where: { role: Role.VOLUNTEER } }),
    ]);

  return { totalUsers, totalRequesters, totalVolunteers, pendingVolunteers };
}
async function getPendingVolunteers({ page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;

  const [volunteers, total] = await prisma.$transaction([
    prisma.volunteerProfile.findMany({
      where: { verificationStatus: VerificationStatus.PENDING },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            dob: true,
            gender: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
    }),
    prisma.volunteerProfile.count({
      where: { verificationStatus: VerificationStatus.PENDING },
    }),
  ]);

  return {
    volunteers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
}
async function reviewVolunteer({ volunteerId, adminId, status, notes }) {
  if (
    ![VerificationStatus.APPROVED, VerificationStatus.REJECTED].includes(status)
  ) {
    throw new ApiError(400, 'Status must be APPROVED or REJECTED');
  }

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.volunteerProfile.updateMany({
      where: {
        userId: volunteerId,
        verificationStatus: VerificationStatus.PENDING,
      },
      data: { verificationStatus: status },
    });

    if (count === 0) {
      const existing = await tx.volunteerProfile.findUnique({
        where: { userId: volunteerId },
      });
      if (!existing) {
        throw new ApiError(404, 'Volunteer profile not found');
      }
      throw new ApiError(409, 'Volunteer request has already been reviewed');
    }

    if (status === VerificationStatus.APPROVED) {
      await tx.user.update({
        where: { id: volunteerId },
        data: {
          role: Role.VOLUNTEER,
        },
      });
    }

    await tx.volunteerVerification.create({
      data: {
        volunteerId,
        status,
        reviewedBy: adminId,
        notes: notes || `${status} by admin`,
      },
    });

    return tx.volunteerProfile.findUnique({
      where: { userId: volunteerId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  });
}

async function getUsers(page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        gender: true,
        phone: true,
        dob: true,
        createdAt: true,
      },
    }),
    prisma.user.count(),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

const getRequesterProfileById = async (userId) => {
  const profile = await prisma.user.findFirst({
    where: {
      id: userId,
      role: 'REQUESTER',
    },
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
    throw new ApiError(404, 'Requester profile not found');
  }

  return profile;
};
module.exports = {
  getDashboardStats,
  getPendingVolunteers,
  reviewVolunteer,
  getUsers,
  getRequesterProfileById,
};
