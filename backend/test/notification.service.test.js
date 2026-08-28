jest.mock('../src/config/prisma', () => ({
  $transaction: jest.fn(),
  notification: {
    create: jest.fn(),
  },
  notificationDelivery: {
    create: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
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
const {
  onHelpRequestAccepted,
  buildDedupeKey,
} = require('../src/services/notification.service');

describe('notification.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    prisma.helpRequest.findUnique.mockResolvedValue({
      title: 'Groceries',
      category: 'GROCERY',
      urgency: 'MEDIUM',
    });
    prisma.user.findUnique.mockResolvedValue({ name: 'Emma Garcia' });
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
          create: jest.fn().mockResolvedValue({ id: 1 }),
          update: jest.fn().mockResolvedValue({ id: 1 }),
        },
      };
      return callback(tx);
    });
  });

  it('creates an acceptance notification with request and volunteer details', async () => {
    const notification = await onHelpRequestAccepted({
      requestId: 12,
      requesterId: 3,
      volunteerId: 5,
    });

    expect(notification.id).toBe(1);
    expect(prisma.$transaction).toHaveBeenCalled();
  });

  it('uses a stable dedupe key per request', () => {
    expect(buildDedupeKey(42)).toBe('help_request_accepted:42');
  });
});
