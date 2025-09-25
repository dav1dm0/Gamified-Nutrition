require('dotenv').config();
const express = require('express');
const app = express();

const cors = require('cors');
const path = require('path');

const { secureHeaders, apiLimiter } = require('./middleware/security');
const { authenticate } = require('./middleware/security');

const userRoutes = require('./routes/userRoutes');
const prefsRoutes = require('./routes/userPreferencesRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const gamificationRoutes = require('./routes/pointRoutes');

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));

app.set('trust proxy', 1);

app.use(express.json());
app.use(secureHeaders);
app.use(apiLimiter);

app.use('/api/auth', userRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/users/preferences', authenticate, prefsRoutes);
app.use('/api/points', authenticate, gamificationRoutes);
app.use('/api/leaderboard', authenticate, leaderboardRoutes);




if (process.env.NODE_ENV === 'production') {
  // Serve static files from React build
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle client-side routing
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});