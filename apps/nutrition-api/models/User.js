import "@nutrition-app/types";
import db from '../db/index.js';
import bcrypt from 'bcrypt';

class User {
  /**
   * Create a new user and return their profile.
   * @param {{ username: string, password: string }} credentials
   * @returns {Promise<User>} The full user object
   */
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
  /**
     * Find a user by their username.
     * @param {string} username
     * @returns {Promise<User | undefined>} The full user object or undefined
     */
  static async findByUsername(username) {
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    return result.rows[0];
  }
  /**
     * Verify a user's password.
     * @param {User} user The user object (including hashed password)
     * @param {string} password The plaintext password to compare
     * @returns {Promise<boolean>}
     */
  static async verifyPassword(user, password) {
    if (!user || !user.password) {
      return false;
    }
    return bcrypt.compare(password, user.password);
  }
}

export default User;
