const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/prisma', () => ({
  user: { findUnique: jest.fn() },
  helpRequest: { findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
}));

const prisma = require('../src/config/prisma');
const app = require('../src/app');
const helpRequestService = require('../src/services/helpRequest.service');

const signJwt = (payload) =>
  jwt.sign({ csrfToken: 'x', ...payload }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

const cookieFor = (id) => `jwt=${signJwt({ id })}`;

const browse = (query = '', cookie = '') =>
  request(app).get(`/api/requests${query}`).set('Cookie', cookie);

const mockUser = (overrides = {}) => ({
  id: 1,
  name: 'U',
  role: 'ADMIN',
  volunteerProfile: null,
  ...overrides,
});

const asVolunteer = (status) =>
  mockUser({
    id: 5,
    role: 'VOLUNTEER',
    volunteerProfile: status ? { verificationStatus: status } : null,
  });

const paged = (query = {}) => ({ page: 1, pageSize: 10, ...query });

beforeEach(() => {
  jest.clearAllMocks();
  prisma.helpRequest.count.mockResolvedValue(0);
});

describe('GET /api/requests — authorization', () => {
  it('rejects an unauthenticated request', async () => {
    const res = await browse();
    expect(res.status).toBe(401);
  });

  it('rejects a REQUESTER', async () => {
    prisma.user.findUnique.mockResolvedValue(
      mockUser({ id: 2, role: 'REQUESTER' })
    );

    const res = await browse('', cookieFor(2));

    expect(res.status).toBe(403);
  });

  it('rejects a VOLUNTEER with no VolunteerProfile row', async () => {
    prisma.user.findUnique.mockResolvedValue(asVolunteer());

    const res = await browse('', cookieFor(5));

    expect(res.status).toBe(403);
  });

  it('rejects a VOLUNTEER pending verification', async () => {
    prisma.user.findUnique.mockResolvedValue(asVolunteer('PENDING'));

    const res = await browse('', cookieFor(5));

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/not approved/i);
  });

  it('rejects a VOLUNTEER whose verification was rejected', async () => {
    prisma.user.findUnique.mockResolvedValue(asVolunteer('REJECTED'));

    const res = await browse('', cookieFor(5));

    expect(res.status).toBe(403);
  });

  it('allows an APPROVED volunteer', async () => {
    prisma.user.findUnique.mockResolvedValue(asVolunteer('APPROVED'));
    prisma.helpRequest.findMany.mockResolvedValue([]);

    const res = await browse('', cookieFor(5));

    expect(res.status).toBe(200);
  });

  it('allows an ADMIN with a null volunteerProfile', async () => {
    prisma.user.findUnique.mockResolvedValue(
      mockUser({ id: 6, role: 'ADMIN' })
    );
    prisma.helpRequest.findMany.mockResolvedValue([]);

    const res = await browse('', cookieFor(6));

    expect(res.status).toBe(200);
  });

  it('rejects a token for a user that no longer exists', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await browse('', cookieFor(999));

    expect(res.status).toBe(401);
  });

  it('runs the approval check before query validation', async () => {
    prisma.user.findUnique.mockResolvedValue(asVolunteer('PENDING'));

    const res = await browse('?urgency=NOT_REAL', cookieFor(5));

    expect(res.status).toBe(403);
  });
});

