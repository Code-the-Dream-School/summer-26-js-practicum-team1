const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
  },
  notification: {
    findMany: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
    findUnique: jest.fn(),
  },
}));

const prisma = require('../src/config/prisma');
const app = require('../src/app');

const CSRF_TOKEN = 'test-csrf-token';

const REQUESTER = {
  id: 3,
  name: 'Alice',
  role: 'REQUESTER',
  volunteerProfile: null,
};

const VOLUNTEER = {
  id: 5,
  name: 'Emma',
  role: 'VOLUNTEER',
  volunteerProfile: { verificationStatus: 'APPROVED' },
};

const sign = (userId) =>
  jwt.sign({ id: userId, csrfToken: CSRF_TOKEN }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

const sampleNotification = {
  id: 1,
  recipientId: REQUESTER.id,
  type: 'HELP_REQUEST_ACCEPTED',
  dedupeKey: 'help_request_accepted:12',
  payload: {
    type: 'HELP_REQUEST_ACCEPTED',
    requestId: 12,
    requestTitle: 'Groceries',
    requestCategory: 'GROCERY',
    requestUrgency: 'MEDIUM',
    volunteerId: 5,
    volunteerName: 'Emma Garcia',
    acceptedAt: '2026-08-28T14:32:01.123Z',
  },
  readAt: null,
  createdAt: new Date('2026-08-28T14:32:01.500Z'),
};

beforeEach(() => {
  jest.clearAllMocks();
  prisma.user.findUnique.mockImplementation(async ({ where }) => {
    if (where.id === REQUESTER.id) return REQUESTER;
    if (where.id === VOLUNTEER.id) return VOLUNTEER;
    return null;
  });
  prisma.notification.findMany.mockResolvedValue([sampleNotification]);
  prisma.notification.count.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
  prisma.notification.updateMany.mockResolvedValue({ count: 1 });
  prisma.notification.findUnique.mockResolvedValue({
    ...sampleNotification,
    readAt: new Date('2026-08-28T15:00:00.000Z'),
  });
});

describe('GET /api/notifications', () => {
  it('returns notifications for the requester', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Cookie', `jwt=${sign(REQUESTER.id)}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].payload.volunteerName).toBe('Emma Garcia');
    expect(res.body.meta.unreadCount).toBe(1);
  });

  it('rejects volunteers', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Cookie', `jwt=${sign(VOLUNTEER.id)}`);

    expect(res.status).toBe(403);
  });
});

describe('PATCH /api/notifications/:id/read', () => {
  it('marks a notification as read', async () => {
    const res = await request(app)
      .patch('/api/notifications/1/read')
      .set('Cookie', `jwt=${sign(REQUESTER.id)}`)
      .set('x-csrf-token', CSRF_TOKEN);

    expect(res.status).toBe(200);
    expect(res.body.data.readAt).toBeTruthy();
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { id: 1, recipientId: REQUESTER.id },
      data: expect.objectContaining({ readAt: expect.any(Date) }),
    });
  });

  it('returns 404 when notification is not owned by requester', async () => {
    prisma.notification.updateMany.mockResolvedValue({ count: 0 });

    const res = await request(app)
      .patch('/api/notifications/99/read')
      .set('Cookie', `jwt=${sign(REQUESTER.id)}`)
      .set('x-csrf-token', CSRF_TOKEN);

    expect(res.status).toBe(404);
  });
});
