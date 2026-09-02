jest.mock('../src/services/emailDelivery.service', () => ({
  sendAcceptanceEmail: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/config/prisma', () => ({
  $transaction: jest.fn(),
  notification: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  notificationDelivery: {
    create: jest.fn(),
    createMany: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
    findMany: jest.fn(),
  },
  helpRequest: {
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  },
  volunteerResponse: {
    findUnique: jest.fn(),
  },
}));

const prisma = require('../src/config/prisma');
const emailDelivery = require('../src/services/emailDelivery.service');
const {
  onHelpRequestAccepted,
  buildDedupeKey,
  createNotificationWithDelivery,
} = require('../src/services/notification.service');

describe('notification.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    prisma.helpRequest.findUnique.mockResolvedValue({
      title: 'Groceries',
      category: 'GROCERY',
      urgency: 'MEDIUM',
    });
    prisma.user.findUnique.mockResolvedValue({
      name: 'Emma Garcia',
      email: 'alice@example.com',
    });
    prisma.volunteerResponse.findUnique.mockResolvedValue({
      createdAt: new Date('2026-08-28T14:32:01.123Z'),
    });

    prisma.$transaction.mockImplementation(async (callback) => {
      const tx = {
        notification: {
          create: jest.fn().mockResolvedValue({
            id: 1,
            recipientId: 3,
            dedupeKey: buildDedupeKey(12),
          }),
        },
        notificationDelivery: {
          createMany: jest.fn().mockResolvedValue({ count: 2 }),
        },
      };
      return callback(tx);
    });

    prisma.notificationDelivery.update.mockResolvedValue({
      id: 1,
      attemptCount: 1,
      failureReason: null,
    });
  });

  it('creates an acceptance notification with in-app and email delivery', async () => {
    const notification = await onHelpRequestAccepted({
      requestId: 12,
      requesterId: 3,
      volunteerId: 5,
    });

    expect(notification.id).toBe(1);
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(emailDelivery.sendAcceptanceEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'alice@example.com',
        payload: expect.objectContaining({
          requestTitle: 'Groceries',
          volunteerName: 'Emma Garcia',
        }),
      })
    );
    expect(prisma.notificationDelivery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          notificationId_channel: {
            notificationId: 1,
            channel: 'IN_APP',
          },
        },
        data: expect.objectContaining({ status: 'DELIVERED' }),
      })
    );
    expect(prisma.notificationDelivery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          notificationId_channel: {
            notificationId: 1,
            channel: 'EMAIL',
          },
        },
        data: expect.objectContaining({ status: 'DELIVERED' }),
      })
    );
  });

  it('persists FAILED delivery when in-app delivery fails after create', async () => {
    prisma.notificationDelivery.update
      .mockRejectedValueOnce(new Error('write failed'))
      .mockResolvedValueOnce({
        id: 1,
        attemptCount: 1,
        failureReason: 'write failed',
      })
      .mockResolvedValue({
        id: 2,
        attemptCount: 1,
        failureReason: null,
      });

    const notification = await createNotificationWithDelivery({
      recipientId: 3,
      type: 'HELP_REQUEST_ACCEPTED',
      dedupeKey: buildDedupeKey(99),
      payload: {
        requestId: 99,
        requestTitle: 'Groceries',
        volunteerName: 'Emma Garcia',
        acceptedAt: '2026-08-28T14:32:01.123Z',
      },
    });

    expect(notification.id).toBe(1);
    expect(prisma.notificationDelivery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'FAILED' }),
      })
    );
    expect(emailDelivery.sendAcceptanceEmail).toHaveBeenCalled();
  });

  it('uses a stable dedupe key per request', () => {
    expect(buildDedupeKey(42)).toBe('help_request_accepted:42');
  });
});
