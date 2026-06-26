const { createApp } = require('../../src/app');
const { pool, createTables } = require('../../src/config/database');

let app;
let dbReady = false;

const checkDbConnection = async () => {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
};

const initTestApp = async () => {
  const connected = await checkDbConnection();
  if (!connected) {
    throw new Error(
      'PostgreSQL недоступен. Запустите: docker-compose up -d db или createdb gameteam_db'
    );
  }

  if (!app) {
    await createTables();
    app = createApp();
    dbReady = true;
  }
  return app;
};

const getAppWithoutDb = () => createApp();

const registerUser = async (request, suffix = Date.now()) => {
  const email = `fuzz_user_${suffix}@test.local`;
  const password = 'TestPass123!';
  const response = await request
    .post('/api/users/register')
    .send({ name: `FuzzUser${suffix}`, email, password });

  return { response, email, password };
};

const loginUser = async (request, email, password) => {
  const response = await request
    .post('/api/users/login')
    .send({ email, password });

  return response;
};

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const setUserRights = async (userId, rights) => {
  await pool.query('UPDATE users SET rights = $1 WHERE id = $2', [rights, userId]);
};

const setUserRoles = async (userId, roles) => {
  await pool.query('UPDATE users SET roles = $1 WHERE id = $2', [roles, userId]);
};

const cleanupFuzzUsers = async () => {
  if (!dbReady) return;
  await pool.query("DELETE FROM users WHERE email LIKE 'fuzz_%@test.local'");
};

const describeIfDb = (name, fn) => {
  describe(name, () => {
    let skipSuite = false;

    beforeAll(async () => {
      try {
        await initTestApp();
      } catch (error) {
        skipSuite = true;
        console.warn(`[SKIP] ${name}: ${error.message}`);
      }
    });

    fn(() => skipSuite);
  });
};

module.exports = {
  initTestApp,
  getAppWithoutDb,
  checkDbConnection,
  isDbAvailable: () => dbReady,
  registerUser,
  loginUser,
  authHeader,
  setUserRights,
  setUserRoles,
  cleanupFuzzUsers,
  describeIfDb,
  pool,
};
