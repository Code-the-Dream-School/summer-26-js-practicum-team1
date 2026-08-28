const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const {
  NotificationType,
  NotificationChannel,
  NotificationDeliveryStatus,
} = require('@prisma/client');

const MAX_DELIVERY_ATTEMPTS = 3;
const RETRY_INTERVAL_MS = 60_000;

const buildDedupeKey = (requestId) => `help_request_accepted:${requestId}`;

const inAppDeliveryWhere = (notificationId) => ({
  notificationId_channel: {
    notificationId,
    channel: NotificationChannel.IN_APP,
  },
});

const logDelivery = (fields) => {
  console.log(
    JSON.stringify({
      event: 'notification_delivery',
      timestamp: new Date().toISOString(),
      ...fields,
    })
  );
};

const createPendingNotification = async ({
  recipientId,
  type,
  dedupeKey,
  payload,
}) =>
  prisma.$transaction(async (tx) => {
    const notification = await tx.notification.create({
      data: {
        recipientId,
        type,
        dedupeKey,
        payload,
      },
    });

    await tx.notificationDelivery.create({
      data: {
        notificationId: notification.id,
        channel: NotificationChannel.IN_APP,
        status: NotificationDeliveryStatus.PENDING,
      },
    });

    return notification;
  });

const attemptInAppDelivery = async (notificationId, meta = {}) => {
  const now = new Date();

  try {
    const delivery = await prisma.notificationDelivery.update({
      where: inAppDeliveryWhere(notificationId),
      data: {
        status: NotificationDeliveryStatus.DELIVERED,
        deliveredAt: now,
        lastAttemptAt: now,
        attemptCount: { increment: 1 },
        failureReason: null,
      },
    });

    logDelivery({
      notificationId,
      channel: NotificationChannel.IN_APP,
      status: NotificationDeliveryStatus.DELIVERED,
      dedupeKey: meta.dedupeKey,
      recipientId: meta.recipientId,
      attemptCount: delivery.attemptCount,
    });

    return delivery;
  } catch (err) {
    const delivery = await prisma.notificationDelivery.update({
      where: inAppDeliveryWhere(notificationId),
      data: {
        status: NotificationDeliveryStatus.FAILED,
        lastAttemptAt: now,
        attemptCount: { increment: 1 },
        failureReason: err.message?.slice(0, 500) || 'Delivery failed',
      },
    });

    logDelivery({
      notificationId,
      channel: NotificationChannel.IN_APP,
      status: NotificationDeliveryStatus.FAILED,
      dedupeKey: meta.dedupeKey,
      recipientId: meta.recipientId,
      attemptCount: delivery.attemptCount,
      failureReason: delivery.failureReason,
    });

    throw err;
  }
};

const markDuplicateDeliverySkipped = async (existing, dedupeKey) => {
  await prisma.notificationDelivery.upsert({
    where: inAppDeliveryWhere(existing.id),
    create: {
      notificationId: existing.id,
      channel: NotificationChannel.IN_APP,
      status: NotificationDeliveryStatus.SKIPPED,
      attemptCount: 0,
      failureReason: 'Duplicate acceptance notification',
    },
    update: {
      status: NotificationDeliveryStatus.SKIPPED,
      failureReason: 'Duplicate acceptance notification',
    },
  });

  logDelivery({
    notificationId: existing.id,
    channel: NotificationChannel.IN_APP,
    status: NotificationDeliveryStatus.SKIPPED,
    dedupeKey,
    recipientId: existing.recipientId,
    attemptCount: 0,
  });
};

const createNotificationWithDelivery = async ({
  recipientId,
  type,
  dedupeKey,
  payload,
}) => {
  let notification;

  try {
    notification = await createPendingNotification({
      recipientId,
      type,
      dedupeKey,
      payload,
    });
  } catch (err) {
    if (err.code !== 'P2002') {
      throw err;
    }

    const existing = await prisma.notification.findUnique({
      where: { dedupeKey },
      select: { id: true, recipientId: true },
    });

    if (existing) {
      await markDuplicateDeliverySkipped(existing, dedupeKey);
    }

    return existing;
  }

  try {
    await attemptInAppDelivery(notification.id, { dedupeKey, recipientId });
  } catch {
    // FAILED row persisted; accept flow should not roll back.
  }

  return notification;
};

