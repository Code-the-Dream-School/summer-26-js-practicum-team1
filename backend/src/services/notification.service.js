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

const logDelivery = (fields) => {
  console.log(
    JSON.stringify({
      event: 'notification_delivery',
      timestamp: new Date().toISOString(),
      ...fields,
    })
  );
};

const deliverInApp = async (tx, notificationId) => {
  const now = new Date();

  await tx.notificationDelivery.update({
    where: {
      notificationId_channel: {
        notificationId,
        channel: NotificationChannel.IN_APP,
      },
    },
    data: {
      status: NotificationDeliveryStatus.DELIVERED,
      deliveredAt: now,
      lastAttemptAt: now,
      attemptCount: { increment: 1 },
      failureReason: null,
    },
  });
};

const createNotificationWithDelivery = async ({
  recipientId,
  type,
  dedupeKey,
  payload,
}) => {
  try {
    const notification = await prisma.$transaction(async (tx) => {
      const created = await tx.notification.create({
        data: {
          recipientId,
          type,
          dedupeKey,
          payload,
        },
      });

      await tx.notificationDelivery.create({
        data: {
          notificationId: created.id,
          channel: NotificationChannel.IN_APP,
          status: NotificationDeliveryStatus.PENDING,
        },
      });

      await deliverInApp(tx, created.id);

      return created;
    });

    logDelivery({
      notificationId: notification.id,
      channel: NotificationChannel.IN_APP,
      status: NotificationDeliveryStatus.DELIVERED,
      dedupeKey,
      recipientId,
      attemptCount: 1,
    });

    return notification;
  } catch (err) {
    if (err.code === 'P2002') {
      const existing = await prisma.notification.findUnique({
        where: { dedupeKey },
        select: { id: true, recipientId: true },
      });

      if (existing) {
        await prisma.notificationDelivery.upsert({
          where: {
            notificationId_channel: {
              notificationId: existing.id,
              channel: NotificationChannel.IN_APP,
            },
          },
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
      }

      return existing;
    }

    logDelivery({
      channel: NotificationChannel.IN_APP,
      status: NotificationDeliveryStatus.FAILED,
      dedupeKey,
      recipientId,
      attemptCount: 1,
      failureReason: err.message,
    });

    throw err;
  }
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
  const failed = await prisma.notificationDelivery.findMany({
    where: {
      channel: NotificationChannel.IN_APP,
      status: NotificationDeliveryStatus.FAILED,
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

  for (const delivery of failed) {
    try {
      const now = new Date();
      await prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status: NotificationDeliveryStatus.DELIVERED,
          deliveredAt: now,
          lastAttemptAt: now,
          attemptCount: { increment: 1 },
          failureReason: null,
        },
      });

      logDelivery({
        notificationId: delivery.notification.id,
        channel: NotificationChannel.IN_APP,
        status: NotificationDeliveryStatus.DELIVERED,
        dedupeKey: delivery.notification.dedupeKey,
        recipientId: delivery.notification.recipientId,
        attemptCount: delivery.attemptCount + 1,
      });
    } catch (err) {
      const attemptCount = delivery.attemptCount + 1;
      await prisma.notificationDelivery.update({
        where: { id: delivery.id },
        data: {
          status:
            attemptCount >= MAX_DELIVERY_ATTEMPTS
              ? NotificationDeliveryStatus.FAILED
              : NotificationDeliveryStatus.FAILED,
          lastAttemptAt: new Date(),
          attemptCount,
          failureReason: err.message,
        },
      });

      logDelivery({
        notificationId: delivery.notification.id,
        channel: NotificationChannel.IN_APP,
        status: NotificationDeliveryStatus.FAILED,
        dedupeKey: delivery.notification.dedupeKey,
        recipientId: delivery.notification.recipientId,
        attemptCount,
        failureReason: err.message,
      });
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
};
