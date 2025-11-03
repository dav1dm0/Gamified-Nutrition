import { Pool } from 'pg';
import 'dotenv/config';

let config;

// Test environment - use explicit config
if (process.env.NODE_ENV === 'test') {
  config = {
    user: 'postgres',
    password: 'postgres',
    host: 'localhost',
    port: 5433,
    database: 'mealstore_test'
  };
}
// Production environment 
else if (process.env.NODE_ENV === 'production') {
  config = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  };
}
// Development or any other environment
else {
  config = {
    connectionString: process.env.DATABASE_URL,
    ssl: false
  };
}

const pool = new Pool(config);

export default {
  query: (text, params) => pool.query(text, params),
};