const express = require('express');

const router = express.Router();

const {
  createHelpRequest,
  getHelpRequests,
  getHelpRequestById,
  getMyAcceptedRequests,
  updateHelpRequest,
  cancelHelpRequest,
  getAcceptedVolunteerProfile,
  getBrowseHelpRequests,
  getCategoryFacets,
  acceptHelpRequest,
  declineHelpRequest,
  completeHelpRequest,
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
router.get('/mine', jwtMiddleware, requireRole('REQUESTER'), getHelpRequests);

// Get browse help request facets
router.get(
  '/facets',
  jwtMiddleware,
  requireRole(['VOLUNTEER', 'ADMIN']),
  requireApprovedIfVolunteer,
  validate(facetsQuerySchema, 'query'),
  getCategoryFacets
);
// Get accepted help requests for the authenticated volunteer

router.get(
  '/volunteer/accepted',
  jwtMiddleware,
  requireRole('VOLUNTEER'),
  requireApprovedIfVolunteer,
  getMyAcceptedRequests
);
// Get accepted volunteer profile for a help request
router.get(
  '/:id/volunteer',
  jwtMiddleware,
  requireRole('REQUESTER'),
  getAcceptedVolunteerProfile
);

// Get one help request for view
router.get(
  '/:id',
  jwtMiddleware,
  requireApprovedIfVolunteer,
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

// Browse help requests
router.get(
  '/',
  jwtMiddleware,
  requireRole(['VOLUNTEER', 'ADMIN']),
  requireApprovedIfVolunteer,
  validate(browseHelpRequestQuerySchema, 'query'),
  getBrowseHelpRequests
);

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

router.post(
  '/:id/complete',
  jwtMiddleware,
  csrfMiddleware,
  requireRole('VOLUNTEER'),
  requireApprovedIfVolunteer,
  completeHelpRequest
);

module.exports = router;
