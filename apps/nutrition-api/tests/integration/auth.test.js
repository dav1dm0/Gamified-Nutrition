import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import dotenv from 'dotenv';
import app from '../../app.js';
import db from '../../db/index.js';

// Load test env
dotenv.config({ path: './.env.test' });

const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)('integration: auth endpoints', () => {
    let testUser;
    let authToken;

    beforeAll(async () => {
        // Create a test user
        // Clean up any test users
        try {
            await db.query("DELETE FROM users WHERE username LIKE 'testuser_%'");
        } catch (error) {
            console.error('Error cleaning up test users:', error);
        }
        const payload = { username: `testuser_${Date.now()}`, password: 'password123' };
        const res = await request(app).post('/api/auth/register').send(payload);
        testUser = res.body;
        authToken = res.body.token;
        // Wait a bit for the transaction to complete
        await new Promise(resolve => setTimeout(resolve, 100));
    });

    it('logs in a user with valid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: testUser.username, password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('username', testUser.username);
    });

    it('rejects login with invalid credentials', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ username: testUser.username, password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty('error');
    });

    it('gets user profile with valid token', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body.user).toHaveProperty('username', testUser.username);
        expect(res.body.user).toHaveProperty('level');
        expect(res.body.user).toHaveProperty('points');
    });

    it('rejects profile request without token', async () => {
        const res = await request(app).get('/api/auth/me');
        expect(res.status).toBe(401);
    });

    it('deletes user account', async () => {
        const res = await request(app)
            .delete('/api/auth/delete')
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('success', true);

        // Verify user can't login anymore
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ username: testUser.username, password: 'password123' });
        expect(loginRes.status).toBe(401);
    });
});