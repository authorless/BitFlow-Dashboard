import { getBitcoinPrice } from '~/server/services/binance';
import { saveBitcoinPrice } from '~/server/services/database';

export default defineEventHandler(async (event) => {
  const price = await getBitcoinPrice();
  await saveBitcoinPrice(price, new Date());
  return { price };
});
