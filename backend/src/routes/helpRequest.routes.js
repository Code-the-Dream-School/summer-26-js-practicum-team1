const express = require('express');

const router = express.Router();

const {
  createHelpRequest,
} = require('../controllers/helpRequest.controller');

const jwtMiddleware = require('../middleware/jwt.middleware');
const csrfMiddleware = require('../middleware/csrf.middleware');
const validate = require('../middleware/validate.middleware');

const {
  createHelpRequestSchema,
} = require('../validations/helpRequestSchema');

router.post(
  '/',
  jwtMiddleware,
  csrfMiddleware,
  validate(createHelpRequestSchema),
  createHelpRequest
);

module.exports = router;