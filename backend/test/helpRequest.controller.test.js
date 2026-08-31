const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
  },
  helpRequest: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
}));

const prisma = require('../src/config/prisma');
const app = require('../src/app');

const CSRF_TOKEN = '1-22-333-4444-55555';

const REQUESTER = {
  id: 1,
  name: 'Alice',
  role: 'REQUESTER',
};

const VOLUNTEER = {
  id: 2,
  name: 'Bob',
  role: 'VOLUNTEER',
};

const validBody = {
  title: 'Grocery Shopping Help',
  category: 'GROCERY',
  urgency: 'MEDIUM',
  scheduledAt: '2027-08-15T10:00:00.000Z',
  address: '1000 Main Street, Folsom, CA 95630',
  latitude: 38.6779,
  longitude: -121.1761,
  description: 'I need help picking up groceries.',
};

const sign = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

const postHelpRequest = (user, body = validBody) => {
  const token = sign({
    id: user.id,
    csrfToken: CSRF_TOKEN,
  });

  return request(app)
    .post('/api/requests')
    .set('Cookie', `jwt=${token}`)
    .set('x-csrf-token', CSRF_TOKEN)
    .send(body);
};

const getHelpRequests = (user) => {
  const token = sign({
    id: user.id,
    csrfToken: CSRF_TOKEN,
  });

  return request(app)
    .get('/api/requests/mine')
    .set('Cookie', `jwt=${token}`)
    .set('x-csrf-token', CSRF_TOKEN);
};

beforeEach(() => {
  jest.clearAllMocks();

  prisma.helpRequest.create.mockResolvedValue({
    id: 10,
    requesterId: REQUESTER.id,
    title: validBody.title,
    category: validBody.category,
    urgency: validBody.urgency,
    scheduledAt: new Date(validBody.scheduledAt),
    address: validBody.address,
    latitude: validBody.latitude,
    longitude: validBody.longitude,
    description: validBody.description,
    status: 'PENDING',
  });
});

describe('POST /api/requests', () => {
  it('creates a help request for an authenticated REQUESTER', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    const res = await postHelpRequest(REQUESTER);

    expect(res.status).toBe(201);

    expect(res.body.success).toBe(true);

    expect(res.body.data).toEqual(
      expect.objectContaining({
        id: 10,
        requesterId: REQUESTER.id,
        title: validBody.title,
        category: 'GROCERY',
        urgency: 'MEDIUM',
        status: 'PENDING',
      })
    );

    expect(prisma.helpRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        requesterId: REQUESTER.id,
        title: validBody.title,
        category: 'GROCERY',
        urgency: 'MEDIUM',
        status: 'PENDING',
      }),
    });
  });

  it('returns 403 when a VOLUNTEER tries to create a help request', async () => {
    prisma.user.findUnique.mockResolvedValue(VOLUNTEER);

    const res = await postHelpRequest(VOLUNTEER);

    expect(res.status).toBe(403);

    expect(res.body.error).toBe('Forbidden');

    expect(prisma.helpRequest.create).not.toHaveBeenCalled();
  });

  it('returns 401 when no JWT is provided', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('x-csrf-token', CSRF_TOKEN)
      .send(validBody);

    expect(res.status).toBe(401);

    expect(res.body).toEqual({
      error: 'Unauthorized',
    });

    expect(prisma.helpRequest.create).not.toHaveBeenCalled();
  });

  it('returns 400 when requesterId is injected into the request body', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    const res = await postHelpRequest(REQUESTER, {
      ...validBody,
      requesterId: 999,
    });

    expect(res.status).toBe(400);

    expect(res.body.error).toBe('Validation failed');

    expect(prisma.helpRequest.create).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid help request data', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    const res = await postHelpRequest(REQUESTER, {
      ...validBody,
      title: '',
    });

    expect(res.status).toBe(400);

    expect(res.body.error).toBe('Validation failed');

    expect(prisma.helpRequest.create).not.toHaveBeenCalled();
  });

  it('returns 400 when scheduledAt is in the past', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    const res = await postHelpRequest(REQUESTER, {
      ...validBody,
      scheduledAt: '2020-01-01T10:00:00.000Z',
    });

    expect(res.status).toBe(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('scheduledAt must be a future date');

    expect(prisma.helpRequest.create).not.toHaveBeenCalled();
  });

  it('returns 400 when scheduledAt is invalid', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    const res = await postHelpRequest(REQUESTER, {
      ...validBody,
      scheduledAt: 'not-a-valid-date',
    });

    expect(res.status).toBe(400);

    expect(res.body.error).toBe('Validation failed');

    expect(prisma.helpRequest.create).not.toHaveBeenCalled();
  });

  it('creates a help request with description omitted', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

   const { description, ...bodyWithoutDescription } = validBody;

    prisma.helpRequest.create.mockResolvedValue({
      id: 11,
      requesterId: REQUESTER.id,
      title: bodyWithoutDescription.title,
      category: bodyWithoutDescription.category,
      urgency: bodyWithoutDescription.urgency,
      scheduledAt: new Date(bodyWithoutDescription.scheduledAt),
      address: bodyWithoutDescription.address,
      latitude: bodyWithoutDescription.latitude,
      longitude: bodyWithoutDescription.longitude,
      description: null,
      status: 'PENDING',
    });

    const res = await postHelpRequest(REQUESTER, bodyWithoutDescription);

    expect(res.status).toBe(201);

    expect(res.body.success).toBe(true);

    expect(prisma.helpRequest.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        requesterId: REQUESTER.id,
        description: null,
        status: 'PENDING',
      }),
    });
  });

  it('returns 403 when CSRF token is missing', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    const token = sign({
      id: REQUESTER.id,
      csrfToken: CSRF_TOKEN,
    });

    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', `jwt=${token}`)
      .send(validBody);

    expect(res.status).toBe(403);

    expect(prisma.helpRequest.create).not.toHaveBeenCalled();
  });

  it('returns 403 when CSRF token does not match JWT', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    const token = sign({
      id: REQUESTER.id,
      csrfToken: CSRF_TOKEN,
    });

    const res = await request(app)
      .post('/api/requests')
      .set('Cookie', `jwt=${token}`)
      .set('x-csrf-token', 'wrong-csrf-token')
      .send(validBody);

    expect(res.status).toBe(403);

    expect(prisma.helpRequest.create).not.toHaveBeenCalled();
  });

  it('returns 400 when category is invalid', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    const res = await postHelpRequest(REQUESTER, {
      ...validBody,
      category: 'INVALID_CATEGORY',
    });

    expect(res.status).toBe(400);

    expect(res.body.error).toBe('Validation failed');

    expect(prisma.helpRequest.create).not.toHaveBeenCalled();
  });

  it('returns 400 when urgency is invalid', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    const res = await postHelpRequest(REQUESTER, {
      ...validBody,
      urgency: 'INVALID_URGENCY',
    });

    expect(res.status).toBe(400);

    expect(res.body.error).toBe('Validation failed');

    expect(prisma.helpRequest.create).not.toHaveBeenCalled();
  });

  it('returns 400 when title is too long', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    const res = await postHelpRequest(REQUESTER, {
      ...validBody,
      title: 'A'.repeat(101),
    });

    expect(res.status).toBe(400);

    expect(res.body.error).toBe('Validation failed');

    expect(prisma.helpRequest.create).not.toHaveBeenCalled();
  });

  it('does not allow the client to override status', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    const res = await postHelpRequest(REQUESTER, {
      ...validBody,
      status: 'ACCEPTED',
    });

    expect(res.status).toBe(400);

    expect(res.body.error).toBe('Validation failed');

    expect(prisma.helpRequest.create).not.toHaveBeenCalled();
  });

  it('does not allow the client to provide volunteerId', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    const res = await postHelpRequest(REQUESTER, {
      ...validBody,
      volunteerId: 2,
    });

    expect(res.status).toBe(400);

    expect(res.body.error).toBe('Validation failed');

    expect(prisma.helpRequest.create).not.toHaveBeenCalled();
  });
});

