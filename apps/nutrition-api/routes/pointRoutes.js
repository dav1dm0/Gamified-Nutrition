const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/security');

// Update points and level
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
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error completing meal:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});


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
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching points:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;