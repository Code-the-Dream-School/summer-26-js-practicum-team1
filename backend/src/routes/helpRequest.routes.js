const express = require('express');

const router = express.Router();

const {
  createHelpRequest,
  getHelpRequests,
  getHelpRequestById,
  updateHelpRequest,
  cancelHelpRequest,
} = require('../controllers/helpRequest.controller');

const jwtMiddleware = require('../middleware/jwt.middleware');
const csrfMiddleware = require('../middleware/csrf.middleware');
const validate = require('../middleware/validate.middleware');
const { requireRole } = require('../middleware/authorize');

const {
  createHelpRequestSchema,
} = require('../validations/helpRequestSchema');


// Create help request
router.post(
  '/',
  jwtMiddleware,
  csrfMiddleware,
  requireRole('REQUESTER'),
  validate(createHelpRequestSchema),
  createHelpRequest
);


// Get requester's help requests
router.get(
  '/mine',
  jwtMiddleware,
  requireRole('REQUESTER'),
  getHelpRequests
);


// Get one help request for view
router.get(
  '/:id',
  jwtMiddleware,
  csrfMiddleware,
  requireRole('REQUESTER'),
  getHelpRequestById
);


// Update help request
router.patch(
  '/:id',
  jwtMiddleware,
  csrfMiddleware,
  requireRole('REQUESTER'),
  validate(createHelpRequestSchema),
  updateHelpRequest
);


// Cancel help request
router.patch(
  '/:id/cancel',
  jwtMiddleware,
  csrfMiddleware,
  requireRole('REQUESTER'),
  cancelHelpRequest
);


module.exports = router;