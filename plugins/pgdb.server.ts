import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bitcoin_prices (
        id SERIAL PRIMARY KEY,
        price DECIMAL NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_timestamp ON bitcoin_prices(timestamp);
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

let initialized = false;

export default defineNuxtPlugin(async () => {
  if (!initialized) {
    await initDb();
    initialized = true;
  }

  return {
    provide: {
      pgPool: pool
    }
  };
});