describe('GET /api/requests — query validation', () => {
  const adminCookie = cookieFor(1);

  beforeEach(() => {
    prisma.user.findUnique.mockResolvedValue(mockUser());
    prisma.helpRequest.findMany.mockResolvedValue([]);
  });

  it('rejects an invalid category value', async () => {
    const res = await browse('?category=NOT_REAL', adminCookie);
    expect(res.status).toBe(400);
    expect(res.body.details[0].field).toBe('category');
  });

  it('rejects an invalid urgency value', async () => {
    const res = await browse('?urgency=SUPER_HIGH', adminCookie);
    expect(res.status).toBe(400);
  });

  it('rejects an invalid status value', async () => {
    const res = await browse('?status=DELETED', adminCookie);
    expect(res.status).toBe(400);
  });

  it('accepts a valid multi-value list', async () => {
    const res = await browse('?urgency=medium,high', adminCookie);
    expect(res.status).toBe(200);
  });

  it('rejects lat provided without lng/radiusMi', async () => {
    const res = await browse('?lat=40.7', adminCookie);
    expect(res.status).toBe(400);
  });

  it('rejects lng+radiusMi without lat', async () => {
    const res = await browse('?lng=-74&radiusMi=5', adminCookie);
    expect(res.status).toBe(400);
  });

  it('accepts lat+lng+radiusMi together', async () => {
    const res = await browse('?lat=40.7&lng=-74&radiusMi=5', adminCookie);
    expect(res.status).toBe(200);
  });

  it('rejects an out-of-range latitude', async () => {
    const res = await browse('?lat=200&lng=-74&radiusMi=5', adminCookie);
    expect(res.status).toBe(400);
  });

  it('rejects a non-positive radiusMi', async () => {
    const res = await browse('?lat=40.7&lng=-74&radiusMi=0', adminCookie);
    expect(res.status).toBe(400);
  });

  it('rejects an unsupported sort field', async () => {
    const res = await browse('?sort=title:asc', adminCookie);
    expect(res.status).toBe(400);
  });

  it('rejects an invalid sort direction', async () => {
    const res = await browse('?sort=createdAt:sideways', adminCookie);
    expect(res.status).toBe(400);
  });

  it('accepts a bare sort field with no explicit direction', async () => {
    const res = await browse('?sort=scheduledAt', adminCookie);
    expect(res.status).toBe(200);
  });

  it('ignores unknown query params instead of rejecting the request', async () => {
    const res = await browse('?madeUpParam=xyz', adminCookie);
    expect(res.status).toBe(200);
  });

  it('rejects a page below 1', async () => {
    const res = await browse('?page=0', adminCookie);
    expect(res.status).toBe(400);
  });

  it('rejects a pageSize above the max', async () => {
    const res = await browse('?pageSize=26', adminCookie);
    expect(res.status).toBe(400);
  });

  it('defaults page and pageSize when omitted', async () => {
    prisma.helpRequest.count.mockResolvedValue(0);

    const res = await browse('', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual(
      expect.objectContaining({ page: 1, pageSize: 5 })
    );
  });
});

describe('GET /api/requests — end-to-end wiring (route -> controller -> service -> prisma)', () => {
  const adminCookie = cookieFor(1);

  beforeEach(() => {
    prisma.user.findUnique.mockResolvedValue(mockUser());
  });

  it('translates page/pageSize into skip/take and returns matching meta', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    prisma.helpRequest.count.mockResolvedValue(23);

    const res = await browse('?page=3&pageSize=5', adminCookie);

    expect(res.status).toBe(200);
    expect(prisma.helpRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 })
    );
    expect(res.body.meta).toEqual({
      page: 3,
      pageSize: 5,
      totalCount: 23,
      totalPages: 5,
    });
  });

  it('resolves a geo + distance-sorted request end to end, including distanceMi and radius filtering', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([
      { id: 1, latitude: 40.9, longitude: -74, urgency: 'LOW' }, // ~13.8mi away
      { id: 2, latitude: 40.71, longitude: -74, urgency: 'HIGH' }, // ~0.8mi away
      { id: 3, latitude: 45, longitude: -74, urgency: 'MEDIUM' }, // way out of radius
    ]);

    const res = await browse(
      '?lat=40.7&lng=-74&radiusMi=25&sort=distance&page=1&pageSize=5',
      adminCookie
    );

    expect(res.status).toBe(200);
    expect(res.body.data.map((r) => r.id)).toEqual([2, 1]);
    expect(res.body.data[0].distanceMi).toEqual(expect.any(Number));
    expect(res.body.meta.totalCount).toBe(2);
  });

  it('scopes results to the requesting VOLUNTEER when status is not PENDING', async () => {
    prisma.user.findUnique.mockResolvedValue(asVolunteer('APPROVED'));
    prisma.helpRequest.findMany.mockResolvedValue([]);

    const res = await browse('?status=ACCEPTED', cookieFor(5));

    expect(res.status).toBe(200);
    const { where } = prisma.helpRequest.findMany.mock.calls[0][0];
    expect(where.AND).toEqual(
      expect.arrayContaining([{ OR: [{ requesterId: 5 }, { volunteerId: 5 }] }])
    );
  });
});

