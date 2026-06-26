const request = require('supertest');
const fc = require('fast-check');
const { getAppWithoutDb } = require('../helpers/testApp');
const { malformedJwtTokens } = require('../helpers/fuzzPayloads');

describe('Auth Fuzzing — JWT, CORS, заголовки (без БД)', () => {
  const app = getAppWithoutDb();

  describe('Защищённые эндпоинты без токена', () => {
    const protectedEndpoints = [
      { method: 'get', path: '/api/users' },
      { method: 'get', path: '/api/users/1' },
      { method: 'get', path: '/api/teams/my' },
      { method: 'post', path: '/api/teams' },
      { method: 'get', path: '/api/messages/dialogs' },
    ];

    test.each(protectedEndpoints)('$method $path → 401 без токена', async ({ method, path }) => {
      const res = await request(app)[method](path);
      expect(res.status).toBe(401);
    });
  });

  describe('Некорректные JWT-токены', () => {
    test.each(malformedJwtTokens)('отклоняет токен: %s', async (token) => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', token ? `Bearer ${token}` : '');

      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });

    test('fast-check: случайные строки в Authorization', async () => {
      await fc.assert(
        fc.asyncProperty(fc.string({ minLength: 0, maxLength: 500 }), async (randomToken) => {
          const res = await request(app)
            .get('/api/users')
            .set('Authorization', `Bearer ${randomToken}`);

          expect([401, 403]).toContain(res.status);
        }),
        { numRuns: 25 }
      );
    });
  });

  describe('CORS — неразрешённый origin', () => {
    test('блокирует запрос с чужого origin', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://evil-attacker.example.com');

      expect(res.status).toBe(403);
    });

    test('разрешает запрос с localhost:3000', async () => {
      const res = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000');

      expect(res.status).toBe(200);
    });
  });

  describe('Невалидный JSON body', () => {
    test('не падает с необработанной ошибкой', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .set('Content-Type', 'application/json')
        .send('{"email": broken json');

      expect(res.status).not.toBe(200);
    });
  });
});
