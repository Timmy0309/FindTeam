const { pool } = require('../config/database');

class Team {
  // Создание команды
  static async create(teamData) {
    const { name, game, description, max_players, captain_id } = teamData;
    const query = `
      INSERT INTO teams (name, game, description, max_players, captain_id, members)
      VALUES ($1, $2, $3, $4, $5, ARRAY[$5])
      RETURNING *
    `;
    const values = [name, game, description, max_players || 5, captain_id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Получение всех команд
  static async findAll(filters = {}) {
    let query = `
      SELECT t.*, u.name as captain_name 
      FROM teams t
      LEFT JOIN users u ON t.captain_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let valueIndex = 1;

    if (filters.game && filters.game !== 'all') {
      query += ` AND t.game = $${valueIndex}`;
      values.push(filters.game);
      valueIndex++;
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await pool.query(query, values);
    return result.rows;
  }

  // Поиск команды по id
  static async findById(id) {
    const query = `
      SELECT t.*, u.name as captain_name 
      FROM teams t
      LEFT JOIN users u ON t.captain_id = u.id
      WHERE t.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Обновление команды
  static async update(id, teamData) {
    const { name, game, description, max_players } = teamData;
    const query = `
      UPDATE teams 
      SET name = COALESCE($1, name),
          game = COALESCE($2, game),
          description = COALESCE($3, description),
          max_players = COALESCE($4, max_players),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    const values = [name, game, description, max_players, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Добавление участника в команду
  static async addMember(teamId, userId) {
    const team = await this.findById(teamId);
    if (!team) return null;
    
    if (!team.members.includes(userId)) {
      const members = [...team.members, userId];
      const query = `
        UPDATE teams 
        SET members = $1,
            current_players = array_length($1, 1),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      const result = await pool.query(query, [members, teamId]);
      return result.rows[0];
    }
    return team;
  }

  // Удаление участника из команды
  static async removeMember(teamId, userId) {
    const team = await this.findById(teamId);
    if (!team) return null;
    
    const members = team.members.filter(m => m !== userId);
    const query = `
      UPDATE teams 
      SET members = $1,
          current_players = array_length($1, 1),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [members, teamId]);
    return result.rows[0];
  }

  // Удаление команды
  static async delete(id) {
    const query = 'DELETE FROM teams WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Получение команд пользователя
  static async findByUser(userId) {
    const query = `
      SELECT * FROM teams 
      WHERE $1 = ANY(members)
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

module.exports = Team;