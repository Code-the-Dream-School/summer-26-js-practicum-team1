const { randomUUID } = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { authSchema } = require('../validations/authSchema');
const asyncHandler = require('../utils/asyncHandler');

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 5 * 60 * 1000;
const JWT_TTL_MS = 60 * 60 * 1000;
const DUMMY_HASH = bcrypt.hashSync(randomUUID(), SALT_ROUNDS);

const cookieFlags = () => {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  };
};

const setJwtCookie = (res, user) => {
  const payload = { id: user.id, csrfToken: randomUUID() };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.cookie('jwt', token, { ...cookieFlags(), maxAge: JWT_TTL_MS });
  return payload.csrfToken;
};

const logLoginAttempt = (req, { email, outcome, userId = null }) => {
  console.log(
    JSON.stringify({
      event: 'login_attempt',
      outcome,
      email,
      userId,
      ip: req.ip,
      timestamp: new Date().toISOString(),
    })
  );
};

const logon = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store');

  const { error, value } = authSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details.map((detail) => detail.message),
    });
  }

  const { email, password } = value;

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
    logLoginAttempt(req, { email, outcome: 'unknown_email' });
    return res.status(401).json({ error: 'Authentication failed' });
  }

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    logLoginAttempt(req, { email, outcome: 'locked', userId: user.id });
    return res.status(423).json({
      error: 'Account temporarily locked due to too many failed login attemps',
    });
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

    logLoginAttempt(req, {
      email,
      outcome: lock ? 'locked_now' : 'bad_password',
      userId: user.id,
    });

    return lock
      ? res.status(423).json({
          error:
            'Account temporarily locked due to too many failed login attemps',
        })
      : res.status(401).json({ error: 'Authentication failed' });
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  }

  const csrfToken = setJwtCookie(res, user);
  logLoginAttempt(req, { email, outcome: 'success', userId: user.id });

  return res.status(200).json({
    id: user.id,
    name: user.name,
    role: user.role,
    csrfToken,
  });
});

const me = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store');

  return res.status(200).json({
    id: req.user.id,
    name: req.user.name,
    role: req.user.role,
    csrfToken: req.auth.csrfToken,
  });
});

module.exports = { logon, me, MAX_FAILED_ATTEMPTS, LOCK_DURATION_MS };
