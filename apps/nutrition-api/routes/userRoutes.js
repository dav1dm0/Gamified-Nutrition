import express from 'express';
const router = express.Router();
import db from '../db.js';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../middleware/security.js';
/**
 * Register a new user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    // Check if user exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username exists' });
    }
    // Create user
    const newUser = await User.create({ username, password });
    const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

/**
 * Log in a user.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findByUsername(username);
    const isValid = await User.verifyPassword(user, password);

    if (!user || !isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      id: user.id,
      username: user.username,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * Get current user profile (protected route).
 * @param {import('express').Request & { user: { id: string } }} req
 * @param {import('express').Response} res
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, username, petType, level, points FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    /** @type {User} */
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

/**
 * Delete a user account (protected route).
 * @param {import('express').Request & { user: { id: string } }} req
 * @param {import('express').Response} res
 */
router.delete('/delete', authenticate, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id = $1', [req.user.id]);
    res.json({ success: true, message: "User account deleted." });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;