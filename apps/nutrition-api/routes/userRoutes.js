import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';
import redisClient from '../db/redis.js';

const LEADERBOARD_CACHE_KEY = 'leaderboard:top10';
import crypto from 'crypto';
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

    // Create short-lived access token and long-lived refresh token (httpOnly cookie)
    const accessToken = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
    const refreshToken = jwt.sign({ id: newUser.id }, refreshSecret, { expiresIn: '7d' });

    // Persist a hash of the refresh token server-side so we can revoke/rotate it
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const refreshExpiry = dayjs().add(7, 'day').toDate();
    await db.query(
      'UPDATE users SET refresh_token_hash = $1, refresh_token_expires_at = $2 WHERE id = $3',
      [refreshHash, refreshExpiry, newUser.id]
    );

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      id: newUser.id,
      username: newUser.username,
      token: accessToken,
      tokenExpiresAt: dayjs().add(15, 'minute').toISOString()
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

    // Issue short-lived access token and long-lived refresh token
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
    const refreshToken = jwt.sign({ id: user.id }, refreshSecret, { expiresIn: '7d' });

    // Persist refresh token hash
    const refreshHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const refreshExpiry = dayjs().add(7, 'day').toDate();
    await db.query('UPDATE users SET refresh_token_hash = $1, refresh_token_expires_at = $2 WHERE id = $3', [refreshHash, refreshExpiry, user.id]);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      id: user.id,
      username: user.username,
      token: accessToken,
      tokenExpiresAt: dayjs().add(15, 'minute').toISOString()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

/**
 * Refresh access token using httpOnly refresh token cookie
 */
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

    const refreshSecret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
    let payload;
    try {
      payload = jwt.verify(refreshToken, refreshSecret);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Validate user and stored refresh hash
    const userResult = await db.query('SELECT id, refresh_token_hash, refresh_token_expires_at FROM users WHERE id = $1', [payload.id]);
    if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    const userRow = userResult.rows[0];

    // Check stored hash matches and not expired
    const providedHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    if (!userRow.refresh_token_hash || userRow.refresh_token_hash !== providedHash) {
      return res.status(401).json({ error: 'Refresh token revoked or invalid' });
    }
    if (userRow.refresh_token_expires_at && new Date(userRow.refresh_token_expires_at) < new Date()) {
      return res.status(401).json({ error: 'Refresh token expired' });
    }

    // Rotate tokens
    const newAccessToken = jwt.sign({ id: payload.id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const newRefreshToken = jwt.sign({ id: payload.id }, refreshSecret, { expiresIn: '7d' });
    const newHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');
    const newExpiry = dayjs().add(7, 'day').toDate();

    await db.query('UPDATE users SET refresh_token_hash = $1, refresh_token_expires_at = $2 WHERE id = $3', [newHash, newExpiry, payload.id]);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ token: newAccessToken, tokenExpiresAt: dayjs().add(15, 'minute').toISOString() });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Failed to refresh token' });
  }
});

/**
 * Logout — clear refresh token cookie
 */
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  res.json({ success: true });
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
    // Invalidate leaderboard cache (non-fatal)
    try {
      await redisClient.del(LEADERBOARD_CACHE_KEY);
    } catch (cacheErr) {
      console.warn('Failed to invalidate leaderboard cache after user delete:', cacheErr);
    }

    res.json({ success: true, message: "User account deleted." });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;