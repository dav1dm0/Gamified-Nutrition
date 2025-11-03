import "@nutrition-app/types";
import express from 'express';
const router = express.Router();
import db from '../db/index.js';

/**
 * Get the top 10 leaderboard
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        RANK() OVER (ORDER BY level DESC, points DESC) AS rank,
        username,
        level,
        points
      FROM users
      WHERE hideleaderboard = false
      ORDER BY level DESC, points DESC
      LIMIT 10`
    );
    /** @type {LeaderboardEntry[]} */
    const leaderboard = result.rows;
    res.json(leaderboard);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;