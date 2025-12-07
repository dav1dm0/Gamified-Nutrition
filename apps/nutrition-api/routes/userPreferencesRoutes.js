import "@nutrition-app/types";
import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import { authenticate } from '../middleware/security.js';
import redisClient from '../db/redis.js';

const LEADERBOARD_CACHE_KEY = 'leaderboard:top10';


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
    // Validate petType if provided
    if (petType && !['cat', 'dog'].includes(petType)) {
      return res.status(400).json({ error: 'Invalid pet type' });
    }

    // Use atomic UPDATE with COALESCE to avoid read-modify-write race:
    // Only update fields that are explicitly provided (non-null/non-undefined)
    const updateResult = await db.query(
      `UPDATE users
       SET pettype = COALESCE($1, pettype),
           hideleaderboard = CASE WHEN $2::boolean IS NOT NULL THEN $2 ELSE hideleaderboard END,
           hidepet = CASE WHEN $3::boolean IS NOT NULL THEN $3 ELSE hidepet END
       WHERE id = $4
       RETURNING pettype as "petType", hideleaderboard as "hideLeaderboard", hidepet as "hidePet"`,
      [petType || null, hideLeaderboard !== undefined ? hideLeaderboard : null, hidePet !== undefined ? hidePet : null, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    /** @type {UserPreferences} */
    const updatedPreferences = updateResult.rows[0];
    
    // Always invalidate leaderboard cache on any preference update (non-fatal if Redis fails)
    try {
      await redisClient.del(LEADERBOARD_CACHE_KEY);
    } catch (cacheErr) {
      console.warn('Failed to invalidate leaderboard cache after preferences update:', cacheErr);
    }

    res.json(updatedPreferences);
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

export default router;