import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import dotenv from 'dotenv';
import app from '../../app.js';
import db from '../../db/index.js';

// Load test env
dotenv.config({ path: './.env.test' });

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)('integration: user preferences', () => {
    let authToken;

    beforeAll(async () => {
        // Create a test user
        const payload = { username: `testuser_${Date.now()}`, password: 'password123' };
        const res = await request(app).post('/api/auth/register').send(payload);
        authToken = res.body.token;
        // Wait a bit for the transaction to complete
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('gets default user preferences', async () => {
        const res = await request(app)
            .get('/api/users/preferences')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('petType', 'cat');
        expect(res.body).toHaveProperty('hideLeaderboard', false);
        expect(res.body).toHaveProperty('hidePet', false);
    });

    it('updates user preferences', async () => {
        const updates = {
            petType: 'dog',
            hideLeaderboard: true,
            hidePet: true
        };

        const res = await request(app)
            .put('/api/users/preferences')
            .set('Authorization', `Bearer ${authToken}`)
            .send(updates);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('petType', 'dog');
        expect(res.body).toHaveProperty('hideLeaderboard', true);
        expect(res.body).toHaveProperty('hidePet', true);

        // Verify changes persisted
        const getRes = await request(app)
            .get('/api/users/preferences')
            .set('Authorization', `Bearer ${authToken}`);
        expect(getRes.body).toEqual(res.body);
    });

    it('validates pet type', async () => {
        const res = await request(app)
            .put('/api/users/preferences')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ petType: 'dragon' });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('error');
    });

    it('handles partial updates', async () => {
        const res = await request(app)
            .put('/api/users/preferences')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ hideLeaderboard: false });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('hideLeaderboard', false);
        // Other preferences should remain unchanged
        expect(res.body).toHaveProperty('petType', 'dog');
        expect(res.body).toHaveProperty('hidePet', true);
    });
});

// Clean up any test users created during these tests
afterAll(async () => {
    try {
        await db.query("DELETE FROM users WHERE username LIKE 'testuser_%'");
    } catch (error) {
        console.error('Error cleaning up test users:', error);
    }
});