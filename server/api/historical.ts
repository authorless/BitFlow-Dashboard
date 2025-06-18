import { getHistoricalPrices } from '~/server/services/database';
import { fetchAndSaveHistoricalData } from '~/server/services/historical';
import type { IntervalType } from '~/server/services/historical';

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const startDate = new Date(Number(query.startDate));
    const endDate = new Date(Number(query.endDate));
    
    const allowedPeriods = ['day', 'week', 'month', 'year'] as const;
    const period = allowedPeriods.includes(query.period as any) 
      ? query.period as typeof allowedPeriods[number]
      : 'day';

    // Сначала получаем и сохраняем свежие данные из Binance
    await fetchAndSaveHistoricalData(startDate, endDate, period);

    // Затем получаем все данные из нашей базы за указанный период
    const prices = await getHistoricalPrices(startDate, endDate);
    return prices;
  } catch (error) {
    console.error('Error in historical API:', error);
    throw error;
  }
});
