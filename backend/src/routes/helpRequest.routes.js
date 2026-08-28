const express = require('express');

const router = express.Router();

const {
  createHelpRequest,
  getHelpRequests,
  getBrowseHelpRequests,
  getBrowseHelpRequestsFacets,
  acceptHelpRequest,
  declineHelpRequest,
} = require('../controllers/helpRequest.controller');

const jwtMiddleware = require('../middleware/jwt.middleware');
const csrfMiddleware = require('../middleware/csrf.middleware');
const validate = require('../middleware/validate.middleware');
const {
  requireRole,
  requireApprovedIfVolunteer,
} = require('../middleware/authorize');

const {
  createHelpRequestSchema,
  browseHelpRequestQuerySchema,
  facetsQuerySchema,
} = require('../validations/helpRequestSchema');

router.post(
  '/',
  jwtMiddleware,
  csrfMiddleware,
  requireRole('REQUESTER'),
  validate(createHelpRequestSchema),
  createHelpRequest
);

router.get(
  '/facets',
  jwtMiddleware,
  requireRole(['VOLUNTEER', 'ADMIN']),
  requireApprovedIfVolunteer,
  validate(facetsQuerySchema, 'query'),
  getBrowseHelpRequestsFacets
);

router.get(
  '/',
  jwtMiddleware,
  requireRole(['VOLUNTEER', 'ADMIN']),
  requireApprovedIfVolunteer,
  validate(browseHelpRequestQuerySchema, 'query'),
  getBrowseHelpRequests
);

router.get('/mine', jwtMiddleware, requireRole('REQUESTER'), getHelpRequests);

router.post(
  '/:id/accept',
  jwtMiddleware,
  csrfMiddleware,
  requireRole('VOLUNTEER'),
  requireApprovedIfVolunteer,
  acceptHelpRequest
);

router.post(
  '/:id/decline',
  jwtMiddleware,
  csrfMiddleware,
  requireRole('VOLUNTEER'),
  requireApprovedIfVolunteer,
  declineHelpRequest
);

module.exports = router;
