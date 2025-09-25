const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        RANK() OVER (ORDER BY level DESC, points DESC) AS rank,
        username,
        level,
        points
      FROM users
      WHERE hideLeaderboard = false
      ORDER BY level DESC, points DESC
      LIMIT 10`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;