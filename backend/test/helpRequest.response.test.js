const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/prisma', () => ({
  user: { findUnique: jest.fn() },
  helpRequest: {
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
  volunteerResponse: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  $transaction: jest.fn(),
  $executeRaw: jest.fn(),
}));

const prisma = require('../src/config/prisma');
const app = require('../src/app');

const CSRF_TOKEN = 'test-csrf-token';

const REQUESTER = {
  id: 1,
  name: 'Alice',
  role: 'REQUESTER',
  volunteerProfile: null,
};

const APPROVED_VOLUNTEER = {
  id: 5,
  name: 'Emma',
  role: 'VOLUNTEER',
  volunteerProfile: { verificationStatus: 'APPROVED' },
};

const PENDING_VOLUNTEER = {
  id: 6,
  name: 'Henry',
  role: 'VOLUNTEER',
  volunteerProfile: { verificationStatus: 'PENDING' },
};

const openRequest = {
  id: 12,
  requesterId: REQUESTER.id,
  volunteerId: null,
  status: 'PENDING',
  title: 'Groceries',
  category: 'GROCERY',
  urgency: 'MEDIUM',
  scheduledAt: new Date('2027-08-15T10:00:00.000Z'),
  address: '123 Main St',
  latitude: 37.33,
  longitude: -121.88,
  description: null,
  createdAt: new Date('2026-08-15T10:00:00.000Z'),
  completedAt: null,
};

const acceptedRequest = {
  ...openRequest,
  status: 'ACCEPTED',
  volunteerId: APPROVED_VOLUNTEER.id,
};

