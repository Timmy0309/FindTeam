const { validateEnv } = require('./config/validateEnv');
const { pool, createTables } = require('./config/database');
const { createApp } = require('./app');

validateEnv();

const app = createApp();
const PORT = process.env.PORT || 5000;

const waitForDatabase = async (retries = 30, delay = 2000) => {
  for (let i = 0; i < retries; i += 1) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (error) {
      console.log(`Ожидание PostgreSQL... (${i + 1}/${retries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error('Не удалось подключиться к PostgreSQL');
};

const startServer = async () => {
  try {
    await waitForDatabase();
    await createTables();
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка при запуске сервера:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
