const { randomUUID } = require('crypto');
const jwt = require('jsonwebtoken');
const { authSchema } = require('../validations/authSchema');
const asyncHandler = require('../utils/asyncHandler');
const { verifyCredentials } = require('../services/auth.service');

const JWT_TTL_MS = 60 * 60 * 1000;
const LOCKED = {
  status: 423,
  body: {
    error: 'Account temporarily locked due to too many failed login attempts',
  },
};
const AUTH_FAILED = {
  status: 401,
  body: { error: 'Authentication failed' },
};

const LOGON_FAILURES = {
  unknown_email: AUTH_FAILED,
  bad_password: AUTH_FAILED,
  locked: LOCKED,
  locked_now: LOCKED,
};

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

const clientSession = (user, csrfToken) => ({
  id: user.id,
  name: user.name,
  role: user.role.toLowerCase(),
  csrfToken,
});

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
  const { outcome, user } = await verifyCredentials({ email, password });

  logLoginAttempt(req, { email, outcome, userId: user?.id ?? null });

  if (outcome !== 'success') {
    const { status, body } = LOGON_FAILURES[outcome];
    return res.status(status).json(body);
  }

  const csrfToken = setJwtCookie(res, user);
  return res.status(200).json(clientSession(user, csrfToken));
});

const me = asyncHandler(async (req, res) => {
  res.set('Cache-Control', 'no-store');
  return res.status(200).json(clientSession(req.user, req.auth.csrfToken));
});

module.exports = { logon, me };
