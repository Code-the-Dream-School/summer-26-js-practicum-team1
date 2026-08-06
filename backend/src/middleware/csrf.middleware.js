const { timingSafeEqual } = require('crypto');

const tokensMatch = (a, b) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

const csrfMiddleware = (req, res, next) => {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  if (!req.auth || typeof req.auth.csrfToken !== 'string') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const clientToken = req.get('x-csrf-token');
  if (!clientToken || !tokensMatch(clientToken, req.auth.csrfToken)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  return next();
};

module.exports = csrfMiddleware;
