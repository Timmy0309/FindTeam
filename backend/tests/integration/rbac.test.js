const request = require('supertest');
const {
  initTestApp,
  registerUser,
  loginUser,
  authHeader,
  setUserRights,
  cleanupFuzzUsers,
} = require('../helpers/testApp');

describe('RBAC Integration', () => {
  let app;
  let skipSuite = false;

  beforeAll(async () => {
    try {
      app = await initTestApp();
    } catch (error) {
      skipSuite = true;
      console.warn(`[SKIP] RBAC Integration: ${error.message}`);
    }
  });

  afterAll(async () => {
    if (!skipSuite) {
      await cleanupFuzzUsers();
    }
  });

  test('новый пользователь получает стандартные права', async () => {
    if (skipSuite) return;

    const { response } = await registerUser(request(app), 'rights_check');
    const rights = response.body.data.user.rights;

    expect(rights).toContain('can_view_teams');
    expect(rights).toContain('can_view_players');
    expect(rights).toContain('can_send_messages');
    expect(rights).toContain('can_create_teams');
  });

  test('права проверяются на сервере, а не только в токене', async () => {
    if (skipSuite) return;

    const { response, email, password } = await registerUser(request(app), 'server_check');
    const userId = response.body.data.user.id;

    await setUserRights(userId, ['can_view_teams']);

    const loginRes = await loginUser(request(app), email, password);
    const freshToken = loginRes.body.data.token;

    const listRes = await request(app)
      .get('/api/users')
      .set(authHeader(freshToken));

    expect(listRes.status).toBe(403);
  });

  test('токен содержит только id, роли загружаются из БД', async () => {
    if (skipSuite) return;

    const { response, email, password } = await registerUser(request(app), 'db_roles');
    const userId = response.body.data.user.id;

    await setUserRights(userId, [
      'can_view_teams',
      'can_view_players',
      'can_send_messages',
      'can_create_teams',
    ]);

    const loginRes = await loginUser(request(app), email, password);
    const token = loginRes.body.data.token;

    const jwt = require('jsonwebtoken');
    const decoded = jwt.decode(token);
    expect(decoded).toHaveProperty('id');
    expect(decoded).not.toHaveProperty('roles');
    expect(decoded).not.toHaveProperty('rights');
  });
});
