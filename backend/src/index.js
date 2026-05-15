const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { pool, createTables } = require('./config/database');
const userRoutes = require('./routes/users');
const teamRoutes = require('./routes/teams');
const messageRoutes = require('./routes/messages');
const gameRoutes = require('./routes/games');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/games', gameRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Сервер работает' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

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

startServer();
