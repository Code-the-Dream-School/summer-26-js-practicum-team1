const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { logon, me, register } = require('../controllers/auth.controller');
const jwtMiddleware = require('../middleware/jwt.middleware');
const validate = require('../middleware/validate.middleware');
const profileImageUpload = require('../middleware/profileImageUpload');
const { authSchema } = require('../validations/authSchema');
const { registerSchema } = require('../validations/registerSchema');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

router.post('/logon', loginLimiter, validate(authSchema), logon);
router.get('/me', jwtMiddleware, me);
router.post(
  '/register',
  registerLimiter,
  profileImageUpload,
  validate(registerSchema),
  register
);

module.exports = router;
module.exports.loginLimiter = loginLimiter;
module.exports.registerLimiter = registerLimiter;
