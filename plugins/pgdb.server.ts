import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'bitcoin_db',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres'
});

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS bitcoin_prices (
        id SERIAL PRIMARY KEY,
        price DECIMAL(20, 2) NOT NULL,
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_timestamp ON bitcoin_prices(timestamp);
      CREATE UNIQUE INDEX IF NOT EXISTS idx_bitcoin_prices_timestamp_unique ON bitcoin_prices (timestamp);
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
