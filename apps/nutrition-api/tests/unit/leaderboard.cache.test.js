import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

// This test suite demonstrates how to mock redisClient for cache hit/miss tests.
// It's a scaffold: it doesn't assert against a real Redis instance.

vi.mock('../../db/redis.js', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  }
}));

vi.mock('../../db/index.js', () => ({
  query: vi.fn()
}));

import redisClient from '../../db/redis.js';
import db from '../../db/index.js';

describe('leaderboard cache (unit)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns cached leaderboard when present', async () => {
    const fake = [{ rank: '1', username: 'cached-user', level: 1, points: 10 }];
    redisClient.get.mockResolvedValue(JSON.stringify(fake));

    const res = await request(app).get('/api/leaderboard');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(fake);
    expect(redisClient.get).toHaveBeenCalled();
    // DB should not be called on cache hit
    expect(db.query).not.toHaveBeenCalled();
  });

  it('queries DB and sets cache on miss', async () => {
    redisClient.get.mockResolvedValue(null);
    const rows = [{ rank: '1', username: 'db-user', level: 2, points: 20 }];
    db.query.mockResolvedValue({ rows });

    const res = await request(app).get('/api/leaderboard');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
    expect(redisClient.set).toHaveBeenCalled();
  });
});
