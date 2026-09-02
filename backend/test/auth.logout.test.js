const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/prisma', () => ({
  user: { findUnique: jest.fn() },
}));

const prisma = require('../src/config/prisma');
const authRoutes = require('../src/routes/auth.routes');

const UNAUTHORIZED = { error: 'Unauthorized' };
const FORBIDDEN = { error: 'Forbidden' };
const USER = { id: 1, name: 'Alice', role: 'ADMIN' };
const CSRF_TOKEN = '1-22-333-4444-55555';

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

app.use((err, req, res, _next) => {
  res.status(500).json({ error: err.message });
});

const createToken = () =>
  jwt.sign({ id: USER.id, csrfToken: CSRF_TOKEN }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

const jwtCookie = (res) =>
  (res.headers['set-cookie'] || []).find((c) => c.startsWith('jwt='));

const auditLines = (logSpy) =>
  logSpy.mock.calls
    .map(([line]) => line)
    .filter(
      (line) => typeof line === 'string' && line.includes('logout_attempt')
    );

describe('POST /api/auth/logoff', () => {
  let logSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue(USER);
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
  });

  describe('Successful Session Invalidation', () => {
    it('clears session cookies, logs audit metrics, and returns 200', async () => {
      const res = await request(app)
        .post('/api/auth/logoff')
        .set('Cookie', `jwt=${createToken()}`)
        .set('X-CSRF-TOKEN', CSRF_TOKEN);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ success: true });

      // Verification Coockie Clearing
      const cookie = jwtCookie(res);
      expect(cookie).toBeDefined();
      expect(cookie).toMatch(/jwt=;/);
      expect(cookie).toMatch(/Expires=/);

      // Correct Logout?
      const logs = auditLines(logSpy);
      expect(logs.length).toBe(1);
      expect(JSON.parse(logs)).toMatchObject({
        event: 'logout_attempt',
        outcome: 'success',
        userId: USER.id,
      });
    });
  });

  describe('Security and Guard Layer Validations', () => {
    it('returns 401 early via jwt layer if cookie is missing', async () => {
      const res = await request(app)
        .post('/api/auth/logoff')
        .set('X-CSRF-TOKEN', CSRF_TOKEN);

      expect(res.status).toBe(401);
      expect(res.body).toEqual(UNAUTHORIZED);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('returns 401 if user session state database record is deleted', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/auth/logoff')
        .set('Cookie', `jwt=${createToken()}`)
        .set('X-CSRF-TOKEN', CSRF_TOKEN);

      expect(res.status).toBe(401);
      expect(res.body).toEqual(UNAUTHORIZED);
    });

    it('returns 403 Forbidden early via csrf layer if header token is missing', async () => {
      const res = await request(app)
        .post('/api/auth/logoff')
        .set('Cookie', `jwt=${createToken()}`);

      expect(res.status).toBe(403);
      expect(res.body).toEqual(FORBIDDEN);
    });

    it('returns 403 Forbidden early via csrf layer if header token mismatches', async () => {
      const res = await request(app)
        .post('/api/auth/logoff')
        .set('Cookie', `jwt=${createToken()}`)
        .set('X-CSRF-TOKEN', 'wrong-mismatched-csrf-token');

      expect(res.status).toBe(403);
      expect(res.body).toEqual(FORBIDDEN);
    });
  });
});
