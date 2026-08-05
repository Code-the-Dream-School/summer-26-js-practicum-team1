const request = require('supertest');
const bcrypt = require('bcrypt');

jest.mock('../src/config/prisma', () => ({
  user: { findUnique: jest.fn(), update: jest.fn() },
}));

const prisma = require('../src/config/prisma');
const app = require('../src/app');

const PASSWORD = 'Correct-password!';
const CREDENTIALS = { email: 'alice@example.com', password: PASSWORD };
const UNAUTHORIZED = { error: 'Unauthorized' };

let mockUser;
let logSpy;

const getJwtCookie = (res) =>
  (res.headers['set-cookie'] || []).find((c) => c.startsWith('jwt='));

beforeAll(async () => {
  const passwordHash = await bcrypt.hash(PASSWORD, 4);
  mockUser = {
    id: 7,
    name: 'Alice',
    role: 'ADMIN',
    passwordHash,
    failedLoginAttempts: 0,
    lockedUntil: null,
  };
});

beforeEach(() => {
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.clearAllMocks();
});

afterEach(() => {
  logSpy.mockRestore();
});

describe('GET /api/auth/me', () => {
  
  describe('when the user is successfully authenticated', () => {
    let authCookie;
    let loginResponsePayload;

    beforeEach(async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      
      const loginRes = await request(app).post('/api/auth/logon').send(CREDENTIALS);
      authCookie = getJwtCookie(loginRes);
      loginResponsePayload = loginRes.body;
    });

    it('returns the same shape and data payload as the logon response', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(loginResponsePayload);
      expect(res.body).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        role: 'admin',
        csrfToken: loginResponsePayload.csrfToken,
      });
    });

    it('includes the exact csrfToken issued during the logon session', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie);

      expect(res.body.csrfToken).toBeDefined();
      expect(res.body.csrfToken).toBe(loginResponsePayload.csrfToken);
    });

    it('sets the Cache-Control: no-store header', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie);

      expect(res.headers['cache-control']).toBe('no-store');
    });

    it('never leaks the password hash and restricts keys to the public profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie);

      expect(res.body.passwordHash).toBeUndefined();
      expect(Object.keys(res.body).sort()).toEqual([
        'csrfToken',
        'id',
        'name',
        'role',
      ]);
    });
  });

  describe('when authentication fails or is revoked', () => {
    it('returns 401 when no session cookie is present', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body).toEqual(UNAUTHORIZED);
    });

    it('returns 401 when a malformed session cookie is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'jwt=not-a-real-token');

      expect(res.status).toBe(401);
      expect(res.body).toEqual(UNAUTHORIZED);
    });

    it('returns 401 if the user record is deleted mid-session', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);
      const loginRes = await request(app).post('/api/auth/logon').send(CREDENTIALS);
      
      prisma.user.findUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', getJwtCookie(loginRes));

      expect(res.status).toBe(401);
      expect(res.body).toEqual(UNAUTHORIZED);
    });
  });
});