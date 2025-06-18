import { getBitcoinPrice, getHistoricalData } from '~/server/services/binance';
import { saveBitcoinPrice, getHistoricalPrices } from '~/server/services/database';

export default defineEventHandler(async (event) => {
  const price = await getBitcoinPrice();
  await saveBitcoinPrice(price);
  return { price };
});