describe('GET /api/requests/mine', () => {
  const helpRequests = [
    {
      id: 10,
      requesterId: REQUESTER.id,
      title: 'Grocery Shopping Help',
      category: 'GROCERY',
      urgency: 'MEDIUM',
      scheduledAt: new Date('2027-08-15T10:00:00.000Z'),
      address: '1000 Main Street, Folsom, CA 95630',
      latitude: 38.6779,
      longitude: -121.1761,
      description: 'I need help picking up groceries.',
      status: 'PENDING',
    },
    {
      id: 11,
      requesterId: REQUESTER.id,
      title: 'Yard Work Help',
      category: 'YARD_WORK',
      urgency: 'LOW',
      scheduledAt: new Date('2027-08-20T10:00:00.000Z'),
      address: '2000 Oak Street, Folsom, CA 95630',
      latitude: 38.678,
      longitude: -121.177,
      description: 'Help with yard work.',
      status: 'PENDING',
    },
  ];

  it('returns all help requests belonging to the authenticated requester', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    prisma.helpRequest.findMany.mockResolvedValue(helpRequests);

    const res = await getHelpRequests(REQUESTER);

    expect(res.status).toBe(200);

    expect(res.body.success).toBe(true);

    expect(res.body.data).toHaveLength(2);

    expect(res.body.data[0]).toEqual(
      expect.objectContaining({
        id: 10,
        requesterId: REQUESTER.id,
        title: 'Grocery Shopping Help',
        category: 'GROCERY',
        urgency: 'MEDIUM',
        status: 'PENDING',
      })
    );

    expect(prisma.helpRequest.findMany).toHaveBeenCalledWith({
      where: {
        requesterId: REQUESTER.id,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  });

  it('returns an empty array when the requester has no help requests', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    prisma.helpRequest.findMany.mockResolvedValue([]);

    const res = await getHelpRequests(REQUESTER);

    expect(res.status).toBe(200);

    expect(res.body.success).toBe(true);

    expect(res.body.data).toEqual([]);

    expect(prisma.helpRequest.findMany).toHaveBeenCalledWith({
      where: {
        requesterId: REQUESTER.id,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });
  });

  it('returns 401 when no JWT is provided', async () => {
    const res = await request(app)
      .get('/api/requests/mine')
      .set('x-csrf-token', CSRF_TOKEN);

    expect(res.status).toBe(401);

    expect(res.body).toEqual({
      error: 'Unauthorized',
    });

    expect(prisma.helpRequest.findMany).not.toHaveBeenCalled();
  });

  it('returns 403 when a volunteer tries to get requester help requests', async () => {
    prisma.user.findUnique.mockResolvedValue(VOLUNTEER);

    const res = await getHelpRequests(VOLUNTEER);

    expect(res.status).toBe(403);

    expect(res.body.error).toBe('Forbidden');

    expect(prisma.helpRequest.findMany).not.toHaveBeenCalled();
  });

  it('only queries help requests for the authenticated requester', async () => {
    prisma.user.findUnique.mockResolvedValue(REQUESTER);

    prisma.helpRequest.findMany.mockResolvedValue(helpRequests);

    await getHelpRequests(REQUESTER);

    expect(prisma.helpRequest.findMany).toHaveBeenCalledWith({
      where: {
        requesterId: REQUESTER.id,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    });

    expect(prisma.helpRequest.findMany).not.toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          requesterId: 999,
        }),
      })
    );
  });
});
