const ApiError = require('../src/utils/ApiError');

jest.mock('../src/services/requesterProfile.service');
jest.mock('../src/services/admin.service');

jest.mock('../src/middleware/jwt.middleware', () => {
  return (req, res, next) => {
    req.user = {
      id: 1,
      role: 'ADMIN',
      name: 'Admin',
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

jest.mock('../src/middleware/adminAuth', () => ({
  adminAuth: (req, res, next) => next(),
}));

const request = require('supertest');
const app = require('../src/app');

const adminService = require('../src/services/admin.service');
const requesterProfileService = require('../src/services/requesterProfile.service');

const {
  getAdminUserProfileImage,
} = require('../src/controllers/admin.controllers');

app.get(
  '/api/admin/users/:id/profile/image',
  (req, res, next) => {
    req.user = {
      id: 99,
      role: 'ADMIN',
    };

    next();
  },
  getAdminUserProfileImage
);

app.use((err, req, res) => {
  const status = err.status || 500;

  res.status(status).json({
    success: false,
    message: err.message,
  });
});

describe('GET /api/admin/dashboard', () => {
  it('should return dashboard statistics', async () => {
    adminService.getDashboardStats.mockResolvedValue({
      totalUsers: 10,
      totalRequesters: 4,
      totalVolunteers: 5,
      pendingVolunteers: 1,
    });

    const res = await request(app).get('/api/admin/dashboard');

    expect(res.status).toBe(200);

    expect(res.body.success).toBe(true);

    expect(res.body.data).toEqual({
      totalUsers: 10,
      totalRequesters: 4,
      totalVolunteers: 5,
      pendingVolunteers: 1,
    });
  });
});

describe('GET /api/admin/volunteers/pending', () => {
  it('should return pending volunteers list', async () => {
    adminService.getPendingVolunteers.mockResolvedValue({
      volunteers: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });

    const res = await request(app).get('/api/admin/volunteers/pending');

    expect(res.status).toBe(200);

    expect(res.body.success).toBe(true);
  });

  it('should return empty volunteer list', async () => {
    adminService.getPendingVolunteers.mockResolvedValue({
      volunteers: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });

    const res = await request(app).get('/api/admin/volunteers/pending');

    expect(res.body.data.volunteers).toHaveLength(0);
  });
});

describe('GET /api/admin/users', () => {
  it('should return users', async () => {
    adminService.getUsers.mockResolvedValue([
      {
        id: 1,
        name: 'John',
        email: 'john@test.com',
        role: 'REQUESTER',
      },
    ]);

    const res = await request(app).get('/api/admin/users');

    expect(res.status).toBe(200);

    expect(res.body.success).toBe(true);

    expect(res.body.data).toHaveLength(1);
  });
});

describe('PUT /api/admin/volunteers/:id/approve', () => {
  it('should approve volunteer', async () => {
    adminService.reviewVolunteer.mockResolvedValue({
      userId: 1,
      verificationStatus: 'APPROVED',
    });

    const res = await request(app).put('/api/admin/volunteers/1/approve');

    expect(res.status).toBe(200);
  });

  it('should fail with invalid id', async () => {
    const res = await request(app).put('/api/admin/volunteers/abc/approve');

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/admin/volunteers/:id/reject', () => {
  it('should reject volunteer', async () => {
    adminService.reviewVolunteer.mockResolvedValue({
      userId: 1,
      verificationStatus: 'REJECTED',
    });

    const res = await request(app).put('/api/admin/volunteers/1/reject');

    expect(res.status).toBe(200);
  });

  it('should fail with invalid id', async () => {
    const res = await request(app).put('/api/admin/volunteers/abc/reject');

    expect(res.status).toBe(400);
  });
});

describe('GET /api/admin/requesters/:id/profile', () => {
  const mockProfile = {
    id: 12,
    name: 'Test Requester',
    email: 'requester@test.com',
    phone: '555-123-4567',
    dob: '1990-01-01T00:00:00.000Z',
    gender: 'FEMALE',
    role: 'REQUESTER',
    requesterProfile: {
      address: '123 Main St',
      city: 'San Jose',
      bio: 'Test bio',
      emergencyContact: '555-987-6543',
    },
  };

  it('should return requester profile with status 200', async () => {
    adminService.getRequesterProfileById.mockResolvedValue(mockProfile);

    const response = await request(app).get('/api/admin/requesters/12/profile');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockProfile);
  });

  it('should pass the requester ID as a number to the service', async () => {
    adminService.getRequesterProfileById.mockResolvedValue(mockProfile);

    await request(app).get('/api/admin/requesters/12/profile');

    expect(adminService.getRequesterProfileById).toHaveBeenCalledWith(12);
  });

  it('should return 404 when requester profile is not found', async () => {
    adminService.getRequesterProfileById.mockRejectedValue(
      new ApiError(404, 'Requester profile not found')
    );

    const response = await request(app).get(
      '/api/admin/requesters/999/profile'
    );

    expect(response.status).toBe(404);

    expect(response.body.message).toBe('Requester profile not found');
  });

  it('should return 400 for an invalid requester ID', async () => {
    const response = await request(app).get(
      '/api/admin/requesters/abc/profile'
    );

    expect(response.status).toBe(400);

    expect(response.body.message).toBe('Invalid requester ID');

    expect(adminService.getRequesterProfileById).not.toHaveBeenCalled();
  });
});

describe('GET /api/admin/users/:id/profile/image', () => {
  it('should return the profile image for an admin', async () => {
    const imageBuffer = Buffer.from('fake-png-image-data');

    requesterProfileService.getProfileImage.mockResolvedValue({
      profileImage: imageBuffer,
      profileImageType: 'image/png',
    });

    const response = await request(app).get(
      '/api/admin/users/12/profile/image'
    );

    expect(response.status).toBe(200);

    expect(response.headers['content-type']).toMatch(/image\/png/);

    expect(requesterProfileService.getProfileImage).toHaveBeenCalledWith(12);
  });

  it('should return 400 for an invalid user ID', async () => {
    const response = await request(app).get(
      '/api/admin/users/abc/profile/image'
    );

    expect(response.status).toBe(400);

    expect(response.body.message).toBe('Invalid user ID');

    expect(requesterProfileService.getProfileImage).not.toHaveBeenCalled();
  });

  it('should return 400 for a non-positive user ID', async () => {
    const response = await request(app).get('/api/admin/users/0/profile/image');

    expect(response.status).toBe(400);

    expect(response.body.message).toBe('Invalid user ID');

    expect(requesterProfileService.getProfileImage).not.toHaveBeenCalled();
  });

  it('should return 404 when the profile image is not found', async () => {
    requesterProfileService.getProfileImage.mockRejectedValue(
      new ApiError(404, 'Profile picture not found')
    );

    const response = await request(app).get(
      '/api/admin/users/12/profile/image'
    );

    expect(response.status).toBe(404);

    expect(response.body.message).toBe('Profile picture not found');
  });
});

afterEach(() => {
  jest.clearAllMocks();
});
