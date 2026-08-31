const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const { RequestStatus } = require('@prisma/client');

async function createHelpRequest({ requesterId, data }) {
  const scheduledDate = new Date(data.scheduledAt);
  if (scheduledDate <= new Date()) {
    throw new ApiError(400, 'scheduledAt must be a future date');
  }

  return prisma.helpRequest.create({
    data: {
      requesterId,
      title: data.title,
      category: data.category,
      urgency: data.urgency,
      scheduledAt: scheduledDate,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      description: data.description || null,
      status: RequestStatus.PENDING,
    },
  });
}

async function getHelpRequests({ requesterId }) {
  return prisma.helpRequest.findMany({
    where: {
      requesterId,
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  });
}

const DEFAULT_SORT_DIR = {
  createdAt: 'desc',
  scheduledAt: 'asc',
  urgency: 'desc',
  distance: 'asc',
};
const URGENCY_RANK = { LOW: 0, MEDIUM: 1, HIGH: 2 };

function haversineMiles(lat1, lng1, lat2, lng2) {
  const EARTH_RADIUS_MI = 3959;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return EARTH_RADIUS_MI * 2 * Math.asin(Math.sqrt(Math.min(1, a)));
}

function buildRequestWhere({ user, query, excludeCategory = false }) {
  const where = {};
  const andConditions = [];

  const statuses = query.status?.split(',');
  where.status = statuses ? { in: statuses } : RequestStatus.PENDING;

  const isPendingOnly =
    !statuses || statuses.every((status) => status === RequestStatus.PENDING);

  if (!isPendingOnly && user.role !== 'ADMIN') {
    andConditions.push({
      OR: [{ requesterId: user.id }, { volunteerId: user.id }],
    });
  }

  if (!excludeCategory && query.category) {
    where.category = { in: query.category.split(',') };
  }

  if (query.urgency) where.urgency = { in: query.urgency.split(',') };

  if (query.scheduledAfter || query.scheduledBefore) {
    where.scheduledAt = {
      ...(query.scheduledAfter && { gte: new Date(query.scheduledAfter) }),
      ...(query.scheduledBefore && { lte: new Date(query.scheduledBefore) }),
    };
  }

  if (query.createdAfter || query.createdBefore) {
    where.createdAt = {
      ...(query.createdAfter && { gte: new Date(query.createdAfter) }),
      ...(query.createdBefore && { lte: new Date(query.createdBefore) }),
    };
  }

  if (query.daysOfWeek) {
    where.scheduledDayOfWeek = {
      in: query.daysOfWeek.split(',').map(Number),
    };
  }

  if (query.q) {
    andConditions.push({
      OR: [
        { title: { contains: query.q, mode: 'insensitive' } },
        { description: { contains: query.q, mode: 'insensitive' } },
      ],
    });
  }

  if (andConditions.length) where.AND = andConditions;

  const hasGeo =
    query.lat !== undefined &&
    query.lng !== undefined &&
    query.radiusMi !== undefined;

  const lat = hasGeo ? Number(query.lat) : null;
  const lng = hasGeo ? Number(query.lng) : null;
  const radiusMi = hasGeo ? Number(query.radiusMi) : null;

  if (hasGeo) {
    const latDelta = radiusMi / 69;
    const lngDelta = radiusMi / (69 * Math.cos((lat * Math.PI) / 180));
    where.latitude = { gte: lat - latDelta, lte: lat + latDelta };
    where.longitude = { gte: lng - lngDelta, lte: lng + lngDelta };
  }

  return { where, hasGeo, lat, lng, radiusMi };
}

const getBrowseHelpRequests = async ({ user, query }) => {
  const { where, hasGeo, lat, lng, radiusMi } = buildRequestWhere({
    user,
    query,
  });

  const [sortField, sortDirRaw] = (query.sort || 'createdAt:desc').split(':');
  const sortDir = sortDirRaw || DEFAULT_SORT_DIR[sortField] || 'desc';

  if (sortField === 'distance' && !hasGeo) {
    throw new ApiError(400, 'sort=distance requires lat, lng, and radiusMi');
  }

  const options = { where };
  const page = query.page;
  const pageSize = query.pageSize;

  const requiresInMemoryProcessing = hasGeo || sortField === 'distance';

  if (!requiresInMemoryProcessing) {
    options.orderBy = [{ [sortField]: sortDir }, { id: 'asc' }];

    const [data, totalCount] = await Promise.all([
      prisma.helpRequest.findMany({
        ...options,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.helpRequest.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  }

  let data = await prisma.helpRequest.findMany(options);

  if (hasGeo) {
    data = data
      .map((request) => ({
        ...request,
        distanceMi: haversineMiles(
          lat,
          lng,
          request.latitude,
          request.longitude
        ),
      }))
      .filter((request) => request.distanceMi <= radiusMi);
  }

  const compareBy = {
    distance: (a, b) => a.distanceMi - b.distanceMi,
    urgency: (a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency],
    createdAt: (a, b) => a.createdAt - b.createdAt,
    scheduledAt: (a, b) => a.scheduledAt - b.scheduledAt,
  };

  data.sort((a, b) => {
    const diff = compareBy[sortField](a, b);
    if (diff !== 0) return sortDir === 'asc' ? diff : -diff;
    return a.id - b.id;
  });

  const totalCount = data.length;
  const start = (page - 1) * pageSize;
  const paginated = data.slice(start, start + pageSize);

  return {
    data: paginated,
    meta: {
      page,
      pageSize,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
};

const getCategoryFacets = async ({ user, query }) => {
  const { where, hasGeo, lat, lng, radiusMi } = buildRequestWhere({
    user,
    query,
    excludeCategory: true,
  });

  if (!hasGeo) {
    const groups = await prisma.helpRequest.groupBy({
      by: ['category'],
      where,
      _count: true,
    });

    return groups.reduce((acc, g) => {
      acc[g.category] = g._count;
      return acc;
    }, {});
  }

  const rows = await prisma.helpRequest.findMany({
    where,
    select: { category: true, latitude: true, longitude: true },
  });

  return rows
    .filter(
      (r) => haversineMiles(lat, lng, r.latitude, r.longitude) <= radiusMi
    )
    .reduce((acc, r) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {});
};

const isOpenRequest = (request) =>
  request.status === RequestStatus.PENDING && request.volunteerId === null;

const responseUniqueWhere = (requestId, volunteerId) => ({
  requestId_volunteerId: { requestId, volunteerId },
});

async function acceptHelpRequest({ requestId, volunteerId }) {
  try {
    return await prisma.$transaction(async (tx) => {
      const request = await tx.helpRequest.findUnique({
        where: { id: requestId },
        select: {
          id: true,
          requesterId: true,
          status: true,
          volunteerId: true,
        },
      });

      if (!request) {
        throw new ApiError(404, 'Help request not found');
      }

      if (request.requesterId === volunteerId) {
        throw new ApiError(403, 'Cannot respond to your own request');
      }

      const existing = await tx.volunteerResponse.findUnique({
        where: responseUniqueWhere(requestId, volunteerId),
      });

      if (existing) {
        throw new ApiError(409, 'You have already responded to this request');
      }

      const { count } = await tx.helpRequest.updateMany({
        where: {
          id: requestId,
          status: RequestStatus.PENDING,
          volunteerId: null,
        },
        data: {
          status: RequestStatus.ACCEPTED,
          volunteerId,
        },
      });

      if (count !== 1) {
        throw new ApiError(409, 'This request is no longer available');
      }

      await tx.volunteerResponse.create({
        data: {
          requestId,
          volunteerId,
          action: 'ACCEPTED',
        },
      });
      await tx.conversation.upsert({
        where: {
          requestId,
        },
        create: {
          requestId,
        },
        update: {},
      });
      return tx.helpRequest.findUnique({ where: { id: requestId } });
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ApiError(409, 'You have already responded to this request');
    }
    throw err;
  }
}

async function declineHelpRequest({ requestId, volunteerId }) {
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT id FROM "HelpRequest" WHERE id = ${requestId} FOR UPDATE`;

      const request = await tx.helpRequest.findUnique({
        where: { id: requestId },
        select: {
          id: true,
          requesterId: true,
          status: true,
          volunteerId: true,
        },
      });

      if (!request) {
        throw new ApiError(404, 'Help request not found');
      }

      if (request.requesterId === volunteerId) {
        throw new ApiError(403, 'Cannot respond to your own request');
      }

      if (!isOpenRequest(request)) {
        throw new ApiError(409, 'This request is no longer available');
      }

      const existing = await tx.volunteerResponse.findUnique({
        where: responseUniqueWhere(requestId, volunteerId),
      });

      if (existing) {
        throw new ApiError(409, 'You have already responded to this request');
      }

      return tx.volunteerResponse.create({
        data: {
          requestId,
          volunteerId,
          action: 'DECLINED',
        },
      });
    });
  } catch (err) {
    if (err.code === 'P2002') {
      throw new ApiError(409, 'You have already responded to this request');
    }
    throw err;
  }
}

module.exports = {
  createHelpRequest,
  getHelpRequests,
  getBrowseHelpRequests,
  getCategoryFacets,
  acceptHelpRequest,
  declineHelpRequest,
};
