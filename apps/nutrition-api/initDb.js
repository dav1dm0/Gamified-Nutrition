import db from './db.js';

const createTables = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id              SERIAL PRIMARY KEY,
      username        TEXT UNIQUE NOT NULL,
      password        TEXT NOT NULL,
      diet            TEXT DEFAULT '',
      allergies       TEXT DEFAULT '[]',
      petType         TEXT DEFAULT 'cat',
      hideLeaderboard BOOLEAN DEFAULT false,
      hidePet         BOOLEAN DEFAULT false,
      points          INTEGER DEFAULT 0,
      level           INTEGER DEFAULT 1,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  try {
    await db.query(queryText);
    console.log('✅ Database tables are ready.');
  } catch (err) {
    console.error('Error creating database tables:', err);
  }
};

createTables();