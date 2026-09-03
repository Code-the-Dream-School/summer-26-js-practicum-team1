const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const emailDelivery = require('./emailDelivery.service');
const {
  NotificationType,
  NotificationChannel,
  NotificationDeliveryStatus,
} = require('@prisma/client');

const MAX_DELIVERY_ATTEMPTS = 3;
const RETRY_INTERVAL_MS = 60_000;

const buildDedupeKey = (requestId) => `help_request_accepted:${requestId}`;

const deliveryWhere = (notificationId, channel) => ({
  notificationId_channel: {
    notificationId,
    channel,
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

    await tx.notificationDelivery.createMany({
      data: [
        {
          notificationId: notification.id,
          channel: NotificationChannel.IN_APP,
          status: NotificationDeliveryStatus.PENDING,
        },
        {
          notificationId: notification.id,
          channel: NotificationChannel.EMAIL,
          status: NotificationDeliveryStatus.PENDING,
        },
      ],
    });

    return notification;
  });

const markDeliveryDelivered = async (notificationId, channel, meta = {}) => {
  const now = new Date();

  const delivery = await prisma.notificationDelivery.update({
    where: deliveryWhere(notificationId, channel),
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
    channel,
    status: NotificationDeliveryStatus.DELIVERED,
    dedupeKey: meta.dedupeKey,
    recipientId: meta.recipientId,
    attemptCount: delivery.attemptCount,
  });

  return delivery;
};

const markDeliveryFailed = async (
  notificationId,
  channel,
  err,
  meta = {}
) => {
  const now = new Date();
  const failureReason = err.message?.slice(0, 500) || 'Delivery failed';

  const delivery = await prisma.notificationDelivery.update({
    where: deliveryWhere(notificationId, channel),
    data: {
      status: NotificationDeliveryStatus.FAILED,
      lastAttemptAt: now,
      attemptCount: { increment: 1 },
      failureReason,
    },
  });

  logDelivery({
    notificationId,
    channel,
    status: NotificationDeliveryStatus.FAILED,
    dedupeKey: meta.dedupeKey,
    recipientId: meta.recipientId,
    attemptCount: delivery.attemptCount,
    failureReason: delivery.failureReason,
  });

  return delivery;
};

const attemptInAppDelivery = async (notificationId, meta = {}) => {
  try {
    return await markDeliveryDelivered(
      notificationId,
      NotificationChannel.IN_APP,
      meta
    );
  } catch (err) {
    await markDeliveryFailed(
      notificationId,
      NotificationChannel.IN_APP,
      err,
      meta
    );
    throw err;
  }
};

const attemptEmailDelivery = async (notificationId, meta = {}) => {
  try {
    const requester = await prisma.user.findUnique({
      where: { id: meta.recipientId },
      select: { email: true },
    });

    if (!requester?.email) {
      throw new Error('Requester email not found');
    }

    await emailDelivery.sendAcceptanceEmail({
      to: requester.email,
      payload: meta.payload,
    });

    return await markDeliveryDelivered(
      notificationId,
      NotificationChannel.EMAIL,
      meta
    );
  } catch (err) {
    await markDeliveryFailed(
      notificationId,
      NotificationChannel.EMAIL,
      err,
      meta
    );
    throw err;
  }
};

const markDuplicateDeliverySkipped = async (existing, dedupeKey) => {
  for (const channel of [
    NotificationChannel.IN_APP,
    NotificationChannel.EMAIL,
  ]) {
    await prisma.notificationDelivery.upsert({
      where: deliveryWhere(existing.id, channel),
      create: {
        notificationId: existing.id,
        channel,
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
      channel,
      status: NotificationDeliveryStatus.SKIPPED,
      dedupeKey,
      recipientId: existing.recipientId,
      attemptCount: 0,
    });
  }
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

  const deliveryMeta = { dedupeKey, recipientId, payload };

  try {
    await attemptInAppDelivery(notification.id, deliveryMeta);
  } catch {
    // FAILED row persisted; accept flow should not roll back.
  }

  try {
    await attemptEmailDelivery(notification.id, deliveryMeta);
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

const retryDelivery = async (delivery) => {
  const meta = {
    dedupeKey: delivery.notification.dedupeKey,
    recipientId: delivery.notification.recipientId,
    payload: delivery.notification.payload,
  };

  if (delivery.channel === NotificationChannel.IN_APP) {
    await attemptInAppDelivery(delivery.notificationId, meta);
    return;
  }

  if (delivery.channel === NotificationChannel.EMAIL) {
    await attemptEmailDelivery(delivery.notificationId, meta);
  }
};

async function retryFailedDeliveries() {
  const retryable = await prisma.notificationDelivery.findMany({
    where: {
      channel: {
        in: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
      },
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
          payload: true,
        },
      },
    },
    take: 20,
  });

  for (const delivery of retryable) {
    try {
      await retryDelivery(delivery);
    } catch {
      // attempt* helpers already persisted FAILED and logged.
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
  attemptEmailDelivery,
  createNotificationWithDelivery,
};
