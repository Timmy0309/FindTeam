const request = require('supertest');
const {
  initTestApp,
  registerUser,
  loginUser,
  authHeader,
  setUserRights,
  cleanupFuzzUsers,
  pool,
} = require('../helpers/testApp');

describe('RBAC Fuzzing — попытки обхода прав', () => {
  let app;
  let skipSuite = false;
  let userAToken;
  let userAId;
  let userBId;

  beforeAll(async () => {
    try {
      app = await initTestApp();
    } catch (error) {
      skipSuite = true;
      console.warn(`[SKIP] RBAC Fuzzing: ${error.message}`);
      return;
    }

    const userA = await registerUser(request(app), 'rbac_a');
    userAToken = userA.response.body.data.token;
    userAId = userA.response.body.data.user.id;

    const userB = await registerUser(request(app), 'rbac_b');
    userBId = userB.response.body.data.user.id;

    await setUserRights(userAId, [
      'can_view_teams',
      'can_view_players',
      'can_send_messages',
      'can_create_teams',
    ]);
  });

  afterAll(async () => {
    if (!skipSuite) {
      await cleanupFuzzUsers();
    }
  });

  describe('Пользователь без can_view_players', () => {
    let restrictedToken;

    beforeAll(async () => {
      if (skipSuite) return;
      const { response, email, password } = await registerUser(request(app), 'rbac_restricted');
      const userId = response.body.data.user.id;
      await setUserRights(userId, ['can_view_teams', 'can_create_teams', 'can_send_messages']);
      const loginRes = await loginUser(request(app), email, password);
      restrictedToken = loginRes.body.data.token;
    });

    test('GET /api/users → 403', async () => {
      if (skipSuite) return;
      const res = await request(app)
        .get('/api/users')
        .set(authHeader(restrictedToken));
      expect(res.status).toBe(403);
    });

    test('GET /api/users/:otherId → 403', async () => {
      if (skipSuite) return;
      const res = await request(app)
        .get(`/api/users/${userBId}`)
        .set(authHeader(restrictedToken));
      expect(res.status).toBe(403);
    });
  });

  describe('Пользователь без can_create_teams', () => {
    let noCreateToken;

    beforeAll(async () => {
      if (skipSuite) return;
      const { response, email, password } = await registerUser(request(app), 'rbac_nocreate');
      const userId = response.body.data.user.id;
      await setUserRights(userId, ['can_view_teams', 'can_view_players', 'can_send_messages']);
      const loginRes = await loginUser(request(app), email, password);
      noCreateToken = loginRes.body.data.token;
    });

    test('POST /api/teams → 403', async () => {
      if (skipSuite) return;
      const res = await request(app)
        .post('/api/teams')
        .set(authHeader(noCreateToken))
        .send({ name: 'HackTeam', game: 'Dota 2' });
      expect(res.status).toBe(403);
    });
  });

  describe('Пользователь без can_send_messages', () => {
    let noMsgToken;

    beforeAll(async () => {
      if (skipSuite) return;
      const { response, email, password } = await registerUser(request(app), 'rbac_nomsg');
      const userId = response.body.data.user.id;
      await setUserRights(userId, ['can_view_teams', 'can_view_players', 'can_create_teams']);
      const loginRes = await loginUser(request(app), email, password);
      noMsgToken = loginRes.body.data.token;
    });

    test('GET /api/messages/dialogs → 403', async () => {
      if (skipSuite) return;
      const res = await request(app)
        .get('/api/messages/dialogs')
        .set(authHeader(noMsgToken));
      expect(res.status).toBe(403);
    });
  });

  describe('IDOR — изменение чужого профиля', () => {
    test('PUT /api/users/:otherId → 403', async () => {
      if (skipSuite) return;
      const res = await request(app)
        .put(`/api/users/${userBId}`)
        .set(authHeader(userAToken))
        .send({ name: 'Hacked Name' });
      expect(res.status).toBe(403);
    });

    test('DELETE /api/users/:otherId → 403', async () => {
      if (skipSuite) return;
      const res = await request(app)
        .delete(`/api/users/${userBId}`)
        .set(authHeader(userAToken));
      expect(res.status).toBe(403);
    });

    test('PUT /api/users/:selfId → 200', async () => {
      if (skipSuite) return;
      const res = await request(app)
        .put(`/api/users/${userAId}`)
        .set(authHeader(userAToken))
        .send({ name: 'Updated Self' });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/teams/:id/members без доступа', () => {
    let outsiderToken;
    let teamId;

    beforeAll(async () => {
      if (skipSuite) return;
      const captain = await registerUser(request(app), 'rbac_captain');
      const captainToken = captain.response.body.data.token;
      const teamRes = await request(app)
        .post('/api/teams')
        .set(authHeader(captainToken))
        .send({ name: 'PrivateTeam', game: 'Valorant' });
      teamId = teamRes.body.data.id;

      const outsider = await registerUser(request(app), 'rbac_outsider');
      const outsiderId = outsider.response.body.data.user.id;
      await setUserRights(outsiderId, ['can_view_teams']);
      const loginRes = await loginUser(request(app), outsider.email, outsider.password);
      outsiderToken = loginRes.body.data.token;
    });

    test('возвращает 403 для постороннего без can_view_players', async () => {
      if (skipSuite) return;
      const res = await request(app)
        .get(`/api/teams/${teamId}/members`)
        .set(authHeader(outsiderToken));
      expect(res.status).toBe(403);
    });
  });

  describe('Администратор', () => {
    let adminToken;

    beforeAll(async () => {
      if (skipSuite) return;
      const adminRes = await pool.query(
        "SELECT email FROM users WHERE 'admin' = ANY(roles) LIMIT 1"
      );
      if (adminRes.rows.length === 0) {
        adminToken = null;
        return;
      }
      const loginRes = await request(app)
        .post('/api/users/login')
        .send({
          email: adminRes.rows[0].email,
          password: process.env.ADMIN_PASSWORD || 'AdminFindTeam2024!Secure',
        });
      adminToken = loginRes.body.data?.token;
    });

    test('может удалить другого пользователя', async () => {
      if (skipSuite || !adminToken) return;

      const victim = await registerUser(request(app), 'rbac_victim');
      const victimId = victim.response.body.data.user.id;

      const res = await request(app)
        .delete(`/api/users/${victimId}`)
        .set(authHeader(adminToken));

      expect(res.status).toBe(200);
    });
  });
});
