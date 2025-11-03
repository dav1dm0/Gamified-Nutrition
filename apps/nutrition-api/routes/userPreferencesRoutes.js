import "@nutrition-app/types";
import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { authenticate } from '../middleware/security.js';


/**
 * GET current user's preferences
 * @param {import('express').Request & { user: { id: string } }} req
 * @param {import('express').Response} res
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { id: userId } = req.user;
    const result = await db.query(
      'SELECT pettype as "petType", hideleaderboard as "hideLeaderboard", hidepet as "hidePet" FROM users WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    /** @type {UserPreferences} */
    const preferences = result.rows[0];
    res.json(preferences);
  } catch (err) {
    console.error('Error fetching preferences:', err);
    res.status(500).json({ error: 'Failed to fetch preferences' });
  }
});

/**
 * UPDATE user's preferences
 * @param {import('express').Request & { user: { id: string } }} req
 * @param {import('express').Response} res
 */
router.put('/', authenticate, async (req, res) => {
  const { id: userId } = req.user;

  /** @type {Partial<UserPreferences>} */
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

    if (newPetType && !['cat', 'dog'].includes(newPetType)) {
      return res.status(400).json({ error: 'Invalid pet type' });
    }

    const updateResult = await db.query(
      `UPDATE users
       SET pettype = $1, hideleaderboard = $2, hidepet = $3
       WHERE id = $4
       RETURNING pettype as "petType", hideleaderboard as "hideLeaderboard", hidepet as "hidePet"`,
      [newPetType, newHideLeaderboard, newHidePet, userId]
    );

    /** @type {UserPreferences} */
    const updatedPreferences = updateResult.rows[0];
    res.json(updatedPreferences);
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default router;