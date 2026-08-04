const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const unauthorized = (res) => res.status(401).json({ error: 'Unauthorized' });

const jwtMiddleware = async (req, res, next) => {
  const token = req.cookies?.jwt;
  if (!token) {
    return unauthorized(res);
  }

  if (!process.env.JWT_SECRET) {
    return next(new Error('JWT_SECRET is not configured'));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'],
    });
  } catch {
    return unauthorized(res);
  }

  if (!Number.isInteger(decoded.id) || typeof decoded.csrfToken !== 'string') {
    return unauthorized(res);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, name: true, role: true },
    });

    if (!user) {
      return unauthorized(res);
    }

    req.user = user;
    req.auth = { csrfToken: decoded.csrfToken };
    return next();
  } catch (err) {
    return next(err);
  }
};

module.exports = jwtMiddleware;