const sign = (userId) =>
  jwt.sign({ id: userId, csrfToken: CSRF_TOKEN }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

const postResponse = (path, userId) =>
  request(app)
    .post(path)
    .set('Cookie', `jwt=${sign(userId)}`)
    .set('x-csrf-token', CSRF_TOKEN)
    .send({});

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});

  prisma.$transaction.mockImplementation(async (fn) => fn(prisma));
  prisma.$executeRaw.mockResolvedValue(1);
  prisma.volunteerResponse.findUnique.mockResolvedValue(null);
  prisma.helpRequest.updateMany.mockResolvedValue({ count: 1 });
  prisma.volunteerResponse.create.mockResolvedValue({
    id: 1,
    requestId: openRequest.id,
    volunteerId: APPROVED_VOLUNTEER.id,
    action: 'ACCEPTED',
    createdAt: new Date('2026-08-24T19:00:00.000Z'),
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('POST /api/requests/:id/accept', () => {
  it('accepts an open request for an approved volunteer (T1)', async () => {
    prisma.user.findUnique.mockResolvedValue(APPROVED_VOLUNTEER);
    prisma.helpRequest.findUnique
      .mockResolvedValueOnce(openRequest)
      .mockResolvedValueOnce(acceptedRequest);

    const res = await postResponse(
      `/api/requests/${openRequest.id}/accept`,
      APPROVED_VOLUNTEER.id
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual(
      expect.objectContaining({
        id: openRequest.id,
        status: 'ACCEPTED',
        volunteerId: APPROVED_VOLUNTEER.id,
      })
    );
    expect(prisma.helpRequest.updateMany).toHaveBeenCalledWith({
      where: {
        id: openRequest.id,
        status: 'PENDING',
        volunteerId: null,
      },
      data: {
        status: 'ACCEPTED',
        volunteerId: APPROVED_VOLUNTEER.id,
      },
    });
    expect(prisma.volunteerResponse.create).toHaveBeenCalledWith({
      data: {
        requestId: openRequest.id,
        volunteerId: APPROVED_VOLUNTEER.id,
        action: 'ACCEPTED',
      },
    });
  });

  it('returns 409 when a second volunteer accepts after assignment (T3/T9)', async () => {
    prisma.user.findUnique.mockResolvedValue(APPROVED_VOLUNTEER);
    prisma.helpRequest.findUnique.mockResolvedValue(acceptedRequest);
    prisma.helpRequest.updateMany.mockResolvedValue({ count: 0 });

    const res = await postResponse(
      `/api/requests/${openRequest.id}/accept`,
      APPROVED_VOLUNTEER.id
    );

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('This request is no longer available');
    expect(prisma.volunteerResponse.create).not.toHaveBeenCalled();
  });

  it('rejects a requester (T4)', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    const res = await postResponse(
      `/api/requests/${openRequest.id}/accept`,
      REQUESTER.id
    );

    expect(res.status).toBe(403);
    expect(prisma.helpRequest.findUnique).not.toHaveBeenCalled();
  });

  it('rejects a pending volunteer applicant (T5)', async () => {
    prisma.user.findUnique.mockResolvedValue(PENDING_VOLUNTEER);

    const res = await postResponse(
      `/api/requests/${openRequest.id}/accept`,
      PENDING_VOLUNTEER.id
    );

    expect(res.status).toBe(403);
    expect(prisma.helpRequest.findUnique).not.toHaveBeenCalled();
  });

  it('rejects an invalid id (T6)', async () => {
    prisma.user.findUnique.mockResolvedValue(APPROVED_VOLUNTEER);

    const res = await postResponse('/api/requests/abc/accept', APPROVED_VOLUNTEER.id);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid request id');
  });

  it('returns 404 for an unknown request (T7)', async () => {
    prisma.user.findUnique.mockResolvedValue(APPROVED_VOLUNTEER);
    prisma.helpRequest.findUnique.mockResolvedValue(null);

    const res = await postResponse(
      '/api/requests/999/accept',
      APPROVED_VOLUNTEER.id
    );

    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Help request not found');
  });

  it('rejects accepting your own request (T8)', async () => {
    const volunteerRequester = {
      ...APPROVED_VOLUNTEER,
      id: REQUESTER.id,
    };
    prisma.user.findUnique.mockResolvedValue(volunteerRequester);
    prisma.helpRequest.findUnique.mockResolvedValue({
      ...openRequest,
      requesterId: REQUESTER.id,
    });

    const res = await postResponse(
      `/api/requests/${openRequest.id}/accept`,
      REQUESTER.id
    );

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Cannot respond to your own request');
  });

  it('returns 409 when the volunteer already responded (T10/T11)', async () => {
    prisma.user.findUnique.mockResolvedValue(APPROVED_VOLUNTEER);
    prisma.helpRequest.findUnique.mockResolvedValue(openRequest);
    prisma.volunteerResponse.findUnique.mockResolvedValue({
      requestId: openRequest.id,
      volunteerId: APPROVED_VOLUNTEER.id,
      action: 'DECLINED',
    });

    const res = await postResponse(
      `/api/requests/${openRequest.id}/accept`,
      APPROVED_VOLUNTEER.id
    );

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('You have already responded to this request');
    expect(prisma.helpRequest.updateMany).not.toHaveBeenCalled();
  });
});

describe('POST /api/requests/:id/decline', () => {
  it('declines an open request without changing assignment (T2)', async () => {
    prisma.user.findUnique.mockResolvedValue(APPROVED_VOLUNTEER);
    prisma.helpRequest.findUnique.mockResolvedValue(openRequest);
    prisma.volunteerResponse.create.mockResolvedValue({
      id: 2,
      requestId: openRequest.id,
      volunteerId: APPROVED_VOLUNTEER.id,
      action: 'DECLINED',
      createdAt: new Date('2026-08-24T19:00:00.000Z'),
    });

    const res = await postResponse(
      `/api/requests/${openRequest.id}/decline`,
      APPROVED_VOLUNTEER.id
    );

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: {
        requestId: openRequest.id,
        volunteerId: APPROVED_VOLUNTEER.id,
        action: 'DECLINED',
        createdAt: '2026-08-24T19:00:00.000Z',
      },
    });
    expect(prisma.$executeRaw).toHaveBeenCalled();
    expect(prisma.helpRequest.updateMany).not.toHaveBeenCalled();
    expect(prisma.volunteerResponse.create).toHaveBeenCalledWith({
      data: {
        requestId: openRequest.id,
        volunteerId: APPROVED_VOLUNTEER.id,
        action: 'DECLINED',
      },
    });
  });

  it('returns 409 when declining an already assigned request', async () => {
    prisma.user.findUnique.mockResolvedValue(APPROVED_VOLUNTEER);
    prisma.helpRequest.findUnique.mockResolvedValue(acceptedRequest);

    const res = await postResponse(
      `/api/requests/${openRequest.id}/decline`,
      APPROVED_VOLUNTEER.id
    );

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('This request is no longer available');
    expect(prisma.volunteerResponse.create).not.toHaveBeenCalled();
  });

  it('returns 409 when declining twice (T10)', async () => {
    prisma.user.findUnique.mockResolvedValue(APPROVED_VOLUNTEER);
    prisma.helpRequest.findUnique.mockResolvedValue(openRequest);
    prisma.volunteerResponse.findUnique.mockResolvedValue({
      requestId: openRequest.id,
      volunteerId: APPROVED_VOLUNTEER.id,
      action: 'DECLINED',
    });

    const res = await postResponse(
      `/api/requests/${openRequest.id}/decline`,
      APPROVED_VOLUNTEER.id
    );

    expect(res.status).toBe(409);
    expect(res.body.message).toBe('You have already responded to this request');
  });
});
