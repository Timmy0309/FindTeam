const { pool } = require('../config/database');

const DEFAULT_COLORS = ['#667eea', '#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#95e1d3'];
const DEFAULT_ICONS = ['🎮', '🕹️', '⚔️', '🏆', '🎯', '🔥'];

class Game {
  static async findAll() {
    const result = await pool.query('SELECT * FROM games ORDER BY name ASC');
    return result.rows;
  }

  static async findPopular() {
    const query = `
      SELECT g.*, COUNT(t.id)::int AS team_count
      FROM games g
      INNER JOIN teams t ON t.game = g.name
      GROUP BY g.id
      HAVING COUNT(t.id) > 0
      ORDER BY team_count DESC, g.name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async findByName(name) {
    const result = await pool.query(
      'SELECT * FROM games WHERE LOWER(TRIM(name)) = LOWER(TRIM($1))',
      [name]
    );
    return result.rows[0];
  }

  static async findOrCreate(name) {
    const trimmed = name?.trim();
    if (!trimmed) {
      const error = new Error('Название игры не может быть пустым');
      error.status = 400;
      throw error;
    }

    if (trimmed.length > 100) {
      const error = new Error('Название игры слишком длинное (макс. 100 символов)');
      error.status = 400;
      throw error;
    }

    const existing = await this.findByName(trimmed);
    if (existing) {
      return existing;
    }

    const color = DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)];
    const icon = DEFAULT_ICONS[Math.floor(Math.random() * DEFAULT_ICONS.length)];

    const result = await pool.query(
      `INSERT INTO games (name, icon, color)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [trimmed, icon, color]
    );
    return result.rows[0];
  }
}

module.exports = Game;
