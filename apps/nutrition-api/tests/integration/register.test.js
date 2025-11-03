import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import dotenv from 'dotenv';
import app from '../../app.js';
import db from '../../db/index.js';

// Load test env explicitly
dotenv.config({ path: './.env.test' });

// Skip this integration test if no DATABASE_URL is provided
const hasDb = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDb)('integration: register', () => {
    beforeAll(async () => {
        // Clean up any test users
        try {
            await db.query("DELETE FROM users WHERE username LIKE 'testuser_%'");
        } catch (error) {
            console.error('Error cleaning up test users:', error);
        }
    });

    it('registers a user (requires test DB)', async () => {
        const payload = { username: `testuser_${Date.now()}`, password: 'password123' };
        const res = await request(app).post('/api/auth/register').send(payload);
        expect([200, 201]).toContain(res.status);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('username', payload.username);
        expect(res.body).toHaveProperty('token');
    });
});
