const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const DEFAULT_RIGHTS = [
  'can_view_teams',
  'can_view_players',
  'can_send_messages',
  'can_create_teams',
];

const seedGames = async () => {
  const games = [
    { name: 'Dota 2', icon: '🎮', color: '#ff6b6b' },
    { name: 'CS2', icon: '🔫', color: '#4ecdc4' },
    { name: 'Valorant', icon: '🎯', color: '#ffe66d' },
    { name: 'League of Legends', icon: '⭐', color: '#a8e6cf' },
    { name: 'Apex Legends', icon: '🏔️', color: '#95e1d3' },
  ];

  for (const game of games) {
    await pool.query(
      `INSERT INTO games (name, icon, color)
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO NOTHING`,
      [game.name, game.icon, game.color]
    );
  }
};

const createTables = async () => {
  const queries = [
    `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      avatar VARCHAR(10),
      roles TEXT[] DEFAULT '{user}',
      rights TEXT[] DEFAULT '{can_view_teams,can_view_players,can_send_messages,can_create_teams}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `,
    `
    CREATE TABLE IF NOT EXISTS games (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      icon VARCHAR(10) DEFAULT '🎮',
      color VARCHAR(20) DEFAULT '#667eea',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `,
    `
    CREATE TABLE IF NOT EXISTS teams (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      game VARCHAR(100) NOT NULL,
      description TEXT,
      max_players INTEGER DEFAULT 5,
      current_players INTEGER DEFAULT 1,
      captain_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      members INTEGER[] DEFAULT ARRAY[]::INTEGER[],
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `,
    `
    CREATE TABLE IF NOT EXISTS dialogs (
      id SERIAL PRIMARY KEY,
      user1_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      user2_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
      type VARCHAR(20) DEFAULT 'private',
      last_message TEXT,
      last_message_time TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `,
    `
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      dialog_id INTEGER NOT NULL REFERENCES dialogs(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      message TEXT NOT NULL,
      time VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `,
  ];

  for (const query of queries) {
    try {
      await pool.query(query);
    } catch (err) {
      console.error('Error creating table:', err.message);
    }
  }

  const alterQueries = [
    `ALTER TABLE dialogs ADD COLUMN IF NOT EXISTS team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE`,
    `ALTER TABLE dialogs ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'private'`,
    `ALTER TABLE dialogs ALTER COLUMN user1_id DROP NOT NULL`,
    `ALTER TABLE dialogs ALTER COLUMN user2_id DROP NOT NULL`,
    `ALTER TABLE messages DROP COLUMN IF EXISTS is_my_message`,
    `ALTER TABLE users ALTER COLUMN rights SET DEFAULT '{can_view_teams,can_view_players,can_send_messages,can_create_teams}'`,
  ];

  for (const query of alterQueries) {
    try {
      await pool.query(query);
    } catch (err) {
      // ignore migration errors for fresh installs
    }
  }

  try {
    await pool.query(`
      UPDATE users
      SET rights = (
        SELECT ARRAY(
          SELECT DISTINCT unnest(COALESCE(rights, '{}') || $1::text[])
        )
      )
      WHERE NOT ('can_create_teams' = ANY(COALESCE(rights, '{}')))
    `, [DEFAULT_RIGHTS]);
  } catch (err) {
    console.error('Error updating user rights:', err.message);
  }

  await seedGames();
  await seedAdminUser();
};

const seedAdminUser = async () => {
  const bcrypt = require('bcrypt');
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@findteam.local';
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminFindTeam2024!Secure';

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail]);
  if (existing.rows.length > 0) {
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  await pool.query(
    `INSERT INTO users (name, email, password, avatar, roles, rights)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      'Администратор',
      adminEmail,
      hashedPassword,
      'A',
      ['admin', 'user'],
      [
        'can_view_teams',
        'can_view_players',
        'can_send_messages',
        'can_create_teams',
        'can_manage_users',
      ],
    ]
  );
  console.log(`Создан администратор: ${adminEmail}`);
};

module.exports = { pool, createTables, DEFAULT_RIGHTS, seedAdminUser };
