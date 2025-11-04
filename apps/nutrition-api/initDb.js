import db from './db/index.js';

const createTables = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS users (
      id              SERIAL PRIMARY KEY,
      username        TEXT UNIQUE NOT NULL,
      password        TEXT NOT NULL,
      refresh_token_hash TEXT,
      refresh_token_expires_at TIMESTAMPTZ,
      diet            TEXT DEFAULT '',
      allergies       TEXT DEFAULT '[]',
      petType         TEXT DEFAULT 'cat',
      hideLeaderboard BOOLEAN DEFAULT false,
      hidePet         BOOLEAN DEFAULT false,
      refresh_token_hash TEXT DEFAULT NULL,
      refresh_token_expires_at TIMESTAMPTZ DEFAULT NULL,
      points          INTEGER DEFAULT 0,
      level           INTEGER DEFAULT 1,
      created_at      TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  try {
    await db.query(queryText);
    // Ensure new columns exist when upgrading an existing DB
    await db.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token_hash TEXT DEFAULT NULL;");
    await db.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS refresh_token_expires_at TIMESTAMPTZ DEFAULT NULL;");
    console.log('✅ Database tables are ready.');
  } catch (err) {
    console.error('Error creating database tables:', err);
  }
};

createTables();