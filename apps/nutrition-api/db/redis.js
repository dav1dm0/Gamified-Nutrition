import Redis from 'ioredis';
import 'dotenv/config';

const redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT || 6379,
    lazyConnect: true, // Don't connect until a command is used
});

redisClient.on('connect', () => {
    console.log('✅ Connected to Redis.');
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

export default redisClient;