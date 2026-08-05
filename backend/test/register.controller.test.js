const request = require('supertest');

jest.mock('../src/config/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
}));

const prisma = require('../src/config/prisma');
const app = require('../src/app');
const { loginLimiter } = require('../src/routes/auth.routes');

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

beforeEach(() => {
  prisma.user.findUnique.mockResolvedValue(null);
  prisma.user.create.mockResolvedValue({
    id: 1,
    name: validFields.name,
    role: 'REQUESTER',
  });
  jest.spyOn(console, 'error').mockImplementation(() => {});
  ['::ffff:127.0.0.1', '127.0.0.1', '::1'].forEach((ip) =>
    loginLimiter.resetKey(ip)
  );
});

afterEach(() => jest.restoreAllMocks());

describe('POST /api/auth/register — profile image', () => {
  it('registers without a profile image', async () => {
    const res = await request(app).post('/api/auth/register').send(validFields);

    expect(res.status).toBe(201);
    expect(res.body).toEqual({
      success: true,
      data: {
        id: 1,
        name: validFields.name,
        role: 'requester',
      },
    });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ profileImage: null }),
      })
    );
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
    expect(res.body.success).toBe(true);
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
      success: false,
      message: 'Validation failed',
      details: [
        {
          field: 'profileImage',
          message: 'Profile picture must be a JPEG, PNG, WebP, or GIF image',
        },
      ],
    });
    expect(prisma.user.create).not.toHaveBeenCalled();
  });
});
