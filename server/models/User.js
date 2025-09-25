const db = require('../db');
const bcrypt = require('bcryptjs');

class User {
  static async create({ username, password }) {
    const hash = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (username, password, level, points, petType)
       VALUES ($1, $2, 1, 0, 'cat')
       RETURNING id, username`,
      [username, hash]
    );
    return result.rows[0];
  }

  static async findByUsername(username) {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  }

  static async verifyPassword(user, password) {
    if (!user || !user.password) {
      return false;
    }
    return bcrypt.compare(password, user.password);
  }
}

module.exports = User;
