const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { logon } = require('../controllers/auth.controller');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

router.post('/logon', loginLimiter, logon);

module.exports = router;
