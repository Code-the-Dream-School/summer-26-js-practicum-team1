const express = require('express');

const router = express.Router();

const jwtMiddleware = require('../middleware/jwt.middleware');
const {
  listSupportCategories,
} = require('../controllers/volunteerProfile.controller');

router.get('/', jwtMiddleware, listSupportCategories);

module.exports = router;
