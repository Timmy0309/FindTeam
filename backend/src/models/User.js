const { pool } = require('../config/database');
const bcrypt = require('bcrypt');

class User {
  // Создание пользователя
  static async create(userData) {
    const { name, email, password, avatar } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const query = `
      INSERT INTO users (name, email, password, avatar)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, avatar, roles, rights, created_at
    `;
    
    const values = [name, email, hashedPassword, avatar || name.charAt(0)];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Поиск пользователя по email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  // Поиск пользователя по id
  static async findById(id) {
    const query = 'SELECT id, name, email, avatar, roles, rights, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Получение всех пользователей
  static async findAll() {
    const query = 'SELECT id, name, email, avatar, created_at FROM users ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Обновление пользователя
  static async update(id, userData) {
    const { name, avatar } = userData;
    const query = `
      UPDATE users 
      SET name = COALESCE($1, name),
          avatar = COALESCE($2, avatar),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING id, name, email, avatar, roles, rights
    `;
    const values = [name, avatar, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Удаление пользователя
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Проверка пароля
  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;