describe('GET /api/requests — end-to-end wiring (route -> controller -> service -> prisma)', () => {
  const adminCookie = cookieFor(1);

  beforeEach(() => {
    prisma.user.findUnique.mockResolvedValue(mockUser());
  });

  it('translates page/pageSize into skip/take and returns matching meta', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    prisma.helpRequest.count.mockResolvedValue(23);

    const res = await browse('?page=3&pageSize=5', adminCookie);

    expect(res.status).toBe(200);
    expect(prisma.helpRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 })
    );
    expect(res.body.meta).toEqual({
      page: 3,
      pageSize: 5,
      totalCount: 23,
      totalPages: 5,
    });
  });

  it('resolves a geo + distance-sorted request end to end, including distanceMi and radius filtering', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([
      { id: 1, latitude: 40.9, longitude: -74, urgency: 'LOW' }, // ~13.8mi away
      { id: 2, latitude: 40.71, longitude: -74, urgency: 'HIGH' }, // ~0.8mi away
      { id: 3, latitude: 45, longitude: -74, urgency: 'MEDIUM' }, // way out of radius
    ]);

    const res = await browse(
      '?lat=40.7&lng=-74&radiusMi=25&sort=distance&page=1&pageSize=5',
      adminCookie
    );

    expect(res.status).toBe(200);
    expect(res.body.data.map((r) => r.id)).toEqual([2, 1]);
    expect(res.body.data[0].distanceMi).toEqual(expect.any(Number));
    expect(res.body.meta.totalCount).toBe(2);
  });

  it('scopes results to the requesting VOLUNTEER when status is not PENDING', async () => {
    prisma.user.findUnique.mockResolvedValue(asVolunteer('APPROVED'));
    prisma.helpRequest.findMany.mockResolvedValue([]);

    const res = await browse('?status=ACCEPTED', cookieFor(5));

    expect(res.status).toBe(200);
    const { where } = prisma.helpRequest.findMany.mock.calls[0][0];
    expect(where.AND).toEqual(
      expect.arrayContaining([{ OR: [{ requesterId: 5 }, { volunteerId: 5 }] }])
    );
  });
});

