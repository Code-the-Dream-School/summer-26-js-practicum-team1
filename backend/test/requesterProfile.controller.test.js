const request = require('supertest');

jest.mock('../src/middleware/jwt.middleware', () => {
  return (req, res, next) => {
    req.user = {
      id: 1,
      role: 'REQUESTER',
      name: 'Test User',
    };

    req.auth = {
      csrfToken: 'test-csrf-token',
    };

    next();
  };
});

jest.mock('../src/middleware/csrf.middleware', () => {
  return (req, res, next) => next();
});

jest.mock('../src/services/requesterProfile.service', () => ({
  getProfile: jest.fn(),
  updateProfile: jest.fn(),
  updateProfileImage: jest.fn(),
  getProfileImage: jest.fn(),
}));

const profileService = require('../src/services/requesterProfile.service');
const app = require('../src/app');

const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64'
);

beforeEach(() => {
  jest.clearAllMocks();

  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('GET /api/auth/profile', () => {
  it('gets the requester profile', async () => {
    const profile = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      dob: '1990-05-15',
      gender: 'FEMALE',
      role: 'REQUESTER',
      requesterProfile: {
        address: '123 Main St',
        city: 'San Jose',
        bio: 'Test bio',
        emergencyContact: '9876543210',
      },
    };

    profileService.getProfile.mockResolvedValue(profile);

    const res = await request(app).get('/api/auth/profile');

    expect(res.status).toBe(200);

    expect(res.body).toEqual({
      data: profile,
    });

    expect(profileService.getProfile).toHaveBeenCalledWith(1);
  });

  it('returns 404 when profile is not found', async () => {
    profileService.getProfile.mockRejectedValue(
      Object.assign(new Error('User profile not found'), {
        status: 404,
        success: false,
      })
    );

    const res = await request(app).get('/api/auth/profile');

    expect(res.status).toBe(404);

    expect(profileService.getProfile).toHaveBeenCalledWith(1);
  });
});

describe('PUT /api/auth/profile', () => {
  it('updates the requester profile', async () => {
    const updateData = {
      phone: '1234567890',
      address: '123 Main St',
      city: 'San Jose',
      bio: 'Updated bio',
      emergencyContact: '9876543210',
    };

    const updatedProfile = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      phone: '1234567890',
      dob: '1990-05-15',
      gender: 'FEMALE',
      role: 'REQUESTER',
      requesterProfile: {
        address: '123 Main St',
        city: 'San Jose',
        bio: 'Updated bio',
        emergencyContact: '9876543210',
      },
    };

    profileService.updateProfile.mockResolvedValue(updatedProfile);

    const res = await request(app).put('/api/auth/profile').send(updateData);

    expect(res.status).toBe(200);

    expect(res.body).toEqual({
      data: updatedProfile,
    });

    expect(profileService.updateProfile).toHaveBeenCalledWith(1, updateData);
  });

  it('rejects invalid profile data', async () => {
    const res = await request(app).put('/api/auth/profile').send({
      phone: 1234,
    });

    expect(res.status).toBe(400);

    expect(res.body.error).toBe('Validation failed');

    expect(profileService.updateProfile).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/auth/profile/image', () => {
  it('updates the requester profile image', async () => {
    profileService.updateProfileImage.mockResolvedValue({
      id: 1,
    });

    const res = await request(app)
      .patch('/api/auth/profile/image')
      .attach('profileImage', tinyPng, {
        filename: 'avatar.png',
        contentType: 'image/png',
      });

    expect(res.status).toBe(200);

    expect(res.body).toEqual({
      data: {
        id: 1,
      },
    });

    expect(profileService.updateProfileImage).toHaveBeenCalledWith(
      1,
      expect.any(Buffer),
      'image/png'
    );

    const imageBuffer = profileService.updateProfileImage.mock.calls[0][1];

    expect(Buffer.isBuffer(imageBuffer)).toBe(true);
    expect(imageBuffer.length).toBeGreaterThan(0);
  });

  it('rejects a non-image file', async () => {
    const res = await request(app)
      .patch('/api/auth/profile/image')
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

    expect(profileService.updateProfileImage).not.toHaveBeenCalled();
  });

  it('rejects an image larger than 2MB', async () => {
    const largeImage = Buffer.alloc(2 * 1024 * 1024 + 1);

    const res = await request(app)
      .patch('/api/auth/profile/image')
      .attach('profileImage', largeImage, {
        filename: 'large.jpg',
        contentType: 'image/jpeg',
      });

    expect(res.status).toBe(400);

    expect(res.body).toEqual({
      error: 'Validation failed',
      details: [
        {
          field: 'profileImage',
          message: 'Profile picture must be at most 2MB',
        },
      ],
    });

    expect(profileService.updateProfileImage).not.toHaveBeenCalled();
  });
});

describe('GET /api/auth/profile/image', () => {
  it('gets the requester profile image', async () => {
    const imageBuffer = Buffer.from('test image data');

    profileService.getProfileImage.mockResolvedValue({
      profileImage: imageBuffer,
      profileImageType: 'image/jpeg',
    });

    const res = await request(app).get('/api/auth/profile/image').buffer(true);

    expect(res.status).toBe(200);

    expect(res.headers['content-type']).toMatch(/image\/jpeg/);

    expect(Buffer.from(res.body)).toEqual(imageBuffer);

    expect(profileService.getProfileImage).toHaveBeenCalledWith(1);
  });

  it('returns a PNG image with the correct content type', async () => {
    const imageBuffer = tinyPng;

    profileService.getProfileImage.mockResolvedValue({
      profileImage: imageBuffer,
      profileImageType: 'image/png',
    });

    const res = await request(app).get('/api/auth/profile/image').buffer(true);

    expect(res.status).toBe(200);

    expect(res.headers['content-type']).toMatch(/image\/png/);

    expect(Buffer.from(res.body)).toEqual(imageBuffer);

    expect(profileService.getProfileImage).toHaveBeenCalledWith(1);
  });

  it('returns 404 when profile image is not found', async () => {
    profileService.getProfileImage.mockRejectedValue(
      Object.assign(new Error('Profile picture not found'), {
        status: 404,
        success: false,
      })
    );

    const res = await request(app).get('/api/auth/profile/image');

    expect(res.status).toBe(404);

    expect(profileService.getProfileImage).toHaveBeenCalledWith(1);
  });
});
