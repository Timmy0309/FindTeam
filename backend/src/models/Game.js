const { pool } = require('../config/database');

class Game {
  static async findAll() {
    const result = await pool.query(
      'SELECT * FROM games ORDER BY name ASC'
    );
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
      'SELECT * FROM games WHERE name = $1',
      [name]
    );
    return result.rows[0];
  }
}

module.exports = Game;
