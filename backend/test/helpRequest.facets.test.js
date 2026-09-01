const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/prisma', () => ({
user: {
findUnique: jest.fn(),
},
helpRequest: {
findMany: jest.fn(),
create: jest.fn(),
groupBy: jest.fn(),
},
}));

const prisma = require('../src/config/prisma');
const app = require('../src/app');
const helpRequestService = require('../src/services/helpRequest.service');

const CSRF_TOKEN = 'x';

const signJwt = (payload) =>
jwt.sign(
{
csrfToken: CSRF_TOKEN,
...payload,
},
process.env.JWT_SECRET,
{
expiresIn: '1h',
}
);

const cookieFor = (id) => `jwt=${signJwt({ id })}`;

const facets = (query = '', cookie = '') =>
request(app)
.get(`/api/requests/facets${query}`)
.set('Cookie', cookie);

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
volunteerProfile: status
? { verificationStatus: status }
: null,
});

beforeEach(() => {
jest.clearAllMocks();
});



describe('GET /api/requests/facets - authorization', () => {
it('rejects an unauthenticated request', async () => {
const res = await facets();


expect(res.status).toBe(401);


});

it('rejects a REQUESTER', async () => {
prisma.user.findUnique.mockResolvedValue(
mockUser({
id: 2,
role: 'REQUESTER',
})
);


const res = await facets('', cookieFor(2));

expect(res.status).toBe(403);
expect(prisma.helpRequest.groupBy).not.toHaveBeenCalled();
expect(prisma.helpRequest.findMany).not.toHaveBeenCalled();


});

it('rejects a VOLUNTEER without a volunteer profile', async () => {
prisma.user.findUnique.mockResolvedValue(asVolunteer());


const res = await facets('', cookieFor(5));

expect(res.status).toBe(403);
expect(prisma.helpRequest.groupBy).not.toHaveBeenCalled();
expect(prisma.helpRequest.findMany).not.toHaveBeenCalled();


});

it('rejects a VOLUNTEER whose verification status is PENDING', async () => {
prisma.user.findUnique.mockResolvedValue(
asVolunteer('PENDING')
);


const res = await facets('', cookieFor(5));

expect(res.status).toBe(403);
expect(prisma.helpRequest.groupBy).not.toHaveBeenCalled();
expect(prisma.helpRequest.findMany).not.toHaveBeenCalled();

});

it('allows an APPROVED VOLUNTEER', async () => {
prisma.user.findUnique.mockResolvedValue(
asVolunteer('APPROVED')
);


prisma.helpRequest.groupBy.mockResolvedValue([]);

const res = await facets('', cookieFor(5));

expect(res.status).toBe(200);


});

it('allows an ADMIN', async () => {
prisma.user.findUnique.mockResolvedValue(
mockUser({
id: 6,
role: 'ADMIN',
})
);


prisma.helpRequest.groupBy.mockResolvedValue([]);

const res = await facets('', cookieFor(6));

expect(res.status).toBe(200);


});

it('rejects a token for a user that no longer exists', async () => {
prisma.user.findUnique.mockResolvedValue(null);


const res = await facets('', cookieFor(999));

expect(res.status).toBe(401);


});
});



describe('GET /api/requests/facets - query validation', () => {
const adminCookie = cookieFor(1);

beforeEach(() => {
prisma.user.findUnique.mockResolvedValue(mockUser());
prisma.helpRequest.groupBy.mockResolvedValue([]);
prisma.helpRequest.findMany.mockResolvedValue([]);
});

it('accepts a valid category', async () => {
const res = await facets(
'?category=GROCERY',
adminCookie
);


expect(res.status).toBe(200);


});

it('rejects an invalid category value', async () => {
const res = await facets(
'?category=NOT_REAL',
adminCookie
);


expect(res.status).toBe(400);


});

it('rejects an invalid urgency value', async () => {
const res = await facets(
'?urgency=SUPER_HIGH',
adminCookie
);


expect(res.status).toBe(400);


});

it('rejects lat without lng and radiusMi', async () => {
const res = await facets(
'?lat=40.7',
adminCookie
);


expect(res.status).toBe(400);


});

it('accepts lat, lng, and radiusMi together', async () => {
const res = await facets(
'?lat=40.7&lng=-74&radiusMi=5',
adminCookie
);


expect(res.status).toBe(200);


});

it('accepts a valid daysOfWeek list', async () => {
const res = await facets(
'?daysOfWeek=0,3,6',
adminCookie
);


expect(res.status).toBe(200);


});

it('rejects an invalid daysOfWeek list', async () => {
const res = await facets(
'?daysOfWeek=7,9',
adminCookie
);


expect(res.status).toBe(400);


});

it('accepts page and pageSize as unknown parameters', async () => {
const res = await facets(
'?page=2&pageSize=5',
adminCookie
);


expect(res.status).toBe(200);


});

it('ignores unknown query parameters', async () => {
const res = await facets(
'?madeUpParam=xyz',
adminCookie
);


expect(res.status).toBe(200);


});
});



