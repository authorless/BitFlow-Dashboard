CREATE TABLE IF NOT EXISTS bitcoin_prices (
    id SERIAL PRIMARY KEY,
    price DECIMAL(20, 2) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создаем индекс для ускорения запросов по временному диапазону
CREATE INDEX IF NOT EXISTS idx_bitcoin_prices_timestamp ON bitcoin_prices (timestamp);

-- Создаем уникальный индекс для предотвращения дубликатов по timestamp
CREATE UNIQUE INDEX IF NOT EXISTS idx_bitcoin_prices_timestamp_unique ON bitcoin_prices (timestamp);