describe('helpRequestService.getBrowseHelpRequests — filters', () => {
  const admin = { id: 1, role: 'ADMIN' };
  const volunteer = { id: 9, role: 'VOLUNTEER' };

  beforeEach(() => prisma.helpRequest.findMany.mockResolvedValue([]));

  it('defaults to status=PENDING when none is provided', async () => {
    await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: paged(),
    });

    expect(prisma.helpRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PENDING' }),
      })
    );
  });

  it('scopes a VOLUNTEER requesting a non-pending status to their own rows', async () => {
    await helpRequestService.getBrowseHelpRequests({
      user: volunteer,
      query: paged({ status: 'ACCEPTED' }),
    });

    const { where } = prisma.helpRequest.findMany.mock.calls[0][0];
    expect(where.AND).toEqual(
      expect.arrayContaining([{ OR: [{ requesterId: 9 }, { volunteerId: 9 }] }])
    );
  });

  it('does NOT scope an ADMIN requesting a non-pending status', async () => {
    await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: paged({ status: 'ACCEPTED' }),
    });

    const { where } = prisma.helpRequest.findMany.mock.calls[0][0];
    expect(where.AND).toBeUndefined();
  });

  it('does NOT scope a default request', async () => {
    await helpRequestService.getBrowseHelpRequests({
      user: volunteer,
      query: paged(),
    });

    const { where } = prisma.helpRequest.findMany.mock.calls[0][0];
    expect(where.AND).toBeUndefined();
  });

  it('does NOT scope when status is explicitly PENDING only', async () => {
    await helpRequestService.getBrowseHelpRequests({
      user: volunteer,
      query: paged({ status: 'PENDING' }),
    });

    const { where } = prisma.helpRequest.findMany.mock.calls[0][0];
    expect(where.AND).toBeUndefined();
  });

  it('combines q search AND ownership scoping without one overwriting the other', async () => {
    await helpRequestService.getBrowseHelpRequests({
      user: volunteer,
      query: paged({ status: 'ACCEPTED', q: 'lawn' }),
    });

    const { where } = prisma.helpRequest.findMany.mock.calls[0][0];
    expect(where.AND).toHaveLength(2);
    expect(where.AND).toEqual(
      expect.arrayContaining([
        { OR: [{ requesterId: 9 }, { volunteerId: 9 }] },
        {
          OR: [
            { title: { contains: 'lawn', mode: 'insensitive' } },
            { description: { contains: 'lawn', mode: 'insensitive' } },
          ],
        },
      ])
    );
  });
});

describe('helpRequestService.getBrowseHelpRequests — sorting', () => {
  const admin = { id: 1, role: 'ADMIN' };

  it('passes DB-level orderBy (with id tie-breaker) for createdAt', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([]);

    await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: paged(),
    });

    expect(prisma.helpRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
      })
    );
  });

  it('defaults scheduledAt sort direction to asc when none is given', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([]);

    await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: paged({ sort: 'scheduledAt' }),
    });

    expect(prisma.helpRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ scheduledAt: 'asc' }, { id: 'asc' }],
      })
    );
  });

  it('passes DB-level orderBy for urgency using the default direction (desc)', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([]);

    await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: paged({ sort: 'urgency' }),
    });

    expect(prisma.helpRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ urgency: 'desc' }, { id: 'asc' }],
      })
    );
  });

  it('rejects sort=distance when lat/lng were not provided', async () => {
    await expect(
      helpRequestService.getBrowseHelpRequests({
        user: admin,
        query: paged({ sort: 'distance' }),
      })
    ).rejects.toThrow(/lat, lng, and radiusMi/i);
  });
});

