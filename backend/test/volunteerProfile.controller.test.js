const request = require('supertest');

jest.mock('../src/middleware/jwt.middleware', () => {
  const state = {
    role: 'VOLUNTEER',
    verificationStatus: 'APPROVED',
  };

  const middleware = (req, res, next) => {
    req.user = {
      id: 1,
      role: state.role,
      name: 'Test Volunteer',
      volunteerProfile:
        state.role === 'VOLUNTEER'
          ? { verificationStatus: state.verificationStatus }
          : null,
    };

    req.auth = {
      csrfToken: 'test-csrf-token',
    };

    next();
  };

  middleware.__setRole = (role) => {
    state.role = role;
  };

  middleware.__setVerificationStatus = (verificationStatus) => {
    state.verificationStatus = verificationStatus;
  };

  return middleware;
});

jest.mock('../src/middleware/csrf.middleware', () => {
  return (req, res, next) => next();
});

jest.mock('../src/services/volunteerProfile.service', () => ({
  getVolunteerProfile: jest.fn(),
  updateVolunteerProfile: jest.fn(),
  listSupportCategories: jest.fn(),
  volunteerSelect: {},
  toVolunteerSlice: jest.fn(),
}));

const volunteerProfileService = require('../src/services/volunteerProfile.service');
const jwtMiddleware = require('../src/middleware/jwt.middleware');
const app = require('../src/app');

beforeEach(() => {
  jwtMiddleware.__setRole('VOLUNTEER');
  jwtMiddleware.__setVerificationStatus('APPROVED');
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

const sampleVolunteer = {
  serviceArea: 'San Jose',
  availability: {
    frequency: 'WEEKLY',
    slots: [{ dayOfWeek: 'MON', startTime: '09:00', endTime: '12:00' }],
  },
  interests: [{ id: 1, name: 'Groceries' }],
};

describe('PUT /api/profile/volunteer', () => {
  it('updates the volunteer profile slice', async () => {
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

    volunteerProfileService.updateVolunteerProfile.mockResolvedValue(
      sampleVolunteer
    );

    const res = await request(app).put('/api/profile/volunteer').send(body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: sampleVolunteer });
    expect(volunteerProfileService.updateVolunteerProfile).toHaveBeenCalledWith(
      1,
      body
    );
  });

  it('rejects serviceArea without coordinates', async () => {
    const res = await request(app)
      .put('/api/profile/volunteer')
      .send({
        serviceArea: 'San Jose',
        interestIds: [1],
      });

    expect(res.status).toBe(400);
    expect(
      volunteerProfileService.updateVolunteerProfile
    ).not.toHaveBeenCalled();
  });

  it('rejects invalid volunteer payload', async () => {
    const res = await request(app)
      .put('/api/profile/volunteer')
      .send({
        interestIds: ['not-a-number'],
      });

    expect(res.status).toBe(400);
    expect(
      volunteerProfileService.updateVolunteerProfile
    ).not.toHaveBeenCalled();
  });

  it('rejects slots where endTime is not after startTime', async () => {
    const res = await request(app)
      .put('/api/profile/volunteer')
      .send({
        interestIds: [1],
        availability: {
          frequency: 'WEEKLY',
          slots: [{ dayOfWeek: 'MON', startTime: '12:00', endTime: '09:00' }],
        },
      });

    expect(res.status).toBe(400);
    expect(
      volunteerProfileService.updateVolunteerProfile
    ).not.toHaveBeenCalled();
  });

  it('rejects overlapping slots on the same day', async () => {
    const res = await request(app)
      .put('/api/profile/volunteer')
      .send({
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
    expect(
      volunteerProfileService.updateVolunteerProfile
    ).not.toHaveBeenCalled();
  });

  it('rejects a requester', async () => {
    jwtMiddleware.__setRole('REQUESTER');

    const res = await request(app)
      .put('/api/profile/volunteer')
      .send({
        interestIds: [1],
      });

    expect(res.status).toBe(403);
    expect(
      volunteerProfileService.updateVolunteerProfile
    ).not.toHaveBeenCalled();
  });

  it('rejects a pending volunteer', async () => {
    jwtMiddleware.__setVerificationStatus('PENDING');

    const res = await request(app)
      .put('/api/profile/volunteer')
      .send({
        interestIds: [1],
      });

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: 'Volunteer account not approved' });
    expect(
      volunteerProfileService.updateVolunteerProfile
    ).not.toHaveBeenCalled();
  });
});

describe('GET /api/support-categories', () => {
  it('returns support categories from the catalog path', async () => {
    const categories = [
      { id: 1, name: 'Groceries' },
      { id: 2, name: 'Errands' },
    ];

    volunteerProfileService.listSupportCategories.mockResolvedValue(categories);

    const res = await request(app).get('/api/support-categories');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: categories });
    expect(volunteerProfileService.listSupportCategories).toHaveBeenCalled();
  });
});
