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

jest.mock('../src/services/admin.service');

const request = require('supertest');
const app = require('../src/app');
const adminService = require('../src/services/admin.service');

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

describe('GET/api/admin/volunteers/pending', () => {
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

afterEach(async () => {
  jest.clearAllMocks();
});
