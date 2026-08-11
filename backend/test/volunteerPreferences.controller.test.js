jest.mock('../src/middleware/jwt.middleware', () => (req, res, next) => {
  req.user = { id: 5, name: 'Volunteer', role: 'REQUESTER' };
  req.auth = { csrfToken: 'test-csrf-token' };
  next();
});

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
  serviceArea: 'Boston, MA',
  availability: {
    frequency: 'WEEKLY',
    slots: [{ dayOfWeek: 'MON', startTime: '09:00', endTime: '12:00' }],
  },
  supportCategories: [
    { supportCategory: { id: 1, name: 'Groceries' } },
    { supportCategory: { id: 2, name: 'Errands' } },
  ],
};

const validBody = {
  serviceArea: 'Boston, MA',
  availability: savedProfile.availability,
  interestIds: [1, 2],
};

beforeEach(() => {
  prisma.supportCategory.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
  prisma.volunteerProfile.update.mockResolvedValue({ userId: 5 });
  prisma.userSupportCategory.deleteMany.mockResolvedValue({ count: 0 });
  prisma.userSupportCategory.createMany.mockResolvedValue({ count: 2 });
  prisma.$transaction.mockImplementation(async (fn) => fn(prisma));
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('GET /api/volunteers/me/preferences', () => {
  it('returns the volunteer preferences resource', async () => {
    prisma.volunteerProfile.findUnique.mockResolvedValue({
      userId: 5,
      ...savedProfile,
    });

    const res = await request(app).get('/api/volunteers/me/preferences');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      serviceArea: 'Boston, MA',
      availability: savedProfile.availability,
      interests: [
        { id: 1, name: 'Groceries' },
        { id: 2, name: 'Errands' },
      ],
    });
  });
});

describe('PUT /api/volunteers/me/preferences', () => {
  it('updates preferences and returns the saved resource', async () => {
    let lookupCount = 0;
    prisma.volunteerProfile.findUnique.mockImplementation(() => {
      lookupCount += 1;
      if (lookupCount === 1) {
        return Promise.resolve({ userId: 5 });
      }
      return Promise.resolve({ userId: 5, ...savedProfile });
    });

    const res = await request(app)
      .put('/api/volunteers/me/preferences')
      .set(CSRF_HEADER)
      .send(validBody);

    expect(res.status).toBe(200);
    expect(res.body.interests).toHaveLength(2);
    expect(prisma.userSupportCategory.deleteMany).toHaveBeenCalledWith({
      where: { volunteerId: 5 },
    });
    expect(prisma.userSupportCategory.createMany).toHaveBeenCalled();
  });

  it('returns 400 for invalid interest category ids', async () => {
    prisma.volunteerProfile.findUnique.mockResolvedValue({ userId: 5 });
    prisma.supportCategory.findMany.mockResolvedValue([{ id: 1 }]);

    const res = await request(app)
      .put('/api/volunteers/me/preferences')
      .set(CSRF_HEADER)
      .send(validBody);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('One or more interest categories are invalid');
  });

  it('returns 400 for invalid availability input', async () => {
    const res = await request(app)
      .put('/api/volunteers/me/preferences')
      .set(CSRF_HEADER)
      .send({
        ...validBody,
        availability: {
          frequency: 'WEEKLY',
          slots: [{ dayOfWeek: 'MON', startTime: '12:00', endTime: '09:00' }],
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });
});
