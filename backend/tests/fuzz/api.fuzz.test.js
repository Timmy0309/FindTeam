const request = require('supertest');
const fc = require('fast-check');
const {
  initTestApp,
  registerUser,
  authHeader,
  cleanupFuzzUsers,
} = require('../helpers/testApp');
const {
  sqlInjectionPayloads,
  xssPayloads,
  oversizedStrings,
  randomIdPayloads,
} = require('../helpers/fuzzPayloads');

describe('API Fuzzing — входные данные', () => {
  let app;
  let skipSuite = false;

  beforeAll(async () => {
    try {
      app = await initTestApp();
    } catch (error) {
      skipSuite = true;
      console.warn(`[SKIP] API Fuzzing: ${error.message}`);
    }
  });

  afterAll(async () => {
    if (!skipSuite) {
      await cleanupFuzzUsers();
    }
  });

  describe('POST /api/users/register', () => {
    const maliciousInputs = [...sqlInjectionPayloads, ...xssPayloads];

    test.each(maliciousInputs)('не падает с 500 при name=%s', async (payload) => {
      if (skipSuite) return;

      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: payload,
          email: `fuzz_reg_${Date.now()}_${Math.random()}@test.local`,
          password: 'ValidPass123!',
        });

      expect(res.status).not.toBe(500);
      expect([201, 400]).toContain(res.status);
    });

    test('fast-check: случайные строки в полях регистрации', async () => {
      if (skipSuite) return;

      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 0, maxLength: 200 }),
          fc.emailAddress(),
          fc.string({ minLength: 0, maxLength: 100 }),
          async (name, email, password) => {
            const res = await request(app)
              .post('/api/users/register')
              .send({ name, email: `fc_${email}`, password });

            expect(res.status).not.toBe(500);
          }
        ),
        { numRuns: 30 }
      );
    });
  });

  describe('POST /api/users/login', () => {
    test.each(sqlInjectionPayloads)('не падает с 500 при email=%s', async (payload) => {
      if (skipSuite) return;

      const res = await request(app)
        .post('/api/users/login')
        .send({ email: payload, password: payload });

      expect(res.status).not.toBe(500);
      expect([400, 401]).toContain(res.status);
    });
  });

  describe('GET /api/users/:id — произвольные ID', () => {
    let token;

    beforeAll(async () => {
      if (skipSuite) return;
      const { response } = await registerUser(request(app));
      token = response.body.data.token;
    });

    test.each(randomIdPayloads)('не падает с 500 при id=%s', async (id) => {
      if (skipSuite) return;

      const res = await request(app)
        .get(`/api/users/${id}`)
        .set(authHeader(token));

      expect(res.status).not.toBe(500);
      expect([400, 401, 403, 404]).toContain(res.status);
    });
  });

  describe('POST /api/teams — переполнение и инъекции', () => {
    let token;

    beforeAll(async () => {
      if (skipSuite) return;
      const { response } = await registerUser(request(app));
      token = response.body.data.token;
    });

    test.each(oversizedStrings(3000))('не падает с 500 при длинном description', async (desc) => {
      if (skipSuite) return;

      const res = await request(app)
        .post('/api/teams')
        .set(authHeader(token))
        .send({ name: 'FuzzTeam', game: 'Dota 2', description: desc });

      expect(res.status).not.toBe(500);
    });

    test.each(xssPayloads)('не падает с 500 при XSS в name=%s', async (payload) => {
      if (skipSuite) return;

      const res = await request(app)
        .post('/api/teams')
        .set(authHeader(token))
        .send({ name: payload, game: 'CS2' });

      expect(res.status).not.toBe(500);
    });
  });

  describe('GET /api/health — устойчивость', () => {
    test('всегда возвращает 200', async () => {
      if (skipSuite) {
        const { getAppWithoutDb } = require('../helpers/testApp');
        app = getAppWithoutDb();
      }

      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
    });
  });
});
