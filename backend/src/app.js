const express = require('express');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/users');
const teamRoutes = require('./routes/teams');
const messageRoutes = require('./routes/messages');
const gameRoutes = require('./routes/games');

const createApp = () => {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Запрос заблокирован политикой CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  app.use('/api/users', userRoutes);
  app.use('/api/teams', teamRoutes);
  app.use('/api/messages', messageRoutes);
  app.use('/api/games', gameRoutes);

  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Сервер работает' });
  });

  app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      return res.status(400).json({ error: 'Некорректный JSON' });
    }
    if (err.message === 'Запрос заблокирован политикой CORS') {
      return res.status(403).json({ error: 'Запрос заблокирован политикой CORS' });
    }
    console.error(err.stack);
    return res.status(500).json({ error: 'Что-то пошло не так!' });
  });

  return app;
};

module.exports = { createApp };
