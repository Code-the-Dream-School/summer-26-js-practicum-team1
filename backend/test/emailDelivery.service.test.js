jest.mock('nodemailer', () => ({
  createTransport: jest.fn(),
}));

const nodemailer = require('nodemailer');
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
      EMAIL_TO_OVERRIDE: '',
      SENDGRID_API_KEY: '',
      SMTP_USER: '',
      SMTP_PASS: '',
    };
    jest.clearAllMocks();
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
    expect(message.html).toContain('Neighborhood Helper');
    expect(message.html).toContain('Emma Garcia');
    expect(message.html).toContain('Need help picking up groceries');
    expect(message.html).toContain('EG');
    expect(message.html).toContain('View your request');
    expect(message.html).toContain('http://localhost:5173/requester-dashboard');
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

  it('redirects recipient when EMAIL_TO_OVERRIDE is set', async () => {
    process.env.EMAIL_TO_OVERRIDE = 'you@real-inbox.com';
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await sendEmail({
      to: 'alice.requester@example.com',
      subject: 'Test subject',
      text: 'Test body',
      html: '<p>Test body</p>',
    });

    const logged = JSON.parse(logSpy.mock.calls[0][0]);
    expect(logged.to).toBe('you@real-inbox.com');
    expect(logged.overriddenFrom).toBe('alice.requester@example.com');

    logSpy.mockRestore();
  });

  it('sends via SendGrid when mode is sendgrid', async () => {
    process.env.EMAIL_DELIVERY_MODE = 'sendgrid';
    process.env.SENDGRID_API_KEY = 'sg.test-key';
    process.env.EMAIL_FROM = 'Neighborhood Helper <noreply@test.com>';

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '',
    });
    global.fetch = fetchMock;

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await sendEmail({
      to: 'alice@example.com',
      subject: 'Accepted',
      text: 'Body',
      html: '<p>Body</p>',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.sendgrid.com/v3/mail/send',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer sg.test-key',
        }),
      })
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('"event":"email_delivery_sent"')
    );

    logSpy.mockRestore();
  });

  it('sends via SMTP when mode is smtp', async () => {
    process.env.EMAIL_DELIVERY_MODE = 'smtp';
    process.env.SMTP_USER = 'you@gmail.com';
    process.env.SMTP_PASS = 'abcd efgh ijkl mnop';
    process.env.EMAIL_FROM = 'Neighborhood Helper <you@gmail.com>';

    const sendMail = jest.fn().mockResolvedValue({ messageId: '1' });
    nodemailer.createTransport.mockReturnValue({ sendMail });

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await sendEmail({
      to: 'alice@example.com',
      subject: 'Accepted',
      text: 'Body',
      html: '<p>Body</p>',
    });

    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'you@gmail.com',
          pass: 'abcd efgh ijkl mnop',
        },
      })
    );
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'alice@example.com',
        subject: 'Accepted',
        from: 'Neighborhood Helper <you@gmail.com>',
      })
    );
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('"provider":"smtp"')
    );

    logSpy.mockRestore();
  });
});
