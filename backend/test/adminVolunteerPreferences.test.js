jest.mock('../src/middleware/jwt.middleware', () => (req, res, next) => {
  req.user = { id: 1, name: 'Admin', role: 'ADMIN' };
  req.auth = { csrfToken: 'test-csrf-token' };
  next();
});

jest.mock('../src/middleware/csrf.middleware', () => (req, res, next) => next());

jest.mock('../src/middleware/adminAuth', () => ({
  adminAuth: (req, res, next) => next(),
}));

jest.mock('../src/config/prisma', () => ({
  volunteerProfile: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  supportCategory: {
    findMany: jest.fn(),
  },
  userSupportCategory: {
    deleteMany: jest.fn(),
    createMany: jest.fn(),
  },
  $transaction: jest.fn(),
}));

const request = require('supertest');
const prisma = require('../src/config/prisma');
const app = require('../src/app');

const CSRF_HEADER = { 'X-CSRF-TOKEN': 'test-csrf-token' };

const savedProfile = {
  serviceArea: 'Downtown',
  availability: {
    frequency: 'WEEKLY',
    slots: [{ dayOfWeek: 'MON', startTime: '09:00', endTime: '12:00' }],
  },
  supportCategories: [
    { supportCategory: { id: 1, name: 'Groceries' } },
  ],
};

const validBody = {
  serviceArea: 'Downtown',
  availability: savedProfile.availability,
  interestIds: [1],
};

beforeEach(() => {
  prisma.supportCategory.findMany.mockResolvedValue([{ id: 1 }]);
  prisma.volunteerProfile.update.mockResolvedValue({ userId: 9 });
  prisma.userSupportCategory.deleteMany.mockResolvedValue({ count: 0 });
  prisma.userSupportCategory.createMany.mockResolvedValue({ count: 1 });
  prisma.$transaction.mockImplementation(async (fn) => fn(prisma));
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('GET /api/admin/volunteers/:id/preferences', () => {
  it('returns preferences for the target volunteer', async () => {
    prisma.volunteerProfile.findUnique.mockResolvedValue({
      userId: 9,
      ...savedProfile,
    });

    const res = await request(app).get('/api/admin/volunteers/9/preferences');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      data: {
        serviceArea: 'Downtown',
        availability: savedProfile.availability,
        interests: [{ id: 1, name: 'Groceries' }],
      },
    });
  });

  it('returns 400 for an invalid volunteer id', async () => {
    const res = await request(app).get('/api/admin/volunteers/abc/preferences');

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: 'Invalid volunteer id',
    });
  });

  it('returns 403 when the volunteer profile is missing', async () => {
    prisma.volunteerProfile.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/admin/volunteers/9/preferences');

    expect(res.status).toBe(403);
    expect(res.body).toEqual({
      success: false,
      message: 'Forbidden',
    });
  });
});

describe('PUT /api/admin/volunteers/:id/preferences', () => {
  it('updates preferences for the target volunteer', async () => {
    let lookupCount = 0;
    prisma.volunteerProfile.findUnique.mockImplementation(() => {
      lookupCount += 1;
      if (lookupCount === 1) {
        return Promise.resolve({ userId: 9 });
      }
      return Promise.resolve({ userId: 9, ...savedProfile });
    });

    const res = await request(app)
      .put('/api/admin/volunteers/9/preferences')
      .set(CSRF_HEADER)
      .send(validBody);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.serviceArea).toBe('Downtown');
    expect(prisma.volunteerProfile.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 9 } })
    );
  });
});
