const {
  buildAcceptanceEmail,
  sendEmail,
} = require('../src/services/emailDelivery.service');

describe('emailDelivery.service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      CLIENT_URL: 'http://localhost:5173',
      EMAIL_DELIVERY_MODE: 'log',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('builds acceptance email with volunteer, request title, and dashboard link', () => {
    const message = buildAcceptanceEmail({
      payload: {
        volunteerName: 'Emma Garcia',
        requestTitle: 'Need help picking up groceries',
        acceptedAt: '2026-08-28T14:32:01.123Z',
      },
    });

    expect(message.subject).toBe('Emma Garcia accepted your help request');
    expect(message.text).toContain('Need help picking up groceries');
    expect(message.text).toContain('Emma Garcia');
    expect(message.text).toContain('http://localhost:5173/requester-dashboard');
    expect(message.html).not.toContain('alice@example.com');
  });

  it('logs email content in log delivery mode', async () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await sendEmail({
      to: 'alice@example.com',
      subject: 'Test subject',
      text: 'Test body',
      html: '<p>Test body</p>',
    });

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('"event":"email_delivery_log"')
    );

    logSpy.mockRestore();
  });
});
