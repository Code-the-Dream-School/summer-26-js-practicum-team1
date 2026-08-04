const bcrypt = require('bcrypt');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

async function createRequester({ name, email, password, dob, gender, phone }) {
  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    throw new ApiError(409, 'This email is already registered');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    return await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        dob: new Date(dob),
        gender,
        phone: phone || null,
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

module.exports = { createRequester };
