import "@nutrition-app/types";
import express from 'express';
const router = express.Router();
import db from '../db/index.js';
import redisClient from "../db/redis.js";
const LEADERBOARD_CACHE_KEY = 'leaderboard:top10';

/**
 * @typedef {Object} LeaderboardEntry
 * @property {string} rank
 * @property {string} username
 * @property {number} level
 * @property {number} points
 */

/**
 * Get the top 10 leaderboard
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
router.get('/', async (req, res) => {
  try {
    // 1) Try to serve from cache. If Redis errors, fall back to DB.
    let cached = null;
    try {
      cached = await redisClient.get(LEADERBOARD_CACHE_KEY);
    } catch (cacheErr) {
      console.warn('Redis read failed, falling back to DB:', cacheErr);
    }

    if (cached) {
      try {
        /** @type {LeaderboardEntry[]} */
        const parsed = JSON.parse(cached);
        return res.json(parsed);
      } catch (parseErr) {
        console.warn('Failed to parse cached leaderboard, ignoring cache:', parseErr);
      }
    }

    // 2) Not cached (or cache unusable): query DB (preserve original ordering: level DESC, points DESC)
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

    // 3) Cache the result with a TTL (configurable via env var)
    const ttlSeconds = Number(process.env.LEADERBOARD_CACHE_TTL_SECONDS || 300);
    try {
      await redisClient.set(LEADERBOARD_CACHE_KEY, JSON.stringify(leaderboard), 'EX', ttlSeconds);
    } catch (cacheErr) {
      console.warn('Redis set failed (non-fatal):', cacheErr);
    }

    return res.json(leaderboard);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;