const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/prisma', () => ({
  user: { findUnique: jest.fn(), update: jest.fn() },
}));

const prisma = require('../src/config/prisma');
const app = require('../src/app');
const { loginLimiter } = require('../src/routes/auth.routes');
const {
  MAX_FAILED_ATTEMPTS,
  LOCK_DURATION_MS,
} = require('../src/services/auth.service');

const PASSWORD = 'Correct-password!';
const CREDENTIALS = { email: 'alice@example.com', password: PASSWORD };
const AUTH_FAILED = { error: 'Authentication failed' };

const login = (body) => request(app).post('/api/auth/logon').send(body);

const jwtCookie = (res) =>
  (res.headers['set-cookie'] || []).find((c) => c.startsWith('jwt='));

const decodeJwtCookie = (res) => {
  const raw = jwtCookie(res).split('jwt=')[1].split(';')[0];
  return jwt.verify(decodeURIComponent(raw), process.env.JWT_SECRET);
};

const auditLines = (logSpy) =>
  logSpy.mock.calls
    .map(([line]) => line)
    .filter(
      (line) => typeof line === 'string' && line.includes('login_attempt')
    );

let passwordHash;
let user;
let logSpy;

beforeAll(async () => {
  passwordHash = await bcrypt.hash(PASSWORD, 12);
});

beforeEach(() => {
  user = {
    id: 1,
    name: 'Alice',
    role: 'REQUESTER',
    passwordHash,
    failedLoginAttempts: 0,
    lockedUntil: null,
  };
  prisma.user.update.mockResolvedValue({});
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});

  ['::ffff:127.0.0.1', '127.0.0.1', '::1'].forEach((ip) =>
    loginLimiter.resetKey(ip)
  );
});

afterEach(() => jest.restoreAllMocks());

describe('POST /api/auth/logon — successful login', () => {
  beforeEach(() => prisma.user.findUnique.mockResolvedValue(user));

  it('returns the client session and no sensitive fields', async () => {
    const res = await login(CREDENTIALS);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 1,
      name: 'Alice',
      role: 'requester',
      csrfToken: expect.any(String),
    });
    expect(res.body).not.toHaveProperty('passwordHash');
    expect(JSON.stringify(res.body)).not.toContain(PASSWORD);
  });

  it('sets an httpOnly JWT cookie with the dev-appropriate flags', async () => {
    const cookie = jwtCookie(await login(CREDENTIALS));

    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/SameSite=Lax/);
    expect(cookie).not.toMatch(/Secure/);
  });

  it('issues a JWT that expires in one hour and carries the CSRF token', async () => {
    const res = await login(CREDENTIALS);
    const payload = decodeJwtCookie(res);

    expect(payload.id).toBe(1);
    expect(payload.exp - payload.iat).toBe(3600);
    expect(payload.csrfToken).toBe(res.body.csrfToken);
  });

  it('marks the response uncacheable', async () => {
    const res = await login(CREDENTIALS);
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('looks the user up by normalised email', async () => {
    await login({ email: '  ALICE@Example.COM  ', password: PASSWORD });

    expect(prisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { email: 'alice@example.com' } })
    );
  });

  it('clears a stale failure count on success', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...user,
      failedLoginAttempts: 3,
    });

    await login(CREDENTIALS);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { failedLoginAttempts: 0, lockedUntil: null },
    });
  });

  it('skips the write when there is nothing to clear', async () => {
    await login(CREDENTIALS);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});

describe('POST /api/auth/logon — invalid credentials', () => {
  it('rejects a wrong password without issuing a cookie', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    const res = await login({ ...CREDENTIALS, password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body).toEqual(AUTH_FAILED);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  it('increments the failure count on a wrong password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...user,
      failedLoginAttempts: 2,
    });

    await login({ ...CREDENTIALS, password: 'wrong-password' });

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { failedLoginAttempts: 3, lockedUntil: null },
    });
  });

  it('rejects an unknown email without touching the database', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await login({
      email: 'bob@example.com',
      password: PASSWORD,
    });

    expect(res.status).toBe(401);
    expect(res.body).toEqual(AUTH_FAILED);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('answers identically whether or not the email exists', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    const wrongPassword = await login({ ...CREDENTIALS, password: 'nope' });

    prisma.user.findUnique.mockResolvedValue(null);
    const unknownEmail = await login({
      email: 'bob@example.com',
      password: 'nope',
    });

    expect(unknownEmail.status).toBe(wrongPassword.status);
    expect(unknownEmail.body).toEqual(wrongPassword.body);
  });
});

