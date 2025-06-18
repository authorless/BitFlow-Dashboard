-- CreateTable
CREATE TABLE "BitcoinPrice" (
    "id" SERIAL NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BitcoinPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BitcoinPrice_timestamp_idx" ON "BitcoinPrice"("timestamp");
