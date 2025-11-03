import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import dotenv from 'dotenv';
import app from '../../app.js';

// Load test env
dotenv.config({ path: './.env.test' });

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)('integration: leaderboard', () => {
    let authTokens = [];

    beforeAll(async () => {
        // Create multiple test users with different points
        const timestamp = Date.now();
        for (let i = 0; i < 5; i++) {
            const username = `testuser_${timestamp}_${i}`;
            const res = await request(app)
                .post('/api/auth/register')
                .send({ username, password: 'password123' });

            authTokens.push(res.body.token);

            // Add different points to each user
            for (let j = 0; j < i; j++) {
                await request(app)
                    .post('/api/points/complete')
                    .set('Authorization', `Bearer ${res.body.token}`);

                // Add a small delay to prevent race conditions
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }

        // Add a delay after user creation to ensure all points are processed
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('returns leaderboard sorted by level and points', async () => {
        const res = await request(app).get('/api/leaderboard');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);

        // Verify sorting
        for (let i = 0; i < res.body.length - 1; i++) {
            const current = res.body[i];
            const next = res.body[i + 1];

            // Higher level should come first
            if (current.level !== next.level) {
                expect(current.level).toBeGreaterThan(next.level);
            }
            // If same level, higher points should come first
            else {
                expect(current.points).toBeGreaterThanOrEqual(next.points);
            }
        }
    });

    it('respects hideLeaderboard preference', async () => {
        // Hide one user from leaderboard
        await request(app)
            .put('/api/users/preferences')
            .set('Authorization', `Bearer ${authTokens[4]}`)
            .send({ hideLeaderboard: true });

        // Add a delay to ensure preference update is processed
        await new Promise(resolve => setTimeout(resolve, 100));

        // Get the username before fetching leaderboard
        const hiddenUser = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${authTokens[4]}`);

        const hiddenUsername = hiddenUser.body.user.username;

        // Fetch leaderboard after getting the username
        const res = await request(app).get('/api/leaderboard');

        // Verify the hidden user is not in the leaderboard
        const hiddenEntry = res.body.find(entry => entry.username === hiddenUsername);
        expect(hiddenEntry, `User ${hiddenUsername} should not be in leaderboard`).toBeUndefined();
    });
});