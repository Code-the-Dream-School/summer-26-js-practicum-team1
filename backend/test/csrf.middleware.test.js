const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/prisma', () => ({
  user: { findUnique: jest.fn(), update: jest.fn() },
}));

const prisma = require('../src/config/prisma');
const jwtMiddleware = require('../src/middleware/jwt.middleware');
const csrfMiddleware = require('../src/middleware/csrf.middleware');

const FORBIDDEN = { error: 'Forbidden' };
const USER = { id: 1, name: 'Alice', role: 'ADMIN' };
const CSRF_TOKEN = '1-22-333-4444-55555';

const ok = (req, res) => res.status(200).json({ ok: true });

const app = express();
app.use(cookieParser());
app.use('/guarded', jwtMiddleware, csrfMiddleware, ok);
app.use('/unauthed', csrfMiddleware, ok);
app.use((err, req, res, _next) => {
  res.status(500).json({ error: err.message });
});

const createToken = () =>
  jwt.sign({ id: USER.id, csrfToken: CSRF_TOKEN }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

const sendAuthenticatedRequest = (method, path = '/guarded') =>
  request(app)[method](path).set('Cookie', `jwt=${createToken()}`);

const STATE_CHANGING = ['post', 'put', 'patch', 'delete'];

describe('csrf middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue(USER);
  });

  describe('state-changing requests', () => {
    it.each(STATE_CHANGING)(
      '%s succeeds with a valid header',
      async (method) => {
        const res = await sendAuthenticatedRequest(method).set(
          'X-CSRF-TOKEN',
          CSRF_TOKEN
        );

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ ok: true });
      }
    );

    it.each(STATE_CHANGING)('%s is rejected with no header', async (method) => {
      const res = await sendAuthenticatedRequest(method);

      expect(res.status).toBe(403);
      expect(res.body).toEqual(FORBIDDEN);
    });

    it.each(STATE_CHANGING)(
      '%s is rejected with a mismatched header',
      async (method) => {
        const res = await sendAuthenticatedRequest(method).set(
          'X-CSRF-TOKEN',
          'not-the-token'
        );

        expect(res.status).toBe(403);
        expect(res.body).toEqual(FORBIDDEN);
      }
    );

    it('is rejected with an empty header', async () => {
      const res = await sendAuthenticatedRequest('post').set(
        'X-CSRF-TOKEN',
        ''
      );

      expect(res.status).toBe(403);
      expect(res.body).toEqual(FORBIDDEN);
    });

    it('is rejected when the token is a partial prefix match', async () => {
      const res = await sendAuthenticatedRequest('post').set(
        'X-CSRF-TOKEN',
        CSRF_TOKEN.slice(0, -1)
      );

      expect(res.status).toBe(403);
      expect(res.body).toEqual(FORBIDDEN);
    });

    it('accepts the header regardless of header key casing variations', async () => {
      const res = await sendAuthenticatedRequest('post').set(
        'x-csrf-token',
        CSRF_TOKEN
      );

      expect(res.status).toBe(200);
    });

    it('rejects when header structure is manipulated with non-string inputs', async () => {
      const res = await sendAuthenticatedRequest('post').set('X-CSRF-TOKEN', [
        'token1',
        'token2',
      ]);

      expect(res.status).toBe(403);
      expect(res.body).toEqual(FORBIDDEN);
    });
  });

  describe('safe methods are exempt', () => {
    it('GET succeeds with no csrf header', async () => {
      const res = await sendAuthenticatedRequest('get');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ ok: true });
    });

    it('GET succeeds even with a wrong csrf header', async () => {
      const res = await sendAuthenticatedRequest('get').set(
        'X-CSRF-TOKEN',
        'wrong'
      );

      expect(res.status).toBe(200);
    });

    it('OPTIONS succeeds with no csrf header', async () => {
      const res = await sendAuthenticatedRequest('options');

      expect(res.status).toBe(200);
    });

    it('HEAD is exempt without needing an active authenticated user session', async () => {
      const res = await request(app).head('/unauthed');

      expect(res.status).toBe(200);
    });
  });

  describe('without a preceding jwt middleware context', () => {
    it('drops connection with 403 rather than crashing when req.auth is missing', async () => {
      const res = await request(app)
        .post('/unauthed')
        .set('X-CSRF-TOKEN', CSRF_TOKEN);

      expect(res.status).toBe(403);
      expect(res.body).toEqual(FORBIDDEN);
    });
  });

  describe('interaction with preceding middleware chain', () => {
    it('rejects with 401 early if jwt token evaluation stops processing ahead of csrf middleware', async () => {
      const res = await request(app)
        .post('/guarded')
        .set('X-CSRF-TOKEN', CSRF_TOKEN);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });
  });
});