describe('POST /api/auth/logon — account lockout', () => {
  it('does not lock while below the threshold', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...user,
      failedLoginAttempts: MAX_FAILED_ATTEMPTS - 2,
    });

    const res = await login({ ...CREDENTIALS, password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(prisma.user.update.mock.calls[0][0].data.lockedUntil).toBeNull();
  });

  it('locks the account on the final permitted failure', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...user,
      failedLoginAttempts: MAX_FAILED_ATTEMPTS - 1,
    });

    const before = Date.now();
    const res = await login({ ...CREDENTIALS, password: 'wrong-password' });

    expect(res.status).toBe(423);
    expect(res.body.error).toMatch(/locked/i);

    const { data } = prisma.user.update.mock.calls[0][0];
    expect(data.failedLoginAttempts).toBe(0);
    expect(data.lockedUntil.getTime()).toBeGreaterThanOrEqual(
      before + LOCK_DURATION_MS
    );
    expect(data.lockedUntil.getTime()).toBeLessThanOrEqual(
      Date.now() + LOCK_DURATION_MS
    );
  });

  it('refuses a locked account even with the correct password', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...user,
      lockedUntil: new Date(Date.now() + 60_000),
    });

    const res = await login(CREDENTIALS);

    expect(res.status).toBe(423);
    expect(res.headers['set-cookie']).toBeUndefined();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('lets the user back in once the lock has expired', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...user,
      lockedUntil: new Date(Date.now() - 1000),
    });

    const res = await login(CREDENTIALS);

    expect(res.status).toBe(200);
    expect(jwtCookie(res)).toBeDefined();
  });
});

describe('POST /api/auth/logon — malformed input', () => {
  const cases = [
    ['missing email', { password: PASSWORD }, ['email']],
    ['missing password', { email: 'alice@example.com' }, ['password']],
    [
      'empty password',
      { email: 'alice@example.com', password: '' },
      ['password'],
    ],
    [
      'malformed email',
      { email: 'not-an-email', password: PASSWORD },
      ['email'],
    ],
    ['empty body', {}, ['email', 'password']],
    [
      'password beyond bcrypt 72-byte limit',
      { email: 'alice@example.com', password: 'x'.repeat(73) },
      ['password'],
    ],
  ];

  it.each(cases)(
    'rejects %s with a structured 400',
    async (_label, body, expectedFields) => {
      const res = await login(body);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(prisma.user.findUnique).not.toHaveBeenCalled();

      expect(res.body.details).toEqual(
        expectedFields.map((field) => ({
          field,
          message: expect.any(String),
        }))
      );
    }
  );

  it('does not leak the submitted password in validation details', async () => {
    const res = await login({ email: 'not-an-email', password: PASSWORD });

    expect(res.status).toBe(400);
    expect(JSON.stringify(res.body)).not.toContain(PASSWORD);
  });
});

describe('POST /api/auth/logon — server errors', () => {
  it('returns a generic 500 that hides the underlying failure', async () => {
    prisma.user.findUnique.mockRejectedValue(
      new Error('connect ECONNREFUSED 10.0.0.5:5432')
    );

    const res = await login(CREDENTIALS);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Internal server error',
    });
    expect(JSON.stringify(res.body)).not.toContain('10.0.0.5');
  });
});

describe('POST /api/auth/logon — rate limiting', () => {
  it('throttles repeated failures with a 429', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    const attempt = () =>
      login({ email: 'bob@example.com', password: 'wrong-password' });

    for (let i = 0; i < 10; i += 1) {
      expect((await attempt()).status).toBe(401);
    }

    const throttled = await attempt();
    expect(throttled.status).toBe(429);
    expect(throttled.body.error).toMatch(/too many/i);
  }, 30_000);

  it('does not count successful logins toward the limit', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    for (let i = 0; i < 11; i += 1) {
      expect((await login(CREDENTIALS)).status).toBe(200);
    }
  }, 30_000);
});

describe('POST /api/auth/logon — audit logging', () => {
  it('records a success without the password or the JWT', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    const res = await login(CREDENTIALS);
    const [line] = auditLines(logSpy);

    expect(JSON.parse(line)).toMatchObject({
      event: 'login_attempt',
      outcome: 'success',
      userId: 1,
      email: 'alice@example.com',
    });
    expect(line).not.toContain(PASSWORD);
    expect(line).not.toContain(jwtCookie(res).split('jwt=')[1].split(';')[0]);
  });

  it.each([
    ['bad_password', () => prisma.user.findUnique.mockResolvedValue(user)],
    ['unknown_email', () => prisma.user.findUnique.mockResolvedValue(null)],
  ])('records a %s failure', async (outcome, arrange) => {
    arrange();

    await login({ ...CREDENTIALS, password: 'wrong-password' });
    const [line] = auditLines(logSpy);

    expect(JSON.parse(line)).toMatchObject({ event: 'login_attempt', outcome });
    expect(line).not.toContain('wrong-password');
  });
});
