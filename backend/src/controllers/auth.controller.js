const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { authSchema } = require('../validation/authSchema');

const cookieFlags = (req) => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  };
};

const setJwtCookie = (req, res, user) => {
  const payload = { id: user.id, csrfToken: randomUUID() };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.cookie('jwt', token, { ...cookieFlags(req), maxAge: 3600000 });
  return payload.csrfToken;
};

const logon = async (req, res, next) => {
  const { error, value } = authSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      message: 'Validation failed',
      details: error.details,
    });
  }

  try {
    const { email, password } = value;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return res.status(401).json({ message: 'Authentication Failed' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Authentication Failed' });
    }

    const csrfToken = setJwtCookie(req, res, user);

    res.status(200).json({
      id: user.id,
      name: user.name,
      role: user.role,
      csrfToken,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { logon };
