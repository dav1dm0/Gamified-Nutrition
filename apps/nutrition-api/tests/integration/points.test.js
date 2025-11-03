import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import dotenv from 'dotenv';
import app from '../../app.js';

// Load test env
dotenv.config({ path: './.env.test' });

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)('integration: points and progress', () => {
    let authToken;

    beforeAll(async () => {
        // Create a test user with unique timestamp
        const timestamp = Date.now();
        const payload = { username: `testuser_${timestamp}`, password: 'password123' };
        const res = await request(app).post('/api/auth/register').send(payload);

        if (res.status !== 200 && res.status !== 201) {
            console.log('Registration failed:', res.body);
            throw new Error('Failed to register test user');
        }

        authToken = res.body.token;

        // Wait a bit longer for all transactions to complete
        await new Promise(resolve => setTimeout(resolve, 500));
    });

    it('gets initial points and level', async () => {
        const res = await request(app)
            .get('/api/points')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('points', 0);
        expect(res.body).toHaveProperty('level', 1);
    });

    it('adds points when completing a meal', async () => {
        const res = await request(app)
            .post('/api/points/complete')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('points', 1);

        // Get updated points to verify
        const pointsRes = await request(app)
            .get('/api/points')
            .set('Authorization', `Bearer ${authToken}`);
        expect(pointsRes.body.points).toBe(1);
    });

    it('calculates level based on points', async () => {
        // Add points until level should increase (7 points = level 2)
        for (let i = 0; i < 6; i++) {
            await request(app)
                .post('/api/points/complete')
                .set('Authorization', `Bearer ${authToken}`);
        }

        const res = await request(app)
            .get('/api/points')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('points', 7);
        expect(res.body).toHaveProperty('level', 2);
    });
});