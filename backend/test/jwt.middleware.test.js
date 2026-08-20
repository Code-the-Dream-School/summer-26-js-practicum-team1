const express = require('express');
const cookieParser = require('cookie-parser');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/config/prisma', () => ({
  user: { findUnique: jest.fn(), update: jest.fn() },
}));

const prisma = require('../src/config/prisma');
const jwtMiddleware = require('../src/middleware/jwt.middleware');

const UNAUTHORIZED = { error: 'Unauthorized' };
const USER = { id: 1, name: 'Alice', role: 'ADMIN' };
const CSRF_TOKEN = '1-22-333-4444-55555';

const app = express();
app.use(cookieParser());
app.use('/protected', jwtMiddleware, (req, res) => {
  res.status(200).json({ user: req.user, auth: req.auth });
});
app.use((err, req, res, _next) => {
  res.status(500).json({ error: err.message });
});

const sign = (payload, options = {}, secret = process.env.JWT_SECRET) =>
  jwt.sign(payload, secret, { expiresIn: '1h', ...options });

const validToken = () => sign({ id: USER.id, csrfToken: CSRF_TOKEN });

const get = (token) => {
  const req = request(app).get('/protected');
  return token === undefined ? req : req.set('Cookie', `jwt=${token}`);
};

describe('jwt middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prisma.user.findUnique.mockResolvedValue(USER);
  });

  describe('Successful Authentication', () => {
    it('allows a request with a valid token and attaches the user payload', async () => {
      const res = await get(validToken());

      expect(res.status).toBe(200);
      expect(res.body.user).toEqual(USER);
      expect(res.body.auth).toEqual({ csrfToken: CSRF_TOKEN });
    });

    it('looks up user securely by id selecting safe database fields only', async () => {
      await get(validToken());

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: USER.id },
        select: {
          id: true,
          name: true,
          role: true,
          volunteerProfile: { select: { verificationStatus: true } },
        },
      });
    });
  });

  describe('Token Structural & Cryptographic Rejections', () => {
    it('rejects a request with no jwt cookie present', async () => {
      const res = await get();

      expect(res.status).toBe(401);
      expect(res.body).toEqual(UNAUTHORIZED);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('rejects an expired token session', async () => {
      const res = await get(
        sign({ id: USER.id, csrfToken: CSRF_TOKEN }, { expiresIn: '-1s' })
      );

      expect(res.status).toBe(401);
      expect(res.body).toEqual(UNAUTHORIZED);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('rejects a token with a tampered cryptographic signature string', async () => {
      const [header, payload, signature] = validToken().split('.');
      const flipped =
        signature.slice(0, -1) + (signature.at(-1) === 'A' ? 'B' : 'A');
      const res = await get(`${header}.${payload}.${flipped}`);

      expect(res.status).toBe(401);
      expect(res.body).toEqual(UNAUTHORIZED);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('rejects a token with a modified structural base64 payload', async () => {
      const [header, , signature] = validToken().split('.');
      const payload = Buffer.from(
        JSON.stringify({ id: 999, csrfToken: CSRF_TOKEN })
      ).toString('base64url');
      const res = await get(`${header}.${payload}.${signature}`);

      expect(res.status).toBe(401);
      expect(res.body).toEqual(UNAUTHORIZED);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('rejects a token signed with an invalid external secret key', async () => {
      const res = await get(
        sign({ id: USER.id, csrfToken: CSRF_TOKEN }, {}, 'a-different-secret')
      );

      expect(res.status).toBe(401);
      expect(res.body).toEqual(UNAUTHORIZED);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('rejects an unverified token exploiting the algorithm none vector', async () => {
      const res = await get(
        jwt.sign({ id: USER.id, csrfToken: CSRF_TOKEN }, '', {
          algorithm: 'none',
        })
      );

      expect(res.status).toBe(401);
      expect(res.body).toEqual(UNAUTHORIZED);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('Data Integrity & Business Validation Rules', () => {
    it('rejects a valid token whose respective database record was deleted', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await get(validToken());

      expect(res.status).toBe(401);
      expect(res.body).toEqual(UNAUTHORIZED);
    });

    it('rejects a token using type injection for non-integer user ids', async () => {
      const res = await get(sign({ id: 'abc', csrfToken: CSRF_TOKEN }));

      expect(res.status).toBe(401);
      expect(res.body).toEqual(UNAUTHORIZED);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });

    it('rejects a token missing the strict csrfToken context claim', async () => {
      const res = await get(sign({ id: USER.id }));

      expect(res.status).toBe(401);
      expect(res.body).toEqual(UNAUTHORIZED);
      expect(prisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('Error Masking and Defensive Security Assertions', () => {
    it('ensures no granular debugging or failure reasons leak in responses', async () => {
      const responses = await Promise.all([
        get(),
        get(sign({ id: USER.id, csrfToken: CSRF_TOKEN }, { expiresIn: '-1s' })),
        get(sign({ id: USER.id, csrfToken: CSRF_TOKEN }, {}, 'wrong-secret')),
      ]);

      for (const res of responses) {
        expect(res.status).toBe(401);
        expect(Object.keys(res.body)).toEqual(['error']);
        expect(res.body.error).toBe('Unauthorized');
      }
    });

    it('routes operational database infrastructure failures to the error handler', async () => {
      prisma.user.findUnique.mockRejectedValue(new Error('connection lost'));
      const res = await get(validToken());
      expect(res.status).toBe(500);
    });

    it('routes a critical app misconfiguration to the global error handler', async () => {
      const token = validToken();

      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      try {
        const res = await get(token);
        expect(res.status).toBe(500);
      } finally {
        process.env.JWT_SECRET = originalSecret;
      }
    });
  });
});
