const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 5 * 60 * 1000;
const DUMMY_HASH = bcrypt.hashSync(randomUUID(), SALT_ROUNDS);

const isLocked = (user) =>
  Boolean(user.lockedUntil && user.lockedUntil > new Date());

async function verifyGoogleToken(idToken) {
  let ticket;

  try {
    ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
  } catch {
    throw new ApiError(401, 'Invalid Google authentication');
  }

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email || !payload.email_verified) {
    throw new ApiError(401, 'Invalid Google authentication');
  }

  return {
    googleId: payload.sub,
    email: payload.email.toLowerCase(),
    name: payload.name,
    picture: payload.picture,
  };
}

async function findOrLinkGoogleUser({ googleId, email }) {
  const userByGoogleId = await prisma.user.findUnique({
    where: { googleId },
    select: {
      id: true,
      name: true,
      role: true,
      volunteerProfile: {
        select: { verificationStatus: true },
      },
    },
  });

  if (userByGoogleId) {
    return userByGoogleId;
  }

  const userByEmail = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      role: true,
      googleId: true,
      volunteerProfile: {
        select: { verificationStatus: true },
      },
    },
  });

  if (!userByEmail) {
    throw new ApiError(
      404,
      'No account exists with this Google email. Please register first.'
    );
  }

  if (userByEmail.googleId && userByEmail.googleId !== googleId) {
    throw new ApiError(
      409,
      'This account is linked to a different Google account'
    );
  }

  return prisma.user.update({
    where: { id: userByEmail.id },
    data: { googleId },
    select: {
      id: true,
      name: true,
      role: true,
      volunteerProfile: {
        select: { verificationStatus: true },
      },
    },
  });
}

async function verifyCredentials({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      role: true,
      passwordHash: true,
      failedLoginAttempts: true,
      lockedUntil: true,
      volunteerProfile: { select: { verificationStatus: true } },
    },
  });

  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    return { outcome: 'unknown_email' };
  }

  if (isLocked(user)) {
    return { outcome: 'locked', user };
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    const attempts = user.failedLoginAttempts + 1;
    const lock = attempts >= MAX_FAILED_ATTEMPTS;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: lock ? 0 : attempts,
        lockedUntil: lock ? new Date(Date.now() + LOCK_DURATION_MS) : null,
      },
    });

    return { outcome: lock ? 'locked_now' : 'bad_password', user };
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  return { outcome: 'success', user };
}

async function createRequester({
  name,
  email,
  password,
  dob,
  gender,
  phone,
  profileImage,
}) {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    throw new ApiError(409, 'This email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    return await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        dob: new Date(dob),
        gender,
        phone: phone || null,
        profileImage: profileImage || null,
        role: 'REQUESTER',
      },
      select: {
        id: true,
        name: true,
        role: true,
      },
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ApiError(409, 'This email is already registered');
    }
    throw err;
  }
}

async function createVolunteerApplicant({
  name,
  email,
  password,
  dob,
  gender,
  phone,
  profileImage,
}) {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    throw new ApiError(409, 'This email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          dob: new Date(dob),
          gender,
          phone: phone || null,
          profileImage: profileImage || null,
          role: 'VOLUNTEER',
        },
        select: {
          id: true,
          name: true,
          role: true,
        },
      });

      await tx.volunteerProfile.create({
        data: {
          userId: user.id,
          verificationStatus: 'PENDING',
        },
      });

      return user;
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ApiError(409, 'This email is already registered');
    }
    throw err;
  }
}

module.exports = {
  createRequester,
  createVolunteerApplicant,
  verifyCredentials,
  verifyGoogleToken,
  findOrLinkGoogleUser,
  MAX_FAILED_ATTEMPTS,
  LOCK_DURATION_MS,
};
