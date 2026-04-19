const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Создание таблиц
const createTables = async () => {
  const queries = [
    // Таблица пользователей
    `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      avatar VARCHAR(10),
      roles TEXT[] DEFAULT '{user}',
      rights TEXT[] DEFAULT '{can_view_teams, can_view_players, can_send_messages}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `,
    // Таблица команд
    `
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      game VARCHAR(50) NOT NULL,
      description TEXT,
      max_players INTEGER DEFAULT 5,
      current_players INTEGER DEFAULT 1,
      captain_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      members INTEGER[] DEFAULT ARRAY[]::INTEGER[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `,
    // Таблица сообщений
    `
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      dialog_id INTEGER NOT NULL,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      is_my_message BOOLEAN DEFAULT FALSE,
      time VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `,
    // Таблица диалогов
    `
    CREATE TABLE IF NOT EXISTS dialogs (
      id SERIAL PRIMARY KEY,
      user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      last_message TEXT,
      last_message_time TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `
  ];

  for (const query of queries) {
    try {
      await pool.query(query);
      console.log('Table created successfully');
    } catch (err) {
      console.error('Error creating table:', err);
    }
  }
};

module.exports = { pool, createTables };