async function onHelpRequestAccepted({ requestId, requesterId, volunteerId }) {
  const [request, volunteerUser, volunteerResponse] = await Promise.all([
    prisma.helpRequest.findUnique({
      where: { id: requestId },
      select: {
        title: true,
        category: true,
        urgency: true,
      },
    }),
    prisma.user.findUnique({
      where: { id: volunteerId },
      select: { name: true },
    }),
    prisma.volunteerResponse.findUnique({
      where: {
        requestId_volunteerId: { requestId, volunteerId },
      },
      select: { createdAt: true },
    }),
  ]);

  if (!request || !volunteerUser || !volunteerResponse) {
    throw new Error('Missing data for acceptance notification');
  }

  const payload = {
    type: NotificationType.HELP_REQUEST_ACCEPTED,
    requestId,
    requestTitle: request.title,
    requestCategory: request.category,
    requestUrgency: request.urgency,
    volunteerId,
    volunteerName: volunteerUser.name,
    acceptedAt: volunteerResponse.createdAt.toISOString(),
  };

  return createNotificationWithDelivery({
    recipientId: requesterId,
    type: NotificationType.HELP_REQUEST_ACCEPTED,
    dedupeKey: buildDedupeKey(requestId),
    payload,
  });
}

async function listNotifications({
  recipientId,
  page = 1,
  pageSize = 20,
  unreadOnly = false,
}) {
  const where = { recipientId };

  if (unreadOnly) {
    where.readAt = null;
  }

  const skip = (page - 1) * pageSize;

  const [data, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: { recipientId, readAt: null },
    }),
  ]);

  return {
    data,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize) || 1,
      unreadCount,
    },
  };
}

async function markNotificationRead({ notificationId, recipientId }) {
  const result = await prisma.notification.updateMany({
    where: {
      id: notificationId,
      recipientId,
    },
    data: {
      readAt: new Date(),
    },
  });

  if (result.count === 0) {
    throw new ApiError(404, 'Notification not found');
  }

  return prisma.notification.findUnique({
    where: { id: notificationId },
  });
}

async function retryFailedDeliveries() {
  const retryable = await prisma.notificationDelivery.findMany({
    where: {
      channel: NotificationChannel.IN_APP,
      status: {
        in: [
          NotificationDeliveryStatus.FAILED,
          NotificationDeliveryStatus.PENDING,
        ],
      },
      attemptCount: { lt: MAX_DELIVERY_ATTEMPTS },
    },
    include: {
      notification: {
        select: {
          id: true,
          dedupeKey: true,
          recipientId: true,
        },
      },
    },
    take: 20,
  });

  for (const delivery of retryable) {
    try {
      await attemptInAppDelivery(delivery.notificationId, {
        dedupeKey: delivery.notification.dedupeKey,
        recipientId: delivery.notification.recipientId,
      });
    } catch {
      // attemptInAppDelivery already persisted FAILED and logged.
    }
  }
}

let retryTimer = null;

function startNotificationRetryLoop() {
  if (retryTimer) {
    return;
  }

  retryTimer = setInterval(() => {
    retryFailedDeliveries().catch((err) => {
      console.error(
        JSON.stringify({
          event: 'notification_retry_loop_error',
          message: err.message,
        })
      );
    });
  }, RETRY_INTERVAL_MS);
}

module.exports = {
  onHelpRequestAccepted,
  listNotifications,
  markNotificationRead,
  retryFailedDeliveries,
  startNotificationRetryLoop,
  buildDedupeKey,
  attemptInAppDelivery,
  createNotificationWithDelivery,
};
