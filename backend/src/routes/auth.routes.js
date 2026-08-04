const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { register } = require('../controllers/auth.controller');

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

router.post('/register', registerLimiter, register);

module.exports = router;
