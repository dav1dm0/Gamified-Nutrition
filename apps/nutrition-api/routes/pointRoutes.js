import "@nutrition-app/types";
import express from 'express';
const router = express.Router();
import db from '../db.js';
import { authenticate } from '../middleware/security.js';

/**
 * Update points and level
 * @param {import('express').Request & { user: { id: string } }} req
 * @param {import('express').Response} res
 */
router.post('/complete', authenticate, async (req, res) => {
  try {
    const { id: userId } = req.user;
    // Add points and recalculate level
    const result = await db.query(
      `UPDATE users
       SET points = points + 1,
           level = FLOOR((points + 1) / 7) + 1
       WHERE id = $1
       RETURNING points, level`,
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    /** @type {PointsAndLevel} */
    const newStats = result.rows[0];
    return res.json(newStats);
  } catch (err) {
    console.error('Error completing meal:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Get current points and level
 * @param {import('express').Request & { user: { id: string } }} req
 * @param {import('express').Response} res
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const result = await db.query(
      'SELECT points, level FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    /** @type {PointsAndLevel} */
    const stats = result.rows[0];
    return res.json(stats);
  } catch (err) {
    console.error('Error fetching points:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

export default router;