describe('helpRequestService.getBrowseHelpRequests — sorting (in-memory path: geo or distance)', () => {
  const admin = { id: 1, role: 'ADMIN' };

  it('sorts by distance ascending by default (closest first)', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([
      { id: 1, latitude: 40.9, longitude: -74 },
      { id: 2, latitude: 40.71, longitude: -74 },
      { id: 3, latitude: 40.8, longitude: -74 },
    ]);

    const result = await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: paged({
        lat: '40.7',
        lng: '-74',
        radiusMi: '50',
        sort: 'distance',
      }),
    });

    expect(result.data.map((r) => r.id)).toEqual([2, 3, 1]);
  });

  it('sorts by createdAt (not urgency) when combined with a geo radius filter', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([
      {
        id: 1,
        latitude: 40.71,
        longitude: -74,
        urgency: 'LOW',
        createdAt: new Date('2024-01-03'),
      },
      {
        id: 2,
        latitude: 40.72,
        longitude: -74,
        urgency: 'HIGH',
        createdAt: new Date('2024-01-01'),
      },
      {
        id: 3,
        latitude: 40.73,
        longitude: -74,
        urgency: 'MEDIUM',
        createdAt: new Date('2024-01-02'),
      },
    ]);

    const result = await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: paged({
        lat: '40.7',
        lng: '-74',
        radiusMi: '50',
        sort: 'createdAt:asc',
      }),
    });

    expect(result.data.map((r) => r.id)).toEqual([2, 3, 1]);
  });

  it('sorts by scheduledAt when combined with a geo radius filter', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([
      {
        id: 1,
        latitude: 40.71,
        longitude: -74,
        scheduledAt: new Date('2024-03-03'),
      },
      {
        id: 2,
        latitude: 40.72,
        longitude: -74,
        scheduledAt: new Date('2024-03-01'),
      },
    ]);

    const result = await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: paged({
        lat: '40.7',
        lng: '-74',
        radiusMi: '50',
        sort: 'scheduledAt:asc',
      }),
    });

    expect(result.data.map((r) => r.id)).toEqual([2, 1]);
  });

  it('sorts by urgency severity (HIGH first) when combined with a geo radius filter', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([
      { id: 1, latitude: 40.71, longitude: -74, urgency: 'LOW' },
      { id: 2, latitude: 40.72, longitude: -74, urgency: 'HIGH' },
      { id: 3, latitude: 40.73, longitude: -74, urgency: 'MEDIUM' },
    ]);

    const result = await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: paged({
        lat: '40.7',
        lng: '-74',
        radiusMi: '50',
        sort: 'urgency',
      }),
    });

    expect(result.data.map((r) => r.id)).toEqual([2, 3, 1]);
  });

  it('sorts by urgency severity ascending (LOW first) when requested', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([
      { id: 1, latitude: 40.71, longitude: -74, urgency: 'HIGH' },
      { id: 2, latitude: 40.72, longitude: -74, urgency: 'LOW' },
      { id: 3, latitude: 40.73, longitude: -74, urgency: 'MEDIUM' },
    ]);

    const result = await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: paged({
        lat: '40.7',
        lng: '-74',
        radiusMi: '50',
        sort: 'urgency:asc',
      }),
    });

    expect(result.data.map((r) => r.id)).toEqual([2, 3, 1]);
  });
});

describe('helpRequestService.getBrowseHelpRequests — distanceMi', () => {
  const admin = { id: 1, role: 'ADMIN' };

  it('attaches distanceMi to every result when geo params are present, regardless of sort field', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([
      { id: 1, latitude: 40.71, longitude: -74, urgency: 'LOW' },
    ]);

    const result = await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: paged({
        lat: '40.7',
        lng: '-74',
        radiusMi: '50',
        sort: 'urgency',
      }),
    });

    expect(result.data[0].distanceMi).toEqual(expect.any(Number));
  });

  it('does not attach distanceMi when no geo params are provided', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([{ id: 1, urgency: 'LOW' }]);

    const result = await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: paged({ sort: 'urgency' }),
    });

    expect(result.data[0].distanceMi).toBeUndefined();
  });

  it('excludes results outside the exact radius even if inside the bounding box', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([
      { id: 1, latitude: 40.7 + 5 / 69, longitude: -74 + 5 / 69 },
      { id: 2, latitude: 40.71, longitude: -74 },
    ]);

    const result = await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: paged({ lat: '40.7', lng: '-74', radiusMi: '5' }),
    });

    expect(result.data.map((r) => r.id)).toEqual([2]);
  });
});

