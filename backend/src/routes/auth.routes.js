const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { logon, register } = require('../controllers/auth.controller');
const profileImageUpload = require('../middleware/profileImageUpload');

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
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
  },
});

router.post('/logon', loginLimiter, logon);
router.post('/register', registerLimiter, profileImageUpload, register);

module.exports = router;
module.exports.loginLimiter = loginLimiter;
