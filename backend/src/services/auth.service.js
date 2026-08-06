const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 5 * 60 * 1000;
const DUMMY_HASH = bcrypt.hashSync(randomUUID(), SALT_ROUNDS);

const isLocked = (user) =>
  Boolean(user.lockedUntil && user.lockedUntil > new Date());

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

module.exports = {
  verifyCredentials,
  MAX_FAILED_ATTEMPTS,
  LOCK_DURATION_MS,
};
