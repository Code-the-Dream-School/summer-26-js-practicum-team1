const request = require('supertest');

jest.mock('../src/middleware/jwt.middleware', () => {
  return (req, res, next) => {
    req.user = {
      id: 1,
      role: 'VOLUNTEER',
      name: 'Test Volunteer',
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

jest.mock('../src/services/volunteerPreferences.service', () => ({
  getPreferences: jest.fn(),
  updatePreferences: jest.fn(),
  listSupportCategories: jest.fn(),
}));

const preferencesService = require('../src/services/volunteerPreferences.service');
const app = require('../src/app');

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

const samplePreferences = {
  serviceArea: 'San Jose',
  availability: {
    frequency: 'WEEKLY',
    slots: [{ dayOfWeek: 'MON', startTime: '09:00', endTime: '12:00' }],
  },
  interests: [{ id: 1, name: 'Groceries' }],
};

describe('GET /api/profile/preferences', () => {
  it('returns volunteer preferences', async () => {
    preferencesService.getPreferences.mockResolvedValue(samplePreferences);

    const res = await request(app).get('/api/profile/preferences');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: samplePreferences });
    expect(preferencesService.getPreferences).toHaveBeenCalledWith(1);
  });

  it('returns 404 when volunteer profile is missing', async () => {
    preferencesService.getPreferences.mockRejectedValue(
      Object.assign(new Error('Volunteer profile not found'), {
        status: 404,
        success: false,
      })
    );

    const res = await request(app).get('/api/profile/preferences');

    expect(res.status).toBe(404);
    expect(preferencesService.getPreferences).toHaveBeenCalledWith(1);
  });
});

describe('PUT /api/profile/preferences', () => {
  it('updates volunteer preferences', async () => {
    const body = {
      serviceArea: 'San Jose, CA',
      serviceLatitude: 37.3382,
      serviceLongitude: -121.8863,
      availability: {
        frequency: 'WEEKLY',
        slots: [{ dayOfWeek: 'MON', startTime: '09:00', endTime: '12:00' }],
      },
      interestIds: [1],
    };

    preferencesService.updatePreferences.mockResolvedValue(samplePreferences);

    const res = await request(app).put('/api/profile/preferences').send(body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: samplePreferences });
    expect(preferencesService.updatePreferences).toHaveBeenCalledWith(1, body);
  });

  it('rejects serviceArea without coordinates', async () => {
    const res = await request(app).put('/api/profile/preferences').send({
      serviceArea: 'San Jose',
      interestIds: [1],
    });

    expect(res.status).toBe(400);
    expect(preferencesService.updatePreferences).not.toHaveBeenCalled();
  });

  it('rejects invalid preferences payload', async () => {
    const res = await request(app).put('/api/profile/preferences').send({
      interestIds: ['not-a-number'],
    });

    expect(res.status).toBe(400);
    expect(preferencesService.updatePreferences).not.toHaveBeenCalled();
  });

  it('rejects slots where endTime is not after startTime', async () => {
    const res = await request(app).put('/api/profile/preferences').send({
      interestIds: [1],
      availability: {
        frequency: 'WEEKLY',
        slots: [{ dayOfWeek: 'MON', startTime: '12:00', endTime: '09:00' }],
      },
    });

    expect(res.status).toBe(400);
    expect(preferencesService.updatePreferences).not.toHaveBeenCalled();
  });

  it('rejects overlapping slots on the same day', async () => {
    const res = await request(app).put('/api/profile/preferences').send({
      interestIds: [1],
      availability: {
        frequency: 'WEEKLY',
        slots: [
          { dayOfWeek: 'MON', startTime: '09:00', endTime: '12:00' },
          { dayOfWeek: 'MON', startTime: '11:00', endTime: '14:00' },
        ],
      },
    });

    expect(res.status).toBe(400);
    expect(preferencesService.updatePreferences).not.toHaveBeenCalled();
  });
});

describe('GET /api/profile/support-categories', () => {
  it('returns support categories', async () => {
    const categories = [
      { id: 1, name: 'Groceries' },
      { id: 2, name: 'Errands' },
    ];

    preferencesService.listSupportCategories.mockResolvedValue(categories);

    const res = await request(app).get('/api/profile/support-categories');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: categories });
    expect(preferencesService.listSupportCategories).toHaveBeenCalled();
  });
});
