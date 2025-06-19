import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  host: process.env.POSTGRES_HOST || 'db',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DB || 'bitcoin_metrics'
});

// Создаем таблицу при первом запуске
const initDb = async () => {
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
};

export { pool, initDb };
