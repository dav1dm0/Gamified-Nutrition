import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { secureHeaders, apiLimiter, readLimiter, writeLimiter, authenticate } from './middleware/security.js';

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
app.use(cookieParser());
app.use(secureHeaders);
app.use(readLimiter);
app.use(writeLimiter);

app.use('/api/auth', userRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/users/preferences', authenticate, prefsRoutes);
app.use('/api/points', authenticate, pointRoutes);
app.use('/api/leaderboard', leaderboardRoutes);




if (process.env.NODE_ENV === 'production') {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, 'build')));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
  });
}
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});