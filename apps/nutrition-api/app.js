import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import { secureHeaders, apiLimiter } from './middleware/security.js';

import userRoutes from './routes/userRoutes.js';
import pointRoutes from './routes/pointRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import prefsRoutes from './routes/userPreferencesRoutes.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.set('trust proxy', 1);

app.use(express.json());
// Parse cookies for refresh token handling
app.use(cookieParser());
app.use(secureHeaders);
app.use(apiLimiter);


app.use('/api/auth', userRoutes);
app.use('/api/users', userRoutes); // protected routes mount will use authenticate where needed inside routes
app.use('/api/users/preferences', prefsRoutes);
app.use('/api/points', pointRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Serve client in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
}

export default app;