describe('GET /api/requests/facets - end-to-end wiring', () => {
const adminCookie = cookieFor(1);

beforeEach(() => {
prisma.user.findUnique.mockResolvedValue(mockUser());
});

it('returns category counts from groupBy', async () => {
prisma.helpRequest.groupBy.mockResolvedValue([
{
category: 'YARD_WORK',
_count: 12,
},
{
category: 'GROCERY',
_count: 3,
},
]);


const res = await facets(
  '?q=lawn&urgency=HIGH,MEDIUM',
  adminCookie
);

expect(res.status).toBe(200);

expect(res.body.data).toEqual({
  YARD_WORK: 12,
  GROCERY: 3,
});

expect(prisma.helpRequest.groupBy).toHaveBeenCalled();


});

it('uses findMany for a geo facets request', async () => {
prisma.helpRequest.findMany.mockResolvedValue([
{
category: 'YARD_WORK',
latitude: 40.71,
longitude: -74,
},
{
category: 'YARD_WORK',
latitude: 40.72,
longitude: -74,
},
{
category: 'GROCERY',
latitude: 46,
longitude: -74,
},
]);


const res = await facets(
  '?lat=40.7&lng=-74&radiusMi=25',
  adminCookie
);

expect(res.status).toBe(200);

expect(res.body.data).toEqual({
  YARD_WORK: 2,
});
expect(prisma.helpRequest.findMany).toHaveBeenCalled();
expect(prisma.helpRequest.groupBy).not.toHaveBeenCalled();


});

it('allows an APPROVED VOLUNTEER to request non-pending facets', async () => {
prisma.user.findUnique.mockResolvedValue(
asVolunteer('APPROVED')
);


prisma.helpRequest.groupBy.mockResolvedValue([]);

const res = await facets(
  '?status=ACCEPTED',
  cookieFor(5)
);

expect(res.status).toBe(200);

const { where } =
  prisma.helpRequest.groupBy.mock.calls[0][0];

expect(where.AND).toEqual(
  expect.arrayContaining([
    {
      OR: [
        { requesterId: 5 },
        { volunteerId: 5 },
      ],
    },
  ])
);


});
});

/* Service - non-geo path */

describe('helpRequestService.getCategoryFacets - non-geo path', () => {
const admin = {
id: 1,
role: 'ADMIN',
};

const volunteer = {
id: 9,
role: 'VOLUNTEER',
};

it('builds category counts from groupBy results', async () => {
prisma.helpRequest.groupBy.mockResolvedValue([
{
category: 'YARD_WORK',
_count: 12,
},
{
category: 'MOVING_HELP',
_count: 1,
},
]);


const result =
  await helpRequestService.getCategoryFacets({
    user: admin,
    query: {},
  });

expect(result).toEqual({
  YARD_WORK: 12,
  MOVING_HELP: 1,
});


});

it('applies urgency and search filters', async () => {
prisma.helpRequest.groupBy.mockResolvedValue([]);


await helpRequestService.getCategoryFacets({
  user: admin,
  query: {
    urgency: 'HIGH',
    q: 'lawn',
  },
});

const { where } =
  prisma.helpRequest.groupBy.mock.calls[0][0];

expect(where.urgency).toEqual({
  in: ['HIGH'],
});

expect(where.AND).toEqual(
  expect.arrayContaining([
    {
      OR: [
        {
          title: {
            contains: 'lawn',
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: 'lawn',
            mode: 'insensitive',
          },
        },
      ],
    },
  ])
);


});

it('defaults to PENDING status when status is not provided', async () => {
prisma.helpRequest.groupBy.mockResolvedValue([]);


await helpRequestService.getCategoryFacets({
  user: admin,
  query: {},
});

const { where } =
  prisma.helpRequest.groupBy.mock.calls[0][0];

expect(where.status).toBe('PENDING');


});

it('scopes a VOLUNTEER to their own requests for non-pending status', async () => {
prisma.helpRequest.groupBy.mockResolvedValue([]);


await helpRequestService.getCategoryFacets({
  user: volunteer,
  query: {
    status: 'ACCEPTED',
  },
});

const { where } =
  prisma.helpRequest.groupBy.mock.calls[0][0];

expect(where.AND).toEqual(
  expect.arrayContaining([
    {
      OR: [
        { requesterId: 9 },
        { volunteerId: 9 },
      ],
    },
  ])
);


});

it('returns an empty object when there are no matching rows', async () => {
prisma.helpRequest.groupBy.mockResolvedValue([]);


const result =
  await helpRequestService.getCategoryFacets({
    user: admin,
    query: {},
  });

expect(result).toEqual({});

});

it('does not call findMany for a non-geo request', async () => {
prisma.helpRequest.groupBy.mockResolvedValue([]);


await helpRequestService.getCategoryFacets({
  user: admin,
  query: {},
});

expect(prisma.helpRequest.findMany).not.toHaveBeenCalled();


});
});