describe('helpRequestService.getBrowseHelpRequests — pagination', () => {
  const admin = { id: 1, role: 'ADMIN' };

  it('computes skip/take from page and pageSize on the DB fast path', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([]);
    prisma.helpRequest.count.mockResolvedValue(0);

    await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: { page: 3, pageSize: 5 },
    });

    expect(prisma.helpRequest.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 10, take: 5 })
    );
  });

  it('runs findMany and count in parallel on the fast path and returns pagination meta', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    prisma.helpRequest.count.mockResolvedValue(23);

    const result = await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: { page: 2, pageSize: 5 },
    });

    expect(prisma.helpRequest.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.any(Object) })
    );
    expect(result.meta).toEqual({
      page: 2,
      pageSize: 5,
      totalCount: 23,
      totalPages: 5,
    });
  });

  it('does not call prisma.count on the in-memory (geo/distance) path', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([
      { id: 1, latitude: 40.71, longitude: -74 },
    ]);

    await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: paged({ lat: '40.7', lng: '-74', radiusMi: '50' }),
    });

    expect(prisma.helpRequest.count).not.toHaveBeenCalled();
  });

  it('paginates the in-memory sorted set with slice, not DB skip/take', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([
      { id: 1, latitude: 40.9, longitude: -74 },
      { id: 2, latitude: 40.71, longitude: -74 },
      { id: 3, latitude: 40.72, longitude: -74 },
      { id: 4, latitude: 40.73, longitude: -74 },
    ]);

    const result = await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: {
        lat: '40.7',
        lng: '-74',
        radiusMi: '50',
        sort: 'distance',
        page: 2,
        pageSize: 2,
      },
    });

    expect(result.data.map((r) => r.id)).toEqual([4, 1]);
    expect(result.meta).toEqual({
      page: 2,
      pageSize: 2,
      totalCount: 4,
      totalPages: 2,
    });
  });

  it('computes totalCount/totalPages after geo filtering removes out-of-radius rows', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([
      { id: 1, latitude: 40.71, longitude: -74 }, // in radius
      { id: 2, latitude: 41.9, longitude: -74 }, // out of radius
    ]);

    const result = await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: { lat: '40.7', lng: '-74', radiusMi: '5', page: 1, pageSize: 5 },
    });

    expect(result.meta.totalCount).toBe(1);
    expect(result.meta.totalPages).toBe(1);
  });

  it('returns an empty data array for a page past the end of the result set', async () => {
    prisma.helpRequest.findMany.mockResolvedValue([
      { id: 1, latitude: 40.71, longitude: -74 },
    ]);

    const result = await helpRequestService.getBrowseHelpRequests({
      user: admin,
      query: {
        lat: '40.7',
        lng: '-74',
        radiusMi: '50',
        page: 5,
        pageSize: 5,
      },
    });

    expect(result.data).toEqual([]);
    expect(result.meta.totalCount).toBe(1);
  });
});

describe('browseHelpRequestQuerySchema', () => {
  const {
    browseHelpRequestQuerySchema,
  } = require('../src/validations/helpRequestSchema');

  it('passes with an empty query object', () => {
    const { error } = browseHelpRequestQuerySchema.validate({});
    expect(error).toBeUndefined();
  });

  it('defaults page to 1 and pageSize to 5', () => {
    const { value } = browseHelpRequestQuerySchema.validate({});
    expect(value.page).toBe(1);
    expect(value.pageSize).toBe(5);
  });

  it('rejects a page below 1', () => {
    const { error } = browseHelpRequestQuerySchema.validate({ page: 0 });
    expect(error).toBeDefined();
  });

  it('rejects a pageSize above 25', () => {
    const { error } = browseHelpRequestQuerySchema.validate({ pageSize: 26 });
    expect(error).toBeDefined();
  });

  it('uppercases and validates a lowercase category list', () => {
    const { error, value } = browseHelpRequestQuerySchema.validate({
      category: 'grocery,yard_work',
    });
    expect(error).toBeUndefined();
    expect(value.category).toBe('GROCERY,YARD_WORK');
  });

  it('flags one bad value inside an otherwise-valid comma list', () => {
    const { error } = browseHelpRequestQuerySchema.validate({
      urgency: 'high,not_real',
    });
    expect(error).toBeDefined();
    expect(error.details[0].message).toMatch(/not_real/i);
  });

  it('requires lat+lng+radiusMi together (and-constraint)', () => {
    const { error } = browseHelpRequestQuerySchema.validate({ lat: 40.7 });
    expect(error).toBeDefined();
  });

  it('passes unknown params through without erroring', () => {
    const { error } = browseHelpRequestQuerySchema.validate({
      someRandomThing: 'x',
    });
    expect(error).toBeUndefined();
  });

  it('rejects a malformed sort string', () => {
    const { error } = browseHelpRequestQuerySchema.validate({
      sort: 'urgency:backwards',
    });
    expect(error).toBeDefined();
  });
});
