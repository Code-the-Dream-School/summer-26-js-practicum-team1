const request = require('supertest');

jest.mock('../src/config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  volunteerProfile: {
    create: jest.fn(),
  },
  $transaction: jest.fn(),
}));

const prisma = require('../src/config/prisma');
const app = require('../src/app');
const { loginLimiter, registerLimiter } = require('../src/routes/auth.routes');

const validFields = {
  name: 'Derya Kendircikahraman',
  email: 'deryakendircikahraman@example.com',
  password: 'SecurePass1',
  dob: '1990-05-15',
  gender: 'FEMALE',
};

const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

const resetLimiters = () => {
  ['::ffff:127.0.0.1', '127.0.0.1', '::1'].forEach((ip) => {
    loginLimiter.resetKey(ip);
    registerLimiter.resetKey(ip);
  });
};

beforeEach(() => {
  prisma.user.findUnique.mockResolvedValue(null);
  prisma.user.create.mockResolvedValue({
    id: 1,
    name: validFields.name,
    role: 'REQUESTER',
  });
  prisma.volunteerProfile.create.mockResolvedValue({ userId: 1 });
  prisma.$transaction.mockImplementation(async (fn) => fn(prisma));
  jest.spyOn(console, 'error').mockImplementation(() => {});
  resetLimiters();
});

afterEach(() => jest.restoreAllMocks());

describe('POST /api/auth/register', () => {
  it('registers a requester and returns the user resource', async () => {
    const res = await request(app).post('/api/auth/register').send(validFields);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 1,
      name: validFields.name,
      role: 'requester',
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          email: validFields.email,
          role: 'REQUESTER',
          profileImage: null,
        }),
      })
    );
  });

  it('rejects invalid input with field details', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validFields, password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field: 'password' })])
    );
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('rejects a duplicate email with 409', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 99 });

    const res = await request(app).post('/api/auth/register').send(validFields);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({
      success: false,
      message: 'This email is already registered',
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('registers a volunteer applicant with pending verification', async () => {
    prisma.user.create.mockResolvedValue({
      id: 1,
      name: validFields.name,
      role: 'VOLUNTEER',
    });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validFields, accountType: 'volunteer' });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 1,
      name: validFields.name,
      role: 'volunteer',
      verificationStatus: 'pending',
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: 'VOLUNTEER',
        }),
      })
    );
    expect(prisma.volunteerProfile.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 1,
          verificationStatus: 'PENDING',
        }),
      })
    );
  });

  it('rejects an invalid accountType', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...validFields, accountType: 'admin' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'accountType' }),
      ])
    );
    expect(prisma.user.create).not.toHaveBeenCalled();
    expect(prisma.volunteerProfile.create).not.toHaveBeenCalled();
  });

  it('saves an optional profile image', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .field('name', validFields.name)
      .field('email', validFields.email)
      .field('password', validFields.password)
      .field('dob', validFields.dob)
      .field('gender', validFields.gender)
      .attach('profileImage', tinyPng, {
        filename: 'avatar.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      id: 1,
      name: validFields.name,
      role: 'requester',
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          profileImage: expect.any(Buffer),
        }),
      })
    );
    const saved = prisma.user.create.mock.calls[0][0].data.profileImage;
    expect(Buffer.isBuffer(saved)).toBe(true);
    expect(saved.length).toBeGreaterThan(0);
  });

  it('rejects a non-image file', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .field('name', validFields.name)
      .field('email', validFields.email)
      .field('password', validFields.password)
      .field('dob', validFields.dob)
      .field('gender', validFields.gender)
      .attach('profileImage', Buffer.from('%PDF-1.4'), {
        filename: 'file.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'Validation failed',
      details: [
        {
          field: 'profileImage',
          message: 'Profile picture must be a JPEG or PNG image',
        },
      ],
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
