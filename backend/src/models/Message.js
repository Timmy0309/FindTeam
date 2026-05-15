const { pool } = require('../config/database');
const Team = require('./Team');

class Message {
  static async create(messageData) {
    const { dialog_id, user_id, message, time } = messageData;
    const query = `
      INSERT INTO messages (dialog_id, user_id, message, time)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [
      dialog_id,
      user_id,
      message,
      time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    ];
    const result = await pool.query(query, values);
    await this.updateDialogLastMessage(dialog_id, message);
    return result.rows[0];
  }

  static async findByDialog(dialogId, currentUserId) {
    const query = `
      SELECT m.*, u.name AS author_name, u.avatar
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.dialog_id = $1
      ORDER BY m.created_at ASC
    `;
    const result = await pool.query(query, [dialogId]);
    return result.rows.map((row) => ({
      ...row,
      is_my_message: Number(row.user_id) === Number(currentUserId),
    }));
  }

  static async updateDialogLastMessage(dialogId, message) {
    await pool.query(
      `UPDATE dialogs
       SET last_message = $1, last_message_time = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [message, dialogId]
    );
  }

  static async delete(id, userId) {
    const check = await pool.query('SELECT * FROM messages WHERE id = $1', [id]);
    const msg = check.rows[0];
    if (!msg) return null;
    if (Number(msg.user_id) !== Number(userId)) {
      const error = new Error('Нельзя удалить чужое сообщение');
      error.status = 403;
      throw error;
    }
    const result = await pool.query('DELETE FROM messages WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async findDialogById(dialogId) {
    const result = await pool.query('SELECT * FROM dialogs WHERE id = $1', [dialogId]);
    return result.rows[0];
  }

  static async getDialogWithDetails(dialogId) {
    const query = `
      SELECT d.*,
             u1.name AS user1_name, u1.avatar AS user1_avatar,
             u2.name AS user2_name, u2.avatar AS user2_avatar,
             t.name AS team_name, t.game AS team_game
      FROM dialogs d
      LEFT JOIN users u1 ON d.user1_id = u1.id
      LEFT JOIN users u2 ON d.user2_id = u2.id
      LEFT JOIN teams t ON d.team_id = t.id
      WHERE d.id = $1
    `;
    const result = await pool.query(query, [dialogId]);
    return result.rows[0];
  }

  static async userHasDialogAccess(dialog, userId) {
    if (!dialog) return false;
    const uid = Number(userId);
    const type = dialog.type || 'private';

    if (type === 'team' && dialog.team_id) {
      const team = await Team.findById(dialog.team_id);
      return team && Team.isMember(team, uid);
    }

    return Number(dialog.user1_id) === uid || Number(dialog.user2_id) === uid;
  }

  static async createDialog(user1Id, user2Id) {
    const u1 = Number(user1Id);
    const u2 = Number(user2Id);

    if (!u1 || !u2) {
      const error = new Error('Некорректные данные пользователей');
      error.status = 400;
      throw error;
    }

    if (u1 === u2) {
      const error = new Error('Нельзя создать диалог с самим собой');
      error.status = 400;
      throw error;
    }

    const checkResult = await pool.query(
      `SELECT * FROM dialogs
       WHERE COALESCE(type, 'private') = 'private'
         AND user1_id IS NOT NULL AND user2_id IS NOT NULL
         AND ((user1_id = $1 AND user2_id = $2) OR (user1_id = $2 AND user2_id = $1))`,
      [u1, u2]
    );

    if (checkResult.rows[0]) {
      return this.getDialogWithDetails(checkResult.rows[0].id);
    }

    const result = await pool.query(
      `INSERT INTO dialogs (user1_id, user2_id, type)
       VALUES ($1, $2, 'private')
       RETURNING *`,
      [u1, u2]
    );

    return this.getDialogWithDetails(result.rows[0].id);
  }

  static async createTeamDialog(teamId, teamName) {
    const existing = await pool.query(
      `SELECT * FROM dialogs WHERE COALESCE(type, 'team') = 'team' AND team_id = $1`,
      [teamId]
    );
    if (existing.rows[0]) {
      return this.getDialogWithDetails(existing.rows[0].id);
    }

    const result = await pool.query(
      `INSERT INTO dialogs (team_id, type, last_message)
       VALUES ($1, 'team', $2)
       RETURNING *`,
      [teamId, `Командный чат «${teamName}» создан`]
    );
    return this.getDialogWithDetails(result.rows[0].id);
  }

  static async getTeamDialog(teamId) {
    const result = await pool.query(
      `SELECT * FROM dialogs WHERE COALESCE(type, 'team') = 'team' AND team_id = $1`,
      [teamId]
    );
    if (!result.rows[0]) return null;
    return this.getDialogWithDetails(result.rows[0].id);
  }

  static async getUserDialogs(userId) {
    const uid = Number(userId);
    const query = `
      SELECT d.*,
             u1.name AS user1_name, u1.avatar AS user1_avatar,
             u2.name AS user2_name, u2.avatar AS user2_avatar,
             t.name AS team_name, t.game AS team_game
      FROM dialogs d
      LEFT JOIN users u1 ON d.user1_id = u1.id
      LEFT JOIN users u2 ON d.user2_id = u2.id
      LEFT JOIN teams t ON d.team_id = t.id
      WHERE (
        COALESCE(d.type, 'private') = 'private'
        AND (d.user1_id = $1 OR d.user2_id = $1)
      ) OR (
        COALESCE(d.type, 'private') = 'team'
        AND d.team_id IN (SELECT id FROM teams WHERE $1 = ANY(members))
      )
      ORDER BY d.last_message_time DESC NULLS LAST, d.created_at DESC
    `;
    const result = await pool.query(query, [uid]);
    return result.rows;
  }
}

module.exports = Message;
