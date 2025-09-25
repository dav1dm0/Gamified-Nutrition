const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/security');

// GET current user's preferences
router.get('/', authenticate, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const result = await db.query(
      'SELECT petType, hideLeaderboard, hidePet FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching preferences:', err);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

// UPDATE user's preferences (handles petType, hideLeaderboard, and hidePet)
router.put('/', authenticate, async (req, res) => {
  const { id: userId } = req.user;
  const { petType, hideLeaderboard, hidePet } = req.body;

  try {
    // Fetch current user data
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const currentUser = userResult.rows[0];

    // Prepare new values, using existing values as fallback
    const newPetType = petType || currentUser.pettype;
    const newHideLeaderboard = typeof hideLeaderboard === 'boolean' ? hideLeaderboard : currentUser.hideleaderboard;
    const newHidePet = typeof hidePet === 'boolean' ? hidePet : currentUser.hidepet;

    if (!['cat', 'dog'].includes(newPetType)) {
      return res.status(400).json({ error: 'Invalid pet type' });
    }

    const updateResult = await db.query(
      `UPDATE users
       SET petType = $1, hideLeaderboard = $2, hidePet = $3
       WHERE id = $4
       RETURNING petType, hideLeaderboard, hidePet`,
      [newPetType, newHideLeaderboard, newHidePet, userId]
    );

    res.json(updateResult.rows[0]);
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

module.exports = router;