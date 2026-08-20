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

const SORTABLE_FIELDS = ['createdAt', 'scheduledAt', 'urgency', 'distance'];
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

const getBrowseHelpRequests = async ({ user, query }) => {
  const where = {};
  const andConditions = [];

  where.status = query.status
    ? { in: query.status.split(',') }
    : RequestStatus.PENDING;

  const isPendingOnly =
    where.status === RequestStatus.PENDING ||
    (where.status.in &&
      where.status.in.every((s) => s === RequestStatus.PENDING));

  if (!isPendingOnly && user.role !== 'ADMIN') {
    andConditions.push({
      OR: [{ requesterId: user.id }, { volunteerId: user.id }],
    });
  }

  if (query.category) where.category = { in: query.category.split(',') };
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

  if (hasGeo) {
    const radiusMi = Number(query.radiusMi);
    const latDelta = radiusMi / 69;
    const lngDelta = radiusMi / (69 * Math.cos((lat * Math.PI) / 180));
    where.latitude = { gte: lat - latDelta, lte: lat + latDelta };
    where.longitude = { gte: lng - lngDelta, lte: lng + lngDelta };
  }

  const [sortFieldRaw, sortDirRaw] = (query.sort || 'createdAt:desc').split(
    ':'
  );
  const sortField = sortFieldRaw;
  const sortDir = sortDirRaw || DEFAULT_SORT_DIR[sortField] || 'desc';

  if (!SORTABLE_FIELDS.includes(sortField)) {
    throw new ApiError(400, `Invalid sort field: ${sortField}`);
  }
  if (sortField === 'distance' && !hasGeo) {
    throw new ApiError(400, 'sort=distance requires lat, lng, and radiusMi');
  }

  const options = { where };
  if (sortField === 'createdAt' || sortField === 'scheduledAt') {
    options.orderBy = {
      [sortField]: sortDir,
    };
  }

  let data = await prisma.helpRequest.findMany(options);

  if (hasGeo) {
    const radiusMi = Number(query.radiusMi);
    data = data
      .map((r) => ({
        ...r,
        distanceMi: haversineMiles(lat, lng, r.latitude, r.longitude),
      }))
      .filter((r) => r.distanceMi <= radiusMi);
  }

  if (sortField === 'urgency') {
    data.sort((a, b) => {
      const diff = URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency];
      return sortDir === 'asc' ? diff : -diff;
    });
  } else if (sortField === 'distance') {
    data.sort((a, b) =>
      sortDir === 'desc'
        ? b.distanceMi - a.distanceMi
        : a.distanceMi - b.distanceMi
    );
  }

  return data;
};

module.exports = {
  createHelpRequest,
  getHelpRequests,
  getBrowseHelpRequests,
};
