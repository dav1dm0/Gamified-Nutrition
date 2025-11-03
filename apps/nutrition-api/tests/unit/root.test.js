import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app.js';

describe('root', () => {
    it('returns OK', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.text).toBe('OK');
    });
});