describe('helpRequestService.getCategoryFacets - geo path', () => {
const admin = {
id: 1,
role: 'ADMIN',
};

it('counts only requests inside the radius', async () => {
prisma.helpRequest.findMany.mockResolvedValue([
{
category: 'YARD_WORK',
latitude: 40.71,
longitude: -74,
},
{
category: 'YARD_WORK',
latitude: 40.72,
longitude: -74,
},
{
category: 'GROCERY',
latitude: 46,
longitude: -74,
},
]);


const result =
  await helpRequestService.getCategoryFacets({
    user: admin,
    query: {
      lat: '40.7',
      lng: '-74',
      radiusMi: '25',
    },
  });

expect(result).toEqual({
  YARD_WORK: 2,
});


});

it('filters out rows outside the exact radius', async () => {
prisma.helpRequest.findMany.mockResolvedValue([
{
category: 'GROCERY',
latitude: 40.7 + 5 / 69,
longitude: -74 + 5 / 69,
},
{
category: 'GROCERY',
latitude: 40.71,
longitude: -74,
},
]);


const result =
  await helpRequestService.getCategoryFacets({
    user: admin,
    query: {
      lat: '40.7',
      lng: '-74',
      radiusMi: '5',
    },
  });

expect(result).toEqual({
  GROCERY: 1,
});


});

it('does not call groupBy for a geo request', async () => {
prisma.helpRequest.findMany.mockResolvedValue([]);


await helpRequestService.getCategoryFacets({
  user: admin,
  query: {
    lat: '40.7',
    lng: '-74',
    radiusMi: '25',
  },
});

expect(prisma.helpRequest.groupBy).not.toHaveBeenCalled();


});

it('returns an empty object when no requests are within the radius', async () => {
prisma.helpRequest.findMany.mockResolvedValue([
{
category: 'GROCERY',
latitude: 46,
longitude: -74,
},
]);


const result =
  await helpRequestService.getCategoryFacets({
    user: admin,
    query: {
      lat: '40.7',
      lng: '-74',
      radiusMi: '5',
    },
  });

expect(result).toEqual({});


});
});


describe('facetsQuerySchema', () => {
const {
facetsQuerySchema,
} = require('../src/validations/helpRequestSchema');

it('accepts an empty query object', () => {
const { error } = facetsQuerySchema.validate({});


expect(error).toBeUndefined();


});

it('accepts and uppercases a valid category', () => {
const { error, value } =
facetsQuerySchema.validate({
category: 'grocery',
});


expect(error).toBeUndefined();
expect(value.category).toBe('GROCERY');


});

it('rejects an invalid category', () => {
const { error } =
facetsQuerySchema.validate({
category: 'NOT_REAL',
});


expect(error).toBeDefined();


});

it('rejects an invalid urgency', () => {
const { error } =
facetsQuerySchema.validate({
urgency: 'SUPER_HIGH',
});


expect(error).toBeDefined();


});

it('requires lat, lng, and radiusMi together', () => {
const { error } =
facetsQuerySchema.validate({
lat: 40.7,
});


expect(error).toBeDefined();


});

it('accepts lat, lng, and radiusMi together', () => {
const { error } =
facetsQuerySchema.validate({
lat: 40.7,
lng: -74,
radiusMi: 5,
});


expect(error).toBeUndefined();


});

it('accepts a valid daysOfWeek list', () => {
const { error } =
facetsQuerySchema.validate({
daysOfWeek: '0,3,6',
});


expect(error).toBeUndefined();


});

it('rejects an invalid daysOfWeek list', () => {
const { error } =
facetsQuerySchema.validate({
daysOfWeek: '7,9',
});


expect(error).toBeDefined();

});

it('does not define pagination fields', () => {
const { value } =
facetsQuerySchema.validate({});


expect(value.page).toBeUndefined();
expect(value.pageSize).toBeUndefined();
expect(value.sort).toBeUndefined();


});

it('allows unknown query parameters', () => {
const { error } =
facetsQuerySchema.validate({
someRandomThing: 'x',
});


expect(error).toBeUndefined();


});
});
