-- CreateTable
CREATE TABLE "bitcoin_prices" (
    "id" SERIAL NOT NULL,
    "price" DECIMAL(20,2) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitcoin_prices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bitcoin_prices_timestamp_key" ON "bitcoin_prices"("timestamp");

-- CreateIndex
CREATE INDEX "bitcoin_prices_timestamp_idx" ON "bitcoin_prices"("timestamp");
