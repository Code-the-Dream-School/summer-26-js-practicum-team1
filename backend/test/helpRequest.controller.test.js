const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
  },
  helpRequest: {
    create: jest.fn(),
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
});