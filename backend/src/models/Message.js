const { pool } = require('../config/database');

class Message {
  // Создание сообщения
  static async create(messageData) {
    const { dialog_id, user_id, message, is_my_message, time } = messageData;
    const query = `
      INSERT INTO messages (dialog_id, user_id, message, is_my_message, time)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [dialog_id, user_id, message, is_my_message || false, time || new Date().toLocaleTimeString()];
    const result = await pool.query(query, values);
    
    // Обновляем последнее сообщение в диалоге
    await this.updateDialogLastMessage(dialog_id, message);
    
    return result.rows[0];
  }

  // Получение сообщений диалога
  static async findByDialog(dialogId) {
    const query = `
      SELECT m.*, u.name as author_name, u.avatar
      FROM messages m
      LEFT JOIN users u ON m.user_id = u.id
      WHERE m.dialog_id = $1
      ORDER BY m.created_at ASC
    `;
    const result = await pool.query(query, [dialogId]);
    return result.rows;
  }

  // Обновление последнего сообщения в диалоге
  static async updateDialogLastMessage(dialogId, message) {
    const query = `
      UPDATE dialogs 
      SET last_message = $1,
          last_message_time = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    await pool.query(query, [message, dialogId]);
  }

  // Удаление сообщения
  static async delete(id) {
    const query = 'DELETE FROM messages WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Создание диалога между пользователями
  static async createDialog(user1Id, user2Id) {
    // Проверяем, существует ли уже диалог
    const checkQuery = `
      SELECT * FROM dialogs 
      WHERE (user1_id = $1 AND user2_id = $2) 
         OR (user1_id = $2 AND user2_id = $1)
    `;
    const checkResult = await pool.query(checkQuery, [user1Id, user2Id]);
    
    if (checkResult.rows[0]) {
      return checkResult.rows[0];
    }
    
    const query = `
      INSERT INTO dialogs (user1_id, user2_id)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(query, [user1Id, user2Id]);
    return result.rows[0];
  }

  // Получение диалогов пользователя
  static async getUserDialogs(userId) {
    const query = `
      SELECT d.*, 
             u1.name as user1_name, u1.avatar as user1_avatar,
             u2.name as user2_name, u2.avatar as user2_avatar
      FROM dialogs d
      LEFT JOIN users u1 ON d.user1_id = u1.id
      LEFT JOIN users u2 ON d.user2_id = u2.id
      WHERE d.user1_id = $1 OR d.user2_id = $1
      ORDER BY d.last_message_time DESC NULLS LAST
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

module.exports = Message;