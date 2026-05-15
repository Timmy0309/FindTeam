const { pool } = require('../config/database');

const normalizeMembers = (members = []) =>
  (members || []).map((id) => Number(id));

class Team {
  static async create(teamData) {
    const { name, game, description, max_players, captain_id } = teamData;
    const captainId = Number(captain_id);
    const query = `
      INSERT INTO teams (name, game, description, max_players, captain_id, members, current_players)
      VALUES ($1, $2, $3, $4, $5, ARRAY[$5]::INTEGER[], 1)
      RETURNING *
    `;
    const values = [name, game, description || '', max_players || 5, captainId];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async findAll(filters = {}) {
    let query = `
      SELECT t.*, u.name AS captain_name
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

    if (filters.playersNeeded === 'open') {
      query += ' AND COALESCE(t.current_players, 0) < t.max_players';
    }

    query += ' ORDER BY t.created_at DESC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id) {
    const query = `
      SELECT t.*, u.name AS captain_name
      FROM teams t
      LEFT JOIN users u ON t.captain_id = u.id
      WHERE t.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

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

  static async addMember(teamId, userId) {
    const team = await this.findById(teamId);
    if (!team) return null;

    const uid = Number(userId);
    const members = normalizeMembers(team.members);

    if (members.includes(uid)) {
      return team;
    }

    if (members.length >= team.max_players) {
      const error = new Error('Команда уже заполнена');
      error.status = 400;
      throw error;
    }

    const newMembers = [...members, uid];
    const query = `
      UPDATE teams
      SET members = $1::INTEGER[],
          current_players = COALESCE(array_length($1::INTEGER[], 1), 0),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [newMembers, teamId]);
    return result.rows[0];
  }

  static async removeMember(teamId, userId) {
    const team = await this.findById(teamId);
    if (!team) return null;

    const uid = Number(userId);
    const members = normalizeMembers(team.members).filter((m) => m !== uid);

    const query = `
      UPDATE teams
      SET members = $1::INTEGER[],
          current_players = GREATEST(COALESCE(array_length($1::INTEGER[], 1), 0), 0),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [members, teamId]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM teams WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByUser(userId) {
    const query = `
      SELECT t.*, u.name AS captain_name
      FROM teams t
      LEFT JOIN users u ON t.captain_id = u.id
      WHERE $1 = ANY(t.members)
      ORDER BY t.created_at DESC
    `;
    const result = await pool.query(query, [Number(userId)]);
    return result.rows;
  }

  static isMember(team, userId) {
    return normalizeMembers(team?.members).includes(Number(userId));
  }
}

module.exports = Team;
